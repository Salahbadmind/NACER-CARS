export default async function handler(req: any, res: any) {
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
        console.warn("Could not follow redirect in map URL resolver on Vercel:", err);
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
      return res.status(200).json({
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
      return res.status(200).json({
        success: true,
        placeName: foundPlaceName,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(foundPlaceName)}&hl=ar&z=16&output=embed`,
        directMapsUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foundPlaceName)}`,
        originalUrl: cleanUrl,
        resolvedUrl
      });
    }

    // Fallback: embed using raw input string
    return res.status(200).json({
      success: true,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(cleanUrl)}&hl=ar&z=15&output=embed`,
      directMapsUrl: cleanUrl.startsWith('http') ? cleanUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanUrl)}`,
      originalUrl: cleanUrl,
      resolvedUrl
    });

  } catch (error: any) {
    console.error("Resolve Map URL Error on Vercel:", error);
    return res.status(500).json({ error: error?.message || "Failed to resolve map URL" });
  }
}
