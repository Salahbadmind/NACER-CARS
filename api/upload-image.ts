import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: "No image content provided" });
    }

    // If already an HTTP/HTTPS URL or relative file, return it as-is
    if (
      typeof image === 'string' &&
      (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/') || image.startsWith('/api/r2-assets/'))
    ) {
      return res.status(200).json({ url: image });
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
      console.log(`[Vercel Serverless] Uploading ${filename} directly to Cloudflare R2 bucket: ${bucketName}...`);
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

      console.log(`[Vercel Serverless] Cloudflare R2 Upload Successful: ${finalUrl}`);
      return res.status(200).json({ url: finalUrl, storage: "cloudflare_r2" });
    } else {
      console.error("[Vercel Serverless] Cloudflare R2 is not configured. Missing environment variables.");
      return res.status(400).json({ 
        error: "Cloudflare R2 is not configured on Vercel. Please add the CLOUDFLARE_ env variables in Vercel settings." 
      });
    }
  } catch (error: any) {
    console.error("Error in upload-image API on Vercel:", error);
    return res.status(500).json({ error: error?.message || "Failed to process image upload" });
  }
}
