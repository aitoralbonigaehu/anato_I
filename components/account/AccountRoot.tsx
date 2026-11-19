'use client';

import { useEffect, useRef } from 'react';
import { IconClose } from '@/components/shell/icons';
import { closeAccountCard, startAccounts, useAccount } from './account';
import { AccountForm } from './AccountForm';

/** Mounted once in the layout: starts the account (session + sync) and draws the sign-in card when asked. */
export function AccountRoot() {
  const acc = useAccount();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void startAccounts();
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (acc.asking && !d.open) d.showModal();
    if (!acc.asking && d.open) d.close();
  }, [acc.asking]);

  if (acc.status === 'off') return null;
  return (
    <dialog ref={ref} className="acc-dialog" aria-labelledby="acc-title" onClose={closeAccountCard} onCancel={closeAccountCard}>
      <button className="icon-btn acc-x" onClick={closeAccountCard} aria-label="Itxi">
        <IconClose size={16} />
      </button>
      <h2 id="acc-title">Zure kontua</h2>
      <p className="acc-lead">Kontu bakoitzak bere aurrerapena gordetzen du nabigatzaile honetan. Saioa hasi gabe egindakoa bereiz gordetzen da.</p>
      {acc.asking && <AccountForm onDone={closeAccountCard} />}
    </dialog>
  );
}
