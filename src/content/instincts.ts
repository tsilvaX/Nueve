import type { Instinct } from '../types';

export interface InstinctRegionDefinition {
  id: Instinct;
  label: string;
  shortLabel: string;
  offset: [number, number, number];
}

/** Spatial definitions only; scores come from the independent Part 2 assessment. */
export const INSTINCT_REGIONS: InstinctRegionDefinition[] = [
  {
    id: 'self-preservation',
    label: 'Self-Preservation',
    shortLabel: 'Self-Preservation',
    offset: [-3.05, -1.75, 0],
  },
  {
    id: 'social',
    label: 'Social',
    shortLabel: 'Social',
    offset: [0, 2.85, 0],
  },
  {
    id: 'one-to-one',
    label: 'Sexual / One-to-One',
    shortLabel: 'Sexual / One-to-One',
    offset: [3.05, -1.75, 0],
  },
];
