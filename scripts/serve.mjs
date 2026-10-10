#!/usr/bin/env node
/** Servidor estático mínimo para pré-visualizar dist/ localmente. Sem dependências. */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const DIST = resolve(process.cwd(), "dist");
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const filePath = normalize(join(DIST, pathname));
  if (!filePath.startsWith(DIST) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    const notFound = join(DIST, "404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(existsSync(notFound) ? readFileSync(notFound) : "404");
    return;
  }
  response.writeHead(200, { "Content-Type": TYPES[extname(filePath)] || "application/octet-stream" });
  response.end(readFileSync(filePath));
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
