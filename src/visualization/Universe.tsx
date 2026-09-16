import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, Info, LocateFixed, Maximize2, Pin, X } from 'lucide-react';
import { TYPE_REGIONS } from '../assessment/oeps';
import { getEvidenceBandDefinition } from '../content/assessmentEvidence';
import { Brand } from '../components/Brand';
import { IconButton } from '../components/IconButton';
import { downloadReportPdf, downloadShareImage } from '../export/exportResults';
import type { EnneagramType, ResultProfile, VisualizationPoint } from '../types';
import { ConstellationScene, type ConstellationHandle } from './ConstellationScene';
import { ResultsPanel } from '../results/ResultsPanel';

interface UniverseProps {
  profile: ResultProfile;
  onHome: () => void;
  onRetake: () => void;
  onDemo: () => void;
}

export function Universe({ profile, onHome, onRetake, onDemo }: UniverseProps) {
  const scene = useRef<ConstellationHandle>(null);
  const [hoveredRegion, setHoveredRegion] = useState<EnneagramType | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<EnneagramType | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<EnneagramType | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VisualizationPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<VisualizationPoint | null>(null);
  const [enteredRegion, setEnteredRegion] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const reducedMotion = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const dominant = TYPE_REGIONS[profile.dominantTypes[0] - 1];
  const region = hoveredRegion ?? focusedRegion ?? selectedRegion;
  const point = selectedPoint ?? hoveredPoint;
  const regionIsPinned = Boolean(selectedRegion && region === selectedRegion && !hoveredRegion);
  const regionIsFocused = Boolean(focusedRegion && region === focusedRegion && !hoveredRegion);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), reducedMotion ? 20 : 900);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const selectRegion = (type: EnneagramType) => {
    setSelectedRegion((current) => current === type ? null : type);
    setSelectedPoint(null);
    setEnteredRegion(false);
  };

  const enterRegion = (type: EnneagramType) => {
    setSelectedRegion(type);
    setHoveredRegion(null);
    setEnteredRegion(true);
    scene.current?.focusType(type);
  };

  const resetView = () => {
    setSelectedRegion(null);
    setSelectedPoint(null);
    setEnteredRegion(false);
    scene.current?.reset();
  };

  const updateZoom = (nextZoom: number) => {
    setZoom(nextZoom);
    if (nextZoom < 20) setSelectedPoint(null);
    if (nextZoom < 14 && enteredRegion) {
      setSelectedRegion(null);
      setEnteredRegion(false);
    }
  };

  const selectPoint = (nextPoint: VisualizationPoint) => {
    setSelectedPoint((current) => current?.id === nextPoint.id ? null : nextPoint);
  };

  return (
    <main className={`universe ${entered ? 'is-entered' : ''} ${focusedRegion && zoom >= 28 ? 'is-deep-focus' : ''}`}>
      <ConstellationScene
        ref={scene}
        profile={profile}
        reducedMotion={reducedMotion}
        selectedRegion={selectedRegion}
        onRegionHover={setHoveredRegion}
        onRegionSelect={selectRegion}
        onFocusedRegionChange={setFocusedRegion}
        onPointHover={setHoveredPoint}
        onPointSelect={selectPoint}
        onZoomChange={updateZoom}
      />
      <div className="universe__vignette" aria-hidden="true" />
      <header className="universe__header">
        <button className="brand-button" onClick={onHome} aria-label="Return home"><Brand compact /></button>
        <div className="universe__title">
          <span>{profile.isDemo ? 'Demonstration signal' : 'Your personality constellation'}</span>
          <strong>{profile.isDemo ? profile.demoLabel : `${dominant.name} · strongest signal`}</strong>
        </div>
        <div className="universe__actions">
          <IconButton label="Reset view" onClick={resetView}><LocateFixed size={17} /></IconButton>
          <button className="ghost-button" onClick={() => setSummaryOpen(true)}><Info size={15} /> Results</button>
          <button className="primary-button primary-button--compact" onClick={() => setShareOpen(true)}><Maximize2 size={15} /> Create result</button>
        </div>
      </header>

      <aside className={`region-card ${region ? 'is-visible' : ''} ${regionIsPinned || regionIsFocused ? 'is-persistent' : ''}`} aria-live="polite">
        {region && (() => {
          const content = TYPE_REGIONS[region - 1];
          const score = profile.scores.find((item) => item.type === region)!;
          const mode = hoveredRegion ? 'Region preview' : regionIsFocused ? 'Camera focus' : 'Selected region';
          return (
            <>
              <span className="region-card__number">{region}</span>
              <div>
                <p className="eyebrow region-card__mode">
                  {regionIsPinned && <Pin size={10} aria-hidden="true" />}{mode} · {Math.round(score.normalized * 100)}% signal · rank {score.rank}
                </p>
                <h2>{content.name}</h2>
                <p>{content.description}</p>
                {zoom >= 18 && (
                  <p className="region-card__subregions">Instinct areas are reserved for a future secondary assessment and are not inferred from OEPS.</p>
                )}
                {hoveredRegion && !regionIsPinned && !regionIsFocused ? (
                  <span className="region-card__hint">Click the number to hold this region</span>
                ) : (
                  <button className="text-button" onClick={() => enterRegion(region)}>
                    {regionIsFocused ? 'Recenter this region' : 'Enter this region'}
                  </button>
                )}
              </div>
              {selectedRegion === region && (
                <button className="region-card__close" onClick={() => { setSelectedRegion(null); setEnteredRegion(false); }} aria-label="Deselect region"><X size={15} /></button>
              )}
            </>
          );
        })()}
      </aside>

      <aside className={`point-card ${point && zoom >= 20 ? 'is-visible' : ''} ${selectedPoint ? 'is-selected' : ''}`}>
        {point && (() => {
          const evidence = getEvidenceBandDefinition(point.evidenceBand);
          return (
            <>
              <p className="eyebrow">Scored indicator · Q{point.questionId}</p>
              <h3>{point.label}</h3>
              <p>
                Your response contributes <strong>{point.value} of 5</strong> toward Type {point.type}
                {point.reverse ? ' after the documented reverse key is applied' : ''}.
              </p>
              <div className="point-card__meta"><span>{evidence.label}</span><i /><span>{point.layer}</span></div>
              {selectedPoint && <button className="point-card__close" onClick={() => setSelectedPoint(null)} aria-label="Deselect light"><X size={14} /></button>}
            </>
          );
        })()}
      </aside>

      <div className="universe__guide">
        <span>Drag to travel</span><i />
        <span>Scroll or pinch to change scale</span><i />
        <span className={zoom >= 20 ? 'is-active' : ''}>{zoom >= 20 ? 'Lights are inspectable · click to hold' : 'Move closer to inspect a light'}</span>
      </div>
      <div className="zoom-meter" aria-label={`Zoom level ${Math.round(zoom)}`}>
        <span>FIELD</span><i><b style={{ transform: `scaleX(${Math.min(1, Math.max(0, (zoom - 8) / 50))})` }} /></i><span>DETAIL</span>
      </div>

      <ResultsPanel
        profile={profile}
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onFocusType={(type) => { setSummaryOpen(false); enterRegion(type); }}
        onRetake={onRetake}
        onDemo={onDemo}
      />

      {shareOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareOpen(false); }}>
          <section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <button className="share-modal__close" onClick={() => setShareOpen(false)} aria-label="Close"><X size={18} /></button>
            <p className="eyebrow">Create result</p>
            <h2 id="share-title">Take the pattern with you.</h2>
            <p>Both exports are rendered from your scored profile, with a designed overview rather than a browser screenshot.</p>
            <div className="share-modal__options">
              <button onClick={() => downloadShareImage(profile)}><Download /><span><strong>Shareable image</strong><small>1800 × 1800 PNG</small></span></button>
              <button onClick={() => downloadReportPdf(profile)}><FileText /><span><strong>Reflection report</strong><small>Multi-page PDF</small></span></button>
            </div>
            <small>No response data leaves this device.</small>
          </section>
        </div>
      )}
      <div className="universe__curtain"><Brand /><span>Mapping your responses into light…</span></div>
    </main>
  );
}
