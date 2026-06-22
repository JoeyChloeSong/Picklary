#!/usr/bin/env node
/* draft-generator.js — turn ONE ingested item into a post DRAFT skeleton.
 *
 *   node ingest/draft-generator.js <ingested-id>
 *
 * Prints a ready-to-paste data object for data/posts.js (status: "draft"). It contains a
 * source link and an empty, sectioned outline — NEVER the source's text. You (a human) write
 * the body in your own words and fact-check before changing status to "published".
 */
"use strict";
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "data", "ingested");
const id = process.argv[2];

if (!id) { console.error("Usage: node ingest/draft-generator.js <ingested-id>"); process.exit(1); }

function loadItems() {
  const all = [];
  if (!fs.existsSync(OUT_DIR)) return all;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
      const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
      all.push(...items);
    } catch (e) {}
  }
  return all;
}

const item = loadItems().find((x) => x.id === id);
if (!item) { console.error("No ingested item with id: " + id); process.exit(1); }

function slugify(s) { return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

const draft = {
  id: "post-" + Date.now(),
  slug: slugify(item.title),
  category: item.category || "scene",
  status: "draft",
  date: new Date().toISOString().slice(0, 10),
  title: item.title,
  subtitle: "",
  summary: "",
  body: [
    '<p><em>Write this in your own words. Link to the source; do not paste its text.</em></p>',
    '<h2 id="what-happened">What happened</h2>',
    '<p>…</p>',
    '<h2 id="why-it-matters">Why it matters for improving players</h2>',
    '<p>…</p>',
    '<p>Source: <a href="' + (item.sourceUrl || "#") + '" rel="noopener" target="_blank">' + (item.source || "source") + '</a></p>'
  ].join("\n"),
  keyTakeaways: [],
  related: []
};

console.log("// Paste into data/posts.js (inside the exported array). Review & write before publishing.\n");
console.log(JSON.stringify(draft, null, 2));
