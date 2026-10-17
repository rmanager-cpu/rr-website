import { useEffect, useId, useRef, useState } from 'react';
import type { Frame, Point, Section, SectionImage, SubmissionAdapter } from './types';
import { Straightened } from './Straightened';
import { isAsk } from './labels';

interface Props {
  frame: Frame;
  /** The section the visitor opened it from. */
  section: Section;
  /** The photo the frame is cut from (may be another section's, if it's clearer there). */
  shot: SectionImage;
  points: Point[];
  previewSrc: string;
  url: (src: string) => string;
  closeupSrc?: string;
  adapter: SubmissionAdapter;
  position: { index: number; total: number };
  onStep: (delta: number) => void;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FramePanel({ frame, section, shot, points, previewSrc, url, closeupSrc, adapter, position, onStep, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const ask = isAsk(frame);
  const [showForm, setShowForm] = useState(ask);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    // Start on Close, not the text box, so phones don’t open the keyboard over the photo.
    closeBtn.current?.focus();
  }, []);

  const name = frame.title ?? (frame.tag ? `No. ${frame.tag}` : 'From the wall');

  return (
    <dialog
      ref={dialog}
      className="hw-panel"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      onKeyDown={(e) => {
        if ((e.target as Element).closest('input, textarea')) return;
        if (e.key === 'ArrowRight') onStep(1);
        if (e.key === 'ArrowLeft') onStep(-1);
      }}
    >
      <div className="hw-panel-inner">
        <figure className="hw-panel-figure">
          {closeupSrc ? (
            <img className="hw-closeup" src={closeupSrc} alt={name} />
          ) : (
            <Straightened points={points} image={shot} previewSrc={previewSrc} url={url} alt={name} />
          )}
        </figure>

        <div className="hw-panel-body">
          <header className="hw-panel-head">
            <p className="hw-eyebrow">{section.title}</p>
            <h2 id={titleId} className="hw-panel-title">{name}</h2>
          </header>

          {!ask && (
            <div className="hw-story">
              {frame.description && <p>{frame.description}</p>}
              <StoryAction frame={frame} />
              {!showForm && (
                <button type="button" className="hw-link" onClick={() => setShowForm(true)}>
                  Know more about this one?
                </button>
              )}
            </div>
          )}

          {showForm && (
            <AskForm
              frame={frame}
              section={section}
              adapter={adapter}
              lead={ask}
              onNext={() => onStep(1)}
              onDone={() => dialog.current?.close()}
            />
          )}

          <footer className="hw-panel-nav">
            <button type="button" className="hw-btn hw-btn--ghost" onClick={() => onStep(-1)} aria-label="Previous photo">
              <Chevron dir="left" />
            </button>
            <span className="hw-panel-count">
              {position.index + 1} / {position.total}
            </span>
            <button type="button" className="hw-btn hw-btn--ghost" onClick={() => onStep(1)} aria-label="Next photo">
              <Chevron dir="right" />
            </button>
          </footer>
        </div>

        <button type="button" className="hw-btn hw-panel-close" onClick={() => dialog.current?.close()} aria-label="Close" ref={closeBtn}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

function StoryAction({ frame }: { frame: Frame }) {
  const a = frame.action;
  if (!a || a.type === 'ask') return null;
  if (a.type === 'easter-egg' && !a.href) return a.message ? <p className="hw-egg">{a.message}</p> : null;
  const href = a.href!;
  const label = 'label' in a && a.label ? a.label : a.type === 'story' ? 'Read the story' : 'Take a look';
  const external = /^https?:/.test(href);
  return (
    <a className="hw-cta" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {label}
    </a>
  );
}

interface AskFormProps {
  frame: Frame;
  section: Section;
  adapter: SubmissionAdapter;
  lead: boolean;
  onNext: () => void;
  onDone: () => void;
}

function AskForm({ frame, section, adapter, lead, onNext, onDone }: AskFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const ids = { text: useId(), name: useId(), contact: useId() };

  if (status === 'sent') {
    return (
      <div className="hw-thanks" role="status">
        <p className="hw-thanks-title">Thank you.</p>
        <p>Every piece helps us tell this wall’s story.</p>
        <div className="hw-thanks-actions">
          <button type="button" className="hw-cta" onClick={onNext}>
            Next photo
          </button>
          <button type="button" className="hw-link" onClick={onDone}>
            Back to the wall
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get('website')) return setStatus('sent'); // honeypot: bots fill hidden fields
    setStatus('sending');
    try {
      await adapter.submit({
        frameId: frame.id,
        sectionId: section.id,
        text: text.trim(),
        name: String(data.get('name') ?? '').trim() || undefined,
        contact: String(data.get('contact') ?? '').trim() || undefined,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="hw-form" onSubmit={submit}>
      <label htmlFor={ids.text} className="hw-form-lead">
        {lead ? 'What’s the story behind this one?' : 'What do you know about it?'}
      </label>
      <textarea
        id={ids.text}
        required
        minLength={3}
        maxLength={4000}
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Who’s in it, when it was taken, what was happening…"
      />
      <div className="hw-form-row">
        <div>
          <label htmlFor={ids.name}>Your name <span>(optional)</span></label>
          <input id={ids.name} name="name" autoComplete="name" maxLength={120} />
        </div>
        <div>
          <label htmlFor={ids.contact}>Email or phone <span>(optional)</span></label>
          <input id={ids.contact} name="contact" autoComplete="email" maxLength={160} />
        </div>
      </div>
      <p className="hw-form-note">Leave an email, and if we use what you share, we’ll send you 10% off dining (on tabs up to $200, one per email). Nothing you send is posted publicly.</p>
      <input className="hw-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      {status === 'error' && <p className="hw-form-error" role="alert">That didn’t go through. Please try again.</p>}
      <button type="submit" className="hw-cta" disabled={status === 'sending' || text.trim().length < 3}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  );
}
