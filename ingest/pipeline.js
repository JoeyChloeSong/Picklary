#!/usr/bin/env node
/* PickleLevel ingestion pipeline (zero dependencies).
 *
 *   node ingest/pipeline.js          process every ENABLED source -> data/ingested/<id>.json
 *   node ingest/pipeline.js --dry    don't write; with no enabled source, demo the RSS adapter
 *                                     on the bundled sample feed so you can see the normalized shape
 *
 * What this does and does NOT do:
 *  - It stores a LINK + a short OWN-WORDS summary stub and metadata. Status starts as "new".
 *  - It NEVER republishes source text and NEVER publishes anything. A human reviews items in the
 *    admin Inbox, rewrites them, and decides what (if anything) becomes a draft.
 *  - Confirm permission for every source (see COMPLIANCE.md) before setting enabled:true.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const rss = require("./adapters/rss");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(__dirname, "sources.config.json");
const OUT_DIR = path.join(ROOT, "data", "ingested");
const DRY = process.argv.includes("--dry");

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG, "utf8"));
}
function existingLinks() {
  const seen = new Set();
  if (!fs.existsSync(OUT_DIR)) return seen;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
      const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
      for (const it of items) if (it.sourceUrl) seen.add(it.sourceUrl);
    } catch (e) {}
  }
  return seen;
}
function summarize(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  // a neutral stub only — the editor replaces this with their own words
  return t ? "[needs own-words summary] " + t.slice(0, 140) + (t.length > 140 ? "…" : "") : "[needs own-words summary]";
}
function normalize(entry, source) {
  return {
    id: source.id + "-" + Buffer.from(entry.link || entry.title).toString("base64").replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase(),
    type: source.type === "rss" ? (source.license === "facts-only" ? "release" : "news") : source.type,
    title: entry.title,
    summary: summarize(entry.summary),
    source: source.label,
    sourceUrl: entry.link,
    category: source.category || null,
    fetchedAt: new Date().toISOString(),
    published: entry.published || null,
    status: "new",
    license: source.license || "link-only"
  };
}

async function run() {
  const cfg = loadConfig();
  const enabled = (cfg.sources || []).filter((s) => s.enabled);

  if (enabled.length === 0) {
    console.log("No enabled sources in ingest/sources.config.json (this is the safe default).");
    if (DRY) {
      console.log("\n--dry demo: running the RSS adapter on the bundled sample feed…\n");
      const demoSource = { id: "demo", type: "rss", label: "Sample Feed", url: path.join(__dirname, "sample-feed.xml"), license: "link-only" };
      const entries = await rss.fetchSource(demoSource, cfg.settings);
      const items = entries.map((e) => normalize(e, demoSource));
      console.log(JSON.stringify(items, null, 2));
      console.log("\n(" + items.length + " items normalized. Nothing written — dry run.)");
    } else {
      console.log("Enable a permitted source (see COMPLIANCE.md), then run again. Try `npm run ingest:dry` to see the flow.");
    }
    return;
  }

  const seen = existingLinks();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const source of enabled) {
    if (source.type !== "rss") { console.log("Skipping " + source.id + " (no adapter for type '" + source.type + "')"); continue; }
    process.stdout.write("Fetching " + source.id + " … ");
    let entries;
    try { entries = await rss.fetchSource(source, cfg.settings); }
    catch (e) { console.log("failed (" + e.message + ")"); continue; }
    const fresh = entries.map((e) => normalize(e, source)).filter((it) => it.sourceUrl && !seen.has(it.sourceUrl));
    fresh.forEach((it) => seen.add(it.sourceUrl));
    console.log(entries.length + " fetched, " + fresh.length + " new");
    if (DRY) { console.log(JSON.stringify(fresh, null, 2)); continue; }

    const file = path.join(OUT_DIR, source.id + ".json");
    let current = [];
    if (fs.existsSync(file)) { try { current = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) {} }
    const merged = current.concat(fresh);
    fs.writeFileSync(file, JSON.stringify(merged, null, 2));
    // polite delay between sources
    await new Promise((r) => setTimeout(r, (cfg.settings && cfg.settings.requestDelayMs) || 1000));
  }
  if (!DRY) console.log("\nDone. Review new items in the admin Inbox, rewrite in your own words, then build.");
}

run().catch((e) => { console.error(e); process.exit(1); });
