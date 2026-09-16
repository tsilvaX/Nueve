import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Info, LocateFixed, Maximize2, Pin, X } from 'lucide-react';
import { OEPS, TYPE_REGIONS } from '../assessment/oeps';
import { getEvidenceBandDefinition } from '../content/assessmentEvidence';
import { INSTINCT_REGIONS } from '../content/instincts';
import { getOrbTrait } from '../content/orbTraits';
import { Brand } from '../components/Brand';
import { IconButton } from '../components/IconButton';
import { downloadReportPdf, downloadShareImage } from '../export/exportResults';
import type { EnneagramType, Rating, ResultProfile, VisualizationPoint } from '../types';
import { ConstellationScene, type ConstellationHandle } from './ConstellationScene';
import { ResultsPanel } from '../results/ResultsPanel';
import { TypeDetailPanel } from './TypeDetailPanel';

interface UniverseProps {
  profile: ResultProfile;
  onHome: () => void;
  onRetake: () => void;
  onDemo: () => void;
}

export function Universe({ profile, onHome, onRetake, onDemo }: UniverseProps) {
  const scene = useRef<ConstellationHandle>(null);
  const previousZoom = useRef(10);
  const [hoveredRegion, setHoveredRegion] = useState<EnneagramType | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<EnneagramType | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<EnneagramType | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VisualizationPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<VisualizationPoint | null>(null);
  const [cameraMoving, setCameraMoving] = useState(false);
  const [detailType, setDetailType] = useState<EnneagramType | null>(null);
  const [zoom, setZoom] = useState(10);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const reducedMotion = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const dominant = TYPE_REGIONS[profile.dominantTypes[0] - 1];
  const dominantLabel = profile.dominantTypes.length > 1
    ? `Types ${profile.dominantTypes.join(' + ')} · co-leading signals`
    : `${dominant.name} · strongest signal`;
  const highestScore = useMemo(() => [...profile.scores].sort((a, b) => b.normalized - a.normalized)[0], [profile.scores]);
  const region = hoveredRegion ?? selectedRegion ?? focusedRegion;
  const point = selectedPoint ?? hoveredPoint;
  const regionIsPinned = Boolean(selectedRegion && region === selectedRegion && !hoveredRegion);
  const regionIsFocused = Boolean(focusedRegion && region === focusedRegion && !hoveredRegion);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), reducedMotion ? 20 : 900);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const enterRegion = (type: EnneagramType) => {
    setSelectedRegion(type);
    setHoveredRegion(null);
    setSelectedPoint(null);
    setDetailType(null);
    scene.current?.focusType(type);
  };

  const resetView = () => {
    setSelectedRegion(null);
    setSelectedPoint(null);
    setDetailType(null);
    scene.current?.reset();
  };

  const updateZoom = (nextZoom: number) => {
    const lastZoom = previousZoom.current;
    previousZoom.current = nextZoom;
    setZoom(nextZoom);
    if (nextZoom < 20) setSelectedPoint(null);
    if (lastZoom >= 22 && nextZoom < 22) {
      setSelectedRegion(null);
      setDetailType(null);
    }
  };

  const selectPoint = (nextPoint: VisualizationPoint) => {
    setSelectedPoint((current) => current?.id === nextPoint.id ? null : nextPoint);
  };

  const navigateRegion = (direction: -1 | 1) => {
    if (cameraMoving) return;
    const current = selectedRegion ?? focusedRegion;
    if (!current) return;
    const next = (((current - 1 + direction + 9) % 9) + 1) as EnneagramType;
    setSelectedRegion(next);
    setHoveredRegion(null);
    setSelectedPoint(null);
    setDetailType(null);
    scene.current?.navigateType(next);
  };

  return (
    <main
      className={`universe ${entered ? 'is-entered' : ''} ${focusedRegion && zoom >= 28 ? 'is-deep-focus' : ''}`}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('canvas') && !target.closest('.point-card')) setSelectedPoint(null);
      }}
    >
      <ConstellationScene
        ref={scene}
        profile={profile}
        reducedMotion={reducedMotion}
        selectedRegion={selectedRegion}
        onRegionHover={setHoveredRegion}
        onRegionSelect={enterRegion}
        onFocusedRegionChange={setFocusedRegion}
        onPointHover={setHoveredPoint}
        onPointSelect={selectPoint}
        onPointClear={() => setSelectedPoint(null)}
        onZoomChange={updateZoom}
        onCameraTransitionChange={setCameraMoving}
      />
      <div className="universe__vignette" aria-hidden="true" />
      <header className="universe__header">
        <button className="brand-button" onClick={onHome} aria-label="Return home"><Brand compact /></button>
        <div className="universe__title">
          <span>{profile.isDemo ? 'Demonstration signal' : 'Your personality constellation'}</span>
          <strong>{profile.isDemo ? profile.demoLabel : dominantLabel}</strong>
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
          const gap = highestScore.normalized - score.normalized;
          const mode = gap < 0.0001 ? 'Your strongest result' : gap <= 0.035 ? 'Very close secondary result' : hoveredRegion ? 'Region preview' : regionIsFocused ? 'Camera focus' : 'Selected region';
          const dominantInstinct = profile.instinctProfile?.dominantInstincts[0];
          const instinctName = INSTINCT_REGIONS.find((item) => item.id === dominantInstinct)?.label;
          return (
            <>
              <span className="region-card__number">{region}</span>
              <div>
                <p className="eyebrow region-card__mode">
                  {regionIsPinned && <Pin size={10} aria-hidden="true" />}{mode} · {Math.round(score.normalized * 100)}% signal · rank {score.rank}
                </p>
                <h2>{content.name}</h2>
                <p>{content.description}</p>
                {zoom >= 18 && instinctName && <p className="region-card__subregions">Your instinct results lean most toward {instinctName}; all three remain visible inside this region.</p>}
                {hoveredRegion && !regionIsPinned && !regionIsFocused ? (
                  <span className="region-card__hint">Click the number to enter this region</span>
                ) : (
                  <button className="text-button" onClick={() => setDetailType(region)}>Explore this result</button>
                )}
              </div>
              {selectedRegion === region && <button className="region-card__close" onClick={() => setSelectedRegion(null)} aria-label="Unpin region"><X size={15} /></button>}
            </>
          );
        })()}
      </aside>

      {(selectedRegion ?? focusedRegion) && zoom >= 22 && (
        <nav className="region-navigation" aria-label="Move between Enneagram regions">
          <button disabled={cameraMoving} onClick={() => navigateRegion(-1)} aria-label="Previous Enneagram region"><ChevronLeft /></button>
          <button disabled={cameraMoving} onClick={() => navigateRegion(1)} aria-label="Next Enneagram region"><ChevronRight /></button>
        </nav>
      )}

      <aside className={`point-card ${point && zoom >= 20 ? 'is-visible' : ''} ${selectedPoint ? 'is-selected' : ''}`}>
        {point && (() => {
          const evidence = getEvidenceBandDefinition(point.evidenceBand);
          const response = profile.responses.find((item) => item.questionId === point.questionId);
          const source = OEPS.questions.find((item) => item.id === point.questionId);
          const trait = getOrbTrait(point.questionId, (response?.rating ?? 3) as Rating);
          const sourceStatement = source?.format === 'statement' ? source.prompt : `${source?.leftLabel} ↔ ${source?.rightLabel}`;
          return (
            <>
              <p className="eyebrow">A tendency in your responses</p>
              <h3>{trait}</h3>
              {selectedPoint && (
                <div className="point-card__evidence">
                  <dl>
                    <div><dt>Your response</dt><dd>{response?.rating ?? '—'} / 5</dd></div>
                    <div><dt>Source statement</dt><dd>{sourceStatement}</dd></div>
                    <div><dt>Why it appears here</dt><dd>This item contributes toward Type {point.type} in the OEPS scoring model{point.reverse ? ' using its documented reverse key' : ''}.</dd></div>
                  </dl>
                  <div className="point-card__meta"><span>{evidence.label}</span><i /><span>{point.value}/5 contribution</span></div>
                </div>
              )}
              {selectedPoint && <button className="point-card__close" onClick={() => setSelectedPoint(null)} aria-label="Deselect light"><X size={14} /></button>}
            </>
          );
        })()}
      </aside>

      <div className="universe__guide">
        <span>Drag to travel</span><i />
        <span>Scroll or pinch to change scale</span><i />
        <span className={zoom >= 20 ? 'is-active' : ''}>{zoom >= 20 ? 'Lights are inspectable · click for evidence' : 'Move closer to inspect a light'}</span>
      </div>
      <div className="zoom-meter" aria-label={`Zoom level ${Math.round(zoom)}`}>
        <span>FIELD</span><i><b style={{ transform: `scaleX(${Math.min(1, Math.max(0, (zoom - 8) / 50))})` }} /></i><span>DETAIL</span>
      </div>

      <ResultsPanel profile={profile} open={summaryOpen} onClose={() => setSummaryOpen(false)} onFocusType={(type) => { setSummaryOpen(false); enterRegion(type); }} onRetake={onRetake} onDemo={onDemo} />
      <TypeDetailPanel profile={profile} type={detailType} onClose={() => setDetailType(null)} />

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
