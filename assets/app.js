(() => {
  'use strict';
  const BANKS = { gre: window.BANK_GRE || [], sat: window.BANK_SAT || [] };
  const EXAMS = {
    gre: {
      key: 'gre', name: 'GRE Quantitative', short: 'GRE', topics: ['Arithmetic', 'Algebra', 'Geometry', 'Data Analysis'],
      sections: [{ label: 'Section 1', sub: '12 questions · 21 minutes', n: 12, min: 21 }, { label: 'Section 2', sub: '15 questions · 26 minutes', n: 15, min: 26 }, { label: 'Full Quant', sub: '27 questions · 47 minutes', n: 27, min: 47 }],
      perQ: 105,
    },
    sat: {
      key: 'sat', name: 'SAT Math', short: 'SAT', topics: ['Algebra', 'Advanced Math', 'Problem Solving & Data Analysis', 'Geometry & Trigonometry'],
      sections: [{ label: 'Module 1', sub: '22 questions · 35 minutes', n: 22, min: 35 }, { label: 'Module 2', sub: '22 questions · 35 minutes', n: 22, min: 35 }, { label: 'Full Math', sub: '44 questions · 70 minutes', n: 44, min: 70 }],
      perQ: 95,
    },
  };
  const TYPE_LABEL = { mc: 'Multiple choice', qc: 'Quantitative comparison', multi: 'Select all that apply', num: 'Numeric entry', grid: 'Student-produced response' };
  const DIFF_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const LESSONS = window.GRE_LESSONS || [];
  const byId = {};
  for (const ex of ['gre', 'sat']) for (const p of BANKS[ex]) { p.exam = ex; byId[p.id] = p; }

  // ---------- storage ----------
  const KEY = 'qp_v1';
  let store = loadStore();
  function loadStore() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.att) return Object.assign({ att: {}, flags: {}, hist: [], days: {}, learn: {}, mocks: [] }, s); } catch (e) { /* ignore */ }
    return { att: {}, flags: {}, hist: [], days: {}, learn: {}, mocks: [] };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } }
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function record(p, ok) {
    const a = store.att[p.id] || { n: 0, c: 0 };
    a.n++; if (ok) a.c++; a.last = ok ? 1 : 0; a.t = Date.now();
    store.att[p.id] = a; store.days[today()] = (store.days[today()] || 0) + 1; save();
  }

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtTime = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
  function math(el) { if (window.renderMathInElement) window.renderMathInElement(el, { delimiters: [{ left: '\\(', right: '\\)', display: false }], throwOnError: false }); }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }
  const plain = (html) => html.replace(/<table[\s\S]*?<\/table>/g, ' [table] ').replace(/<br>/g, ' ').replace(/<[^>]+>/g, '');
  const letters = (p) => (p.type === 'qc' ? 'ABCD' : 'ABCDEFGH');
  function diffDots(d) { return `<span class="diff" title="${DIFF_LABEL[d]}">${[1, 2, 3].map((i) => `<i class="${i <= d ? 'on' : ''}"></i>`).join('')}</span>`; }

  function examStats(ex) {
    const bank = BANKS[ex]; let seen = 0, correct = 0, attempts = 0, corrAtt = 0;
    const topics = {};
    for (const t of EXAMS[ex].topics) topics[t] = { total: 0, seen: 0, n: 0, c: 0 };
    for (const p of bank) {
      const a = store.att[p.id], t = topics[p.topic];
      t.total++;
      if (a) { seen++; attempts += a.n; corrAtt += a.c; if (a.last) correct++; t.seen++; t.n += a.n; t.c += a.c; }
    }
    return { total: bank.length, seen, correct, attempts, corrAtt, acc: pct(corrAtt, attempts), topics };
  }
  function streak() {
    let s = 0; const d = new Date();
    if (!store.days[today()]) d.setDate(d.getDate() - 1);
    for (;;) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; if (store.days[k]) { s++; d.setDate(d.getDate() - 1); } else break; }
    return s;
  }

  // ---------- answer checking ----------
  function parseNum(s) {
    s = String(s ?? '').trim().replace(/,/g, '').replace(/\s+/g, '').replace(/^\$/, '').replace(/%$/, '').replace(/°$/, '');
    if (!s) return NaN;
    const m = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (m) return parseFloat(m[1]) / parseFloat(m[2]);
    if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function answered(p, r) {
    if (r == null) return false;
    if (p.type === 'multi') return r.length > 0;
    if (p.type === 'num' || p.type === 'grid') return String(r).trim() !== '';
    return true;
  }
  function isCorrect(p, r) {
    if (!answered(p, r)) return false;
    if (p.type === 'mc' || p.type === 'qc') return r === p.answer;
    if (p.type === 'multi') return r.length === p.answer.length && p.answer.every((i) => r.includes(i));
    const v = parseNum(r); if (isNaN(v)) return false;
    const tol = p.tol != null ? p.tol : Number.isInteger(p.answer) ? 1e-9 : 0.0011;
    return Math.abs(v - p.answer) <= tol;
  }
  function answerText(p) {
    if (p.type === 'mc' || p.type === 'qc') return `(${letters(p)[p.answer]}) ${p.choices[p.answer]}`;
    if (p.type === 'multi') return p.answer.map((i) => `(${letters(p)[i]}) ${p.choices[i]}`).join(', ');
    return `${p.pre || ''}${esc(p.ansText)}${p.post || ''}`;
  }

  // ---------- question selection ----------
  function pickIds(pool, n, prefer = 'unseen') {
    const unseen = [], seen = [];
    for (const p of shuffle(pool)) (store.att[p.id] ? seen : unseen).push(p);
    const ordered = prefer === 'unseen' ? [...unseen, ...seen] : shuffle(pool);
    return ordered.slice(0, n).map((p) => p.id);
  }
  function sectionIds(ex, n) {
    // stratify by topic and spread difficulty, like a real section
    const by = {}; for (const t of EXAMS[ex].topics) by[t] = shuffle(BANKS[ex].filter((p) => p.topic === t)).sort((a, b) => (store.att[a.id] ? 1 : 0) - (store.att[b.id] ? 1 : 0));
    const out = []; let i = 0; const ts = EXAMS[ex].topics;
    while (out.length < n) { const t = ts[i++ % ts.length]; const p = by[t].shift(); if (p) out.push(p); }
    const order = { qc: 0, mc: 1, multi: 1, num: 2, grid: 2 };
    return ex === 'gre' ? out.sort((a, b) => order[a.type] - order[b.type] || a.diff - b.diff).map((p) => p.id) : out.sort((a, b) => a.diff - b.diff).map((p) => p.id);
  }

  // ---------- session ----------
  let S = null, timerId = null;
  function startSession(o) {
    if (!o.ids.length) { toast('No questions match those filters.'); return; }
    S = { exam: o.exam, mode: o.mode || 'practice', title: o.title, ids: o.ids, i: 0, resp: {}, checked: {}, flags: {}, start: Date.now(), limit: o.limit || null, done: false, elapsed: 0, lesson: o.lesson, mock: o.mock };
    location.hash = '#/quiz';
    if (location.hash === '#/quiz') route();
  }
  function finishSession() {
    if (!S || S.done) return;
    clearInterval(timerId);
    S.done = true; S.elapsed = (Date.now() - S.start) / 1000;
    let correct = 0;
    S.ids.forEach((id) => {
      const p = byId[id], r = S.resp[id], ok = isCorrect(p, r);
      if (ok) correct++;
      if (S.mode === 'test' && answered(p, r)) record(p, ok);
      if (S.mode === 'test') S.checked[id] = true;
    });
    if (S.mock && S.mock.stage === 1) {
      M1 = { ids: S.ids, resp: S.resp, flags: S.flags, correct, elapsed: S.elapsed, used: S.mock.used, level: correct >= 8 ? 'hard' : correct <= 4 ? 'easy' : 'medium' };
      save(); location.hash = '#/mockbreak'; return;
    }
    if (S.mock && S.mock.stage === 2 && M1) {
      const c2 = correct, score = mockScore(M1.correct, c2, M1.level);
      S.mockResult = { c1: M1.correct, c2, level: M1.level, score, n1: M1.ids.length, n2: S.ids.length };
      S.ids = M1.ids.concat(S.ids); S.resp = Object.assign({}, M1.resp, S.resp);
      S.ids.forEach((id) => { S.checked[id] = true; });
      S.elapsed += M1.elapsed; correct += M1.correct; S.title = 'GRE Mock Test';
      store.mocks = [{ date: Date.now(), score, c1: M1.correct, c2, level: M1.level }, ...(store.mocks || [])].slice(0, 30);
      M1 = null;
    }
    store.hist.unshift({ exam: S.exam, title: S.mockResult ? `GRE Mock Test · est. ${S.mockResult.score}` : S.title, mode: S.mode, date: Date.now(), total: S.ids.length, correct, secs: Math.round(S.elapsed) });
    store.hist = store.hist.slice(0, 60); save();
    S.correct = correct;
    if (S.lesson != null) {
      const sc = pct(correct, S.ids.length), prev = store.learn[S.lesson] || {};
      store.learn[S.lesson] = { done: true, best: Math.max(prev.best || 0, sc), last: sc, date: Date.now() }; save();
    }
    location.hash = '#/results';
  }

  // ---------- views ----------
  function setNav(k) { $$('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === k)); }
  function route() {
    clearInterval(timerId);
    const h = location.hash.replace(/^#\/?/, '');
    const [a, b] = h.split('/');
    document.body.classList.toggle('sat-theme', a !== 'learn' && (a === 'sat' || (b === 'sat') || (S && S.exam === 'sat' && (a === 'quiz' || a === 'results'))));
    window.scrollTo(0, 0);
    if (a === 'gre' || a === 'sat') { setNav(a); return viewExam(a); }
    if (a === 'bank' && EXAMS[b]) { setNav(b); return viewBank(b); }
    if (a === 'stats') { setNav('stats'); return viewStats(); }
    if (a === 'learn' && LESSONS.length) { setNav('learn'); return b != null && LESSONS[+b - 1] ? viewLesson(+b - 1) : viewLearn(); }
    if (a === 'quiz' && S) { setNav(S.exam); return viewQuiz(); }
    if (a === 'mockbreak') { setNav('gre'); return viewMockBreak(); }
    if (a === 'results' && S && S.done) { setNav(S.exam); return viewResults(); }
    setNav(''); viewHome();
  }

  function viewHome() {
    const g = examStats('gre'), s = examStats('sat');
    const total = g.total + s.total;
    app.innerHTML = `
    <section class="hero">
      <div class="hero-art"><span>\\(x^2 - 5x + 6 = 0\\)</span><span>\\(\\tfrac{a}{b} \\gtrless 0.75\\)</span><span>\\(\\pi r^2 h\\)</span></div>
      <h1>Train smarter for <em>GRE Quant</em> and <em>SAT Math</em></h1>
      <p>${total.toLocaleString()} original practice problems with step-by-step solutions, real exam formats, timed sections and progress tracking. Free, and no account needed.</p>
      <div class="row">
        <a class="btn" href="#/gre">Start GRE practice</a>
        <a class="btn ghost" href="#/sat">Start SAT practice</a>
      </div>
      <div class="hero-stats">
        <div><b>${g.total.toLocaleString()}</b><span>GRE Quant problems</span></div>
        <div><b>${s.total.toLocaleString()}</b><span>SAT Math problems</span></div>
        <div><b>${streak()}</b><span>day streak</span></div>
      </div>
    </section>
    <div class="section-title"><h2>Choose your exam</h2></div>
    <div class="grid g2">
      ${examCard('gre', g, ['30-day study plan: one lesson and exercise set per day', 'Quantitative Comparison, multiple choice, select-all and numeric entry', 'Arithmetic, Algebra, Geometry, Data Analysis', 'Timed sections at real GRE pacing'])}
      ${examCard('sat', s, ['Multiple choice and student-produced responses (grid-ins)', 'Algebra, Advanced Math, Problem Solving & Data, Geometry & Trig', 'Digital SAT module pacing (22 questions / 35 min)'])}
    </div>
    <div class="section-title"><h2>Built for real progress</h2></div>
    <div class="grid g4">
      ${feature('🎯', 'Instant feedback', 'Check each answer and read a worked solution that explains the method and the common trap.')}
      ${feature('⏱️', 'Timed sections', 'Simulate exam conditions with a countdown, question navigator and flags for review.')}
      ${feature('📈', 'Track weak spots', 'Accuracy by topic shows where to focus. Retry only the questions you missed.')}
      ${feature('🧩', 'Custom drills', 'Build a set by topic, difficulty, question type and size, practice or timed.')}
    </div>`;
    math(app);
  }
  function examCard(ex, st, bullets) {
    const e = EXAMS[ex];
    return `<a class="card exam-card ${ex}" href="#/${ex}">
      <div class="row"><div class="tag">${e.short}</div><div><h3>${e.name}</h3><span class="tiny">${st.total.toLocaleString()} problems · ${e.topics.length} topics</span></div></div>
      <ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
      <div><div class="row tiny" style="margin-bottom:6px"><span>${st.seen} of ${st.total} attempted</span><span class="spacer"></span><span>${st.attempts ? st.acc + '% accuracy' : 'Not started'}</span></div>
      <div class="bar"><i style="width:${pct(st.seen, st.total)}%"></i></div></div>
    </a>`;
  }
  const feature = (ic, h, p) => `<div class="card feature"><div class="ic">${ic}</div><h4>${h}</h4><p>${p}</p></div>`;

  // ----- exam dashboard -----
  const builder = { gre: null, sat: null };
  function viewExam(ex) {
    const e = EXAMS[ex], st = examStats(ex), bank = BANKS[ex];
    const missed = bank.filter((p) => store.att[p.id] && !store.att[p.id].last);
    const flagged = bank.filter((p) => store.flags[p.id]);
    const b = builder[ex] || (builder[ex] = { topics: new Set(e.topics), diffs: new Set([1, 2, 3]), types: new Set(typesOf(ex)), n: 10, mode: 'practice', filter: 'all' });
    const btn = ex === 'sat' ? 'btn sat' : 'btn';
    app.innerHTML = `
      <div class="dash-head">
        <div class="logo" style="width:56px;height:56px;font-size:20px;border-radius:16px;${ex === 'sat' ? 'background:linear-gradient(135deg,#0ea5a4,#22c55e)' : ''}">${e.short}</div>
        <div><h1>${e.name}</h1><div class="muted">${st.total.toLocaleString()} problems with worked solutions</div></div>
        <span class="spacer"></span>
        <a class="btn ghost" href="#/bank/${ex}">Browse question bank →</a>
      </div>
      <div class="grid g4">
        <div class="card stat"><b>${st.seen}</b><span>questions attempted</span></div>
        <div class="card stat"><b>${st.attempts ? st.acc + '%' : '—'}</b><span>overall accuracy</span></div>
        <div class="card stat"><b>${missed.length}</b><span>to review (last try wrong)</span></div>
        <div class="card stat"><b>${streak()}</b><span>day streak</span></div>
      </div>
      ${ex === 'gre' && LESSONS.length ? learnBanner() : ''}
      <div class="section-title"><h2>Practice modes</h2></div>
      <div class="grid g3">
        <button class="card mode" data-act="quick"><span class="ic">⚡</span><h3>Quick 10</h3><p>Ten mixed questions you haven't seen yet, with instant feedback.</p></button>
        <button class="card mode" data-act="missed" ${missed.length ? '' : 'disabled style="opacity:.55;cursor:not-allowed"'}><span class="ic">🔁</span><h3>Review mistakes</h3><p>${missed.length ? `Retry the ${missed.length} question${missed.length === 1 ? '' : 's'} you got wrong last time.` : 'Questions you miss will collect here.'}</p></button>
        <button class="card mode" data-act="flagged" ${flagged.length ? '' : 'disabled style="opacity:.55;cursor:not-allowed"'}><span class="ic">🚩</span><h3>Flagged questions</h3><p>${flagged.length ? `${flagged.length} question${flagged.length === 1 ? '' : 's'} you flagged for later.` : 'Flag questions during practice to save them here.'}</p></button>
      </div>
      ${ex === 'gre' ? `<div class="section-title"><h2>Mock test</h2><span class="muted">Adaptive, like the real exam</span></div>${mockCard()}` : ''}
      <div class="section-title"><h2>Timed sections</h2><span class="muted">Exam conditions: no feedback until you finish</span></div>
      <div class="grid g3">
        ${e.sections.map((s, i) => `<button class="card mode" data-sec="${i}"><span class="ic">⏱️</span><h3>${s.label}</h3><p>${s.sub}</p></button>`).join('')}
      </div>
      <div class="section-title"><h2>Topics</h2></div>
      <div class="card">
        ${e.topics.map((t) => { const x = st.topics[t]; return `<div class="topic-row"><div class="name">${t}<small>${x.total} problems · ${x.seen} attempted</small></div><div class="bar"><i style="width:${pct(x.seen, x.total)}%"></i></div><div class="acc" style="color:${x.n ? (pct(x.c, x.n) >= 70 ? 'var(--ok)' : pct(x.c, x.n) >= 50 ? 'var(--warn)' : 'var(--bad)') : 'var(--ink3)'}">${x.n ? pct(x.c, x.n) + '%' : '—'}</div><button class="btn sm ghost" data-topic="${esc(t)}">Drill 10</button></div>`; }).join('')}
      </div>
      <div class="section-title"><h2>Build a custom set</h2></div>
      <div class="card pad builder" id="builder"></div>`;
    renderBuilder(ex, b, btn);
    app.onclick = (ev) => {
      const t = ev.target.closest('[data-act],[data-sec],[data-topic]'); if (!t || t.disabled) return;
      if (t.dataset.act === 'mock') return startMock();
      if (t.dataset.act === 'quick') startSession({ exam: ex, title: 'Quick 10', ids: pickIds(bank, 10) });
      if (t.dataset.act === 'missed') startSession({ exam: ex, title: 'Review mistakes', ids: shuffle(missed).slice(0, 30).map((p) => p.id) });
      if (t.dataset.act === 'flagged') startSession({ exam: ex, title: 'Flagged questions', ids: flagged.map((p) => p.id) });
      if (t.dataset.sec != null) { const s = e.sections[+t.dataset.sec]; startSession({ exam: ex, mode: 'test', title: `${e.short} ${s.label}`, ids: sectionIds(ex, s.n), limit: s.min * 60 }); }
      if (t.dataset.topic) startSession({ exam: ex, title: `${t.dataset.topic} drill`, ids: pickIds(bank.filter((p) => p.topic === t.dataset.topic), 10) });
    };
  }
  function typesOf(ex) { return ex === 'gre' ? ['mc', 'qc', 'multi', 'num'] : ['mc', 'grid']; }
  function renderBuilder(ex, b, btn) {
    const e = EXAMS[ex], el = $('#builder');
    const pool = () => BANKS[ex].filter((p) => b.topics.has(p.topic) && b.diffs.has(p.diff) && b.types.has(p.type) && (b.filter === 'all' || (b.filter === 'unseen' && !store.att[p.id]) || (b.filter === 'missed' && store.att[p.id] && !store.att[p.id].last)));
    const chip = (group, val, label, on) => `<span class="chip ${on ? 'on' : ''}" data-g="${group}" data-v="${esc(val)}">${label}</span>`;
    const draw = () => {
      const n = pool().length;
      el.innerHTML = `
        <label class="lbl">Topics</label><div class="chips">${e.topics.map((t) => chip('topics', t, t, b.topics.has(t))).join('')}</div>
        <label class="lbl">Difficulty</label><div class="chips">${[1, 2, 3].map((d) => chip('diffs', d, DIFF_LABEL[d], b.diffs.has(d))).join('')}</div>
        <label class="lbl">Question types</label><div class="chips">${typesOf(ex).map((t) => chip('types', t, TYPE_LABEL[t], b.types.has(t))).join('')}</div>
        <label class="lbl">Which questions</label><div class="chips">${[['all', 'All'], ['unseen', 'Not attempted'], ['missed', 'Missed last time']].map(([v, l]) => chip('filter', v, l, b.filter === v)).join('')}</div>
        <div class="grid g2" style="margin-top:6px">
          <div><label class="lbl">Number of questions</label><div class="chips">${[5, 10, 20, 30, 50].map((v) => chip('n', v, v, b.n === v)).join('')}</div></div>
          <div><label class="lbl">Mode</label><div class="chips">${chip('mode', 'practice', 'Practice · instant feedback', b.mode === 'practice')}${chip('mode', 'test', `Timed test · ${Math.round(e.perQ / 6) / 10} min per question`, b.mode === 'test')}</div></div>
        </div>
        <div class="row" style="margin-top:22px"><span class="muted">${n.toLocaleString()} matching question${n === 1 ? '' : 's'}</span><span class="spacer"></span><button class="${btn}" id="goBuild" ${n ? '' : 'disabled'}>Start ${Math.min(n, b.n)} questions →</button></div>`;
    };
    draw();
    el.onclick = (ev) => {
      ev.stopPropagation();
      const c = ev.target.closest('.chip');
      if (c) {
        const g = c.dataset.g, raw = c.dataset.v, v = g === 'diffs' || g === 'n' ? +raw : raw;
        if (g === 'n' || g === 'mode' || g === 'filter') b[g] = v;
        else { const s = b[g]; if (s.has(v)) { if (s.size > 1) s.delete(v); } else s.add(v); }
        return draw();
      }
      if (ev.target.id === 'goBuild') {
        const ids = pickIds(pool(), b.n);
        startSession({ exam: ex, mode: b.mode, title: 'Custom set', ids, limit: b.mode === 'test' ? Math.round((ids.length * e.perQ) / 60) * 60 : null });
      }
    };
  }

  // ----- quiz -----
  function viewQuiz() {
    const id = S.ids[S.i], p = byId[id], test = S.mode === 'test' && !S.done;
    const checked = !!S.checked[id] || S.done, r = S.resp[id];
    const ok = checked && isCorrect(p, r);
    const L = letters(p), btn = S.exam === 'sat' ? 'btn sat' : 'btn';
    const nAns = S.ids.filter((x) => answered(byId[x], S.resp[x])).length;
    const big = (h) => h.replace(/\\frac\{/g, '\\dfrac{');
    const qcBlock = p.type === 'qc' ? `<div class="qc-grid"><div class="qc-box"><h5>Quantity A</h5><div>${big(p.qa)}</div></div><div class="qc-box"><h5>Quantity B</h5><div>${big(p.qb)}</div></div></div>` : '';
    let answerUI = '';
    if (p.type === 'num' || p.type === 'grid') {
      const cls = checked ? (ok ? 'right' : 'wrong') : '';
      answerUI = `<div class="numin">${p.pre ? `<span>${p.pre}</span>` : ''}<input id="numIn" type="text" inputmode="decimal" autocomplete="off" placeholder="Your answer" value="${esc(r || '')}" class="${cls}" ${checked ? 'disabled' : ''}>${p.post ? `<span>${p.post}</span>` : ''}</div>
      <div class="hint-line">Enter an integer, decimal, or fraction such as 3/4.</div>`;
    } else {
      answerUI = `<div class="choices">${p.choices.map((c, i) => {
        const sel = p.type === 'multi' ? (r || []).includes(i) : r === i;
        const correct = p.type === 'multi' ? p.answer.includes(i) : p.answer === i;
        let cls = sel ? 'sel' : '';
        if (checked) cls = correct ? 'right' : sel ? 'wrong' : '';
        return `<button class="choice ${p.type === 'multi' ? 'multi' : ''} ${cls}" data-i="${i}" ${checked ? 'disabled' : ''}><span class="let">${L[i]}</span><span>${big(c)}</span></button>`;
      }).join('')}</div>`;
    }
    const fb = checked ? `<div class="feedback ${ok ? 'ok' : 'bad'}"><h4>${ok ? '✓ Correct' : answered(p, r) ? '✗ Not quite' : '— Not answered'}</h4>${ok ? '' : `<div style="margin-bottom:8px"><b>Correct answer:</b> ${answerText(p)}</div>`}<div class="expl">${p.expl}</div></div>` : '';
    const last = S.i === S.ids.length - 1;
    let actions;
    if (S.done) actions = `<button class="btn ghost" data-nav="-1" ${S.i ? '' : 'disabled'}>← Previous</button><button class="${btn}" data-nav="1" ${last ? 'disabled' : ''}>Next →</button><span class="spacer"></span><a class="btn ghost" href="#/results">Back to results</a>`;
    else if (test) actions = `<button class="btn ghost" data-nav="-1" ${S.i ? '' : 'disabled'}>← Previous</button>${last ? `<button class="${btn}" data-act="finish">Finish section</button>` : `<button class="${btn}" data-nav="1">Next →</button>`}<span class="spacer"></span><button class="btn ghost sm flag-btn ${S.flags[id] ? 'on' : ''}" data-act="mark">⚑ Mark for review</button>`;
    else actions = `${checked ? (last ? `<button class="${btn}" data-act="finish">See results</button>` : `<button class="${btn}" data-nav="1">Next question →</button>`) : `<button class="${btn}" data-act="check" ${answered(p, r) ? '' : 'disabled'}>Check answer</button>`}<button class="btn ghost" data-act="skip" ${checked ? 'style="display:none"' : ''}>${last ? 'Skip & finish' : 'Skip'}</button><span class="spacer"></span><button class="btn ghost sm flag-btn ${store.flags[id] ? 'on' : ''}" data-act="flag" title="Save to Flagged questions">⚑ ${store.flags[id] ? 'Flagged' : 'Flag'}</button>`;

    const timerHtml = S.limit && !S.done ? `<div class="timer" id="timer">${fmtTime(S.limit - (Date.now() - S.start) / 1000)}</div>` : !S.done ? `<div class="timer" id="timer" title="Elapsed">${fmtTime((Date.now() - S.start) / 1000)}</div>` : '';
    app.innerHTML = `
      <div class="qbar">
        <a class="btn ghost sm" href="#/${S.exam}" id="exitBtn">✕ Exit</a>
        <div><b>${esc(S.title)}</b><div class="tiny">${S.done ? 'Review' : test ? 'Timed test' : 'Practice'} · Question ${S.i + 1} of ${S.ids.length}</div></div>
        <div class="prog"><div class="bar"><i style="width:${pct(S.done ? S.ids.length : test ? nAns : Object.keys(S.checked).length, S.ids.length)}%"></i></div></div>
        ${timerHtml}
      </div>
      <div class="quiz">
        <div class="card qcard">
          <div class="qmeta"><span class="pill ${S.exam}">${EXAMS[S.exam].short}</span><span class="pill">${esc(p.topic)}</span>${p.skill !== TYPE_LABEL[p.type] ? `<span class="pill">${esc(p.skill)}</span>` : ''}<span class="pill">${TYPE_LABEL[p.type]}</span>${diffDots(p.diff)}<span class="spacer"></span><span class="tiny">#${p.id}</span></div>
          <div class="qtext">${p.type === 'qc' ? (p.q ? `<div style="text-align:center">${p.q}</div>` : '') + qcBlock + '<div class="tiny" style="margin-top:6px">Compare Quantity A and Quantity B.</div>' : p.q}${p.type === 'multi' ? '' : ''}</div>
          ${answerUI}
          ${fb}
          <div class="qactions">${actions}</div>
        </div>
        <aside class="card side">
          <h4>Questions</h4>
          <div class="navgrid">${S.ids.map((x, i) => {
            const q = byId[x]; let c = '';
            if (S.done || (S.checked[x] && S.mode === 'practice')) c = isCorrect(q, S.resp[x]) ? 'right' : S.checked[x] || S.done ? 'wrong' : '';
            else if (answered(q, S.resp[x])) c = 'ans';
            if (S.done && !answered(q, S.resp[x])) c = 'wrong';
            return `<button class="${c} ${i === S.i ? 'cur' : ''} ${(S.mode === 'test' ? S.flags[x] : store.flags[x]) ? 'flag' : ''}" data-go="${i}">${i + 1}</button>`;
          }).join('')}</div>
          <div class="legend">
            ${test ? `<span>${nAns} of ${S.ids.length} answered</span>` : ''}
            <span>${p.choices ? `<span class="kbd">A</span>–<span class="kbd">${L[p.choices.length - 1]}</span> choose · ` : ''}<span class="kbd">Enter</span> ${test ? 'next' : 'check / next'}</span>
            ${test ? '<span><span class="kbd">←</span> <span class="kbd">→</span> move between questions</span>' : ''}
          </div>
          ${!S.done ? `<button class="btn ghost sm" style="width:100%;margin-top:14px" data-act="finish">${test ? 'Finish section' : 'End session'}</button>` : ''}
        </aside>
      </div>`;
    math(app);
    const inp = $('#numIn');
    if (inp && !checked) {
      inp.oninput = () => { S.resp[id] = inp.value; const b = $('[data-act="check"]'); if (b) b.disabled = !answered(p, inp.value); refreshNavCell(); };
      if (window.matchMedia('(pointer:fine)').matches) inp.focus();
    }
    app.onclick = (ev) => {
      const t = ev.target.closest('button[data-i],button[data-act],button[data-nav],button[data-go]');
      if (!t || t.disabled) return;
      if (t.dataset.i != null) return choose(+t.dataset.i);
      if (t.dataset.nav) { S.i = Math.min(S.ids.length - 1, Math.max(0, S.i + +t.dataset.nav)); return viewQuiz(); }
      if (t.dataset.go) { S.i = +t.dataset.go; return viewQuiz(); }
      const a = t.dataset.act;
      if (a === 'check') return check();
      if (a === 'skip') { if (S.i === S.ids.length - 1) return finishSession(); S.i++; return viewQuiz(); }
      if (a === 'flag') { if (store.flags[id]) delete store.flags[id]; else store.flags[id] = 1; save(); toast(store.flags[id] ? 'Saved to Flagged questions' : 'Flag removed'); return viewQuiz(); }
      if (a === 'mark') { S.flags[id] = !S.flags[id]; return viewQuiz(); }
      if (a === 'finish') {
        if (test) { const left = S.ids.length - nAns; if (left && !confirm(`You have ${left} unanswered question${left === 1 ? '' : 's'}. Finish anyway?`)) return; }
        return finishSession();
      }
    };
    if (!S.done) {
      timerId = setInterval(() => {
        const el = $('#timer'); if (!el || !S) return clearInterval(timerId);
        const spent = (Date.now() - S.start) / 1000;
        if (S.limit) { const left = S.limit - spent; el.textContent = fmtTime(left); el.classList.toggle('low', left < 120); if (left <= 0) { toast("Time's up!"); finishSession(); } }
        else el.textContent = fmtTime(spent);
      }, 1000);
    }
  }
  function refreshNavCell() {
    if (!S || S.mode !== 'test') return;
    const cell = $(`.navgrid button[data-go="${S.i}"]`); if (cell) cell.classList.toggle('ans', answered(byId[S.ids[S.i]], S.resp[S.ids[S.i]]));
  }
  function choose(i) {
    const id = S.ids[S.i], p = byId[id];
    if (S.checked[id] || S.done) return;
    if (p.type === 'multi') { const r = new Set(S.resp[id] || []); r.has(i) ? r.delete(i) : r.add(i); S.resp[id] = [...r].sort((a, b) => a - b); }
    else S.resp[id] = i;
    viewQuiz();
  }
  function check() {
    const id = S.ids[S.i], p = byId[id];
    if (!answered(p, S.resp[id]) || S.checked[id]) return;
    S.checked[id] = true; record(p, isCorrect(p, S.resp[id]));
    viewQuiz();
  }
  document.addEventListener('keydown', (e) => {
    if (!S || !location.hash.startsWith('#/quiz') || e.ctrlKey || e.metaKey || e.altKey) return;
    const p = byId[S.ids[S.i]], inInput = e.target.tagName === 'INPUT';
    if (e.key === 'Enter') {
      e.preventDefault();
      const b = $('[data-act="check"]') || $('.qactions [data-nav="1"]') || $('.qactions [data-act="finish"]');
      if (b && !b.disabled) b.click();
      return;
    }
    if (inInput) return;
    if (S.mode === 'test' || S.done) {
      if (e.key === 'ArrowRight' && S.i < S.ids.length - 1) { S.i++; viewQuiz(); }
      if (e.key === 'ArrowLeft' && S.i > 0) { S.i--; viewQuiz(); }
    }
    if (p.choices && !S.checked[p.id] && !S.done) {
      let k = -1; const key = e.key.toUpperCase();
      if (/^[A-H]$/.test(key)) k = key.charCodeAt(0) - 65; else if (/^[1-8]$/.test(key)) k = +key - 1;
      if (k >= 0 && k < p.choices.length) choose(k);
    }
  });

  // ----- results -----
  function viewResults() {
    const e = EXAMS[S.exam], total = S.ids.length, c = S.correct, sc = pct(c, total);
    const byTopic = {};
    S.ids.forEach((id) => { const p = byId[id], t = byTopic[p.topic] || (byTopic[p.topic] = { n: 0, c: 0 }); t.n++; if (isCorrect(p, S.resp[id])) t.c++; });
    const R = 64, C = 2 * Math.PI * R, col = sc >= 75 ? 'var(--ok)' : sc >= 50 ? 'var(--warn)' : 'var(--bad)';
    const msg = sc >= 90 ? 'Outstanding work!' : sc >= 75 ? 'Strong performance.' : sc >= 50 ? 'Good effort, keep building.' : 'Every mistake is a lesson; review the solutions below.';
    const missedIds = S.ids.filter((id) => !isCorrect(byId[id], S.resp[id]));
    const mr = S.mockResult;
    const head = mr ? `
      <div class="card pad mock-result">
        <div class="mock-big"><b>${mr.score}</b><span>Estimated GRE Quant score<br>(scale 130–170)</span></div>
        <div style="flex:1;min-width:240px">
          <span class="pill gre">GRE · Adaptive mock test</span>
          <h1 style="font-size:28px;margin:10px 0 6px">${scoreBand(mr.score)}</h1>
          <div class="row" style="margin:12px 0">
            <span class="pill">Section 1: ${mr.c1}/${mr.n1}</span>
            <span class="pill ${mr.level === 'hard' ? 'ok' : mr.level === 'easy' ? 'bad' : ''}">Section 2 (${LEVEL_NAME[mr.level]}): ${mr.c2}/${mr.n2}</span>
            <span class="pill">Time ${fmtTime(S.elapsed)}</span>
          </div>
          <p class="tiny" style="margin:0 0 14px">${mr.level === 'hard' ? 'You reached the harder Section 2, which is needed for scores above about 160.' : mr.level === 'easy' ? 'Section 1 routed you to the easier Section 2, which caps the score near 160. Getting 8 or more right in Section 1 unlocks the harder section.' : 'You got the medium Section 2. Getting 8 or more right in Section 1 unlocks the harder section and a higher maximum score.'} This is an estimate: ETS doesn't publish its exact scoring, so this one is based on your accuracy and the difficulty of Section 2.</p>
          <div class="row">
            <a class="btn" href="#/quiz" id="reviewBtn">Review all 27 answers</a>
            ${missedIds.length ? `<button class="btn ghost" id="retryBtn">Retry ${missedIds.length} missed</button>` : ''}
            <a class="btn ghost" href="#/gre">Back to GRE dashboard</a>
          </div>
        </div>
      </div>` : '';
    app.innerHTML = mr ? head + `
      <div class="section-title"><h2>By topic</h2></div>
      <div class="card">${Object.entries(byTopic).map(([t, x]) => `<div class="topic-row"><div class="name">${t}<small>${x.c} of ${x.n} correct</small></div><div class="bar"><i style="width:${pct(x.c, x.n)}%"></i></div><div class="acc">${pct(x.c, x.n)}%</div><span></span></div>`).join('')}</div>
      <div class="section-title"><h2>Questions</h2></div>
      <div class="card">${S.ids.map((id, i) => { const p = byId[id], r = S.resp[id], ok = isCorrect(p, r), an = answered(p, r); return `${i === 0 ? '<div class="tiny" style="padding:10px 18px 0">Section 1</div>' : i === mr.n1 ? `<div class="tiny" style="padding:10px 18px 0;border-top:1px solid var(--line)">Section 2 · ${LEVEL_NAME[mr.level]}</div>` : ''}<div class="review-item" data-go="${i}"><span class="st ${ok ? 'ok' : an ? 'bad' : 'skip'}">${ok ? '✓' : an ? '✗' : '–'}</span><div><div class="pv">${i + 1}. ${esc(plain(p.type === 'qc' ? 'Compare: ' + p.qa + '  vs  ' + p.qb : p.q))}</div><span class="tiny">${esc(p.topic)} · ${esc(p.skill)} · ${DIFF_LABEL[p.diff]}</span></div><span class="tiny">View →</span></div>`; }).join('')}</div>` : `
      <div class="card pad" style="display:flex;gap:30px;align-items:center;flex-wrap:wrap">
        <div class="score-ring"><svg width="150" height="150"><circle cx="75" cy="75" r="${R}" fill="none" stroke="var(--bg2)" stroke-width="12"/><circle cx="75" cy="75" r="${R}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - sc / 100)}"/></svg><div class="lbl"><div><b>${sc}%</b><span>${c} / ${total} correct</span></div></div></div>
        <div style="flex:1;min-width:240px">
          <span class="pill ${S.exam}">${e.short} · ${S.mode === 'test' ? 'Timed test' : 'Practice'}</span>
          <h1 style="font-size:30px;margin:10px 0 6px">${esc(S.title)} complete</h1>
          <p class="muted" style="margin:0 0 16px">${msg} Time: <b>${fmtTime(S.elapsed)}</b>${total ? ` · ${fmtTime(S.elapsed / total)} per question` : ''}.</p>
          <div class="row">
            <a class="btn ${S.exam === 'sat' ? 'sat' : ''}" href="#/quiz" id="reviewBtn">Review answers</a>
            ${missedIds.length ? `<button class="btn ghost" id="retryBtn">Retry ${missedIds.length} missed</button>` : ''}
            ${S.lesson != null ? (LESSONS[S.lesson + 1] ? `<a class="btn ghost" href="#/learn/${S.lesson + 2}">Next lesson: Day ${S.lesson + 2} →</a>` : '<a class="btn ghost" href="#/learn">Study plan complete 🎉</a>') + `<a class="btn ghost" href="#/learn/${S.lesson + 1}">Back to lesson</a>` : `<a class="btn ghost" href="#/${S.exam}">Back to ${e.short} dashboard</a>`}
          </div>
        </div>
      </div>
      <div class="section-title"><h2>By topic</h2></div>
      <div class="card">${Object.entries(byTopic).map(([t, x]) => `<div class="topic-row"><div class="name">${t}<small>${x.c} of ${x.n} correct</small></div><div class="bar"><i style="width:${pct(x.c, x.n)}%"></i></div><div class="acc">${pct(x.c, x.n)}%</div><span></span></div>`).join('')}</div>
      <div class="section-title"><h2>Questions</h2></div>
      <div class="card">${S.ids.map((id, i) => { const p = byId[id], r = S.resp[id], ok = isCorrect(p, r), an = answered(p, r); return `<div class="review-item" data-go="${i}"><span class="st ${ok ? 'ok' : an ? 'bad' : 'skip'}">${ok ? '✓' : an ? '✗' : '–'}</span><div><div class="pv">${i + 1}. ${esc(plain(p.type === 'qc' ? 'Compare: ' + p.qa + '  vs  ' + p.qb : p.q))}</div><span class="tiny">${esc(p.topic)} · ${esc(p.skill)} · ${DIFF_LABEL[p.diff]}</span></div><span class="tiny">View →</span></div>`; }).join('')}</div>`;
    math(app);
    app.onclick = (ev) => {
      const it = ev.target.closest('[data-go]');
      if (it) { S.i = +it.dataset.go; location.hash = '#/quiz'; return; }
      if (ev.target.id === 'reviewBtn') S.i = 0;
      if (ev.target.id === 'retryBtn') startSession({ exam: S.exam, title: 'Retry missed', ids: missedIds });
    };
  }

  // ----- mock test -----
  const MOCK_MIX = { s1: [0.25, 0.5, 0.25], easy: [0.45, 0.5, 0.05], medium: [0.2, 0.55, 0.25], hard: [0, 0.35, 0.65] };
  const MOCK_TYPES = {
    12: ['qc', 'qc', 'qc', 'qc', 'mc', 'mc', 'mc', 'mc', 'mc', 'multi', 'num', 'num'],
    15: ['qc', 'qc', 'qc', 'qc', 'qc', 'mc', 'mc', 'mc', 'mc', 'mc', 'mc', 'multi', 'multi', 'num', 'num'],
  };
  const LEVEL_W = { easy: 0.75, medium: 1, hard: 1.25 };
  const LEVEL_NAME = { easy: 'Easier', medium: 'Medium', hard: 'Harder' };
  let M1 = null;
  function pickDiff(w) { const r = Math.random(); return r < w[0] ? 1 : r < w[0] + w[1] ? 2 : 3; }
  function mockIds(n, weights, used) {
    const topics = shuffle(EXAMS.gre.topics), out = [];
    MOCK_TYPES[n].forEach((ty, k) => {
      const want = pickDiff(weights), topic = topics[k % topics.length];
      const pool = BANKS.gre.filter((p) => p.type === ty && !used.has(p.id));
      const tiers = [(p) => p.topic === topic && p.diff === want && !store.att[p.id], (p) => p.diff === want && !store.att[p.id], (p) => p.diff === want, () => true];
      for (const f of tiers) { const c = pool.filter(f); if (c.length) { const p = c[Math.floor(Math.random() * c.length)]; used.add(p.id); out.push(p); break; } }
    });
    const order = { qc: 0, mc: 1, multi: 1, num: 1 };
    return out.sort((a, b) => order[a.type] - order[b.type] || a.diff - b.diff).map((p) => p.id);
  }
  function mockScore(c1, c2, level) {
    const pts = c1 + LEVEL_W[level] * c2, max = 12 + 15 * LEVEL_W.hard;
    return Math.max(130, Math.min(170, Math.round(130 + (40 * pts) / max)));
  }
  function scoreBand(s) {
    if (s >= 165) return 'Top tier: competitive even for the most selective programs.';
    if (s >= 160) return 'Strong: competitive for most engineering and science master\'s programs.';
    if (s >= 155) return 'Solid, but below what many engineering programs look for. Push the hard topics.';
    if (s >= 150) return 'Developing: follow the 30-day plan and retake a mock in a week.';
    return 'Early stage: start with the Learn section, one topic a day.';
  }
  function startMock() {
    const used = new Set();
    M1 = null;
    startSession({ exam: 'gre', mode: 'test', title: 'GRE Mock · Section 1 of 2', ids: mockIds(12, MOCK_MIX.s1, used), limit: 21 * 60, mock: { stage: 1, used } });
  }
  function startMock2() {
    if (!M1) return startMock();
    startSession({ exam: 'gre', mode: 'test', title: 'GRE Mock · Section 2 of 2', ids: mockIds(15, MOCK_MIX[M1.level], M1.used), limit: 26 * 60, mock: { stage: 2 } });
  }
  function viewMockBreak() {
    if (!M1) { location.hash = '#/gre'; return; }
    app.innerHTML = `
      <div class="card pad mock-break">
        <div class="big-ic">✅</div>
        <h1>Section 1 complete</h1>
        <p class="muted">Section 2 has <b>15 questions</b> and <b>26 minutes</b>. As on the real GRE, its difficulty depends on how you did in Section 1. You'll see your score at the end.</p>
        <div class="row" style="justify-content:center;margin-top:8px"><button class="btn" id="go2">Start Section 2 →</button></div>
        <p class="tiny" style="margin-top:18px">Take a short breath, but don't wait too long; on test day there is no break between the quant sections.</p>
      </div>`;
    $('#go2').onclick = startMock2;
  }
  function mockCard() {
    const ms = store.mocks || [], last = ms[0], best = ms.length ? Math.max(...ms.map((m) => m.score)) : null;
    return `<div class="card mock-card">
      <div class="mock-l">
        <span class="pill gre">Recommended weekly</span>
        <h3>🎓 Full GRE Quant mock test</h3>
        <p class="muted">Two sections that adapt like the real GRE: 12 questions in 21 min, then 15 questions in 26 min. Section 2 gets harder or easier based on Section 1. You get an estimated score from 130 to 170.</p>
        <button class="btn" data-act="mock">Start mock test</button>
      </div>
      <div class="mock-r">
        ${last ? `<div class="mock-score"><b>${last.score}</b><span>last estimate</span></div><div class="tiny">Best ${best} · ${ms.length} test${ms.length === 1 ? '' : 's'} taken</div>
          <div class="mock-hist">${ms.slice(0, 6).reverse().map((m) => `<i style="height:${Math.max(6, ((m.score - 130) / 40) * 56)}px" title="${m.score} on ${new Date(m.date).toLocaleDateString()}"></i>`).join('')}</div>`
          : '<div class="mock-score"><b>—</b><span>no mock yet</span></div><div class="tiny">Take one now to get your starting score.</div>'}
      </div>
    </div>`;
  }

  // ----- learn -----
  const nextLesson = () => { const i = LESSONS.findIndex((_, k) => !(store.learn[k] && store.learn[k].done)); return i < 0 ? null : i; };
  const lessonPool = (i) => BANKS.gre.filter((p) => LESSONS[i].tpl.includes(p.tpl));
  const doneCount = () => LESSONS.filter((_, k) => store.learn[k] && store.learn[k].done).length;
  const AREA_IC = { Arithmetic: '🔢', Algebra: '✖️', Geometry: '📐', 'Data Analysis': '📊', Strategy: '🧠' };
  function learnBanner() {
    const n = nextLesson(), done = doneCount();
    return `<a class="card learn-banner" href="#/learn${n == null ? '' : '/' + (n + 1)}">
      <div class="lb-ic">📚</div>
      <div style="flex:1;min-width:0"><div class="tiny">30-day study plan · ${done}/${LESSONS.length} days done</div>
      <b>${n == null ? 'All lessons complete. Review any day.' : `Today: Day ${n + 1} · ${esc(LESSONS[n].title)}`}</b>
      <div class="bar" style="margin-top:8px"><i style="width:${pct(done, LESSONS.length)}%"></i></div></div>
      <span class="btn sm">${n == null ? 'Open plan' : done ? 'Continue →' : 'Start →'}</span></a>`;
  }
  function viewLearn() {
    const n = nextLesson(), done = doneCount();
    const weeks = []; for (let i = 0; i < LESSONS.length; i += 7) weeks.push([i, Math.min(i + 7, LESSONS.length)]);
    const weekName = ['Week 1 · Arithmetic foundations', 'Week 2 · Algebra', 'Week 3 · Word problems, QC & triangles', 'Week 4 · Geometry & statistics', 'Week 5 · Counting & probability'];
    app.innerHTML = `
      <div class="dash-head">
        <div class="logo" style="width:56px;height:56px;font-size:24px;border-radius:16px">📚</div>
        <div><h1>GRE Quant · 30-day plan</h1><div class="muted">One topic a day: read the lesson, then do the exercises.</div></div>
      </div>
      <div class="card pad learn-hero">
        <div style="flex:1;min-width:240px">
          <div class="tiny">${done} of ${LESSONS.length} days complete</div>
          <div class="bar" style="margin:8px 0 16px;height:10px"><i style="width:${pct(done, LESSONS.length)}%"></i></div>
          ${n == null ? '<h2>🎉 You finished the plan!</h2><p class="muted">Now take timed sections to build speed, and go back to any lesson where your score was low.</p><a class="btn" href="#/gre">Go to timed sections</a>'
            : `<span class="pill gre">Today · Day ${n + 1}</span><h2 style="margin:10px 0 6px">${esc(LESSONS[n].title)}</h2><p class="muted" style="margin:0 0 16px">${LESSONS[n].intro}</p><a class="btn" href="#/learn/${n + 1}">Start today's lesson →</a>`}
        </div>
      </div>
      ${weeks.map(([a, b], w) => `<div class="section-title"><h2>${weekName[w] || 'Week ' + (w + 1)}</h2></div>
        <div class="grid g3">${LESSONS.slice(a, b).map((l, j) => { const i = a + j, st = store.learn[i];
          return `<a class="card day-card ${st && st.done ? 'done' : ''} ${i === n ? 'next' : ''}" href="#/learn/${i + 1}">
            <div class="row"><span class="day-num">${st && st.done ? '✓' : i + 1}</span><span class="tiny">Day ${i + 1} · ${AREA_IC[l.area] || ''} ${l.area}</span></div>
            <h3>${esc(l.title)}</h3>
            <span class="tiny">${st && st.done ? (st.best ? `Best score ${st.best}%` : 'Marked as learned') : i === n ? 'Up next' : `${Math.min(12, lessonPool(i).length)} exercises`}</span></a>`; }).join('')}</div>`).join('')}`;
    math(app);
  }
  function viewLesson(i) {
    const l = LESSONS[i], st = store.learn[i], pool = lessonPool(i);
    const seen = pool.filter((p) => store.att[p.id]).length;
    app.innerHTML = `
      <div class="row" style="margin-bottom:14px"><a class="btn ghost sm" href="#/learn">← Study plan</a><span class="spacer"></span>
        ${i > 0 ? `<a class="btn ghost sm" href="#/learn/${i}">← Day ${i}</a>` : ''}${LESSONS[i + 1] ? `<a class="btn ghost sm" href="#/learn/${i + 2}">Day ${i + 2} →</a>` : ''}</div>
      <div class="lesson">
        <article class="card lesson-body">
          <div class="qmeta"><span class="pill gre">Day ${i + 1} of ${LESSONS.length}</span><span class="pill">${AREA_IC[l.area] || ''} ${l.area}</span>${st && st.done ? `<span class="pill ok">✓ Completed${st.best ? ' · best ' + st.best + '%' : ''}</span>` : ''}</div>
          <h1>${esc(l.title)}</h1>
          <p class="lead">${l.intro}</p>
          <h2>Key ideas</h2>
          <div class="keys">${l.keys.map(([h, b], k) => `<div class="key"><div class="key-n">${k + 1}</div><div><h4>${h}</h4><p>${b}</p></div></div>`).join('')}</div>
          <h2>Worked example</h2>
          <div class="example"><p><b>Question.</b> ${l.example.q}</p>
            <div id="sol" hidden><p><b>Solution.</b> ${l.example.a}</p></div>
            <button class="btn ghost sm" id="solBtn">Show solution</button></div>
          <h2>Common traps</h2>
          <ul class="traps">${l.traps.map((t) => `<li>${t}</li>`).join('')}</ul>
          <div class="tipbox"><b>💡 Strategy tip.</b> ${l.tip}</div>
          <div class="row" style="margin-top:26px"><button class="btn" data-practice>✍️ Start today's exercises</button></div>
        </article>
        <aside class="card side lesson-side">
          <h4>Today's exercises</h4>
          <p class="muted" style="margin:0 0 14px;font-size:14.5px">12 questions on this topic, with instant feedback and a worked solution for each.</p>
          <button class="btn" data-practice style="width:100%">✍️ Start exercises</button>
          <div class="tiny" style="margin-top:12px">${pool.length} questions available for this topic · ${seen} attempted${st && st.done && st.best ? ` · last score ${st.last}%` : ''}</div>
          <div class="tiny" style="margin-top:6px">Finishing the set marks Day ${i + 1} as complete. Aim for 80% or more before moving on; you can repeat the set for new questions.</div>
          <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
          <button class="btn ghost sm" id="markBtn" style="width:100%">${st && st.done ? 'Mark as not done' : 'Mark as learned'}</button>
        </aside>
      </div>`;
    math(app);
    $('#solBtn').onclick = (ev) => { $('#sol').hidden = false; ev.target.remove(); };
    $$('[data-practice]').forEach((b) => { b.onclick = () => startSession({ exam: 'gre', title: `Day ${i + 1}: ${l.title}`, ids: pickIds(pool, 12), lesson: i }); });
    $('#markBtn').onclick = () => { if (st && st.done) delete store.learn[i]; else store.learn[i] = { done: true, best: 0, last: 0, date: Date.now() }; save(); viewLesson(i); };
  }

  // ----- bank -----
  const bankState = { gre: { q: '', topic: '', diff: '', type: '', status: '', page: 0 }, sat: { q: '', topic: '', diff: '', type: '', status: '', page: 0 } };
  function viewBank(ex) {
    const e = EXAMS[ex], f = bankState[ex];
    app.innerHTML = `
      <div class="dash-head"><div><h1>${e.short} question bank</h1><div class="muted">Search and filter all ${BANKS[ex].length.toLocaleString()} problems</div></div><span class="spacer"></span><a class="btn ghost" href="#/${ex}">← ${e.short} dashboard</a></div>
      <div class="bank-filters">
        <input type="search" id="bq" placeholder="Search text or skill, e.g. “percent”, “circle”, “median”" value="${esc(f.q)}">
        <select id="btopic"><option value="">All topics</option>${e.topics.map((t) => `<option ${f.topic === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select id="bdiff"><option value="">Any difficulty</option>${[1, 2, 3].map((d) => `<option value="${d}" ${f.diff == d ? 'selected' : ''}>${DIFF_LABEL[d]}</option>`).join('')}</select>
        <select id="btype"><option value="">All types</option>${typesOf(ex).map((t) => `<option value="${t}" ${f.type === t ? 'selected' : ''}>${TYPE_LABEL[t]}</option>`).join('')}</select>
        <select id="bstatus"><option value="">Any status</option>${[['new', 'Not attempted'], ['right', 'Correct last time'], ['wrong', 'Wrong last time'], ['flag', 'Flagged']].map(([v, l]) => `<option value="${v}" ${f.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <div id="bankOut"></div>`;
    const out = $('#bankOut');
    const filtered = () => {
      const q = f.q.trim().toLowerCase();
      return BANKS[ex].filter((p) => {
        if (f.topic && p.topic !== f.topic) return false;
        if (f.diff && p.diff != f.diff) return false;
        if (f.type && p.type !== f.type) return false;
        const a = store.att[p.id];
        if (f.status === 'new' && a) return false;
        if (f.status === 'right' && !(a && a.last)) return false;
        if (f.status === 'wrong' && !(a && !a.last)) return false;
        if (f.status === 'flag' && !store.flags[p.id]) return false;
        if (q && !(p.skill.toLowerCase().includes(q) || plain(p.q + ' ' + (p.qa || '') + ' ' + (p.qb || '')).toLowerCase().includes(q) || p.id.toLowerCase() === q)) return false;
        return true;
      });
    };
    const draw = () => {
      const list = filtered(), per = 20, pages = Math.max(1, Math.ceil(list.length / per));
      f.page = Math.min(f.page, pages - 1);
      const slice = list.slice(f.page * per, f.page * per + per);
      out.innerHTML = list.length ? `
        <div class="row" style="margin-bottom:12px"><span class="muted">${list.length.toLocaleString()} question${list.length === 1 ? '' : 's'}</span><span class="spacer"></span><button class="btn sm ${ex === 'sat' ? 'sat' : ''}" id="practiceFiltered">Practice ${Math.min(20, list.length)} of these</button></div>
        <div class="card bank-list">${slice.map((p) => { const a = store.att[p.id]; return `<div class="review-item" data-id="${p.id}"><span class="tiny">#${p.id}</span><div><div class="pv">${esc(plain(p.type === 'qc' ? `Compare: ${p.q ? p.q + ' · ' : ''}${p.qa}  vs  ${p.qb}` : p.q))}</div><span class="tiny">${esc(p.topic)} · ${esc(p.skill)} · ${TYPE_LABEL[p.type]} · ${DIFF_LABEL[p.diff]}${store.flags[p.id] ? ' · ⚑' : ''}</span></div>${a ? `<span class="pill ${a.last ? 'ok' : 'bad'}">${a.last ? 'Correct' : 'Missed'}</span>` : '<span class="pill">New</span>'}</div>`; }).join('')}</div>
        <div class="pager"><button class="btn ghost sm" data-pg="-1" ${f.page ? '' : 'disabled'}>← Prev</button><span class="tiny">Page ${f.page + 1} of ${pages}</span><button class="btn ghost sm" data-pg="1" ${f.page < pages - 1 ? '' : 'disabled'}>Next →</button></div>`
        : '<div class="card empty"><div class="big">🔍</div><p>No questions match these filters.</p></div>';
      out.onclick = (ev) => {
        const it = ev.target.closest('[data-id]'); if (it) return startSession({ exam: ex, title: `Question #${it.dataset.id}`, ids: [it.dataset.id] });
        const pg = ev.target.closest('[data-pg]'); if (pg && !pg.disabled) { f.page += +pg.dataset.pg; draw(); window.scrollTo(0, 0); return; }
        if (ev.target.id === 'practiceFiltered') startSession({ exam: ex, title: 'Bank selection', ids: shuffle(list).slice(0, 20).map((p) => p.id) });
      };
    };
    draw();
    let deb;
    $('#bq').oninput = (ev) => { clearTimeout(deb); deb = setTimeout(() => { f.q = ev.target.value; f.page = 0; draw(); }, 150); };
    for (const [sel, k] of [['#btopic', 'topic'], ['#bdiff', 'diff'], ['#btype', 'type'], ['#bstatus', 'status']]) $(sel).onchange = (ev) => { f[k] = ev.target.value; f.page = 0; draw(); };
  }

  // ----- stats -----
  function viewStats() {
    const days = []; const d = new Date(); d.setDate(d.getDate() - 89);
    for (let i = 0; i < 90; i++) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; days.push(store.days[k] || 0); d.setDate(d.getDate() + 1); }
    const totalDone = Object.values(store.days).reduce((a, b) => a + b, 0);
    app.innerHTML = `
      <div class="dash-head"><div><h1>Your progress</h1><div class="muted">Saved in this browser. No account needed.</div></div><span class="spacer"></span><button class="btn ghost sm" id="resetBtn">Reset progress</button></div>
      <div class="grid g4">
        <div class="card stat"><b>${totalDone.toLocaleString()}</b><span>answers submitted</span></div>
        <div class="card stat"><b>${streak()}</b><span>day streak</span></div>
        <div class="card stat"><b>${store.hist.length}</b><span>sessions completed</span></div>
        <div class="card stat"><b>${Object.keys(store.flags).length}</b><span>flagged questions</span></div>
      </div>
      <div class="section-title"><h2>Activity · last 90 days</h2></div>
      <div class="card pad"><div class="heat">${days.map((n) => `<i class="${n === 0 ? '' : n < 10 ? 'l1' : n < 25 ? 'l2' : 'l3'}" title="${n} answers"></i>`).join('')}</div></div>
      <div class="grid g2" style="margin-top:18px">${['gre', 'sat'].map((ex) => { const st = examStats(ex); return `<div class="card ${ex === 'sat' ? 'sat-theme' : ''}"><div class="pad" style="padding-bottom:8px"><div class="row"><span class="pill ${ex}">${EXAMS[ex].short}</span><b>${EXAMS[ex].name}</b><span class="spacer"></span><span class="tiny">${st.seen}/${st.total} attempted · ${st.attempts ? st.acc + '% accuracy' : 'no attempts yet'}</span></div></div>${EXAMS[ex].topics.map((t) => { const x = st.topics[t]; return `<div class="topic-row" style="grid-template-columns:1fr 90px 50px"><div class="name">${t}<small>${x.seen}/${x.total} attempted</small></div><div class="bar"><i style="width:${pct(x.c, x.n)}%"></i></div><div class="acc">${x.n ? pct(x.c, x.n) + '%' : '—'}</div></div>`; }).join('')}</div>`; }).join('')}</div>
      <div class="section-title"><h2>Recent sessions</h2></div>
      <div class="card">${store.hist.length ? store.hist.slice(0, 25).map((h) => `<div class="review-item" style="cursor:default"><span class="st ${pct(h.correct, h.total) >= 70 ? 'ok' : 'bad'}">${pct(h.correct, h.total)}</span><div><div class="pv" style="color:var(--ink)"><span class="pill ${h.exam}">${EXAMS[h.exam].short}</span> ${esc(h.title)} · ${h.mode === 'test' ? 'Timed' : 'Practice'}</div><span class="tiny">${new Date(h.date).toLocaleString()} · ${h.correct}/${h.total} correct · ${fmtTime(h.secs)}</span></div><span></span></div>`).join('') : '<div class="empty"><div class="big">📊</div><p>Finish a practice set and your sessions will appear here.</p></div>'}</div>`;
    $('#resetBtn').onclick = () => { if (confirm('Erase all saved progress, flags and history in this browser? This cannot be undone.')) { store = { att: {}, flags: {}, hist: [], days: {}, learn: {}, mocks: [] }; save(); toast('Progress reset'); viewStats(); } };
  }

  // ---------- theme ----------
  $('#themeBtn').onclick = () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('qp_theme', next); } catch (e) { /* ignore */ }
  };

  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => { if (S && !S.done && S.mode === 'test' && location.hash === '#/quiz') { e.preventDefault(); e.returnValue = ''; } });
  route();
})();
