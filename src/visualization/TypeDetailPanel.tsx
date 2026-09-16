import { X } from 'lucide-react';
import { TYPE_REGIONS } from '../assessment/oeps';
import { INSTINCT_REGIONS } from '../content/instincts';
import { getOrbTrait } from '../content/orbTraits';
import { getSubtype } from '../content/subtypes';
import { TYPE_PROFILES } from '../content/typeProfiles';
import type { EnneagramType, Rating, ResultProfile } from '../types';

export function TypeDetailPanel({ profile, type, onClose }: { profile: ResultProfile; type: EnneagramType | null; onClose: () => void }) {
  if (!type) return null;
  const content = TYPE_PROFILES[type];
  const region = TYPE_REGIONS[type - 1];
  const score = profile.scores.find((item) => item.type === type)!;
  const highest = profile.scores.reduce((current, item) => item.normalized > current.normalized ? item : current, profile.scores[0]);
  const gap = highest.normalized - score.normalized;
  const dominantInstinct = profile.instinctProfile?.dominantInstincts[0];
  const subtype = dominantInstinct ? getSubtype(type, dominantInstinct) : undefined;
  const instinctLabel = INSTINCT_REGIONS.find((item) => item.id === dominantInstinct)?.label;
  const responses = new Map(profile.responses.map((response) => [response.questionId, response.rating]));
  const manifestations = profile.points
    .filter((point) => point.type === type)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((point) => getOrbTrait(point.questionId, responses.get(point.questionId) as Rating));

  return (
    <aside className="type-detail" aria-label={`Detailed information for Type ${type}`}>
      <button className="type-detail__close" onClick={onClose} aria-label="Close type details"><X size={18} /></button>
      <header>
        <p className="eyebrow">{gap < 0.0001 ? 'Your strongest result' : gap <= 0.035 ? 'Very close secondary result' : `Rank ${score.rank} in your results`}</p>
        <span>{type}</span>
        <div><h2>{region.name}</h2><p>{Math.round(score.normalized * 100)}% OEPS signal</p></div>
      </header>
      <section><p className="eyebrow">Overview</p><p>{content.overview}</p></section>
      <div className="type-detail__pair">
        <section><p className="eyebrow">Core motivation</p><p>{content.motivation}</p></section>
        <section><p className="eyebrow">Common concerns</p><p>{content.concerns}</p></section>
      </div>
      <section><p className="eyebrow">Strengths</p><ul>{content.strengths.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><p className="eyebrow">Recurring patterns</p><ul>{content.patterns.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><p className="eyebrow">How this appeared in your answers</p><ul>{manifestations.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <div className="type-detail__pair">
        <section><p className="eyebrow">Potential blind spot</p><p>{content.blindSpots}</p></section>
        <section><p className="eyebrow">Under stress</p><p>{content.stress}</p></section>
      </div>
      <section><p className="eyebrow">Growth direction</p><p>{content.growth}</p></section>
      <section><p className="eyebrow">In relationships</p><p>{content.relationships}</p></section>
      {subtype && (
        <section className="type-detail__subtype">
          <p className="eyebrow">Your likely subtype · {instinctLabel}</p>
          <h3>{subtype.code} · {subtype.displayName}</h3>
          <p>{subtype.summary}</p>
          <dl>
            <div><dt>Tendencies</dt><dd>{subtype.tendencies}</dd></div>
            <div><dt>Strengths</dt><dd>{subtype.strengths}</dd></div>
            <div><dt>Tensions</dt><dd>{subtype.tensions}</dd></div>
            <div><dt>Relation to Type {type}</dt><dd>{subtype.relationshipToType}</dd></div>
          </dl>
        </section>
      )}
      <p className="type-detail__note">These patterns describe how your responses leaned; they are prompts for reflection, not a diagnosis or fixed identity.</p>
    </aside>
  );
}

