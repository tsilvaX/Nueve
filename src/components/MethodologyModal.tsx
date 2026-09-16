import { X } from 'lucide-react';
import { OEPS } from '../assessment/oeps';

export function MethodologyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="method-modal" role="dialog" aria-modal="true" aria-labelledby="method-title">
        <button className="share-modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <p className="eyebrow">Method & source</p>
        <h2 id="method-title">Open questions. Documented scoring.</h2>
        <p>
          Nueve uses the Open-Source Psychometrics Project’s OEPS v2. It presents the published items without revealing their scoring direction, then applies the documented additive and reverse-key formula.
        </p>
        <dl>
          <div><dt>Instrument</dt><dd>{OEPS.title}, {OEPS.version}</dd></div>
          <div><dt>Items</dt><dd>54 items in the downloadable official form</dd></div>
          <div><dt>License</dt><dd>Creative Commons Attribution–NonCommercial–ShareAlike 4.0</dd></div>
          <div><dt>Privacy</dt><dd>Responses remain in this browser; there is no account or server.</dd></div>
        </dl>
        <p className="method-modal__note">
          Source note: the January 2026 documentation page says 57 items, but the linked v2 ODT contains Q1–Q54 and scores Q1–Q54. This implementation follows that primary scoring document.
        </p>
        <a className="primary-button primary-button--compact" href={OEPS.sourceUrl} target="_blank" rel="noreferrer">Read the official documentation ↗</a>
      </section>
    </div>
  );
}
