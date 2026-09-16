import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OEPS, SCALE_LABELS } from './oeps';
import { INSTINCT_ASSESSMENT } from './instinctAssessment';
import type { InstinctResponse, Rating, Response } from '../types';
import { Brand } from '../components/Brand';
import { AmbientField } from '../components/AmbientField';

interface QuestionnaireProps {
  onCancel: () => void;
  onComplete: (responses: Response[], instinctResponses: InstinctResponse[]) => void;
}

type Phase = 'type' | 'bridge' | 'instinct';

export function Questionnaire({ onCancel, onComplete }: QuestionnaireProps) {
  const [phase, setPhase] = useState<Phase>('type');
  const [typeIndex, setTypeIndex] = useState(0);
  const [instinctIndex, setInstinctIndex] = useState(0);
  const [typeAnswers, setTypeAnswers] = useState<Record<number, Rating>>({});
  const [instinctAnswers, setInstinctAnswers] = useState<Record<number, Rating>>({});
  const [keyboardTransition, setKeyboardTransition] = useState(false);

  const isType = phase === 'type';
  const typeQuestion = OEPS.questions[typeIndex];
  const instinctQuestion = INSTINCT_ASSESSMENT.questions[instinctIndex];
  const questionId = isType ? typeQuestion.id : instinctQuestion.id;
  const rating = isType ? typeAnswers[questionId] : instinctAnswers[questionId];
  const index = isType ? typeIndex : instinctIndex;
  const length = isType ? OEPS.questions.length : INSTINCT_ASSESSMENT.questions.length;
  const answeredCount = isType ? Object.keys(typeAnswers).length : Object.keys(instinctAnswers).length;
  const progress = ((index + 1) / length) * 100;

  const typeResponses = useMemo(
    () => OEPS.questions.filter((item) => typeAnswers[item.id]).map((item) => ({ questionId: item.id, rating: typeAnswers[item.id] })),
    [typeAnswers],
  );
  const instinctResponses = useMemo(
    () => INSTINCT_ASSESSMENT.questions.filter((item) => instinctAnswers[item.id]).map((item) => ({ questionId: item.id, rating: instinctAnswers[item.id] })),
    [instinctAnswers],
  );

  useEffect(() => {
    if (phase !== 'bridge') return;
    const timer = window.setTimeout(() => setPhase('instinct'), 1150);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const goBack = (viaKeyboard = false) => {
    setKeyboardTransition(viaKeyboard);
    if (phase === 'instinct' && instinctIndex === 0) {
      setPhase('type');
      setTypeIndex(OEPS.questions.length - 1);
      return;
    }
    if (phase === 'type') setTypeIndex((current) => Math.max(0, current - 1));
    if (phase === 'instinct') setInstinctIndex((current) => Math.max(0, current - 1));
  };

  const goForward = (viaKeyboard = false) => {
    if (!rating) return;
    setKeyboardTransition(viaKeyboard);
    if (phase === 'type') {
      if (typeIndex === OEPS.questions.length - 1) setPhase('bridge');
      else setTypeIndex((current) => current + 1);
      return;
    }
    if (phase === 'instinct' && instinctIndex < INSTINCT_ASSESSMENT.questions.length - 1) {
      setInstinctIndex((current) => current + 1);
    }
  };

  useEffect(() => {
    if (phase === 'bridge') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= '5') {
        const value = Number(event.key) as Rating;
        if (isType) setTypeAnswers((current) => ({ ...current, [questionId]: value }));
        else setInstinctAnswers((current) => ({ ...current, [questionId]: value }));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack(true);
      } else if ((event.key === 'ArrowRight' || event.key === 'Enter') && rating) {
        event.preventDefault();
        if (phase === 'instinct' && instinctIndex === INSTINCT_ASSESSMENT.questions.length - 1) {
          if (instinctResponses.length === INSTINCT_ASSESSMENT.questions.length) onComplete(typeResponses, instinctResponses);
        } else {
          goForward(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (phase === 'bridge') {
    return (
      <main className="questionnaire questionnaire--bridge">
        <AmbientField />
        <div className="questionnaire__atmosphere" aria-hidden="true" />
        <section className="questionnaire__bridge" aria-live="polite">
          <p className="eyebrow">Part 1 complete</p>
          <i aria-hidden="true" />
          <h1>Now, notice what draws your attention.</h1>
          <p>Part 2 explores instinctive priorities. Your constellation remains just beyond view.</p>
        </section>
      </main>
    );
  }

  const select = (value: Rating) => {
    if (isType) setTypeAnswers((current) => ({ ...current, [questionId]: value }));
    else setInstinctAnswers((current) => ({ ...current, [questionId]: value }));
  };
  const isLast = index === length - 1;
  const allInstinctAnswered = instinctResponses.length === INSTINCT_ASSESSMENT.questions.length;

  return (
    <main className="questionnaire">
      <AmbientField />
      <div className="questionnaire__atmosphere" aria-hidden="true" />
      <header className="questionnaire__header">
        <button className="brand-button" onClick={onCancel} aria-label="Return home"><Brand compact /></button>
        <div className="questionnaire__part"><span>Part {isType ? '1' : '2'} of 2</span><i aria-hidden="true" /><strong>{isType ? 'Type' : 'Instinct'}</strong></div>
        <button className="text-button" onClick={onCancel}>Exit</button>
      </header>
      <div className="progress-line" aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>

      <section className="questionnaire__stage" aria-live="polite">
        <div key={`${phase}-${questionId}`} className={`question ${keyboardTransition ? 'question--instant' : ''}`}>
          <p className="eyebrow">{isType && typeQuestion.format === 'bipolar' ? 'Where do you fall between these?' : 'How true is this of you?'}</p>
          {isType && typeQuestion.format === 'bipolar' ? (
            <h1 className="question__pair"><span>{typeQuestion.leftLabel}</span><i /><span>{typeQuestion.rightLabel}</span></h1>
          ) : (
            <h1>“{isType ? typeQuestion.prompt : instinctQuestion.prompt}”</h1>
          )}
          <fieldset className={`rating ${isType && typeQuestion.format === 'bipolar' ? 'rating--bipolar' : ''}`}>
            <legend className="sr-only">Choose a rating from 1 to 5</legend>
            {(!isType || typeQuestion.format === 'statement') && <div className="rating__poles"><span>Disagree</span><span>Agree</span></div>}
            <div className="rating__options">
              {([1, 2, 3, 4, 5] as Rating[]).map((value) => (
                <button type="button" key={value} className={rating === value ? 'is-selected' : ''} onClick={() => select(value)} aria-label={`${value}: ${isType && typeQuestion.format === 'bipolar' ? `${typeQuestion.leftLabel} to ${typeQuestion.rightLabel}` : SCALE_LABELS[value - 1]}`} aria-pressed={rating === value}>
                  <span>{value}</span><i />
                </button>
              ))}
            </div>
            {isType && typeQuestion.format === 'bipolar' && <div className="rating__poles"><span>{typeQuestion.leftLabel}</span><span>{typeQuestion.rightLabel}</span></div>}
          </fieldset>

          <nav className="questionnaire__navigation" aria-label="Question navigation">
            <button className="nav-button" disabled={phase === 'type' && index === 0} onClick={() => goBack()}><ArrowLeft size={17} /> Previous</button>
            {!isLast || isType ? (
              <button className="nav-button nav-button--next" disabled={!rating} onClick={() => goForward()}>{isLast ? 'Continue' : 'Next'} <ArrowRight size={17} /></button>
            ) : (
              <button className="primary-button primary-button--compact" disabled={!allInstinctAnswered} onClick={() => onComplete(typeResponses, instinctResponses)}>Reveal your constellation <Check size={17} /></button>
            )}
          </nav>
          <p className="questionnaire__answered">{String(index + 1).padStart(2, '0')} / {length} · {answeredCount} answered</p>
        </div>
      </section>
      <p className="keyboard-hint">Keys 1–5 to answer · arrows to navigate</p>
    </main>
  );
}
