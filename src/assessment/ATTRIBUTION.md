# OEPS attribution

`oeps.ts` adapts the Open-Source Psychometrics Project’s **OSPP Enneagram of Personality Scales v2.0** by Eric Jorgenson.

- Official development documentation: https://openpsychometrics.org/tests/OEPS/development/
- License: CC BY-NC-SA 4.0 — https://creativecommons.org/licenses/by-nc-sa/4.0/
- Changes: reformatted as structured TypeScript data and a one-item-at-a-time interface; item order, wording, response direction, and the documented additive/reverse scoring keys are preserved. Raw scores are additionally normalized per scale for display.

The official v2 ODT contains 54 scored items even though one sentence on the development page says 57. This implementation follows the downloadable instrument and its Q1–Q54 scoring instructions.
