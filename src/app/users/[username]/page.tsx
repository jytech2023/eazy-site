import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

type SiteInfo = {
  slug: string;
  title: string;
  files: string[];
  updatedAt: string;
};

async function getUserSites(username: string): Promise<SiteInfo[]> {
  const userDir = path.join(process.cwd(), "public", "sites", username);
  const sites: SiteInfo[] = [];

  try {
    const entries = await readdir(userDir);

    for (const entry of entries) {
      const entryPath = path.join(userDir, entry);
      const entryStat = await stat(entryPath);

      if (entryStat.isDirectory()) {
        const dirFiles = await readdir(entryPath);
        let title = "Untitled";

        if (dirFiles.includes("index.html")) {
          const html = await readFile(
            path.join(entryPath, "index.html"),
            "utf-8"
          );
          const match = html.match(/<title>(.*?)<\/title>/i);
          if (match) title = match[1];
        }

        sites.push({
          slug: entry,
          title,
          files: dirFiles,
          updatedAt: entryStat.mtime.toISOString(),
        });
      } else if (entry.endsWith(".html")) {
        const slug = entry.replace(/\.html$/, "");
        const html = await readFile(entryPath, "utf-8");
        const match = html.match(/<title>(.*?)<\/title>/i);

        sites.push({
          slug,
          title: match ? match[1] : "Untitled",
          files: [entry],
          updatedAt: entryStat.mtime.toISOString(),
        });
      }
    }
  } catch {
    // User directory doesn't exist
  }

  sites.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return sites;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Sites`,
    description: `Public sites created by ${username} on EasySite`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const sites = await getUserSites(username);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent text-2xl font-bold">
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{username}</h1>
            <p className="text-muted">
              {sites.length} site{sites.length !== 1 ? "s" : ""} published
            </p>
          </div>
        </div>
      </div>

      {sites.length === 0 ? (
        <p className="text-center text-muted py-12">
          No published sites yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Link
              key={site.slug}
              href={
                site.files.length === 1 && site.files[0].endsWith(".html")
                  ? `/sites/${username}/${site.slug}.html`
                  : `/sites/${username}/${site.slug}/index.html`
              }
              target="_blank"
              className="group rounded-lg border border-card-border p-4 hover:border-accent/50 transition"
            >
              <h3 className="font-medium truncate group-hover:text-accent transition">
                {site.title}
              </h3>
              <p className="text-xs text-muted mt-2">
                {site.files.length} file{site.files.length > 1 ? "s" : ""}
                {" · "}
                {new Date(site.updatedAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {site.files.map((f) => (
                  <span
                    key={f}
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      f.endsWith(".html")
                        ? "bg-orange-500/10 text-orange-400"
                        : f.endsWith(".css")
                          ? "bg-blue-500/10 text-blue-400"
                          : f.endsWith(".js")
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-card-bg text-muted"
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
