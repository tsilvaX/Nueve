import { lazy, Suspense, useState } from 'react';
import { Landing } from './components/Landing';
import { MethodologyModal } from './components/MethodologyModal';
import { Questionnaire } from './assessment/Questionnaire';
import { createDemoProfile, scoreResponses } from './scoring/scoreAssessment';
import { loadResult, saveResult } from './results/persistence';
import type { Response, ResultProfile } from './types';

const Universe = lazy(() => import('./visualization/Universe').then((module) => ({ default: module.Universe })));

type Screen = 'home' | 'assessment' | 'universe';
type DemoKind = 'focused' | 'split' | 'broad' | 'dominant';

export function App() {
  const [savedResult, setSavedResult] = useState<ResultProfile | null>(() => loadResult());
  const [profile, setProfile] = useState<ResultProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [methodOpen, setMethodOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const complete = (responses: Response[]) => {
    const result = scoreResponses(responses);
    saveResult(result);
    setSavedResult(result);
    setProfile(result);
    setScreen('universe');
  };
  const loadDemo = (kind: DemoKind) => {
    setProfile(createDemoProfile(kind));
    setDemoOpen(false);
    setScreen('universe');
  };

  return (
    <>
      {screen === 'home' && (
        <Landing
          savedResult={savedResult}
          onBegin={() => setScreen('assessment')}
          onResume={() => { setProfile(savedResult); setScreen('universe'); }}
          onDemo={() => setDemoOpen(true)}
          onMethodology={() => setMethodOpen(true)}
        />
      )}
      {screen === 'assessment' && <Questionnaire onCancel={() => setScreen('home')} onComplete={complete} />}
      {screen === 'universe' && profile && (
        <Suspense fallback={<div className="app-loading" aria-live="polite">Preparing the constellation…</div>}>
          <Universe
            profile={profile}
            onHome={() => setScreen('home')}
            onRetake={() => setScreen('assessment')}
            onDemo={() => setDemoOpen(true)}
          />
        </Suspense>
      )}
      <MethodologyModal open={methodOpen} onClose={() => setMethodOpen(false)} />
      {demoOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoOpen(false); }}>
          <section className="demo-picker" role="dialog" aria-modal="true" aria-labelledby="demo-title">
            <p className="eyebrow">Deterministic demo signals</p>
            <h2 id="demo-title">Choose a pattern to explore.</h2>
            <p>Demo profiles are clearly marked and are not presented as psychological conclusions.</p>
            <div>
              <button onClick={() => loadDemo('focused')}><strong>Focused</strong><span>A dense Type 5 signal</span></button>
              <button onClick={() => loadDemo('split')}><strong>Neighboring split</strong><span>Types 4 and 5 in tension</span></button>
              <button onClick={() => loadDemo('broad')}><strong>Broad field</strong><span>An intentionally dispersed profile</span></button>
              <button onClick={() => loadDemo('dominant')}><strong>Dominant + secondary</strong><span>Type 8 with quieter signals</span></button>
            </div>
            <button className="text-button" onClick={() => setDemoOpen(false)}>Cancel</button>
          </section>
        </div>
      )}
    </>
  );
}
