// Minimaler Static-Server für build/ (SPA-Fallback auf index.html).
// Nur für lokale Vorschau der Produktionsfassung: PORT=3002 node scripts/serve-build.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "build");
const port = Number(process.env.PORT || 3002);
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (path === "/") path = "/index.html";
    const file = join(root, path);
    let data;
    try {
      data = await readFile(file);
    } catch {
      if (extname(file)) {
        res.writeHead(404);
        res.end("Nicht gefunden");
        return;
      }
      data = await readFile(join(root, "index.html"));
    }
    res.writeHead(200, {
      "Content-Type": MIME[extname(file)] || "application/octet-stream",
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
}).listen(port, () => {
  console.log("Build-Server läuft auf http://localhost:" + port);
});
