import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
    const { urls } = req.body || {};
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
          console.log(`[Vercel R2] Deleting object ${key} from bucket ${bucketName}...`);
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
          });
          await client.send(command);
          results.push({ url, key, deleted: true, storage: "r2" });
        } catch (err: any) {
          console.error(`[Vercel R2] Failed to delete key ${key} from R2:`, err);
          results.push({ url, key, deleted: false, error: err.message, storage: "r2" });
        }
      } else {
        results.push({ url, deleted: false, error: "Not a configured R2 asset key" });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    console.error("Error in delete-assets API on Vercel:", error);
    return res.status(500).json({ error: error?.message || "Failed to process asset deletion" });
  }
}
