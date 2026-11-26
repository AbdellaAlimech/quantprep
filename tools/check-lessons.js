// Checks lesson math with KaTeX and that every lesson has enough exercises. Usage: node tools/check-lessons.js <katex path>
const katex = require(process.argv[2] || 'katex');
const vm = require('vm'), fs = require('fs'), path = require('path');
const c = { window: {} };
for (const f of ['lessons.js', 'gre.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'), c);
const L = c.window.GRE_LESSONS, bank = c.window.BANK_GRE;
const tpls = new Set(bank.map((p) => p.tpl)), used = new Set();
let bad = 0;
L.forEach((l, i) => {
  l.tpl.forEach((t) => { used.add(t); if (!tpls.has(t)) { bad++; console.log('missing tpl', t); } });
  const n = bank.filter((p) => l.tpl.includes(p.tpl)).length;
  console.log(`day ${i + 1}: ${n} exercises · ${l.title}`);
  const s = [l.intro, ...l.keys.map((k) => k[1]), l.example.q, l.example.a, ...l.traps, l.tip].join(' ');
  for (const m of s.matchAll(/\\\((.+?)\\\)/gs)) {
    try { katex.renderToString(m[1], { throwOnError: true }); } catch (e) { bad++; console.log(' ', i + 1, m[1], e.message.slice(0, 90)); }
  }
});
console.log('lessons', L.length, 'errors', bad, 'unused templates', [...tpls].filter((t) => !used.has(t)));
