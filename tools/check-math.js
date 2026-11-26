// Parses every \( ... \) segment with KaTeX and checks answers. Usage: node tools/check-math.js <path-to-katex>
const katex = require(process.argv[2] || 'katex');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} };
for (const f of ['gre.js', 'sat.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'), ctx);
let bad = 0, total = 0;
for (const bank of [ctx.window.BANK_GRE, ctx.window.BANK_SAT]) {
  for (const p of bank) {
    const fields = [p.q, p.qa, p.qb, p.expl, ...(p.choices || [])].filter(Boolean);
    for (const s of fields) {
      const re = /\\\((.+?)\\\)/gs; let m;
      while ((m = re.exec(s))) {
        total++;
        try { katex.renderToString(m[1], { throwOnError: true, strict: 'ignore' }); }
        catch (e) { bad++; if (bad < 25) console.log(p.id, p.tpl, '::', m[1].slice(0, 120), '\n   ', e.message.slice(0, 120)); }
      }
      const stripped = s.replace(/\\\(.+?\\\)/gs, '');
      if (/\\\(|\\\)/.test(stripped)) { bad++; console.log(p.id, 'unbalanced delimiters'); }
    }
  }
}
console.log(`math segments: ${total}, errors: ${bad}`);
