/* RSS/Atom adapter — zero dependencies.
   Returns normalized entries: { title, link, summary, published }.
   Accepts an http(s) URL or a local file path (used for the offline demo). */
"use strict";
const fs = require("fs");
const https = require("https");
const http = require("http");

function fetchText(target, userAgent) {
  // local file (demo / testing)
  if (!/^https?:\/\//i.test(target)) {
    return Promise.resolve(fs.readFileSync(target, "utf8"));
  }
  return new Promise((resolve, reject) => {
    const lib = target.startsWith("https") ? https : http;
    const req = lib.get(target, { headers: { "User-Agent": userAgent || "PickleLevelBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetchText(res.headers.location, userAgent));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
  });
}

function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")           // strip any embedded tags from summaries
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
}
function pick(block, tag) {
  const m = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i"));
  return m ? decode(m[1]) : "";
}
function pickAttr(block, tag, attr) {
  const m = block.match(new RegExp("<" + tag + "[^>]*\\b" + attr + "=\"([^\"]*)\"", "i"));
  return m ? m[1] : "";
}

async function fetchSource(source, settings) {
  const xml = await fetchText(source.url, settings && settings.userAgent);
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = xml.match(isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) || [];
  const max = (settings && settings.maxItemsPerSource) || 10;
  return blocks.slice(0, max).map((b) => ({
    title: pick(b, "title"),
    link: isAtom ? (pickAttr(b, "link", "href") || pick(b, "id")) : pick(b, "link"),
    summary: pick(b, isAtom ? "summary" : "description"),
    published: pick(b, isAtom ? "updated" : "pubDate")
  })).filter((e) => e.title);
}

module.exports = { fetchSource, fetchText, decode };
