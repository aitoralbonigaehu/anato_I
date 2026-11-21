'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { feedbackAccessToken } from '@/lib/account/supabase';
import { useAccount } from '@/components/account/account';
import s from './topic-feedback.module.css';

const levels = ['Oso gutxi', 'Gutxi', 'Erdizka', 'Nahiko', 'Asko'];

export default function TopicFeedback({ topic, title, onDone }: { topic: number; title: string; onDone: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const submission = useRef<string | null>(null);
  const [clarity, setClarity] = useState(0);
  const [navigation, setNavigation] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'sent'>('idle');
  const account = useAccount();
  const busy = status === 'sending';

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !clarity || !navigation) return;
    setStatus('sending');
    try {
      submission.current ??= crypto.randomUUID();
      const token = account.status === 'in' && account.user ? await feedbackAccessToken(account.user.id) : null;
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : { 'X-Visit-Touch': navigator.maxTouchPoints > 1 ? '1' : '0' }),
        },
        body: JSON.stringify({ id: submission.current, topic, clarity, navigation, comment }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error('Feedback rejected');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const ratings = [
    { key: 'clarity', label: 'Gai hau hobeto ulertzen lagundu dizu?', value: clarity, set: setClarity, labels: levels },
    { key: 'navigation', label: 'Erraza izan da simulagailuan aurrera egitea?', value: navigation, set: setNavigation, labels: ['Oso zaila', 'Zaila', 'Ez erraza ez zaila', 'Erraza', 'Oso erraza'] },
  ];

  return (
    <dialog ref={ref} className={s.dialog} aria-labelledby={id} onCancel={(event) => { event.preventDefault(); if (!busy) onDone(); }}>
      <header className={s.head}>
        <p>{topic}. gaia · {title}</p>
        <h2 id={id}>{status === 'sent' ? 'Eskerrik asko!' : 'Zer moduz joan da?'}</h2>
      </header>
      {status === 'sent' ? (
        <div className={s.body}>
          <p role="status">Zure iritzia jaso dugu.</p>
          <button className={s.primary} type="button" onClick={onDone} autoFocus>Jarraitu →</button>
        </div>
      ) : (
        <form className={s.body} onSubmit={send}>
          {ratings.map(({ key, label, value, set, labels }) => (
            <fieldset className={s.rating} key={key} disabled={busy}>
              <legend>{label}</legend>
              <div className={s.scale}>
                {labels.map((text, i) => (
                  <label key={text}>
                    <input type="radio" name={key} value={i + 1} aria-label={text} checked={value === i + 1} onChange={() => set(i + 1)} />
                    <span aria-hidden="true">{i + 1}</span>
                  </label>
                ))}
              </div>
              <div className={s.ends}><span>{labels[0]}</span><span>{labels[4]}</span></div>
            </fieldset>
          ))}
          <label className={s.comment}>
            <span>Zer hobetu beharko genuke? <small>Aukerakoa</small></span>
            <textarea rows={2} maxLength={600} value={comment} disabled={busy} onChange={(event) => setComment(event.target.value)} />
          </label>
          <p className={s.privacy}>{account.status === 'in' ? 'Erantzuna zure kontuko izenarekin gordeko da.' : 'Erantzunarekin batera gailu mota, sistema eragilea eta nabigatzailea gordeko dira.'}</p>
          {status === 'error' && <p role="alert" className={s.error}>Ezin izan da bidali. Saiatu berriro, edo jarraitu inkesta bete gabe.</p>}
          <footer className={s.actions}>
            <button className={s.skip} type="button" disabled={busy} onClick={onDone}>Saltatu</button>
            <button className={s.primary} type="submit" disabled={busy || !clarity || !navigation}>{busy ? 'Bidaltzen…' : 'Bidali iritzia'}</button>
          </footer>
        </form>
      )}
    </dialog>
  );
}
