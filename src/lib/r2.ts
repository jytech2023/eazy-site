import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getBucket() {
  return process.env.R2_BUCKET || "easysite-files";
}

function getMimeType(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf("."));
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Upload all site files to R2.
 * Files stored as: {slug}/{filename}
 */
export async function uploadSiteToR2(
  slug: string,
  files: Record<string, string>
): Promise<void> {
  const client = getR2Client();
  const bucket = getBucket();

  const uploads = Object.entries(files).map(([filename, content]) =>
    client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${slug}/${filename}`,
        Body: content,
        ContentType: getMimeType(filename),
      })
    )
  );

  await Promise.all(uploads);
}

/**
 * Get a single file from R2.
 */
export async function getFileFromR2(
  slug: string,
  filename: string
): Promise<{ content: string; contentType: string } | null> {
  const client = getR2Client();
  const bucket = getBucket();

  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: `${slug}/${filename}`,
      })
    );

    const content = await res.Body?.transformToString("utf-8");
    if (!content) return null;

    return {
      content,
      contentType: res.ContentType || getMimeType(filename),
    };
  } catch {
    return null;
  }
}

/**
 * Get all files for a site from R2.
 */
export async function getSiteFilesFromR2(
  slug: string
): Promise<Record<string, string> | null> {
  const client = getR2Client();
  const bucket = getBucket();

  try {
    // List all objects with this slug prefix
    const listRes = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${slug}/`,
      })
    );

    if (!listRes.Contents || listRes.Contents.length === 0) return null;

    const files: Record<string, string> = {};

    for (const obj of listRes.Contents) {
      if (!obj.Key) continue;
      const filename = obj.Key.replace(`${slug}/`, "");
      if (!filename) continue;

      const getRes = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: obj.Key })
      );
      const content = await getRes.Body?.transformToString("utf-8");
      if (content) files[filename] = content;
    }

    return Object.keys(files).length > 0 ? files : null;
  } catch {
    return null;
  }
}

/**
 * Delete all files for a site from R2.
 */
export async function deleteSiteFromR2(slug: string): Promise<void> {
  const client = getR2Client();
  const bucket = getBucket();

  const listRes = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${slug}/`,
    })
  );

  if (!listRes.Contents || listRes.Contents.length === 0) return;

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: listRes.Contents.map((obj) => ({ Key: obj.Key })),
      },
    })
  );
}

/**
 * Check if R2 is configured.
 */
export function isR2Configured(): boolean {
  return !!(
    process.env.CF_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}
