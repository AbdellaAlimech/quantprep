# QuantPrep: GRE Quant & SAT Math practice

A free, static practice site with **1,913 GRE Quantitative** and **1,256 SAT Math** problems. Every problem has a step-by-step explanation.

**Live site:** https://abdellaalimech.github.io/quantprep/

## Features
- **Adaptive GRE mock test:** two sections (12 Q / 21 min, then 15 Q / 26 min); Section 2 gets harder or easier depending on Section 1, like the real exam; ends with an estimated 130–170 score and score history
- **Charts and figures:** 192 GRE questions with drawn bar charts, line graphs, pie charts and geometry figures (triangles, parallel lines, circles, shaded regions)
- **GRE-style calculator** in every GRE session, with memory, square root and Transfer Display
- **Spaced review:** missed questions come back after 1, 3 and 7 days; add a personal note to any question
- **Printable formula sheet** covering all 30 lessons
- **Backup and restore:** download your progress as a file and import it on another device
- **612 hard GRE questions** (multi-step word problems, tricky Quantitative Comparisons, combined geometry)
- **30-day GRE study plan (Learn):** one topic per day, with key ideas, a worked example, common traps and a set of 12 exercises; progress is tracked per day
- **GRE question formats:** Quantitative Comparison, multiple choice (5 options), select-all-that-apply, numeric entry
- **SAT question formats:** multiple choice (4 options) and student-produced responses (grid-ins)
- **Practice mode:** check each answer and read the worked solution right away
- **Timed sections:** GRE (12 Q / 21 min, 15 Q / 26 min) and SAT modules (22 Q / 35 min), with a question navigator and mark-for-review
- **Topic drills, review of missed questions, flagged questions, and a custom set builder** (filter by topic, difficulty, type and status)
- **Searchable question bank**
- **Progress tracking** by topic, a streak counter and an activity heatmap, saved in your browser (no account needed)
- Light and dark mode, keyboard shortcuts, works on phones

## How the problems are made
The problems come from parameterized templates in `tools/`. Each template computes the correct answer, builds distractors from common mistakes, and writes the explanation. The generator rejects broken items: duplicate choices, NaN values, or a wrong number of choices. Every math expression is also checked with KaTeX.

```bash
node tools/generate.js      # rebuilds data/gre.js and data/sat.js
```

Not affiliated with ETS or the College Board. GRE® and SAT® are registered trademarks of their respective owners.
