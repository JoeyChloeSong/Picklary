/* ---- DUPR self-check quiz engine (adaptive, 10-or-20-of-32, court-based) ---- */
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
  var targetBtns = root.querySelectorAll('[data-opts="target"] .opt');
  var shotGroup = root.querySelector('[data-answer-step="shot"]');
  var powerGroup = root.querySelector('[data-answer-step="power"]');
  var targetGroup = root.querySelector('[data-answer-step="target"]');
  var playerBtns = root.querySelectorAll('[data-opts="player"] .opt');
  var playerGroup = root.querySelector("[data-player-group]");
  var zoneLabel = root.querySelector("[data-zone-label]");
  var courtFlat = root.querySelector(".court-flat");
  var courtIso = root.querySelector(".court-iso");
  var courtToggle = root.querySelector("[data-court-toggle]");
  var courtMode = "iso";
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
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) anim = requestAnimationFrame(step);
      }
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) anim = requestAnimationFrame(step);
    }
  }

  function setPowerChip(p) {
    if (!powerChip) return;
    powerChip.className = "quiz__power-chip quiz__power-chip--" + (p || "medium");
    powerChip.textContent = powerLabel(p);
  }

  function syncAnswerSteps() {
    var a = answers[pos] || {};
    var shotDone = !!a.shot, powerDone = !!a.power, targetDone = !!a.zone;
    if (shotGroup) { shotGroup.classList.toggle("is-active", !shotDone); shotGroup.classList.toggle("is-complete", shotDone); shotGroup.classList.remove("is-locked"); }
    if (powerGroup) { powerGroup.classList.toggle("is-locked", !shotDone); powerGroup.classList.toggle("is-active", shotDone && !powerDone); powerGroup.classList.toggle("is-complete", powerDone); }
    if (targetGroup) { targetGroup.classList.toggle("is-locked", !(shotDone && powerDone)); targetGroup.classList.toggle("is-active", shotDone && powerDone && !targetDone); targetGroup.classList.toggle("is-complete", targetDone); }
    powerBtns.forEach(function (b) { b.disabled = !shotDone; b.setAttribute("aria-disabled", !shotDone ? "true" : "false"); });
    targetBtns.forEach(function (b) { b.disabled = !(shotDone && powerDone); b.setAttribute("aria-disabled", !(shotDone && powerDone) ? "true" : "false"); b.classList.toggle("is-selected", a.zone === b.getAttribute("data-val")); });
    root.classList.toggle("is-target-ready", shotDone && powerDone);
    root.classList.toggle("is-target-locked", !(shotDone && powerDone));
    zoneEls.forEach(function (z) {
      var locked = !(shotDone && powerDone);
      z.setAttribute("aria-disabled", locked ? "true" : "false");
      z.setAttribute("tabindex", locked ? "-1" : "0");
    });
  }

  function render() {
    var s = served[pos], a = answers[pos];
    root.dataset.questionId=s.id;
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
    shotBtns.forEach(function (b) { var on=a.shot === b.getAttribute("data-val");b.classList.toggle("is-selected",on);b.setAttribute("aria-pressed",on?"true":"false"); });
    powerBtns.forEach(function (b) { var on=a.power === b.getAttribute("data-val");b.classList.toggle("is-selected",on);b.setAttribute("aria-pressed",on?"true":"false"); });
    targetBtns.forEach(function (b) { var on=a.zone === b.getAttribute("data-val");b.classList.toggle("is-selected",on);b.setAttribute("aria-pressed",on?"true":"false"); });
    zoneEls.forEach(function (z) { var on = a.zone === z.getAttribute("data-zone"); z.classList.toggle("is-selected", on); z.setAttribute("aria-pressed", on ? "true" : "false"); });
    if (playerGroup) playerGroup.hidden = !s.player;
    playerBtns.forEach(function (b) { var on=a.player === b.getAttribute("data-val");b.classList.toggle("is-selected",on);b.setAttribute("aria-pressed",on?"true":"false"); });
    zoneLabel.textContent = a.zone ? zoneText(a.zone) : "—";
    backBtn.hidden = pos === 0;
    var frontierDone = served.length >= TOTAL && pos === TOTAL - 1;
    nextBtn.textContent = frontierDone ? (extended ? D.labels.see : (D.labels.done10 || D.labels.see)) : D.labels.next;
    syncAnswerSteps();
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

  shotBtns.forEach(function (b) { b.addEventListener("click", function () {
    answers[pos].shot = b.getAttribute("data-val");
    shotBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); x.setAttribute("aria-pressed", x===b?"true":"false"); });
    syncAnswerSteps(); updateNext();
  }); });
  powerBtns.forEach(function (b) { b.addEventListener("click", function () {
    if (b.disabled) return;
    answers[pos].power = b.getAttribute("data-val");
    powerBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); x.setAttribute("aria-pressed", x===b?"true":"false"); });
    syncAnswerSteps(); updateNext();
  }); });
  function selectZoneValue(key) {
    var a = answers[pos];
    if (!a.shot || !a.power || !key) return;
    a.zone = key;
    zoneEls.forEach(function (x) { var on = x.getAttribute("data-zone") === key; x.classList.toggle("is-selected", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
    targetBtns.forEach(function (x) { var on=x.getAttribute("data-val")===key;x.classList.toggle("is-selected",on);x.setAttribute("aria-pressed",on?"true":"false"); });
    zoneLabel.textContent = zoneText(key);
    syncAnswerSteps(); updateNext();
  }
  zoneEls.forEach(function (z) {
    z.addEventListener("click", function () { selectZoneValue(z.getAttribute("data-zone")); });
    z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); selectZoneValue(z.getAttribute("data-zone")); } });
  });
  targetBtns.forEach(function (b) { b.addEventListener("click", function () { if (!b.disabled) selectZoneValue(b.getAttribute("data-val")); }); });
  playerBtns.forEach(function (b) { b.addEventListener("click", function () { answers[pos].player = b.getAttribute("data-val"); playerBtns.forEach(function (x) { x.classList.toggle("is-selected", x === b); x.setAttribute("aria-pressed", x===b?"true":"false"); }); drawScene(served[pos]); syncAnswerSteps(); updateNext(); }); });

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
  function loadHist() { try { var v = JSON.parse(localStorage.getItem(HKEY)); return Array.isArray(v) ? v.filter(function(e){return e && Number.isFinite(e.t) && Number.isFinite(e.d) && e.d>=2 && e.d<=5.5;}).slice(-20) : []; } catch (e) { return []; } }
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
    var duprStr = dupr.toFixed(1);
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
    var markerPct = Math.max(0, Math.min(100, ((dupr - 2.0) / 3.5) * 100));
    var bandNameMap = {
      "2-0": ko ? "New Player" : "New Player",
      "2-5": ko ? "Consistency Builder" : "Consistency Builder",
      "3-0": ko ? "Rally Player" : "Rally Player",
      "3-5": ko ? "Pattern Player" : "Pattern Player",
      "4-0": ko ? "Advanced" : "Advanced"
    };
    var bandName = bandNameMap[band.slug] || (ko ? "Advanced" : "Advanced");
    var scaleTicks = ["2.0", "2.7", "3.4", "4.1", "4.8", "5.5"].map(function (v) {
      return '<span class="dupr-result__tick"><i></i><b>' + v + '</b></span>';
    }).join("");
    resultBox.innerHTML =
      '<div class="result-card result-card--dupr-app">' +
      '<div class="dupr-result-phone" aria-label="' + esc(L.est) + '">' +
      '<div class="dupr-result-phone__top"><span>9:41</span><span class="dupr-result-phone__status">▮▮▮ ᯤ ▱</span></div>' +
      '<div class="dupr-result-phone__head"><span>DUPR Self-Check</span><span aria-hidden="true">☰</span></div>' +
      '<div class="dupr-result-card">' +
      '<p class="dupr-result-card__kicker">PICKLARY ESTIMATE (NOT OFFICIAL)</p>' +
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
      '<a class="btn btn--primary" href="/' + lang + '/learn/">' + esc(L.guide) + ' →</a> ' +
      '<a class="btn btn--ghost" href="/' + lang + '/level-check/">' + (ko ? "실력 확인 도구" : "Skill tools") + '</a> ' +
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
    if (document.querySelector('[data-save-assessment]')?.checked) {
      try { var hl=loadHist(); hl.push({t:Date.now(),d:Number(duprStr),s:rawScore,m:maxScore}); localStorage.setItem(HKEY,JSON.stringify(hl.slice(-20))); }
      catch(e) { document.querySelector('[data-storage-status]').textContent=ko?'\uc800\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. JSON\uc73c\ub85c \ub0b4\ubcf4\ub0b4\uc138\uc694.':'Storage unavailable. Export JSON instead.'; }
    }
    var ex=document.createElement('button');ex.type='button';ex.className='btn btn--ghost';ex.dataset.exportAssessment='';ex.textContent='JSON \u2193';
    ex.addEventListener('click',function(){
      var payload={schema:'picklary.self-check.v1',createdAt:new Date().toISOString(),officialDupr:false,method:'Uncalibrated decision heuristic from the original Picklary quiz',approximateLevel:Number(duprStr),score:rawScore,maximum:maxScore,questions:served.map(function(s,i){return {id:s.id,difficulty:s.diff,answer:answers[i],points:qScore(s,answers[i])};})};
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='picklary-self-check.json';a.click();setTimeout(function(){URL.revokeObjectURL(u);},5000);
    });resultBox.querySelector('.result-card__actions').appendChild(ex);
    renderHistory();
  }

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  reset();
  render();
  renderHistory();
})();