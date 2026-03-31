/**
 * Deploy files to Cloudflare Pages via Direct Upload API.
 * Returns the deployment URL on success.
 */
export async function deployToCloudflarePages(opts: {
  apiToken: string;
  accountId: string;
  projectName: string;
  files: Record<string, string>;
}): Promise<{ url: string; id: string }> {
  const { apiToken, accountId, projectName, files } = opts;

  // Cloudflare Pages Direct Upload uses multipart form
  const form = new FormData();

  for (const [filename, content] of Object.entries(files)) {
    form.append(
      filename,
      new Blob([content], { type: getMimeType(filename) }),
      filename
    );
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const data = await res.json();
    const msg = data?.errors?.[0]?.message || "Cloudflare Pages deployment failed";
    throw new Error(msg);
  }

  const data = await res.json();
  const deployment = data.result;

  return {
    url: deployment.url,
    id: deployment.id,
  };
}

function getMimeType(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf("."));
  const types: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "text/plain";
}
