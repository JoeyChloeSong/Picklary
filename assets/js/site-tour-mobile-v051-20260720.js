/* Picklary — minimal, purposeful client JS. No dependencies. */
(function () {
  "use strict";
  var LANG_KEY = "picklelevel.lang";
  var ADMIN_KEY = "picklelevel.admin";

  /* ---- language switcher: persist choice + navigate to the equivalent locale URL ---- */
  var lang = document.querySelector("[data-language-switcher]");
  if (lang) {
    lang.addEventListener("change", function () {
      var url = lang.value;
      // option value looks like "/ko/...": remember the locale code, then go.
      var m = url.match(/^\/([a-z]{2}(?:-[A-Za-z]+)?)\//);
      if (m) { try { localStorage.setItem(LANG_KEY, m[1]); } catch (e) {} }
      if (url) window.location.href = url;
    });
  }

  /* ---- level page: master-shot explorer (tabbed) ---- */
  var shotExplorers = document.querySelectorAll("[data-shot-explorer]");
  shotExplorers.forEach(function (ex) {
    var chips = ex.querySelectorAll(".shot-chip");
    var panels = ex.querySelectorAll(".shot-panel");
    function activate(i) {
      chips.forEach(function (c, j) { var on = j === i; c.classList.toggle("is-active", on); c.setAttribute("aria-selected", on ? "true" : "false"); });
      panels.forEach(function (p, j) { var on = j === i; p.classList.toggle("is-hidden", !on); if (on) p.removeAttribute("hidden"); else p.setAttribute("hidden", ""); });
    }
    chips.forEach(function (chip, i) {
      chip.addEventListener("click", function () { activate(i); });
      chip.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var n = (i + (e.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length;
          activate(n); chips[n].focus();
        }
      });
    });
  });

  /* ---- mobile navigation toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- author page: reveal the editor CTA only during a demo admin session ---- */
  function isEditor() {
    try { return localStorage.getItem(ADMIN_KEY) === "1"; } catch (e) { return false; }
  }
  var cta = document.querySelector("[data-author-cta]");
  var visitor = document.querySelector("[data-author-visitor]");
  if (cta && isEditor()) {
    cta.hidden = false;
    if (visitor) visitor.hidden = true;
  }

  /* ---- contact form: build a mailto so it works without a server ---- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = form.getAttribute("data-email") || "";
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      var from = (form.querySelector('[name="from"]') || {}).value || "";
      var msg = (form.querySelector('[name="message"]') || {}).value || "";
      var subject = "Picklary contact" + (name ? " from " + name : "");
      var body = msg + (from ? "\n\n— " + name + " (" + from + ")" : "");
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---- paddle finder: multi-question -> ranked top 3 from the curated list ---- */
  var finder = document.querySelector("[data-paddle-finder]");
  if (finder) buildFinder(finder);

  function buildFinder(el) {
    var dataEl = document.getElementById("paddle-finder-data");
    if (!dataEl) return;
    var D;
    try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
    var I = D.i18n, R = I.reasons, answers = {};
    var REQUIRED = ["q_style", "q_level", "q_budget"];
    function esch(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function escA(t) { return esch(t).replace(/"/g, "&quot;"); }
    function has(arr, v) { return arr && arr.indexOf(v) >= 0; }
    function fmt(t, x) { return String(t).replace("{x}", x); }
    var GROUP_ICONS = { q_style: "🎯", q_level: "📈", q_budget: "💰", q_feel: "🧩", q_weight: "⚖️", q_height: "📏", q_hand: "✋", q_pro: "⭐" };
    var OPTION_ICONS = {
      q_style: { control: "🛡️", power: "⚡", allcourt: "🧭", hands: "🤲", spin: "🌀" },
      q_level: { beginner: "🌱", improver: "📘", advanced: "🚀", expert: "🏅" },
      q_budget: { value: "💵", mid: "💳", premium: "💎" },
      q_feel: { plush: "☁️", pop: "⚡", balanced: "⚖️" },
      q_weight: { light: "🪶", medium: "🎯", stable: "🧱" },
      q_height: { short: "↕️", average: "📐", tall: "📏" },
      q_hand: { small: "🤏", medium: "✋", large: "🖐️" },
      q_pro: { benjohns: "🎯", annaleigh: "⚡", mcguffin: "💥", ignatowich: "🌀", none: "🙂" }
    };
    function optIcon(qid, oid) { return (OPTION_ICONS[qid] && OPTION_ICONS[qid][oid]) || "•"; }

    var form = document.createElement("div");
    form.className = "finder__form";
    var introP = document.createElement("p");
    introP.className = "finder__intro";
    introP.textContent = I.intro;
    form.appendChild(introP);

    D.questions.forEach(function (q) {
      var grp = document.createElement("div");
      grp.className = "finder__group";
      var h = document.createElement("p");
      h.className = "finder__q";
      h.innerHTML = '<span class="finder__q-icon" aria-hidden="true">' + (GROUP_ICONS[q.id] || '•') + '</span><span>' + esch(q.title) + '</span>';
      grp.appendChild(h);
      var opts = document.createElement("div");
      opts.className = "finder__options";
      q.opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "finder__opt";
        b.innerHTML = '<span class="finder__opt-icon" aria-hidden="true">' + optIcon(q.id, o.id) + '</span><span class="finder__opt-label">' + esch(o.label) + '</span>';
        b.addEventListener("click", function () {
          answers[q.id] = o.id;
          var sib = opts.querySelectorAll(".finder__opt");
          for (var k = 0; k < sib.length; k++) sib[k].classList.toggle("is-selected", sib[k] === b);
          go.disabled = !REQUIRED.every(function (rk) { return answers[rk]; });
        });
        opts.appendChild(b);
      });
      grp.appendChild(opts);
      form.appendChild(grp);
    });

    var go = document.createElement("button");
    go.type = "button";
    go.className = "btn btn--primary finder__go";
    go.textContent = I.see;
    go.disabled = true;
    go.addEventListener("click", showResults);
    form.appendChild(go);

    var results = document.createElement("div");
    results.className = "finder__results";
    el.appendChild(form);
    el.appendChild(results);

    var BENCHMARK = {
      // Higher numbers here do not mean "better paddle"; they are market-trust / recognition signals.
      // The finder still scores fit first, but keeps one recognizable benchmark in the result set.
      "joola-ben-johns-perseus": 4.3,
      "joola-perseus-pro-v": 4.2,
      "selkirk-project-boomstik": 4.1,
      "crbn-1x-power-series": 3.6,
      "crbn-2x-power-series": 3.5,
      "crbn-trufoam-genesis": 3.4,
      "joola-scorpeus": 3.1,
      "six-zero-double-black-diamond-control": 2.4,
      "vatic-pro-prism-flash": 2.3,
      "selkirk-luxx-control-air": 2.2,
      "selkirk-power-air": 2.1
    };
    var STYLE_BENCHMARKS = {
      control: ["crbn-trufoam-genesis", "joola-ben-johns-perseus", "joola-scorpeus", "six-zero-double-black-diamond-control", "vatic-pro-prism-flash"],
      power: ["selkirk-project-boomstik", "crbn-1x-power-series", "selkirk-power-air", "joola-perseus-pro-v"],
      allcourt: ["joola-ben-johns-perseus", "joola-perseus-pro-v", "crbn-2x-power-series", "selkirk-luxx-control-air"],
      hands: ["joola-scorpeus", "selkirk-luxx-control-air", "six-zero-double-black-diamond-control", "vatic-pro-prism-flash"],
      spin: ["joola-perseus-pro-v", "joola-ben-johns-perseus", "crbn-1x-power-series", "crbn-trufoam-genesis"]
    };
    function isBenchmark(p) { return !!BENCHMARK[p.slug]; }
    function benchmarkBonus(p, a) {
      var b = BENCHMARK[p.slug] || 0;
      if (!b) return { bonus: 0, reason: "" };
      if (a.q_level === "l30" && !has(p.levels, "3.0")) b -= 1.0;
      if (a.q_budget === "b1" && p.band === "$$$") b -= 1.4;
      else if (a.q_budget === "b1" && p.band === "$$") b -= 0.15;
      if (a.q_budget === "b3" && p.band === "$") b -= 0.55;
      var smap = { control: "control", power: "power", allcourt: "all-court", hands: "hands", spin: "spin" };
      if (a.q_style && p.style !== smap[a.q_style]) b -= 0.25;
      if (STYLE_BENCHMARKS[a.q_style] && STYLE_BENCHMARKS[a.q_style].indexOf(p.slug) >= 0) b += 0.75;
      if (a.q_player === "benjohns" && /joola.*perseus/.test(p.slug)) b += 1.0;
      if (a.q_player === "collinjohns" && p.slug === "joola-scorpeus") b += 1.0;
      if (a.q_player === "alshon" && (p.slug === "selkirk-project-boomstik" || p.slug === "selkirk-power-air")) b += 0.8;
      if (b < 0.7) return { bonus: 0, reason: "" };
      return { bonus: b, reason: (I.trust && I.trust.reason) || "popular benchmark model" };
    }
    function benchmarkPriority(item, a) {
      if (!item || !item.p || !isBenchmark(item.p)) return -999;
      var p = item.p, v = item.score + (BENCHMARK[p.slug] || 0);
      if (STYLE_BENCHMARKS[a.q_style]) {
        var ix = STYLE_BENCHMARKS[a.q_style].indexOf(p.slug);
        if (ix >= 0) v += 5 - ix;
      }
      if (a.q_budget === "b1") {
        if (p.band === "$") v += 4;
        else if (p.band === "$$") v += 1.5;
        else v -= 1.5;
      } else if (a.q_budget === "b3" || a.q_budget === "any") {
        if (p.band === "$$$" || p.band === "$$") v += 1.25;
      }
      if (a.q_level === "l30" && !has(p.levels, "3.0")) v -= 1.0;
      return v;
    }
    function topBenchmarkCandidate(ranked, currentTop) {
      var used = {}, best = null, bestScore = -999;
      currentTop.forEach(function (x) { used[x.p.slug] = 1; });
      for (var i = 0; i < ranked.length; i++) {
        var item = ranked[i];
        if (used[item.p.slug] || !isBenchmark(item.p)) continue;
        var v = benchmarkPriority(item, answers);
        if (v > bestScore) { bestScore = v; best = item; }
      }
      return best;
    }
    function score(p) {
      var s = 0, why = [], a = answers;
      if (a.q_style) {
        var smap = { control: "control", power: "power", allcourt: "all-court", hands: "hands", spin: "spin" };
        if (p.style === smap[a.q_style]) { s += 5; why.push(fmt(R.style, p.styleLabel)); }
        if (a.q_style === "control") { s += Math.max(0, p.ratings.control - 7) * 0.6; if (has(p.traits, "control") || has(p.traits, "touch")) s += 1.5; }
        else if (a.q_style === "power") { s += Math.max(0, p.ratings.power - 7) * 0.6; if (has(p.traits, "power")) s += 1.5; }
        else if (a.q_style === "spin") { s += Math.max(0, p.ratings.spin - 7) * 0.6; if (has(p.traits, "spin")) s += 1.5; }
        else if (a.q_style === "hands") { s += Math.max(0, p.ratings.speed - 7) * 0.6; if (has(p.traits, "hands") || has(p.traits, "maneuverability")) s += 1.5; }
      }
      if (a.q_level) {
        var lv = a.q_level === "l30" ? "3.0" : a.q_level === "l35" ? "3.5" : "4.0";
        if (has(p.levels, lv)) { s += 4; why.push(fmt(R.level, lv)); } else { s -= 2; }
      }
      if (a.q_budget && a.q_budget !== "any") {
        var ord = { "$": 1, "$$": 2, "$$$": 3 };
        var want = a.q_budget === "b1" ? 1 : a.q_budget === "b2" ? 2 : 3;
        var dist = Math.abs(ord[p.band] - want);
        if (dist === 0) { s += 4; why.push(fmt(R.budget, p.band)); } else if (dist === 1) s += 1; else s -= 2;
      }
      if (a.q_feel === "thick") { s += Math.max(0, p.ratings.control - 7) * 0.6; if (p.ratings.control >= 8.3) { why.push(fmt(R.control, p.ratings.control)); s += 0.5; } }
      else if (a.q_feel === "thin") { s += Math.max(0, p.ratings.power - 7) * 0.6; if (p.ratings.power >= 8.3) { why.push(fmt(R.power, p.ratings.power)); s += 0.5; } }
      if (a.q_weight === "light") { s += Math.max(0, p.ratings.speed - 7) * 0.6; if (has(p.traits, "maneuverability")) { s += 1; why.push(R.light); } }
      else if (a.q_weight === "heavy") { if (has(p.traits, "stability")) { s += 1.5; why.push(R.heavy); } s += Math.max(0, p.ratings.power - 7) * 0.3; }
      if (a.q_height === "tall") { if (/elongated/.test(p.shape)) { s += 2; why.push(R.reach); } }
      else if (a.q_height === "short") { if (/widebody|traditional/.test(p.shape)) { s += 1.5; why.push(R.forgiving); } }
      if (a.q_player && a.q_player !== "any") {
        var pm = { benjohns: "ben johns", collinjohns: "collin johns", alshon: "christian alshon", alw: "anna leigh waters", crossover: "crossover" };
        var nm = pm[a.q_player];
        if (nm && p.usedBy.toLowerCase().indexOf(nm) >= 0) { s += 3; why.push(fmt(R.player, p.usedBy)); }
      }
      var trust = benchmarkBonus(p, a);
      if (trust.bonus) { s += trust.bonus; why.push(trust.reason); }
      var seen = {}, uniq = [];
      why.forEach(function (w) { if (!seen[w]) { seen[w] = 1; uniq.push(w); } });
      return { score: s, why: uniq.slice(0, 5), benchmark: !!trust.bonus };
    }

    function recProfile(a) {
      var t14 = 0;
      if (a.q_feel === "thin") t14 += 3; else if (a.q_feel === "thick") t14 -= 3;
      if (a.q_style === "power") t14 += 2; else if (a.q_style === "hands") t14 += 1; else if (a.q_style === "control") t14 -= 2; else if (a.q_style === "allcourt") t14 -= 1;
      if (a.q_weight === "light") t14 += 1; else if (a.q_weight === "heavy") t14 -= 1;
      if (a.q_level === "l30") t14 -= 1;
      var thick = t14 > 0 ? "t14" : "t16";
      var sh = { wide: 0, hybrid: 0, elong: 0 };
      if (a.q_height === "tall") sh.elong += 2; else if (a.q_height === "short") sh.wide += 2; else if (a.q_height === "avg") sh.hybrid += 1;
      if (a.q_style === "power") sh.elong += 2; else if (a.q_style === "control") sh.wide += 2; else if (a.q_style === "allcourt") sh.hybrid += 2; else if (a.q_style === "hands") { sh.wide += 1; sh.hybrid += 1; } else if (a.q_style === "spin") sh.elong += 1;
      if (a.q_level === "l30") sh.wide += 1; else if (a.q_level === "l40") sh.elong += 0.5;
      var shape = (sh.elong >= sh.wide && sh.elong >= sh.hybrid) ? "elong" : (sh.wide >= sh.hybrid ? "wide" : "hybrid");
      return { thick: thick, shape: shape };
    }
    function profilePanel() {
      var P = I.profile; if (!P) return "";
      var pr = recProfile(answers);
      var tVal = pr.thick === "t14" ? P.t14 : P.t16, tWhy = pr.thick === "t14" ? P.t14why : P.t16why;
      var sVal = pr.shape === "elong" ? P.shapeElong : pr.shape === "wide" ? P.shapeWide : P.shapeHybrid;
      var sWhy = pr.shape === "elong" ? P.elongWhy : pr.shape === "wide" ? P.wideWhy : P.hybridWhy;
      return '<div class="finder-profile">' +
        '<h3 class="finder-profile__title">' + esch(P.title) + "</h3>" +
        '<p class="finder-profile__intro">' + esch(P.intro) + "</p>" +
        '<div class="finder-profile__grid">' +
          '<div class="finder-profile__item"><span class="finder-profile__label">' + esch(P.thicknessLabel) + '</span><span class="finder-profile__val">' + esch(tVal) + '</span><p class="finder-profile__why">' + esch(tWhy) + "</p></div>" +
          '<div class="finder-profile__item"><span class="finder-profile__label">' + esch(P.shapeLabel) + '</span><span class="finder-profile__val">' + esch(sVal) + '</span><p class="finder-profile__why">' + esch(sWhy) + "</p></div>" +
        "</div>" +
        '<p class="finder-profile__note">' + esch(P.note) + "</p></div>";
    }

    function recBadges(item, rankIndex) {
      var p = item.p, badges = [];
      if (rankIndex === 0 && I.trust && I.trust.bestFit) badges.push(I.trust.bestFit);
      if (item.benchmark && I.trust && I.trust.benchmarkPick) badges.push(I.trust.benchmarkPick);
      var smap = { control: "control", power: "power", allcourt: "all-court", hands: "hands", spin: "spin" };
      if (answers.q_style && p.style === smap[answers.q_style] && I.trust && I.trust.styleFit) badges.push(I.trust.styleFit);
      if (answers.q_budget && answers.q_budget !== "any") {
        var want = answers.q_budget === "b1" ? "$" : answers.q_budget === "b2" ? "$$" : "$$$";
        if (p.band === want && I.trust && I.trust.budgetFit) badges.push(I.trust.budgetFit);
      }
      if (answers.q_level) {
        var lv = answers.q_level === "l30" ? "3.0" : answers.q_level === "l35" ? "3.5" : "4.0";
        if (has(p.levels, lv) && I.trust && I.trust.levelFit) badges.push(I.trust.levelFit);
      }
      var prof = recProfile(answers);
      var shapeOk = (prof.shape === "elong" && /elongated/.test(p.shape)) || (prof.shape === "wide" && /widebody|traditional/.test(p.shape)) || (prof.shape === "hybrid" && /hybrid/.test(p.shape));
      if (shapeOk && I.trust && I.trust.profileFit) badges.push(I.trust.profileFit);
      var seen = {}, out = [];
      badges.forEach(function (b) { if (b && !seen[b]) { seen[b] = 1; out.push(b); } });
      return out.slice(0, 4);
    }
    function showResults() {
      var ranked = D.paddles.map(function (p) { var r = score(p); return { p: p, score: r.score, why: r.why, benchmark: r.benchmark }; })
        .sort(function (x, y) { return y.score - x.score; });
      var top = ranked.slice(0, 3);
      if (top.length === 3 && !top.some(function (x) { return x.benchmark; })) {
        var bm = topBenchmarkCandidate(ranked, top);
        // Keep trust visible: if the benchmark is at least a plausible fit, reserve the #3 slot for it.
        // This makes famous reference paddles visible without letting popularity override the best-fit #1.
        if (bm && bm.score >= Math.max(3.0, top[2].score - 6.0)) {
          bm.benchmark = true;
          bm.why = bm.why || [];
          if (I.trust && I.trust.reason && bm.why.indexOf(I.trust.reason) < 0) bm.why.unshift(I.trust.reason);
          top[2] = bm;
        }
      }
      if (top.length >= 2 && top[0].benchmark && !top[1].benchmark) {
        var keep = top[0]; top[0] = top[1]; top[1] = keep;
      }
      results.innerHTML = "";
      if (!top.length || top[0].score <= 0) {
        var none = document.createElement("p"); none.className = "notice"; none.textContent = I.none; results.appendChild(none); return;
      }
      var html = profilePanel();
      top.forEach(function (item, i) {
        var p = item.p, url = D.base + p.slug + "/";
        var why = item.why.map(function (w) { return "<li>" + esch(w) + "</li>"; }).join("");
        var tag = i === 0 ? ((I.trust && I.trust.bestFit) || "Best overall fit") : item.benchmark ? ((I.trust && I.trust.benchmarkPick) || "Popular benchmark pick") : ((I.trust && I.trust.fitPick) || "Fit pick");
        var badges = recBadges(item, i).map(function (b) { return '<span>' + esch(b) + '</span>'; }).join('');
        html += '<article class="finder-rec finder-rec--' + (i + 1) + (item.benchmark ? ' finder-rec--benchmark' : '') + '">' +
          '<div class="finder-rec__rank">' + esch(D.ranks[i] || ("#" + (i + 1))) + "</div>" +
          '<div class="finder-rec__body">' +
            '<p class="finder-rec__tag">' + esch(tag) + '</p>' +
            (badges ? '<div class="finder-rec__badges" aria-label="' + esch((I.trust && I.trust.confidence) || 'Why this appeared') + '">' + badges + '</div>' : '') +
            '<h3 class="finder-rec__name"><a href="' + escA(url) + '">' + esch(p.brand + " " + p.model) + "</a></h3>" +
            '<p class="finder-rec__meta">' + esch(p.styleLabel) + " · " + esch(p.band) + " · $" + esch(String(p.usd)) +
              ' <span class="finder-rec__verify">(' + esch(I.verify) + ")</span></p>" +
            '<p class="finder-rec__whytitle">' + esch(I.why) + "</p><ul class=\"finder-rec__why\">" + why + "</ul>" +
            '<p class="finder-rec__summary">' + esch(p.summary) + "</p>" +
            '<p class="finder-rec__links"><a class="btn btn--primary" href="' + escA(url) + '">' + esch(I.view) + "</a>" +
              (p.sourceUrl ? ' <a class="finder-rec__src" href="' + escA(p.sourceUrl) + '" target="_blank" rel="noopener nofollow">' + esch(I.source + ": " + p.sourceName) + "</a>" : "") +
            "</p></div></article>";
      });
      var topSlugs = {};
      top.forEach(function (x) { topSlugs[x.p.slug] = 1; });
      var compare = ranked.filter(function (x) { return isBenchmark(x.p) && !topSlugs[x.p.slug]; }).slice(0, 3);
      if (compare.length) {
        html += '<section class="finder-compare"><h3>' + esch((I.trust && I.trust.compareTitle) || 'Also compare with popular paddles') + '</h3><p>' + esch((I.trust && I.trust.compareIntro) || 'These well-known models did not make your top three, but they are useful benchmarks to compare before choosing.') + '</p><div class="finder-compare__grid">';
        compare.forEach(function (item) {
          var p = item.p, url = D.base + p.slug + "/";
          html += '<a class="finder-compare__item" href="' + escA(url) + '"><strong>' + esch(p.brand + ' ' + p.model) + '</strong><span>' + esch(p.styleLabel + ' · ' + p.band + ' · $' + String(p.usd)) + '</span></a>';
        });
        html += '</div></section>';
      }
      if (answers.q_hand) {
        var tip = answers.q_hand === "small" ? I.gripTipSmall : answers.q_hand === "large" ? I.gripTipLarge : I.gripTipMed;
        html += '<p class="finder__tip">' + esch(tip) + "</p>";
      }
      html += '<p class="notice finder__disclaimer">' + esch(I.disclaimer) + "</p>";
      results.innerHTML = html;
      var again = document.createElement("button");
      again.type = "button"; again.className = "btn btn--ghost finder__restart"; again.textContent = I.restart;
      again.addEventListener("click", function () {
        answers = {}; results.innerHTML = "";
        var sel = form.querySelectorAll(".finder__opt.is-selected");
        for (var k = 0; k < sel.length; k++) sel[k].classList.remove("is-selected");
        go.disabled = true; form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      results.appendChild(again);
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
})();

/* ---- Picklary paddle filters + highlight battle demo ---- */
(function () {
  "use strict";

  var filters = document.querySelector("[data-paddle-filters]");
  if (filters) {
    var brand = filters.querySelector("[data-filter-brand]");
    var style = filters.querySelector("[data-filter-style]");
    var level = filters.querySelector("[data-filter-level]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-paddle-card]"));
    function applyFilters() {
      var b = brand && brand.value;
      var s = style && style.value;
      var l = level && level.value;
      cards.forEach(function (card) {
        var ok = true;
        if (b) ok = ok && card.getAttribute("data-brand") === b;
        if (s) ok = ok && card.getAttribute("data-style") === s;
        if (l) ok = ok && (card.getAttribute("data-levels") || "").split(/\s+/).indexOf(l) >= 0;
        card.classList.toggle("is-hidden", !ok);
      });
    }
    [brand, style, level].forEach(function (el) { if (el) el.addEventListener("change", applyFilters); });
  }

  var demo = document.querySelector("[data-highlights-demo]");
  if (demo) {
    var form = demo.querySelector("[data-highlight-form]");
    var board = demo.querySelector("[data-highlight-board]");
    var seed = document.getElementById("highlight-seed");
    var votesLabel = demo.getAttribute("data-votes-label") || "votes";
    var storageKey = "picklelevel.highlights";
    var items = [];
    try { items = seed ? JSON.parse(seed.textContent || "[]") : []; } catch (e) { items = []; }
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) items = items.concat(saved);
    } catch (e) {}

    function saveLocal() {
      var localOnly = items.filter(function (it) { return it.local; });
      try { localStorage.setItem(storageKey, JSON.stringify(localOnly)); } catch (e) {}
    }
    function renderBoard() {
      if (!board) return;
      var sorted = items.slice().sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); });
      board.innerHTML = "";
      sorted.forEach(function (it, i) {
        var row = document.createElement("article");
        row.className = "highlight-item";
        var rank = document.createElement("span");
        rank.className = "highlight-item__rank";
        rank.textContent = "#" + (i + 1);
        var body = document.createElement("div");
        var title = document.createElement("h3");
        title.textContent = it.title || "Untitled clip";
        var meta = document.createElement("p");
        meta.textContent = (it.level || "") + " · " + (it.skill || "") + (it.note ? " · " + it.note : "");
        var vote = document.createElement("button");
        vote.type = "button";
        vote.className = "btn btn--ghost highlight-item__vote";
        vote.textContent = "▲ " + (it.votes || 0) + " " + votesLabel;
        vote.addEventListener("click", function () { it.votes = (it.votes || 0) + 1; if (it.local) saveLocal(); renderBoard(); });
        body.appendChild(title); body.appendChild(meta);
        row.appendChild(rank); row.appendChild(body); row.appendChild(vote);
        board.appendChild(row);
      });
    }
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var titleEl = form.querySelector('[name="title"]');
        var levelEl = form.querySelector('[name="level"]');
        var skillEl = form.querySelector('[name="skill"]');
        var fileEl = form.querySelector('[name="file"]');
        var fileName = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0].name : "local clip";
        items.push({
          title: (titleEl && titleEl.value) || fileName,
          level: (levelEl && levelEl.value) || "3.0",
          skill: (skillEl && skillEl.value) || "highlight",
          votes: 1,
          note: fileName,
          local: true
        });
        saveLocal();
        form.reset();
        renderBoard();
      });
    }
    renderBoard();
  }
})();

/* ---- Community board demos: FAQ suggestions + situational Q&A ---- */
(function () {
  "use strict";
  var lang = (document.documentElement.getAttribute("lang") || "en").slice(0, 2);
  function txt(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || value.ko || "";
  }
  function pill(text) {
    var span = document.createElement("span");
    span.className = "pill";
    span.textContent = text;
    return span;
  }
  function tagLabel(tag) {
    var ko = { rules:"규칙", serve:"서브", positioning:"포지셔닝", consistency:"안정성", "third-shot":"3구", kitchen:"키친", drop:"드롭", defense:"수비", dink:"딩크", transition:"전환구역", attack:"공격 판단", partners:"파트너", partner:"파트너", "speed-up":"스피드업", patterns:"패턴", strategy:"전략", mixed:"혼합복식", tournament:"대회", scouting:"상대 분석", micro:"미세 조정", role:"영상 분석", lob:"로브", return:"리턴", middle:"미들", paddle:"패들", "video-review":"영상 리뷰" };
    var en = { rules:"Rules", serve:"Serve", positioning:"Positioning", consistency:"Consistency", "third-shot":"Third shot", kitchen:"Kitchen", drop:"Drop", defense:"Defense", dink:"Dink", transition:"Transition", attack:"Attack choice", partners:"Partners", partner:"Partner", "speed-up":"Speed-up", patterns:"Patterns", strategy:"Strategy", mixed:"Mixed doubles", tournament:"Tournament", scouting:"Scouting", micro:"Micro-adjustment", role:"Video study", lob:"Lob", return:"Return", middle:"Middle", paddle:"Paddle", "video-review":"Video review" };
    return (lang === "ko" ? ko[tag] : en[tag]) || tag;
  }

  var faqButtons = Array.prototype.slice.call(document.querySelectorAll("[data-faq-level]"));
  var faqSections = Array.prototype.slice.call(document.querySelectorAll("[data-faq-section]"));
  if (faqButtons.length && faqSections.length) {
    faqButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var level = button.getAttribute("data-faq-level") || "";
        faqButtons.forEach(function (b) { b.classList.toggle("is-active", b === button); });
        faqSections.forEach(function (section) {
          section.classList.toggle("is-hidden", !!level && section.getAttribute("data-level") !== level);
        });
      });
    });
  }

  var faqForm = document.querySelector("[data-faq-suggest]");
  var faqList = document.querySelector("[data-faq-suggestions]");
  if (faqForm && faqList) {
    var faqKey = "picklelevel.faq.suggestions";
    function readFaq() {
      try { return JSON.parse(localStorage.getItem(faqKey) || "[]") || []; } catch (e) { return []; }
    }
    function writeFaq(items) {
      try { localStorage.setItem(faqKey, JSON.stringify(items)); } catch (e) {}
    }
    function renderFaq() {
      var items = readFaq();
      faqList.innerHTML = "";
      items.slice().reverse().forEach(function (it) {
        var row = document.createElement("div");
        row.className = "local-suggestion";
        var title = document.createElement("strong");
        title.textContent = (it.level ? it.level + " · " : "") + (it.title || "FAQ suggestion");
        var body = document.createElement("span");
        body.textContent = it.body || "";
        row.appendChild(title); row.appendChild(body); faqList.appendChild(row);
      });
    }
    faqForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var items = readFaq();
      items.push({
        level: (faqForm.querySelector('[name="level"]') || {}).value || "",
        title: (faqForm.querySelector('[name="title"]') || {}).value || "",
        body: (faqForm.querySelector('[name="body"]') || {}).value || ""
      });
      writeFaq(items.slice(-20));
      faqForm.reset();
      renderFaq();
    });
    renderFaq();
  }

  var demo = document.querySelector("[data-qna-demo]");
  if (!demo) return;
  var board = demo.querySelector("[data-qna-board]");
  var form = demo.querySelector("[data-qna-form]");
  var levelSelect = demo.querySelector("[data-qna-level]");
  var seed = document.getElementById("qna-seed");
  var labels = {
    votes: demo.getAttribute("data-votes-label") || "votes",
    answers: demo.getAttribute("data-answers-label") || "Answers",
    addAnswer: demo.getAttribute("data-add-answer") || "Add answer",
    answerPlaceholder: demo.getAttribute("data-answer-placeholder") || "Add an answer",
    curated: demo.getAttribute("data-curated") || "Curated",
    suggested: demo.getAttribute("data-suggested") || "Saved locally",
    empty: demo.getAttribute("data-empty") || "No questions"
  };
  var key = "picklelevel.qna.items";
  var items = [];
  try { items = seed ? JSON.parse(seed.textContent || "[]") : []; } catch (e) { items = []; }
  try {
    var saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved)) items = items.concat(saved);
  } catch (e) {}
  function saveLocal() {
    try { localStorage.setItem(key, JSON.stringify(items.filter(function (it) { return it.local; }).slice(-30))); } catch (e) {}
  }
  function renderQna() {
    if (!board) return;
    var filter = levelSelect && levelSelect.value;
    var shown = items.filter(function (it) { return !filter || it.level === filter; })
      .sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); });
    board.innerHTML = "";
    if (!shown.length) {
      var empty = document.createElement("p"); empty.className = "notice"; empty.textContent = labels.empty; board.appendChild(empty); return;
    }
    shown.forEach(function (it) {
      var card = document.createElement("article");
      card.className = "qna-item";
      var head = document.createElement("div");
      head.className = "qna-item__head";
      var titleWrap = document.createElement("div");
      var h = document.createElement("h3"); h.textContent = txt(it.title) || "Question";
      var meta = document.createElement("div"); meta.className = "qna-item__meta";
      meta.appendChild(pill(it.level || ""));
      if (it.tag) meta.appendChild(pill(tagLabel(it.tag)));
      var status = document.createElement("span"); status.className = "qna-item__status"; status.textContent = it.local ? labels.suggested : labels.curated; meta.appendChild(status);
      titleWrap.appendChild(h); titleWrap.appendChild(meta);
      var vote = document.createElement("button");
      vote.type = "button"; vote.className = "btn btn--ghost highlight-item__vote";
      vote.textContent = "▲ " + (it.votes || 0) + " " + labels.votes;
      vote.addEventListener("click", function () { it.votes = (it.votes || 0) + 1; if (it.local) saveLocal(); renderQna(); });
      head.appendChild(titleWrap); head.appendChild(vote);
      var q = document.createElement("p"); q.className = "qna-item__question"; q.textContent = txt(it.question);
      var answersTitle = document.createElement("strong"); answersTitle.textContent = labels.answers;
      var answers = document.createElement("div"); answers.className = "qna-answers";
      (it.answers || []).forEach(function (ans) {
        var row = document.createElement("div"); row.className = "qna-answer";
        var by = document.createElement("p"); by.className = "qna-answer__by"; by.textContent = (ans.name || "Player") + (ans.votes ? " · ▲ " + ans.votes : "");
        var p = document.createElement("p"); p.textContent = txt(ans.body);
        row.appendChild(by); row.appendChild(p); answers.appendChild(row);
      });
      var add = document.createElement("form"); add.className = "qna-add-answer";
      var ta = document.createElement("textarea"); ta.rows = 2; ta.placeholder = labels.answerPlaceholder;
      var addBtn = document.createElement("button"); addBtn.className = "btn btn--ghost"; addBtn.type = "submit"; addBtn.textContent = labels.addAnswer;
      add.appendChild(ta); add.appendChild(addBtn);
      add.addEventListener("submit", function (e) {
        e.preventDefault();
        var body = ta.value.trim();
        if (!body) return;
        it.answers = it.answers || [];
        it.answers.push({ name: lang === "ko" ? "내 답변" : "My answer", votes: 1, body: body });
        it.local = true;
        saveLocal();
        renderQna();
      });
      card.appendChild(head); card.appendChild(q); card.appendChild(answersTitle); card.appendChild(answers); card.appendChild(add);
      board.appendChild(card);
    });
  }
  if (levelSelect) levelSelect.addEventListener("change", renderQna);
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var titleEl = form.querySelector('[name="title"]');
      var levelEl = form.querySelector('[name="level"]');
      var tagEl = form.querySelector('[name="tag"]');
      var questionEl = form.querySelector('[name="question"]');
      items.push({
        id: "local-" + Date.now(),
        title: (titleEl && titleEl.value) || "Question",
        level: (levelEl && levelEl.value) || "3.0",
        tag: (tagEl && tagEl.value) || "question",
        question: (questionEl && questionEl.value) || "",
        votes: 1,
        answers: [],
        local: true
      });
      saveLocal();
      form.reset();
      renderQna();
    });
  }
  renderQna();
})();

/* ---- paddle likes + local reviews demo (AdSense-safe: local browser only) ---- */
(function () {
  "use strict";
  var widgets = Array.prototype.slice.call(document.querySelectorAll("[data-paddle-engagement]"));
  if (!widgets.length) return;
  widgets.forEach(function (box) {
    var slug = box.getAttribute("data-paddle-slug") || "unknown";
    var key = "picklelevel.paddle." + slug;
    var btn = box.querySelector("[data-paddle-like]");
    var count = box.querySelector("[data-paddle-like-count]");
    var form = box.querySelector("[data-paddle-review-form]");
    var list = box.querySelector("[data-paddle-review-list]");
    var state = { likes: 0, liked: false, reviews: [] };
    try {
      var saved = JSON.parse(localStorage.getItem(key) || "{}");
      if (saved && typeof saved === "object") state = Object.assign(state, saved);
    } catch (e) {}
    function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {} }
    function render() {
      if (count) count.textContent = String(state.likes || 0);
      if (btn) btn.classList.toggle("is-liked", !!state.liked);
      if (list) {
        list.innerHTML = "";
        (state.reviews || []).slice().reverse().forEach(function (r) {
          var card = document.createElement("article");
          card.className = "local-review";
          var h = document.createElement("strong");
          h.textContent = r.name || "PicklePlayer";
          var p = document.createElement("p");
          p.textContent = r.text || "";
          card.appendChild(h); card.appendChild(p); list.appendChild(card);
        });
      }
    }
    if (btn) btn.addEventListener("click", function () {
      if (!state.liked) { state.likes = (state.likes || 0) + 1; state.liked = true; }
      else { state.likes = Math.max(0, (state.likes || 0) - 1); state.liked = false; }
      save(); render();
    });
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector('[name="name"]') || {}).value || "PicklePlayer";
      var text = (form.querySelector('[name="text"]') || {}).value || "";
      text = text.trim();
      if (!text) return;
      state.reviews = state.reviews || [];
      state.reviews.push({ name: String(name).slice(0, 40), text: text.slice(0, 700), at: new Date().toISOString() });
      save(); form.reset(); render();
    });
    render();
  });
})();

/* ---- DUPR pathway milestones: click a level marker -> popup with key info ---- */
(function () {
  "use strict";
  var markers = document.querySelectorAll("[data-ms]");
  if (!markers.length) return;
  var pop = document.createElement("div");
  pop.className = "ms-pop";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-modal", "false");
  pop.hidden = true;
  pop.innerHTML =
    '<button type="button" class="ms-pop__close" aria-label="Close">\u00d7</button>' +
    '<p class="ms-pop__eyebrow" data-ms-eyebrow></p>' +
    '<h3 class="ms-pop__title" data-ms-title></h3>' +
    '<p class="ms-pop__summary" data-ms-summary></p>' +
    '<ul class="ms-pop__focus" data-ms-focus></ul>' +
    '<a class="btn btn--primary ms-pop__cta" data-ms-cta href="#"></a>';
  document.body.appendChild(pop);
  var elTitle = pop.querySelector("[data-ms-title]");
  var elSum = pop.querySelector("[data-ms-summary]");
  var elFocus = pop.querySelector("[data-ms-focus]");
  var elCta = pop.querySelector("[data-ms-cta]");
  var elEye = pop.querySelector("[data-ms-eyebrow]");
  var current = null;

  function close() { pop.hidden = true; if (current) current.setAttribute("aria-expanded", "false"); current = null; }
  function open(btn) {
    elEye.textContent = "DUPR " + (btn.getAttribute("data-ms-id") || "");
    elTitle.textContent = btn.getAttribute("data-ms-title") || "";
    elSum.textContent = btn.getAttribute("data-ms-summary") || "";
    var focus = (btn.getAttribute("data-ms-focus") || "").split("||").filter(Boolean);
    elFocus.innerHTML = "";
    focus.forEach(function (f) { var li = document.createElement("li"); li.textContent = f; elFocus.appendChild(li); });
    elCta.textContent = btn.getAttribute("data-ms-cta") || "Open";
    elCta.href = btn.getAttribute("data-ms-href") || "#";
    pop.className = "ms-pop ms-pop--" + (btn.className.match(/rail__ms--m\d/) ? btn.className.match(/rail__ms--(m\d)/)[1] : "m0");
    // position near the marker
    var r = btn.getBoundingClientRect();
    pop.hidden = false;
    var pr = pop.getBoundingClientRect();
    var top = window.scrollY + r.bottom + 12;
    var left = window.scrollX + r.left + r.width / 2 - pr.width / 2;
    left = Math.max(10, Math.min(left, window.scrollX + document.documentElement.clientWidth - pr.width - 10));
    pop.style.top = top + "px";
    pop.style.left = left + "px";
    current = btn; btn.setAttribute("aria-expanded", "true");
  }
  markers.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (current === btn) { close(); return; }
      open(btn);
    });
  });
  pop.querySelector(".ms-pop__close").addEventListener("click", close);
  document.addEventListener("click", function (e) { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest("[data-ms]")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  window.addEventListener("resize", close);
})();

/* ---- DUPR self-check quiz engine (adaptive, 10-of-30, court-based) ---- */
(function () {
  "use strict";
  var root = document.querySelector("[data-dupr-quiz]");
  var dataEl = document.getElementById("dupr-quiz-data");
  if (!root || !dataEl) return;
  var D;
  try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var ko = document.documentElement.lang === "ko";
  var SVGNS = "http://www.w3.org/2000/svg";
  var TOTAL = D.total || 10;

  var resultBox = document.querySelector("[data-q-result]");
  var choiceBox = document.querySelector("[data-q-choice]");
  var seeBtn = choiceBox ? choiceBox.querySelector("[data-q-see]") : null;
  var moreBtn = choiceBox ? choiceBox.querySelector("[data-q-more]") : null;
  var markers = root.querySelector("[data-markers]");
  var zoneEls = root.querySelectorAll(".court-zone");
  var shotBtns = root.querySelectorAll('[data-opts="shot"] .opt');
  var powerBtns = root.querySelectorAll('[data-opts="power"] .opt');
  var playerBtns = root.querySelectorAll('[data-opts="player"] .opt');
  var playerGroup = root.querySelector("[data-player-group]");
  var zoneLabel = root.querySelector("[data-zone-label]");
  var courtFlat = root.querySelector(".court-flat");
  var courtIso = root.querySelector(".court-iso");
  var courtToggle = root.querySelector("[data-court-toggle]");
  var courtMode = (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) ? "flat" : "iso";
  var nextBtn = root.querySelector("[data-q-next]");
  var backBtn = root.querySelector("[data-q-back]");
  var promptEl = root.querySelector("[data-q-prompt]");
  var youposEl = root.querySelector("[data-q-youpos]");
  var incomingEl = root.querySelector("[data-q-incoming]");
  var powerChip = root.querySelector("[data-q-power]");
  var numEl = root.querySelector("[data-q-num]");
  var totEl = root.querySelector("[data-q-total]");
  var fillEl = root.querySelector("[data-q-fill]");
  if (totEl) totEl.textContent = TOTAL;

  // ---- build difficulty pools (shuffled per attempt) ----
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var pools, used, served, answers, pos, curDiff, anim, extended;

  function buildPools() {
    pools = { 1: [], 2: [], 3: [] };
    shuffle(D.scenarios).forEach(function (s) { var d = s.diff || 2; (pools[d] || pools[2]).push(s); });
  }
  function pickNext(diff) {
    var order = diff === 1 ? [1, 2, 3] : diff === 3 ? [3, 2, 1] : [2, 1, 3];
    for (var i = 0; i < order.length; i++) {
      var p = pools[order[i]];
      for (var k = 0; k < p.length; k++) { if (!used[p[k].id]) { used[p[k].id] = true; return p[k]; } }
    }
    return null;
  }

  function reset() {
    buildPools(); used = {}; served = []; answers = []; pos = 0; curDiff = 2; extended = false; TOTAL = D.total || 10; if (totEl) totEl.textContent = TOTAL; if (choiceBox) choiceBox.hidden = true;
    var first = pickNext(2); if (first) { served.push(first); answers.push({ shot: null, power: null, zone: null, player: null }); }
    resultBox.hidden = true; resultBox.innerHTML = ""; root.hidden = false;
  }

  // ---- labels ----
  function shotLabel(id) { for (var i = 0; i < D.shots.length; i++) if (D.shots[i][0] === id) return ko ? D.shots[i][2] : D.shots[i][1]; return id || "—"; }
  function powerLabel(id) { for (var i = 0; i < D.powers.length; i++) if (D.powers[i][0] === id) return ko ? D.powers[i][2] : D.powers[i][1]; return id || "—"; }
  function zoneText(id) { return D.zones[id] ? (ko ? D.zones[id][1] : D.zones[id][0]) : (id || "—"); }

  // ---- drawing ----
  function dot(x, y, cls) { var c = document.createElementNS(SVGNS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 11); c.setAttribute("class", cls); return c; }
  function numBadge(x, y, n) { var t = document.createElementNS(SVGNS, "text"); t.setAttribute("x", x); t.setAttribute("y", y + 4); t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "court-dot-num"); t.textContent = n; return t; }
  function denom(s) { return s && s.player ? 12 : 9; }
  function playerName(pk) { return pk === "p1" ? D.labels.player1 : pk === "p2" ? D.labels.player2 : "—"; }
  function powerWidth(p) { return p === "hard" ? 5 : p === "medium" ? 3.4 : 2.2; }
  function powerDur(p) { return p === "hard" ? 620 : p === "medium" ? 1000 : 1500; }
  function playerMove(p, isOpp) {
    if (p.mv) return p.mv;
    var dx = (150 - p.x) * 0.22;
    if (!isOpp && p.y > 320) return [dx, -42];
    if (isOpp && p.y < 150) return [dx, 42];
    return null;
  }
  function moveArrow(parent, x, y, dx, dy) {
    var ex = x + dx, ey = y + dy;
    var ln = document.createElementNS(SVGNS, "line");
    ln.setAttribute("x1", x); ln.setAttribute("y1", y); ln.setAttribute("x2", ex); ln.setAttribute("y2", ey);
    ln.setAttribute("class", "court-move");
    parent.appendChild(ln);
    var ang = Math.atan2(dy, dx), h = 7;
    var hd = document.createElementNS(SVGNS, "polygon");
    hd.setAttribute("points", ex + "," + ey + " " +
      (ex - h * Math.cos(ang - 0.45)) + "," + (ey - h * Math.sin(ang - 0.45)) + " " +
      (ex - h * Math.cos(ang + 0.45)) + "," + (ey - h * Math.sin(ang + 0.45)));
    hd.setAttribute("class", "court-move-head");
    parent.appendChild(hd);
  }

  function isoXY(x, y) { var u = (x - 18) / 264, v = (436 - y) / 416; return [44 + 188 * u + 38 * v, 408 - 312 * v]; }
  function svgEl(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function isoPoly(corners) { return corners.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  var SPEED_COLOR = { soft: "#2f7dd1", medium: "#F4B400", hard: "#e0552e" };
  var SPEED_LIFT = { soft: 78, medium: 50, hard: 26 };
  var ISO_ZONES = [["dL", 20, 22, 80, 50], ["dM", 100, 22, 100, 50], ["dR", 200, 22, 80, 50], ["mL", 20, 73, 80, 50], ["mM", 100, 73, 100, 50], ["mR", 200, 73, 80, 50], ["nL", 20, 124, 80, 50], ["nM", 100, 124, 100, 50], ["nR", 200, 124, 80, 50], ["kL", 20, 176, 80, 50], ["kM", 100, 176, 100, 50], ["kR", 200, 176, 80, 50]];
  function buildIsoCourt() {
    if (!courtIso || courtIso.childNodes.length) return;
    var NL = isoXY(18, 436), NR = isoXY(282, 436), FR = isoXY(282, 20), FL = isoXY(18, 20);
    courtIso.appendChild(svgEl("polygon", { points: isoPoly([NL, NR, FR, FL]), fill: "#eaf3ef", stroke: "#1E6F5C", "stroke-width": 2.5 }));
    function band(y0, y1) { return isoPoly([isoXY(18, y0), isoXY(282, y0), isoXY(282, y1), isoXY(18, y1)]); }
    courtIso.appendChild(svgEl("polygon", { points: band(228, 280), fill: "#fbe9b0", opacity: 0.55 }));
    courtIso.appendChild(svgEl("polygon", { points: band(176, 228), fill: "#fbe9b0", opacity: 0.55 }));
    ISO_ZONES.forEach(function (z) {
      courtIso.appendChild(svgEl("polygon", { points: isoPoly([isoXY(z[1], z[2]), isoXY(z[1] + z[3], z[2]), isoXY(z[1] + z[3], z[2] + z[4]), isoXY(z[1], z[2] + z[4])]), class: "court-zone", "data-zone": z[0] }));
    });
    var n0 = isoXY(18, 228), n1 = isoXY(282, 228);
    courtIso.appendChild(svgEl("line", { x1: n0[0], y1: n0[1], x2: n1[0], y2: n1[1], stroke: "#14513f", "stroke-width": 3, "stroke-dasharray": "7 5" }));
    var c0 = isoXY(150, 20), c1 = isoXY(150, 176); courtIso.appendChild(svgEl("line", { x1: c0[0], y1: c0[1], x2: c1[0], y2: c1[1], stroke: "#1E6F5C", "stroke-width": 1.2 }));
    var c2 = isoXY(150, 280), c3 = isoXY(150, 436); courtIso.appendChild(svgEl("line", { x1: c2[0], y1: c2[1], x2: c3[0], y2: c3[1], stroke: "#1E6F5C", "stroke-width": 1.2 }));
    ["soft", "medium", "hard"].forEach(function (pw, i) {
      courtIso.appendChild(svgEl("circle", { cx: 16 + i * 96, cy: 448, r: 4.5, fill: SPEED_COLOR[pw] }));
      var tx = svgEl("text", { x: 25 + i * 96, y: 451.5, "font-family": "sans-serif", "font-size": 9, fill: "#5b665f" }); tx.textContent = powerLabel(pw); courtIso.appendChild(tx);
    });
  }
  function isoToken(pt, cls, n) {
    markers.appendChild(svgEl("ellipse", { cx: pt[0], cy: pt[1] + 3, rx: 11, ry: 4, fill: "#000", opacity: 0.18 }));
    markers.appendChild(svgEl("circle", { cx: pt[0], cy: pt[1], r: 10.5, class: "court-dot " + cls }));
    if (n) { var t = svgEl("text", { x: pt[0], y: pt[1] + 4, "text-anchor": "middle", class: "court-dot-num" }); t.textContent = n; markers.appendChild(t); }
  }
  function drawSceneIso(s) {
    var ball = s.ball;
    if (ball && ball.from && ball.to) {
      var S = isoXY(ball.from.x, ball.from.y), E = isoXY(ball.to.x, ball.to.y);
      var color = SPEED_COLOR[ball.power] || SPEED_COLOR.medium, lift = SPEED_LIFT[ball.power] || 50;
      var mid = [(S[0] + E[0]) / 2, (S[1] + E[1]) / 2], C = [mid[0], mid[1] - lift];
      markers.appendChild(svgEl("line", { x1: S[0], y1: S[1], x2: E[0], y2: E[1], stroke: "#0d3a2e", "stroke-width": 1.5, "stroke-dasharray": "3 5", opacity: 0.5 }));
      markers.appendChild(svgEl("ellipse", { cx: E[0], cy: E[1], rx: 9, ry: 3.4, fill: "#0d3a2e", opacity: 0.25 }));
      markers.appendChild(svgEl("path", { d: "M" + S[0].toFixed(1) + "," + S[1].toFixed(1) + " Q" + C[0].toFixed(1) + "," + C[1].toFixed(1) + " " + E[0].toFixed(1) + "," + E[1].toFixed(1), fill: "none", stroke: color, "stroke-width": 3.4, "stroke-linecap": "round" }));
      var ang = Math.atan2(E[1] - C[1], E[0] - C[0]), aL = 12, ak = 0.5;
      markers.appendChild(svgEl("polygon", { points: E[0].toFixed(1) + "," + E[1].toFixed(1) + " " + (E[0] - aL * Math.cos(ang - ak)).toFixed(1) + "," + (E[1] - aL * Math.sin(ang - ak)).toFixed(1) + " " + (E[0] - aL * Math.cos(ang + ak)).toFixed(1) + "," + (E[1] - aL * Math.sin(ang + ak)).toFixed(1), fill: color }));
      var apex = [0.25 * S[0] + 0.5 * C[0] + 0.25 * E[0], 0.25 * S[1] + 0.5 * C[1] + 0.25 * E[1]];
      markers.appendChild(svgEl("line", { x1: apex[0], y1: apex[1], x2: mid[0], y2: mid[1], stroke: color, "stroke-width": 1.3, "stroke-dasharray": "3 4", opacity: 0.4 }));
      // animated ball travelling along the arc, with a ground shadow for depth
      var isoShadow = svgEl("ellipse", { rx: 7, ry: 2.6, fill: "#0d3a2e", opacity: 0.22 });
      markers.appendChild(isoShadow);
      var isoBall = svgEl("circle", { r: 6.5, class: "court-dot court-dot--ball" });
      markers.appendChild(isoBall);
      var durI = powerDur(ball.power), startI = null;
      (function () {
        function stepIso(ts) {
          if (startI === null) startI = ts;
          var tt = ((ts - startI) % (durI + 350)) / durI; if (tt > 1) tt = 1;
          var u = 1 - tt;
          isoBall.setAttribute("cx", u * u * S[0] + 2 * u * tt * C[0] + tt * tt * E[0]);
          isoBall.setAttribute("cy", u * u * S[1] + 2 * u * tt * C[1] + tt * tt * E[1]);
          isoShadow.setAttribute("cx", S[0] + (E[0] - S[0]) * tt);
          isoShadow.setAttribute("cy", S[1] + (E[1] - S[1]) * tt);
          anim = requestAnimationFrame(stepIso);
        }
        anim = requestAnimationFrame(stepIso);
      })();
    }
    (s.opp || []).forEach(function (p) { isoToken(isoXY(p.x, p.y), "court-dot--opp", null); });
    var youArr = s.you || [], chosenIdx = -1;
    if (s.player) { var ch = answers[pos] && answers[pos].player; chosenIdx = ch === "p1" ? 0 : ch === "p2" ? 1 : -1; }
    youArr.forEach(function (p, i) { var ip = isoXY(p.x, p.y); isoToken(ip, (i === 0 ? "court-dot--me" : "court-dot--you") + (i === chosenIdx ? " court-dot--chosen" : ""), i + 1); if (i === 0 && !s.player) { var yt = svgEl("text", { x: ip[0], y: ip[1] - 15, "text-anchor": "middle", class: "court-you-tag" }); yt.textContent = ko ? "나" : "YOU"; markers.appendChild(yt); } });
  }

  function drawScene(s) {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    while (markers.firstChild) markers.removeChild(markers.firstChild);
    if (courtMode === "iso") { drawSceneIso(s); return; }
    var ball = s.ball;
    if (ball && ball.from && ball.to) {
      var pw = powerWidth(ball.power);
      var path = document.createElementNS(SVGNS, "line");
      path.setAttribute("x1", ball.from.x); path.setAttribute("y1", ball.from.y);
      path.setAttribute("x2", ball.to.x); path.setAttribute("y2", ball.to.y);
      path.setAttribute("class", "court-ballpath court-ballpath--" + (ball.power || "medium"));
      path.setAttribute("stroke-width", pw);
      if (ball.power === "soft") path.setAttribute("stroke-dasharray", "5 5");
      markers.appendChild(path);
      // arrowhead at the landing point
      var ang = Math.atan2(ball.to.y - ball.from.y, ball.to.x - ball.from.x);
      var ah = document.createElementNS(SVGNS, "path");
      var L = 13, w = 7;
      var bx = ball.to.x, by = ball.to.y;
      var p1x = bx - L * Math.cos(ang) + w * Math.sin(ang), p1y = by - L * Math.sin(ang) - w * Math.cos(ang);
      var p2x = bx - L * Math.cos(ang) - w * Math.sin(ang), p2y = by - L * Math.sin(ang) + w * Math.cos(ang);
      ah.setAttribute("d", "M" + bx + "," + by + " L" + p1x + "," + p1y + " L" + p2x + "," + p2y + " Z");
      ah.setAttribute("class", "court-arrow court-arrow--" + (ball.power || "medium"));
      markers.appendChild(ah);
    }
    (s.opp || []).forEach(function (p) { var mv = playerMove(p, true); if (mv) moveArrow(markers, p.x, p.y, mv[0], mv[1]); markers.appendChild(dot(p.x, p.y, "court-dot court-dot--opp")); });
    var youArr = s.you || [];
    var chosenIdx = -1;
    if (s.player) { var ch = answers[pos] && answers[pos].player; chosenIdx = ch === "p1" ? 0 : ch === "p2" ? 1 : -1; }
    youArr.forEach(function (p, i) {
      var mv = playerMove(p, false); if (mv) moveArrow(markers, p.x, p.y, mv[0], mv[1]);
      var cls = "court-dot " + (i === 0 ? "court-dot--me" : "court-dot--you") + (i === chosenIdx ? " court-dot--chosen" : "");
      markers.appendChild(dot(p.x, p.y, cls));
      markers.appendChild(numBadge(p.x, p.y, i + 1));
      if (i === 0 && !s.player) { var yt = document.createElementNS(SVGNS, "text"); yt.setAttribute("x", p.x); yt.setAttribute("y", p.y - 16); yt.setAttribute("text-anchor", "middle"); yt.setAttribute("class", "court-you-tag"); yt.textContent = ko ? "나" : "YOU"; markers.appendChild(yt); }
    });
    // animated incoming ball
    if (ball && ball.from && ball.to) {
      var moving = dot(ball.from.x, ball.from.y, "court-dot court-dot--ball");
      markers.appendChild(moving);
      var dur = powerDur(ball.power), start = null;
      function step(ts) {
        if (start === null) start = ts;
        var tt = ((ts - start) % (dur + 350)) / dur;
        if (tt > 1) tt = 1;
        moving.setAttribute("cx", ball.from.x + (ball.to.x - ball.from.x) * tt);
        moving.setAttribute("cy", ball.from.y + (ball.to.y - ball.from.y) * tt);
        anim = requestAnimationFrame(step);
      }
      anim = requestAnimationFrame(step);
    }
  }

  function setPowerChip(p) {
    if (!powerChip) return;
    powerChip.className = "quiz__power-chip quiz__power-chip--" + (p || "medium");
    powerChip.textContent = powerLabel(p);
  }

  function render() {
    var s = served[pos], a = answers[pos];
    promptEl.textContent = s.prompt;
    if (youposEl) {
      youposEl.hidden = false;
      youposEl.textContent = s.player
        ? (D.labels.youArePosChoice || D.labels.youArePos || (ko ? "당신은 1번 선수입니다." : "You are Player 1."))
        : (D.labels.youArePos || (ko ? "당신은 1번 선수입니다." : "You are Player 1."));
    }
    incomingEl.textContent = s.incoming;
    setPowerChip(s.ball ? s.ball.power : null);
    numEl.textContent = pos + 1;
    if (fillEl) fillEl.style.width = (pos / TOTAL * 100) + "%";
    shotBtns.forEach(function (b) { b.classList.toggle("is-selected", a.shot === b.getAttribute("data-val")); });
    powerBtns.forEach(function (b) { b.classList.toggle("is-selected", a.power === b.getAttribute("data-val")); });
    zoneEls.forEach(function (z) { var on = a.zone === z.getAttribute("data-zone"); z.classList.toggle("is-selected", on); z.setAttribute("aria-pressed", on ? "true" : "false"); });
    if (playerGroup) playerGroup.hidden = !s.player;
    playerBtns.forEach(function (b) { b.classList.toggle("is-selected", a.player === b.getAttribute("data-val")); });
    zoneLabel.textContent = a.zone ? zoneText(a.zone) : "—";
    backBtn.hidden = pos === 0;
    var frontierDone = served.length >= TOTAL && pos === TOTAL - 1;
    nextBtn.textContent = frontierDone ? (extended ? D.labels.see : (D.labels.done10 || D.labels.see)) : D.labels.next;
    updateNext();
    drawScene(s);
  }

  function updateNext() { var s = served[pos], a = answers[pos]; var needP = !!(s && s.player); nextBtn.disabled = !(a.shot && a.power && a.zone && (!needP || a.player)); }

  buildIsoCourt();
  if (courtFlat && courtIso) {
    courtFlat.style.display = courtMode === "iso" ? "none" : "";
    courtIso.style.display = courtMode === "iso" ? "" : "none";
  }
  if (courtToggle) {
    courtToggle.setAttribute("aria-pressed", courtMode === "iso" ? "true" : "false");
    courtToggle.textContent = courtMode === "iso" ? D.labels.flatView : D.labels.isoView;
  }
  zoneEls = root.querySelectorAll(".court-zone");
  zoneEls.forEach(function (z) {
    z.setAttribute("role", "button");
    z.setAttribute("tabindex", "0");
    z.setAttribute("aria-label", (ko ? "구역 선택: " : "Select zone: ") + zoneText(z.getAttribute("data-zone")));
    if (!z.hasAttribute("aria-pressed")) z.setAttribute("aria-pressed", "false");
  });
  if (courtToggle) {
    var lastCourtToggle = 0;
    function toggleCourtView(e) {
      var now = Date.now();
      if (now - lastCourtToggle < 320) { if (e) e.preventDefault(); return; }
      lastCourtToggle = now;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      courtMode = courtMode === "iso" ? "flat" : "iso";
      var isoOn = courtMode === "iso";
      if (courtFlat) courtFlat.style.display = isoOn ? "none" : "";
      if (courtIso) courtIso.style.display = isoOn ? "" : "none";
      courtToggle.setAttribute("aria-pressed", isoOn ? "true" : "false");
      courtToggle.textContent = isoOn ? D.labels.flatView : D.labels.isoView;
      var a = answers[pos];
      zoneEls.forEach(function (z) { var on = a && a.zone === z.getAttribute("data-zone"); z.classList.toggle("is-selected", on); z.setAttribute("aria-pressed", on ? "true" : "false"); });
      drawScene(served[pos]);
    }
    courtToggle.addEventListener("click", toggleCourtView);
    courtToggle.addEventListener("touchend", toggleCourtView, { passive: false });
    courtToggle.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") toggleCourtView(e); });
  }

  shotBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].shot = b.getAttribute("data-val"); shotBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); }); updateNext(); }); });
  powerBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].power = b.getAttribute("data-val"); powerBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); }); updateNext(); }); });
  function selectZone(z) {
    var key = z.getAttribute("data-zone");
    answers[pos].zone = key;
    zoneEls.forEach(function (x) { var on = x.getAttribute("data-zone") === key; x.classList.toggle("is-selected", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
    zoneLabel.textContent = zoneText(key);
    updateNext();
  }
  zoneEls.forEach(function (z) {
    z.addEventListener("click", function () { selectZone(z); });
    z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); selectZone(z); } });
  });
  playerBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].player = b.getAttribute("data-val"); playerBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); }); drawScene(served[pos]); updateNext(); }); });

  function qScore(s, a) { return (s.shot[a.shot] || 0) + (s.power[a.power] || 0) + (s.zone[a.zone] || 0) + (s.player && a.player ? (s.player[a.player] || 0) : 0); }

  backBtn.addEventListener("click", function () { if (pos > 0) { pos--; render(); } });

  function serveNext() {
    var q = qScore(served[pos], answers[pos]) / denom(served[pos]);
    if (q >= 0.7) curDiff = Math.min(3, curDiff + 1); else if (q <= 0.34) curDiff = Math.max(1, curDiff - 1);
    var nx = pickNext(curDiff);
    if (nx) { served.push(nx); answers.push({ shot: null, power: null, zone: null, player: null }); pos++; render(); return true; }
    return false;
  }
  function showChoice() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    root.hidden = true;
    if (choiceBox) { choiceBox.hidden = false; choiceBox.scrollIntoView({ behavior: "smooth", block: "start" }); } else { showResult(); }
  }
  if (seeBtn) seeBtn.addEventListener("click", function () { if (choiceBox) choiceBox.hidden = true; showResult(); });
  if (moreBtn) moreBtn.addEventListener("click", function () {
    extended = true; TOTAL = (D.total || 10) + 10; if (totEl) totEl.textContent = TOTAL;
    if (choiceBox) choiceBox.hidden = true; root.hidden = false;
    if (!serveNext()) showResult();
  });
  nextBtn.addEventListener("click", function () {
    var a = answers[pos]; if (!(a.shot && a.power && a.zone)) return;
    if (pos < served.length - 1) { pos++; render(); return; }      // move forward through already-served
    if (served.length < TOTAL) { if (serveNext()) return; }        // frontier: pick the next question adaptively
    if (!extended) showChoice(); else showResult();                // 10-question milestone choice, else final result
  });

  function bestKey(map) { var best = null, bv = -1; for (var k in map) if (map[k] > bv) { bv = map[k]; best = k; } return best; }

  var HKEY = "picklary.dupr.history";
  function loadHist() { try { var v = JSON.parse(localStorage.getItem(HKEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function saveHist(list) { try { localStorage.setItem(HKEY, JSON.stringify(list.slice(-20))); } catch (e) {} }
  function renderHistory() {
    var box = document.querySelector("[data-quiz-history]");
    if (!box) return;
    var list = loadHist();
    if (!list.length) { box.hidden = true; box.innerHTML = ""; return; }
    var Lb = D.labels, lang = document.documentElement.lang === "ko" ? "ko-KR" : "en-US";
    var recent = list.slice().reverse();
    var rows = recent.map(function (e, idx) {
      var prev = recent[idx + 1], delta = prev ? (e.d - prev.d) : null;
      var arrow = delta == null ? "" : delta > 0.005 ? "▲ +" + delta.toFixed(2) : delta < -0.005 ? "▼ " + delta.toFixed(2) : "–";
      var cls = delta == null ? "" : delta > 0.005 ? " is-up" : delta < -0.005 ? " is-down" : "";
      var dstr = new Date(e.t).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
      var pct = Math.max(2, Math.min(100, ((e.d - 2.0) / 3.5) * 100));
      return '<li class="qh__row">' +
        '<span class="qh__date">' + esc(dstr) + '</span>' +
        '<span class="qh__bar"><span class="qh__bar-fill" style="width:' + pct.toFixed(0) + '%"></span></span>' +
        '<span class="qh__val">' + e.d.toFixed(2) + '</span>' +
        '<span class="qh__delta' + cls + '">' + esc(arrow) + '</span></li>';
    }).join("");
    box.innerHTML =
      '<h3 class="qh__title">' + esc(Lb.histTitle) + '</h3>' +
      '<p class="qh__intro">' + esc(Lb.histIntro) + '</p>' +
      '<ul class="qh__list">' + rows + '</ul>' +
      '<div class="qh__foot"><button type="button" class="btn btn--ghost qh__clear" data-hist-clear>' + esc(Lb.histClear) + '</button>' +
      '<span class="qh__note">' + esc(Lb.histNote) + '</span></div>';
    box.hidden = false;
    var clr = box.querySelector("[data-hist-clear]");
    if (clr) clr.addEventListener("click", function () { if (window.confirm(Lb.histConfirm)) { try { localStorage.removeItem(HKEY); } catch (e) {} renderHistory(); } });
  }

  function showResult() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    var sumW = 0, sumD = 0, rawScore = 0, maxScore = 0, dSum = 0;
    served.forEach(function (s, i) { var sc = qScore(s, answers[i]); rawScore += sc; maxScore += denom(s); var q = sc / denom(s), d = s.diff || 2; sumW += q * d; sumD += d; dSum += d; });
    var perf = sumD ? sumW / sumD : 0;
    var avgDiff = served.length ? dSum / served.length : 2;
    var dupr = 2.0 + 3.0 * perf + (avgDiff - 2) * 0.25;
    if (dupr < 2.0) dupr = 2.0; if (dupr > 5.49) dupr = 5.49;
    var duprStr = dupr.toFixed(2);
    var band = D.bands[D.bands.length - 1];
    for (var i = 0; i < D.bands.length; i++) { if (dupr < D.bands[i].max) { band = D.bands[i]; break; } }
    var L = D.labels, lang = document.documentElement.lang;
    var rows = served.map(function (s, i) {
      var a = answers[i], sc = qScore(s, a);
      var bs = bestKey(s.shot), bp = bestKey(s.power), bz = bestKey(s.zone);
      var yp = s.player ? esc(playerName(a.player)) + ' · ' : '';
      var bpl = s.player ? esc(playerName(bestKey(s.player))) + ' · ' : '';
      return '<li class="qr">' +
        '<p class="qr__q">' + (i + 1) + '. ' + esc(s.prompt) + ' <span class="qr__pts">+' + sc + '/' + denom(s) + '</span></p>' +
        '<p class="qr__line"><strong>' + esc(L.yours) + ':</strong> ' + yp + esc(shotLabel(a.shot)) + ' · ' + esc(powerLabel(a.power)) + ' · ' + esc(zoneText(a.zone)) + '</p>' +
        '<button type="button" class="qr__reveal" data-reveal>' + esc(L.showAnswer) + '</button>' +
        '<div class="qr__answer" hidden>' +
        '<p class="qr__line qr__best"><strong>' + esc(L.best) + ':</strong> ' + bpl + esc(shotLabel(bs)) + ' · ' + esc(powerLabel(bp)) + ' · ' + esc(zoneText(bz)) + '</p>' +
        '<p class="qr__why">' + esc(s.explain) + '</p></div>' +
        '</li>';
    }).join("");
    var markerPct = Math.max(0, Math.min(100, ((dupr - 2.0) / 5.0) * 100));
    var bandNameMap = {
      "2-0": ko ? "New Player" : "New Player",
      "2-5": ko ? "Consistency Builder" : "Consistency Builder",
      "3-0": ko ? "Rally Player" : "Rally Player",
      "3-5": ko ? "Pattern Player" : "Pattern Player",
      "4-0": ko ? "Advanced" : "Advanced"
    };
    var bandName = bandNameMap[band.slug] || (ko ? "Advanced" : "Advanced");
    var scaleTicks = ["2.0", "3.0", "4.0", "5.0", "6.0", "7.0"].map(function (v) {
      return '<span class="dupr-result__tick"><i></i><b>' + v + '</b></span>';
    }).join("");
    resultBox.innerHTML =
      '<div class="result-card result-card--dupr-app">' +
      '<div class="dupr-result-phone" aria-label="' + esc(L.est) + '">' +
      '<div class="dupr-result-phone__top"><span>9:41</span><span class="dupr-result-phone__status">▮▮▮ ᯤ ▱</span></div>' +
      '<div class="dupr-result-phone__head"><span>DUPR Self-Check</span><span aria-hidden="true">☰</span></div>' +
      '<div class="dupr-result-card">' +
      '<p class="dupr-result-card__kicker">My DUPR</p>' +
      '<h2 class="dupr-result-card__score">' + duprStr + '</h2>' +
      '<div class="dupr-result-card__seal" aria-hidden="true">✓</div>' +
      '<p class="dupr-result-card__band">' + esc(bandName) + '</p>' +
      '<div class="dupr-result__scale" style="--dupr-pos:' + markerPct.toFixed(1) + '%">' +
      '<div class="dupr-result__bar"><span class="dupr-result__marker"></span></div>' +
      '<div class="dupr-result__ticks">' + scaleTicks + '</div>' +
      '</div>' +
      '<p class="dupr-result-card__tag"><span aria-hidden="true">★</span>' + (ko ? '나의 판단 습관 기반 추정치' : 'Based on your shot-decision habits') + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="dupr-result-summary">' +
      '<p class="result-card__eyebrow">' + esc(L.est) + '</p>' +
      '<h3>' + esc(band.desc) + '</h3>' +
      '<p class="result-card__score">' + esc(L.score) + ': ' + rawScore + ' / ' + maxScore + '</p>' +
      '<div class="result-card__actions">' +
      '<a class="btn btn--primary" href="/' + lang + '/level/' + band.slug + '/">' + esc(L.guide) + ' →</a> ' +
      '<a class="btn btn--ghost" href="/' + lang + '/what-is-dupr/">' + (ko ? "DUPR이란?" : "What is DUPR?") + '</a> ' +
      '<button type="button" class="btn btn--ghost" data-q-retake>' + esc(L.retake) + '</button>' +
      '</div>' +
      '<p class="notice">' + (ko ? "이 추정치는 의사결정 자가진단 결과이며 공식 DUPR이 아닙니다. 실제 DUPR은 dupr.com에서 경기 기록으로 산출됩니다." : "This estimate is a decision-making self-assessment, not an official DUPR rating. Real DUPR is calculated from match results at dupr.com.") + '</p>' +
      '</div>' +
      '<h3 class="result-card__review">' + esc(L.reviewTitle) + '</h3>' +
      '<ul class="qr-list">' + rows + '</ul>' +
      '</div>';
    root.hidden = true; resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    resultBox.querySelectorAll("[data-reveal]").forEach(function (btn) {
      btn.addEventListener("click", function () { var ans = btn.nextElementSibling; if (ans) { ans.hidden = !ans.hidden; btn.classList.toggle("is-open", !ans.hidden); btn.textContent = ans.hidden ? L.showAnswer : (ko ? "정답 숨기기" : "Hide"); } });
    });
    var retake = resultBox.querySelector("[data-q-retake]");
    if (retake) retake.addEventListener("click", function () { reset(); render(); renderHistory(); root.scrollIntoView({ behavior: "smooth", block: "start" }); });
    try { var hl = loadHist(); hl.push({ t: Date.now(), d: Math.round(dupr * 100) / 100, s: rawScore, m: maxScore }); saveHist(hl); } catch (e) {}
    renderHistory();
  }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  reset();
  render();
  renderHistory();
})();

(function () {
  "use strict";

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"); }
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; } }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function extraDetails(it) {
    var extras = it.extra || {};
    var labels = { venue:"Venue", eventDate:"Date", deadline:"Deadline", division:"Division", format:"Format", fee:"Fee", officialUrl:"Link", targetEvent:"Target", style:"Style", desiredPartner:"Desired partner", experience:"Experience", goal:"Goal" };
    var html = Object.keys(labels).map(function (k) {
      var v = extras[k];
      if (!v) return "";
      if (k === "officialUrl") return '<li><strong>' + esc(labels[k]) + ':</strong> ' + esc(v).slice(0, 120) + '</li>';
      return '<li><strong>' + esc(labels[k]) + ':</strong> ' + esc(v) + '</li>';
    }).join("");
    return html ? '<ul class="qr-list community-details">' + html + '</ul>' : "";
  }
  function renderCommunitySaved(it, filterable) {
    var travel = (it.home || it.window) ? '<p class="qna-item__answer">' + esc([it.home, it.window].filter(Boolean).join(' · ')) + '</p>' : '';
    var attrs = filterable ? ' data-community-card data-type="' + esc(it.type) + '" data-country="' + esc(it.country) + '" data-city="' + esc(it.city) + '" data-zip="' + esc(it.zip) + '" data-level="' + esc(it.level) + '" data-focus="' + esc(it.focus) + '"' : '';
    return '<article class="qna-item community-entry"' + attrs + '>' +
      '<div class="qna-item__head"><div><h3>' + esc(it.name) + '</h3><div class="qna-item__meta"><span class="pill">' + esc(it.type) + '</span><span class="pill">' + esc(it.city) + ' ' + esc(it.zip) + '</span><span class="pill">' + esc(it.level) + '</span><span class="pill">' + esc(it.focus) + '</span></div></div><span class="qna-item__status">Saved</span></div>' +
      '<p class="qna-item__question">' + esc(it.note) + '</p>' + travel + extraDetails(it) + '</article>';
  }

  document.querySelectorAll("[data-community-directory]").forEach(function (root) {
    var controls = root.querySelector("[data-community-filter]");
    var list = root.querySelector("[data-community-list]");
    var localList = root.querySelector("[data-community-local-list]");
    var noMatch = root.getAttribute("data-no-match") || "No matching entries.";
    if (!controls || !list) return;
    var type = controls.querySelector("[data-filter-type]");
    var query = controls.querySelector("[data-filter-query]");
    var level = controls.querySelector("[data-filter-level]");
    var focus = controls.querySelector("[data-filter-focus]");

    function cardText(card) {
      return [card.getAttribute("data-country"), card.getAttribute("data-city"), card.getAttribute("data-zip"), card.textContent].join(" ").toLowerCase();
    }
    function matches(card) {
      var tv = type && type.value;
      var qv = query && query.value.trim().toLowerCase();
      var lv = level && level.value;
      var fv = focus && focus.value;
      if (tv && card.getAttribute("data-type") !== tv) return false;
      if (lv && card.getAttribute("data-level").indexOf(lv) < 0 && card.getAttribute("data-level") !== "All") return false;
      if (fv && card.getAttribute("data-focus") !== fv) return false;
      if (qv && cardText(card).indexOf(qv) < 0) return false;
      return true;
    }
    function apply() {
      var cards = list.querySelectorAll("[data-community-card]");
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible++;
      });
      var empty = list.querySelector("[data-community-empty]");
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "community-empty";
        empty.setAttribute("data-community-empty", "");
        empty.textContent = noMatch;
        list.appendChild(empty);
      }
      empty.hidden = visible !== 0;
    }
    [type, query, level, focus].forEach(function (el) { if (el) el.addEventListener(el.tagName === "INPUT" ? "input" : "change", apply); });
    apply();

    function renderLocal() {
      if (!localList) return;
      var key = "picklary.community." + (document.documentElement.lang || "en") + "." + (root.closest("main") ? location.pathname : "all");
      var items = read(key);
      localList.innerHTML = items.map(function (it) { return renderCommunitySaved(it, true); }).join("");
    }
    renderLocal();
  });

  document.querySelectorAll("[data-community-submit]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var key = "picklary.community." + (document.documentElement.lang || "en") + "." + location.pathname;
      var fd = new FormData(form);
      var items = read(key);
      var baseFields = { name:1, country:1, city:1, zip:1, level:1, focus:1, note:1, home:1, window:1, contact:1 };
      var extra = {};
      fd.forEach(function (value, keyName) { if (!baseFields[keyName] && value) extra[keyName] = String(value).slice(0, 240); });
      items.unshift({
        type: form.getAttribute("data-type") || "request",
        name: fd.get("name") || "Local request",
        country: fd.get("country") || "",
        city: fd.get("city") || "",
        zip: fd.get("zip") || "",
        level: fd.get("level") || "",
        focus: fd.get("focus") || "",
        note: fd.get("note") || "",
        home: fd.get("home") || "",
        window: fd.get("window") || "",
        extra: extra
      });
      write(key, items.slice(0, 8));
      var status = form.querySelector("[data-community-submit-status]");
      var lang = document.documentElement.lang || "en";
      var ko = lang.indexOf("ko") === 0;
      var formName = form.getAttribute("name") || fd.get("form-name") || "picklary-community";
      fd.set("form-name", formName);
      if (status) { status.hidden = false; status.textContent = ko ? "미리보기를 저장하고 제출을 처리 중입니다." : "Preview saved. Submitting for review..."; }
      try {
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(fd).toString()
        }).then(function () {
          if (status) status.textContent = ko ? "제출되었습니다. 공개 반영은 운영자 검수 후 진행됩니다." : "Submitted. Public listing requires editor review.";
        }).catch(function () {
          if (status) status.textContent = ko ? "브라우저 미리보기는 저장되었습니다. 온라인 제출은 배포 환경에서 다시 시도됩니다." : "Browser preview saved. Online submission will work in the deployed site.";
        });
      } catch (err) {
        if (status) status.textContent = ko ? "브라우저 미리보기는 저장되었습니다." : "Browser preview saved.";
      }
      var root = document.querySelector("[data-community-directory]");
      var localList = root && root.querySelector("[data-community-local-list]");
      if (localList) {
        localList.innerHTML = read(key).map(function (it) { return renderCommunitySaved(it, false); }).join("");
      }
      form.reset();
    });
  });

  var skill = document.querySelector("[data-skill-review-demo]");
  if (skill) {
    var reqForm = skill.querySelector("[data-video-request-form]");
    var reviewForm = skill.querySelector("[data-review-form]");
    var list = skill.querySelector("[data-review-list]");
    var val = skill.querySelector("[data-estimate-value]");
    var meta = skill.querySelector("[data-estimate-meta]");
    var preview = skill.querySelector("[data-criteria-preview]");
    var lang = document.documentElement.lang || "en";
    var ko = lang.indexOf("ko") === 0;
    var RKEY = "picklary.skillreview.reviews." + lang;
    var VKEY = "picklary.skillreview.request." + lang;
    var requestPanel = skill.querySelector("[data-skill-request-panel]");
    var requestOpen = skill.querySelector("[data-open-skill-request]");
    var requestClose = skill.querySelector("[data-close-skill-request]");
    var requestStatus = skill.querySelector("[data-skill-request-status]");
    var requestLocalList = skill.querySelector("[data-skill-local-list]");
    var weights = { general: 1.0, email: 1.1, dupr: 1.25, coach: 1.6 };
    var feedbackLabels = {
      helpful: ko ? "도움됨" : "Helpful",
      agree: ko ? "동의" : "Agree",
      needsReview: ko ? "재검토" : "Needs review"
    };

    function labelType(t) {
      return t === "dupr" ? "DUPR-linked" : t === "coach" ? "Coach/editor" : t === "email" ? "Email-checked" : "General";
    }
    function renderSkillRequestSaved(r) {
      return '<article class="skill-request-card skill-request-card--local"><div class="skill-request-card__top"><span class="pill">' + esc(ko ? "내 미리보기" : "My preview") + '</span><span class="skill-request-status">' + esc(ko ? "검수 대기" : "Pending review") + '</span></div><h3>' + esc(r.focus || (ko ? "스킬 리뷰 요청" : "Skill review request")) + '</h3><div class="skill-request-card__meta"><span>' + esc(r.level || "") + '</span>' + (r.city ? '<span>' + esc(r.city) + '</span>' : '') + '<span>' + esc(ko ? "방금 저장" : "saved locally") + '</span></div><p class="skill-request-card__focus">' + esc(r.url || "") + '</p><p>' + esc(r.note || "") + '</p></article>';
    }
    function renderSkillRequests() {
      if (!requestLocalList) return;
      requestLocalList.innerHTML = read(VKEY).map(renderSkillRequestSaved).join("");
    }
    function setRequestPanel(open) {
      if (!requestPanel) return;
      requestPanel.hidden = !open;
      if (requestOpen) requestOpen.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = requestPanel.querySelector("input, select, textarea, button");
        if (first && first.focus) setTimeout(function () { first.focus(); }, 30);
      }
    }
    if (requestOpen) requestOpen.addEventListener("click", function () { setRequestPanel(!requestPanel || requestPanel.hidden); });
    if (requestClose) requestClose.addEventListener("click", function () { setRequestPanel(false); });
    function clampRating(n) { return Math.max(2, Math.min(5.5, Number(n || 0))); }
    function criteriaInputs() { return Array.prototype.slice.call(skill.querySelectorAll("[data-criterion-input]")); }
    function calculateCriteriaScore(scope) {
      var inputs = Array.prototype.slice.call((scope || reviewForm).querySelectorAll("[data-criterion-input]"));
      var tw = 0, total = 0, detail = {};
      inputs.forEach(function (input) {
        var name = String(input.name || "crit").replace(/^crit_/, "");
        var w = Number(input.getAttribute("data-weight") || 1);
        var n = clampRating(input.value);
        tw += w;
        total += n * w;
        detail[name] = n;
      });
      return { estimate: tw ? total / tw : 0, detail: detail };
    }
    function updatePreview() {
      if (!preview || !reviewForm) return;
      var result = calculateCriteriaScore(reviewForm);
      preview.textContent = (ko ? "기준별 점수로 자동 계산" : "Automatically calculated from criteria") + ": " + result.estimate.toFixed(2);
    }
    function feedbackTotals(rows) {
      var out = { helpful: 0, agree: 0, needsReview: 0 };
      rows.forEach(function (r) {
        var fb = r.feedback || {};
        out.helpful += Number(fb.helpful || 0);
        out.agree += Number(fb.agree || 0);
        out.needsReview += Number(fb.needsReview || 0);
      });
      return out;
    }
    function estimateOf(r) {
      if (r && typeof r.estimate !== "undefined") return Number(r.estimate);
      if (r && r.criteria) {
        var keys = Object.keys(r.criteria), total = 0;
        keys.forEach(function (k) { total += Number(r.criteria[k] || 0); });
        return keys.length ? total / keys.length : 0;
      }
      return 0;
    }
    function renderReviews() {
      var rows = read(RKEY);
      var totalW = 0, total = 0, dupr = 0;
      rows.forEach(function (r) {
        var w = weights[r.reviewer] || 1;
        var n = estimateOf(r);
        if (!n) return;
        totalW += w;
        total += w * n;
        if (r.reviewer === "dupr") dupr++;
      });
      if (rows.length && val && meta && totalW) {
        var avg = total / totalW;
        var fb = feedbackTotals(rows);
        var cross = fb.helpful + fb.agree + fb.needsReview;
        var confidence = rows.length >= 8 && dupr >= 2 && cross >= 4 ? "High" : rows.length >= 4 || cross >= 2 ? "Medium" : "Low";
        val.textContent = avg.toFixed(2);
        meta.textContent = confidence + " confidence · " + rows.length + " reviews · " + dupr + " DUPR-linked · " + cross + " cross-checks";
      } else if (val && meta) {
        val.textContent = "—";
      }
      if (list) {
        list.innerHTML = rows.map(function (r) {
          var n = estimateOf(r);
          var fb = r.feedback || {};
          var criteria = r.criteria || {};
          var critText = Object.keys(criteria).slice(0, 8).map(function (k) { return k + " " + Number(criteria[k]).toFixed(1); }).join(" · ");
          return '<article class="qna-item" data-review-id="' + esc(r.id || "") + '"><div class="qna-item__head"><div><h3>' + esc(n ? n.toFixed(2) : "—") + '</h3><div class="qna-item__meta"><span class="pill">' + esc(labelType(r.reviewer)) + '</span><span class="pill">w ' + esc(weights[r.reviewer] || 1) + '</span><span class="pill">criteria</span></div></div><span class="qna-item__status">Estimate</span></div><p class="qna-item__question">' + esc(r.note || "") + '</p>' + (r.evidence ? '<p class="qna-item__answer">' + esc(r.evidence) + '</p>' : '') + (critText ? '<p class="criteria-summary">' + esc(critText) + '</p>' : '') + '<div class="review-feedback"><button type="button" data-review-feedback="helpful">' + esc(feedbackLabels.helpful) + ' ' + esc(fb.helpful || 0) + '</button><button type="button" data-review-feedback="agree">' + esc(feedbackLabels.agree) + ' ' + esc(fb.agree || 0) + '</button><button type="button" data-review-feedback="needsReview">' + esc(feedbackLabels.needsReview) + ' ' + esc(fb.needsReview || 0) + '</button></div></article>';
        }).join("");
      }
    }
    if (reqForm) {
      reqForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(reqForm);
        var item = { url: fd.get("url"), level: fd.get("level"), focus: fd.get("focus"), city: fd.get("city"), note: fd.get("note"), contact: fd.get("contact"), t: Date.now() };
        var rows = read(VKEY);
        rows.unshift(item);
        write(VKEY, rows.slice(0, 12));
        var formName = reqForm.getAttribute("name") || fd.get("form-name") || "picklary-skill-review";
        fd.set("form-name", formName);
        if (requestStatus) { requestStatus.hidden = false; requestStatus.textContent = ko ? "미리보기를 저장하고 제출을 처리 중입니다." : "Preview saved. Submitting for review..."; }
        try {
          fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(fd).toString()
          }).then(function () {
            if (requestStatus) requestStatus.textContent = ko ? "제출되었습니다. 공개 반영은 운영자 검수 후 진행됩니다." : "Submitted. Public listing requires editor review.";
          }).catch(function () {
            if (requestStatus) requestStatus.textContent = ko ? "브라우저 미리보기는 저장되었습니다. 온라인 제출은 배포 환경에서 다시 시도됩니다." : "Browser preview saved. Online submission will work on the deployed site.";
          });
        } catch (err) {
          if (requestStatus) requestStatus.textContent = ko ? "브라우저 미리보기는 저장되었습니다." : "Browser preview saved.";
        }
        renderSkillRequests();
        reqForm.reset();
        setRequestPanel(false);
      });
    }
    renderSkillRequests();
    if (reviewForm) {
      criteriaInputs().forEach(function (input) { input.addEventListener("input", updatePreview); });
      updatePreview();
      reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(reviewForm);
        var calc = calculateCriteriaScore(reviewForm);
        var rows = read(RKEY);
        rows.unshift({ id: "r" + Date.now() + Math.random().toString(16).slice(2), reviewer: fd.get("reviewer") || "general", estimate: calc.estimate, criteria: calc.detail, note: fd.get("note") || "", evidence: fd.get("evidence") || "", feedback: { helpful: 0, agree: 0, needsReview: 0 }, t: Date.now() });
        write(RKEY, rows.slice(0, 30));
        reviewForm.reset();
        criteriaInputs().forEach(function (input) { input.value = "3.0"; });
        updatePreview();
        renderReviews();
      });
    }
    if (list) {
      list.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest("[data-review-feedback]");
        if (!btn) return;
        var card = btn.closest("[data-review-id]");
        var id = card && card.getAttribute("data-review-id");
        var kind = btn.getAttribute("data-review-feedback");
        var rows = read(RKEY);
        rows.forEach(function (r) {
          if (String(r.id) === String(id)) {
            r.feedback = r.feedback || { helpful: 0, agree: 0, needsReview: 0 };
            r.feedback[kind] = Number(r.feedback[kind] || 0) + 1;
          }
        });
        write(RKEY, rows);
        renderReviews();
      });
    }
    renderReviews();
  }

})();
