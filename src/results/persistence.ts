import type { ResultProfile } from '../types';
import { scoreResponses } from '../scoring/scoreAssessment';

const STORAGE_KEY = 'nueve:last-result:v1';

export function saveResult(profile: ResultProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // The experience remains fully usable when storage is unavailable.
  }
}

export function loadResult(): ResultProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const profile = JSON.parse(stored) as ResultProfile;
    if (!profile.assessmentId || !Array.isArray(profile.scores)) return null;
    if (profile.points?.some((point) => !point.evidenceBand) && Array.isArray(profile.responses)) {
      return scoreResponses(profile.responses, { id: profile.id, createdAt: profile.createdAt });
    }
    return profile;
  } catch {
    return null;
  }
}
