import { describe, expect, it } from 'vitest';
import { OEPS } from '../assessment/oeps';
import { INSTINCT_REGIONS } from '../content/instincts';
import type { Rating } from '../types';
import { scoreResponses } from './scoreAssessment';

describe('OEPS v2 scoring', () => {
  it('contains the 54 questions present in the official v2 scoring form', () => {
    expect(OEPS.questions).toHaveLength(54);
    expect(OEPS.questions.map((question) => question.id)).toEqual(Array.from({ length: 54 }, (_, index) => index + 1));
  });

  it('scores a neutral response at the midpoint for every type', () => {
    const profile = scoreResponses(OEPS.questions.map((question) => ({ questionId: question.id, rating: 3 as Rating })));
    profile.scores.forEach((score) => expect(score.normalized).toBeCloseTo(0.5));
  });

  it('applies reverse keys exactly as 6 minus the rating', () => {
    const responses = OEPS.questions.map((question) => ({ questionId: question.id, rating: 3 as Rating }));
    responses[36].rating = 5;
    const profile = scoreResponses(responses);
    const type6 = profile.scores.find((score) => score.type === 6)!;
    const type8 = profile.scores.find((score) => score.type === 8)!;
    expect(type6.raw).toBeGreaterThan(type8.raw);
    expect(profile.points.find((point) => point.id === 'q37-t8')?.value).toBe(1);
  });

  it('builds one traceable visualization point per scoring contribution', () => {
    const profile = scoreResponses(OEPS.questions.map((question) => ({ questionId: question.id, rating: 4 as Rating })));
    const contributionCount = OEPS.questions.reduce((total, question) => total + question.keys.length, 0);
    expect(profile.points).toHaveLength(contributionCount);
    expect(profile.points.every((point) => point.questionId > 0 && point.label.length > 0)).toBe(true);
    expect(profile.points.every((point) => ['counter', 'neutral', 'supporting'].includes(point.evidenceBand))).toBe(true);
    expect(profile.instinctProfile).toBeUndefined();
  });

  it('maps contribution values into evidence bands without fabricating instincts', () => {
    const ratings = [1, 2, 3, 4, 5] as Rating[];
    ratings.forEach((rating) => {
      const profile = scoreResponses(OEPS.questions.map((question) => ({ questionId: question.id, rating })));
      const expected = rating <= 2 ? 'counter' : rating === 3 ? 'neutral' : 'supporting';
      expect(profile.points.find((point) => point.id === 'q1-t1')?.evidenceBand).toBe(expected);
      expect(profile.instinctProfile).toBeUndefined();
    });
  });

  it('reserves all three instinct regions without assigning OEPS data to them', () => {
    expect(INSTINCT_REGIONS.map((region) => region.id)).toEqual([
      'self-preservation',
      'social',
      'one-to-one',
    ]);
    const profile = scoreResponses(OEPS.questions.map((question) => ({ questionId: question.id, rating: 3 as Rating })));
    expect(profile.instinctProfile).toBeUndefined();
    expect(profile.points.every((point) => !('instinct' in point))).toBe(true);
  });
});
