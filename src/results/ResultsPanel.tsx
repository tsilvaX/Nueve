import { X } from 'lucide-react';
import { OEPS, TYPE_REGIONS } from '../assessment/oeps';
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
  const dominantNames = profile.dominantTypes.map((type) => TYPE_REGIONS[type - 1].name).join(' + ');
  return (
    <aside className={`results-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="results-panel__head">
        <div><p className="eyebrow">Signal summary</p><h2>{dominantNames}</h2></div>
        <button onClick={onClose} aria-label="Close results"><X size={19} /></button>
      </div>
      <p className="results-panel__intro">
        Your strongest OEPS score is a starting point for reflection, not a fixed label. Nearby scores can be just as useful to explore.
      </p>
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
      <section className="results-panel__method">
        <p className="eyebrow">What this measures</p>
        <p>
          Scores use the documented OEPS v2 additive and reverse-key formula. Lights represent individual scored contributions; no wings, instincts, or tritypes are inferred.
        </p>
        <a href={OEPS.sourceUrl} target="_blank" rel="noreferrer">Open the official source ↗</a>
      </section>
      <div className="results-panel__footer">
        <button className="secondary-button" onClick={onRetake}>Retake assessment</button>
        <button className="text-button" onClick={onDemo}>Load another demo</button>
      </div>
    </aside>
  );
}
