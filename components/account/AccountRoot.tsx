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
      <h2 id="acc-title">Gorde zure aurrerapena</h2>
      <p className="acc-lead">Hasi saioa, eta ikusitakoa, txartelak eta galderak edozein gailutan izango dituzu. Aukerakoa da: saiorik gabe ere dena dabil, nabigatzaile honetan gordeta.</p>
      {acc.asking && <AccountForm onDone={closeAccountCard} />}
    </dialog>
  );
}
