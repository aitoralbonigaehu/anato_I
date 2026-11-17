'use client';

import { useState } from 'react';
import { checkName, checkPin, PIN_LENGTH, type AuthResult } from '@/lib/account/types';
import { signInWithPin, signUpWithPin } from './account';

const MESSAGES: Record<string, string> = {
  taken: 'Izen hori hartuta dago. Aukeratu beste bat, edo hasi saioa izen horrekin.',
  wrong: 'Izena edo PINa ez dira zuzenak.',
  invalid: 'Begiratu izena eta PINa.',
  network: 'Ezin izan da konektatu. Saiatu berriro.',
  unavailable: 'Kontuak ez daude erabilgarri une honetan.',
};

/**
 * Sign in or create an account: a name with a 4-digit PIN. Used by the first-visit welcome
 * and by the "Gorde hodeian" card. `onDone` runs once signed in.
 */
export function AccountForm({ onDone }: { onDone?: () => void }) {
  const [tab, setTab] = useState<'sortu' | 'sartu'>('sortu');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = checkName(name) ?? checkPin(pin);
    if (bad) return setError(bad);
    setBusy(true);
    setError(null);
    const r: AuthResult = await (tab === 'sortu' ? signUpWithPin(name, pin) : signInWithPin(name, pin));
    setBusy(false);
    if (r.ok) return onDone?.();
    if (r.error === 'locked') setError(`Saiakera gehiegi izen honekin. Itxaron ${Math.max(1, Math.ceil((r.retryAfterSec ?? 900) / 60))} minutu eta saiatu berriro.`);
    else setError(MESSAGES[r.error] ?? MESSAGES.network);
    if (r.error === 'taken') setTab('sartu');
  };

  return (
    <div className="acc-form">
      <div className="seg acc-tabs" role="tablist" aria-label="Kontua">
        <button type="button" role="tab" aria-selected={tab === 'sortu'} className={tab === 'sortu' ? 'is-on' : ''} onClick={() => (setTab('sortu'), setError(null))}>
          Sortu kontua
        </button>
        <button type="button" role="tab" aria-selected={tab === 'sartu'} className={tab === 'sartu' ? 'is-on' : ''} onClick={() => (setTab('sartu'), setError(null))}>
          Hasi saioa
        </button>
      </div>

      <form className="acc-fields" onSubmit={submit} noValidate>
        <label>
          <span>Izena</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adib. Ane Etxeberria" autoComplete="username" maxLength={24} spellCheck={false} required />
        </label>
        <label>
          <span>PINa ({PIN_LENGTH} zenbaki)</span>
          <input
            className="acc-pin"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
            type="password"
            inputMode="numeric"
            autoComplete={tab === 'sortu' ? 'new-password' : 'current-password'}
            placeholder="••••"
            maxLength={PIN_LENGTH}
            required
          />
        </label>
        {error && (
          <p className="acc-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn primary acc-submit" disabled={busy}>
          {busy ? 'Itxaron…' : tab === 'sortu' ? 'Sortu eta gorde' : 'Hasi saioa'}
        </button>
        <p className="acc-note">{tab === 'sortu' ? 'Gogoratu izena eta PINa: ez dago berreskuratzeko modurik. Ez erabili beste inon erabiltzen duzun PINik.' : 'Izena idatzi zenuen bezala (maiuskulek eta azentuek ez dute axola).'}</p>
      </form>
    </div>
  );
}
