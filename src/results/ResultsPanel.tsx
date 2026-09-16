import { X } from 'lucide-react';
import { OEPS, TYPE_REGIONS } from '../assessment/oeps';
import { INSTINCT_REGIONS } from '../content/instincts';
import { getSubtype } from '../content/subtypes';
import type { EnneagramType, ResultProfile } from '../types';

interface ResultsPanelProps {
  profile: ResultProfile;
  open: boolean;
  onClose: () => void;
  onFocusType: (type: EnneagramType) => void;
  onRetake: () => void;
  onDemo: () => void;
}

export function ResultsPanel({ profile, open, onClose, onFocusType, onRetake, onDemo }: ResultsPanelProps) {
  const ordered = [...profile.scores].sort((a, b) => b.normalized - a.normalized);
  const topType = ordered[0];
  const secondType = ordered[1];
  const closeResult = topType.normalized - secondType.normalized <= 0.035;
  const exactTie = profile.dominantTypes.length > 1;
  const dominantNames = profile.dominantTypes.map((type) => TYPE_REGIONS[type - 1].name).join(' + ');
  const instinctScores = [...(profile.instinctProfile?.scores ?? [])].sort((a, b) => b.normalized - a.normalized);
  const dominantInstinct = profile.instinctProfile?.dominantInstincts[0];
  const instinctName = INSTINCT_REGIONS.find((item) => item.id === dominantInstinct)?.label;
  const likelySubtypes = dominantInstinct ? profile.dominantTypes.map((type) => getSubtype(type, dominantInstinct)).filter(Boolean) : [];

  return (
    <aside className={`results-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="results-panel__head">
        <div><p className="eyebrow">Your full landscape</p><h2>{dominantNames}</h2></div>
        <button onClick={onClose} aria-label="Close results"><X size={19} /></button>
      </div>
      <p className="results-panel__intro">
        {exactTie ? `Your strongest results are Types ${profile.dominantTypes.join(' and ')}, with no scoring gap between them` : `Your strongest result is Type ${topType.type}${closeResult ? `, with Type ${secondType.type} very close behind` : ''}`}. This is a reflection prompt, not a fixed label.
      </p>
      {likelySubtypes.length > 0 && (
        <div className="result-equation">
          <span><small>{exactTie ? 'Co-leading types' : 'Strongest type'}</small><strong>{profile.dominantTypes.join(' + ')}</strong></span>
          <i>+</i>
          <span><small>Dominant instinct</small><strong>{instinctName}</strong></span>
          <i>=</i>
          <span><small>{exactTie ? 'Likely subtype possibilities' : 'Likely subtype'}</small><strong>{likelySubtypes.map((item) => item!.code).join(' / ')}</strong></span>
        </div>
      )}
      <p className="eyebrow results-panel__section-title">Core type results</p>
      <div className="score-list" aria-label="Scores for all nine Enneagram types">
        {ordered.map((score) => {
          const region = TYPE_REGIONS[score.type - 1];
          return (
            <button key={score.type} onClick={() => onFocusType(score.type)}>
              <span className="score-list__number">{score.type}</span>
              <span className="score-list__name">{region.shortName}</span>
              <i><b style={{ transform: `scaleX(${score.normalized})` }} /></i>
              <strong>{Math.round(score.normalized * 100)}</strong>
            </button>
          );
        })}
      </div>
      {instinctScores.length > 0 && (
        <>
          <p className="eyebrow results-panel__section-title">Instinct results</p>
          <div className="instinct-score-list" aria-label="Scores for all three instincts">
            {instinctScores.map((score) => (
              <div key={score.instinct}>
                <span>{INSTINCT_REGIONS.find((item) => item.id === score.instinct)?.label}</span>
                <i><b style={{ transform: `scaleX(${score.normalized})` }} /></i>
                <strong>{Math.round(score.normalized * 100)}</strong>
              </div>
            ))}
          </div>
        </>
      )}
      <section className="results-panel__method">
        <p className="eyebrow">What this measures</p>
        <p>Core scores use the documented OEPS v2 additive and reverse-key formula. The original Nueve instinct reflection normalizes nine items per instinct. It is experimental and educational, not clinically validated.</p>
        <a href={OEPS.sourceUrl} target="_blank" rel="noreferrer">Open the official OEPS source ↗</a>
      </section>
      <div className="results-panel__footer">
        <button className="secondary-button" onClick={onRetake}>Retake assessment</button>
        <button className="text-button" onClick={onDemo}>Load another demo</button>
      </div>
    </aside>
  );
}
