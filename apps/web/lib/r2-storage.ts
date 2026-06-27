import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let r2Client: S3Client | null = null;

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 credentials. Expected CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY."
    );
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2Client;
}

function getPublicUrl(key: string) {
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!publicBaseUrl) {
    throw new Error(
      "Missing CLOUDFLARE_R2_PUBLIC_URL. Set it to the public bucket/custom-domain base URL for uploaded assets."
    );
  }

  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

export async function uploadToR2(
  data: Buffer,
  key: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error(
      "Missing CLOUDFLARE_R2_BUCKET_NAME. Set it to the target Cloudflare R2 bucket name."
    );
  }

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}
