import React from 'react';
import { Scissors, Loader2 } from 'lucide-react';
import { CardShell, CardIcon, CardLabel, btnLight } from './CardShell';

// Posteriori split — a document split after upload (from the doc panel). Two
// phases in the same shared shell as the other review cards:
//   • splitting — analysis running → spinner, no actions.
//   • detected  — N pièces found → Garder en 1 pièce / Voir et ajuster.
export default function PosterioriSplitCard({ name, state, count = 0, onKeepAsOne, onAdjust }) {
  if (state === 'splitting') {
    return (
      <CardShell>
        <CardIcon bg="#f5f5f4" color="#44403c"><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} /></CardIcon>
        <CardLabel name={name} state="Découpage en cours…" />
      </CardShell>
    );
  }
  return (
    <CardShell>
      <CardIcon bg="#f5f5f4" color="#44403c"><Scissors className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0 text-[13px] leading-[18px] truncate" title={`${name} · ${count} pièces détectées`}>
        <span className="font-medium text-[#1c1917]">{name}</span>
        <span className="text-[#78716c] tabular-nums"> · {count} pièce{count > 1 ? 's' : ''} détectée{count > 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onKeepAsOne} className={btnLight}>Garder en 1 pièce</button>
        <button onClick={onAdjust} className={btnLight} title="Voir et ajuster le découpage">
          <Scissors className="w-3.5 h-3.5" strokeWidth={1.5} />Voir et ajuster
        </button>
      </div>
    </CardShell>
  );
}
