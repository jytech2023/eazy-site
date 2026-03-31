import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Expect: /sites/{username}/{slug}/{filename}
  // or:     /sites/{username}/{slug}  (serve index.html)
  if (segments.length < 2) {
    return new Response("Not Found", { status: 404 });
  }

  const username = segments[0];
  const slug = segments[1];
  const filename = segments[2] || "index.html";

  // Sanitize to prevent path traversal
  const safeName = path.basename(filename);
  const ext = path.extname(safeName);

  const filePath = path.join(
    process.cwd(),
    "public",
    "sites",
    username,
    slug,
    safeName
  );

  try {
    const content = await readFile(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new Response(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch {
    // Also try legacy flat file format: public/sites/{username}/{slug}.html
    if (!segments[2]) {
      try {
        const legacyPath = path.join(
          process.cwd(),
          "public",
          "sites",
          username,
          `${slug}.html`
        );
        const content = await readFile(legacyPath, "utf-8");
        return new Response(content, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=300",
          },
        });
      } catch {
        // fall through
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
