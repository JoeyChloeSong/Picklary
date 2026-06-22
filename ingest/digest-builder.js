#!/usr/bin/env node
/* digest-builder.js — assemble a "The Brief" edition DRAFT from ingested items.
 *
 *   node ingest/digest-builder.js
 *
 * It turns reviewed inbox items into a Markdown SCAFFOLD: a heading, and one bullet per
 * item with the source link and a blank line for YOUR synthesis ("what it means for an
 * improving player"). It writes nothing to the live site — it prints a draft for you to
 * edit and paste into a new column/Brief entry in the admin. The value (and the AdSense
 * safety) is your original synthesis; this only saves you the busywork of collecting links.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "data", "ingested");

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

const items = loadItems().filter((it) => it.status !== "dismissed");
const date = new Date().toISOString().slice(0, 10);

let md = "# The Brief — draft (" + date + ")\n\n";
md += "_Write a 1–2 sentence intro on the through-line of this edition._\n\n";

if (!items.length) {
  md += "No ingested items yet. Run `npm run ingest` first.\n";
} else {
  for (const it of items) {
    md += "## " + (it.title || "(untitled)") + "\n";
    md += "- Source: [" + (it.source || "source") + "](" + (it.sourceUrl || "#") + ")\n";
    md += "- Your take (own words — what it means for an improving player):\n\n  _…_\n\n";
  }
  md += "\n> Reminder: summarise in your own words and link out. Do not paste source text. Do not re-host video/highlights.\n";
}

process.stdout.write(md);
