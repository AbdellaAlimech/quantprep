// GRE questions with drawn figures: data-interpretation charts and geometry diagrams (inline SVG).
const L = require('./lib');
const { R, rf, ri, pick, nz, shuffle, gcd, rnd, M, nf, nm, money, fr, frt, piStr, radStr } = L;
const { ask, TRIPLES } = require('./shared');

const f1 = (v) => Math.round(v * 10) / 10;
const svg = (w, h, inner, label) => `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
const txt = (x, y, s, a = 'middle', cls = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" class="${cls}">${s}</text>`;
const line = (x1, y1, x2, y2, cls = 'ln') => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" class="${cls}"/>`;
const NOTE = '<div class="fig-note">Note: Figure not drawn to scale.</div>';
const pctF = (v) => `${nf(v)}%`;
const usd = (v) => `$${money(v)}`;

// ---------- charts ----------
function barSvg(labels, vals, title, yLabel) {
  const W = 480, H = 270, l = 50, r = 14, t = 34, b = 34;
  const maxV = Math.max(...vals), step = maxV > 150 ? 50 : maxV > 60 ? 20 : 10, top = Math.ceil(maxV / step) * step;
  const pw = W - l - r, ph = H - t - b, bw = (pw / labels.length) * 0.58;
  let g = txt(W / 2, 18, title, 'middle', 'ttl');
  for (let v = 0; v <= top; v += step) { const y = t + ph - (v / top) * ph; g += line(l, y, W - r, y, 'grid') + txt(l - 8, y + 4, v, 'end', 'ax'); }
  labels.forEach((lb, i) => {
    const x = l + (pw / labels.length) * (i + 0.5), hgt = (vals[i] / top) * ph, y = t + ph - hgt;
    g += `<rect x="${f1(x - bw / 2)}" y="${f1(y)}" width="${f1(bw)}" height="${f1(hgt)}" rx="3" class="cbar"/>`;
    g += txt(x, y - 6, vals[i], 'middle', 'val') + txt(x, H - b + 18, lb, 'middle', 'ax');
  });
  g += line(l, t + ph, W - r, t + ph, 'axis') + `<text x="14" y="${f1(t + ph / 2)}" transform="rotate(-90 14 ${f1(t + ph / 2)})" text-anchor="middle" class="ax">${yLabel}</text>`;
  return svg(W, H, g, title);
}
function hBarQ(X) {
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  let vals, inc, best;
  for (;;) {
    vals = years.map(() => ri(4, 22) * 10);
    inc = vals.map((v, i) => (i ? v - vals[i - 1] : -Infinity));
    const s = inc.slice(1).slice().sort((a, b) => b - a);
    if (s[0] > 0 && s[0] !== s[1]) { best = inc.indexOf(s[0]); break; }
  }
  const chart = barSvg(years, vals, 'Cars sold by a dealership, 2019–2024', 'Cars sold');
  const intro = `The bar graph shows the number of cars sold by a dealership in each year from 2019 to 2024.${chart}`;
  const v = pick(['pct', 'avg', 'above', 'bestYear']);
  if (v === 'pct') {
    let i, j; do { i = ri(0, 4); j = ri(i + 1, 5); } while (vals[j] <= vals[i]);
    const ans = Math.round(((vals[j] - vals[i]) / vals[i]) * 100);
    return ask(X, {
      topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, numeric: false,
      q: `${intro}To the nearest percent, by what percent did the number of cars sold increase from ${years[i]} to ${years[j]}?`,
      ans, wrongs: [Math.round(((vals[j] - vals[i]) / vals[j]) * 100), vals[j] - vals[i], Math.round((vals[j] / vals[i]) * 100), ans + 10, Math.max(1, ans - 10)], fmt: pctF,
      expl: `${years[i]}: ${vals[i]} cars; ${years[j]}: ${vals[j]} cars. Percent increase ${M(`= \\frac{${vals[j]} - ${vals[i]}}{${vals[i]}} \\times 100 \\approx ${ans}\\%`)}. Divide by the earlier year's value.`,
    });
  }
  const sum = vals.reduce((a, b) => a + b, 0), avg = sum / 6;
  if (v === 'avg') return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, round: Number.isInteger(avg * 10) && !Number.isInteger(avg) ? 1 : undefined,
    q: `${intro}What was the average (arithmetic mean) number of cars sold per year from 2019 to 2024${Number.isInteger(avg) ? '' : ', to the nearest tenth'}?`,
    ans: rnd(avg, 1), wrongs: [rnd(sum / 5, 1), (Math.max(...vals) + Math.min(...vals)) / 2, rnd(avg + 10, 1), rnd(avg - 10, 1), vals.slice().sort((a, b) => a - b)[2]],
    expl: `Total ${M(`= ${vals.join(' + ')} = ${nm(sum)}`)}. Average ${M(`= ${nm(sum)} \\div 6 \\approx ${nm(rnd(avg, 1))}`)}.`,
  });
  if (v === 'above') {
    const n = vals.filter((x) => x > avg).length;
    return ask(X, {
      topic: 'Data Analysis', skill: 'Data interpretation', diff: 3,
      q: `${intro}In how many of the six years was the number of cars sold greater than the average (arithmetic mean) number sold per year over the six years?`,
      ans: n, wrongs: [6 - n, 3, n + 1, Math.max(0, n - 1), 2],
      expl: `Average ${M(`= ${nm(sum)} \\div 6 \\approx ${nm(rnd(avg, 2))}`)}. Years above it: ${years.filter((_, i) => vals[i] > avg).join(', ') || 'none'}, so ${n}.`,
    });
  }
  return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, numeric: false,
    q: `${intro}In which year was the increase in cars sold, compared with the previous year, the greatest?`,
    ans: String(years[best]), wrongs: years.slice(1).filter((y, k) => k + 1 !== best).map(String), fmt: (s) => s, order: years.map(String),
    expl: `Year-over-year changes: ${years.slice(1).map((y, k) => `${y}: ${inc[k + 1] > 0 ? '+' : ''}${inc[k + 1]}`).join('; ')}. The greatest increase is in ${years[best]}.`,
  });
}

function lineSvg(labels, vals, title, yLabel) {
  const W = 480, H = 270, l = 50, r = 18, t = 34, b = 34;
  const maxV = Math.max(...vals), top = Math.ceil(maxV / 20) * 20, step = 20;
  const pw = W - l - r, ph = H - t - b;
  const px = (i) => l + (pw / (labels.length - 1)) * i, py = (v) => t + ph - (v / top) * ph;
  let g = txt(W / 2, 18, title, 'middle', 'ttl');
  for (let v = 0; v <= top; v += step) g += line(l, py(v), W - r, py(v), 'grid') + txt(l - 8, py(v) + 4, v, 'end', 'ax');
  g += `<polyline class="pl" points="${vals.map((v, i) => `${f1(px(i))},${f1(py(v))}`).join(' ')}"/>`;
  vals.forEach((v, i) => { g += `<circle cx="${f1(px(i))}" cy="${f1(py(v))}" r="4" class="pt"/>` + txt(px(i), py(v) - 10, v, 'middle', 'val') + txt(px(i), H - b + 18, labels[i], 'middle', 'ax'); });
  g += line(l, t + ph, W - r, t + ph, 'axis') + `<text x="14" y="${f1(t + ph / 2)}" transform="rotate(-90 14 ${f1(t + ph / 2)})" text-anchor="middle" class="ax">${yLabel}</text>`;
  return svg(W, H, g, title);
}
function hLineQ(X) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  let vals, dec, worst;
  for (;;) {
    vals = months.map(() => ri(15, 95));
    dec = vals.map((v, i) => (i ? vals[i - 1] - v : -Infinity));
    const s = dec.slice(1).slice().sort((a, b) => b - a);
    if (s[0] > 0 && s[0] !== s[1]) { worst = dec.indexOf(s[0]); break; }
  }
  const chart = lineSvg(months, vals, 'Monthly revenue of a company', 'Thousands of dollars');
  const intro = `The line graph shows a company's monthly revenue, in thousands of dollars, from January to July.${chart}`;
  const v = pick(['drop', 'median', 'pct', 'range']);
  const names = months.slice(1).map((m, k) => `${months[k]} to ${m}`);
  if (v === 'drop') return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, numeric: false,
    q: `${intro}Between which two consecutive months did revenue decrease the most?`,
    ans: names[worst - 1], wrongs: shuffle(names.filter((_, k) => k !== worst - 1)), fmt: (s) => s, order: names,
    expl: `Decreases: ${names.map((n, k) => `${n}: ${dec[k + 1] > 0 ? '−' + dec[k + 1] : '+' + -dec[k + 1]}`).join('; ')}. The largest drop is ${names[worst - 1]} (${dec[worst]} thousand dollars).`,
  });
  const sorted = vals.slice().sort((a, b) => a - b);
  if (v === 'median') return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 2,
    q: `${intro}What is the median monthly revenue, in thousands of dollars, for the seven months shown?`,
    ans: sorted[3], wrongs: [vals[3], rnd(vals.reduce((a, b) => a + b, 0) / 7, 1), sorted[2], sorted[4], (sorted[0] + sorted[6]) / 2],
    expl: `Order the values: ${sorted.join(', ')}. The middle (4th) value is ${sorted[3]}. (April's value, ${vals[3]}, is the middle month, not the median.)`,
  });
  if (v === 'pct') {
    const ans = rnd(((vals[6] - vals[0]) / vals[0]) * 100, 1);
    if (ans === 0) return hLineQ(X);
    const fmt = (x) => (x > 0 ? `${nf(x)}% increase` : `${nf(-x)}% decrease`);
    return ask(X, {
      topic: 'Data Analysis', skill: 'Data interpretation', diff: 3, numeric: false,
      q: `${intro}To the nearest tenth of a percent, what was the percent change in revenue from January to July?`,
      ans, wrongs: [rnd(((vals[6] - vals[0]) / vals[6]) * 100, 1), -ans, rnd(vals[6] - vals[0], 1), rnd(ans * 1.5, 1)], fmt, order: 'shuffle',
      expl: `${M(`\\frac{${vals[6]} - ${vals[0]}}{${vals[0]}} \\times 100 \\approx ${ans}\\%`)}, so a ${fmt(ans)}.`,
    });
  }
  return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 1,
    q: `${intro}What is the range of the monthly revenues shown, in thousands of dollars?`,
    ans: sorted[6] - sorted[0], wrongs: [vals[6] - vals[0], sorted[6], sorted[5] - sorted[1], sorted[3]],
    expl: `Range = highest − lowest = ${sorted[6]} − ${sorted[0]} = ${sorted[6] - sorted[0]}.`,
  });
}

const PIE_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];
function pieSvg(names, pcts, title) {
  const W = 470, H = 250, cx = 125, cy = 132, r = 98;
  let g = txt(W / 2, 18, title, 'middle', 'ttl'), a0 = -90;
  pcts.forEach((p, i) => {
    const a1 = a0 + p * 3.6, la = p > 50 ? 1 : 0;
    const x0 = cx + r * Math.cos((a0 * Math.PI) / 180), y0 = cy + r * Math.sin((a0 * Math.PI) / 180);
    const x1 = cx + r * Math.cos((a1 * Math.PI) / 180), y1 = cy + r * Math.sin((a1 * Math.PI) / 180);
    g += `<path d="M${cx},${cy} L${f1(x0)},${f1(y0)} A${r},${r} 0 ${la} 1 ${f1(x1)},${f1(y1)} Z" fill="${PIE_COLORS[i]}" class="slice"/>`;
    const am = ((a0 + a1) / 2) * (Math.PI / 180);
    if (p >= 8) g += `<text x="${f1(cx + r * 0.62 * Math.cos(am))}" y="${f1(cy + r * 0.62 * Math.sin(am) + 4)}" text-anchor="middle" class="pie-l">${p}%</text>`;
    a0 = a1;
  });
  names.forEach((n, i) => { const y = 64 + i * 34; g += `<rect x="262" y="${y - 12}" width="16" height="16" rx="4" fill="${PIE_COLORS[i]}"/>` + txt(286, y + 1, `${n}: ${pcts[i]}%`, 'start', 'leg'); });
  return svg(W, H, g, title);
}
function hPieQ(X) {
  const names = ['Housing', 'Food', 'Transportation', 'Savings', 'Other'];
  let pcts;
  do { const cuts = shuffle([...Array(19).keys()].map((k) => (k + 1) * 5)).slice(0, 4).sort((a, b) => a - b); pcts = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], cuts[3] - cuts[2], 100 - cuts[3]]; }
  while (pcts.some((p) => p < 5) || new Set(pcts).size < 4);
  const B = ri(3, 12) * 1000;
  const chart = pieSvg(names, pcts, 'How a family spends its monthly budget');
  const intro = `The circle graph shows how a family's monthly budget of $${nf(B)} is divided among five categories.${chart}`;
  const v = pick(['amount', 'diff', 'angle', 'newpct']);
  const i = ri(0, 4); let j; do { j = ri(0, 4); } while (j === i || pcts[j] === pcts[i]);
  if (v === 'amount') return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 1, pre: '$',
    q: `${intro}How many dollars does the family spend on ${names[i].toLowerCase()} each month?`,
    ans: (pcts[i] * B) / 100, wrongs: [pcts[i] * 10, (pcts[j] * B) / 100, ((100 - pcts[i]) * B) / 100, (pcts[i] * B) / 1000], fmt: usd,
    expl: `${M(`${pcts[i]}\\% \\times ${nm(B)} = ${nm((pcts[i] * B) / 100)}`)} dollars.`,
  });
  if (v === 'diff') {
    const [a, b] = pcts[i] > pcts[j] ? [i, j] : [j, i];
    return ask(X, {
      topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, pre: '$',
      q: `${intro}How many more dollars per month does the family spend on ${names[a].toLowerCase()} than on ${names[b].toLowerCase()}?`,
      ans: ((pcts[a] - pcts[b]) * B) / 100, wrongs: [pcts[a] - pcts[b], ((pcts[a] + pcts[b]) * B) / 100, (pcts[a] * B) / 100, (pcts[b] * B) / 100], fmt: usd,
      expl: `The difference is ${pcts[a]}% − ${pcts[b]}% = ${pcts[a] - pcts[b]}% of the budget: ${M(`${(pcts[a] - pcts[b]) / 100} \\times ${nm(B)} = ${nm(((pcts[a] - pcts[b]) * B) / 100)}`)} dollars.`,
    });
  }
  if (v === 'angle') return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 2, post: '°',
    q: `${intro}What is the measure, in degrees, of the central angle of the sector that represents ${names[i].toLowerCase()}?`,
    ans: pcts[i] * 3.6, wrongs: [pcts[i], pcts[i] * 1.8, 360 - pcts[i] * 3.6, pcts[i] * 3], fmt: (x) => `${nf(x)}°`,
    expl: `A full circle is 360°, so ${M(`${pcts[i]}\\% \\times 360^\\circ = ${nm(pcts[i] * 3.6)}^\\circ`)}.`,
  });
  const ans = rnd(pcts[i] * 0.8, 1);
  return ask(X, {
    topic: 'Data Analysis', skill: 'Data interpretation', diff: 3, post: '%',
    q: `${intro}Next year the family's monthly budget will increase by 25%, but the amount spent on ${names[i].toLowerCase()} will stay the same. What percent of the new budget will be spent on ${names[i].toLowerCase()}?`,
    ans, wrongs: [pcts[i], rnd(pcts[i] * 1.25, 1), pcts[i] - 25 > 0 ? pcts[i] - 25 : pcts[i] + 5, rnd(pcts[i] * 0.75, 2)], fmt: pctF,
    expl: `Amount: ${M(`${pcts[i] / 100} \\times ${nm(B)} = ${nm((pcts[i] * B) / 100)}`)}. New budget: ${M(`1.25 \\times ${nm(B)} = ${nm(1.25 * B)}`)}. ${M(`\\frac{${nm((pcts[i] * B) / 100)}}{${nm(1.25 * B)}} = ${ans}\\%`)}. (In general the share is divided by 1.25, i.e. multiplied by 0.8.)`,
  });
}

// ---------- geometry figures ----------
function hTriFig(X) {
  let x, a, b, cc, d;
  for (;;) { x = ri(10, 40); a = ri(1, 3); b = ri(-10, 30); cc = ri(1, 3); d = 180 - x - a * x - b - cc * x; const A = [x, a * x + b, cc * x + d]; if (A.every((t) => t >= 15 && t <= 140) && a * x + b !== x) break; }
  const lab = (k, m) => (k === 1 && m === 0 ? 'x°' : `(${k === 1 ? '' : k}x${m ? (m > 0 ? ' + ' + m : ' − ' + -m) : ''})°`);
  const angs = [x, a * x + b, cc * x + d];
  const P = [[60, 210], [380, 210], [170, 40]];
  const g = `<polygon points="${P.map((p) => p.join(',')).join(' ')}" class="shape"/>` + txt(84, 200, lab(1, 0), 'start', 'lbl') + txt(356, 200, lab(a, b), 'end', 'lbl') + txt(172, 80, lab(cc, d), 'middle', 'lbl')
    + txt(48, 228, 'A', 'middle', 'pt-l') + txt(392, 228, 'B', 'middle', 'pt-l') + txt(170, 30, 'C', 'middle', 'pt-l');
  const fig = svg(440, 240, g, 'Triangle ABC with angle expressions') + NOTE;
  const askLargest = rf() < 0.4, ans = askLargest ? Math.max(...angs) : x;
  return ask(X, {
    topic: 'Geometry', skill: 'Triangle angles', diff: 2,
    q: `${fig}In triangle ${M('ABC')} above, what is ${askLargest ? 'the measure, in degrees, of the largest angle' : `the value of ${M('x')}`}?`,
    ans, wrongs: askLargest ? [x, a * x + b, cc * x + d, 180 - Math.max(...angs), 90].filter((v) => v !== ans) : [x + 5, x - 5, Math.round((180 - b - d) / (a + cc)), angs[1], 2 * x],
    expl: `The angles of a triangle sum to 180°: ${M(`x + (${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) + (${cc === 1 ? '' : cc}x ${d >= 0 ? '+' : '-'} ${Math.abs(d)}) = 180`)}, so ${M(`${1 + a + cc}x ${b + d >= 0 ? '+' : '-'} ${Math.abs(b + d)} = 180`)} and ${M(`x = ${x}`)}. The angles are ${angs.join('°, ')}°.${askLargest ? ` The largest is ${Math.max(...angs)}°.` : ''}`,
  });
}

function hParallelFig(X) {
  const th = ri(35, 80); // acute angle
  const pos = ['tr', 'tl', 'bl', 'br'], acute = { tr: true, bl: true, tl: false, br: false };
  const gi = pick(pos), gAt = pick(['P', 'Q']); let ai, aAt; do { ai = pick(pos); aAt = pick(['P', 'Q']); } while (ai === gi && aAt === gAt);
  const val = acute[gi] ? th : 180 - th, ans = acute[ai] ? th : 180 - th;
  // transversal runs from (90,239) to (290,5); P and Q are where it crosses y = 70 and y = 180
  const T0 = [90, 239], T1 = [290, 5], len = Math.hypot(T1[0] - T0[0], T1[1] - T0[1]), u = [(T1[0] - T0[0]) / len, (T1[1] - T0[1]) / len];
  const cross = (y) => [T0[0] + ((T0[1] - y) / (T0[1] - T1[1])) * (T1[0] - T0[0]), y];
  const P = cross(70), Q = cross(180);
  const off = (k) => { const v = { tr: [u[0] + 1, u[1]], tl: [u[0] - 1, u[1]], bl: [-u[0] - 1, -u[1]], br: [-u[0] + 1, -u[1]] }[k]; const n = Math.hypot(...v); return [(v[0] / n) * 32, (v[1] / n) * 32 + 5]; };
  const at = (pt, k, s) => { const o = off(k); return txt(pt[0] + o[0], pt[1] + o[1], s, 'middle', 'lbl'); };
  const g = line(30, 70, 410, 70, 'ln2') + line(30, 180, 410, 180, 'ln2') + line(90, 239, 290, 5, 'ln2')
    + txt(418, 74, 'ℓ', 'start', 'pt-l') + txt(418, 184, 'm', 'start', 'pt-l')
    + at(gAt === 'P' ? P : Q, gi, `${val}°`) + at(aAt === 'P' ? P : Q, ai, 'x°');
  const fig = svg(440, 245, g, 'Two parallel lines cut by a transversal') + NOTE;
  const same = acute[gi] === acute[ai];
  return ask(X, {
    topic: 'Geometry', skill: 'Lines and angles', diff: 2,
    q: `${fig}In the figure above, lines ${M('\\ell')} and ${M('m')} are parallel. What is the value of ${M('x')}?`,
    ans, wrongs: [same ? 180 - val : val, 90, 180 - ans + 10, Math.abs(90 - val) || 45, ans + 10],
    expl: `When a transversal crosses two parallel lines, it makes only two different angle measures: four acute angles that are all equal, and four obtuse angles that are all equal. An acute and an obtuse angle add to 180°. Here the marked ${val}° angle is ${acute[gi] ? 'acute' : 'obtuse'} and ${M('x')} is ${acute[ai] ? 'acute' : 'obtuse'}, so ${same ? `${M(`x = ${val}`)}` : `${M(`x = 180 - ${val} = ${ans}`)}`}.`,
  });
}

function hRightFig(X) {
  const [p, q, h] = pick(TRIPLES.slice(0, 4)), s = pick([1, 2, 3]);
  const A = p * s, B = q * s, H = h * s;
  const C = [70, 210], Bv = [70, 40], Av = [380, 210];
  const altitude = rf() < 0.5;
  let g = `<polygon points="${C.join(',')} ${Bv.join(',')} ${Av.join(',')}" class="shape"/>` + `<polyline points="70,192 88,192 88,210" class="ra"/>`
    + txt(58, 228, 'C', 'middle', 'pt-l') + txt(60, 34, 'B', 'middle', 'pt-l') + txt(394, 226, 'A', 'middle', 'pt-l');
  if (altitude) {
    // foot of the altitude from C onto AB
    const dx = Av[0] - Bv[0], dy = Av[1] - Bv[1], t = ((C[0] - Bv[0]) * dx + (C[1] - Bv[1]) * dy) / (dx * dx + dy * dy), D = [Bv[0] + t * dx, Bv[1] + t * dy];
    g += line(C[0], C[1], D[0], D[1], 'dash') + txt(D[0] + 10, D[1] - 6, 'D', 'start', 'pt-l') + txt(52, 130, B, 'end', 'lbl') + txt(225, 232, A, 'middle', 'lbl');
    const fig = svg(440, 245, g, 'Right triangle with altitude CD') + NOTE;
    const ansN = A * B, ansD = H;
    return ask(X, {
      topic: 'Geometry', skill: 'Right triangles', diff: 3, numAns: rnd(ansN / ansD, 6), ansText: frt(ansN, ansD),
      q: `${fig}In right triangle ${M('ABC')} above, ${M('CD')} is perpendicular to ${M('AB')}, ${M(`BC = ${B}`)}, and ${M(`AC = ${A}`)}. What is the length of ${M('CD')}?`,
      ans: M(fr(ansN, ansD)), wrongs: [M(fr(A * B, 2 * H)), M(fr(A * B, A + B)), M(fr(H, 2)), M(String(Math.min(A, B))), M(fr(A * B * 2, H))],
      expl: `First ${M(`AB = \\sqrt{${A}^2 + ${B}^2} = ${H}`)}. The area can be computed two ways: ${M(`\\frac{1}{2}(${A})(${B}) = \\frac{1}{2}(${H})(CD)`)}. So ${M(`CD = \\frac{${A} \\cdot ${B}}{${H}} = ${fr(ansN, ansD)}`)}.`,
    });
  }
  g += txt(52, 130, B, 'end', 'lbl') + txt(232, 116, H, 'start', 'lbl');
  const fig = svg(440, 245, g, 'Right triangle ABC');
  const v = pick(['side', 'area', 'perim']);
  const ans = v === 'side' ? A : v === 'area' ? (A * B) / 2 : A + B + H;
  return ask(X, {
    topic: 'Geometry', skill: 'Right triangles', diff: 2,
    q: `${fig}In right triangle ${M('ABC')} above, ${M(`BC = ${B}`)} and ${M(`AB = ${H}`)}. What is ${v === 'side' ? `the length of ${M('AC')}` : v === 'area' ? 'the area of the triangle' : 'the perimeter of the triangle'}?`,
    ans, wrongs: v === 'side' ? [H - B, rnd(Math.sqrt(H * H + B * B), 2), A + s, (H + B) / 2] : v === 'area' ? [A * B, (B * H) / 2, (A * H) / 2, A + B + H] : [B + H, 2 * (B + H), A + B, (A * B) / 2],
    expl: `${M(`AC = \\sqrt{${H}^2 - ${B}^2} = \\sqrt{${H * H - B * B}} = ${A}`)}.${v === 'area' ? ` Area ${M(`= \\frac{1}{2}(${A})(${B}) = ${(A * B) / 2}`)}.` : v === 'perim' ? ` Perimeter ${M(`= ${A} + ${B} + ${H} = ${A + B + H}`)}.` : ''}`,
  });
}

function hCircleFig(X) {
  const th = pick([40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140]);
  const cx = 160, cy = 130, r = 95, pt = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  const A = pt(150), B = pt(150 - Math.min(th, 120)), Cp = pt(270);
  const mid = ((150 + 150 - Math.min(th, 120)) / 2) * (Math.PI / 180);
  const v = pick(['inscribed', 'central', 'arc']);
  let g = `<circle cx="${cx}" cy="${cy}" r="${r}" class="shape"/>` + line(cx, cy, A[0], A[1]) + line(cx, cy, B[0], B[1]) + `<circle cx="${cx}" cy="${cy}" r="3" class="dot"/>`
    + txt(cx + 4, cy + 18, 'O', 'middle', 'pt-l') + txt(A[0] - 12, A[1] - 6, 'A', 'middle', 'pt-l') + txt(B[0] + 12, B[1] - 6, 'B', 'middle', 'pt-l');
  if (v !== 'arc') g += line(Cp[0], Cp[1], A[0], A[1]) + line(Cp[0], Cp[1], B[0], B[1]) + txt(Cp[0], Cp[1] + 20, 'C', 'middle', 'pt-l');
  const thLab = v === 'central' ? 'y°' : `${th}°`;
  g += `<text x="${f1(cx + 30 * Math.cos(mid))}" y="${f1(cy - 30 * Math.sin(mid) + 4)}" text-anchor="middle" class="lbl">${thLab}</text>`;
  if (v !== 'arc') g += txt(Cp[0], Cp[1] - 26, v === 'inscribed' ? 'x°' : `${th / 2}°`, 'middle', 'lbl');
  if (v === 'arc') { const rr = ri(3, 12); g += txt((cx + A[0]) / 2 - 10, (cy + A[1]) / 2 + 14, rr, 'middle', 'lbl');
    const fig = svg(330, 260, g, 'Circle with center O and central angle AOB') + NOTE;
    return ask(X, {
      topic: 'Geometry', skill: 'Arcs and sectors', diff: 2, numeric: false,
      q: `${fig}In the circle above with center ${M('O')} and radius ${rr}, what is the length of minor arc ${M('AB')}?`,
      ans: M(piStr(th * 2 * rr, 360)), wrongs: [M(piStr(th * rr * rr, 360)), M(piStr(th * rr, 360)), M(piStr(2 * rr)), M(piStr((360 - th) * 2 * rr, 360)), M(piStr(th, 180))],
      expl: `Arc length ${M(`= \\frac{${th}}{360} \\times 2\\pi(${rr}) = ${piStr(th * 2 * rr, 360)}`)}.`,
    });
  }
  const fig = svg(330, 260, g, 'Circle with central angle AOB and inscribed angle ACB') + NOTE;
  if (v === 'inscribed') return ask(X, {
    topic: 'Geometry', skill: 'Circles', diff: 3,
    q: `${fig}In the figure above, ${M('O')} is the center of the circle and ${M('C')} lies on the circle. What is the value of ${M('x')}?`,
    ans: th / 2, wrongs: [th, 180 - th, 90 - th / 2, 2 * th, 360 - th],
    expl: `An inscribed angle is half the central angle that intercepts the same arc. ${M(`\\angle ACB = \\frac{1}{2}\\angle AOB = \\frac{${th}}{2} = ${th / 2}`)}.`,
  });
  return ask(X, {
    topic: 'Geometry', skill: 'Circles', diff: 3,
    q: `${fig}In the figure above, ${M('O')} is the center of the circle and ${M('C')} lies on the circle. What is the value of ${M('y')}?`,
    ans: th, wrongs: [th / 2, 180 - th / 2, 90 + th / 2, 360 - th, 180 - th],
    expl: `The central angle is twice the inscribed angle that intercepts the same arc: ${M(`y = 2 \\times ${th / 2} = ${th}`)}.`,
  });
}

function hShadedFig(X) {
  const w = ri(4, 16), h = ri(3, 12), x0 = 60, y0 = 40, W = 300, H = 160;
  const ex = x0 + W * (ri(25, 75) / 100);
  const v = pick(['unshaded', 'height', 'quarter']);
  let g = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="shape"/>`;
  if (v === 'quarter') {
    const mx = x0 + W / 2;
    g += `<polygon points="${x0},${y0 + H} ${x0},${y0} ${mx},${y0}" class="shade"/>` + line(x0, y0 + H, mx, y0);
    g += txt(x0 - 10, y0 + H + 18, 'A', 'middle', 'pt-l') + txt(x0 - 10, y0 - 6, 'D', 'middle', 'pt-l') + txt(mx, y0 - 8, 'E', 'middle', 'pt-l') + txt(x0 + W + 10, y0 - 6, 'C', 'middle', 'pt-l') + txt(x0 + W + 10, y0 + H + 18, 'B', 'middle', 'pt-l')
      + txt(x0 + W / 2, y0 + H + 22, w, 'middle', 'lbl') + txt(x0 + W + 14, y0 + H / 2 + 4, h, 'start', 'lbl');
    const fig = svg(420, 240, g, 'Rectangle ABCD with shaded triangle ADE');
    return ask(X, {
      topic: 'Geometry', skill: 'Area', diff: 2,
      q: `${fig}In rectangle ${M('ABCD')} above, ${M('E')} is the midpoint of side ${M('DC')}. What is the area of the shaded triangle ${M('ADE')}?`,
      ans: (w * h) / 4, wrongs: [(w * h) / 2, w * h, (w * h) / 8, ((w * h) * 3) / 4, (w + h) / 2],
      expl: `${M(`DE = \\frac{${w}}{2}`)} and ${M(`AD = ${h}`)}, and the angle at ${M('D')} is a right angle. Area ${M(`= \\frac{1}{2} \\cdot \\frac{${w}}{2} \\cdot ${h} = ${nm((w * h) / 4)}`)}, a quarter of the rectangle.`,
    });
  }
  g += `<polygon points="${x0},${y0 + H} ${x0 + W},${y0 + H} ${ex},${y0}" class="shade"/>` + line(x0, y0 + H, ex, y0) + line(x0 + W, y0 + H, ex, y0);
  g += txt(x0 - 10, y0 + H + 18, 'A', 'middle', 'pt-l') + txt(x0 + W + 10, y0 + H + 18, 'B', 'middle', 'pt-l') + txt(x0 + W + 10, y0 - 6, 'C', 'middle', 'pt-l') + txt(x0 - 10, y0 - 6, 'D', 'middle', 'pt-l') + txt(ex, y0 - 8, 'E', 'middle', 'pt-l');
  if (v === 'unshaded') {
    g += txt(x0 + W / 2, y0 + H + 22, w, 'middle', 'lbl') + txt(x0 + W + 14, y0 + H / 2 + 4, h, 'start', 'lbl');
    const fig = svg(420, 240, g, 'Rectangle ABCD with shaded triangle ABE');
    return ask(X, {
      topic: 'Geometry', skill: 'Area', diff: 2,
      q: `${fig}In the figure above, ${M('ABCD')} is a rectangle and ${M('E')} is a point on side ${M('DC')}. What is the total area of the unshaded regions?`,
      ans: (w * h) / 2, wrongs: [w * h, (w * h) / 4, w + h, (w * h) / 3, 2 * (w + h)],
      expl: `The shaded triangle has base ${M(`AB = ${w}`)} and height ${h} (the distance from ${M('E')} to ${M('AB')}), so its area is ${M(`\\frac{1}{2}(${w})(${h}) = ${nm((w * h) / 2)}`)}, half the rectangle, wherever ${M('E')} is on ${M('DC')}. The unshaded part is the other half: ${nm((w * h) / 2)}.`,
    });
  }
  const area = (w * h) / 2;
  g += txt(x0 + W / 2, y0 + H + 22, w, 'middle', 'lbl');
  const fig = svg(420, 240, g, 'Rectangle ABCD with shaded triangle ABE');
  return ask(X, {
    topic: 'Geometry', skill: 'Area', diff: 3,
    q: `${fig}In the figure above, ${M('ABCD')} is a rectangle, ${M('E')} lies on ${M('DC')}, and the area of the shaded triangle ${M('ABE')} is ${nm(area)}. What is the area of rectangle ${M('ABCD')}?`,
    ans: w * h, wrongs: [area, w * h * 2, h, w + h, area + w],
    expl: `The triangle and rectangle share the base ${M('AB')} and the same height, so the triangle is half the rectangle. Rectangle area ${M(`= 2 \\times ${nm(area)} = ${nm(w * h)}`)}.`,
  });
}

module.exports = { figureTemplates: { hBarQ, hLineQ, hPieQ, hTriFig, hParallelFig, hRightFig, hCircleFig, hShadedFig } };
