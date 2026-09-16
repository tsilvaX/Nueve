import { describe, expect, it } from 'vitest';
import { INSTINCT_ASSESSMENT } from '../assessment/instinctAssessment';
import { ORB_TRAITS } from '../content/orbTraits';
import { SUBTYPES } from '../content/subtypes';
import type { Instinct, Rating } from '../types';
import { scoreInstinctResponses } from './scoreInstincts';

const responsesFor = (contribution: (instinct: Instinct) => number) => INSTINCT_ASSESSMENT.questions.map((question) => {
  const desired = contribution(question.key.instinct);
  return { questionId: question.id, rating: (question.key.reverse ? 6 - desired : desired) as Rating };
});

describe('Nueve instinct reflection', () => {
  it('contains 27 unique questions balanced across all three instincts', () => {
    expect(INSTINCT_ASSESSMENT.questions).toHaveLength(27);
    expect(new Set(INSTINCT_ASSESSMENT.questions.map((question) => question.id)).size).toBe(27);
    for (const instinct of ['self-preservation', 'social', 'one-to-one'] as Instinct[]) {
      expect(INSTINCT_ASSESSMENT.questions.filter((question) => question.key.instinct === instinct)).toHaveLength(9);
    }
    expect(INSTINCT_ASSESSMENT.questions.some((question) => question.key.reverse)).toBe(true);
  });

  it('normalizes a neutral profile to the midpoint', () => {
    const profile = scoreInstinctResponses(responsesFor(() => 3));
    profile.scores.forEach((score) => expect(score.normalized).toBeCloseTo(0.5));
    expect(profile.dominantInstincts).toHaveLength(3);
  });

  it('isolates reverse-key scoring and identifies the strongest instinct', () => {
    const profile = scoreInstinctResponses(responsesFor((instinct) => instinct === 'self-preservation' ? 5 : 1));
    expect(profile.scores.find((score) => score.instinct === 'self-preservation')?.normalized).toBe(1);
    expect(profile.scores.find((score) => score.instinct === 'social')?.normalized).toBe(0);
    expect(profile.dominantInstincts).toEqual(['self-preservation']);
  });

  it('contains one editable content record for every type-instinct combination', () => {
    expect(SUBTYPES).toHaveLength(27);
    expect(new Set(SUBTYPES.map((subtype) => subtype.code)).size).toBe(27);
    for (let type = 1; type <= 9; type += 1) {
      expect(SUBTYPES.filter((subtype) => subtype.type === type)).toHaveLength(3);
    }
    expect(SUBTYPES.every((subtype) => subtype.summary && subtype.strengths && subtype.tensions && subtype.relationshipToType)).toBe(true);
  });

  it('provides deterministic interpretation copy for every OEPS item', () => {
    expect(Object.keys(ORB_TRAITS)).toHaveLength(54);
    expect(Object.values(ORB_TRAITS).every((copy) => copy.low && copy.balanced && copy.high)).toBe(true);
  });
});

