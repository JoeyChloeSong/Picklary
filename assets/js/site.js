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

  /* ---- paddle-finder quiz: 3 questions -> a starting paddle profile ---- */
  var finder = document.querySelector("[data-paddle-finder]");
  if (finder) buildFinder(finder);

  function buildFinder(el) {
    var d = function (k) { return el.getAttribute("data-" + k) || ""; };
    var questions = [
      { key: "q1", text: d("q1"), options: [
        { label: d("q1a"), rec: "control" },
        { label: d("q1b"), rec: "spin" },
        { label: d("q1c"), rec: "power" }
      ]},
      { key: "q2", text: d("q2"), options: [
        { label: d("q2a"), rec: "hands" },
        { label: d("q2b"), rec: "stability" }
      ]},
      { key: "q3", text: d("q3"), options: [
        { label: d("q3a"), rec: "gentle" },
        { label: d("q3b"), rec: "" }
      ]}
    ];
    var step = 0, picks = [];

    function render() {
      if (step < questions.length) {
        var q = questions[step];
        el.innerHTML = "";
        var prog = document.createElement("p");
        prog.className = "finder__progress";
        prog.textContent = (step + 1) + " / " + questions.length;
        var h = document.createElement("p");
        h.className = "finder__q";
        h.textContent = q.text;
        var wrap = document.createElement("div");
        wrap.className = "finder__options";
        q.options.forEach(function (opt) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "finder__opt";
          b.textContent = opt.label;
          b.addEventListener("click", function () {
            picks.push(opt.rec); step++; render();
          });
          wrap.appendChild(b);
        });
        el.appendChild(prog); el.appendChild(h); el.appendChild(wrap);
        var first = wrap.querySelector("button"); if (first) first.focus();
      } else {
        showResult();
      }
    }

    function showResult() {
      el.innerHTML = "";
      var box = document.createElement("div");
      box.className = "finder__result";
      var h = document.createElement("h3");
      h.textContent = d("result");
      var intro = document.createElement("p");
      intro.textContent = d("profile-intro");
      var list = document.createElement("ul");
      list.className = "finder__recs";
      picks.filter(Boolean).forEach(function (rec) {
        var txt = d("rec-" + rec);
        if (txt) { var li = document.createElement("li"); li.textContent = txt; list.appendChild(li); }
      });
      var note = document.createElement("p");
      note.className = "notice";
      note.textContent = d("note");
      var actions = document.createElement("div");
      actions.className = "finder__actions";
      var again = document.createElement("button");
      again.type = "button";
      again.className = "btn btn--ghost";
      again.textContent = d("restart");
      again.addEventListener("click", function () { step = 0; picks = []; render(); });
      actions.appendChild(again);
      box.appendChild(h); box.appendChild(intro); box.appendChild(list);
      box.appendChild(note); box.appendChild(actions);
      el.appendChild(box);
      h.setAttribute("tabindex", "-1"); h.focus();
    }

    render();
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
  var markers = root.querySelector("[data-markers]");
  var zoneEls = root.querySelectorAll(".court-zone");
  var shotBtns = root.querySelectorAll('[data-opts="shot"] .opt');
  var powerBtns = root.querySelectorAll('[data-opts="power"] .opt');
  var zoneLabel = root.querySelector("[data-zone-label]");
  var nextBtn = root.querySelector("[data-q-next]");
  var backBtn = root.querySelector("[data-q-back]");
  var promptEl = root.querySelector("[data-q-prompt]");
  var incomingEl = root.querySelector("[data-q-incoming]");
  var powerChip = root.querySelector("[data-q-power]");
  var numEl = root.querySelector("[data-q-num]");
  var totEl = root.querySelector("[data-q-total]");
  var fillEl = root.querySelector("[data-q-fill]");
  if (totEl) totEl.textContent = TOTAL;

  // ---- build difficulty pools (shuffled per attempt) ----
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var pools, used, served, answers, pos, curDiff, anim;

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
    buildPools(); used = {}; served = []; answers = []; pos = 0; curDiff = 2;
    var first = pickNext(2); if (first) { served.push(first); answers.push({ shot: null, power: null, zone: null }); }
    resultBox.hidden = true; resultBox.innerHTML = ""; root.hidden = false;
  }

  // ---- labels ----
  function shotLabel(id) { for (var i = 0; i < D.shots.length; i++) if (D.shots[i][0] === id) return ko ? D.shots[i][2] : D.shots[i][1]; return id || "—"; }
  function powerLabel(id) { for (var i = 0; i < D.powers.length; i++) if (D.powers[i][0] === id) return ko ? D.powers[i][2] : D.powers[i][1]; return id || "—"; }
  function zoneText(id) { return D.zones[id] ? (ko ? D.zones[id][1] : D.zones[id][0]) : (id || "—"); }

  // ---- drawing ----
  function dot(x, y, cls) { var c = document.createElementNS(SVGNS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 11); c.setAttribute("class", cls); return c; }
  function powerWidth(p) { return p === "hard" ? 5 : p === "medium" ? 3.4 : 2.2; }
  function powerDur(p) { return p === "hard" ? 620 : p === "medium" ? 1000 : 1500; }

  function drawScene(s) {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    while (markers.firstChild) markers.removeChild(markers.firstChild);
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
    (s.opp || []).forEach(function (p) { markers.appendChild(dot(p.x, p.y, "court-dot court-dot--opp")); });
    (s.you || []).forEach(function (p) { markers.appendChild(dot(p.x, p.y, "court-dot court-dot--you")); });
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
    incomingEl.textContent = s.incoming;
    setPowerChip(s.ball ? s.ball.power : null);
    numEl.textContent = pos + 1;
    if (fillEl) fillEl.style.width = (pos / TOTAL * 100) + "%";
    shotBtns.forEach(function (b) { b.classList.toggle("is-selected", a.shot === b.getAttribute("data-val")); });
    powerBtns.forEach(function (b) { b.classList.toggle("is-selected", a.power === b.getAttribute("data-val")); });
    zoneEls.forEach(function (z) { z.classList.toggle("is-selected", a.zone === z.getAttribute("data-zone")); });
    zoneLabel.textContent = a.zone ? zoneText(a.zone) : "—";
    backBtn.hidden = pos === 0;
    var frontierDone = served.length >= TOTAL && pos === TOTAL - 1;
    nextBtn.textContent = frontierDone ? D.labels.see : D.labels.next;
    updateNext();
    drawScene(s);
  }

  function updateNext() { var a = answers[pos]; nextBtn.disabled = !(a.shot && a.power && a.zone); }

  shotBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].shot = b.getAttribute("data-val"); shotBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); }); updateNext(); }); });
  powerBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].power = b.getAttribute("data-val"); powerBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); }); updateNext(); }); });
  zoneEls.forEach(function (z) { z.addEventListener("click", function () { answers[pos].zone = z.getAttribute("data-zone"); zoneEls.forEach(function (x) { x.classList.toggle("is-selected", x === z); }); zoneLabel.textContent = zoneText(answers[pos].zone); updateNext(); }); });

  function qScore(s, a) { return (s.shot[a.shot] || 0) + (s.power[a.power] || 0) + (s.zone[a.zone] || 0); }

  backBtn.addEventListener("click", function () { if (pos > 0) { pos--; render(); } });

  nextBtn.addEventListener("click", function () {
    var a = answers[pos]; if (!(a.shot && a.power && a.zone)) return;
    if (pos < served.length - 1) { pos++; render(); return; }      // move forward through already-served
    if (served.length < TOTAL) {                                    // frontier: pick next adaptively
      var q = qScore(served[pos], a) / 9;
      if (q >= 0.7) curDiff = Math.min(3, curDiff + 1); else if (q <= 0.34) curDiff = Math.max(1, curDiff - 1);
      var nx = pickNext(curDiff);
      if (nx) { served.push(nx); answers.push({ shot: null, power: null, zone: null }); pos++; render(); return; }
    }
    showResult();
  });

  function bestKey(map) { var best = null, bv = -1; for (var k in map) if (map[k] > bv) { bv = map[k]; best = k; } return best; }

  function showResult() {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    var sumW = 0, sumD = 0, rawScore = 0, maxScore = served.length * 9, dSum = 0;
    served.forEach(function (s, i) { var sc = qScore(s, answers[i]); rawScore += sc; var q = sc / 9, d = s.diff || 2; sumW += q * d; sumD += d; dSum += d; });
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
      return '<li class="qr">' +
        '<p class="qr__q">' + (i + 1) + '. ' + esc(s.prompt) + ' <span class="qr__pts">+' + sc + '/9</span></p>' +
        '<p class="qr__line"><strong>' + esc(L.yours) + ':</strong> ' + esc(shotLabel(a.shot)) + ' · ' + esc(powerLabel(a.power)) + ' · ' + esc(zoneText(a.zone)) + '</p>' +
        '<button type="button" class="qr__reveal" data-reveal>' + esc(L.showAnswer) + '</button>' +
        '<div class="qr__answer" hidden>' +
        '<p class="qr__line qr__best"><strong>' + esc(L.best) + ':</strong> ' + esc(shotLabel(bs)) + ' · ' + esc(powerLabel(bp)) + ' · ' + esc(zoneText(bz)) + '</p>' +
        '<p class="qr__why">' + esc(s.explain) + '</p></div>' +
        '</li>';
    }).join("");
    resultBox.innerHTML =
      '<div class="result-card">' +
      '<p class="result-card__eyebrow">' + esc(L.est) + '</p>' +
      '<h2 class="result-card__band">' + duprStr + '</h2>' +
      '<p class="result-card__desc">' + esc(band.desc) + '</p>' +
      '<p class="result-card__score">' + esc(L.score) + ': ' + rawScore + ' / ' + maxScore + '</p>' +
      '<div class="result-card__actions">' +
      '<a class="btn btn--primary" href="/' + lang + '/level/' + band.slug + '/">' + esc(L.guide) + ' →</a> ' +
      '<a class="btn btn--ghost" href="/' + lang + '/what-is-dupr/">' + (ko ? "DUPR이란?" : "What is DUPR?") + '</a> ' +
      '<button type="button" class="btn btn--ghost" data-q-retake>' + esc(L.retake) + '</button>' +
      '</div>' +
      '<p class="notice">' + (ko ? "이 추정치는 의사결정 자가진단 결과이며 공식 DUPR이 아닙니다. 실제 DUPR은 dupr.com에서 경기 기록으로 산출됩니다." : "This estimate is a decision-making self-assessment, not an official DUPR rating. Real DUPR is calculated from match results at dupr.com.") + '</p>' +
      '<h3 class="result-card__review">' + esc(L.reviewTitle) + '</h3>' +
      '<ul class="qr-list">' + rows + '</ul>' +
      '</div>';
    root.hidden = true; resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    resultBox.querySelectorAll("[data-reveal]").forEach(function (btn) {
      btn.addEventListener("click", function () { var ans = btn.nextElementSibling; if (ans) { ans.hidden = !ans.hidden; btn.classList.toggle("is-open", !ans.hidden); btn.textContent = ans.hidden ? L.showAnswer : (ko ? "정답 숨기기" : "Hide"); } });
    });
    var retake = resultBox.querySelector("[data-q-retake]");
    if (retake) retake.addEventListener("click", function () { reset(); render(); root.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  reset();
  render();
})();
