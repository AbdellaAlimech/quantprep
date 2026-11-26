// Templates used by both exams. Each template takes X = { exam: 'gre'|'sat', n: choiceCount }
const L = require('./lib');
const { R, rf, ri, pick, nz, shuffle, gcd, lcm, rnd, M, nf, nm, money, fr, frt, piStr, radStr, poly, lin, sgn, mkChoices } = L;

const tp = (X, g, s) => (X.exam === 'gre' ? g : s);
const T = {
  arith: (X) => tp(X, 'Arithmetic', 'Problem Solving & Data Analysis'),
  alg: (X) => 'Algebra',
  adv: (X) => tp(X, 'Algebra', 'Advanced Math'),
  geo: (X) => tp(X, 'Geometry', 'Geometry & Trigonometry'),
  data: (X) => tp(X, 'Data Analysis', 'Problem Solving & Data Analysis'),
};

function ask(X, o) {
  const base = { topic: o.topic, skill: o.skill, diff: o.diff, expl: o.expl };
  const numVal = typeof o.ans === 'number' ? o.ans : o.numAns;
  if (o.numeric !== false && typeof numVal === 'number' && rf() < 0.28) {
    const p = { ...base, type: X.exam === 'gre' ? 'num' : 'grid', q: o.q, answer: numVal, ansText: o.ansText || nf(numVal) };
    if (o.round) p.tol = 0.5 * 10 ** -o.round + 1e-9;
    if (o.pre) p.pre = o.pre;
    if (o.post) p.post = o.post;
    return p;
  }
  const c = mkChoices(o.ans, o.wrongs || [], X.n, o.fmt, o.order);
  return { ...base, type: 'mc', q: o.q, choices: c.choices, answer: c.answer };
}
const pctF = (v) => `${nf(v)}%`;
const usd = (v) => `$${money(v)}`;
const intOnly = (arr) => arr.filter((v) => Number.isInteger(v));

// ---------------- ARITHMETIC / PERCENT / RATIO ----------------
function percentChange(X) {
  const p = ri(4, 60) * 5, pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]), up = rf() < 0.5;
  const q2 = p * (up ? 1 + pct / 100 : 1 - pct / 100), diff = Math.abs(q2 - p);
  const item = pick(['jacket', 'laptop', 'bicycle', 'share of stock', 'concert ticket', 'textbook', 'pair of shoes', 'monthly bus pass']);
  return ask(X, {
    topic: T.arith(X), skill: 'Percent change', diff: 1, post: '%',
    q: `The price of a ${item} changed from $${money(p)} to $${money(q2)}. By what percent did the price ${up ? 'increase' : 'decrease'}?`,
    ans: pct, wrongs: [rnd((diff / q2) * 100, 1), pct + 5, pct * 2, 100 - pct, pct / 2], fmt: pctF,
    expl: `Percent change = (change ÷ original) × 100. The change is $${money(diff)}, and the original price is $${money(p)}, so the percent ${up ? 'increase' : 'decrease'} is ${M(R`\frac{${money(diff)}}{${money(p)}} \times 100 = ${pct}`)}%. A common trap is dividing by the new price instead of the original price.`,
  });
}

function successivePercent(X) {
  const a = pick([10, 20, 25, 30, 40, 50]), b = pick([10, 20, 25, 30, 40, 50]);
  const mode = pick(['ud', 'du', 'uu']);
  const f1 = mode === 'du' ? 1 - a / 100 : 1 + a / 100, f2 = mode === 'ud' ? 1 - b / 100 : mode === 'du' ? 1 + b / 100 : 1 + b / 100;
  const ans = rnd(f1 * f2 * 100, 2);
  const w1 = mode === 'ud' ? 100 + a - b : mode === 'du' ? 100 - a + b : 100 + a + b;
  const desc = mode === 'ud' ? `increased by ${a}% and then decreased by ${b}%` : mode === 'du' ? `decreased by ${a}% and then increased by ${b}%` : `increased by ${a}% and then increased again by ${b}%`;
  return ask(X, {
    topic: T.arith(X), skill: 'Successive percents', diff: 2, post: '%',
    q: `The value of an investment was ${desc}. The final value is what percent of the original value?`,
    ans, wrongs: [w1, rnd(100 * (2 - f1 * f2), 2), rnd(f1 * 100, 2), rnd(f2 * 100, 2), 100], fmt: pctF,
    expl: `Multiply the growth factors: ${M(`${rnd(f1, 2)} \\times ${rnd(f2, 2)} = ${rnd(f1 * f2, 4)}`)}, so the final value is ${nf(ans)}% of the original. Percents applied one after another multiply; you cannot simply add or subtract them.`,
  });
}

function percentOf(X) {
  if (rf() < 0.5) {
    const a = pick([10, 20, 25, 40, 50, 60, 75, 80, 120, 150]), b = pick([10, 20, 25, 30, 40, 50, 60, 75]), c = ri(1, 30) * 100;
    const ans = (a * b * c) / 10000;
    return ask(X, {
      topic: T.arith(X), skill: 'Percents', diff: 1,
      q: `What is ${a}% of ${b}% of ${nf(c)}?`,
      ans, wrongs: [((a + b) * c) / 100, (a * c) / 100, (b * c) / 100, ans * 10, ans / 10],
      expl: `Convert each percent to a decimal and multiply: ${M(`${a / 100} \\times ${b / 100} \\times ${nm(c)} = ${nm(ans)}`)}.`,
    });
  }
  const p = pick([4, 5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 125, 150]), y = ri(2, 40) * 20;
  const x = (p * y) / 100;
  return ask(X, {
    topic: T.arith(X), skill: 'Percents', diff: 1,
    q: `${nf(x)} is ${p}% of what number?`,
    ans: y, wrongs: [rnd((x * p) / 100, 2), x + p, rnd(y / 2, 2), y * 2, rnd((100 * p) / x, 2)],
    expl: `Let the number be ${M('n')}. Then ${M(`${p / 100}n = ${nm(x)}`)}, so ${M(`n = ${nm(x)} \\div ${p / 100} = ${nm(y)}`)}.`,
  });
}

function ratioShare(X) {
  let a, b, c;
  do { a = ri(1, 9); b = ri(1, 9); c = ri(1, 9); } while (a === b || b === c || a === c);
  const k = ri(2, 40) * pick([1, 5, 10]), s = a + b + c, total = k * s;
  const mx = Math.max(a, b, c), mn = Math.min(a, b, c), md = s - mx - mn;
  const what = pick(['largest', 'smallest']);
  const ans = k * (what === 'largest' ? mx : mn);
  return ask(X, {
    topic: T.arith(X), skill: 'Ratios', diff: 1, pre: '$',
    q: `A prize of $${nf(total)} is divided among three winners in the ratio ${a} : ${b} : ${c}. How many dollars does the winner with the ${what} share receive?`,
    ans, wrongs: [k * md, k * (what === 'largest' ? mn : mx), rnd(total / 3, 2), k * (mx - mn), total - ans], fmt: usd,
    expl: `The ratio has ${a} + ${b} + ${c} = ${s} parts, so each part is worth ${M(`${nm(total)} \\div ${s} = ${nm(k)}`)} dollars. The ${what} share is ${what === 'largest' ? mx : mn} part${(what === 'largest' ? mx : mn) === 1 ? '' : 's'}: ${M(`${what === 'largest' ? mx : mn} \\times ${nm(k)} = ${nm(ans)}`)}.`,
  });
}

function ratioDifference(X) {
  let a, b; do { a = ri(1, 9); b = ri(2, 12); } while (a >= b || gcd(a, b) !== 1);
  const k = ri(2, 25), n = k * (b - a), total = k * (a + b);
  const [A, B] = pick([['cats', 'dogs'], ['boys', 'girls'], ['red marbles', 'blue marbles'], ['fiction books', 'nonfiction books'], ['juniors', 'seniors']]);
  return ask(X, {
    topic: T.arith(X), skill: 'Ratios', diff: 2,
    q: `The ratio of ${A} to ${B} in a group is ${a} : ${b}. If there are ${n} more ${B} than ${A}, how many ${A} and ${B} are there in total?`,
    ans: total, wrongs: [k * b, k * a, n * (a + b), n * 2, total + n],
    expl: `Write the counts as ${M(`${a}k`)} and ${M(`${b}k`)}. Their difference is ${M(`${b - a}k = ${n}`)}, so ${M(`k = ${k}`)}. The total is ${M(`${a + b}k = ${total}`)}.`,
  });
}

function averageRemove(X) {
  let n, m, m2, x;
  do { n = ri(5, 12); m = ri(10, 90); m2 = m + nz(-6, 6); x = n * m - (n - 1) * m2; } while (x <= 0 || x > 300);
  return ask(X, {
    topic: T.data(X), skill: 'Mean', diff: 2,
    q: `The average (arithmetic mean) of ${n} numbers is ${m}. When one of the numbers is removed, the average of the remaining numbers is ${m2}. What number was removed?`,
    ans: x, wrongs: [Math.abs(m - m2), n * (m - m2), m2, m + m2, (n - 1) * m - n * m2],
    expl: `The original sum is ${M(`${n} \\times ${m} = ${n * m}`)}. The new sum is ${M(`${n - 1} \\times ${m2} = ${(n - 1) * m2}`)}. The removed number is ${M(`${n * m} - ${(n - 1) * m2} = ${x}`)}.`,
  });
}

function nextScore(X) {
  let k, a, t, need;
  do { k = ri(3, 7); a = ri(70, 90); t = a + ri(1, 6); need = t * (k + 1) - k * a; } while (need > 100);
  return ask(X, {
    topic: T.data(X), skill: 'Mean', diff: 1,
    q: `A student's average (arithmetic mean) score on ${k} tests is ${a}. What score does the student need on the next test to raise the average of all ${k + 1} tests to ${t}?`,
    ans: need, wrongs: [t, t + (t - a), 2 * t - a + 1, need - k, need + (t - a)],
    expl: `The ${k + 1} tests must total ${M(`${k + 1} \\times ${t} = ${t * (k + 1)}`)}. The first ${k} total ${M(`${k} \\times ${a} = ${k * a}`)}. So the next score must be ${M(`${t * (k + 1)} - ${k * a} = ${need}`)}.`,
  });
}

function weightedAvg(X) {
  const n1 = ri(8, 40), n2 = ri(8, 40), a1 = ri(60, 95), a2 = ri(55, 95);
  if (a1 === a2) return weightedAvg(X);
  const exact = (n1 * a1 + n2 * a2) / (n1 + n2), ans = rnd(exact, 1);
  return ask(X, {
    topic: T.data(X), skill: 'Weighted average', diff: 2, round: 1,
    q: `In one class, ${n1} students had an average score of ${a1}. In another class, ${n2} students had an average score of ${a2}. What was the average score of all ${n1 + n2} students, to the nearest tenth?`,
    ans, wrongs: [rnd((a1 + a2) / 2, 1), rnd((n1 * a2 + n2 * a1) / (n1 + n2), 1), rnd(ans + 1.3, 1), rnd(ans - 0.9, 1)],
    expl: `Weighted average = total points ÷ total students = ${M(R`\frac{${n1}(${a1}) + ${n2}(${a2})}{${n1 + n2}} = \frac{${n1 * a1 + n2 * a2}}{${n1 + n2}} \approx ${ans}`)}. The simple average of ${a1} and ${a2} is wrong because the classes have different sizes.`,
  });
}

function compoundInterest(X) {
  const P = ri(10, 80) * 100, r = pick([2, 3, 4, 5, 6, 8, 10]), n = pick([2, 3]);
  const A = rnd(P * (1 + r / 100) ** n, 2);
  return ask(X, {
    topic: T.arith(X), skill: 'Interest', diff: 2, pre: '$', round: 2,
    q: `An account earns ${r}% interest compounded annually. If $${nf(P)} is deposited and no other deposits or withdrawals are made, what is the balance after ${n} years, to the nearest cent?`,
    ans: A, wrongs: [rnd(P * (1 + (n * r) / 100), 2), rnd(P * (1 + r / 100) ** (n - 1), 2), rnd(P * (1 + r / 100) ** (n + 1), 2), rnd((P * r * n) / 100, 2)], fmt: usd,
    expl: `Compound interest: ${M(`A = P(1 + r)^n = ${nm(P)}(1.${r < 10 ? '0' + r : r})^{${n}} \\approx ${nm(A)}`)}. Simple interest would give only $${money(P * (1 + (n * r) / 100))}.`,
  });
}

function discountTax(X) {
  const p = ri(4, 60) * 5, d = pick([10, 15, 20, 25, 30, 40]), t = pick([4, 5, 6, 8, 10]);
  const fin = rnd(p * (1 - d / 100) * (1 + t / 100), 2);
  return ask(X, {
    topic: T.arith(X), skill: 'Percents', diff: 2, pre: '$', round: 2,
    q: `A store sells a coat for $${money(p)}. During a sale, the price is reduced by ${d}%, and then a ${t}% sales tax is applied to the reduced price. What is the total cost of the coat?`,
    ans: fin, wrongs: [rnd(p * (1 - (d - t) / 100), 2), rnd(p * (1 - d / 100), 2), rnd(p * (1 + t / 100) - (p * d) / 100 + 1, 2), rnd(p * (1 - d / 100) + t, 2)], fmt: usd,
    expl: `Sale price: ${M(`${money(p)} \\times ${rnd(1 - d / 100, 2)} = ${money(p * (1 - d / 100))}`)}. With tax: ${M(`${money(p * (1 - d / 100))} \\times ${rnd(1 + t / 100, 2)} = ${money(fin)}`)}.`,
  });
}

function mixture(X) {
  if (rf() < 0.5) {
    const x = ri(2, 12), y = ri(2, 12), p = ri(1, 9) * 5, q = ri(1, 18) * 5;
    if (p === q) return mixture(X);
    const exact = (x * p + y * q) / (x + y), ans = rnd(exact, 1);
    return ask(X, {
      topic: T.arith(X), skill: 'Mixtures', diff: 2, post: '%', round: 1,
      q: `${x} liters of a ${p}% salt solution are mixed with ${y} liters of a ${q}% salt solution. To the nearest tenth of a percent, what is the concentration of salt in the mixture?`,
      ans, wrongs: [rnd((p + q) / 2, 1), rnd((x * q + y * p) / (x + y), 1), rnd(ans + 2.5, 1), p + q], fmt: pctF,
      expl: `Salt: ${M(`${x}(${p / 100}) + ${y}(${q / 100}) = ${rnd((x * p + y * q) / 100, 3)}`)} liters out of ${x + y} liters, so the concentration is ${M(R`\frac{${rnd((x * p + y * q) / 100, 3)}}{${x + y}} \approx ${ans}\%`)}.`,
    });
  }
  // dilution: add water
  let V, p, q, w;
  do { V = ri(2, 20) * 5; p = pick([20, 25, 30, 40, 50, 60, 80]); q = pick([10, 12, 15, 20, 25, 30, 40]); w = (V * p) / q - V; } while (q >= p || !Number.isInteger(w) || w <= 0);
  return ask(X, {
    topic: T.arith(X), skill: 'Mixtures', diff: 3,
    q: `A chemist has ${V} milliliters of a ${p}% acid solution. How many milliliters of pure water must be added to make a ${q}% acid solution?`,
    ans: w, wrongs: [V * (p - q) / 100, (V * p) / q, rnd((V * q) / p, 2), V - (V * q) / p, w / 2],
    expl: `The acid stays the same: ${M(`${p / 100} \\times ${V} = ${(V * p) / 100}`)} mL. After adding ${M('w')} mL of water, ${M(`\\frac{${(V * p) / 100}}{${V} + w} = ${q / 100}`)}, so ${M(`${V} + w = ${(V * p) / q}`)} and ${M(`w = ${w}`)}.`,
  });
}

function avgSpeed(X) {
  const v1 = ri(2, 12) * 5, v2 = v1 + ri(1, 8) * 5;
  const exact = (2 * v1 * v2) / (v1 + v2), ans = rnd(exact, 1);
  const isInt = Number.isInteger(rnd(exact, 6));
  return ask(X, {
    topic: T.arith(X), skill: 'Rates', diff: 3, round: isInt ? undefined : 1,
    q: `A driver travels from home to a lake at an average speed of ${v1} miles per hour and returns along the same route at ${v2} miles per hour. What is the driver's average speed for the entire round trip, in miles per hour${isInt ? '' : ', to the nearest tenth'}?`,
    ans, wrongs: [(v1 + v2) / 2, rnd(exact + 2.5, 1), v2 - v1, rnd((v1 * v2) / (v1 + v2), 1)],
    expl: `Average speed = total distance ÷ total time. For a distance ${M('d')} each way, the time is ${M(`\\frac{d}{${v1}} + \\frac{d}{${v2}}`)}, so the average is ${M(R`\frac{2d}{\frac{d}{${v1}} + \frac{d}{${v2}}} = \frac{2(${v1})(${v2})}{${v1} + ${v2}} \approx ${ans}`)}. It is not the simple average ${(v1 + v2) / 2}, because more time is spent at the slower speed.`,
  });
}

const WORK_TRIPLES = [[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [5, 20, 4], [6, 30, 5], [12, 36, 9], [15, 30, 10], [8, 24, 6], [9, 18, 6], [14, 35, 10], [18, 36, 12], [21, 28, 12], [24, 40, 15], [10, 40, 8], [36, 45, 20], [4, 4, 2], [6, 3, 2], [30, 60, 20], [28, 84, 21], [40, 60, 24], [45, 90, 30]];
function work(X) {
  if (rf() < 0.5) {
    const a = ri(2, 12), b = ri(a + 1, 16);
    const ansS = M(fr(a * b, a + b));
    const who = pick([['Pipe A', 'Pipe B', 'fill the tank'], ['Ana', 'Ben', 'paint the fence'], ['Machine X', 'Machine Y', 'complete the order'], ['Lee', 'Kim', 'mow the lawn']]);
    return ask(X, {
      topic: T.arith(X), skill: 'Work rates', diff: 2, numAns: rnd((a * b) / (a + b), 6), ansText: frt(a * b, a + b),
      q: `${who[0]} can ${who[2]} in ${a} hours, and ${who[1]} can ${who[2]} in ${b} hours. Working together at these rates, how many hours will it take them to ${who[2]}?`,
      ans: ansS, wrongs: [M(fr(a + b, 2)), M(String(a + b)), M(fr(a * b, b - a)), M(fr(1, a + b)), M(fr(a + b, a * b))],
      expl: `Rates add: ${M(`\\frac{1}{${a}} + \\frac{1}{${b}} = \\frac{${a + b}}{${a * b}}`)} of the job per hour. Time = reciprocal = ${M(fr(a * b, a + b))} hours.`,
    });
  }
  const [a, b, t] = pick(WORK_TRIPLES);
  return ask(X, {
    topic: T.arith(X), skill: 'Work rates', diff: 3,
    q: `Working alone, a printer can finish a print job in ${a} hours. When it works together with a second printer, the job takes ${t} hours. How many hours would the second printer need to finish the job working alone?`,
    ans: b, wrongs: [a - t, a + t, rnd((a + t) / 2, 2), a * t, Math.abs(2 * t - a) || a + 1],
    expl: `${M(`\\frac{1}{${a}} + \\frac{1}{x} = \\frac{1}{${t}}`)}, so ${M(`\\frac{1}{x} = \\frac{1}{${t}} - \\frac{1}{${a}} = \\frac{${a - t}}{${a * t}}`)} and ${M(`x = ${b}`)} hours.`,
  });
}

function remainders(X) {
  const d = ri(5, 13), r = ri(1, d - 1), m = ri(2, 7), k = ri(1, 20);
  const v = pick(['mult', 'add', 'sq']);
  let expr, ans, expl;
  if (v === 'mult') { expr = `${m}n`; ans = (m * r) % d; expl = `Write ${M(`n = ${d}q + ${r}`)}. Then ${M(`${m}n = ${d}(${m}q) + ${m * r}`)}, and ${m * r} divided by ${d} leaves remainder ${ans}.`; }
  else if (v === 'add') { expr = `n + ${k}`; ans = (r + k) % d; expl = `Write ${M(`n = ${d}q + ${r}`)}. Then ${M(`n + ${k} = ${d}q + ${r + k}`)}, and ${r + k} divided by ${d} leaves remainder ${ans}.`; }
  else { expr = 'n^2'; ans = (r * r) % d; expl = `Write ${M(`n = ${d}q + ${r}`)}. Squaring, every term except ${M(`${r}^2 = ${r * r}`)} is a multiple of ${d}, and ${r * r} divided by ${d} leaves remainder ${ans}.`; }
  return ask(X, {
    topic: T.arith(X), skill: 'Remainders', diff: 2,
    q: `When the positive integer ${M('n')} is divided by ${d}, the remainder is ${r}. What is the remainder when ${M(expr)} is divided by ${d}?`,
    ans, wrongs: [r, (ans + 1) % d, d - r, v === 'sq' ? r * r : m * r, (ans + d - 1) % d, (r + m) % d].filter((x) => x < d * d),
    expl,
  });
}

function inclusionExclusion(X) {
  const pairs = [[2, 3], [2, 5], [3, 5], [3, 7], [4, 6], [4, 10], [6, 9], [5, 7], [6, 8], [3, 4], [4, 5], [6, 10]];
  const [a, b] = pick(pairs), N = ri(5, 50) * 10 + ri(0, 9), L = lcm(a, b);
  const fa = Math.floor(N / a), fb = Math.floor(N / b), fl = Math.floor(N / L), ans = fa + fb - fl;
  return ask(X, {
    topic: T.arith(X), skill: 'Counting multiples', diff: 3,
    q: `How many integers from 1 to ${N}, inclusive, are divisible by ${a} or ${b} (or both)?`,
    ans, wrongs: [fa + fb, fa + fb - Math.floor(N / (a * b)), fl, fa + fb - 2 * fl, N - ans],
    expl: `Multiples of ${a}: ${M(`\\lfloor ${N}/${a} \\rfloor = ${fa}`)}. Multiples of ${b}: ${fb}. Multiples of both (multiples of lcm ${L}): ${fl}. Using inclusion–exclusion: ${M(`${fa} + ${fb} - ${fl} = ${ans}`)}.`,
  });
}

function divisors(X) {
  const primes = shuffle([2, 3, 5, 7]).slice(0, pick([2, 2, 3]));
  primes.sort((a, b) => a - b);
  const ex = primes.map(() => ri(1, 3));
  const N = primes.reduce((s, p, i) => s * p ** ex[i], 1);
  if (N > 6000 || N < 20) return divisors(X);
  const fact = primes.map((p, i) => (ex[i] > 1 ? `${p}^{${ex[i]}}` : `${p}`)).join(' \\cdot ');
  if (rf() < 0.6) {
    const ans = ex.reduce((s, e) => s * (e + 1), 1);
    return ask(X, {
      topic: T.arith(X), skill: 'Factors', diff: 2,
      q: `How many positive divisors does ${M(nm(N))} have?`,
      ans, wrongs: [ex.reduce((s, e) => s * e, 1), ex.reduce((s, e) => s + e, 0) + 1, ans - 2, ans + 2, ex.reduce((s, e) => s + e + 1, 0)],
      expl: `Prime factorization: ${M(`${nm(N)} = ${fact}`)}. Add 1 to each exponent and multiply: ${M(ex.map((e) => `(${e}+1)`).join(''))} = ${ans}.`,
    });
  }
  const ans = primes.reduce((s, p) => s + p, 0);
  return ask(X, {
    topic: T.arith(X), skill: 'Prime factors', diff: 1,
    q: `What is the sum of the distinct prime factors of ${M(nm(N))}?`,
    ans, wrongs: [primes.reduce((s, p, i) => s + p * ex[i], 0), ans + 1, primes.reduce((s, p) => s * p, 1), ans - 2, Math.max(...primes)],
    expl: `${M(`${nm(N)} = ${fact}`)}. The distinct primes are ${primes.join(', ')}, which sum to ${ans}.`,
  });
}

function exponentRules(X) {
  const base = pick([[2, 4, 8], [3, 9, 27], [5, 25, 125]]);
  const a = ri(1, 12), b = ri(1, 8), c = ri(1, 6);
  const k = a + 2 * b - 3 * c;
  return ask(X, {
    topic: T.adv(X), skill: 'Exponents', diff: 2,
    q: `If ${M(`\\dfrac{${base[0]}^{${a}} \\cdot ${base[1]}^{${b}}}{${base[2]}^{${c}}} = ${base[0]}^{k}`)}, what is the value of ${M('k')}?`,
    ans: k, wrongs: [a + b - c, a + 2 * b + 3 * c, a * b - c, a + 2 * b - c, k + 1, 2 * a + b - 3 * c],
    expl: `Rewrite everything with base ${base[0]}: ${M(`${base[1]}^{${b}} = ${base[0]}^{${2 * b}}`)} and ${M(`${base[2]}^{${c}} = ${base[0]}^{${3 * c}}`)}. Then ${M(`k = ${a} + ${2 * b} - ${3 * c} = ${k}`)}.`,
  });
}

function unitsDigit(X) {
  const b = pick([2, 3, 4, 7, 8, 9, 12, 13, 17, 18, 19, 22, 23, 27]), n = ri(20, 250);
  const cyc = []; let v = b % 10; do { cyc.push(v); v = (v * b) % 10; } while (v !== cyc[0]);
  const ans = cyc[(n - 1) % cyc.length];
  return ask(X, {
    topic: T.arith(X), skill: 'Units digit', diff: 2,
    q: `What is the units digit of ${M(`${b}^{${n}}`)}?`,
    ans, wrongs: [...cyc, b % 10, (ans + 2) % 10, 0, 5, 1],
    expl: `Only the units digit matters. The units digits of powers of ${b} repeat in the cycle ${cyc.join(', ')} (length ${cyc.length}). Since ${M(`${n} = ${cyc.length} \\times ${Math.floor((n - 1) / cyc.length)} + ${((n - 1) % cyc.length) + 1}`)}, ${M(`${b}^{${n}}`)} lands on position ${((n - 1) % cyc.length) + 1} of the cycle, so the units digit is ${ans}.`,
  });
}

function consecutive(X) {
  const kind = pick(['integers', 'even integers', 'odd integers']);
  const k = ri(3, 9), step = kind === 'integers' ? 1 : 2;
  let s = ri(-10, 60); if (kind === 'even integers' && s % 2) s++; if (kind === 'odd integers' && s % 2 === 0) s++;
  const terms = Array.from({ length: k }, (_, i) => s + i * step), S = terms.reduce((x, y) => x + y, 0);
  const ask_ = pick(['largest', 'smallest']), ans = ask_ === 'largest' ? terms[k - 1] : terms[0];
  return ask(X, {
    topic: T.arith(X), skill: 'Consecutive integers', diff: 2,
    q: `The sum of ${k} consecutive ${kind} is ${S}. What is the ${ask_} of these ${kind}?`,
    ans, wrongs: [ask_ === 'largest' ? terms[0] : terms[k - 1], rnd(S / k, 2), ans + step, ans - step, terms[Math.floor(k / 2)] + 1],
    expl: `For evenly spaced numbers, the average is the middle value: ${M(`${S} \\div ${k} = ${rnd(S / k, 2)}`)}. The numbers are ${terms.join(', ')}, so the ${ask_} is ${ans}.`,
  });
}

function fractionArith(X) {
  let a, b, c, d, e, f;
  do { b = ri(2, 9); d = ri(2, 9); f = ri(2, 9); a = ri(1, b - 1); c = ri(1, d - 1); e = ri(1, f + 3); }
  while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || gcd(e, f) !== 1 || b === d);
  const N = (a * d + b * c) * e, D = b * d * f;
  const op = pick(['times', 'div']);
  let ans, wrongs, num, den, expr;
  if (op === 'times') { num = N; den = D; expr = `\\left(\\frac{${a}}{${b}} + \\frac{${c}}{${d}}\\right) \\times \\frac{${e}}{${f}}`; }
  else { num = (a * d + b * c) * f; den = b * d * e; expr = `\\left(\\frac{${a}}{${b}} + \\frac{${c}}{${d}}\\right) \\div \\frac{${e}}{${f}}`; }
  ans = M(fr(num, den));
  const s1 = [(a + c) * (op === 'times' ? e : f), (b + d) * (op === 'times' ? f : e)];
  wrongs = [M(fr(s1[0], s1[1])), M(fr(op === 'times' ? (a * d + b * c) * f : N, op === 'times' ? b * d * e : D)), M(fr(a * d + b * c, b * d)), M(fr(num + den, den)), M(fr(num, den + 1)), M(fr(num + 1, den))];
  return ask(X, {
    topic: T.arith(X), skill: 'Fractions', diff: 1, numAns: rnd(num / den, 6), ansText: frt(num, den),
    q: `What is the value of ${M(expr)}?`,
    ans, wrongs,
    expl: `First add: ${M(`\\frac{${a}}{${b}} + \\frac{${c}}{${d}} = \\frac{${a * d + b * c}}{${b * d}}`)}. Then ${op === 'times' ? 'multiply' : 'multiply by the reciprocal'}: ${M(`\\frac{${a * d + b * c}}{${b * d}} \\times \\frac{${op === 'times' ? e : f}}{${op === 'times' ? f : e}} = ${fr(num, den)}`)}.`,
  });
}

function sequences(X) {
  if (rf() < 0.6) {
    const a1 = ri(-20, 30), d = nz(-9, 12), n = ri(10, 60);
    if (rf() < 0.5) {
      const ans = a1 + (n - 1) * d;
      return ask(X, {
        topic: T.alg(X), skill: 'Arithmetic sequences', diff: 1,
        q: `In an arithmetic sequence, the first term is ${a1} and each term after the first is ${d > 0 ? d + ' more' : -d + ' less'} than the term before it. What is the ${ord(n)} term?`,
        ans, wrongs: [a1 + n * d, a1 + (n - 2) * d, n * d, ans + 1, a1 * n],
        expl: `${M(`a_n = a_1 + (n-1)d = ${a1} + (${n - 1})(${d}) = ${ans}`)}.`,
      });
    }
    const S = (n * (2 * a1 + (n - 1) * d)) / 2;
    return ask(X, {
      topic: T.alg(X), skill: 'Arithmetic sequences', diff: 2,
      q: `What is the sum of the first ${n} terms of the arithmetic sequence ${a1}, ${a1 + d}, ${a1 + 2 * d}, ${a1 + 3 * d}, ...?`,
      ans: S, wrongs: [n * (a1 + (n - 1) * d), (n * (2 * a1 + n * d)) / 2, a1 + (n - 1) * d, S + d * n, (n * (a1 + (n - 1) * d)) / 2],
      expl: `The last term is ${M(`${a1} + ${n - 1}(${d}) = ${a1 + (n - 1) * d}`)}. Sum = number of terms × average of first and last: ${M(`${n} \\times \\frac{${a1} + ${a1 + (n - 1) * d}}{2} = ${nm(S)}`)}.`,
    });
  }
  const a1 = ri(1, 9), r = pick([2, 3, -2]), n = ri(4, r === 3 ? 7 : 9);
  const ans = a1 * r ** (n - 1);
  return ask(X, {
    topic: T.alg(X), skill: 'Geometric sequences', diff: 2,
    q: `The first term of a sequence is ${a1}, and each term after the first is ${r} times the previous term. What is the ${ord(n)} term?`,
    ans, wrongs: [a1 * r ** n, a1 * r ** (n - 2), a1 * r * (n - 1), (a1 * r) ** (n - 1), -ans],
    expl: `${M(`a_n = a_1 r^{n-1} = ${a1}(${r})^{${n - 1}} = ${nm(ans)}`)}.`,
  });
}
function ord(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// ---------------- ALGEBRA ----------------
function linEq(X) {
  let a, b, c, x, d;
  do { a = nz(-9, 9); b = nz(-9, 9); c = nz(-9, 9); x = ri(-12, 12); } while (a === c || Math.abs(a) === 1);
  d = a * (x + b) - c * x;
  const w = [(d - b) / (a - c), (d + a * b) / (a - c), -x, (d - a * b) / (a + c), x + 1, x - 2];
  return ask(X, {
    topic: T.alg(X), skill: 'Linear equations', diff: 1,
    q: `If ${M(`${a}(x ${sgn(b)}) = ${poly([[c, 'x'], [d, '']])}`)}, what is the value of ${M('x')}?`,
    ans: x, wrongs: intOnly(w),
    expl: `Distribute: ${M(`${poly([[a, 'x'], [a * b, '']])} = ${poly([[c, 'x'], [d, '']])}`)}. Collect terms: ${M(`${poly([[a - c, 'x']])} = ${d - a * b}`)}, so ${M(`x = ${x}`)}.`,
  });
}

function systemEq(X) {
  let a1, b1, a2, b2, x, y;
  do { a1 = nz(-6, 7); b1 = nz(-6, 7); a2 = nz(-6, 7); b2 = nz(-6, 7); } while (a1 * b2 - a2 * b1 === 0 || (a1 === a2 && b1 === b2));
  x = ri(-9, 9); y = ri(-9, 9);
  const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
  const what = pick(['x + y', 'x - y', 'x', 'y', 'xy']);
  const val = { 'x + y': x + y, 'x - y': x - y, x, y, xy: x * y }[what];
  return ask(X, {
    topic: T.alg(X), skill: 'Systems of equations', diff: 2,
    q: `${M(R`\begin{aligned} ${poly([[a1, 'x'], [b1, 'y']])} &= ${c1} \\ ${poly([[a2, 'x'], [b2, 'y']])} &= ${c2} \end{aligned}`)}<br>If ${M('(x, y)')} is the solution to the system of equations above, what is the value of ${M(what)}?`,
    ans: val, wrongs: [x + y, x - y, x, y, x * y, -val, y - x].filter((v) => v !== val),
    expl: `Solving the system (by elimination or substitution) gives ${M(`x = ${x}`)} and ${M(`y = ${y}`)}. Check: ${M(`${a1}(${x}) + (${b1})(${y}) = ${c1}`)}. Therefore ${M(`${what} = ${val}`)}.`,
  });
}

function quadRoots(X) {
  let r1, r2; do { r1 = ri(-9, 9); r2 = ri(-9, 9); } while (r1 === r2);
  const a = pick([1, 1, 1, 2, 3]);
  const B = -a * (r1 + r2), C = a * r1 * r2;
  const eq = `${poly([[a, 'x^2'], [B, 'x'], [C, '']])} = 0`;
  const what = pick(['sum', 'product', 'greater', 'difference']);
  const map = { sum: r1 + r2, product: r1 * r2, greater: Math.max(r1, r2), difference: Math.abs(r1 - r2) };
  const ans = map[what];
  const qtxt = { sum: 'the sum of the solutions', product: 'the product of the solutions', greater: 'the greater of the two solutions', difference: 'the positive difference between the two solutions' }[what];
  return ask(X, {
    topic: T.adv(X), skill: 'Quadratic equations', diff: 2,
    q: `What is ${qtxt} of ${M(eq)}?`,
    ans, wrongs: [-(r1 + r2), r1 + r2, r1 * r2, -r1 * r2, Math.min(r1, r2), Math.abs(r1 + r2), B, C].filter((v) => v !== ans),
    expl: `Factor: ${M(`${a === 1 ? '' : a}(x ${sgn(-r1)})(x ${sgn(-r2)}) = 0`)}, so the solutions are ${M(`x = ${r1}`)} and ${M(`x = ${r2}`)}. Therefore ${qtxt} is ${ans}.`,
  });
}

function funcEval(X) {
  const a = nz(-4, 4), b = ri(-9, 9), c = ri(-12, 12), m = nz(-5, 5), n = ri(-8, 8), k = ri(-5, 5);
  const f = (x) => a * x * x + b * x + c, g = (x) => m * x + n;
  const fs = poly([[a, 'x^2'], [b, 'x'], [c, '']]), gs = poly([[m, 'x'], [n, '']]);
  if (rf() < 0.5) {
    const ans = f(g(k));
    return ask(X, {
      topic: T.adv(X), skill: 'Functions', diff: 2,
      q: `The functions ${M('f')} and ${M('g')} are defined by ${M(`f(x) = ${fs}`)} and ${M(`g(x) = ${gs}`)}. What is the value of ${M(`f(g(${k}))`)}?`,
      ans, wrongs: [g(f(k)), f(k) * g(k), f(k) + g(k), f(-g(k)), f(g(k)) + 2 * b],
      expl: `First ${M(`g(${k}) = ${m}(${k}) ${sgn(n)} = ${g(k)}`)}. Then ${M(`f(${g(k)}) = ${a}(${g(k)})^2 ${sgn(b)}(${g(k)}) ${sgn(c)} = ${ans}`)}.`,
    });
  }
  const ans = f(k);
  return ask(X, {
    topic: T.adv(X), skill: 'Functions', diff: 1,
    q: `If ${M(`f(x) = ${fs}`)}, what is the value of ${M(`f(${k})`)}?`,
    ans, wrongs: [f(-k), a * k * 2 + b * k + c, -a * k * k + b * k + c, ans + c, a * k + b * k + c],
    expl: `Substitute ${M(`x = ${k}`)}: ${M(`${a}(${k})^2 ${sgn(b)}(${k}) ${sgn(c)} = ${a * k * k} ${sgn(b * k)} ${sgn(c)} = ${ans}`)}.`,
  });
}

function absIneq(X) {
  const a = ri(-10, 10), b = ri(2, 12), strict = rf() < 0.5;
  const op = strict ? '<' : R`\le`;
  if (rf() < 0.5) {
    const ans = strict ? 2 * b - 1 : 2 * b + 1;
    return ask(X, {
      topic: T.alg(X), skill: 'Absolute value', diff: 2,
      q: `How many integers ${M('x')} satisfy ${M(`|x ${sgn(-a)}| ${op} ${b}`)}?`,
      ans, wrongs: [2 * b, strict ? 2 * b + 1 : 2 * b - 1, b, b + 1, 2 * b + 2],
      expl: `${M(`|x ${sgn(-a)}| ${op} ${b}`)} means ${M(`${a - b} ${op} x ${op} ${a + b}`)}. The integers in this range number ${ans}${strict ? ' (endpoints excluded)' : ' (endpoints included)'}.`,
    });
  }
  const lo = strict ? a - b + 1 : a - b, hi = strict ? a + b - 1 : a + b;
  const ans = ((lo + hi) * (hi - lo + 1)) / 2;
  return ask(X, {
    topic: T.alg(X), skill: 'Absolute value', diff: 3,
    q: `What is the sum of all integers ${M('x')} that satisfy ${M(`|x ${sgn(-a)}| ${op} ${b}`)}?`,
    ans, wrongs: [a * 2 * b, (a - b) + (a + b), ans + a, a, hi - lo, ans - hi],
    expl: `The inequality gives ${M(`${a - b} ${op} x ${op} ${a + b}`)}, so the integers run from ${lo} to ${hi}. They are symmetric about ${a}, so the sum is ${M(`${a} \\times ${hi - lo + 1} = ${ans}`)}.`,
  });
}

function expEq(X) {
  const [bs, pw] = pick([[2, 2], [2, 3], [3, 2], [5, 2], [2, 4], [3, 3]]);
  const big = bs ** pw;
  let p, r, s, x, q;
  do { p = nz(-6, 8); r = nz(-4, 5); s = ri(-6, 6); x = ri(-6, 8); } while (p === pw * r);
  q = pw * r * x + pw * s - p * x;
  return ask(X, {
    topic: T.adv(X), skill: 'Exponential equations', diff: 2,
    q: `If ${M(`${bs}^{${lin(p, q)}} = ${big}^{${lin(r, s)}}`)}, what is the value of ${M('x')}?`,
    ans: x, wrongs: intOnly([(s - q) / (p - r), -x, (pw * s + q) / (p - pw * r), x + 1, (s - q) / (p - pw * r)]),
    expl: `Rewrite ${M(`${big} = ${bs}^{${pw}}`)}, so the right side is ${M(`${bs}^{${pw}(${lin(r, s)})} = ${bs}^{${lin(pw * r, pw * s)}}`)}. Set exponents equal: ${M(`${lin(p, q)} = ${lin(pw * r, pw * s)}`)}, giving ${M(`x = ${x}`)}.`,
  });
}

function ages(X) {
  const B = ri(3, 25), n = ri(2, 12), A = 2 * B + n, S = A + B;
  const [p1, p2] = pick([['Ana', 'Ben'], ['Maya', 'Leo'], ['Omar', 'Sara'], ['Kai', 'Nora'], ['Ivy', 'Sam']]);
  return ask(X, {
    topic: T.alg(X), skill: 'Word problems', diff: 2,
    q: `The sum of ${p1}'s and ${p2}'s current ages is ${S}. In ${n} years, ${p1} will be twice as old as ${p2} will be then. How old is ${p1} now?`,
    ans: A, wrongs: [B, rnd(S / 2, 1), A + n, B + n, 2 * B],
    expl: `Let ${p2}'s age be ${M('b')}. Then ${p1} is ${M(`${S} - b`)}. In ${n} years: ${M(`${S} - b + ${n} = 2(b + ${n})`)}, so ${M(`${S - n} = 3b`)}, ${M(`b = ${B}`)}, and ${p1} is ${A}.`,
  });
}

function variation(X) {
  const kind = pick(['inverse', 'direct', 'square']);
  if (kind === 'inverse') {
    let x1, y1, x2, k; do { x1 = ri(2, 15); y1 = ri(2, 20); k = x1 * y1; x2 = pick(divs(k)); } while (x2 === x1);
    const ans = k / x2;
    return ask(X, {
      topic: T.alg(X), skill: 'Variation', diff: 2,
      q: `The quantity ${M('y')} varies inversely with ${M('x')}. If ${M(`y = ${y1}`)} when ${M(`x = ${x1}`)}, what is ${M('y')} when ${M(`x = ${x2}`)}?`,
      ans, wrongs: [rnd((y1 * x2) / x1, 2), y1 + x1 - x2, rnd(x2 / k, 3), k * x2, y1],
      expl: `Inverse variation means ${M('xy')} is constant: ${M(`${x1} \\times ${y1} = ${k}`)}. So ${M(`y = ${k} \\div ${x2} = ${ans}`)}.`,
    });
  }
  if (kind === 'direct') {
    const x1 = ri(2, 12), k = ri(2, 9), y1 = k * x1, x2 = ri(2, 20);
    return ask(X, {
      topic: T.alg(X), skill: 'Variation', diff: 1,
      q: `The quantity ${M('y')} varies directly with ${M('x')}. If ${M(`y = ${y1}`)} when ${M(`x = ${x1}`)}, what is ${M('y')} when ${M(`x = ${x2}`)}?`,
      ans: k * x2, wrongs: [rnd((y1 * x1) / x2, 2), y1 + x2 - x1, k + x2, x2 * x1, y1 * x2],
      expl: `${M('y = kx')} with ${M(`k = ${y1} \\div ${x1} = ${k}`)}. So ${M(`y = ${k}(${x2}) = ${k * x2}`)}.`,
    });
  }
  const x1 = ri(2, 6), k = ri(1, 5), x2 = ri(2, 9);
  if (x1 === x2) return variation(X);
  return ask(X, {
    topic: T.alg(X), skill: 'Variation', diff: 3,
    q: `The quantity ${M('y')} varies directly with the square of ${M('x')}. If ${M(`y = ${k * x1 * x1}`)} when ${M(`x = ${x1}`)}, what is ${M('y')} when ${M(`x = ${x2}`)}?`,
    ans: k * x2 * x2, wrongs: [rnd((k * x1 * x1 * x2) / x1, 2), k * x2, k * x1 * x1 + x2 - x1, k * x2 * x2 * 2, (k * x2) ** 2],
    expl: `${M('y = kx^2')} with ${M(`k = ${k * x1 * x1} \\div ${x1}^2 = ${k}`)}. So ${M(`y = ${k}(${x2})^2 = ${k * x2 * x2}`)}.`,
  });
}
function divs(n) { const r = []; for (let i = 1; i <= n; i++) if (n % i === 0) r.push(i); return r; }

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
function coordinate(X) {
  const v = pick(['slope', 'dist', 'mid']);
  if (v === 'slope') {
    let x1, y1, x2, y2; do { x1 = ri(-9, 9); y1 = ri(-9, 9); x2 = ri(-9, 9); y2 = ri(-9, 9); } while (x1 === x2 || y1 === y2);
    const dy = y2 - y1, dx = x2 - x1;
    return ask(X, {
      topic: T.alg(X), skill: 'Slope', diff: 1, numAns: rnd(dy / dx, 6), ansText: frt(dy, dx),
      q: `What is the slope of the line that passes through the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)}?`,
      ans: M(fr(dy, dx)), wrongs: [M(fr(dx, dy)), M(fr(-dy, dx)), M(fr(y2 + y1, x2 + x1 || 1)), M(fr(-dx, dy)), M(fr(dy + 1, dx))],
      expl: `${M(`m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${dy}}{${dx}} = ${fr(dy, dx)}`)}.`,
    });
  }
  if (v === 'dist') {
    const [p, q, h] = pick(TRIPLES.slice(0, 4)), s = ri(1, 3), sx = pick([1, -1]), sy = pick([1, -1]);
    const x1 = ri(-8, 8), y1 = ri(-8, 8), x2 = x1 + sx * p * s, y2 = y1 + sy * q * s;
    return ask(X, {
      topic: T.geo(X), skill: 'Distance formula', diff: 2,
      q: `What is the distance between the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)} in the ${M('xy')}-plane?`,
      ans: h * s, wrongs: [(p + q) * s, p * s * q * s, h * s + 1, Math.abs(x2 + y2 - x1 - y1), (h + 2) * s],
      expl: `The horizontal change is ${p * s} and the vertical change is ${q * s}. ${M(`d = \\sqrt{${p * s}^2 + ${q * s}^2} = \\sqrt{${(h * s) ** 2}} = ${h * s}`)}.`,
    });
  }
  const x1 = ri(-10, 10), y1 = ri(-10, 10), mx = ri(-8, 8), my = ri(-8, 8), x2 = 2 * mx - x1, y2 = 2 * my - y1;
  return ask(X, {
    topic: T.geo(X), skill: 'Midpoint', diff: 2,
    q: `The midpoint of segment ${M('AB')} is ${M(`(${mx}, ${my})`)}. If point ${M('A')} is ${M(`(${x1}, ${y1})`)}, what is the sum of the coordinates of point ${M('B')}?`,
    ans: x2 + y2, wrongs: [mx + my, x1 + y1 + mx + my, rnd((x1 + mx + y1 + my) / 2, 1), 2 * (mx + my), x2 - y2],
    expl: `Each coordinate of ${M('B')} is ${M('2(\\text{midpoint}) - A')}: ${M(`B = (${x2}, ${y2})`)}. The sum is ${x2 + y2}.`,
  });
}

function recipSquares(X) {
  const k = ri(3, 12);
  if (rf() < 0.6) {
    return ask(X, {
      topic: T.adv(X), skill: 'Algebraic identities', diff: 3,
      q: `If ${M(`x + \\frac{1}{x} = ${k}`)}, what is the value of ${M(`x^2 + \\frac{1}{x^2}`)}?`,
      ans: k * k - 2, wrongs: [k * k, k * k + 2, 2 * k, k * k - 1, k * k - 4],
      expl: `Square both sides: ${M(`x^2 + 2 + \\frac{1}{x^2} = ${k * k}`)}, so ${M(`x^2 + \\frac{1}{x^2} = ${k * k - 2}`)}.`,
    });
  }
  const s = ri(5, 30), d = ri(1, s - 1);
  return ask(X, {
    topic: T.adv(X), skill: 'Algebraic identities', diff: 2,
    q: `If ${M(`a + b = ${s}`)} and ${M(`a - b = ${d}`)}, what is the value of ${M('a^2 - b^2')}?`,
    ans: s * d, wrongs: [s * s - d * d, s + d, s * s, (s * d) / 2, d * d],
    expl: `${M(`a^2 - b^2 = (a + b)(a - b) = ${s} \\times ${d} = ${s * d}`)}.`,
  });
}

// ---------------- GEOMETRY ----------------
function triangleAngles(X) {
  let a, b, c; do { a = ri(1, 9); b = ri(1, 9); c = ri(1, 9); } while (180 % (a + b + c) !== 0 || (a === b && b === c));
  const k = 180 / (a + b + c), what = pick(['largest', 'smallest']);
  const ans = k * (what === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c));
  return ask(X, {
    topic: T.geo(X), skill: 'Triangle angles', diff: 1, post: '°',
    q: `The measures of the three angles of a triangle are in the ratio ${a} : ${b} : ${c}. What is the measure, in degrees, of the ${what} angle?`,
    ans, wrongs: [k * (a + b + c - Math.max(a, b, c) - Math.min(a, b, c)), Math.max(a, b, c) * 20, ans + k, 180 - ans, 60], fmt: (v) => `${nf(v)}°`,
    expl: `The angles sum to 180°, so each part is ${M(`180 \\div ${a + b + c} = ${k}`)}°. The ${what} angle is ${M(`${what === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c)} \\times ${k} = ${ans}`)}°.`,
  });
}

function pythag(X) {
  const [p, q, h] = pick(TRIPLES), s = pick([1, 1, 2, 3]);
  const A = p * s, B = q * s, H = h * s;
  const v = pick(['area', 'leg', 'perim']);
  if (v === 'area') {
    return ask(X, {
      topic: T.geo(X), skill: 'Pythagorean theorem', diff: 2,
      q: `A right triangle has a hypotenuse of length ${H} and one leg of length ${A}. What is the area of the triangle?`,
      ans: (A * B) / 2, wrongs: [A * B, (A * H) / 2, A + B + H, (B * H) / 2, B * B],
      expl: `The other leg is ${M(`\\sqrt{${H}^2 - ${A}^2} = \\sqrt{${H * H - A * A}} = ${B}`)}. Area = ${M(`\\frac{1}{2}(${A})(${B}) = ${(A * B) / 2}`)}.`,
    });
  }
  if (v === 'leg') {
    return ask(X, {
      topic: T.geo(X), skill: 'Pythagorean theorem', diff: 1,
      q: `In right triangle ${M('PQR')}, the hypotenuse ${M('PR')} has length ${H} and leg ${M('PQ')} has length ${B}. What is the length of leg ${M('QR')}?`,
      ans: A, wrongs: [H - B, rnd(Math.sqrt(H * H + B * B), 2), A + s, (H + B) / 2, A - s],
      expl: `${M(`QR = \\sqrt{${H}^2 - ${B}^2} = \\sqrt{${H * H} - ${B * B}} = \\sqrt{${A * A}} = ${A}`)}.`,
    });
  }
  return ask(X, {
    topic: T.geo(X), skill: 'Pythagorean theorem', diff: 1,
    q: `The legs of a right triangle have lengths ${A} and ${B}. What is the perimeter of the triangle?`,
    ans: A + B + H, wrongs: [2 * (A + B), A + B + H + s, A * B, A + B, (A * B) / 2],
    expl: `Hypotenuse = ${M(`\\sqrt{${A}^2 + ${B}^2} = ${H}`)}. Perimeter = ${M(`${A} + ${B} + ${H} = ${A + B + H}`)}.`,
  });
}

function circleAC(X) {
  const r = ri(2, 15);
  if (rf() < 0.5) {
    return ask(X, {
      topic: T.geo(X), skill: 'Circles', diff: 2, numeric: false,
      q: `A circle has a circumference of ${M(piStr(2 * r))}. What is the area of the circle?`,
      ans: r * r, wrongs: [4 * r * r, 2 * r * r, 2 * r, r, (2 * r) ** 2 / 2], fmt: (k) => M(piStr(k)),
      expl: `${M(`C = 2\\pi r = ${piStr(2 * r)}`)} gives ${M(`r = ${r}`)}. Area = ${M(`\\pi r^2 = ${piStr(r * r)}`)}.`,
    });
  }
  return ask(X, {
    topic: T.geo(X), skill: 'Circles', diff: 2, numeric: false,
    q: `A circle has an area of ${M(piStr(r * r))}. What is its circumference?`,
    ans: 2 * r, wrongs: [r, r * r, 4 * r, 2 * r * r, r * r / 2], fmt: (k) => M(piStr(k)),
    expl: `${M(`\\pi r^2 = ${piStr(r * r)}`)} gives ${M(`r = ${r}`)}. Circumference = ${M(`2\\pi r = ${piStr(2 * r)}`)}.`,
  });
}

function rectangle(X) {
  const w = ri(2, 20), k = ri(2, 5), l = k * w, P = 2 * (l + w);
  if (rf() < 0.6) {
    return ask(X, {
      topic: T.geo(X), skill: 'Rectangles', diff: 2,
      q: `The length of a rectangle is ${k} times its width. If the perimeter of the rectangle is ${P}, what is its area?`,
      ans: l * w, wrongs: [P * k, (P / 4) ** 2, l * w * 2, l + w, w * w * (k + 1)],
      expl: `Let the width be ${M('w')}. Then ${M(`2(${k}w + w) = ${P}`)}, so ${M(`w = ${w}`)} and the length is ${l}. Area = ${M(`${l} \\times ${w} = ${l * w}`)}.`,
    });
  }
  const [p, q, h] = pick(TRIPLES.slice(0, 4)), s = ri(1, 4);
  return ask(X, {
    topic: T.geo(X), skill: 'Rectangles', diff: 2,
    q: `A rectangle has a diagonal of length ${h * s} and a width of ${p * s}. What is the perimeter of the rectangle?`,
    ans: 2 * (p + q) * s, wrongs: [p * q * s * s, (p + q) * s, 2 * (h + p) * s, 4 * h * s, (p + q + h) * s],
    expl: `The length is ${M(`\\sqrt{${h * s}^2 - ${p * s}^2} = ${q * s}`)}. Perimeter = ${M(`2(${p * s} + ${q * s}) = ${2 * (p + q) * s}`)}.`,
  });
}

function polygonAngles(X) {
  const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
  const v = pick(['each', 'find_n', 'sum']);
  const each = (180 * (n - 2)) / n;
  if (v === 'each') return ask(X, {
    topic: T.geo(X), skill: 'Polygons', diff: 1, post: '°',
    q: `What is the measure, in degrees, of each interior angle of a regular polygon with ${n} sides?`,
    ans: each, wrongs: [360 / n, 180 - each + 360 / n, (180 * n) / (n + 2), each + 360 / n, 180 * (n - 2)], fmt: (x) => `${nf(x)}°`,
    expl: `Sum of interior angles = ${M(`180(n - 2) = 180(${n - 2}) = ${180 * (n - 2)}`)}°. Each angle = ${M(`${180 * (n - 2)} \\div ${n} = ${each}`)}°.`,
  });
  if (v === 'find_n') return ask(X, {
    topic: T.geo(X), skill: 'Polygons', diff: 2,
    q: `Each interior angle of a regular polygon measures ${nf(each)}°. How many sides does the polygon have?`,
    ans: n, wrongs: [n + 2, n - 2, 360 / n, n * 2, n + 1].filter((x) => x > 2),
    expl: `Each exterior angle is ${M(`180 - ${nf(each)} = ${nf(180 - each)}`)}°. Exterior angles sum to 360°, so ${M(`n = 360 \\div ${nf(180 - each)} = ${n}`)}.`,
  });
  return ask(X, {
    topic: T.geo(X), skill: 'Polygons', diff: 1, post: '°',
    q: `What is the sum, in degrees, of the interior angles of a polygon with ${n} sides?`,
    ans: 180 * (n - 2), wrongs: [180 * n, 360 * (n - 2), 180 * (n - 1), 360, 90 * n], fmt: (x) => `${nf(x)}°`,
    expl: `${M(`180(n - 2) = 180(${n - 2}) = ${nm(180 * (n - 2))}`)}°.`,
  });
}

const BOX_DIAG = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [3, 4, 12, 13], [6, 6, 7, 11], [4, 8, 8, 12], [2, 10, 11, 15], [6, 10, 15, 19]];
function box(X) {
  const v = pick(['sa', 'vol', 'diag']);
  if (v === 'diag') {
    const [a, b, c, d] = pick(BOX_DIAG), s = pick([1, 1, 2]);
    return ask(X, {
      topic: T.geo(X), skill: 'Solids', diff: 3,
      q: `A rectangular box has dimensions ${a * s} by ${b * s} by ${c * s}. What is the length of the longest line segment that can be drawn between two vertices of the box?`,
      ans: d * s, wrongs: [(a + b + c) * s, rnd(Math.sqrt((b * b + c * c) * s * s), 2), (d + 1) * s, (b + c) * s],
      expl: `The space diagonal is ${M(`\\sqrt{${a * s}^2 + ${b * s}^2 + ${c * s}^2} = \\sqrt{${(d * s) ** 2}} = ${d * s}`)}.`,
    });
  }
  const l = ri(2, 15), w = ri(2, 12), h = ri(2, 10);
  if (v === 'sa') return ask(X, {
    topic: T.geo(X), skill: 'Solids', diff: 2,
    q: `What is the total surface area of a rectangular box with length ${l}, width ${w}, and height ${h}?`,
    ans: 2 * (l * w + l * h + w * h), wrongs: [l * w * h, l * w + l * h + w * h, 6 * l * w, 2 * l * w * h, 4 * (l + w + h)],
    expl: `${M(`SA = 2(lw + lh + wh) = 2(${l * w} + ${l * h} + ${w * h}) = ${2 * (l * w + l * h + w * h)}`)}.`,
  });
  const f = pick([2, 3]);
  return ask(X, {
    topic: T.geo(X), skill: 'Solids', diff: 2,
    q: `A rectangular tank has length ${l}, width ${w}, and height ${h}. If each dimension is multiplied by ${f}, what is the volume of the new tank?`,
    ans: l * w * h * f ** 3, wrongs: [l * w * h * f, l * w * h * f * f, l * w * h + f ** 3, (l + w + h) * f, l * w * h * 3 * f],
    expl: `Original volume = ${M(`${l} \\times ${w} \\times ${h} = ${l * w * h}`)}. Scaling each dimension by ${f} scales volume by ${M(`${f}^3 = ${f ** 3}`)}: ${M(`${l * w * h} \\times ${f ** 3} = ${nm(l * w * h * f ** 3)}`)}.`,
  });
}

function cylinder(X) {
  const r = ri(1, 10), h = ri(2, 15);
  if (rf() < 0.6) return ask(X, {
    topic: T.geo(X), skill: 'Solids', diff: 1, numeric: false,
    q: `A right circular cylinder has radius ${r} and height ${h}. What is its volume?`,
    ans: r * r * h, wrongs: [2 * r * h, r * h * h, (r * r * h) / 3, 2 * r * r * h, (2 * r) ** 2 * h], fmt: (k) => M(piStr(k)),
    expl: `${M(`V = \\pi r^2 h = \\pi(${r})^2(${h}) = ${piStr(r * r * h)}`)}.`,
  });
  const a = ri(2, 5), b = ri(2, 6);
  if (a === b) return cylinder(X);
  return ask(X, {
    topic: T.geo(X), skill: 'Solids', diff: 3, numAns: rnd((a * a) / b, 6), ansText: frt(a * a, b),
    q: `Cylinder A has radius ${M('r')} and height ${M('h')}. Cylinder B has radius ${M(`${a}r`)} and height ${M(`\\frac{h}{${b}}`)}. The volume of cylinder B is how many times the volume of cylinder A?`,
    ans: M(fr(a * a, b)), wrongs: [M(fr(a, b)), M(String(a * a)), M(fr(a * a * a, b)), M(fr(a * a, b * b)), M(fr(2 * a, b))],
    expl: `${M(`V_B = \\pi(${a}r)^2 \\cdot \\frac{h}{${b}} = \\frac{${a * a}}{${b}}\\pi r^2 h`)}, which is ${M(fr(a * a, b))} times ${M('V_A = \\pi r^2 h')}. The radius is squared, so doubling it quadruples the volume.`,
  });
}

function similar(X) {
  let p, q; do { p = ri(1, 6); q = ri(2, 9); } while (p >= q || gcd(p, q) !== 1);
  const k = ri(1, 6), A = p * p * k, B = q * q * k;
  return ask(X, {
    topic: T.geo(X), skill: 'Similar figures', diff: 2,
    q: `Two similar triangles have corresponding sides in the ratio ${p} : ${q}. If the area of the smaller triangle is ${A}, what is the area of the larger triangle?`,
    ans: B, wrongs: [rnd((A * q) / p, 2), A * q, rnd((A * q * q * q) / (p * p * p), 2), A + q - p, B / 2],
    expl: `Areas scale by the square of the side ratio: ${M(`\\left(\\frac{${q}}{${p}}\\right)^2 = \\frac{${q * q}}{${p * p}}`)}. Larger area = ${M(`${A} \\times \\frac{${q * q}}{${p * p}} = ${B}`)}.`,
  });
}

function arcSector(X) {
  const r = ri(2, 18), th = pick([20, 30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 240, 270]);
  if (rf() < 0.5) {
    const n = th * 2 * r, d = 360;
    return ask(X, {
      topic: T.geo(X), skill: 'Arcs and sectors', diff: 2, numeric: false,
      q: `In a circle with radius ${r}, a central angle measures ${th}°. What is the length of the arc intercepted by this angle?`,
      ans: M(piStr(n, d)), wrongs: [M(piStr(th * r * r, d)), M(piStr(th * r, d)), M(piStr(2 * r)), M(piStr(n * 2, d)), M(piStr(th, 180 * r))],
      expl: `Arc length = ${M(`\\frac{${th}}{360} \\times 2\\pi(${r}) = ${piStr(n, d)}`)}.`,
    });
  }
  const n = th * r * r, d = 360;
  return ask(X, {
    topic: T.geo(X), skill: 'Arcs and sectors', diff: 2, numeric: false,
    q: `A sector of a circle with radius ${r} has a central angle of ${th}°. What is the area of the sector?`,
    ans: M(piStr(n, d)), wrongs: [M(piStr(th * 2 * r, d)), M(piStr(r * r)), M(piStr(n * 2, d)), M(piStr(th * r, d)), M(piStr(n, 180))],
    expl: `Sector area = ${M(`\\frac{${th}}{360} \\times \\pi(${r})^2 = ${piStr(n, d)}`)}.`,
  });
}

function specialTri(X) {
  const k = ri(2, 15);
  const v = pick(['45hyp', '45leg', '30long', '30hyp', 'equi']);
  if (v === '45hyp') return ask(X, {
    topic: T.geo(X), skill: 'Special right triangles', diff: 2, numeric: false,
    q: `An isosceles right triangle has legs of length ${k}. What is the length of its hypotenuse?`,
    ans: M(radStr(k, 2)), wrongs: [M(String(2 * k)), M(radStr(k, 3)), M(radStr(2 * k, 2)), M(fr(k, 2) === String(k / 2) ? String(k / 2) : fr(k, 2)), M(String(k * k))],
    expl: `In a 45°-45°-90° triangle, hypotenuse = leg × ${M('\\sqrt{2}')} = ${M(radStr(k, 2))}.`,
  });
  if (v === '45leg') return ask(X, {
    topic: T.geo(X), skill: 'Special right triangles', diff: 2,
    q: `The hypotenuse of an isosceles right triangle has length ${M(radStr(k, 2))}. What is the area of the triangle?`,
    ans: (k * k) / 2, wrongs: [k * k, 2 * k * k, k, (k * k) / 4, rnd((k * k * 2) / 2 + 1, 1)],
    expl: `Each leg is ${M(`${radStr(k, 2)} \\div \\sqrt{2} = ${k}`)}. Area = ${M(`\\frac{1}{2}(${k})(${k}) = ${nm((k * k) / 2)}`)}.`,
  });
  if (v === '30long') return ask(X, {
    topic: T.geo(X), skill: 'Special right triangles', diff: 2, numeric: false,
    q: `In a 30°-60°-90° triangle, the side opposite the 30° angle has length ${k}. What is the length of the side opposite the 60° angle?`,
    ans: M(radStr(k, 3)), wrongs: [M(String(2 * k)), M(radStr(k, 2)), M(radStr(2 * k, 3)), M(String(k)), M(radStr(3 * k, 1))],
    expl: `Sides of a 30°-60°-90° triangle are in the ratio ${M('1 : \\sqrt{3} : 2')}. The side opposite 60° is ${M(radStr(k, 3))}.`,
  });
  if (v === '30hyp') return ask(X, {
    topic: T.geo(X), skill: 'Special right triangles', diff: 2,
    q: `In a 30°-60°-90° triangle, the hypotenuse has length ${2 * k}. What is the length of the shortest side?`,
    ans: k, wrongs: [2 * k * 2, k + 2, 4 * k, k / 2, 2 * k - 1],
    expl: `The shortest side (opposite 30°) is half the hypotenuse: ${M(`${2 * k} \\div 2 = ${k}`)}.`,
  });
  const s = 2 * ri(1, 10), c = (s * s) / 4;
  return ask(X, {
    topic: T.geo(X), skill: 'Special right triangles', diff: 3, numeric: false,
    q: `What is the area of an equilateral triangle with side length ${s}?`,
    ans: M(radStr(c, 3)), wrongs: [M(radStr(c * 2, 3)), M(String(c * 2)), M(radStr(c, 2)), M(String((s * s) / 2)), M(radStr(s, 3))],
    expl: `Area = ${M(`\\frac{\\sqrt{3}}{4}s^2 = \\frac{\\sqrt{3}}{4}(${s * s}) = ${radStr(c, 3)}`)}. (The height is ${M(radStr(s / 2, 3))}.)`,
  });
}

// ---------------- DATA ----------------
function centerSpread(X) {
  const n = ri(6, 11), arr = Array.from({ length: n }, () => ri(1, 60)), s = arr.slice().sort((a, b) => a - b);
  const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const mean = rnd(arr.reduce((a, b) => a + b, 0) / n, 2), range = s[n - 1] - s[0];
  const v = pick(['median', 'range', 'mean']);
  const ans = { median: med, range, mean }[v];
  const list = arr.join(', ');
  if (v === 'mean' && !Number.isInteger(mean * 10)) return centerSpread(X);
  return ask(X, {
    topic: T.data(X), skill: v === 'range' ? 'Range' : v === 'mean' ? 'Mean' : 'Median', diff: 1,
    q: `What is the ${v} of the following list of numbers?<br>${M(list)}`,
    ans, wrongs: [med, range, mean, arr[Math.floor(n / 2)], s[n - 1], n % 2 ? s[(n + 1) / 2] : s[n / 2]].filter((x) => x !== ans),
    expl: v === 'median' ? `In order: ${s.join(', ')}. With ${n} values, the median is ${n % 2 ? `the middle value, ${med}` : `the average of ${s[n / 2 - 1]} and ${s[n / 2]}, which is ${med}`}.` : v === 'range' ? `Range = greatest − least = ${s[n - 1]} − ${s[0]} = ${range}.` : `Mean = sum ÷ count = ${arr.reduce((a, b) => a + b, 0)} ÷ ${n} = ${mean}.`,
  });
}

function probability(X) {
  const r = ri(2, 9), b = ri(2, 9), g = ri(0, 6), N = r + b + g;
  const colors = g ? `${r} red, ${b} blue, and ${g} green` : `${r} red and ${b} blue`;
  const v = pick(['both', 'oneeach', 'notred']);
  let num, den, desc, expl;
  if (v === 'both') { num = r * (r - 1); den = N * (N - 1); desc = 'both marbles are red'; expl = `${M(`P = \\frac{${r}}{${N}} \\times \\frac{${r - 1}}{${N - 1}} = ${fr(num, den)}`)}. After the first red marble is removed, only ${r - 1} red marbles remain out of ${N - 1}.`; }
  else if (v === 'oneeach') { num = 2 * r * b; den = N * (N - 1); desc = 'one marble is red and the other is blue'; expl = `Red then blue or blue then red: ${M(`2 \\times \\frac{${r}}{${N}} \\times \\frac{${b}}{${N - 1}} = ${fr(num, den)}`)}.`; }
  else { num = (N - r) * (N - r - 1); den = N * (N - 1); desc = 'neither marble is red'; expl = `${M(`\\frac{${N - r}}{${N}} \\times \\frac{${N - r - 1}}{${N - 1}} = ${fr(num, den)}`)}.`; }
  return ask(X, {
    topic: T.data(X), skill: 'Probability', diff: 2, numAns: rnd(num / den, 6), ansText: frt(num, den),
    q: `A bag contains ${colors} marbles. Two marbles are drawn at random without replacement. What is the probability that ${desc}?`,
    ans: M(fr(num, den)),
    wrongs: [M(fr(v === 'both' ? r * r : v === 'oneeach' ? r * b : (N - r) ** 2, N * N)), M(fr(v === 'oneeach' ? r * b : num, den + N)), M(fr(v === 'both' ? r : v === 'oneeach' ? r + b : N - r, N)), M(fr(num, den * 2)), M(fr(num + N, den)), M(fr(r * b, N * (N - 1)))],
    expl,
  });
}

function combinatorics(X) {
  const v = pick(['comb', 'perm', 'withperson', 'arr']);
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  const P = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
  const n = ri(5, 12), k = ri(2, Math.min(4, n - 2));
  if (v === 'comb') return ask(X, {
    topic: T.data(X), skill: 'Combinations', diff: 2,
    q: `A committee of ${k} people is to be chosen from a group of ${n} people. How many different committees are possible?`,
    ans: C(n, k), wrongs: [P(n, k), n * k, C(n, k - 1), C(n, k) * 2, n ** k],
    expl: `Order doesn't matter, so use combinations: ${M(`\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!} = ${C(n, k)}`)}.`,
  });
  if (v === 'perm') {
    const kk = 3;
    return ask(X, {
      topic: T.data(X), skill: 'Permutations', diff: 2,
      q: `A club with ${n} members will elect a president, a vice president, and a treasurer. If no member can hold more than one office, in how many ways can the three offices be filled?`,
      ans: P(n, kk), wrongs: [C(n, kk), n * 3, n ** 3, P(n, kk) / 2, C(n, kk) * 3],
      expl: `Order matters (the offices are different): ${M(`${n} \\times ${n - 1} \\times ${n - 2} = ${P(n, kk)}`)}.`,
    });
  }
  if (v === 'withperson') return ask(X, {
    topic: T.data(X), skill: 'Combinations', diff: 3,
    q: `A team of ${k} students will be selected from ${n} students, one of whom is Priya. How many different teams include Priya?`,
    ans: C(n - 1, k - 1), wrongs: [C(n, k), C(n - 1, k), C(n, k) - C(n - 1, k - 1), P(n - 1, k - 1), C(n, k - 1)],
    expl: `Put Priya on the team, then choose the other ${k - 1} from the remaining ${n - 1}: ${M(`\\binom{${n - 1}}{${k - 1}} = ${C(n - 1, k - 1)}`)}.`,
  });
  const m = ri(4, 7), fact = (x) => (x <= 1 ? 1 : x * fact(x - 1));
  return ask(X, {
    topic: T.data(X), skill: 'Permutations', diff: 3,
    q: `In how many different ways can ${m} people be seated in a row of ${m} chairs if two particular people must sit next to each other?`,
    ans: 2 * fact(m - 1), wrongs: [fact(m), fact(m - 1), fact(m) - 2 * fact(m - 1), fact(m - 2) * 2, fact(m) / 2],
    expl: `Glue the two people into one block: ${m - 1} units arrange in ${M(`${m - 1}! = ${fact(m - 1)}`)} ways, and the two can swap within the block (×2): ${M(`2 \\times ${fact(m - 1)} = ${2 * fact(m - 1)}`)}.`,
  });
}

function venn(X) {
  const N = ri(40, 200), A = ri(10, Math.floor(N * 0.7)), B = ri(10, Math.floor(N * 0.7));
  const lo = Math.max(1, A + B - N), hi = Math.min(A, B) - 1;
  if (lo > hi) return venn(X);
  const both = ri(lo, hi), neither = N - (A + B - both);
  const [sa, sb, who] = pick([['chess', 'debate', 'students'], ['soccer', 'basketball', 'students'], ['coffee', 'tea', 'employees'], ['French', 'Spanish', 'students'], ['a car', 'a bicycle', 'residents']]);
  const v = pick(['neither', 'onlyA']);
  const ans = v === 'neither' ? neither : A - both;
  return ask(X, {
    topic: T.data(X), skill: 'Overlapping sets', diff: 2,
    q: `Of ${N} ${who} surveyed, ${A} like ${sa}, ${B} like ${sb}, and ${both} like both. How many of the ${who} like ${v === 'neither' ? `neither ${sa} nor ${sb}` : `${sa} but not ${sb}`}?`,
    ans, wrongs: v === 'neither' ? [N - A - B, N - A - B + 2 * both, both, N - both, Math.abs(A - B)] : [A, A - both + B - both, B - both, A + both, N - B],
    expl: v === 'neither' ? `Those who like at least one: ${M(`${A} + ${B} - ${both} = ${A + B - both}`)}. Neither: ${M(`${N} - ${A + B - both} = ${neither}`)}.` : `${sa} only = ${M(`${A} - ${both} = ${A - both}`)}.`,
  });
}

function freqTable(X) {
  const vals = [0, 1, 2, 3, 4], f = vals.map(() => ri(1, 12)), n = f.reduce((a, b) => a + b, 0);
  const sum = vals.reduce((s, v, i) => s + v * f[i], 0);
  const table = `<table class="dt"><tr><th>Number of pets</th>${vals.map((v) => `<td>${v}</td>`).join('')}</tr><tr><th>Number of students</th>${f.map((x) => `<td>${x}</td>`).join('')}</tr></table>`;
  if (rf() < 0.5) {
    const ans = rnd(sum / n, 2), r = rnd(sum / n, 1);
    return ask(X, {
      topic: T.data(X), skill: 'Mean', diff: 2, round: 1,
      q: `The table shows the number of pets owned by each student in a class.${table}To the nearest tenth, what is the mean number of pets per student?`,
      ans: r, wrongs: [2, rnd(n / 5, 1), rnd(sum / 5, 1), rnd(r + 0.4, 1), rnd(r - 0.3, 1)],
      expl: `Total pets = ${vals.map((v, i) => `${v}(${f[i]})`).join(' + ')} = ${sum}. Students = ${n}. Mean = ${M(`${sum} \\div ${n} \\approx ${r}`)}.`,
    });
  }
  const list = []; vals.forEach((v, i) => { for (let k = 0; k < f[i]; k++) list.push(v); });
  const med = n % 2 ? list[(n - 1) / 2] : (list[n / 2 - 1] + list[n / 2]) / 2;
  return ask(X, {
    topic: T.data(X), skill: 'Median', diff: 2,
    q: `The table shows the number of pets owned by each student in a class.${table}What is the median number of pets per student?`,
    ans: med, wrongs: [2, f.indexOf(Math.max(...f)), rnd(sum / n, 1), med + 1, med - 0.5].filter((x) => x >= 0),
    expl: `There are ${n} students. The median is ${n % 2 ? `the ${ord((n + 1) / 2)} value` : `the average of the ${ord(n / 2)} and ${ord(n / 2 + 1)} values`} in order, which is ${med}.`,
  });
}

function tableData(X) {
  const regions = ['North', 'South', 'East', 'West', 'Central'].slice(0, X.n);
  let a, b, pct, best;
  for (let tries = 0; tries < 50; tries++) {
    a = regions.map(() => ri(12, 90) * 10); b = a.map((x) => x + ri(-5, 40) * 10);
    pct = a.map((x, i) => ((b[i] - x) / x) * 100);
    const sorted = pct.slice().sort((x, y) => y - x);
    if (sorted[0] - sorted[1] > 2) { best = pct.indexOf(sorted[0]); break; }
  }
  const absBest = b.map((x, i) => x - a[i]);
  const table = `<table class="dt"><tr><th>Region</th><th>2024 sales (units)</th><th>2025 sales (units)</th></tr>${regions.map((r, i) => `<tr><td>${r}</td><td>${nf(a[i])}</td><td>${nf(b[i])}</td></tr>`).join('')}</table>`;
  if (rf() < 0.5) {
    return ask(X, {
      topic: T.data(X), skill: 'Data interpretation', diff: 2, numeric: false,
      q: `The table shows a company's sales in five regions in 2024 and 2025.${table}Which region had the greatest percent increase in sales from 2024 to 2025?`.replace('five', regions.length === 5 ? 'five' : 'four'),
      ans: regions[best], wrongs: regions.filter((_, i) => i !== best), fmt: (s) => s, order: regions,
      expl: `Percent increase = (2025 − 2024) ÷ 2024. ${regions.map((r, i) => `${r}: ${rnd(pct[i], 1)}%`).join('; ')}. The greatest is ${regions[best]}. ${absBest.indexOf(Math.max(...absBest)) !== best ? `Note that ${regions[absBest.indexOf(Math.max(...absBest))]} had the largest increase in units, but not the largest percent increase.` : ''}`,
    });
  }
  const i = ri(0, regions.length - 1), ans = rnd(pct[i], 1);
  return ask(X, {
    topic: T.data(X), skill: 'Data interpretation', diff: 2, post: '%', round: 1,
    q: `The table shows a company's sales by region in 2024 and 2025.${table}To the nearest tenth of a percent, by what percent did sales in the ${regions[i]} region change from 2024 to 2025?`,
    ans, wrongs: [rnd(((b[i] - a[i]) / b[i]) * 100, 1), rnd((b[i] - a[i]) / 10, 1), rnd((b[i] / a[i]) * 100, 1), rnd(ans + 5, 1)], fmt: pctF,
    expl: `${M(`\\frac{${nm(b[i])} - ${nm(a[i])}}{${nm(a[i])}} \\times 100 \\approx ${ans}\\%`)}.`,
  });
}

module.exports = {
  ask, T, tp, pctF, usd, intOnly, TRIPLES, ord, divs,
  templates: {
    percentChange, successivePercent, percentOf, ratioShare, ratioDifference, averageRemove, nextScore, weightedAvg,
    compoundInterest, discountTax, mixture, avgSpeed, work, remainders, inclusionExclusion, divisors, exponentRules,
    unitsDigit, consecutive, fractionArith, sequences, linEq, systemEq, quadRoots, funcEval, absIneq, expEq, ages,
    variation, coordinate, recipSquares, triangleAngles, pythag, circleAC, rectangle, polygonAngles, box, cylinder,
    similar, arcSector, specialTri, centerSpread, probability, combinatorics, venn, freqTable, tableData,
  },
};
