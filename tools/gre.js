// GRE-only templates: Quantitative Comparison, multi-select, GRE-specific statistics.
const L = require('./lib');
const { R, rf, ri, pick, nz, shuffle, gcd, rnd, M, nf, nm, fr, frt, poly, lin, sgn, QC_CHOICES, cmp, REL_TEXT } = L;
const S = require('./shared');
const { ask } = S;

function qc(o) {
  return { topic: o.topic, skill: o.skill || 'Quantitative comparison', diff: o.diff || 2, type: 'qc', q: o.info || '', qa: o.a, qb: o.b, choices: QC_CHOICES, answer: 'ABCD'.indexOf(o.rel), expl: o.expl };
}

// --------- QC: numeric computations ---------
function qcFracDec() {
  let a, b; do { b = ri(3, 19); a = ri(1, b - 1); } while (gcd(a, b) !== 1);
  const v = a / b, d = rnd(v + pick([-0.01, 0, 0.01, -0.001, 0.001]), 3);
  const rel = cmp(v, d), sw = rf() < 0.5;
  return qc({
    topic: 'Arithmetic', diff: 1, info: '', a: sw ? M(nm(d)) : M(fr(a, b)), b: sw ? M(fr(a, b)) : M(nm(d)), rel: sw ? { A: 'B', B: 'A', C: 'C' }[rel] : rel,
    expl: `${M(`${fr(a, b)} = ${rnd(v, 6)}${Number.isInteger(rnd(v * 1000, 6)) ? '' : '\\ldots'}`)}, compared with ${nf(d)}. So ${REL_TEXT[sw ? { A: 'B', B: 'A', C: 'C' }[rel] : rel]}.`,
  });
}
function qcPercentSwap() {
  const p = ri(2, 30) * 5, q = ri(2, 40) * 5;
  if (rf() < 0.5) return qc({ topic: 'Arithmetic', diff: 1, a: `${p}% of ${q}`, b: `${q}% of ${p}`, rel: 'C', expl: `${M(`\\frac{${p}}{100} \\times ${q} = \\frac{${p} \\times ${q}}{100} = \\frac{${q}}{100} \\times ${p}`)}. Both equal ${nf((p * q) / 100)}, so they are equal.` });
  const r = q + nz(-3, 3) * 5;
  if (r <= 0) return qcPercentSwap();
  const A = (p * q) / 100, B = (r * p) / 100 * (rf() < 0.5 ? 1 : 1);
  return qc({ topic: 'Arithmetic', diff: 1, a: `${p}% of ${q}`, b: `${r}% of ${p}`, rel: cmp(A, B), expl: `Quantity A = ${nf(A)}; Quantity B = ${nf(B)}. So ${REL_TEXT[cmp(A, B)]}.` });
}
const POW_PAIRS = [[3, 2, 8, 9], [5, 3, 32, 27], [8, 5, 256, 243], [2, 1, 4, 3], [11, 7, 2048, 2187], [4, 3, 16, 27], [3, 1, 8, 3], [5, 2, 32, 9]];
function qcPowers() {
  const [a, b, va, vb] = pick(POW_PAIRS), k = ri(2, 12);
  return qc({
    topic: 'Arithmetic', skill: 'Exponents', diff: 3, a: M(`2^{${a * k}}`), b: M(`3^{${b * k}}`), rel: cmp(va, vb),
    expl: `Write both with exponent ${k}: ${M(`2^{${a * k}} = (2^{${a}})^{${k}} = ${va}^{${k}}`)} and ${M(`3^{${b * k}} = (3^{${b}})^{${k}} = ${vb}^{${k}}`)}. Since ${va} ${va > vb ? '>' : '<'} ${vb}, ${REL_TEXT[cmp(va, vb)]}.`,
  });
}
function qcSqrt() {
  if (rf() < 0.5) {
    const a = ri(2, 12) ** 2, b = ri(2, 12) ** 2;
    return qc({ topic: 'Arithmetic', skill: 'Roots', diff: 2, a: M(`\\sqrt{${a}} + \\sqrt{${b}}`), b: M(`\\sqrt{${a} + ${b}}`), rel: 'A', expl: `Quantity A = ${Math.sqrt(a)} + ${Math.sqrt(b)} = ${Math.sqrt(a) + Math.sqrt(b)}. Quantity B = ${M(`\\sqrt{${a + b}} \\approx ${rnd(Math.sqrt(a + b), 2)}`)}. In general ${M('\\sqrt{a}+\\sqrt{b} > \\sqrt{a+b}')} for positive a, b.` });
  }
  let a, b; do { a = ri(2, 40); b = ri(2, 40); } while (a === b);
  return qc({ topic: 'Arithmetic', skill: 'Roots', diff: 2, a: M(`\\sqrt{${a} \\times ${b}}`), b: M(`\\frac{${a} + ${b}}{2}`), rel: 'B', expl: `Quantity A ≈ ${rnd(Math.sqrt(a * b), 3)}, Quantity B = ${nf((a + b) / 2)}. The geometric mean of two different positive numbers is always less than their arithmetic mean.` });
}
function qcMeanMedian() {
  const n = pick([5, 7]), arr = Array.from({ length: n }, () => ri(1, 30)), s = arr.slice().sort((a, b) => a - b);
  const mean = arr.reduce((a, b) => a + b, 0) / n, med = s[(n - 1) / 2];
  return qc({ topic: 'Data Analysis', skill: 'Mean vs median', diff: 2, info: `Set ${M('S')}: ${M(arr.join(', '))}`, a: `The mean of set ${M('S')}`, b: `The median of set ${M('S')}`, rel: cmp(mean, med), expl: `Mean = ${arr.reduce((a, b) => a + b, 0)} ÷ ${n} = ${rnd(mean, 3)}. Ordered: ${s.join(', ')}, so the median is ${med}. Therefore ${REL_TEXT[cmp(mean, med)]}.` });
}
function qcLinear() {
  let a, b, x; do { a = nz(-7, 9); b = ri(-15, 15); x = ri(-10, 12); } while (Math.abs(a) === 1);
  const c = a * x + b, k = x + nz(-2, 2) * (rf() < 0.3 ? 0 : 1);
  return qc({ topic: 'Algebra', skill: 'Linear equations', diff: 1, info: M(`${lin(a, b)} = ${c}`), a: M('x'), b: M(String(k)), rel: cmp(x, k), expl: `Solve: ${M(`${a}x = ${c - b}`)}, so ${M(`x = ${x}`)}. Compare with ${k}: ${REL_TEXT[cmp(x, k)]}.` });
}
function qcSystem() {
  let x, y, a, b; do { x = ri(-8, 10); y = ri(-8, 10); a = nz(-4, 5); b = nz(-4, 5); } while (a === b || x === y && rf() < 0.7);
  const c1 = x + a * y, c2 = x + b * y;
  return qc({ topic: 'Algebra', skill: 'Systems of equations', diff: 2, info: `${M(`${poly([[1, 'x'], [a, 'y']])} = ${c1}`)}<br>${M(`${poly([[1, 'x'], [b, 'y']])} = ${c2}`)}`, a: M('x'), b: M('y'), rel: cmp(x, y), expl: `Subtract the equations: ${M(`${a - b}y = ${c1 - c2}`)}, so ${M(`y = ${y}`)} and ${M(`x = ${x}`)}. So ${REL_TEXT[cmp(x, y)]}.` });
}
function qcTriangle() {
  const a = ri(3, 15), b = ri(3, 15), lo = Math.abs(a - b), hi = a + b;
  const c = pick([hi, hi + ri(0, 4), lo, Math.max(1, lo - ri(0, 2)), ri(lo + 1, hi - 1)]);
  const rel = c >= hi ? 'B' : c <= lo ? 'A' : 'D';
  return qc({ topic: 'Geometry', skill: 'Triangle inequality', diff: 3, info: `Two sides of a triangle have lengths ${a} and ${b}.`, a: 'The length of the third side', b: M(String(c)), rel, expl: `By the triangle inequality, the third side is strictly between ${M(`|${a} - ${b}| = ${lo}`)} and ${M(`${a} + ${b} = ${hi}`)}. ${rel === 'D' ? `${c} is inside that interval, so the third side could be less than, equal to, or greater than ${c}.` : rel === 'A' ? `Since ${c} ≤ ${lo}, the third side is always greater.` : `Since ${c} ≥ ${hi}, the third side is always less.`}` });
}
function qcCircle() {
  const r = ri(1, 6);
  return qc({ topic: 'Geometry', skill: 'Circles', diff: 2, info: `A circle has radius ${r}.`, a: 'The circumference of the circle', b: 'The area of the circle', rel: cmp(2 * r, r * r), expl: `Circumference = ${M(`2\\pi(${r}) = ${2 * r}\\pi`)}; area = ${M(`\\pi(${r})^2 = ${r * r}\\pi`)}. So ${REL_TEXT[cmp(2 * r, r * r)]}. (They are equal only when r = 2.)` });
}
function qcCombos() {
  const n = ri(6, 14), k = ri(2, n - 2);
  if (rf() < 0.5) return qc({ topic: 'Data Analysis', skill: 'Combinations', diff: 2, a: `The number of ways to choose ${k} people from ${n}`, b: `The number of ways to choose ${n - k} people from ${n}`, rel: 'C', expl: `Choosing ${k} people to include is the same as choosing ${n - k} people to leave out, so ${M(`\\binom{${n}}{${k}} = \\binom{${n}}{${n - k}}`)}. Equal.` });
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  const k2 = Math.min(k, 4);
  return qc({ topic: 'Data Analysis', skill: 'Permutations', diff: 2, a: `The number of ways to arrange ${k2} of ${n} books in a row`, b: `The number of ways to choose ${k2} of ${n} books`, rel: 'A', expl: `Arrangements ${M(`= ${n}!/(${n - k2})! `)} = ${C(n, k2) * [1, 1, 2, 6, 24][k2]}, while selections = ${C(n, k2)}. Each selection can be ordered ${k2}! ways, so A is greater.` });
}
function qcStdDev() {
  const m = ri(10, 80), d = ri(1, 9), e = ri(1, 9), v = pick(['spread', 'shift', 'scale']);
  if (v === 'spread') {
    if (d === e) return qcStdDev();
    return qc({ topic: 'Data Analysis', skill: 'Standard deviation', diff: 2, info: `Set ${M('P')}: ${M(`${m - d}, ${m}, ${m + d}`)}<br>Set ${M('Q')}: ${M(`${m - e}, ${m}, ${m + e}`)}`, a: `The standard deviation of set ${M('P')}`, b: `The standard deviation of set ${M('Q')}`, rel: cmp(d, e), expl: `Both sets have mean ${m}. Set P's values are ${d} from the mean and set Q's values are ${e} from the mean, so the set whose values are farther from the mean has the greater standard deviation: ${REL_TEXT[cmp(d, e)]}.` });
  }
  const k = ri(2, 20);
  if (v === 'shift') return qc({ topic: 'Data Analysis', skill: 'Standard deviation', diff: 2, info: `Set ${M('P')}: ${M(`${m - d}, ${m}, ${m + e}`)}<br>Set ${M('Q')}: ${M(`${m - d + k}, ${m + k}, ${m + e + k}`)}`, a: `The standard deviation of set ${M('P')}`, b: `The standard deviation of set ${M('Q')}`, rel: 'C', expl: `Set Q is set P with ${k} added to every value. Adding a constant shifts the data but does not change the spread, so the standard deviations are equal.` });
  return qc({ topic: 'Data Analysis', skill: 'Standard deviation', diff: 3, info: `Set ${M('P')}: ${M(`${m - d}, ${m}, ${m + e}`)}<br>Set ${M('Q')}: ${M(`${2 * (m - d)}, ${2 * m}, ${2 * (m + e)}`)}`, a: `The standard deviation of set ${M('P')}`, b: `The standard deviation of set ${M('Q')}`, rel: 'B', expl: `Set Q is set P with every value doubled. Multiplying by 2 doubles every distance from the mean, so the standard deviation of Q is twice that of P.` });
}

// --------- QC: variable families ---------
function qcFamily() {
  const f = pick([
    () => { const m = ri(2, 7), n = ri(1, m - 1); const xs = n === 1 ? 'x' : `x^{${n}}`; return { info: M('0 < x < 1'), a: M(`x^{${m}}`), b: M(xs), rel: 'B', diff: 2, expl: `For a number between 0 and 1, higher powers are smaller (e.g. ${M('x = \\tfrac{1}{2}')} gives ${M(`(\\tfrac{1}{2})^{${m}} < (\\tfrac{1}{2})^{${n}}`)}). So Quantity B is greater.` }; },
    () => { const m = ri(2, 7), n = ri(1, m - 1); const xs = n === 1 ? 'x' : `x^{${n}}`; return { info: M('x > 1'), a: M(`x^{${m}}`), b: M(xs), rel: 'A', diff: 1, expl: `For ${M('x > 1')}, higher powers are larger, so ${M(`x^{${m}} > ${xs}`)}.` }; },
    () => { const o = pick([3, 5, 7]), e = pick([2, 4, 6]); return { info: M('x < 0'), a: M(`x^{${o}}`), b: M(`x^{${e}}`), rel: 'B', diff: 2, expl: `A negative number to an odd power is negative; to an even power it is positive. So Quantity B is greater.` }; },
    () => ({ info: `${M('x')} is an integer.`, a: M('x^2'), b: M('x'), rel: 'D', diff: 2, expl: `If ${M('x = 0')} or ${M('x = 1')}, the quantities are equal; if ${M('x = 2')}, A is greater. Since different values give different results, the relationship cannot be determined.` }),
    () => ({ info: M('-1 < x < 0'), a: M('x'), b: M('x^3'), rel: 'B', diff: 3, expl: `Try ${M('x = -\\tfrac{1}{2}')}: ${M('x^3 = -\\tfrac{1}{8}')}, which is greater than ${M('-\\tfrac{1}{2}')}. Cubing a number between −1 and 0 moves it closer to 0, so B is always greater.` }),
    () => { const c = ri(1, 9); return { info: M('y > x > 0'), a: M(`\\frac{x + ${c}}{y + ${c}}`), b: M('\\frac{x}{y}'), rel: 'A', diff: 3, expl: `${M(`\\frac{x+${c}}{y+${c}} - \\frac{x}{y} = \\frac{${c}(y - x)}{y(y+${c})} > 0`)} because ${M('y > x')}. Adding the same positive number to the top and bottom of a fraction less than 1 increases it.` }; },
    () => ({ info: M('y > x > 0'), a: M('\\frac{x}{y}'), b: M('\\frac{y}{x}'), rel: 'B', diff: 1, expl: `${M('\\frac{x}{y} < 1')} and ${M('\\frac{y}{x} > 1')}, so Quantity B is greater.` }),
    () => ({ info: `${M('n')} is a positive integer.`, a: M('(-1)^{2n}'), b: M('1'), rel: 'C', diff: 1, expl: `${M('2n')} is always even, and −1 to an even power is 1. Equal.` }),
    () => ({ info: `${M('n')} is a positive integer.`, a: M('(-1)^{n}'), b: M('0'), rel: 'D', diff: 1, expl: `If ${M('n')} is even, A = 1 > 0; if ${M('n')} is odd, A = −1 < 0. Cannot be determined.` }),
    () => { const s = 2 * ri(3, 15); return { info: `${M('a')} and ${M('b')} are positive numbers and ${M(`a + b = ${s}`)}.`, a: M('ab'), b: M(String((s / 2) ** 2)), rel: 'D', diff: 3, expl: `If ${M(`a = b = ${s / 2}`)}, then ${M(`ab = ${(s / 2) ** 2}`)} (equal). If ${M(`a = 1, b = ${s - 1}`)}, then ${M(`ab = ${s - 1}`)} (B greater). Cannot be determined.` }; },
    () => { const k = ri(2, 15); return { info: M(`x^2 = ${k * k}`), a: M('x'), b: M(String(k)), rel: 'D', diff: 2, expl: `${M('x')} could be ${k} (equal) or ${-k} (B greater). Cannot be determined.` }; },
    () => { const k = ri(2, 15); return { info: M(`x^2 = ${k * k}`), a: M('|x|'), b: M(String(k)), rel: 'C', diff: 2, expl: `Whether ${M(`x = ${k}`)} or ${M(`x = ${-k}`)}, ${M(`|x| = ${k}`)}. Equal.` }; },
    () => ({ info: `${M('k')} is an odd integer.`, a: `The remainder when ${M('k^2')} is divided by 8`, b: M('1'), rel: 'C', diff: 3, expl: `Write ${M('k = 2m + 1')}: ${M('k^2 = 4m(m+1) + 1')}. Since ${M('m(m+1)')} is even, ${M('4m(m+1)')} is a multiple of 8, so the remainder is always 1.` }),
    () => ({ info: M('x > 0'), a: M('(x + 1)^2'), b: M('x^2 + 1'), rel: 'A', diff: 2, expl: `${M('(x+1)^2 = x^2 + 2x + 1')}, which exceeds ${M('x^2 + 1')} by ${M('2x > 0')}.` }),
    () => ({ info: '', a: M('(x + 1)^2'), b: M('x^2 + 1'), rel: 'D', diff: 2, expl: `The difference is ${M('2x')}, which is positive, zero, or negative depending on ${M('x')}. Cannot be determined.` }),
    () => ({ info: M('x < y < 0'), a: M('xy'), b: M('0'), rel: 'A', diff: 1, expl: `The product of two negative numbers is positive.` }),
    () => ({ info: M('x < y < 0'), a: M('\\frac{x}{y}'), b: M('1'), rel: 'A', diff: 2, expl: `Both are negative and ${M('|x| > |y|')}, so ${M('\\frac{x}{y}')} is positive and greater than 1.` }),
    () => { const p = ri(8, 40) * 3; return { info: `A square and an equilateral triangle each have perimeter ${p}.`, a: 'The side length of the triangle', b: 'The side length of the square', rel: 'A', diff: 1, expl: `Triangle side = ${p}/3 = ${p / 3}; square side = ${p}/4 = ${nf(p / 4)}. A is greater.` }; },
    () => ({ info: `${M('x')} and ${M('y')} are positive and ${M('x > y')}.`, a: M('x - y'), b: M('\\frac{x}{y}'), rel: 'D', diff: 3, expl: `If ${M('x = 3, y = 1')}: A = 2, B = 3 (B greater). If ${M('x = 100, y = 50')}: A = 50, B = 2 (A greater). Cannot be determined.` }),
  ])();
  return qc({ topic: 'Algebra', skill: 'Quantitative comparison', ...f });
}

// --------- multi-select ---------
function multi(o) {
  return { topic: o.topic, skill: o.skill, diff: o.diff || 2, type: 'multi', q: o.q + '<br><em>Indicate all such values.</em>', choices: o.items.map((it) => o.fmt ? o.fmt(it.v) : M(nm(it.v))), answer: o.items.map((it, i) => (it.ok ? i : -1)).filter((i) => i >= 0), expl: o.expl };
}
function msIneq() {
  let p, q, c1, c2, Lo, Hi, cands;
  for (;;) {
    p = nz(-5, 6); q = ri(-10, 10); c1 = ri(-20, 15); c2 = c1 + ri(4, 25);
    Lo = Math.min((c1 - q) / p, (c2 - q) / p); Hi = Math.max((c1 - q) / p, (c2 - q) / p);
    const start = Math.floor(Lo) - ri(1, 2);
    cands = Array.from({ length: pick([6, 7, 8]) }, (_, i) => start + i);
    const ok = cands.filter((x) => x > Lo && x < Hi);
    if (ok.length >= 1 && ok.length < cands.length) break;
  }
  return multi({
    topic: 'Algebra', skill: 'Inequalities', diff: 2,
    q: `If ${M(`${c1} < ${lin(p, q)} < ${c2}`)}, which of the following could be the value of ${M('x')}?`,
    items: cands.map((v) => ({ v, ok: v > Lo && v < Hi })),
    expl: `Subtract ${q} from each part and divide by ${p}${p < 0 ? ' (flipping the inequality signs because you divide by a negative number)' : ''}: ${M(`${p > 0 ? fr(c1 - q, p) : fr(c2 - q, p)} < x < ${p > 0 ? fr(c2 - q, p) : fr(c1 - q, p)}`)}, roughly ${M(`${rnd(Lo, 2)} < x < ${rnd(Hi, 2)}`)}. The choices in this interval are ${cands.filter((x) => x > Lo && x < Hi).join(', ')}.`,
  });
}
function msFactors() {
  const N = pick([36, 48, 60, 72, 84, 90, 96, 108, 120, 144, 150, 168, 180, 210, 240, 252, 270, 300, 336, 360, 420]);
  const ds = S.divs(N).filter((d) => d > 2 && d < N);
  const non = []; for (let i = 3; i < 60; i++) if (N % i) non.push(i);
  const ok = shuffle(ds).slice(0, ri(2, 4)), bad = shuffle(non).slice(0, ri(2, 4));
  const items = [...ok.map((v) => ({ v, ok: true })), ...bad.map((v) => ({ v, ok: false }))].sort((a, b) => a.v - b.v);
  return multi({
    topic: 'Arithmetic', skill: 'Factors', diff: 2,
    q: `Which of the following integers are factors of ${N}?`,
    items, expl: `${N} = ${factorStr(N)}. A number is a factor of ${N} if its prime factorization uses only these primes with no larger exponents. Factors among the choices: ${ok.sort((a, b) => a - b).join(', ')}.`,
  });
}
function factorStr(n) { const out = []; for (let p = 2; n > 1; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) out.push(e > 1 ? `${p}^${e}` : `${p}`); } return out.join(' × '); }
function msTriangle() {
  const a = ri(3, 14), b = ri(3, 14), lo = Math.abs(a - b), hi = a + b;
  const start = Math.max(1, lo - ri(0, 2));
  let cands = [lo, hi, ...Array.from({ length: 5 }, () => ri(start, hi + 3))];
  cands = [...new Set(cands.filter((x) => x > 0))].sort((x, y) => x - y).slice(0, 8);
  if (cands.filter((x) => x > lo && x < hi).length === 0) return msTriangle();
  return multi({
    topic: 'Geometry', skill: 'Triangle inequality', diff: 2,
    q: `Two sides of a triangle have lengths ${a} and ${b}. Which of the following could be the length of the third side?`,
    items: cands.map((v) => ({ v, ok: v > lo && v < hi })),
    expl: `The third side must be greater than ${M(`|${a} - ${b}| = ${lo}`)} and less than ${M(`${a} + ${b} = ${hi}`)} (strictly). Valid choices: ${cands.filter((x) => x > lo && x < hi).join(', ')}.`,
  });
}
function msRoots() {
  let r1, r2; do { r1 = ri(-9, 9); r2 = ri(-9, 9); } while (r1 === r2 || r1 === -r2 || r1 === 0 || r2 === 0);
  const items = [...new Set([r1, r2, -r1, -r2, r1 + r2, r1 * r2].filter((v) => Math.abs(v) <= 40))].sort((a, b) => a - b).map((v) => ({ v, ok: v === r1 || v === r2 }));
  return multi({
    topic: 'Algebra', skill: 'Quadratic equations', diff: 2,
    q: `Which of the following are solutions of ${M(`${poly([[1, 'x^2'], [-(r1 + r2), 'x'], [r1 * r2, '']])} = 0`)}?`,
    items, expl: `Factor: ${M(`(x ${sgn(-r1)})(x ${sgn(-r2)}) = 0`)}, so ${M(`x = ${r1}`)} or ${M(`x = ${r2}`)}.`,
  });
}
function msSquares() {
  const K = ri(10, 90), start = -Math.floor(Math.sqrt(K)) - ri(1, 2);
  const cands = shuffle(Array.from({ length: 2 * (-start) + 1 }, (_, i) => start + i)).slice(0, 7).sort((a, b) => a - b);
  if (!cands.some((x) => x * x < K) || cands.every((x) => x * x < K)) return msSquares();
  return multi({
    topic: 'Algebra', skill: 'Inequalities', diff: 2,
    q: `If ${M('n')} is an integer and ${M(`n^2 < ${K}`)}, which of the following could be the value of ${M('n')}?`,
    items: cands.map((v) => ({ v, ok: v * v < K })),
    expl: `${M(`n^2 < ${K}`)} means ${M(`-\\sqrt{${K}} < n < \\sqrt{${K}}`)}, where ${M(`\\sqrt{${K}} \\approx ${rnd(Math.sqrt(K), 2)}`)}. Remember negative values work too.`,
  });
}

// --------- GRE statistics ---------
function normalDist(X) {
  const mu = ri(10, 40) * 5, sd = ri(2, 6) * 5, N = ri(1, 15) * 200;
  const opts = [
    [`more than ${mu + sd}`, 0.16, `${mu + sd} is one standard deviation above the mean. About 16% of a normal distribution lies above that point`],
    [`between ${mu - sd} and ${mu + sd}`, 0.68, `about 68% of the data lies within one standard deviation of the mean`],
    [`less than ${mu - 2 * sd}`, 0.025, `${mu - 2 * sd} is two standard deviations below the mean, and about 2.5% of the data lies beyond that point`],
    [`between ${mu} and ${mu + 2 * sd}`, 0.475, `about 95% of the data lies within two standard deviations, so half of that, 47.5%, lies between the mean and two standard deviations above it`],
    [`between ${mu - 2 * sd} and ${mu + sd}`, 0.815, `47.5% lies between μ − 2σ and μ, and 34% lies between μ and μ + σ, for a total of 81.5%`],
  ];
  const [desc, p, why] = pick(opts);
  const ans = Math.round(N * p);
  return ask(X, {
    topic: 'Data Analysis', skill: 'Normal distribution', diff: 3,
    q: `The scores of ${nf(N)} students on an exam are approximately normally distributed with a mean of ${mu} and a standard deviation of ${sd}. Approximately how many of the students scored ${desc}?`,
    ans, wrongs: [0.16, 0.68, 0.025, 0.475, 0.815, 0.34, 0.95, 0.5].filter((x) => x !== p).map((x) => Math.round(N * x)),
    expl: `${why[0].toUpperCase() + why.slice(1)}. ${M(`${p} \\times ${nm(N)} = ${nm(ans)}`)}.`, numeric: false,
  });
}
function iqr(X) {
  const arr = Array.from({ length: 8 }, () => ri(1, 50)).sort((a, b) => a - b);
  const q1 = (arr[1] + arr[2]) / 2, q3 = (arr[5] + arr[6]) / 2, ans = q3 - q1, med = (arr[3] + arr[4]) / 2;
  return ask(X, {
    topic: 'Data Analysis', skill: 'Quartiles and IQR', diff: 3,
    q: `What is the interquartile range of the following data?<br>${M(shuffle(arr).join(', '))}`,
    ans, wrongs: [arr[7] - arr[0], arr[6] - arr[1], q3 - med, med - q1, arr[5] - arr[2]],
    expl: `Order the data: ${arr.join(', ')}. The median is ${med}. Q1 is the median of the lower half (${arr.slice(0, 4).join(', ')}) = ${q1}. Q3 is the median of the upper half (${arr.slice(4).join(', ')}) = ${q3}. IQR = ${q3} − ${q1} = ${ans}.`,
  });
}
function sdUnits(X) {
  const mu = ri(20, 90), sd = ri(2, 12), k = pick([1, 1.5, 2, 2.5, 3, -1, -2, -1.5]);
  const val = mu + k * sd;
  return ask(X, {
    topic: 'Data Analysis', skill: 'Standard deviation', diff: 2,
    q: `A data set has a mean of ${mu} and a standard deviation of ${sd}. What value is exactly ${Math.abs(k)} standard deviation${Math.abs(k) === 1 ? '' : 's'} ${k > 0 ? 'above' : 'below'} the mean?`,
    ans: val, wrongs: [mu - k * sd, mu + k, mu + k * sd * sd, mu * k, sd * k],
    expl: `${M(`${mu} ${k > 0 ? '+' : '-'} ${Math.abs(k)} \\times ${sd} = ${nm(val)}`)}.`,
  });
}

module.exports = {
  qcTemplates: { qcFracDec, qcPercentSwap, qcPowers, qcSqrt, qcMeanMedian, qcLinear, qcSystem, qcTriangle, qcCircle, qcCombos, qcStdDev, qcFamily },
  msTemplates: { msIneq, msFactors, msTriangle, msRoots, msSquares },
  statTemplates: { normalDist, iqr, sdUnits },
};
