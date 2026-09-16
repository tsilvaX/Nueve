# Nueve - Personality Constellation

Nueve is a complete greenfield prototype that turns an Open Enneagram of Personality Scales (OEPS) result into an explorable data-art landscape. The visualization is the primary result: nine large environmental regions hold one traceable light for every scored contribution, with pan, inertial zoom, touch gestures, zoom-dependent detail, and an accessible conventional summary.

## Run locally

```bash
npm install
npm run dev
```

Production and verification:

```bash
npm test
npm run build
npm run preview
```

## Architecture

- `src/assessment/` - assessment content and questionnaire presentation
- `src/scoring/` - pure scoring, normalization, visualization-model generation, and tests
- `src/visualization/` - React Three Fiber world, camera controls, GPU point fields, and zoom-level interaction
- `src/results/` - accessible score summary and local persistence
- `src/export/` - purpose-built 1800×1800 image export and PDF report
- `src/components/` - shared interface components and source/methodology disclosure
- `src/types.ts` - replaceable contracts for OEPS scores/evidence and a separate optional future `InstinctAssessmentProfile`

The visualization consumes a normalized `ResultProfile`; it does not read questionnaire state. That boundary allows a later licensed instrument to replace or extend OEPS without rewriting the world.

## Data integrity and visualization meaning

Each light is a documented scoring contribution:

- region = the Enneagram type to which the item is keyed
- evidence band = counter (1–2), neutral (3), or supporting (4–5) contribution
- brightness, glow, and focused-view size = contribution strength
- deterministic radial placement = visual separation only
- layer = original OEPS item or 2026 expansion

Counter, neutral, and supporting are evidence bands, not Enneagram subtypes. At close zoom, a light exposes its question, contribution, evidence band, source layer, and whether the official reverse key (`6 − response`) was applied.

The three close-zoom territories—Self-Preservation, Social, and Sexual / One-to-One—are deliberately unscored placeholders. OEPS points are not assigned to them. A later independent questionnaire can populate the optional instinct profile with three scores and combine its dominant instinct with an OEPS type, without changing OEPS scoring or fabricating any of the 27 possible combinations today. Nueve does **not** infer wings, instincts, tritypes, clinical traits, or any dimension the selected assessment does not score.

## Assessment source, license, and changes

Assessment items and scoring are adapted from the **OSPP Enneagram of Personality Scales v2.0**, developed by Eric Jorgenson / the [Open-Source Psychometrics Project](https://openpsychometrics.org/tests/OEPS/development/). Open Psychometrics publishes its site material under [Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/) (CC BY-NC-SA 4.0). The adapted assessment content in `src/assessment/oeps.ts` is therefore offered under the same license.

Changes made by Nueve:

- presents one item at a time instead of a printable table;
- preserves the official item order, wording, 1–5 response direction, and scoring keys;
- normalizes each raw type score between its possible minimum and maximum for visual comparison;
- adds a deterministic visualization layer and explanatory metadata;
- does not submit responses to Open Psychometrics or any other server.

### 54 versus 57 item discrepancy

The official documentation page updated January 18, 2026 says the expansion contains 57 items, while the linked official `OSPP-Enneagram-of-Personality-Scales-v2.odt` contains Q1–Q54 and its scoring instructions reference only Q1–Q54. The live OEPS introduction likewise describes 54 statements. This implementation follows the downloadable v2 instrument and its scoring sheet: 36 original statements plus 18 expansion items.

## Important limitation

OEPS is an educational, self-report matching instrument, not a clinical measure. Its own developer notes limited psychometric reliability and validity. Results should be treated as prompts for reflection rather than fixed identities or professional advice.

> This experience is intended for education and self-reflection and is not a clinical psychological assessment or diagnosis.

## Dependencies

- React + TypeScript + Vite -> application foundation and fast static build
- Three.js + React Three Fiber + Drei -> GPU-rendered spatial world, point field, orthographic camera, and gesture controls
- jsPDF -> downloadable report; loaded only when PDF export is requested
- Lucide React -> consistent accessible control icons
- Vitest -> scoring and data-integrity tests

UI transitions use CSS because they do not need a motion runtime. Camera damping, zoom-responsive light sizing, parallax dust, and a three-object comet pool stay inside the render loop. The first distant streak appears after roughly 7–16 seconds; later events use randomized 32–90 second gaps. Reduced-motion preferences remove drift, streaks, and spatial entrances while preserving short fades that explain state changes.

## Prototype boundaries

- Local storage holds only the latest completed result; there is no account or cloud sync.
- The share image is a purpose-built composition of the full horizontal landscape, not a WebGL framebuffer screenshot.
- Rendering quality is capped at 1.75× device pixel ratio to protect GPU performance.
- A future iteration could add deeper automatic quality scaling, server-backed share links, and user-supplied validated assessments for additional layers.
