import type { Rating } from '../types';

interface OrbTraitCopy {
  low: string;
  balanced: string;
  high: string;
}

export const ORB_TRAITS: Record<number, OrbTraitCopy> = {
  1: { low: 'Efficiency does not appear to be a primary driver for you.', balanced: 'Your focus on efficiency seems to depend on the situation.', high: 'You tend to look for efficient ways to move things forward.' },
  2: { low: 'Relationships may be important without defining the center of your life.', balanced: 'You balance relationships with other sources of meaning.', high: 'Relationships appear to be a central source of meaning for you.' },
  3: { low: 'You tend not to place work ahead of everything else.', balanced: 'You seem to balance work with other priorities.', high: 'You often give work a leading place among your priorities.' },
  4: { low: 'Romantic possibility does not seem to occupy much of your imagination.', balanced: 'Romantic daydreaming may arise for you in certain contexts.', high: 'Your imagination often returns to romantic connection.' },
  5: { low: 'You seem relatively comfortable letting emotions show.', balanced: 'How openly you show emotion appears to depend on the setting.', high: 'You tend to keep visible emotion carefully contained.' },
  6: { low: 'Concern about being used does not strongly limit your trust.', balanced: 'Your trust seems to vary with the person and circumstances.', high: 'You tend to protect trust when there is a risk of being taken advantage of.' },
  7: { low: 'You do not seem to need a constant stream of new experiences.', balanced: 'You balance novelty with familiarity.', high: 'You are strongly drawn toward fresh experiences and possibilities.' },
  8: { low: 'You do not automatically move into the lead.', balanced: 'You may lead when the situation clearly calls for it.', high: 'You tend to step naturally into leadership.' },
  9: { low: 'You are fairly willing to remain present when others disagree.', balanced: 'Your response to others’ conflict seems context-dependent.', high: 'You tend to create distance when conflict breaks out around you.' },
  10: { low: 'Perfection is not usually the standard you require of yourself.', balanced: 'You apply exacting standards selectively.', high: 'You tend to hold yourself or your work to exacting standards.' },
  11: { low: 'You seem fairly able to decline requests when needed.', balanced: 'Saying no may be easy or difficult depending on the relationship.', high: 'You may find it difficult to say no when someone needs something.' },
  12: { low: 'Standing apart from the crowd does not seem especially important to you.', balanced: 'You sometimes enjoy distinction without always seeking it.', high: 'You tend to value being distinctive and noticeable.' },
  13: { low: 'Bittersweet feeling does not appear especially appealing to you.', balanced: 'You have a mixed relationship with bittersweet emotion.', high: 'You seem drawn to the depth of bittersweet emotional experiences.' },
  14: { low: 'You tend not to spend long stretches alone with private interests.', balanced: 'You balance solitary interests with other forms of engagement.', high: 'You readily become absorbed in solitary hobbies or interests.' },
  15: { low: 'You tend to rely on your own judgment before seeking input.', balanced: 'You combine your own judgment with selected outside input.', high: 'You often consult others before committing to a decision.' },
  16: { low: 'Keeping conversation moving with anyone may take deliberate effort.', balanced: 'Conversation comes easily in some settings more than others.', high: 'You tend to find conversational common ground with many kinds of people.' },
  17: { low: 'You generally prefer conversation with more agreement than friction.', balanced: 'You can appreciate disagreement when it remains constructive.', high: 'You are energized by candid conversation where views collide.' },
  18: { low: 'You are relatively willing to voice thoughts even when they may create friction.', balanced: 'You choose carefully which thoughts are worth voicing.', high: 'You often keep thoughts private to preserve the peace.' },
  19: { low: 'You can usually let other people’s work stand without redoing it.', balanced: 'You step in to revise others’ work only in some situations.', high: 'You often feel responsible for correcting or redoing work others leave imperfect.' },
  20: { low: 'Helping others reach their goals is not a major source of satisfaction for you.', balanced: 'You enjoy supporting others while balancing your own aims.', high: 'You gain real satisfaction from helping other people succeed.' },
  21: { low: 'A tightly planned day does not seem especially appealing to you.', balanced: 'You appreciate plans while leaving some room open.', high: 'You feel energized by a full day with clear activities ahead.' },
  22: { low: 'Crying does not seem to be a common way you express emotion.', balanced: 'Tears arise for you in particular emotional circumstances.', high: 'Tears appear to be an accessible form of emotional expression for you.' },
  23: { low: 'You do not tend to spend much of your time analyzing how things work.', balanced: 'You alternate between analysis and direct experience.', high: 'You devote substantial attention to understanding how things work.' },
  24: { low: 'You are more likely to resist fitting yourself to prevailing expectations.', balanced: 'You adapt to some conventions while questioning others.', high: 'You often adapt yourself to the expectations around you.' },
  25: { low: 'You tend to keep your expression measured rather than uninhibited.', balanced: 'How freely you express yourself depends on the setting.', high: 'You are generally comfortable expressing yourself without much restraint.' },
  26: { low: 'You may prefer tact over receiving the most direct version of the truth.', balanced: 'You value honesty while also considering how it is delivered.', high: 'You strongly prefer candid truth to being protected from discomfort.' },
  27: { low: 'You may hold firmer boundaries or preferences than people first expect.', balanced: 'Your flexibility changes with the stakes involved.', high: 'You tend to meet people and circumstances with acceptance and flexibility.' },
  28: { low: 'Keeping possessions orderly is not a strong priority for you.', balanced: 'You maintain order selectively rather than consistently.', high: 'You tend to keep your physical belongings organized.' },
  29: { low: 'Family does not automatically take priority over your other commitments.', balanced: 'You weigh family alongside other important responsibilities.', high: 'You tend to place family needs near the top of your priorities.' },
  30: { low: 'Money does not appear closely tied to your sense of happiness.', balanced: 'Financial resources matter to you without defining happiness.', high: 'Financial resources appear meaningfully connected to your sense of well-being.' },
  31: { low: 'You are not automatically drawn to the rebel side of a conflict.', balanced: 'You judge challengers and institutions case by case.', high: 'You tend to sympathize with people who challenge established power.' },
  32: { low: 'Mental challenge is not something you consistently seek for enjoyment.', balanced: 'You appreciate intellectual challenge in the right setting.', high: 'You are strongly energized by intellectual challenge.' },
  33: { low: 'Loyalty is something you extend selectively rather than by default.', balanced: 'Your loyalty depends on trust and circumstance.', high: 'You place strong value on staying loyal to people or commitments.' },
  34: { low: 'You do not usually use humor to soften tense moments.', balanced: 'You sometimes use humor when tension can safely be lightened.', high: 'You often use humor to release tension and reconnect people.' },
  35: { low: 'Decisiveness alone does not make a leader feel trustworthy to you.', balanced: 'You value decisiveness alongside other leadership qualities.', high: 'You tend to feel more secure with leaders who decide clearly.' },
  36: { low: 'You are relatively willing to face confrontation directly.', balanced: 'Whether you confront or withdraw depends on the stakes.', high: 'You generally prefer to avoid direct confrontation.' },
  37: { low: 'You located yourself closer to confidence than insecurity.', balanced: 'You placed yourself between confidence and insecurity.', high: 'You located yourself closer to insecurity than confidence.' },
  38: { low: 'You leaned toward a rational rather than whimsical style.', balanced: 'You described a balance of rationality and whimsy.', high: 'You leaned toward a whimsical rather than strictly rational style.' },
  39: { low: 'You placed yourself toward the less ambitious end of the scale.', balanced: 'Your ambition appears moderate or context-dependent.', high: 'You placed yourself toward the driven end of the scale.' },
  40: { low: 'You located yourself closer to an outwardly engaged style.', balanced: 'You described a middle ground between outward and inward engagement.', high: 'You located yourself closer to an inwardly oriented style.' },
  41: { low: 'You leaned toward order rather than chaos.', balanced: 'You described a mix of order and spontaneity.', high: 'You leaned toward a more chaotic than orderly style.' },
  42: { low: 'You described yourself as relatively physically or emotionally demonstrative.', balanced: 'Your interpersonal warmth seems measured and context-dependent.', high: 'You described yourself as relatively distant or reserved.' },
  43: { low: 'You located yourself nearer the wild end of the scale.', balanced: 'You described a balance between wildness and restraint.', high: 'You located yourself nearer the tame and restrained end of the scale.' },
  44: { low: 'You described tears as uncommon for you.', balanced: 'You placed yourself between rarely and often crying.', high: 'You described tears as a relatively frequent response.' },
  45: { low: 'You leaned toward a harsher, more forceful interpersonal style.', balanced: 'You described a balance of firmness and gentleness.', high: 'You leaned toward a gentler interpersonal style.' },
  46: { low: 'You placed yourself nearer the disorganized end of the scale.', balanced: 'Your self-discipline appears moderate or situational.', high: 'You placed yourself nearer the self-disciplined end of the scale.' },
  47: { low: 'You described a sharper rather than nurturing interpersonal edge.', balanced: 'You balance challenge with nurturance.', high: 'You described yourself as more nurturing than sharp-edged.' },
  48: { low: 'You leaned toward social advancement within existing structures.', balanced: 'You balance social positioning with independence from convention.', high: 'You leaned toward a nonconforming social stance.' },
  49: { low: 'You described your emotional footing as relatively stable.', balanced: 'You placed yourself between stability and instability.', high: 'You described your emotional footing as relatively changeable.' },
  50: { low: 'You leaned toward people and interpersonal engagement.', balanced: 'You balance interest in people with interest in things or systems.', high: 'You leaned toward things or systems more than interpersonal engagement.' },
  51: { low: 'You located yourself closer to hopefulness than fearfulness.', balanced: 'You described a balance between hope and apprehension.', high: 'You located yourself closer to fearfulness than hopefulness.' },
  52: { low: 'You leaned toward spontaneity and responding in the moment.', balanced: 'You balance spontaneity with deliberation.', high: 'You leaned toward a deliberate, considered pace.' },
  53: { low: 'You described yourself as relatively thick-skinned.', balanced: 'Your sensitivity appears moderate or context-dependent.', high: 'You described yourself as relatively sensitive.' },
  54: { low: 'You leaned toward neutrality rather than taking a strong position.', balanced: 'You choose when a subject merits a firm opinion.', high: 'You leaned toward having and expressing clear opinions.' },
};

export function getOrbTrait(questionId: number, rating: Rating) {
  const copy = ORB_TRAITS[questionId];
  if (!copy) return 'This response contributes a small piece of your overall pattern.';
  if (rating === 1) return `Your response leans strongly away from this pattern. ${copy.low}`;
  if (rating === 2) return copy.low;
  if (rating === 3) return copy.balanced;
  if (rating === 4) return copy.high;
  return `This appears to be a strong pattern for you. ${copy.high}`;
}
