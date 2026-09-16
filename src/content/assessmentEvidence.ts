import type { EvidenceBand } from '../types';

export interface EvidenceBandDefinition {
  id: EvidenceBand;
  label: string;
  range: string;
  description: string;
  radius: [number, number];
}

/** OEPS contribution bands used only to explain the evidence behind a type score. */
export const EVIDENCE_BANDS: EvidenceBandDefinition[] = [
  {
    id: 'counter',
    label: 'Counter evidence',
    range: '1–2 contribution',
    description: 'Responses that contribute less strongly toward this type.',
    radius: [1.8, 2.45],
  },
  {
    id: 'neutral',
    label: 'Neutral evidence',
    range: '3 contribution',
    description: 'Responses at the midpoint of the documented scale.',
    radius: [1.15, 1.7],
  },
  {
    id: 'supporting',
    label: 'Supporting evidence',
    range: '4–5 contribution',
    description: 'Responses that contribute more strongly toward this type.',
    radius: [0.38, 1.05],
  },
];

export function getEvidenceBand(value: number): EvidenceBand {
  if (value <= 2) return 'counter';
  if (value === 3) return 'neutral';
  return 'supporting';
}

export function getEvidenceBandDefinition(id: EvidenceBand) {
  return EVIDENCE_BANDS.find((band) => band.id === id)!;
}
