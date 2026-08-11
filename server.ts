import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// System instruction generator for KADEX DZ Showroom
function getShowroomSystemInstruction(carsContext?: string, lang: string = 'ar') {
  return `أنت المساعد الذكي لمعرض "كادكس الجزائر - KADEX DZ"، المتخصص في استيراد أحدث السيارات الصينية الفاخرة والاقتصادية (مثل Geely, Chery, BYD, Jetour, Changan, DFSK, Great Wall Motors, Exeed) من الصين إلى جميع ولايات الجزائر.

مهامك ورسالتك:
1. إجابة استفسارات الزبائن الجزائريين باللغات التالية حسب رغبتهم: العربية (أو الدارجة الجزائرية المحترمة)، الفرنسية، أو الإنجليزية.
2. توضيح معطيات السيارات المتوفرة تسليم فوري في الجزائر، والسيارات الجاهزة للشحن من الموانئ الصينية (مع مدة الشحن التقريبية 30-45 يوماً).
3. تقديم معلومات قانونية وعامة مبسطة حول الاستيراد، التخليص الجمركي (Dédouanement)، إجراءات البطاقة الصفراء والرمادية، ورخص المجاهدين.
4. الإجابة بلباقة وإيجاز (خلال 2-4 جمل) وتوجيه العميل دائماً للاتصال برقم الهاتف أو الواتساب المباشر للمعرض لإتمام الحجز والطلبيات.

المخزون الحالي المتوفر بالمعرض:
${carsContext || 'يتوفر لدينا تشكيلة واسعة من سيارات شيري، جيلي، جيتور، بي واي دي، وشانجان.'}

معلومات الاتصال بالمعرض:
- الهاتف الأول: +213 550 12 34 56
- الهاتف الثاني: +213 770 98 76 54
- الواتساب: +213 550 12 34 56
- العنوان: حي البساتين، الشراقة، الجزائر العاصمة`;
}

// Supabase credentials route to expose runtime platform secrets to the frontend safely
app.get("/api/supabase-credentials", (req, res) => {
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  // Check for joined keys or malformed combinations in all environment variables
  for (const key of Object.keys(process.env)) {
    const val = (process.env[key] || "").trim();
    
    // Case 1: Key itself is VITE_SUPABASE_ANON_KEYVITE_SUPABASE_URL or similar combined key
    if (key.includes("SUPABASE_ANON_KEY") && key.includes("SUPABASE_URL")) {
      const parts = val.split(/VITE_SUPABASE_URL=|SUPABASE_URL=/i);
      if (parts.length >= 2) {
        anonKey = parts[0].trim();
        url = parts[1].trim();
        break;
      }
    }
    
    // Case 2: The value contains both a URL pattern and a JWT pattern in a single variable
    if (val.includes("https://") && val.includes("eyJ")) {
      const urlMatch = val.match(/https:\/\/[a-z0-9-.]+\.supabase\.(co|net)/i);
      if (urlMatch) {
        url = urlMatch[0];
      }
      const jwtMatch = val.match(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/);
      if (jwtMatch) {
        anonKey = jwtMatch[0];
      }
      break;
    }
  }

  res.json({
    url: url.trim(),
    anonKey: anonKey.trim()
  });
});

// Lazy getter for Cloudflare R2 Client
let r2Client: S3Client | null = null;
function getR2Client(): S3Client | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region: "auto"
    });
  }
  return r2Client;
}

// Endpoint to proxy get requests from R2 bucket if no custom domain is set
app.get("/api/r2-assets/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const client = getR2Client();
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!client || !bucketName) {
      return res.status(404).json({ error: "R2 client not configured or disabled" });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const response = await client.send(command);
    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }
    if (response.Body) {
      const stream = response.Body as any;
      stream.pipe(res);
    } else {
      res.status(404).send("Not found");
    }
  } catch (error: any) {
    console.error("Error reading from Cloudflare R2:", error);
    res.status(500).send("Error fetching asset from R2");
  }
});

// Cloudflare R2 & Local fallback Image Upload Route
app.post("/api/upload-image", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image content provided" });
    }

    // If already an HTTP/HTTPS URL or relative file, return it as-is
    if (
      typeof image === 'string' &&
      (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/') || image.startsWith('/api/r2-assets/'))
    ) {
      return res.json({ url: image });
    }

    // Match data-URI structure
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid data URI format" });
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine extension
    let extension = "jpg";
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("gif")) extension = "gif";
    else if (contentType.includes("pdf")) extension = "pdf";
    else if (contentType.includes("doc")) extension = "docx";

    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const client = getR2Client();
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (client && bucketName) {
      // Cloudflare R2 is configured - Upload to R2!
      console.log(`Uploading ${filename} directly to Cloudflare R2 bucket: ${bucketName}...`);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: contentType
      });

      await client.send(command);

      // Determine return URL
      const customDomain = process.env.CLOUDFLARE_R2_PUBLIC_CUSTOM_DOMAIN;
      let finalUrl = "";
      if (customDomain) {
        const cleanDomain = customDomain.replace(/\/+$/, "").replace(/^https?:\/\//, "");
        finalUrl = `https://${cleanDomain}/${filename}`;
      } else {
        finalUrl = `/api/r2-assets/${filename}`;
      }

      console.log(`Cloudflare R2 Upload Successful: ${finalUrl}`);
      return res.json({ url: finalUrl, storage: "cloudflare_r2" });
    } else {
      // Cloudflare R2 is NOT configured - Fall back to saving locally on disk
      console.log(`Cloudflare R2 credentials not configured. Falling back to local disk storage for: ${filename}`);
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const finalUrl = `/uploads/${filename}`;
      return res.json({ url: finalUrl, storage: "local_disk" });
    }
  } catch (error: any) {
    console.error("Error in /api/upload-image:", error);
    return res.status(500).json({ error: error?.message || "Failed to process image upload" });
  }
});

// Cloudflare R2 & Local fallback Asset Deletion Route
app.post("/api/delete-assets", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: "No URLs provided or invalid format" });
    }

    const client = getR2Client();
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    const results: any[] = [];

    // Helper to extract key
    const extractR2Key = (url: string): string | null => {
      if (!url || typeof url !== 'string') return null;
      let decoded = url;
      try {
        decoded = decodeURIComponent(url);
      } catch (e) {}

      if (decoded.includes('/api/r2-assets/')) {
        const parts = decoded.split('/api/r2-assets/');
        return parts[parts.length - 1].trim();
      }

      if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
        try {
          const parsedUrl = new URL(decoded);
          const pathname = parsedUrl.pathname;
          if (pathname && pathname.length > 1) {
            if (!pathname.startsWith('/uploads/') && !pathname.startsWith('/assets/')) {
              return pathname.substring(1);
            }
          }
        } catch (e) {
          const parts = decoded.split('/');
          const last = parts[parts.length - 1];
          if (last && (last.startsWith('img_') || last.startsWith('file_'))) {
            return last;
          }
        }
      }
      return null;
    };

    for (const url of urls) {
      if (!url || typeof url !== 'string') continue;

      const key = extractR2Key(url);

      if (client && bucketName && key) {
        try {
          console.log(`[R2] Deleting object ${key} from bucket ${bucketName}...`);
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
          });
          await client.send(command);
          results.push({ url, key, deleted: true, storage: "r2" });
        } catch (err: any) {
          console.error(`[R2] Failed to delete key ${key} from R2:`, err);
          results.push({ url, key, deleted: false, error: err.message, storage: "r2" });
        }
      } else if (url.startsWith('/uploads/')) {
        try {
          const filename = url.replace('/uploads/', '');
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[Local] Deleted file ${filePath}`);
            results.push({ url, deleted: true, storage: "local_disk" });
          } else {
            results.push({ url, deleted: false, error: "File not found", storage: "local_disk" });
          }
        } catch (err: any) {
          console.error(`[Local] Failed to delete file ${url}:`, err);
          results.push({ url, deleted: false, error: err.message, storage: "local_disk" });
        }
      } else {
        results.push({ url, deleted: false, error: "Not an R2 or local uploads file" });
      }
    }

    return res.json({ success: true, results });
  } catch (error: any) {
    console.error("Error in /api/delete-assets:", error);
    return res.status(500).json({ error: error?.message || "Failed to delete assets" });
  }
});

// Gemini AI Chat API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { history, message, carsContext, language } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "مفتاح API غير متوفر في الخادم.",
        reply: "عذراً، الخادم غير متصل بمفتاح الخدمة حالياً. يمكنك الاتصال بـ KADEX DZ مباشرة عبر الهاتف أو الواتساب."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: getShowroomSystemInstruction(carsContext, language),
      },
      history: Array.isArray(history) 
        ? history.map((h: { role: string; text: string }) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          }))
        : []
    });

    const result = await chat.sendMessage({ message: message || "مرحباً" });
    const replyText = result.text || "مرحباً بك في معرض KADEX DZ! كيف يمكننا مساعدتك اليوم؟";

    return res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء معالجة الطلب.",
      reply: "أهلاً بك في معرض KADEX DZ! نسعد بخدمتك. للحصول على أسرع استجابة، يمكنك التواصل معنا مباشرة عبر الهاتف +213 550 12 34 56 أو الواتساب."
    });
  }
});

// Map URL Resolver API Route (Expands shortened links & extracts exact GPS coordinates)
app.all("/api/resolve-map-url", async (req, res) => {
  try {
    const rawUrl = (req.method === 'POST' ? req.body?.url : req.query?.url) || '';
    const cleanUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';

    if (!cleanUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    let resolvedUrl = cleanUrl;
    let foundLat: number | null = null;
    let foundLng: number | null = null;
    let foundPlaceName: string | null = null;

    // Helper regex checks on a string with deep unescaping
    const extractFromText = (rawTxt: string) => {
      let txt = rawTxt;
      for (let i = 0; i < 3; i++) {
        try {
          const decoded = decodeURIComponent(txt);
          if (decoded === txt) break;
          txt = decoded;
        } catch {
          break;
        }
      }

      // Protobuf !3d<lat>!4d<lng> or !3d<lat>&4d<lng>
      const proto = txt.match(/!3d(-?\d{1,2}(?:\.\d+)?)[!&]4d(-?\d{1,3}(?:\.\d+)?)/i);
      if (proto) return { lat: parseFloat(proto[1]), lng: parseFloat(proto[2]) };

      // Protobuf !2d<lng>!3d<lat>
      const proto2 = txt.match(/!2d(-?\d{1,3}(?:\.\d+)?)[!&]3d(-?\d{1,2}(?:\.\d+)?)/i);
      if (proto2) return { lat: parseFloat(proto2[2]), lng: parseFloat(proto2[1]) };

      // @<lat>,<lng>
      const at = txt.match(/@(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/i);
      if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };

      // query params q=lat,lng or ll=lat,lng or center=lat,lng or query=lat,lng or loc:lat+lng
      const query = txt.match(/[?&;](?:q|ll|query|loc|center|destination|daddr|sll)=(?:loc:)?(-?\d{1,2}(?:\.\d+)?)[,\s+]+(-?\d{1,3}(?:\.\d+)?)/i);
      if (query) return { lat: parseFloat(query[1]), lng: parseFloat(query[2]) };

      // Path coordinates /place/.../36.935,7.868 or /dir/.../36.935,7.868
      const pathCoords = txt.match(/\/(?:place|dir|search)\/[^/]*?\/(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/i);
      if (pathCoords) return { lat: parseFloat(pathCoords[1]), lng: parseFloat(pathCoords[2]) };

      // Raw decimal coords
      const direct = txt.match(/^\s*(-?\d{1,2}(?:\.\d+)?)[,\s;]+(-?\d{1,3}(?:\.\d+)?)\s*$/);
      if (direct) {
        const lat = parseFloat(direct[1]);
        const lng = parseFloat(direct[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
      return null;
    };

    // 1. Direct check on input string
    const directCoords = extractFromText(cleanUrl);
    if (directCoords) {
      foundLat = directCoords.lat;
      foundLng = directCoords.lng;
    }

    // 2. If it is an HTTP/HTTPS URL, follow redirects and check headers / HTML
    if (!foundLat && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      try {
        const response = await fetch(cleanUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'ar,fr,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        resolvedUrl = response.url || cleanUrl;

        // Check if final redirected URL has coordinates
        let resolvedCoords = extractFromText(resolvedUrl);
        if (resolvedCoords) {
          foundLat = resolvedCoords.lat;
          foundLng = resolvedCoords.lng;
        }

        // If URL contains encoded continue= or url= or destination= parameter (e.g. from Google Consent)
        if (!foundLat) {
          const continueParam = resolvedUrl.match(/[?&](?:continue|url|destination|target)=([^&]+)/i);
          if (continueParam && continueParam[1]) {
            try {
              const decodedContinue = decodeURIComponent(continueParam[1]);
              const continueCoords = extractFromText(decodedContinue);
              if (continueCoords) {
                foundLat = continueCoords.lat;
                foundLng = continueCoords.lng;
                resolvedUrl = decodedContinue;
              }
            } catch {}
          }
        }

        // If still not found, check the HTML content
        if (!foundLat) {
          const html = await response.text().catch(() => '');
          if (html) {
            // Check meta refresh URL: <meta http-equiv="refresh" content="0;url=...">
            const refreshMatch = html.match(/content=["']\d+;\s*url=([^"']+)["']/i);
            if (refreshMatch && refreshMatch[1]) {
              const refreshUrl = refreshMatch[1].replace(/&amp;/g, '&');
              const refreshCoords = extractFromText(refreshUrl);
              if (refreshCoords) {
                foundLat = refreshCoords.lat;
                foundLng = refreshCoords.lng;
                resolvedUrl = refreshUrl;
              }
            }

            // Check og:image or center=lat,lng
            if (!foundLat) {
              const ogImageMatch = html.match(/center=(-?\d{1,2}\.\d+)%2C(-?\d{1,3}\.\d+)/i) ||
                                   html.match(/center=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/i) ||
                                   html.match(/ll=(-?\d{1,2}\.\d+)[,%2C](-?\d{1,3}\.\d+)/i);
              if (ogImageMatch) {
                foundLat = parseFloat(ogImageMatch[1]);
                foundLng = parseFloat(ogImageMatch[2]);
              }
            }

            if (!foundLat) {
              // Check APP_INITIALIZATION_STATE or raw coordinates in JS state
              const coordInHtml = html.match(/\[null,null,(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)\]/) ||
                                  html.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) ||
                                  html.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/) ||
                                  html.match(/!2d(-?\d{1,3}\.\d+)!3d(-?\d{1,2}\.\d+)/) ||
                                  html.match(/center=(-?\d{1,2}\.\d+)%2C(-?\d{1,3}\.\d+)/);
              if (coordInHtml) {
                foundLat = parseFloat(coordInHtml[1]);
                foundLng = parseFloat(coordInHtml[2]);
              }
            }

            // Check title tag for place name if not found
            if (!foundPlaceName) {
              const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
              if (titleMatch && titleMatch[1] && !titleMatch[1].includes('Google Maps') && !titleMatch[1].includes('Before you continue')) {
                foundPlaceName = titleMatch[1].replace(' - Google Maps', '').trim();
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not follow redirect in /api/resolve-map-url:", err);
      }
    }

    // Check for place name in URL
    if (resolvedUrl.includes('/place/')) {
      const placeMatch = resolvedUrl.match(/\/place\/([^/@?]+)/);
      if (placeMatch && placeMatch[1]) {
        foundPlaceName = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
      }
    }

    if (foundLat && foundLng) {
      return res.json({
        success: true,
        lat: foundLat,
        lng: foundLng,
        placeName: foundPlaceName,
        embedUrl: `https://maps.google.com/maps?q=${foundLat},${foundLng}&hl=ar&z=16&output=embed`,
        directMapsUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://www.google.com/maps?q=${foundLat},${foundLng}`,
        originalUrl: cleanUrl,
        resolvedUrl
      });
    }

    if (foundPlaceName) {
      return res.json({
        success: true,
        placeName: foundPlaceName,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(foundPlaceName)}&hl=ar&z=16&output=embed`,
        directMapsUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foundPlaceName)}`,
        originalUrl: cleanUrl,
        resolvedUrl
      });
    }

    // Fallback: embed using raw input string
    return res.json({
      success: true,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(cleanUrl)}&hl=ar&z=15&output=embed`,
      directMapsUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanUrl)}`,
      originalUrl: cleanUrl,
      resolvedUrl
    });

  } catch (error: any) {
    console.error("Resolve Map URL Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to resolve map URL" });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KADEX DZ Server running on http://localhost:${PORT}`);
  });
}

startServer();
