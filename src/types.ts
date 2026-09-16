export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Rating = 1 | 2 | 3 | 4 | 5;
export type EvidenceBand = 'counter' | 'neutral' | 'supporting';
export type Instinct = 'self-preservation' | 'social' | 'one-to-one';

export interface ScoreKey {
  type: EnneagramType;
  reverse?: boolean;
}

export interface Question {
  id: number;
  format: 'statement' | 'bipolar';
  prompt?: string;
  leftLabel?: string;
  rightLabel?: string;
  keys: ScoreKey[];
  sourceLayer: 'original scale' | '2026 expansion';
}

export interface Assessment {
  id: string;
  title: string;
  version: string;
  sourceUrl: string;
  license: string;
  questions: Question[];
}

export interface Response {
  questionId: number;
  rating: Rating;
}

export interface TypeScore {
  type: EnneagramType;
  raw: number;
  minimum: number;
  maximum: number;
  normalized: number;
  rank: number;
}

export interface VisualizationPoint {
  id: string;
  type: EnneagramType;
  questionId: number;
  layer: Question['sourceLayer'];
  evidenceBand: EvidenceBand;
  value: number;
  normalized: number;
  reverse: boolean;
  label: string;
  home: [number, number, number];
  driftPhase: number;
}

export interface InstinctScore {
  instinct: Instinct;
  raw: number;
  minimum: number;
  maximum: number;
  normalized: number;
}

export interface InstinctQuestion {
  id: number;
  prompt: string;
  key: {
    instinct: Instinct;
    reverse?: boolean;
  };
}

export interface InstinctResponse {
  questionId: number;
  rating: Rating;
}

/** Independent from OEPS: this profile is produced only by Part 2. */
export interface InstinctProfile {
  assessmentId: string;
  assessmentVersion: string;
  responses: InstinctResponse[];
  scores: InstinctScore[];
  dominantInstincts: Instinct[];
}

export interface SubtypeContent {
  code: string;
  type: EnneagramType;
  instinct: Instinct;
  displayName: string;
  summary: string;
  themes: string[];
  tendencies: string;
  strengths: string;
  tensions: string;
  relationshipToType: string;
}

export interface TypeContent {
  type: EnneagramType;
  overview: string;
  motivation: string;
  concerns: string;
  strengths: string[];
  patterns: string[];
  blindSpots: string;
  stress: string;
  growth: string;
  relationships: string;
}

export interface TypeRegion {
  type: EnneagramType;
  name: string;
  shortName: string;
  premise: string;
  fear: string;
  description: string;
  position: [number, number, number];
  hue: string;
}

export interface ResultProfile {
  id: string;
  createdAt: string;
  assessmentId: string;
  assessmentVersion: string;
  responses: Response[];
  scores: TypeScore[];
  dominantTypes: EnneagramType[];
  points: VisualizationPoint[];
  instinctProfile?: InstinctProfile;
  isDemo?: boolean;
  demoLabel?: string;
}
