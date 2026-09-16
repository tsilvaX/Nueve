import { ArrowRight, Clock3, RotateCcw } from 'lucide-react';
import type { ResultProfile } from '../types';
import { AmbientField } from './AmbientField';
import { Brand } from './Brand';

interface LandingProps {
  savedResult: ResultProfile | null;
  onBegin: () => void;
  onResume: () => void;
  onDemo: () => void;
  onMethodology: () => void;
}
export function Landing({ savedResult, onBegin, onResume, onDemo, onMethodology }: LandingProps) {
  return (
    <main className="landing">
      <AmbientField />
      <div className="landing__halo" aria-hidden="true" />
      <header className="landing__header">
        <Brand />
        <button className="text-button" onClick={onMethodology}>Method & source</button>
      </header>

      <section className="landing__content" aria-labelledby="landing-title">
        <p className="eyebrow landing__eyebrow">An instrument for looking inward</p>
        <h1 id="landing-title">Your inner pattern,<br /><em>made navigable.</em></h1>
        <p className="landing__intro">
          Explore nine personality strategies and three instinctive priorities across two connected parts, then enter the luminous landscape shaped by your responses.
        </p>
        <div className="landing__actions">
          <button className="primary-button" onClick={onBegin}>Begin the assessment <ArrowRight size={17} strokeWidth={1.5} /></button>
          {savedResult && <button className="secondary-button" onClick={onResume}><RotateCcw size={15} strokeWidth={1.5} /> Return to your constellation</button>}
        </div>
        <div className="landing__meta">
          <span><Clock3 size={14} /> About 9–12 minutes</span>
          <span>Private by default · saved only on this device</span>
        </div>
      </section>

      <div className="landing__nine" aria-hidden="true">9</div>
      <div className="landing__rail" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
      <button className="demo-link" onClick={onDemo}>Explore with a demo signal</button>
      <p className="landing__disclaimer">For education and self-reflection—not a clinical assessment or diagnosis.</p>
    </main>
  );
}
