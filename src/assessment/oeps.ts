import type { Assessment, EnneagramType, Question, TypeRegion } from '../types';

const statementTexts = [
  'I strive for efficiency.',
  'My relationships with others are what my life is about.',
  'I put work first.',
  'I daydream about being in love.',
  'I have a hard time showing emotions.',
  'Fear of being taken advantage of keeps me from being more trusting.',
  'I must always be having new experiences.',
  'I naturally emerge as a leader.',
  'When other people are arguing, I leave the room.',
  'I am a perfectionist.',
  'I have difficulty saying no.',
  'I like to stand out.',
  'I really enjoy feeling bitter sweet.',
  'I spend hours alone with my hobbies.',
  'I get input from others before I make a decision.',
  'I can keep a conversation going with anyone about anything.',
  'I like a conversation where no one agrees.',
  'I keep my thoughts to myself, to prevent trouble.',
  'I often have to redo other peoples work.',
  'I get lots of satisfaction from helping others achieve their goals.',
  'It is good to wake up to a full day of planned activities.',
  'I cry.',
  'I spend most of my time trying to understand things.',
  'I conform.',
  'I am uninhibited.',
  'I want people to tell me the truth, not spare my feelings.',
  'I am very accepting and flexible.',
  'I keep my belongings in order.',
  'I put family first.',
  'Money is important to my happiness.',
  'I side with the rebels over the establishment.',
  'I like mental challenges.',
  'I am loyal.',
  'I always try to break the tension with a good joke.',
  'I prefer it when leaders are decisive.',
  'I avoid confrontation.',
] as const;

const bipolarPairs = [
  ['confident', 'insecure'],
  ['rational', 'whimsical'],
  ['unambitious', 'driven'],
  ['extrovert', 'introvert'],
  ['orderly', 'chaotic'],
  ['touchy-feely', 'distant'],
  ['wild', 'tame'],
  ['never cries', 'often crying'],
  ['harsh', 'gentle'],
  ['disorganized', 'self-disciplined'],
  ['poisonous', 'nurturing'],
  ['social climber', 'nonconformist'],
  ['stable', 'unstable'],
  ['people-person', 'things-person'],
  ['hopeful', 'fearful'],
  ['spontaneous', 'deliberate'],
  ['thick-skinned', 'sensitive'],
  ['neutral', 'opinionated'],
] as const;

const originalQuestions: Question[] = statementTexts.map((prompt, index) => ({
  id: index + 1,
  format: 'statement',
  prompt,
  keys: [{ type: ((index % 9) + 1) as EnneagramType }],
  sourceLayer: 'original scale',
}));

const expansionKeys: Question['keys'][] = [
  [{ type: 6 }, { type: 8, reverse: true }],
  [{ type: 4 }, { type: 1, reverse: true }],
  [{ type: 3 }, { type: 9, reverse: true }],
  [{ type: 6 }, { type: 3, reverse: true }],
  [{ type: 7 }, { type: 1, reverse: true }],
  [{ type: 5 }, { type: 2, reverse: true }],
  [{ type: 9 }, { type: 7, reverse: true }],
  [{ type: 4 }, { type: 5, reverse: true }],
  [{ type: 2 }, { type: 8, reverse: true }],
  [{ type: 1 }],
  [{ type: 2 }, { type: 7, reverse: true }],
  [{ type: 3, reverse: true }],
  [{ type: 4 }],
  [{ type: 5 }],
  [{ type: 6 }],
  [{ type: 7, reverse: true }],
  [{ type: 8, reverse: true }],
  [{ type: 9, reverse: true }],
];

const expansionQuestions: Question[] = bipolarPairs.map(([leftLabel, rightLabel], index) => ({
  id: index + 37,
  format: 'bipolar',
  leftLabel,
  rightLabel,
  keys: expansionKeys[index],
  sourceLayer: '2026 expansion',
}));

export const OEPS: Assessment = {
  id: 'ospp-oeps-v2',
  title: 'OSPP Enneagram of Personality Scales',
  version: '2.0 (54-item official scoring form)',
  sourceUrl: 'https://openpsychometrics.org/tests/OEPS/development/',
  license: 'CC BY-NC-SA 4.0',
  questions: [...originalQuestions, ...expansionQuestions],
};

export const TYPE_REGIONS: TypeRegion[] = [
  { type: 1, name: 'The Reformer', shortName: 'Reformer', premise: 'Wants to be good, right, and ethical.', fear: 'Fears being corrupt or defective.', description: 'A result associated with standards, responsibility, and an orientation toward what could be improved.', position: [-48, 1.2, 0], hue: '#e9d7b4' },
  { type: 2, name: 'The Helper', shortName: 'Helper', premise: 'Wants to be loved and needed.', fear: 'Fears being unwanted.', description: 'A result associated with connection, usefulness to others, and attention to relationships.', position: [-36, -1.1, 0], hue: '#efd0b1' },
  { type: 3, name: 'The Achiever', shortName: 'Achiever', premise: 'Wants to be successful and admired.', fear: 'Fears being worthless or unremarkable.', description: 'A result associated with achievement, effectiveness, and being recognized for contribution.', position: [-24, 0.4, 0], hue: '#e7c6a2' },
  { type: 4, name: 'The Individualist', shortName: 'Individualist', premise: 'Wants to be unique and true to themselves.', fear: 'Fears having no identity or significance.', description: 'A result associated with identity, personal meaning, and the expression of a distinct inner life.', position: [-12, -0.8, 0], hue: '#d9c7ba' },
  { type: 5, name: 'The Investigator', shortName: 'Investigator', premise: 'Wants to be capable and knowledgeable.', fear: 'Fears being incompetent or ineffective.', description: 'A result associated with understanding, capability, and conserving space for thought.', position: [0, 0.8, 0], hue: '#cad2c1' },
  { type: 6, name: 'The Loyalist', shortName: 'Loyalist', premise: 'Wants security and support.', fear: 'Fears being abandoned and unable to survive.', description: 'A result associated with security, loyalty, and scanning situations for what can be trusted.', position: [12, -0.5, 0], hue: '#c3d5c8' },
  { type: 7, name: 'The Enthusiast', shortName: 'Enthusiast', premise: 'Wants freedom and happiness.', fear: 'Fears being trapped in pain or deprivation.', description: 'A result associated with possibility, variety, and maintaining access to energizing options.', position: [24, 1.1, 0], hue: '#bed6cf' },
  { type: 8, name: 'The Challenger', shortName: 'Challenger', premise: 'Wants to be strong and in control.', fear: 'Fears being harmed or controlled by others.', description: 'A result associated with autonomy, directness, and a readiness to meet pressure with strength.', position: [36, -0.9, 0], hue: '#c4d2c7' },
  { type: 9, name: 'The Peacemaker', shortName: 'Peacemaker', premise: 'Wants inner stability and harmony.', fear: 'Fears conflict and disconnection.', description: 'A result associated with harmony, steadiness, and preserving connection across differences.', position: [48, 0.6, 0], hue: '#d5d7c0' },
];

export const SCALE_LABELS = ['Disagree', 'Slightly disagree', 'Neutral', 'Slightly agree', 'Agree'] as const;
