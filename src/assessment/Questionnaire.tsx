import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OEPS, SCALE_LABELS } from './oeps';
import type { Rating, Response } from '../types';
import { Brand } from '../components/Brand';

interface QuestionnaireProps {
  onCancel: () => void;
  onComplete: (responses: Response[]) => void;
}

export function Questionnaire({ onCancel, onComplete }: QuestionnaireProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Rating>>({});
  const [keyboardTransition, setKeyboardTransition] = useState(false);
  const question = OEPS.questions[index];
  const rating = answers[question.id];
  const answeredCount = Object.keys(answers).length;
  const progress = ((index + 1) / OEPS.questions.length) * 100;
  const allAnswered = answeredCount === OEPS.questions.length;

  const responses = useMemo(
    () => OEPS.questions.filter((item) => answers[item.id]).map((item) => ({ questionId: item.id, rating: answers[item.id] })),
    [answers],
  );

  const navigate = (direction: -1 | 1, viaKeyboard = false) => {
    setKeyboardTransition(viaKeyboard);
    setIndex((current) => Math.min(OEPS.questions.length - 1, Math.max(0, current + direction)));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= '5') {
        setAnswers((current) => ({ ...current, [question.id]: Number(event.key) as Rating }));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(-1, true);
      } else if ((event.key === 'ArrowRight' || event.key === 'Enter') && rating && index < OEPS.questions.length - 1) {
        event.preventDefault();
        navigate(1, true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, question.id, rating]);

  const select = (value: Rating) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  return (
    <main className="questionnaire">
      <div className="questionnaire__atmosphere" aria-hidden="true" />
      <header className="questionnaire__header">
        <button className="brand-button" onClick={onCancel} aria-label="Return home"><Brand compact /></button>
        <div className="questionnaire__progress-copy">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <i aria-hidden="true" />
          <span>{OEPS.questions.length}</span>
        </div>
        <button className="text-button" onClick={onCancel}>Exit</button>
      </header>
      <div className="progress-line" aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>

      <section className="questionnaire__stage" aria-live="polite">
        <div key={question.id} className={`question ${keyboardTransition ? 'question--instant' : ''}`}>
          <p className="eyebrow">{question.format === 'statement' ? 'How true is this of you?' : 'Where do you fall between these?'}</p>
          {question.format === 'statement' ? (
            <h1>“{question.prompt}”</h1>
          ) : (
            <h1 className="question__pair"><span>{question.leftLabel}</span><i /><span>{question.rightLabel}</span></h1>
          )}
          <fieldset className={`rating ${question.format === 'bipolar' ? 'rating--bipolar' : ''}`}>
            <legend className="sr-only">Choose a rating from 1 to 5</legend>
            {question.format === 'statement' && <div className="rating__poles"><span>Disagree</span><span>Agree</span></div>}
            <div className="rating__options">
              {([1, 2, 3, 4, 5] as Rating[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={rating === value ? 'is-selected' : ''}
                  onClick={() => select(value)}
                  aria-label={`${value}: ${question.format === 'statement' ? SCALE_LABELS[value - 1] : `${question.leftLabel} to ${question.rightLabel}`}`}
                  aria-pressed={rating === value}
                >
                  <span>{value}</span><i />
                </button>
              ))}
            </div>
            {question.format === 'bipolar' && <div className="rating__poles"><span>{question.leftLabel}</span><span>{question.rightLabel}</span></div>}
          </fieldset>
        </div>
      </section>

      <footer className="questionnaire__footer">
        <button className="nav-button" disabled={index === 0} onClick={() => navigate(-1)}><ArrowLeft size={17} /> Previous</button>
        <span className="questionnaire__answered">{answeredCount} answered</span>
        {index < OEPS.questions.length - 1 ? (
          <button className="nav-button nav-button--next" disabled={!rating} onClick={() => navigate(1)}>Next <ArrowRight size={17} /></button>
        ) : (
          <button className="primary-button primary-button--compact" disabled={!allAnswered} onClick={() => onComplete(responses)}>
            Enter your constellation <Check size={17} />
          </button>
        )}
      </footer>
      <p className="keyboard-hint">Keys 1–5 to answer · arrows to navigate</p>
    </main>
  );
}
