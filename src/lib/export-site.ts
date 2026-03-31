import JSZip from "jszip";

export async function exportSiteAsZip(
  files: Record<string, string>,
  siteName?: string
) {
  const zip = new JSZip();

  for (const [filename, content] of Object.entries(files)) {
    zip.file(filename, content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const name = siteName
    ? siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "site";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
