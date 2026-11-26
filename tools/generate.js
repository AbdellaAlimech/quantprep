// Builds data/gre.js and data/sat.js.  Run: node tools/generate.js
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const S = require('./shared');
const G = require('./gre');
const T = require('./sat');

function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

function build(exam, entries, n) {
  const X = { exam, n };
  const out = [], seen = new Set(), stats = {};
  for (const [name, fn, target] of entries) {
    L.setSeed(hash(exam + ':' + name));
    let made = 0, tries = 0;
    while (made < target && tries < target * 8) {
      tries++;
      let p;
      try { p = fn(X); } catch (e) { if (tries < 3) console.warn(`  ! ${exam}/${name}: ${e.message}`); continue; }
      const k = p.q + '|' + (p.qa || '') + '|' + (p.qb || '') + '|' + (p.choices || []).join('|') + '|' + p.type;
      const kq = p.q + '|' + (p.qa || '') + '|' + (p.qb || '');
      if (seen.has(k) || seen.has(kq)) continue;
      const err = validate(p, n);
      if (err) { console.warn(`  ! ${exam}/${name}: ${err}\n    ${p.q.slice(0, 160)}`); continue; }
      seen.add(k); seen.add(kq);
      p.tpl = name;
      out.push(p); made++;
    }
    stats[name] = made;
  }
  return { list: out, stats };
}

function validate(p, n) {
  const blob = JSON.stringify(p);
  if (/NaN|undefined|Infinity|\[object/.test(blob)) return 'bad token in ' + blob.slice(0, 300);
  if (!p.topic || !p.expl || !p.q && p.type !== 'qc') return 'missing field';
  if (p.type === 'mc') {
    if (p.choices.length !== n) return 'choice count ' + p.choices.length;
    if (new Set(p.choices).size !== p.choices.length) return 'duplicate choices';
    if (!(p.answer >= 0 && p.answer < n)) return 'answer index';
  } else if (p.type === 'qc') {
    if (!(p.answer >= 0 && p.answer < 4)) return 'qc answer';
  } else if (p.type === 'multi') {
    if (!p.answer.length || p.answer.length === p.choices.length) return 'multi answers';
    if (new Set(p.choices).size !== p.choices.length) return 'duplicate choices';
  } else if (p.type === 'num' || p.type === 'grid') {
    if (!isFinite(p.answer)) return 'numeric answer';
    if (p.type === 'grid' && p.answer < 0 && !/-/.test(p.ansText)) return 'grid sign';
  } else return 'type';
  return null;
}

// ---- GRE ----
const shared = S.templates;
const greEntries = [
  ...Object.entries(shared).map(([k, f]) => [k, f, 19]),
  ...Object.entries(G.qcTemplates).map(([k, f]) => [k, f, k === 'qcFamily' ? 60 : 24]),
  ...Object.entries(G.msTemplates).map(([k, f]) => [k, f, 22]),
  ...Object.entries(G.statTemplates).map(([k, f]) => [k, f, 22]),
];
// ---- SAT ----
const satSkip = new Set(['unitsDigit', 'inclusionExclusion', 'divisors', 'remainders', 'consecutive', 'combinatorics']);
const satEntries = [
  ...Object.entries(shared).filter(([k]) => !satSkip.has(k)).map(([k, f]) => [k, f, 16]),
  ...Object.entries(T.satTemplates).map(([k, f]) => [k, f, 20]),
];

const gre = build('gre', greEntries, 5);
const sat = build('sat', satEntries, 4);

function finalize(list, prefix) {
  return list.map((p, i) => {
    const o = { id: prefix + String(i + 1).padStart(4, '0'), ...p };
    // make < and > inside math safe for innerHTML
    const fix = (s) => typeof s === 'string' ? s.replace(/\\\((.+?)\\\)/gs, (m, inner) => '\\(' + inner.replace(/</g, '\\lt ').replace(/>/g, '\\gt ') + '\\)') : s;
    for (const k of ['q', 'qa', 'qb', 'expl']) if (o[k]) o[k] = fix(o[k]);
    if (o.choices) o.choices = o.choices.map(fix);
    return o;
  });
}
const greList = finalize(gre.list, 'G');
const satList = finalize(sat.list, 'S');
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'gre.js'), 'window.BANK_GRE=' + JSON.stringify(greList) + ';\n');
fs.writeFileSync(path.join(dataDir, 'sat.js'), 'window.BANK_SAT=' + JSON.stringify(satList) + ';\n');

function summary(name, list, stats) {
  const by = (f) => list.reduce((m, p) => ((m[f(p)] = (m[f(p)] || 0) + 1), m), {});
  console.log(`\n${name}: ${list.length} problems`);
  console.log('  by topic:', by((p) => p.topic));
  console.log('  by type :', by((p) => p.type));
  console.log('  by diff :', by((p) => p.diff));
  const low = Object.entries(stats).filter(([, v]) => v < 10);
  if (low.length) console.log('  low-yield templates:', low);
}
summary('GRE', greList, gre.stats);
summary('SAT', satList, sat.stats);
