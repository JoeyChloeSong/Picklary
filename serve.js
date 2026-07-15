#!/usr/bin/env node
/* serve.js — tiny zero-dependency static server for the built site in /dist.
 *   node serve.js            serves ./dist on PORT (default 3000)
 * Clean URLs: /en/about/ -> dist/en/about/index.html. Unknown paths -> 404.html. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".wasm": "application/wasm"
};

function send(res, code, body, type) {
  res.writeHead(code, { "Content-Type": type || "text/plain; charset=utf-8" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.includes("..")) return send(res, 400, "Bad request");
    let fp = path.join(ROOT, urlPath);

    // directory or extensionless -> index.html
    if (urlPath.endsWith("/")) fp = path.join(fp, "index.html");
    else if (!path.extname(fp)) {
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, "index.html");
      else if (fs.existsSync(fp + ".html")) fp = fp + ".html";
      else fp = path.join(fp, "index.html");
    }

    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      return send(res, 200, fs.readFileSync(fp), TYPES[path.extname(fp)] || "application/octet-stream");
    }
    const notFound = path.join(ROOT, "404.html");
    return send(res, 404, fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found", "text/html; charset=utf-8");
  } catch (e) {
    return send(res, 500, "Server error");
  }
});

server.listen(PORT, () => {
  console.log("Picklary running at http://localhost:" + PORT + "/  (Ctrl+C to stop)");
  if (!fs.existsSync(ROOT)) console.log("⚠  /dist not found — run `npm run build` first.");
});
