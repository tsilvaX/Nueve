import { INSTINCT_ASSESSMENT } from '../assessment/instinctAssessment';
import type { Instinct, InstinctProfile, InstinctResponse, InstinctScore } from '../types';

const INSTINCTS: Instinct[] = ['self-preservation', 'social', 'one-to-one'];

export function scoreInstinctResponses(responses: InstinctResponse[]): InstinctProfile {
  const byQuestion = new Map(responses.map((response) => [response.questionId, response.rating]));
  const scores: InstinctScore[] = INSTINCTS.map((instinct) => {
    const questions = INSTINCT_ASSESSMENT.questions.filter((question) => question.key.instinct === instinct);
    const minimum = questions.length;
    const maximum = questions.length * 5;
    const raw = questions.reduce((total, question) => {
      const rating = byQuestion.get(question.id) ?? 3;
      return total + (question.key.reverse ? 6 - rating : rating);
    }, 0);
    return { instinct, raw, minimum, maximum, normalized: (raw - minimum) / (maximum - minimum) };
  });
  const highest = Math.max(...scores.map((score) => score.normalized));

  return {
    assessmentId: INSTINCT_ASSESSMENT.id,
    assessmentVersion: INSTINCT_ASSESSMENT.version,
    responses,
    scores,
    dominantInstincts: scores.filter((score) => Math.abs(score.normalized - highest) < 0.0001).map((score) => score.instinct),
  };
}

