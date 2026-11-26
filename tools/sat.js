// SAT-only templates (Digital SAT Math style).
const L = require('./lib');
const { R, rf, ri, pick, nz, shuffle, gcd, rnd, M, nf, nm, money, fr, frt, piStr, radStr, poly, lin, sgn } = L;
const S = require('./shared');
const { ask, TRIPLES } = S;
const X4 = { exam: 'sat', n: 4 };
const ALG = 'Algebra', ADV = 'Advanced Math', PSDA = 'Problem Solving & Data Analysis', GEO = 'Geometry & Trigonometry';
const txt = (s) => s;

function costModel(X) {
  const a = ri(2, 30) * 5, b = ri(3, 25);
  const [what, unit, v, plural] = pick([['A gym charges a one-time membership fee', 'class', 'x', 'classes'], ['A plumber charges a flat service fee', 'hour of work', 'h', 'hours'], ['A car rental company charges a fixed fee', 'mile driven', 'm', 'miles'], ['A printing shop charges a setup fee', 'poster printed', 'p', 'posters'], ['An online course charges a registration fee', 'lesson', 'n', 'lessons']]);
  const ans = M(`C = ${b}${v} + ${a}`);
  return ask(X, {
    topic: ALG, skill: 'Linear models', diff: 1, numeric: false,
    q: `${what} of $${a} plus $${b} per ${unit}. Which equation gives the total cost ${M('C')}, in dollars, for ${M(v)} ${plural}?`,
    ans, wrongs: [M(`C = ${a}${v} + ${b}`), M(`C = ${a + b}${v}`), M(`C = ${b}${v} - ${a}`), M(`C = ${b}(${v} + ${a})`)], fmt: txt,
    expl: `The fixed fee ($${a}) is paid once, so it is the constant term. The $${b} charge is paid for each ${unit}, so it multiplies ${M(v)}: ${ans}.`,
  });
}

const CONTEXTS = [
  { eq: (m, b) => `y = ${m}x + ${b}`, setup: 'The equation models the height ' + M('y') + ', in centimeters, of a plant ' + M('x') + ' weeks after it was planted.', rate: (v) => `The plant's height increases by ${v} centimeters each week.`, init: (v) => `The plant's height was ${v} centimeters when it was planted.` },
  { eq: (m, b) => `y = ${m}x + ${b}`, setup: 'The equation models the balance ' + M('y') + ', in dollars, in Maria\'s savings account ' + M('x') + ' months after she opened it.', rate: (v) => `Maria deposits $${v} into the account each month.`, init: (v) => `Maria deposited $${v} when she opened the account.` },
  { eq: (m, b) => `y = ${b} - ${m}x`, setup: 'The equation models the amount of water ' + M('y') + ', in gallons, in a tank ' + M('x') + ' minutes after it began draining.', rate: (v) => `The tank loses ${v} gallons of water each minute.`, init: (v) => `The tank held ${v} gallons when it began draining.` },
  { eq: (m, b) => `y = ${m}x + ${b}`, setup: 'The equation models the fare ' + M('y') + ', in dollars, for a taxi ride of ' + M('x') + ' miles.', rate: (v) => `The fare increases by $${v} for each mile driven.`, init: (v) => `The fare includes a fixed charge of $${v} before any miles are driven.` },
  { eq: (m, b) => `y = ${b} - ${m}x`, setup: 'The equation models the charge ' + M('y') + ', as a percent, remaining on a phone battery ' + M('x') + ' hours after it was unplugged.', rate: (v) => `The battery charge decreases by ${v} percentage points each hour.`, init: (v) => `The battery was ${v}% charged when it was unplugged.` },
  { eq: (m, b) => `y = ${m}x + ${b}`, setup: 'The equation models the distance ' + M('y') + ', in kilometers, of a train from a city ' + M('x') + ' hours after it passed a station.', rate: (v) => `The train travels ${v} kilometers each hour.`, init: (v) => `The station is ${v} kilometers from the city.` },
  { eq: (m, b) => `y = ${b} - ${m}x`, setup: 'The equation models the height ' + M('y') + ', in centimeters, of a candle ' + M('x') + ' hours after it was lit.', rate: (v) => `The candle burns down ${v} centimeters each hour.`, init: (v) => `The candle was ${v} centimeters tall when it was lit.` },
  { eq: (m, b) => `y = ${m}x + ${b}`, setup: 'The equation models the number of members ' + M('y') + ' of a club ' + M('x') + ' months after it was founded.', rate: (v) => `The club gains ${v} members each month.`, init: (v) => `The club had ${v} members when it was founded.` },
];
function interpretLinear(X) {
  const c = pick(CONTEXTS), m = ri(2, 12), b = ri(15, 99);
  const askSlope = rf() < 0.55, v = askSlope ? m : b;
  const ans = askSlope ? c.rate(m) : c.init(b);
  return ask(X, {
    topic: ALG, skill: 'Interpreting linear models', diff: 1, numeric: false,
    q: `${M(c.eq(m, b))}<br>${c.setup} What is the best interpretation of ${M(String(v))} in this context?`,
    ans, wrongs: askSlope ? [c.init(m), c.rate(b), c.init(b)] : [c.rate(b), c.init(m), c.rate(m)], fmt: txt,
    expl: askSlope ? `${m} is the coefficient of ${M('x')} (the slope): the change in ${M('y')} for each 1-unit increase in ${M('x')}.` : `${b} is the constant term: the value of ${M('y')} when ${M('x = 0')}, i.e. at the start.`,
  });
}

function tickets(X) {
  const a = ri(8, 20), c = ri(3, a - 2), A = ri(20, 200), Ch = ri(20, 200), n = A + Ch, T = a * A + c * Ch;
  const askA = rf() < 0.5;
  return ask(X, {
    topic: ALG, skill: 'Systems of equations', diff: 2,
    q: `A theater sold ${n} tickets for a show. Adult tickets cost $${a} each and child tickets cost $${c} each. If the total revenue was $${nf(T)}, how many ${askA ? 'adult' : 'child'} tickets were sold?`,
    ans: askA ? A : Ch, wrongs: [askA ? Ch : A, Math.round(n / 2), Math.round(T / (a + c)), Math.round(T / a)],
    expl: `Let ${M('a')} = adult and ${M('c')} = child tickets. ${M(`a + c = ${n}`)} and ${M(`${a}a + ${c}c = ${nm(T)}`)}. Substitute ${M(`c = ${n} - a`)}: ${M(`${a - c}a = ${nm(T - c * n)}`)}, so ${M(`a = ${A}`)} and ${M(`c = ${Ch}`)}.`,
  });
}

function lineEquation(X) {
  const m = nz(-6, 6), b = ri(-10, 10), x1 = ri(-6, 6); let x2; do { x2 = ri(-6, 6); } while (x2 === x1);
  const y1 = m * x1 + b, y2 = m * x2 + b, f = (mm, bb) => M(`y = ${poly([[mm, 'x'], [bb, '']])}`);
  return ask(X, {
    topic: ALG, skill: 'Linear equations in two variables', diff: 2, numeric: false,
    q: `A line in the ${M('xy')}-plane passes through the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)}. Which equation defines the line?`,
    ans: f(m, b), wrongs: [f(-m, b), f(m, -b), f(b === 0 ? m + 1 : b, m), f(m, y1), f(m, b + m)], fmt: txt,
    expl: `Slope ${M(`= \\frac{${y2} - (${y1})}{${x2} - (${x1})} = ${m}`)}. Using ${M(`(${x1}, ${y1})`)}: ${M(`${y1} = ${m}(${x1}) + b`)}, so ${M(`b = ${b}`)}.`,
  });
}

function perpParallel(X) {
  let a, b; do { a = nz(-9, 9); b = nz(-9, 9); } while (gcd(a, b) !== 1 || Math.abs(a) === Math.abs(b));
  const c = ri(-20, 20), perp = rf() < 0.5;
  const slope = [-a, b], ans = perp ? [b, a] : slope;
  return ask(X, {
    topic: ALG, skill: 'Linear equations in two variables', diff: 2, numAns: rnd(ans[0] / ans[1], 6), ansText: frt(ans[0], ans[1]),
    q: `Line ${M('k')} is defined by ${M(`${poly([[a, 'x'], [b, 'y']])} = ${c}`)}. Line ${M('j')} is ${perp ? 'perpendicular' : 'parallel'} to line ${M('k')}. What is the slope of line ${M('j')}?`,
    ans: M(fr(ans[0], ans[1])), wrongs: [M(fr(perp ? -a : b, b === 0 ? 1 : perp ? b : a)), M(fr(-ans[0], ans[1])), M(fr(ans[1], ans[0])), M(fr(a, b)), M(fr(-b, a)), M(fr(c, b))],
    expl: `Solve for ${M('y')}: ${M(`y = ${fr(-a, b)}x${c === 0 ? '' : (c / b < 0 ? ' - ' : ' + ') + fr(Math.abs(c), Math.abs(b))}`)}, so line ${M('k')} has slope ${M(fr(-a, b))}. ${perp ? `A perpendicular slope is the negative reciprocal: ${M(fr(b, a))}.` : `Parallel lines have equal slopes: ${M(fr(-a, b))}.`}`,
  });
}

function linearTable(X) {
  const m = nz(-7, 9), b = ri(-15, 20), xs = [ri(-3, 0)]; xs.push(xs[0] + ri(1, 3)); xs.push(xs[1] + ri(1, 3));
  const k = ri(5, 20);
  const table = `<table class="dt"><tr><th>${M('x')}</th>${xs.map((x) => `<td>${x}</td>`).join('')}</tr><tr><th>${M('f(x)')}</th>${xs.map((x) => `<td>${m * x + b}</td>`).join('')}</tr></table>`;
  return ask(X, {
    topic: ALG, skill: 'Linear functions', diff: 2,
    q: `The table shows three values of ${M('x')} and their corresponding values of ${M('f(x)')}, where ${M('f')} is a linear function.${table}What is the value of ${M(`f(${k})`)}?`,
    ans: m * k + b, wrongs: [m * k, m * k - b, (m + 1) * k + b, b * k + m, m * (k - 1) + b],
    expl: `Slope ${M(`= \\frac{${m * xs[1] + b} - (${m * xs[0] + b})}{${xs[1]} - (${xs[0]})} = ${m}`)}. Then ${M(`f(x) = ${lin(m, b)}`)} (check with any row), so ${M(`f(${k}) = ${m * k + b}`)}.`,
  });
}

function vertex(X) {
  const a = pick([1, 1, 2, 3, -1, -2]), h = ri(-8, 8), k = ri(-15, 15);
  const B = -2 * a * h, C = a * h * h + k;
  const f = poly([[a, 'x^2'], [B, 'x'], [C, '']]);
  if (rf() < 0.5) return ask(X, {
    topic: ADV, skill: 'Quadratic functions', diff: 2,
    q: `The function ${M('f')} is defined by ${M(`f(x) = ${f}`)}. What is the ${a > 0 ? 'minimum' : 'maximum'} value of ${M('f(x)')}?`,
    ans: k, wrongs: [h, C, -k, k + a, -h],
    expl: `The vertex is at ${M(`x = -\\frac{b}{2a} = -\\frac{${B}}{2(${a})} = ${h}`)}. Then ${M(`f(${h}) = ${k}`)}. Since ${M(`a ${a > 0 ? '> 0' : '< 0'}`)}, the parabola opens ${a > 0 ? 'upward, so this is the minimum' : 'downward, so this is the maximum'}.`,
  });
  return ask(X, {
    topic: ADV, skill: 'Quadratic functions', diff: 2,
    q: `The graph of ${M(`y = ${f}`)} is a parabola in the ${M('xy')}-plane. What is the ${M('x')}-coordinate of its vertex?`,
    ans: h, wrongs: [-h, k, B, h * 2, C],
    expl: `${M(`x = -\\frac{b}{2a} = -\\frac{${B}}{2(${a})} = ${h}`)}. Equivalently, ${M(`y = ${a === 1 ? '' : a === -1 ? '-' : a}(x ${sgn(-h)})^2 ${sgn(k)}`)}.`,
  });
}

function discriminant(X) {
  if (rf() < 0.5) {
    const a = pick([1, 1, 2, 4]), r = nz(-9, 9), b = 2 * a * r, c = a * r * r;
    return ask(X, {
      topic: ADV, skill: 'Quadratic equations', diff: 3,
      q: `In the equation ${M(`${poly([[a, 'x^2'], [b, 'x']])} + c = 0`)}, ${M('c')} is a constant. If the equation has exactly one real solution, what is the value of ${M('c')}?`,
      ans: c, wrongs: [-c, b * b, c * 2, b / 2, a * r],
      expl: `Exactly one real solution means the discriminant is zero: ${M(`${b}^2 - 4(${a})c = 0`)}, so ${M(`c = \\frac{${b * b}}{${4 * a}} = ${c}`)}.`,
    });
  }
  const a = nz(-4, 5), b = ri(-10, 10), c = ri(-12, 12), D = b * b - 4 * a * c;
  const ansT = D > 0 ? 'Exactly two' : D === 0 ? 'Exactly one' : 'Zero';
  const opts = ['Zero', 'Exactly one', 'Exactly two', 'Infinitely many'];
  return ask(X, {
    topic: ADV, skill: 'Quadratic equations', diff: 2, numeric: false,
    q: `How many distinct real solutions does the equation ${M(`${poly([[a, 'x^2'], [b, 'x'], [c, '']])} = 0`)} have?`,
    ans: ansT, wrongs: opts.filter((o) => o !== ansT), fmt: txt, order: opts,
    expl: `Discriminant ${M(`b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${D}`)}. ${D > 0 ? 'Positive → two real solutions.' : D === 0 ? 'Zero → one real solution.' : 'Negative → no real solutions.'}`,
  });
}

function expModel(X) {
  const P = ri(2, 90) * 100, r = pick([2, 3, 4, 5, 6, 8, 12, 15, 20]), grow = rf() < 0.6;
  const fac = grow ? 1 + r / 100 : 1 - r / 100, fs = nf(rnd(fac, 2));
  const thing = grow ? pick(['The population of a town', 'The number of subscribers to a channel', 'The value of a rare coin']) : pick(['The value of a car', 'The amount of a medication in the bloodstream', 'The number of trees in a forest']);
  const f = (s) => M(`f(t) = ${nm(P)}(${s})^t`);
  return ask(X, {
    topic: ADV, skill: 'Exponential models', diff: 2, numeric: false,
    q: `${thing} is ${nm(P)} today and ${grow ? 'increases' : 'decreases'} by ${r}% each year. Which function ${M('f')} gives the ${thing.replace(/^The /, '').toLowerCase()} ${M('t')} years from now?`,
    ans: f(fs), wrongs: [f(nf(rnd(grow ? 1 - r / 100 : 1 + r / 100, 2))), f(String(r)), f(nf(r / 100)), M(`f(t) = ${nm(P)} ${grow ? '+' : '-'} ${r}t`)], fmt: txt,
    expl: `Each year the amount is multiplied by ${M(`1 ${grow ? '+' : '-'} ${r / 100} = ${fs}`)}, so ${f(fs)}.`,
  });
}

function doubling(X) {
  const P = ri(1, 50) * 100, d = ri(2, 12), n = ri(2, 6), half = rf() < 0.4;
  const ans = half ? P / 2 ** n : P * 2 ** n;
  if (!Number.isInteger(ans)) return doubling(X);
  return ask(X, {
    topic: ADV, skill: 'Exponential models', diff: 2,
    q: half ? `A radioactive sample has a mass of ${nf(P)} grams and its mass halves every ${d} days. What is the mass of the sample, in grams, after ${n * d} days?` : `A bacteria culture starts with ${nf(P)} bacteria and doubles every ${d} hours. How many bacteria are there after ${n * d} hours?`,
    ans, wrongs: half ? [P / (2 * n), P - (P / 2) * n / 2, P / 2 ** (n + 1), P / 2 ** (n - 1)] : [P * 2 * n, P * 2 ** (n - 1), P * 2 ** (n + 1), P + P * n],
    expl: `${n * d} ÷ ${d} = ${n} ${half ? 'half-lives' : 'doubling periods'}. ${M(`${nm(P)} \\times ${half ? `(\\tfrac{1}{2})^{${n}}` : `2^{${n}}`} = ${nm(ans)}`)}.`,
  });
}

function expRules(X) {
  const a = ri(2, 7), b = ri(2, 5), c = ri(1, 9), d = ri(1, 9);
  if (rf() < 0.5) {
    const k = a * b + c - d;
    return ask(X, {
      topic: ADV, skill: 'Exponents', diff: 2,
      q: `For ${M('x > 0')}, the expression ${M(`\\dfrac{(x^{${a}})^{${b}} \\cdot x^{${c}}}{x^{${d}}}`)} is equivalent to ${M('x^k')}. What is the value of ${M('k')}?`,
      ans: k, wrongs: [a + b + c - d, a ** b + c - d, a * b * c - d, a * b + c + d],
      expl: `${M(`(x^{${a}})^{${b}} = x^{${a * b}}`)}. Then ${M(`x^{${a * b} + ${c} - ${d}} = x^{${k}}`)}.`,
    });
  }
  let p, q; do { p = ri(1, 7); q = ri(2, 5); } while (gcd(p, q) !== 1);
  const root = (n, m) => (n === 2 ? R`\sqrt{x^{${m}}}` : R`\sqrt[${n}]{x^{${m}}}`).replace('x^{1}', 'x');
  return ask(X, {
    topic: ADV, skill: 'Exponents', diff: 2, numeric: false,
    q: `Which expression is equivalent to ${M(`x^{\\frac{${p}}{${q}}}`)}, for ${M('x > 0')}?`,
    ans: M(root(q, p)), wrongs: [M(root(p === 1 ? q + 1 : p, q)), M(`\\frac{x^{${p}}}{${q}}`), M(`${q}x^{${p}}`), M(`x^{${p}} \\cdot x^{${q}}`)], fmt: txt,
    expl: `${M(`x^{\\frac{m}{n}} = \\sqrt[n]{x^m}`)}: the denominator is the root and the numerator is the power. So ${M(`x^{\\frac{${p}}{${q}}} = ${root(q, p)}`)}.`,
  });
}

function remainderThm(X) {
  const a = nz(-3, 4), b = ri(-6, 6), c = ri(-9, 9), d = ri(-12, 12), k = nz(-4, 4);
  const p = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
  return ask(X, {
    topic: ADV, skill: 'Polynomials', diff: 3,
    q: `What is the remainder when ${M(`p(x) = ${poly([[a, 'x^3'], [b, 'x^2'], [c, 'x'], [d, '']])}`)} is divided by ${M(`x ${sgn(-k)}`)}?`,
    ans: p(k), wrongs: [p(-k), d, p(k) + k, a + b + c + d],
    expl: `By the Remainder Theorem, the remainder is ${M(`p(${k})`)}: ${M(`${a}(${k})^3 ${sgn(b)}(${k})^2 ${sgn(c)}(${k}) ${sgn(d)} = ${p(k)}`)}.`,
  });
}

function inverseEval(X) {
  const m = nz(-8, 9), b = ri(-20, 20), a = ri(-10, 12), v = m * a + b;
  return ask(X, {
    topic: ALG, skill: 'Linear functions', diff: 1,
    q: `The function ${M('f')} is defined by ${M(`f(x) = ${lin(m, b)}`)}. If ${M(`f(a) = ${v}`)}, what is the value of ${M('a')}?`,
    ans: a, wrongs: [m * v + b, (v + b) / m, -a, v - b].filter(Number.isInteger),
    expl: `${M(`${lin(m, b)} = ${v}`)} with ${M('x = a')}: ${M(`${m}a = ${v - b}`)}, so ${M(`a = ${a}`)}.`,
  });
}

function unitConv(X) {
  const v = pick(['kmh', 'gal', 'cm', 'speed']);
  if (v === 'kmh') {
    const k = ri(1, 12) * 18;
    return ask(X, {
      topic: PSDA, skill: 'Units and rates', diff: 2,
      q: `A car travels at a constant speed of ${k} kilometers per hour. What is this speed in meters per second? (1 kilometer = 1,000 meters)`,
      ans: (k * 5) / 18, wrongs: [k * 1000 / 60, k / 3.6 * 2, k * 3.6, k / 60],
      expl: `${M(`${k}\\,\\frac{\\text{km}}{\\text{h}} \\times \\frac{1000\\text{ m}}{1\\text{ km}} \\times \\frac{1\\text{ h}}{3600\\text{ s}} = ${(k * 5) / 18}`)} m/s.`,
    });
  }
  if (v === 'gal') {
    const g = ri(2, 30), l = 3.8;
    const ans = rnd(g * l * 60, 1);
    return ask(X, {
      topic: PSDA, skill: 'Units and rates', diff: 2,
      q: `Water flows from a hose at ${g} gallons per minute. If 1 gallon is approximately 3.8 liters, approximately how many liters flow from the hose in one hour?`,
      ans, wrongs: [rnd((g / l) * 60, 1), rnd(g * l, 1), g * 60, rnd(g * l * 24, 1)], round: 1,
      expl: `${M(`${g} \\times 3.8 \\times 60 = ${nm(ans)}`)} liters per hour.`,
    });
  }
  if (v === 'cm') {
    const a = ri(2, 12), b = ri(2, 12);
    return ask(X, {
      topic: PSDA, skill: 'Units and rates', diff: 3,
      q: `A rectangular rug measures ${a} meters by ${b} meters. What is its area in square centimeters? (1 meter = 100 centimeters)`,
      ans: a * b * 10000, wrongs: [a * b * 100, a * b * 1000, a * b * 1e6], fmt: (x) => M(nm(x)),
      expl: `Convert each side: ${a * 100} cm by ${b * 100} cm. Area = ${M(`${a * 100} \\times ${b * 100} = ${nm(a * b * 10000)}`)} cm². (Square units scale by ${M('100^2')}.)`,
    });
  }
  const d = ri(2, 30) * 12, t = pick([2, 3, 4, 6, 12]), mm = d / t;
  return ask(X, {
    topic: PSDA, skill: 'Units and rates', diff: 1,
    q: `A cyclist rides ${d} miles in ${t} hours at a constant speed. At this rate, how many miles will the cyclist ride in ${t + 2} hours?`,
    ans: mm * (t + 2), wrongs: [d + 2, mm * t, d * 2, mm * (t + 1)],
    expl: `Rate = ${d} ÷ ${t} = ${mm} miles per hour. In ${t + 2} hours: ${M(`${mm} \\times ${t + 2} = ${mm * (t + 2)}`)} miles.`,
  });
}

function twoWay(X) {
  const groups = pick([['Juniors', 'Seniors', 'Yes', 'No', 'plan to attend the dance'], ['Morning shift', 'Evening shift', 'Walk', 'Drive', 'commute']]);
  const a = ri(10, 80), b = ri(10, 80), c = ri(10, 80), d = ri(10, 80);
  const [r1, r2, c1, c2, act] = groups;
  const table = `<table class="dt"><tr><th></th><th>${c1}</th><th>${c2}</th><th>Total</th></tr><tr><th>${r1}</th><td>${a}</td><td>${b}</td><td>${a + b}</td></tr><tr><th>${r2}</th><td>${c}</td><td>${d}</td><td>${c + d}</td></tr><tr><th>Total</th><td>${a + c}</td><td>${b + d}</td><td>${a + b + c + d}</td></tr></table>`;
  const v = pick(['row', 'col', 'all']);
  let num, den, q;
  if (v === 'row') { num = a; den = a + b; q = `If a person is selected at random from the ${r1.toLowerCase()}, what is the probability that the person's response was "${c1}"?`; }
  else if (v === 'col') { num = c; den = a + c; q = `If a person whose response was "${c1}" is selected at random, what is the probability that the person is in the ${r2.toLowerCase()} group?`; }
  else { num = d; den = a + b + c + d; q = `If a person is selected at random from everyone surveyed, what is the probability that the person is in the ${r2.toLowerCase()} group and responded "${c2}"?`; }
  const title = act === 'commute' ? 'The table summarizes how employees on two shifts commute to work.' : 'The table summarizes survey responses from students asked whether they plan to attend the dance.';
  return ask(X, {
    topic: PSDA, skill: 'Probability and two-way tables', diff: 2, numAns: rnd(num / den, 6), ansText: frt(num, den),
    q: `${title}${table}${q}`,
    ans: M(fr(num, den)), wrongs: [M(fr(num, a + b + c + d)), M(fr(num, v === 'row' ? a + c : a + b)), M(fr(v === 'all' ? c + d : num, v === 'all' ? b + d : den + num)), M(fr(den - num, den))],
    expl: `The condition restricts the group to ${den} people, of whom ${num} fit the description. Probability = ${M(fr(num, den))}${gcd(num, den) > 1 ? ` (${num}/${den} simplified)` : ''}.`,
  });
}

function circleEq(X) {
  const h = ri(-8, 8), k = ri(-8, 8), r = ri(1, 9);
  const D = -2 * h, E = -2 * k, F = h * h + k * k - r * r;
  const eq = `${poly([[1, 'x^2'], [D, 'x'], [1, 'y^2'], [E, 'y'], [F, '']])} = 0`;
  if (rf() < 0.5) return ask(X, {
    topic: GEO, skill: 'Circles in the coordinate plane', diff: 3,
    q: `The equation ${M(eq)} defines a circle in the ${M('xy')}-plane. What is the radius of the circle?`,
    ans: r, wrongs: [r * r, Math.abs(F) || r + 2, r + 1, Math.abs(h) + Math.abs(k)],
    expl: `Complete the square: ${M(`(x ${sgn(-h)})^2 + (y ${sgn(-k)})^2 = ${r * r}`)}. So ${M(`r = \\sqrt{${r * r}} = ${r}`)}.`,
  });
  return ask(X, {
    topic: GEO, skill: 'Circles in the coordinate plane', diff: 3, numeric: false,
    q: `The equation ${M(eq)} defines a circle in the ${M('xy')}-plane. What are the coordinates of the center of the circle?`,
    ans: M(`(${h}, ${k})`), wrongs: [M(`(${-h}, ${-k})`), M(`(${D}, ${E})`), M(`(${k}, ${h})`), M(`(${-h}, ${k})`), M(`(${h}, ${-k})`)], fmt: txt,
    expl: `Complete the square: ${M(`(x ${sgn(-h)})^2 + (y ${sgn(-k)})^2 = ${r * r}`)}. The center is ${M(`(${h}, ${k})`)}.`,
  });
}

function trigRatio(X) {
  const [p, q, h] = pick(TRIPLES), s = pick([1, 2, 3]), fnc = pick(['sin', 'cos', 'tan']);
  const opp = p * s, adj = q * s, hyp = h * s;
  const val = { sin: [opp, hyp], cos: [adj, hyp], tan: [opp, adj] }[fnc];
  return ask(X, {
    topic: GEO, skill: 'Right triangle trigonometry', diff: 2, numAns: rnd(val[0] / val[1], 6), ansText: frt(val[0], val[1]),
    q: `In right triangle ${M('ABC')}, angle ${M('C')} is the right angle, ${M(`BC = ${opp}`)}, ${M(`AC = ${adj}`)}, and ${M(`AB = ${hyp}`)}. What is the value of ${M(`\\${fnc} A`)}?`,
    ans: M(fr(val[0], val[1])), wrongs: [M(fr(opp, hyp)), M(fr(adj, hyp)), M(fr(opp, adj)), M(fr(adj, opp)), M(fr(hyp, opp))],
    expl: `For angle ${M('A')}: opposite = ${M(`BC = ${opp}`)}, adjacent = ${M(`AC = ${adj}`)}, hypotenuse = ${M(`AB = ${hyp}`)}. ${M(`\\${fnc} A = ${fnc === 'sin' ? '\\frac{\\text{opp}}{\\text{hyp}}' : fnc === 'cos' ? '\\frac{\\text{adj}}{\\text{hyp}}' : '\\frac{\\text{opp}}{\\text{adj}}'} = ${fr(val[0], val[1])}`)}.`,
  });
}

function complementary(X) {
  if (rf() < 0.4) {
    const x = ri(5, 85);
    return ask(X, {
      topic: GEO, skill: 'Right triangle trigonometry', diff: 2,
      q: `In a right triangle, ${M(`\\sin(${x}^\\circ) = \\cos(k^\\circ)`)}, where ${M('0 < k < 90')}. What is the value of ${M('k')}?`,
      ans: 90 - x, wrongs: [x, 180 - x, 90 + x, 360 - x],
      expl: `${M('\\sin\\theta = \\cos(90^\\circ - \\theta)')}, so ${M(`k = 90 - ${x} = ${90 - x}`)}.`,
    });
  }
  let a, b, c, d, x;
  for (;;) { a = ri(1, 5); c = ri(1, 5); x = ri(3, 20); b = ri(-10, 20); d = 90 - (a + c) * x - b; if (a * x + b > 0 && c * x + d > 0 && a * x + b < 90) break; }
  return ask(X, {
    topic: GEO, skill: 'Right triangle trigonometry', diff: 3,
    q: `If ${M(`\\sin((${lin(a, b)})^\\circ) = \\cos((${lin(c, d)})^\\circ)`)} and both angles are acute, what is the value of ${M('x')}?`,
    ans: x, wrongs: [rnd((90 - b + d) / (a + c), 2), rnd((d - b) / (a - c || 1), 2), x + 2, rnd((180 - b - d) / (a + c), 2)].filter((v) => v > 0),
    expl: `Sine and cosine of complementary angles are equal, so ${M(`(${lin(a, b)}) + (${lin(c, d)}) = 90`)}: ${M(`${a + c}x ${sgn(b + d)} = 90`)}, giving ${M(`x = ${x}`)}.`,
  });
}

function radians(X) {
  const deg = pick([15, 18, 20, 30, 36, 40, 45, 60, 72, 75, 90, 108, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]);
  if (rf() < 0.5) return ask(X, {
    topic: GEO, skill: 'Radians', diff: 1, numeric: false,
    q: `What is the radian measure of an angle of ${deg}°?`,
    ans: M(piStr(deg, 180)), wrongs: [M(piStr(deg, 360)), M(piStr(180, deg)), M(piStr(deg, 90)), M(piStr(2 * deg, 180) === piStr(deg, 180) ? piStr(deg, 45) : piStr(2 * deg, 180))], fmt: txt,
    expl: `Multiply by ${M('\\frac{\\pi}{180}')}: ${M(`${deg} \\times \\frac{\\pi}{180} = ${piStr(deg, 180)}`)}.`,
  });
  const g = gcd(deg, 180);
  return ask(X, {
    topic: GEO, skill: 'Radians', diff: 1, post: '°',
    q: `An angle measures ${M(piStr(deg, 180))} radians. What is its measure in degrees?`,
    ans: deg, wrongs: [deg * 2, deg / 2, 180 - deg, deg + 90, 360 - deg].map((v) => rnd(v, 2)),
    expl: `Multiply by ${M('\\frac{180}{\\pi}')}: ${M(`${piStr(deg, 180)} \\times \\frac{180}{\\pi} = ${deg}`)}°.`,
  });
}

function volumes(X) {
  const v = pick(['cone', 'sphere', 'pyramid']);
  if (v === 'cone') {
    const r = ri(1, 9), h = 3 * ri(1, 6);
    return ask(X, {
      topic: GEO, skill: 'Volume', diff: 2, numeric: false,
      q: `A right circular cone has a radius of ${r} and a height of ${h}. What is the volume of the cone?`,
      ans: (r * r * h) / 3, wrongs: [r * r * h, (r * h) / 3 * 2, (2 * r * r * h) / 3, (r * h * h) / 3], fmt: (k) => M(piStr(k)),
      expl: `${M(`V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(${r})^2(${h}) = ${piStr((r * r * h) / 3)}`)}.`,
    });
  }
  if (v === 'sphere') {
    const r = 3 * ri(1, 4);
    return ask(X, {
      topic: GEO, skill: 'Volume', diff: 2, numeric: false,
      q: `What is the volume of a sphere with radius ${r}?`,
      ans: (4 * r ** 3) / 3, wrongs: [4 * r * r, r ** 3, (4 * r * r) / 3, (2 * r ** 3) / 3], fmt: (k) => M(piStr(k)),
      expl: `${M(`V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(${r})^3 = ${piStr((4 * r ** 3) / 3)}`)}.`,
    });
  }
  const b = ri(2, 12), h = 3 * ri(1, 6);
  return ask(X, {
    topic: GEO, skill: 'Volume', diff: 2,
    q: `A pyramid has a square base with side length ${b} and a height of ${h}. What is the volume of the pyramid?`,
    ans: (b * b * h) / 3, wrongs: [b * b * h, (b * h) / 3, (b * b * h) / 2, (4 * b * h) / 3],
    expl: `${M(`V = \\frac{1}{3}Bh = \\frac{1}{3}(${b}^2)(${h}) = ${(b * b * h) / 3}`)}.`,
  });
}

function absEq(X) {
  let a, b, c; do { a = pick([1, 1, 2, 3]); b = ri(-15, 15); c = ri(1, 15); } while ((b + c) % a || (b - c) % a);
  const s1 = (b + c) / a, s2 = (b - c) / a;
  const v = pick(['sum', 'diff']);
  const ans = v === 'sum' ? s1 + s2 : s1 - s2;
  return ask(X, {
    topic: ALG, skill: 'Absolute value', diff: 2,
    q: `What is the ${v === 'sum' ? 'sum of the solutions' : 'positive difference between the two solutions'} of ${M(`|${lin(a, -b)}| = ${c}`)}?`,
    ans, wrongs: [v === 'sum' ? s1 - s2 : s1 + s2, s1, s2, c, b],
    expl: `${M(`${lin(a, -b)} = ${c}`)} gives ${M(`x = ${s1}`)}; ${M(`${lin(a, -b)} = ${-c}`)} gives ${M(`x = ${s2}`)}. The ${v === 'sum' ? 'sum' : 'difference'} is ${ans}.`,
  });
}

function budget(X) {
  const B = ri(10, 60) * 10, f = ri(5, 60), p = ri(3, 25), n = Math.floor((B - f) / p);
  if (n < 2) return budget(X);
  return ask(X, {
    topic: ALG, skill: 'Linear inequalities', diff: 2,
    q: `Jordan has $${B} to spend at an amusement park. Admission costs $${f}, and each ride ticket costs $${p}. What is the maximum number of ride tickets Jordan can buy?`,
    ans: n, wrongs: [Math.floor(B / p), n + 1, Math.ceil((B - f) / p) === n ? n - 1 : Math.ceil((B - f) / p), Math.floor((B + f) / p)],
    expl: `${M(`${f} + ${p}t \\le ${B}`)} gives ${M(`t \\le ${rnd((B - f) / p, 2)}`)}. The greatest whole number is ${n}.`,
  });
}

function noSolution(X) {
  let a, b, m; do { a = nz(-6, 7); b = nz(-6, 7); m = nz(-3, 4); } while (m === 1);
  const c = ri(-10, 10), e = m * c + nz(-5, 5);
  return ask(X, {
    topic: ALG, skill: 'Systems of equations', diff: 3,
    q: `${M(R`\begin{aligned} ${poly([[a, 'x'], [b, 'y']])} &= ${c} \\ kx ${sgn(m * b).replace(/(\d)/, '$1')}y &= ${e} \end{aligned}`.replace('kx + 1y', 'kx + y').replace('kx - 1y', 'kx - y'))}<br>In the system of equations above, ${M('k')} is a constant. For what value of ${M('k')} does the system have no solution?`,
    ans: m * a, wrongs: [a, -m * a, m * b, a + m],
    expl: `No solution means the lines are parallel but distinct: the coefficients must be proportional while the constants are not. The ${M('y')}-coefficients have ratio ${M(`${m * b} / ${b} = ${m}`)}, so ${M(`k = ${m}(${a}) = ${m * a}`)}. (Constants: ${M(`${m}(${c}) = ${m * c} \\ne ${e}`)}, so the lines are distinct.)`,
  });
}

function pointInRegion(X) {
  const m1 = nz(-3, 3), b1 = ri(-5, 5), m2 = nz(-3, 3), b2 = b1 + ri(4, 12);
  if (m1 === m2) return pointInRegion(X);
  const ok = (x, y) => y > m1 * x + b1 && y < m2 * x + b2;
  let good, bads = [], t = 0;
  while (!good && t++ < 200) { const x = ri(-4, 4), y = ri(-12, 15); if (ok(x, y)) good = [x, y]; }
  t = 0;
  while (bads.length < 3 && t++ < 500) { const x = ri(-4, 4), y = ri(-12, 15); if (!ok(x, y) && !bads.some((p) => p[0] === x && p[1] === y)) bads.push([x, y]); }
  if (!good || bads.length < 3) return pointInRegion(X);
  const f = (p) => M(`(${p[0]}, ${p[1]})`);
  return ask(X, {
    topic: ALG, skill: 'Systems of inequalities', diff: 2, numeric: false,
    q: `${M(`y > ${lin(m1, b1)}`)}<br>${M(`y < ${lin(m2, b2)}`)}<br>Which point ${M('(x, y)')} is a solution to the system of inequalities above?`,
    ans: f(good), wrongs: bads.map(f), fmt: txt,
    expl: `Test ${f(good)}: ${M(`${good[1]} > ${m1 * good[0] + b1}`)} ✓ and ${M(`${good[1]} < ${m2 * good[0] + b2}`)} ✓. Each other point fails at least one inequality.`,
  });
}

function expandProduct(X) {
  const a = nz(-5, 6), b = nz(-9, 9), c = nz(-5, 6), d = nz(-9, 9);
  const p = (A, B, C) => M(poly([[A, 'x^2'], [B, 'x'], [C, '']]));
  return ask(X, {
    topic: ADV, skill: 'Equivalent expressions', diff: 1, numeric: false,
    q: `Which expression is equivalent to ${M(`(${lin(a, b)})(${lin(c, d)})`)}?`,
    ans: p(a * c, a * d + b * c, b * d), wrongs: [p(a * c, 0, b * d), p(a * c, a * d - b * c, b * d), p(a * c, a * b + c * d, b * d), p(a + c, a * d + b * c, b * d), p(a * c, -(a * d + b * c), b * d)], fmt: txt,
    expl: `Multiply every term (FOIL): first ${M(`(${a}x)(${c}x) = ${a * c}x^2`)}, outer + inner ${M(`(${a * d}) + (${b * c}) = ${a * d + b * c}`)} for the ${M('x')}-term, last ${M(`(${b})(${d}) = ${b * d}`)}. Result: ${p(a * c, a * d + b * c, b * d)}.`,
  });
}

function rationalEq(X) {
  let a, b, c, d, x;
  for (let t = 0; ; t++) { a = ri(1, 9); b = ri(-9, 9); d = ri(-9, 9); x = ri(-8, 10); if (x + b === 0 || x + d === 0 || b === d) continue; const cc = (a * (x + d)) / (x + b); if (Number.isInteger(cc) && cc !== a && cc !== 0) { c = cc; break; } }
  return ask(X, {
    topic: ADV, skill: 'Rational equations', diff: 3,
    q: `What value of ${M('x')} satisfies ${M(`\\dfrac{${a}}{x ${sgn(b)}} = \\dfrac{${c}}{x ${sgn(d)}}`)}?`,
    ans: x, wrongs: [-x, (c * b + a * d) / (a - c), (a * d - c * b) / (a - c), x + 1].filter(Number.isInteger),
    expl: `Cross-multiply: ${M(`${a}(x ${sgn(d)}) = ${c}(x ${sgn(b)})`)}. Then ${M(`${a - c}x = ${c * b - a * d}`)}, so ${M(`x = ${x}`)}. Check that no denominator is 0.`,
  });
}

function bestFit(X) {
  const m = rnd(ri(5, 60) / 10, 1), b = ri(2, 40), x = ri(3, 25);
  const ctx = pick([['the number of hours studied', 'test score gain, in points'], ['the temperature, in °C', 'number of iced drinks sold, in dozens'], ['the age of a tree, in years', 'height of the tree, in feet']]);
  const ans = rnd(m * x + b, 1);
  return ask(X, {
    topic: PSDA, skill: 'Scatterplots and models', diff: 1,
    q: `A line of best fit for a scatterplot relating ${ctx[0]}, ${M('x')}, to the ${ctx[1]}, ${M('y')}, is ${M(`y = ${m}x + ${b}`)}. What value of ${M('y')} does this line predict when ${M(`x = ${x}`)}?`,
    ans, wrongs: [rnd(m * x, 1), rnd(b * x + m, 1), rnd(m * (x + b), 1), rnd(ans + m, 1)],
    expl: `${M(`y = ${m}(${x}) + ${b} = ${nm(ans)}`)}.`,
  });
}

function sampleEstimate(X) {
  const N = ri(4, 40) * 100, n = pick([50, 80, 100, 120, 150, 200, 250]), k = ri(5, n - 5);
  const ans = Math.round((k / n) * N);
  if (Math.abs(ans - (k / n) * N) > 1e-9) return sampleEstimate(X);
  return ask(X, {
    topic: PSDA, skill: 'Sampling and inference', diff: 2,
    q: `A school has ${nf(N)} students. In a random sample of ${n} students, ${k} said they walk to school. Based on this sample, approximately how many students at the school walk to school?`,
    ans, wrongs: [k * 10, N - ans, Math.round((n / k) * 100), Math.round(ans / 2)],
    expl: `The sample proportion is ${M(`\\frac{${k}}{${n}}`)}. Apply it to the whole school: ${M(`\\frac{${k}}{${n}} \\times ${nm(N)} = ${nm(ans)}`)}.`,
  });
}

function parallelSim(X) {
  let p, q, r; do { p = ri(2, 12); q = ri(2, 12); r = ri(2, 15); } while ((r * (p + q)) % p);
  return ask(X, {
    topic: GEO, skill: 'Similar triangles', diff: 2,
    q: `In triangle ${M('ABC')}, point ${M('D')} lies on ${M('\\overline{AB}')} and point ${M('E')} lies on ${M('\\overline{AC}')} so that ${M('\\overline{DE}')} is parallel to ${M('\\overline{BC}')}. If ${M(`AD = ${p}`)}, ${M(`DB = ${q}`)}, and ${M(`DE = ${r}`)}, what is the length of ${M('\\overline{BC}')}?`,
    ans: (r * (p + q)) / p, wrongs: [rnd((r * q) / p, 2), r + q, rnd((r * p) / q, 2), rnd((r * (p + q)) / q, 2)],
    expl: `${M('\\triangle ADE \\sim \\triangle ABC')}, so ${M(`\\frac{BC}{DE} = \\frac{AB}{AD} = \\frac{${p + q}}{${p}}`)}. ${M(`BC = ${r} \\times \\frac{${p + q}}{${p}} = ${(r * (p + q)) / p}`)}.`,
  });
}

function polyZeros(X) {
  const a = nz(-9, 9), b = nz(-9, 9); let c; do { c = nz(-9, 9); } while (c % 2 === 0);
  const zeros = [a, -b, c / 2];
  const raw = [[a, M(String(a))], [-a, M(String(-a))], [b, M(String(b))], [-b, M(String(-b))], [c / 2, M(fr(c, 2))], [-c / 2, M(fr(-c, 2))], [c, M(String(c))]];
  const choices = raw.filter((x, i) => raw.findIndex((y) => y[0] === x[0]) === i);
  const target = pick(zeros);
  const ansS = choices.find((x) => x[0] === target)[1];
  const wrongs = choices.filter((x) => !zeros.includes(x[0])).map((x) => x[1]);
  return ask(X, {
    topic: ADV, skill: 'Polynomials', diff: 2, numeric: false,
    q: `The function ${M('p')} is defined by ${M(`p(x) = (x ${sgn(-a)})(x ${sgn(b)})(2x ${sgn(-c)})`)}. Which of the following is a zero of ${M('p')}?`,
    ans: ansS, wrongs, fmt: txt,
    expl: `Set each factor to zero: ${M(`x = ${a}`)}, ${M(`x = ${-b}`)}, ${M(`x = ${fr(c, 2)}`)}. Of the choices, only ${ansS} is a zero.`,
  });
}

module.exports = {
  satTemplates: {
    costModel, interpretLinear, tickets, lineEquation, perpParallel, linearTable, vertex, discriminant, expModel, doubling,
    expRules, remainderThm, inverseEval, unitConv, twoWay, circleEq, trigRatio, complementary, radians, volumes, absEq, budget,
    noSolution, pointInRegion, expandProduct, rationalEq, bestFit, sampleEstimate, parallelSim, polyZeros,
  },
};
