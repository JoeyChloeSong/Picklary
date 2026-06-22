#!/usr/bin/env node
/* Picklary local preview server.
 * Zero dependencies. Works on Windows/Mac/Linux.
 * It builds are served from ./dist and the browser opens automatically.
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "dist");
const HOST = "127.0.0.1";
const requestedPort = Number(process.env.PORT || process.argv[2] || 0);
const PORTS = requestedPort
  ? [requestedPort, 8787, 8080, 5500, 5173, 8888, 4321, 5000, 3000]
  : [8787, 8080, 5500, 5173, 8888, 4321, 5000, 3000];
const tried = new Set();

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function log(line) {
  console.log(line);
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const normalized = decoded.replace(/\\/g, "/");
  if (normalized.includes("..")) return null;
  let filePath = path.join(root, normalized);
  if (!filePath.startsWith(root)) return null;
  return { normalized, filePath };
}

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function handler(req, res) {
  try {
    const joined = safeJoin(ROOT, req.url || "/");
    if (!joined) return send(res, 400, "Bad request");

    let urlPath = joined.normalized;
    let filePath = joined.filePath;

    if (urlPath === "/") {
      filePath = path.join(ROOT, "index.html");
    } else if (urlPath.endsWith("/")) {
      filePath = path.join(filePath, "index.html");
    } else if (!path.extname(filePath)) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      } else if (fs.existsSync(filePath + ".html")) {
        filePath = filePath + ".html";
      } else {
        filePath = path.join(filePath, "index.html");
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return send(res, 200, fs.readFileSync(filePath), TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    }

    const notFound = path.join(ROOT, "404.html");
    if (fs.existsSync(notFound)) {
      return send(res, 404, fs.readFileSync(notFound), "text/html; charset=utf-8");
    }
    return send(res, 404, "Not found");
  } catch (error) {
    return send(res, 500, "Server error: " + error.message);
  }
}

function openBrowser(url) {
  const startUrl = url;
  try {
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", startUrl], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [startUrl], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [startUrl], { detached: true, stdio: "ignore" }).unref();
    }
  } catch (_) {
    // Opening the browser is a convenience only. The printed URL still works.
  }
}

function tryPort(index) {
  if (!fs.existsSync(ROOT)) {
    log("ERROR: dist folder was not found.");
    log("Run this first: npm run build");
    process.exit(1);
  }

  while (index < PORTS.length && tried.has(PORTS[index])) index += 1;
  if (index >= PORTS.length) {
    log("ERROR: Could not open a local port.");
    log("Try running this command in PowerShell as Administrator:");
    log("  set PORT=8787 && node start-local.js");
    process.exit(1);
  }

  const port = PORTS[index];
  tried.add(port);
  const server = http.createServer(handler);

  server.on("error", (error) => {
    if (error && (error.code === "EADDRINUSE" || error.code === "EACCES")) {
      log("Port " + port + " is unavailable (" + error.code + "). Trying another port...");
      return tryPort(index + 1);
    }
    log("Server error: " + (error && error.message ? error.message : error));
    process.exit(1);
  });

  server.listen(port, HOST, () => {
    const url = "http://" + HOST + ":" + port + "/";
    log("");
    log("Picklary is running.");
    log("Open this URL: " + url + "  (auto language routing)");
    log("Direct links: " + url + "ko/ · " + url + "es/ · " + url + "en/");
    log("To stop the server, press Ctrl + C in this window.");
    log("");
    openBrowser(url);
  });
}

tryPort(0);
