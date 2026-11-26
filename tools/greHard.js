// Hard (difficulty 3) GRE templates: multi-step problems and tougher Quantitative Comparisons.
const L = require('./lib');
const { R, rf, ri, pick, nz, shuffle, gcd, lcm, rnd, M, nf, nm, money, fr, frt, piStr, poly, lin, sgn, QC_CHOICES, REL_TEXT } = L;
const { ask } = require('./shared');

const C = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const usd = (v) => `$${money(v)}`;

function hQC() {
  const f = pick([
    () => ({ info: M('0 \\lt a \\lt b \\lt 1'), a: M('\\frac{a}{b}'), b: M('\\left(\\frac{a}{b}\\right)^2'), rel: 'A', expl: `Since ${M('0 \\lt a \\lt b')}, the fraction ${M('\\frac{a}{b}')} is between 0 and 1, and squaring a number between 0 and 1 makes it smaller.` }),
    () => ({ info: M('x \\ne 0'), a: M('\\frac{x}{|x|}'), b: M('1'), rel: 'D', expl: `${M('\\frac{x}{|x|}')} is 1 when ${M('x \\gt 0')} (equal) and −1 when ${M('x \\lt 0')} (B greater). Cannot be determined.` }),
    () => ({ info: `${M('n')} is a positive integer.`, a: `The remainder when ${M('n^2 + n')} is divided by 2`, b: M('0'), rel: 'C', expl: `${M('n^2 + n = n(n+1)')} is a product of two consecutive integers, one of which is even. So it is always even and the remainder is 0.` }),
    () => ({ info: `${M('p')} is a prime number greater than 3.`, a: `The remainder when ${M('p^2')} is divided by 3`, b: M('1'), rel: 'C', expl: `A prime greater than 3 is not a multiple of 3, so ${M('p = 3k \\pm 1')}. Then ${M('p^2 = 9k^2 \\pm 6k + 1')}, which leaves remainder 1.` }),
    () => ({ info: M('|x| \\gt |y|'), a: M('x^2'), b: M('y^2'), rel: 'A', expl: `${M('x^2 = |x|^2')} and ${M('y^2 = |y|^2')}. Squaring preserves order for non-negative numbers, so A is greater.` }),
    () => ({ info: M('|x| \\gt |y|'), a: M('x'), b: M('y'), rel: 'D', expl: `${M('x = 3, y = 1')} gives A greater; ${M('x = -3, y = 1')} gives B greater. Cannot be determined.` }),
    () => ({ info: M('x \\gt y'), a: M('x^2'), b: M('y^2'), rel: 'D', expl: `${M('x = 3, y = 1')}: A greater. ${M('x = 1, y = -3')}: B greater. Cannot be determined.` }),
    () => { const s = 2 * ri(3, 20); return { info: `${M(`a + b = ${s}`)} and ${M('a \\gt b \\gt 0')}`, a: M('a'), b: M(String(s / 2)), rel: 'A', expl: `If ${M('a \\le ' + s / 2)}, then ${M('b \\ge ' + s / 2)} too, contradicting ${M('a \\gt b')}. So ${M('a \\gt ' + s / 2)}.` }; },
    () => { const m = ri(5, 40); return { info: `The average of ${M('x, y, z')} is ${m}, and ${M('x \\lt y \\lt z')}.`, a: M('z'), b: M(String(m)), rel: 'A', expl: `The largest of three different numbers must be greater than their average (otherwise all three would be at most ${m} and not all equal to it).` }; },
    () => { const m = ri(5, 40); return { info: `The average of ${M('x, y, z')} is ${m}, and ${M('x \\lt y \\lt z')}.`, a: M('y'), b: M(String(m)), rel: 'D', expl: `${M(`${m - 1}, ${m}, ${m + 1}`)} gives equal; ${M(`${m - 10}, ${m + 4}, ${m + 6}`)} gives A greater; ${M(`${m - 2}, ${m - 1}, ${m + 3}`)} gives B greater. Cannot be determined.` }; },
    () => ({ info: M('k \\gt 0'), a: M('\\frac{k}{k+1}'), b: M('\\frac{k+1}{k+2}'), rel: 'B', expl: `${M('\\frac{k}{k+1} = 1 - \\frac{1}{k+1}')} and ${M('\\frac{k+1}{k+2} = 1 - \\frac{1}{k+2}')}. Since ${M('\\frac{1}{k+2} \\lt \\frac{1}{k+1}')}, B is greater.` }),
    () => { const a = ri(2, 9), b = ri(2, 9); return { info: `${M('x')} and ${M('y')} are integers, and ${M(`xy = ${a * b}`)}.`, a: M('x + y'), b: M('0'), rel: 'D', expl: `${M(`x = ${a}, y = ${b}`)} gives a positive sum; ${M(`x = -${a}, y = -${b}`)} gives a negative sum. Cannot be determined.` }; },
    () => { const n = ri(3, 9); return { info: `A list of ${n} numbers has a mean of 0.`, a: 'The number of positive numbers in the list', b: 'The number of negative numbers in the list', rel: 'D', expl: `The values could be ${M('-2, 1, 1, 0, \\ldots')} (more positives) or ${M('2, -1, -1, 0, \\ldots')} (more negatives). Cannot be determined.` }; },
    () => { const r = ri(2, 9); return { info: `A square is inscribed in a circle of radius ${r}.`, a: 'The area of the square', b: `${M(String(2 * r * r - 1))}`, rel: 'A', expl: `The diagonal of the square is the diameter, ${2 * r}. Area = ${M(`\\frac{d^2}{2} = \\frac{${4 * r * r}}{2} = ${2 * r * r}`)}, which is greater than ${2 * r * r - 1}.` }; },
    () => ({ info: `${M('m')} and ${M('n')} are positive integers and ${M('m^2 - n^2')} is odd.`, a: M('m + n'), b: `${M('m - n')}`, rel: 'A', expl: `${M('m + n')} exceeds ${M('m - n')} by ${M('2n \\gt 0')}. (The “odd” condition is a distraction.)` }),
  ])();
  return { topic: 'Algebra', skill: 'Quantitative comparison', diff: 3, type: 'qc', q: f.info, qa: f.a, qb: f.b, choices: QC_CHOICES, answer: 'ABCD'.indexOf(f.rel), expl: f.expl };
}

function hRevenue(X) {
  const p = pick([10, 20, 25, 30, 40, 50]), q = pick([10, 20, 25, 30, 40, 50]);
  const ch = rnd(((1 + p / 100) * (1 - q / 100) - 1) * 100, 2);
  const fmt = (v) => (v > 0 ? `${nf(v)}% increase` : v < 0 ? `${nf(-v)}% decrease` : 'No change');
  return ask(X, {
    topic: 'Arithmetic', skill: 'Percent change', diff: 3, numeric: false,
    q: `A store raised the price of a product by ${p}%. As a result, the number of units sold fell by ${q}%. What was the effect on the store's revenue from this product?`,
    ans: ch, wrongs: [p - q, rnd(((1 - p / 100) * (1 + q / 100) - 1) * 100, 2), -(p + q) / 2 || 5, q - p, rnd(ch + 5, 2)], fmt, order: 'shuffle',
    expl: `Revenue = price × units. The new revenue is ${M(`${1 + p / 100} \\times ${1 - q / 100} = ${rnd((1 + p / 100) * (1 - q / 100), 4)}`)} times the old revenue: ${ch === 0 ? 'no change' : 'a ' + fmt(ch)}. Subtracting the percents (${p} − ${q}) gives the wrong answer.`,
  });
}

function hInterestDiff(X) {
  const P = ri(5, 90) * 100, r = pick([4, 5, 6, 8, 10, 12, 15, 20]);
  const d = rnd(P * (r / 100) ** 2, 2);
  return ask(X, {
    topic: 'Arithmetic', skill: 'Interest', diff: 3, pre: '$',
    q: `$${nf(P)} is invested for 2 years at ${r}% annual interest. How much more interest is earned if the interest is compounded annually than if it is simple interest?`,
    ans: d, wrongs: [rnd((P * r) / 100, 2), rnd(2 * d, 2), rnd((2 * P * r) / 100, 2), rnd(d / 2, 2)], fmt: usd,
    expl: `Simple: ${M(`2 \\times ${r / 100} \\times ${nm(P)} = ${nm((2 * P * r) / 100)}`)}. Compound: ${M(`${nm(P)}(${1 + r / 100})^2 - ${nm(P)} = ${nm(rnd(P * (1 + r / 100) ** 2 - P, 2))}`)}. The difference is ${M(`P r^2 = ${nm(P)} \\times ${r / 100}^2 = ${nm(d)}`)}: the interest earned on the first year's interest.`,
  });
}

function hAtLeastOne(X) {
  const k = pick([2, 3, 4, 5, 6]), n = pick([2, 3, 4]);
  const what = k === 6 ? ['a fair six-sided die is rolled', 'a 6'] : k === 2 ? ['a fair coin is tossed', 'heads'] : [`a spinner with ${k} equal sections numbered 1 to ${k} is spun`, 'a 1'];
  const num = k ** n - (k - 1) ** n, den = k ** n;
  return ask(X, {
    topic: 'Data Analysis', skill: 'Probability', diff: 3, numAns: rnd(num / den, 6), ansText: frt(num, den),
    q: `If ${what[0]} ${n} times, what is the probability of getting ${what[1]} at least once?`,
    ans: M(fr(num, den)), wrongs: [M(fr(n, k)), M(fr((k - 1) ** n, den)), M(fr(1, den)), M(fr(n * (k - 1) ** (n - 1), den)), M(fr(num - 1, den))],
    expl: `Use the complement: P(never) ${M(`= \\left(\\frac{${k - 1}}{${k}}\\right)^{${n}} = \\frac{${(k - 1) ** n}}{${den}}`)}. So P(at least once) ${M(`= 1 - \\frac{${(k - 1) ** n}}{${den}} = ${fr(num, den)}`)}.`,
  });
}

function hCommittee(X) {
  const m = ri(3, 8), w = ri(2, 6), k = ri(3, Math.min(4, m));
  const ans = C(m + w, k) - C(m, k);
  return ask(X, {
    topic: 'Data Analysis', skill: 'Combinations', diff: 3,
    q: `A committee of ${k} people is to be chosen from ${m} men and ${w} women. How many different committees include at least one woman?`,
    ans, wrongs: [w * C(m + w - 1, k - 1), C(m + w, k), w * C(m, k - 1), C(m, k), C(w, 1) * C(m + w, k - 1)],
    expl: `All committees: ${M(`\\binom{${m + w}}{${k}} = ${C(m + w, k)}`)}. Committees with no women: ${M(`\\binom{${m}}{${k}} = ${C(m, k)}`)}. At least one woman: ${M(`${C(m + w, k)} - ${C(m, k)} = ${ans}`)}. (Choosing “one woman, then anyone” counts some committees more than once.)`,
  });
}

function hNotDivisible(X) {
  const [a, b] = pick([[2, 3], [2, 5], [3, 5], [3, 7], [4, 6], [6, 9], [5, 7], [4, 10], [6, 10], [3, 4]]), N = ri(6, 60) * 10, l = lcm(a, b);
  const fa = Math.floor(N / a), fb = Math.floor(N / b), fl = Math.floor(N / l), ans = N - (fa + fb - fl);
  return ask(X, {
    topic: 'Arithmetic', skill: 'Counting multiples', diff: 3,
    q: `How many integers from 1 to ${N}, inclusive, are divisible by neither ${a} nor ${b}?`,
    ans, wrongs: [N - fa - fb, fa + fb - fl, N - fa - fb + Math.floor(N / (a * b)), ans - 1, N - fa],
    expl: `Divisible by ${a}: ${fa}. By ${b}: ${fb}. By both (multiples of ${l}): ${fl}. Divisible by at least one: ${M(`${fa} + ${fb} - ${fl} = ${fa + fb - fl}`)}. Neither: ${M(`${N} - ${fa + fb - fl} = ${ans}`)}.`,
  });
}

function hCRT(X) {
  const [a, b] = pick([[3, 4], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7], [5, 7], [2, 7], [5, 8], [7, 8]]);
  const r1 = ri(1, a - 1), r2 = ri(1, b - 1);
  let x = 0; while (x % a !== r1 || x % b !== r2) x++;
  const list = []; for (let v = r2; list.length < 4; v += b) list.push(v);
  return ask(X, {
    topic: 'Arithmetic', skill: 'Remainders', diff: 3,
    q: `When the positive integer ${M('n')} is divided by ${a}, the remainder is ${r1}. When ${M('n')} is divided by ${b}, the remainder is ${r2}. What is the remainder when ${M('n')} is divided by ${a * b}?`,
    ans: x, wrongs: [r1 + r2, r1 * r2, (x + a) % (a * b), (x + b) % (a * b), r1 * b + r2].filter((v) => v < a * b && v !== x),
    expl: `List numbers that leave remainder ${r2} when divided by ${b}: ${list.join(', ')}, … The first one that leaves remainder ${r1} when divided by ${a} is ${x}. Since ${a} and ${b} share no factors, every such ${M('n')} is ${x} more than a multiple of ${a * b}, so the remainder is ${x}.`,
  });
}

function hMeet(X) {
  const v1 = ri(6, 14) * 5, v2 = ri(6, 14) * 5, t = ri(2, 6), h = ri(1, t - 1), D = v1 * t + v2 * (t - h);
  return ask(X, {
    topic: 'Arithmetic', skill: 'Rates', diff: 3,
    q: `Two towns are ${D} miles apart. Car A leaves the first town at noon, driving toward the second town at ${v1} miles per hour. Car B leaves the second town ${h} hour${h > 1 ? 's' : ''} later, driving toward the first town at ${v2} miles per hour. How many hours after noon do the cars meet?`,
    ans: t, wrongs: [rnd(D / (v1 + v2), 2), t - h, t + h, rnd(D / (v1 + v2) + h, 2), rnd(D / v1, 2)],
    expl: `In the first ${h} h, car A covers ${M(`${v1 * h}`)} miles, leaving ${M(`${D - v1 * h}`)} miles. Then the gap closes at ${M(`${v1} + ${v2} = ${v1 + v2}`)} mph, taking ${M(`${D - v1 * h} \\div ${v1 + v2} = ${t - h}`)} h. Total: ${M(`${h} + ${t - h} = ${t}`)} hours after noon.`,
  });
}

const PAIRS = [[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [5, 20], [6, 30], [12, 36], [15, 30], [8, 24], [9, 18], [14, 35], [18, 36], [21, 28], [24, 40], [10, 40], [36, 45]];
function hWorkStop(X) {
  const [a, b] = pick(PAIRS), T = (a * b) / (a + b); let t1 = ri(1, Math.max(1, Math.ceil(T) - 1));
  if (t1 >= T) return hWorkStop(X);
  const num = a * (b - t1), den = b, tot = num / den;
  return ask(X, {
    topic: 'Arithmetic', skill: 'Work rates', diff: 3, numAns: rnd(tot, 6), ansText: frt(num, den),
    q: `Machine A can complete a job in ${a} hours, and machine B can complete the same job in ${b} hours. Both machines start the job together, but after ${t1} hour${t1 > 1 ? 's' : ''} machine B breaks down, and machine A finishes the job alone. How many hours does the entire job take?`,
    ans: M(fr(num, den)), wrongs: [M(fr(num + t1 * den, den)), M(String(a)), M(fr(a * b, a + b)), M(String(t1 + a)), M(fr(a + b, 2)), M(fr(num - den, den))],
    expl: `Together they do ${M(`\\frac{1}{${a}} + \\frac{1}{${b}} = \\frac{${a + b}}{${a * b}}`)} per hour, so in ${t1} h they finish ${M(fr(t1 * (a + b), a * b))} of the job. Remaining: ${M(fr(a * b - t1 * (a + b), a * b))}, which takes A ${M(`${fr(a * b - t1 * (a + b), a * b)} \\times ${a} = ${fr(a * b - t1 * (a + b), b)}`)} h. Total: ${M(`${t1} + ${fr(a * b - t1 * (a + b), b)} = ${fr(num, den)}`)} hours.`,
  });
}

function hInscribed(X) {
  const r = ri(2, 10);
  if (rf() < 0.5) {
    const sq = 4 * r * r, ci = r * r;
    return ask(X, {
      topic: 'Geometry', skill: 'Circles', diff: 3, numeric: false,
      q: `A circle is inscribed in a square with side length ${2 * r}. What is the area of the region inside the square but outside the circle?`,
      ans: M(`${sq} - ${ci}\\pi`), wrongs: [M(`${sq} - ${4 * ci}\\pi`), M(`${sq}\\pi - ${ci}`), M(`${2 * r * 4} - ${2 * r}\\pi`), M(`${ci}\\pi - ${sq / 2}`), M(`${sq} - ${2 * r}\\pi`)],
      expl: `Square: ${M(`${2 * r}^2 = ${sq}`)}. The circle's diameter equals the side, so ${M(`r = ${r}`)} and its area is ${M(`${ci}\\pi`)}. Shaded region: ${M(`${sq} - ${ci}\\pi`)}.`,
    });
  }
  return ask(X, {
    topic: 'Geometry', skill: 'Circles', diff: 3, numeric: false,
    q: `A square is inscribed in a circle of radius ${r}. What is the area of the region inside the circle but outside the square?`,
    ans: M(`${r * r}\\pi - ${2 * r * r}`), wrongs: [M(`${r * r}\\pi - ${r * r}`), M(`${r * r}\\pi - ${4 * r * r}`), M(`${4 * r * r} - ${r * r}\\pi`), M(`${2 * r}\\pi - ${2 * r * r}`), M(`${r * r}\\pi - ${r * r * 2 * 2}`)],
    expl: `The square's diagonal is the diameter, ${2 * r}. A square with diagonal ${M('d')} has area ${M(`\\frac{d^2}{2} = \\frac{${4 * r * r}}{2} = ${2 * r * r}`)}. Circle: ${M(`${r * r}\\pi`)}. Region: ${M(`${r * r}\\pi - ${2 * r * r}`)}.`,
  });
}

function hIntercepts(X) {
  const a = ri(1, 6), b = ri(1, 6), c = lcm(a, b) * ri(1, 4) * (a === b ? 2 : 1);
  const xi = c / a, yi = c / b, area = (xi * yi) / 2;
  return ask(X, {
    topic: 'Algebra', skill: 'Slope', diff: 3,
    q: `In the ${M('xy')}-plane, what is the area of the triangle formed by the ${M('x')}-axis, the ${M('y')}-axis, and the line ${M(`${poly([[a, 'x'], [b, 'y']])} = ${c}`)}?`,
    ans: area, wrongs: [xi * yi, xi + yi, (xi + yi) / 2, rnd((xi * yi) / 4, 2), (c * c) / 2],
    expl: `x-intercept (set ${M('y = 0')}): ${M(`x = ${xi}`)}. y-intercept (set ${M('x = 0')}): ${M(`y = ${yi}`)}. The triangle is right-angled at the origin: area ${M(`= \\frac{1}{2}(${xi})(${yi}) = ${nm(area)}`)}.`,
  });
}

function hExpFactor(X) {
  const b = pick([2, 3, 4, 5]), m = ri(1, 4);
  if (rf() < 0.5) {
    const V = (b - 1) * b ** m;
    return ask(X, {
      topic: 'Algebra', skill: 'Exponential equations', diff: 3,
      q: `If ${M(`${b}^x - ${b}^{x-1} = ${nm(V)}`)}, what is the value of ${M('x')}?`,
      ans: m + 1, wrongs: [m, m + 2, Math.round(Math.log(V) / Math.log(b)) === m + 1 ? m + 3 : Math.round(Math.log(V) / Math.log(b)), 2 * m],
      expl: `Factor out ${M(`${b}^{x-1}`)}: ${M(`${b}^{x-1}(${b} - 1) = ${nm(V)}`)}, so ${M(`${b}^{x-1} = ${nm(V / (b - 1))} = ${b}^{${m}}`)}. Then ${M(`x - 1 = ${m}`)} and ${M(`x = ${m + 1}`)}.`,
    });
  }
  const V = (b + 1) * b ** m;
  return ask(X, {
    topic: 'Algebra', skill: 'Exponential equations', diff: 3,
    q: `If ${M(`${b}^{x+1} + ${b}^x = ${nm(V)}`)}, what is the value of ${M('x')}?`,
    ans: m, wrongs: [m + 1, m - 1, 2 * m + 1, m + 2],
    expl: `Factor out ${M(`${b}^x`)}: ${M(`${b}^x(${b} + 1) = ${nm(V)}`)}, so ${M(`${b}^x = ${nm(V / (b + 1))} = ${b}^{${m}}`)} and ${M(`x = ${m}`)}.`,
  });
}

function hMaxLargest(X) {
  const n = pick([4, 5, 6, 7]), m = ri(n + 1, 30), distinct = rf() < 0.6;
  const small = distinct ? (n * (n - 1)) / 2 : n - 1, ans = n * m - small;
  return ask(X, {
    topic: 'Data Analysis', skill: 'Mean', diff: 3,
    q: `The average (arithmetic mean) of ${n} ${distinct ? 'different ' : ''}positive integers is ${m}. What is the greatest possible value of the largest of these integers?`,
    ans, wrongs: [n * m, n * m - n, distinct ? n * m - (n - 1) : n * m - (n * (n - 1)) / 2, n * m - small - 1, m * (n - 1)],
    expl: `The sum is ${M(`${n} \\times ${m} = ${n * m}`)}. To make the largest as big as possible, make the others as small as possible: ${distinct ? Array.from({ length: n - 1 }, (_, i) => i + 1).join(', ') : `all equal to 1`} (sum ${small}). Largest: ${M(`${n * m} - ${small} = ${ans}`)}.`,
  });
}

function hMultSum(X) {
  const k = ri(3, 13), A = ri(10, 100), B = A + ri(50, 300);
  const first = Math.ceil(A / k) * k, last = Math.floor(B / k) * k, cnt = (last - first) / k + 1, S = (cnt * (first + last)) / 2;
  return ask(X, {
    topic: 'Arithmetic', skill: 'Consecutive integers', diff: 3,
    q: `What is the sum of all multiples of ${k} between ${A} and ${B}, inclusive?`,
    ans: S, wrongs: [S - first, S - last, ((cnt + 1) * (first + last)) / 2, S + k * cnt, S - k * cnt].filter(Number.isInteger),
    expl: `The first multiple is ${first} and the last is ${last}. Number of terms: ${M(`\\frac{${last} - ${first}}{${k}} + 1 = ${cnt}`)}. Sum = count × average of first and last: ${M(`${cnt} \\times \\frac{${first} + ${last}}{2} = ${nm(S)}`)}.`,
  });
}

function hReplace(X) {
  const n = pick([2, 2, 3]), V = n === 3 ? pick([10, 12, 15, 20]) : ri(8, 40), x = ri(1, Math.floor(V / 2));
  const num = (V - x) ** n, den = V ** n;
  return ask(X, {
    topic: 'Arithmetic', skill: 'Mixtures', diff: 3, numAns: rnd(num / den, 6), ansText: frt(num, den),
    q: `A container holds ${V} liters of pure juice. ${x} liter${x > 1 ? 's are' : ' is'} removed and replaced with water, and the mixture is stirred. This process is done ${n === 2 ? 'a second time' : 'two more times (three times in all)'}. What fraction of the final mixture is juice?`,
    ans: M(fr(num, den)), wrongs: [M(fr(V - n * x, V)), M(fr(V - x, V)), M(fr(x ** n, den)), M(fr((V - x) ** (n - 1), V ** (n - 1)) === M(fr(V - x, V)) ? fr(V - x - 1, V) : fr((V - x) ** (n - 1), V ** (n - 1))), M(fr(den - num, den))],
    expl: `Each replacement keeps ${M(`\\frac{${V - x}}{${V}}`)} of the juice that was there. After ${n} replacements: ${M(`\\left(\\frac{${V - x}}{${V}}\\right)^{${n}} = ${fr(num, den)}`)}. Subtracting ${n * x} liters of juice in total is wrong, because later removals take out a mixture, not pure juice.`,
  });
}

function hRatioAvg(X) {
  let a1, a2, c, p, q;
  do { a1 = ri(50, 80); a2 = a1 + ri(6, 30); c = ri(a1 + 1, a2 - 1); p = a2 - c; q = c - a1; } while (p === q);
  const g = gcd(p, q), P = p / g, Q = q / g;
  const rs = (x, y) => `${x} : ${y}`;
  return ask(X, {
    topic: 'Data Analysis', skill: 'Weighted average', diff: 3, numeric: false,
    q: `In a class, the boys' average score was ${a1} and the girls' average score was ${a2}. The average score of the whole class was ${c}. What is the ratio of the number of boys to the number of girls?`,
    ans: rs(P, Q), wrongs: [rs(Q, P), rs(a1, a2), rs(P + 1, Q), rs(c - a1, c), rs(P, Q + 1)].filter((s) => s !== rs(P, Q)), fmt: (s) => s, order: 'shuffle',
    expl: `With ${M('b')} boys and ${M('g')} girls: ${M(`${a1}b + ${a2}g = ${c}(b + g)`)}. Rearranging gives ${M(`(${c} - ${a1})b = (${a2} - ${c})g`)}, i.e. ${M(`${q === 1 ? '' : q}b = ${p === 1 ? '' : p}g`)}, so ${M(`b : g = ${p} : ${q}${g > 1 ? ` = ${P} : ${Q}` : ''}`)}. Check: the class average is closer to the ${P > Q ? "boys'" : "girls'"} average, so there are more ${P > Q ? 'boys' : 'girls'}.`,
  });
}

module.exports = {
  hardTemplates: { hQC, hRevenue, hInterestDiff, hAtLeastOne, hCommittee, hNotDivisible, hCRT, hMeet, hWorkStop, hInscribed, hIntercepts, hExpFactor, hMaxLargest, hMultSum, hReplace, hRatioAvg },
};
