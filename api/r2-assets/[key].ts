import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
  try {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      return res.status(400).send("Missing asset key");
    }

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
      // transformToByteArray is a robust method supported natively in modern Node.js environments
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);
      return res.status(200).send(buffer);
    } else {
      return res.status(404).send("Not found");
    }
  } catch (error: any) {
    console.error("Error reading from Cloudflare R2 on Vercel:", error);
    return res.status(500).send("Error fetching asset from R2");
  }
}
