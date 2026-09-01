/* ============================================================
   Washington CNA / NAC Practice Exam — app.js
   Data source: window.CNA_DATA (questions.js). Same content is
   mirrored in questions.json for portability/inspection.
   Each item: {id, bank:"MASSIVE"|"PINK", type:"mc"|"tf",
               sub, pg, q, o:[...], a:correctIndex, e:explanation}
   ============================================================ */
(function () {
  "use strict";

  // ---------- Data guard ----------
  var DATA = (typeof window.CNA_DATA !== "undefined") ? window.CNA_DATA : [];
  var $ = function (id) { return document.getElementById(id); };
  var LETTERS = ["A", "B", "C", "D"];
  var DEFAULT_TARGET = 80;         // practice target %, configurable; NOT the official passing score
  var EXAM_SECONDS = 2 * 60 * 60;  // 2 hours for full/exam-style tests
  var K_PROGRESS = "cna_progress_v1";
  var K_HISTORY = "cna_history_v1";
  var K_MISSED = "cna_missed_v1";
  var K_TARGET = "cna_target_v1";

  // ---------- Storage helpers (safe) ----------
  function lsGet(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function getTarget() { var v = parseInt(lsGet(K_TARGET), 10); return (v >= 1 && v <= 100) ? v : DEFAULT_TARGET; }
  function setTarget(v) { v = parseInt(v, 10); if (!(v >= 1 && v <= 100)) v = DEFAULT_TARGET; lsSet(K_TARGET, v); return v; }

  // ---------- Utilities ----------
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; var mm = (h > 0 ? String(m).padStart(2, "0") : String(m)); return (h > 0 ? h + ":" : "") + mm + ":" + String(sec).padStart(2, "0"); }
  function bankName(b) { return b === "MASSIVE" ? "Massive 200-Question Practice Test" : "Pink Sheet Skills Practice Test"; }
  function sourceLine(item) { return bankName(item.bank) + ", p." + item.pg; }

  // ============================================================
  //  PURE GRADING (also used by self-tests) — must be exact.
  // ============================================================
  // answers: array parallel to questions; each is chosen index or null.
  function grade(questions, answers, targetPct) {
    if (targetPct === undefined) targetPct = DEFAULT_TARGET;
    var total = questions.length, correct = 0, incorrect = 0, unanswered = 0;
    for (var i = 0; i < total; i++) {
      var ch = answers[i];
      if (ch === null || ch === undefined) { unanswered++; }
      else if (ch === questions[i].a) { correct++; }
      else { incorrect++; }
    }
    var answered = correct + incorrect;                       // answered = correct + incorrect
    var overall = total ? (correct / total) * 100 : 0;        // overall = correct / total * 100
    var correctPct = answered ? (correct / answered) * 100 : 0;
    var incorrectPct = answered ? (incorrect / answered) * 100 : 0;
    var g = gcd(correct, incorrect);
    return {
      total: total, correct: correct, incorrect: incorrect, unanswered: unanswered,
      answered: answered,
      overall: overall,
      correctPct: correctPct, incorrectPct: incorrectPct,
      ratioRaw: correct + " : " + incorrect,
      ratioSimple: (correct / g) + " : " + (incorrect / g),
      passed: total > 0 && overall >= targetPct,
      valid: (correct + incorrect + unanswered) === total     // must always hold
    };
  }

  // ============================================================
  //  SELF-TESTS (requirement 9). Run once on load; report result.
  // ============================================================
  function runSelfTests() {
    function mk(n) { var q = []; for (var i = 0; i < n; i++) q.push({ a: 0 }); return q; }
    var results = [];
    // Case 1: all correct -> 100%
    (function () { var q = mk(50), an = q.map(function () { return 0; }); var r = grade(q, an); results.push(r.overall === 100 && r.valid && r.unanswered === 0); })();
    // Case 2: all incorrect -> 0%
    (function () { var q = mk(50), an = q.map(function () { return 1; }); var r = grade(q, an); results.push(r.overall === 0 && r.correct === 0 && r.valid); })();
    // Case 3: 80 correct / 20 incorrect -> 80%
    (function () { var q = mk(100), an = []; for (var i = 0; i < 100; i++) an.push(i < 80 ? 0 : 1); var r = grade(q, an); results.push(r.overall === 80 && r.correctPct === 80 && r.incorrectPct === 20 && r.answered === 100 && r.valid); })();
    // Case 4: 50 correct / 25 incorrect / 25 unanswered -> 50% overall
    (function () { var q = mk(100), an = []; for (var i = 0; i < 100; i++) { if (i < 50) an.push(0); else if (i < 75) an.push(1); else an.push(null); } var r = grade(q, an); results.push(r.overall === 50 && r.correct === 50 && r.incorrect === 25 && r.unanswered === 25 && r.correctPct === (50 / 75 * 100) && r.valid); })();
    // Case 5: counts always sum to total (random)
    (function () { var q = mk(37), an = q.map(function (_, i) { return i % 3 === 0 ? null : (i % 2); }); var r = grade(q, an); results.push((r.correct + r.incorrect + r.unanswered) === 37 && r.valid); })();
    // Ratio simplification sanity: 160:40 -> 4:1
    (function () { var q = mk(200), an = []; for (var i = 0; i < 200; i++) an.push(i < 160 ? 0 : 1); var r = grade(q, an); results.push(r.ratioRaw === "160 : 40" && r.ratioSimple === "4 : 1"); })();

    var passed = results.every(Boolean);
    var el = $("selfTestLine");
    if (passed) el.innerHTML = "Grading self-tests: <b class='ok'>all " + results.length + " passed</b> (100% / 0% / 80% / 50% cases, count sums, ratio).";
    else el.innerHTML = "Grading self-tests: <b class='no'>FAILED " + results.filter(function (x) { return !x; }).length + " of " + results.length + "</b> — see console.";
    if (!passed) console.error("Self-test results:", results);
    return passed;
  }

  // Data integrity check (requirement 8): one valid answer, unique ids, options present.
  function runDataAudit() {
    var ids = {}, problems = [];
    DATA.forEach(function (it, idx) {
      if (ids[it.id]) problems.push("Duplicate id " + it.id);
      ids[it.id] = true;
      if (!it.o || (it.type === "mc" && it.o.length !== 4) || (it.type === "tf" && it.o.length !== 2)) problems.push(it.id + " bad option count");
      if (typeof it.a !== "number" || it.a < 0 || it.a >= it.o.length) problems.push(it.id + " invalid answer index");
      if (!it.q || !it.e) problems.push(it.id + " missing text");
    });
    var massive = DATA.filter(function (x) { return x.bank === "MASSIVE"; }).length;
    var pink = DATA.filter(function (x) { return x.bank === "PINK"; }).length;
    console.log("[CNA] Loaded " + DATA.length + " questions (Massive " + massive + ", Pink " + pink + ").");
    if (problems.length) console.error("[CNA] Data audit problems:", problems);
    else console.log("[CNA] Data audit: OK — unique ids, one valid answer each, options intact.");
    return { count: DATA.length, massive: massive, pink: pink, problems: problems };
  }

  // ============================================================
  //  APP STATE
  // ============================================================
  var mode = "practice";          // "practice" | "exam"
  var session = null;             // {items:[...], answers:[], flags:[], cur, timed, secondsLeft, title}
  var timerId = null;
  var reviewFilter = "all";
  var lastResult = null;

  // ---------- Build item lists ----------
  function byBank(b) { return DATA.filter(function (x) { return x.bank === b; }); }
  function subjectsList() {
    // preserve first-seen order, grouped by bank
    var seen = [], out = [];
    DATA.forEach(function (x) { var key = x.bank + "|" + x.sub; if (seen.indexOf(key) === -1) { seen.push(key); out.push({ bank: x.bank, sub: x.sub }); } });
    return out;
  }

  function startTest(items, title, opts) {
    opts = opts || {};
    if (!items.length) { toast("No questions in that set."); return; }
    var arr = items.slice();
    if (opts.shuffle) shuffle(arr);
    session = {
      items: arr.map(function (it) {
        // clone options with shuffled order so the correct letter isn't predictable
        var opts2 = it.o.map(function (t, i) { return { t: t, correct: i === it.a }; });
        if (opts.shuffleOptions !== false) shuffle(opts2);
        return { ref: it, opts: opts2 };
      }),
      answers: [], flags: [], cur: 0,
      timed: !!opts.timed, secondsLeft: opts.timed ? EXAM_SECONDS : 0,
      title: title, startedAt: Date.now()
    };
    for (var i = 0; i < session.items.length; i++) { session.answers.push(null); session.flags.push(false); }
    saveProgress();
    enterQuiz();
  }

  function enterQuiz() {
    showScreen("quizScreen");
    $("navbar").hidden = false;
    $("answeredStat").hidden = false;
    $("timer").hidden = !session.timed;
    if (session.timed) startTimer();
    renderQuestion();
  }

  // ---------- Timer ----------
  function startTimer() {
    stopTimer(); updateTimer();
    timerId = setInterval(function () {
      session.secondsLeft--;
      if (session.secondsLeft <= 0) { session.secondsLeft = 0; updateTimer(); finish(true); return; }
      updateTimer();
      if (session.secondsLeft % 10 === 0) saveProgress();
    }, 1000);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function updateTimer() { $("timeVal").textContent = fmtTime(session.secondsLeft); $("timer").classList.toggle("warn", session.secondsLeft <= 300); }

  // ---------- Render a question ----------
  function currentGraded(i) {
    // in practice mode, once answered it's locked & shown
    return mode === "practice" && session.answers[i] !== null;
  }
  function renderQuestion() {
    var i = session.cur, cell = session.items[i], item = cell.ref;
    $("qCount").textContent = "Question " + (i + 1) + " of " + session.items.length;
    $("qSub").textContent = item.sub;
    $("qType").textContent = item.type === "tf" ? "True / False" : "Multiple choice";
    $("flagBtn").classList.toggle("on", session.flags[i]);
    $("flagBtn").setAttribute("aria-pressed", session.flags[i]);
    $("flagLbl").textContent = session.flags[i] ? "Marked" : "Mark for review";
    $("qText").textContent = item.q;

    var locked = currentGraded(i);
    var box = $("options"); box.innerHTML = "";
    cell.opts.forEach(function (opt, oi) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.setAttribute("role", "radio");
      var chosen = session.answers[i] === oi;
      b.setAttribute("aria-checked", chosen);
      if (chosen) b.classList.add("selected");
      if (locked) {
        b.classList.add("locked");
        if (opt.correct) b.classList.add("correct");
        else if (chosen) b.classList.add("wrong");
      }
      b.innerHTML = '<span class="mk">' + LETTERS[oi] + '</span><span class="ot"></span>';
      b.querySelector(".ot").textContent = opt.t;
      b.addEventListener("click", function () { choose(oi); });
      box.appendChild(b);
    });

    // feedback (practice mode only, after answering)
    var fb = $("feedback");
    if (locked) {
      var right = cell.opts.findIndex(function (o) { return o.correct; });
      var isRight = session.answers[i] === right;
      fb.hidden = false;
      fb.className = "feedback " + (isRight ? "ok" : "no");
      fb.innerHTML = '<div class="tag">' + (isRight ? "&#10003; Correct" : "&#10007; Incorrect") + '</div>' +
        '<div>' + (isRight ? "" : "<strong>Correct answer: " + LETTERS[right] + " &mdash; " + esc(cell.opts[right].t) + "</strong><br>") + esc(item.e) + '</div>' +
        '<div class="src">' + esc(sourceLine(item)) + " &bull; " + esc(item.sub) + '</div>';
    } else { fb.hidden = true; }

    $("prevBtn").disabled = i === 0;
    var last = i === session.items.length - 1;
    $("nextBtn").hidden = last;
    $("submitBtn").hidden = !last;
    updateProgress();
  }

  function choose(oi) {
    var i = session.cur;
    if (currentGraded(i)) return;      // locked in practice mode
    session.answers[i] = oi;
    renderQuestion();
    saveProgress();
    if (mode === "exam") {
      // brief auto-advance is NOT used; user controls navigation
    }
  }

  function updateProgress() {
    var answered = session.answers.filter(function (a) { return a !== null; }).length;
    $("answeredStat").textContent = answered + " / " + session.items.length + " answered";
    $("progressFill").style.width = ((session.cur + 1) / session.items.length * 100) + "%";
  }

  function go(delta) {
    var n = session.cur + delta;
    if (n < 0 || n >= session.items.length) return;
    session.cur = n; renderQuestion(); saveProgress();
  }
  function jump(n) { session.cur = n; renderQuestion(); saveProgress(); }
  function toggleFlag() { var i = session.cur; session.flags[i] = !session.flags[i]; renderQuestion(); toast(session.flags[i] ? "Marked for review" : "Mark removed"); saveProgress(); }

  // ---------- Navigator drawer ----------
  function openDrawer() {
    var grid = $("pgrid"); grid.innerHTML = "";
    session.items.forEach(function (_, i) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "pcell" + (session.answers[i] !== null ? " answered" : "") + (session.flags[i] ? " flagged" : "") + (i === session.cur ? " current" : "");
      c.textContent = i + 1;
      c.addEventListener("click", function () { jump(i); closeDrawer(); });
      grid.appendChild(c);
    });
    $("overlay").classList.add("show"); $("drawer").classList.add("show");
  }
  function closeDrawer() { $("overlay").classList.remove("show"); $("drawer").classList.remove("show"); }

  // ---------- Finish & grade ----------
  function finish(auto) {
    var answered = session.answers.filter(function (a) { return a !== null; }).length;
    var blank = session.items.length - answered;
    if (!auto) {
      var msg = blank > 0
        ? "You have " + blank + " unanswered question" + (blank > 1 ? "s" : "") + ". Submit anyway?"
        : "Submit this test and see your results?";
      if (!confirm(msg)) return;
    }
    stopTimer();
    // build parallel arrays for pure grade()
    var qs = session.items.map(function (cell) { return { a: cell.opts.findIndex(function (o) { return o.correct; }) }; });
    var res = grade(qs, session.answers, getTarget());
    res.timeUsed = session.timed ? (EXAM_SECONDS - session.secondsLeft) : Math.round((Date.now() - session.startedAt) / 1000);
    res.title = session.title;
    lastResult = res;
    recordMissed();
    recordHistory(res);
    lsDel(K_PROGRESS);
    renderResults(res);
    showScreen("resultScreen");
    $("navbar").hidden = true; $("timer").hidden = true; $("answeredStat").hidden = true;
  }

  function recordMissed() {
    var missed = lsGet(K_MISSED) || {};
    session.items.forEach(function (cell, i) {
      var right = cell.opts.findIndex(function (o) { return o.correct; });
      var id = cell.ref.id;
      if (session.answers[i] !== null && session.answers[i] !== right) {
        missed[id] = (missed[id] || 0) + 1;
      }
    });
    lsSet(K_MISSED, missed);
    refreshMissedUI();
  }
  function recordHistory(res) {
    var hist = lsGet(K_HISTORY) || [];
    hist.unshift({ title: res.title, total: res.total, correct: res.correct, incorrect: res.incorrect,
      unanswered: res.unanswered, overall: Math.round(res.overall * 10) / 10, passed: res.passed, when: Date.now() });
    if (hist.length > 50) hist = hist.slice(0, 50);
    lsSet(K_HISTORY, hist);
  }

  // ---------- Results rendering ----------
  function renderResults(res) {
    var target = getTarget();
    var v = $("verdict");
    v.className = "verdict " + (res.passed ? "pass" : "fail");
    v.textContent = res.passed ? ("At or above your " + target + "% practice target") : ("Below your " + target + "% practice target");

    var pct = Math.round(res.overall);
    $("scorePct").textContent = pct + "%";
    $("scoreFrac").textContent = res.correct + " / " + res.total;
    var circ = 2 * Math.PI * 68;
    var ring = $("ringFill");
    ring.style.transition = "none"; ring.setAttribute("stroke-dashoffset", circ);
    ring.style.stroke = res.passed ? "var(--good)" : "var(--warn)";
    // force reflow then animate
    void ring.getBoundingClientRect();
    requestAnimationFrame(function () { ring.style.transition = "stroke-dashoffset 1s ease"; ring.setAttribute("stroke-dashoffset", (circ * (1 - res.correct / res.total)).toFixed(1)); });

    $("stTotal").textContent = res.total;
    $("stCorrect").textContent = res.correct;
    $("stWrong").textContent = res.incorrect;
    $("stBlank").textContent = res.unanswered;
    $("stOverall").textContent = (Math.round(res.overall * 10) / 10) + "%";
    $("stCorrectPct").textContent = res.answered ? (Math.round(res.correctPct * 10) / 10) + "%" : "N/A";
    $("stWrongPct").textContent = res.answered ? (Math.round(res.incorrectPct * 10) / 10) + "%" : "N/A";
    $("stRatio").textContent = res.answered ? (res.ratioRaw + (res.ratioSimple !== res.ratioRaw ? "  (" + res.ratioSimple + ")" : "")) : "N/A (no questions answered)";
    $("stTime").textContent = fmtTime(res.timeUsed);

    $("resultMsg").textContent = res.passed
      ? ("Strong work — that's at or above your " + target + "% practice target. This is a personal study goal, not the official Washington exam result. Do it once more, review any misses below, and she'll be in great shape.")
      : (res.unanswered > 0
        ? "Unanswered questions count against the overall score. Review the misses below (and any skipped items), then retake."
        : ("Not at your " + target + "% practice target yet — that's what practice is for. Review every miss below and focus on the lowest subject bars."));

    renderDomainTable();
    reviewFilter = "all"; setFilterChips(); renderReview();
  }

  function renderDomainTable() {
    var groups = {};
    session.items.forEach(function (cell, i) {
      var key = cell.ref.sub;
      if (!groups[key]) groups[key] = { c: 0, t: 0 };
      groups[key].t++;
      var right = cell.opts.findIndex(function (o) { return o.correct; });
      if (session.answers[i] === right) groups[key].c++;
    });
    var order = Object.keys(groups);
    var tbl = $("domainTable"); tbl.innerHTML = "";
    order.forEach(function (k) {
      var o = groups[k], p = Math.round(o.c / o.t * 100);
      var cls = p >= 80 ? "" : (p >= 60 ? "mid" : "low");
      var row = document.createElement("div"); row.className = "drow";
      row.innerHTML = '<div class="dn">' + esc(k) + '</div>' +
        '<div class="bar"><div class="bf ' + cls + '" style="width:' + p + '%"></div></div>' +
        '<div class="dscore mono">' + o.c + "/" + o.t + " &middot; " + p + '%</div>';
      tbl.appendChild(row);
    });
  }

  function renderReview() {
    var list = $("reviewList"); list.innerHTML = ""; var shown = 0;
    session.items.forEach(function (cell, i) {
      var item = cell.ref;
      var right = cell.opts.findIndex(function (o) { return o.correct; });
      var chosen = session.answers[i];
      var state = chosen === null ? "blank" : (chosen === right ? "correct" : "wrong");
      if (reviewFilter === "wrong" && state !== "wrong") return;
      if (reviewFilter === "blank" && state !== "blank") return;
      if (reviewFilter === "flagged" && !session.flags[i]) return;
      shown++;

      var badge = state === "correct" ? '<span class="badge c">Correct</span>'
        : state === "wrong" ? '<span class="badge w">Incorrect</span>'
          : '<span class="badge b">Unanswered</span>';
      var optsHTML = "";
      cell.opts.forEach(function (o, oi) {
        var cls = "revopt", tail = "";
        if (o.correct) { cls += " correct"; tail = '<span class="tail">Correct answer</span>'; }
        else if (chosen === oi) { cls += " chosen"; tail = '<span class="tail">Her answer</span>'; }
        optsHTML += '<div class="' + cls + '"><span class="rmk">' + LETTERS[oi] + '</span><span>' + esc(o.t) + '</span>' + tail + '</div>';
      });
      var flagTag = session.flags[i] ? ' <span class="badge" style="background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent)">Flagged</span>' : "";
      var div = document.createElement("div");
      div.className = "revitem " + state;
      div.innerHTML =
        '<div class="rhead"><span class="rnum">Question ' + (i + 1) + '</span><span class="qsub">' + esc(item.sub) + '</span>' + badge + flagTag + '</div>' +
        '<div class="rq">' + esc(item.q) + '</div>' + optsHTML +
        '<div class="revexpl"><div class="lab">Explanation</div>' + esc(item.e) + '</div>' +
        '<div class="revmeta">Source: ' + esc(sourceLine(item)) + '</div>';
      list.appendChild(div);
    });
    if (!shown) list.innerHTML = '<div class="revitem" style="text-align:center;color:var(--muted);border-left-color:var(--line)">Nothing matches this filter.</div>';
  }
  function setFilterChips() { document.querySelectorAll("#reviewFilter .chip").forEach(function (c) { c.classList.toggle("on", c.dataset.f === reviewFilter); }); }

  // ---------- Export / print ----------
  function exportResults() {
    if (!lastResult) return;
    var r = lastResult, lines = [];
    lines.push("WASHINGTON CNA PRACTICE EXAM — RESULTS");
    lines.push("Test: " + r.title);
    lines.push("Date: " + new Date().toLocaleString());
    lines.push("");
    lines.push("Total questions : " + r.total);
    lines.push("Correct         : " + r.correct);
    lines.push("Incorrect       : " + r.incorrect);
    lines.push("Unanswered      : " + r.unanswered);
    lines.push("Overall score   : " + (Math.round(r.overall * 10) / 10) + "%");
    lines.push("Correct % (of answered)   : " + (r.answered ? (Math.round(r.correctPct * 10) / 10) + "%" : "N/A"));
    lines.push("Incorrect % (of answered) : " + (r.answered ? (Math.round(r.incorrectPct * 10) / 10) + "%" : "N/A"));
    lines.push("Ratio correct:incorrect   : " + (r.answered ? (r.ratioRaw + " (simplified " + r.ratioSimple + ")") : "N/A"));
    lines.push("Result          : " + (r.passed ? ("AT/ABOVE " + getTarget() + "% PRACTICE TARGET") : "NEEDS MORE STUDY") + "  (practice goal, not the official exam result)");
    lines.push("Time used       : " + fmtTime(r.timeUsed));
    lines.push("");
    lines.push("BY SUBJECT / SKILL:");
    var groups = {};
    session.items.forEach(function (cell, i) { var k = cell.ref.sub; if (!groups[k]) groups[k] = { c: 0, t: 0 }; groups[k].t++; var right = cell.opts.findIndex(function (o) { return o.correct; }); if (session.answers[i] === right) groups[k].c++; });
    Object.keys(groups).forEach(function (k) { var o = groups[k]; lines.push("  " + k + ": " + o.c + "/" + o.t + " (" + Math.round(o.c / o.t * 100) + "%)"); });
    var blob = new Blob([lines.join("\n")], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "CNA_results_" + new Date().toISOString().slice(0, 10) + ".txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    toast("Results downloaded");
  }

  // ============================================================
  //  HOME screen wiring
  // ============================================================
  function refreshMissedUI() {
    var missed = lsGet(K_MISSED) || {};
    var ids = Object.keys(missed);
    $("missedBadge").textContent = ids.length;
    $("retestMissedBtn").disabled = ids.length === 0;

    var box = $("missedSummary");
    if (!ids.length) { box.innerHTML = ""; return; }
    // most-missed first
    ids.sort(function (a, b) { return missed[b] - missed[a]; });
    var top = ids.slice(0, 8);
    var html = '<h3 style="font-size:1rem;margin:16px 0 8px;color:var(--brand)">Most-missed questions</h3>';
    top.forEach(function (id) {
      var item = DATA.find(function (x) { return x.id === id; });
      if (!item) return;
      html += '<div class="missrow"><span class="mcount">&times;' + missed[id] + '</span><span>' + esc(item.q) + ' <span class="muted small">(' + esc(item.sub) + ')</span></span></div>';
    });
    box.innerHTML = html;
  }

  function refreshHistoryUI() {
    var hist = lsGet(K_HISTORY) || [];
    var list = $("historyList");
    $("historyEmpty").hidden = hist.length > 0;
    list.innerHTML = "";
    hist.slice(0, 10).forEach(function (h) {
      var row = document.createElement("div"); row.className = "histrow";
      var d = new Date(h.when);
      row.innerHTML = '<div><div class="ht">' + esc(h.title) + '</div><div class="hd">' + d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " &bull; " + h.correct + "/" + h.total + '</div></div>' +
        '<div class="hd">' + h.incorrect + " wrong &bull; " + h.unanswered + ' skipped</div>' +
        '<div class="hs ' + (h.passed ? "pass" : "fail") + '">' + h.overall + '%</div>';
      list.appendChild(row);
    });
  }

  function buildSubjectDropdown() {
    var sel = $("subjectSelect");
    sel.innerHTML = "";
    var groups = subjectsList();
    // group into two optgroups
    var og1 = document.createElement("optgroup"); og1.label = "Knowledge Test — sections";
    var og2 = document.createElement("optgroup"); og2.label = "Pink Sheet — skills";
    groups.forEach(function (g) {
      var count = DATA.filter(function (x) { return x.bank === g.bank && x.sub === g.sub; }).length;
      var o = document.createElement("option");
      o.value = g.bank + "|" + g.sub;
      o.textContent = g.sub + " (" + count + ")";
      (g.bank === "MASSIVE" ? og1 : og2).appendChild(o);
    });
    sel.appendChild(og1); sel.appendChild(og2);
  }

  function checkResume() {
    var p = lsGet(K_PROGRESS);
    if (p && p.items && p.items.length) {
      var answered = p.answers.filter(function (a) { return a !== null; }).length;
      $("resumeText").innerHTML = "<b>Unfinished test:</b> " + esc(p.title) + " &mdash; " + answered + "/" + p.items.length + " answered" + (p.timed ? ", " + fmtTime(p.secondsLeft) + " left" : "") + ".";
      $("resumeBanner").hidden = false;
    } else { $("resumeBanner").hidden = true; }
  }

  // ---------- Progress persistence ----------
  function saveProgress() {
    if (!session) return;
    lsSet(K_PROGRESS, {
      title: session.title, cur: session.cur, timed: session.timed, secondsLeft: session.secondsLeft,
      startedAt: session.startedAt, mode: mode,
      answers: session.answers, flags: session.flags,
      items: session.items.map(function (cell) {
        return { id: cell.ref.id, opts: cell.opts.map(function (o) { return { t: o.t, c: o.correct }; }) };
      })
    });
  }
  function restoreProgress(p) {
    mode = p.mode || "practice"; setModeUI();
    session = {
      title: p.title, cur: p.cur || 0, timed: !!p.timed, secondsLeft: p.secondsLeft || 0,
      startedAt: p.startedAt || Date.now(), answers: p.answers, flags: p.flags,
      items: p.items.map(function (s) {
        var ref = DATA.find(function (x) { return x.id === s.id; }) || { id: s.id, q: "(missing)", sub: "", e: "", bank: "MASSIVE", pg: 0, type: "mc", o: [] };
        return { ref: ref, opts: s.opts.map(function (o) { return { t: o.t, correct: o.c }; }) };
      })
    };
    enterQuiz();
  }

  // ---------- Screen switching ----------
  function showScreen(id) {
    ["homeScreen", "quizScreen", "resultScreen"].forEach(function (s) { $(s).classList.toggle("active", s === id); });
    window.scrollTo(0, 0);
    if (id === "homeScreen") { refreshHistoryUI(); refreshMissedUI(); checkResume(); }
  }
  function goHome() {
    stopTimer(); session = null;
    $("navbar").hidden = true; $("timer").hidden = true; $("answeredStat").hidden = true;
    $("progressFill").style.width = "0";
    showScreen("homeScreen");
  }

  // ---------- Mode ----------
  function setMode(m) { mode = m; setModeUI(); }
  function setModeUI() {
    var p = mode === "practice";
    $("modePractice").classList.toggle("on", p); $("modePractice").setAttribute("aria-selected", p);
    $("modeExam").classList.toggle("on", !p); $("modeExam").setAttribute("aria-selected", !p);
    $("modeHint").textContent = p
      ? "Practice Mode shows whether each answer is correct immediately and explains why. Answers lock once chosen."
      : "Exam Mode hides all answers until you submit. You can change answers and revisit questions until then.";
  }

  // ---------- Toast ----------
  var toastTimer = null;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2000); }

  // ============================================================
  //  WIRE UP
  // ============================================================
  function init() {
    runDataAudit();
    runSelfTests();
    buildSubjectDropdown();
    setModeUI();
    showScreen("homeScreen");

    $("modePractice").addEventListener("click", function () { setMode("practice"); });
    $("modeExam").addEventListener("click", function () { setMode("exam"); });

    document.querySelectorAll(".testcard").forEach(function (card) {
      card.addEventListener("click", function () {
        var t = card.dataset.test;
        if (t === "massive") startTest(byBank("MASSIVE"), "Knowledge Test (200)", { timed: true });
        else if (t === "pink") startTest(byBank("PINK"), "Pink Sheet Skills (176)", { timed: false });
        else if (t === "combined") startTest(DATA.slice(), "Combined Test (376)", { timed: true });
        else if (t === "random") {
          var n = Math.min(Math.max(parseInt($("randSize").value, 10) || 25, 5), DATA.length);
          startTest(shuffle(DATA.slice()).slice(0, n), "Randomized Practice (" + n + ")", { timed: false, shuffle: true });
        }
      });
    });

    $("randSize").addEventListener("input", function () {
      var n = Math.min(Math.max(parseInt(this.value, 10) || 0, 1), DATA.length);
      $("randCount").textContent = isNaN(n) ? 25 : Math.max(5, n);
    });

    $("startSubjectBtn").addEventListener("click", function () {
      var val = $("subjectSelect").value; if (!val) return;
      var parts = val.split("|"); var bank = parts[0], sub = parts.slice(1).join("|");
      var items = DATA.filter(function (x) { return x.bank === bank && x.sub === sub; });
      startTest(items, sub, { timed: false });
    });

    $("retestMissedBtn").addEventListener("click", function () {
      var missed = lsGet(K_MISSED) || {}; var ids = Object.keys(missed);
      var items = DATA.filter(function (x) { return ids.indexOf(x.id) !== -1; });
      if (!items.length) { toast("No missed questions saved yet."); return; }
      startTest(items, "Retest: previously missed (" + items.length + ")", { timed: false, shuffle: true });
    });

    $("clearHistoryBtn").addEventListener("click", function () {
      if (confirm("Clear all saved scores and the missed-question list? This cannot be undone.")) {
        lsDel(K_HISTORY); lsDel(K_MISSED); refreshHistoryUI(); refreshMissedUI(); toast("History cleared");
      }
    });

    $("resumeBtn").addEventListener("click", function () { var p = lsGet(K_PROGRESS); if (p) restoreProgress(p); });
    $("discardBtn").addEventListener("click", function () { lsDel(K_PROGRESS); checkResume(); toast("Saved test discarded"); });

    // quiz nav
    $("prevBtn").addEventListener("click", function () { go(-1); });
    $("nextBtn").addEventListener("click", function () { go(1); });
    $("flagBtn").addEventListener("click", toggleFlag);
    $("paletteBtn").addEventListener("click", openDrawer);
    $("quitBtn").addEventListener("click", function () { if (confirm("Quit this test? Your progress is saved and you can resume from the home screen.")) { saveProgress(); goHome(); } });
    $("submitBtn").addEventListener("click", function () { finish(false); });
    $("drawerClose").addEventListener("click", closeDrawer);
    $("overlay").addEventListener("click", closeDrawer);
    $("drawerSubmit").addEventListener("click", function () { closeDrawer(); finish(false); });

    // results
    $("retakeBtn").addEventListener("click", function () {
      var srcItems = session.items.map(function (c) { return c.ref; });
      var timed = session.timed, title = session.title;
      startTest(srcItems, title, { timed: timed, shuffle: true });
    });
    $("reviewMissedResBtn").addEventListener("click", function () {
      var missItems = session.items.filter(function (cell, i) { var right = cell.opts.findIndex(function (o) { return o.correct; }); return session.answers[i] !== right; }).map(function (c) { return c.ref; });
      if (!missItems.length) { toast("No missed questions — perfect run!"); return; }
      startTest(missItems, "Retest missed (" + missItems.length + ")", { timed: false, shuffle: true });
    });
    $("printBtn").addEventListener("click", function () { window.print(); });
    $("exportBtn").addEventListener("click", exportResults);
    $("homeFromResultBtn").addEventListener("click", goHome);

    document.querySelectorAll("#reviewFilter .chip").forEach(function (c) {
      c.addEventListener("click", function () { reviewFilter = c.dataset.f; setFilterChips(); renderReview(); });
    });

    // keyboard
    document.addEventListener("keydown", function (e) {
      if (!$("quizScreen").classList.contains("active")) return;
      if ($("drawer").classList.contains("show")) { if (e.key === "Escape") closeDrawer(); return; }
      var cell = session.items[session.cur];
      var k = e.key.toLowerCase();
      if (e.key === "ArrowRight") { go(1); }
      else if (e.key === "ArrowLeft") { go(-1); }
      else if (k === "m") { toggleFlag(); }                 // M = mark for review
      else if (/^[1-4]$/.test(e.key)) { var idx = +e.key - 1; if (cell.opts[idx]) choose(idx); }
      else if (k === "t") { var ti = cell.opts.findIndex(function (o) { return o.t === "True"; }); if (ti > -1) choose(ti); }
      else if (k === "f") { var fi = cell.opts.findIndex(function (o) { return o.t === "False"; }); if (fi > -1) choose(fi); }
    });

    window.addEventListener("beforeunload", saveProgress);

    // practice target
    $("targetInput").value = getTarget();
    $("targetInput").addEventListener("change", function () { this.value = setTarget(this.value); toast("Practice target set to " + this.value + "%"); });

    // init count label
    $("randCount").textContent = $("randSize").value;
    checkResume();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
