// Shared helpers for the problem generators.
const R = String.raw;
let rand = Math.random;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function setSeed(s) { rand = mulberry32(s); }
const rf = () => rand();
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (a) => a[Math.floor(rand() * a.length)];
const nz = (a, b) => { let v; do { v = ri(a, b); } while (v === 0); return v; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const rnd = (x, d = 4) => { const p = 10 ** d; return Math.round((x + Number.EPSILON * Math.sign(x)) * p) / p; };
const M = (s) => `\\(${s}\\)`;

// plain-text number with commas
function nf(x) {
  x = rnd(x, 4);
  const neg = x < 0;
  let s = Math.abs(x).toString();
  if (s.includes('e')) s = Math.abs(x).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  let [i, f] = s.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + i + (f ? '.' + f : '');
}
// number for math mode (commas wrapped so KaTeX doesn't add spacing)
const nm = (x) => nf(x).replace(/,/g, '{,}');
function money(x) {
  x = Math.round(x * 100) / 100;
  if (Number.isInteger(x)) return nf(x);
  const [i, f] = Math.abs(x).toFixed(2).split('.');
  return (x < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + f;
}
function fr(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return String(n);
  return (n < 0 ? '-' : '') + R`\frac{${Math.abs(n)}}{${d}}`;
}
function frt(n, d) { // text fraction a/b
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
}
// coefficient * pi
function piStr(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return n === 1 ? R`\pi` : n === -1 ? R`-\pi` : `${n}\\pi`;
  return (n < 0 ? '-' : '') + R`\frac{${Math.abs(n) === 1 ? '' : Math.abs(n)}\pi}{${d}}`;
}
// c * sqrt(r)
function radStr(c, r) {
  if (r === 1) return String(c);
  return (c === 1 ? '' : c === -1 ? '-' : String(c)) + R`\sqrt{${r}}`;
}
function term(c, v, first) {
  if (c === 0) return '';
  const a = Math.abs(c);
  const coef = v && a === 1 ? '' : nm(a);
  return first ? (c < 0 ? '-' : '') + coef + v : (c < 0 ? ' - ' : ' + ') + coef + v;
}
function poly(pairs) {
  let out = '', first = true;
  for (const [c, v] of pairs) { if (c === 0) continue; out += term(c, v, first); first = false; }
  return out || '0';
}
const lin = (a, b, v = 'x') => poly([[a, v], [b, '']]);
const sgn = (b) => (b < 0 ? `- ${nm(-b)}` : `+ ${nm(b)}`); // "+ 3" / "- 3"

function key(v) { return typeof v === 'number' ? String(rnd(v, 6)) : String(v); }
function mkChoices(ans, wrongs, n, fmt, order) {
  fmt = fmt || ((v) => (typeof v === 'number' ? M(nm(v)) : v));
  const seen = new Set([key(ans)]), list = [];
  for (const w of wrongs) {
    if (w == null) continue;
    if (typeof w === 'number' && !isFinite(w)) continue;
    const k = key(w); if (seen.has(k)) continue;
    seen.add(k); list.push(w);
  }
  let guard = 0;
  while (list.length < n - 1 && guard++ < 500) {
    if (typeof ans !== 'number') throw new Error('not enough distractors for ' + ans + ' :: ' + wrongs.join(' | '));
    let w;
    if (Number.isInteger(ans)) { const span = Math.max(3, Math.round(Math.abs(ans) * 0.25)); w = ans + nz(-span, span); }
    else w = rnd(ans * pick([0.5, 0.75, 1.25, 1.5, 2, 0.8, 1.2, 0.9, 1.1]), 2);
    if (ans > 0 && w <= 0) continue;
    const k = key(w); if (seen.has(k)) continue;
    seen.add(k); list.push(w);
  }
  const chosen = [ans, ...list.slice(0, n - 1)];
  let ordered;
  if (Array.isArray(order)) ordered = chosen.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
  else if (order !== 'shuffle' && chosen.every((v) => typeof v === 'number')) ordered = chosen.slice().sort((a, b) => a - b);
  else ordered = shuffle(chosen);
  const choices = ordered.map(fmt);
  return { choices, answer: ordered.findIndex((v) => key(v) === key(ans)) };
}

const QC_CHOICES = [
  'Quantity A is greater.',
  'Quantity B is greater.',
  'The two quantities are equal.',
  'The relationship cannot be determined from the information given.',
];
const cmp = (a, b) => (Math.abs(a - b) < 1e-9 ? 'C' : a > b ? 'A' : 'B');
const REL_TEXT = { A: 'Quantity A is greater', B: 'Quantity B is greater', C: 'the two quantities are equal', D: 'the relationship cannot be determined' };

module.exports = {
  R, setSeed, rf, ri, pick, nz, shuffle, gcd, lcm, rnd, M, nf, nm, money, fr, frt, piStr, radStr, poly, lin, sgn,
  mkChoices, QC_CHOICES, cmp, REL_TEXT,
};
