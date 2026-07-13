import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, Undo2, FileText } from 'lucide-react';
import { CardShell, CardIcon, CardLabel, DismissBar, DISMISS_MS, btnLight } from './CardShell';

// Possible-duplicate card with two phases in the same shell:
//   • choice — new ≈ existing filenames + Garder les deux / Ignorer / Voir.
//   • done   — confirmation ("Doublon ignoré" / "Les deux conservés") with an
//              inline « Annuler ». After the undo window it commits itself.
export default function DoublonCard({ name, ofName, onKeepBoth, onIgnore, onView }) {
  const [done, setDone] = useState(null); // null | 'kept' | 'ignored'
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (done) timer.current = setTimeout(() => { (done === 'ignored' ? onIgnore : onKeepBoth)(); }, DISMISS_MS);
    return () => clearTimeout(timer.current);
  }, [done, onIgnore, onKeepBoth]);

  if (done) {
    return (
      <CardShell>
        <CardIcon bg="#e7f3ec" color="#4a9168"><Check className="w-3.5 h-3.5" strokeWidth={2.25} /></CardIcon>
        <CardLabel name={done === 'ignored' ? 'Doublon ignoré' : 'Les deux conservés'} state={name} />
        <button onClick={() => setDone(null)} className={btnLight}>
          <Undo2 className="w-3.5 h-3.5" strokeWidth={1.75} />Annuler
        </button>
        <DismissBar />
      </CardShell>
    );
  }
  return (
    <CardShell>
      <CardIcon bg="#fdf4e7" color="#b45309"><Copy className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-[16px] font-medium text-foreground-strong">Doublon possible</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-[16px] text-foreground-secondary min-w-0">
          <span className="flex items-center gap-1 min-w-0 max-w-[46%]" title={name}>
            <FileText className="w-3 h-3 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{name}</span>
          </span>
          <span className="text-border-strong flex-shrink-0">≈</span>
          <span className="flex items-center gap-1 min-w-0 max-w-[46%]" title={ofName}>
            <FileText className="w-3 h-3 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{ofName}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setDone('kept')} className={btnLight}>Garder les deux</button>
        <button onClick={() => setDone('ignored')} className={btnLight}>Ignorer</button>
        <button onClick={onView} className={btnLight} title="Voir le document existant">Voir</button>
      </div>
    </CardShell>
  );
}
