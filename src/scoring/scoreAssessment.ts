import { OEPS, TYPE_REGIONS } from '../assessment/oeps';
import { getEvidenceBand, getEvidenceBandDefinition } from '../content/assessmentEvidence';
import type { EnneagramType, Rating, Response, ResultProfile, TypeScore, VisualizationPoint } from '../types';

const seeded = (seed: number) => {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
};

const questionLabel = (questionId: number) => {
  const question = OEPS.questions[questionId - 1];
  return question.format === 'statement'
    ? question.prompt!
    : `${question.leftLabel} ↔ ${question.rightLabel}`;
};

export function scoreResponses(responses: Response[], options?: { id?: string; createdAt?: string }): ResultProfile {
  const responseMap = new Map(responses.map((response) => [response.questionId, response.rating]));
  const rawScores = new Map<EnneagramType, number>();
  const maximums = new Map<EnneagramType, number>();
  const points: VisualizationPoint[] = [];

  TYPE_REGIONS.forEach(({ type }) => {
    rawScores.set(type, 0);
    maximums.set(type, 0);
  });

  OEPS.questions.forEach((question) => {
    const rating = responseMap.get(question.id);
    if (!rating) return;
    question.keys.forEach((key, keyIndex) => {
      const contribution = key.reverse ? 6 - rating : rating;
      rawScores.set(key.type, (rawScores.get(key.type) ?? 0) + contribution);
      maximums.set(key.type, (maximums.get(key.type) ?? 0) + 5);
      const region = TYPE_REGIONS[key.type - 1];
      const evidenceBand = getEvidenceBand(contribution);
      const evidenceDefinition = getEvidenceBandDefinition(evidenceBand);
      const seed = question.id * 17 + key.type * 113 + keyIndex;
      const angle = seeded(seed) * Math.PI * 2;
      const radius = evidenceDefinition.radius[0]
        + seeded(seed + 3) * (evidenceDefinition.radius[1] - evidenceDefinition.radius[0]);
      points.push({
        id: `q${question.id}-t${key.type}`,
        type: key.type,
        questionId: question.id,
        layer: question.sourceLayer,
        evidenceBand,
        value: contribution,
        normalized: (contribution - 1) / 4,
        reverse: Boolean(key.reverse),
        label: questionLabel(question.id),
        home: [
          region.position[0] + Math.cos(angle) * radius,
          region.position[1] + Math.sin(angle) * radius * 0.72,
          -0.4 + seeded(seed + 9) * 1.8,
        ],
        driftPhase: seeded(seed + 22) * Math.PI * 2,
      });
    });
  });

  const unsorted: Omit<TypeScore, 'rank'>[] = TYPE_REGIONS.map(({ type }) => {
    const raw = rawScores.get(type) ?? 0;
    const maximum = maximums.get(type) ?? 0;
    const minimum = maximum > 0 ? maximum / 5 : 0;
    return {
      type,
      raw,
      minimum,
      maximum,
      normalized: maximum > minimum ? (raw - minimum) / (maximum - minimum) : 0,
    };
  });
  const ordered = [...unsorted].sort((a, b) => b.normalized - a.normalized || a.type - b.type);
  const ranks = new Map(ordered.map((score, index) => [score.type, index + 1]));
  const scores = unsorted.map((score) => ({ ...score, rank: ranks.get(score.type)! }));
  const top = ordered[0]?.normalized ?? 0;
  const dominantTypes = ordered.filter((score) => Math.abs(score.normalized - top) < 0.0001).map((score) => score.type);

  return {
    id: options?.id ?? crypto.randomUUID(),
    createdAt: options?.createdAt ?? new Date().toISOString(),
    assessmentId: OEPS.id,
    assessmentVersion: OEPS.version,
    responses,
    scores,
    dominantTypes,
    points,
  };
}

export function createDemoProfile(kind: 'focused' | 'split' | 'broad' | 'dominant'): ResultProfile {
  const targets: Record<typeof kind, EnneagramType[]> = {
    focused: [5],
    split: [4, 5],
    broad: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    dominant: [8, 2, 5],
  };
  const target = targets[kind];
  const responses: Response[] = OEPS.questions.map((question) => {
    let desired = 3;
    question.keys.forEach((key) => {
      const weight = target.indexOf(key.type);
      if (weight === 0) desired = key.reverse ? 1 : 5;
      else if (weight > 0 && kind !== 'broad') desired = key.reverse ? 2 : 4;
    });
    if (kind === 'broad') desired = ((question.id * 7) % 5) + 1;
    return { questionId: question.id, rating: desired as Rating };
  });
  const labels = {
    focused: 'Focused signal · Type 5',
    split: 'Neighboring split · Types 4 + 5',
    broad: 'Broad distribution',
    dominant: 'Dominant Type 8 · secondary signals',
  };
  return { ...scoreResponses(responses), isDemo: true, demoLabel: labels[kind] };
}
