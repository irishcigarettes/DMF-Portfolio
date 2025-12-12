import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";

type R2Config = {
  s3Client: S3Client;
  bucketName: string;
  publicUrl: string;
};

let r2Config: R2Config | null = null;

function getR2Config(): R2Config {
  const endpoint = process.env.R2_S3_API_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!endpoint) throw new Error("R2_S3_API_URL environment variable is not set");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID environment variable is not set");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY environment variable is not set");
  if (!bucketName) throw new Error("R2_BUCKET_NAME environment variable is not set");
  if (!publicUrl) throw new Error("R2_PUBLIC_URL environment variable is not set");

  if (!r2Config) {
    r2Config = {
      s3Client: new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }),
      bucketName,
      publicUrl,
    };
  }

  return r2Config;
}

function getExtensionFromContentType(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
  };

  return extensions[contentType] || ".jpg";
}

/**
 * Uploads an image buffer directly to R2 storage
 * Returns the public R2 URL
 */
export async function uploadBufferToR2(
  buffer: ArrayBuffer | Buffer,
  contentType: string,
): Promise<string> {
  try {
    const { s3Client, bucketName, publicUrl } = getR2Config();

    // Convert to Buffer if needed
    const bufferData = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    // Generate a unique filename based on content hash
    const hash = crypto.createHash("sha256").update(bufferData).digest("hex");
    const extension = getExtensionFromContentType(contentType);
    const filename = `notion-images/${hash}${extension}`;

    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: bufferData,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable", // Cache for 1 year
      }),
    );

    const r2Url = `${publicUrl}/${filename}`;

    console.log(`Uploaded image to R2: ${filename}`);

    return r2Url;
  } catch (error) {
    console.error("Error uploading buffer to R2:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
