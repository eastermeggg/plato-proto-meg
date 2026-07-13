import React, { useEffect, useRef } from 'react';
import { Scissors, Check, Undo2 } from 'lucide-react';
import { CardShell, CardIcon, CardLabel, DismissBar, DISMISS_MS, btnLight } from './CardShell';

// One card per pile awaiting review. Two phases in the SAME shell:
//   • choice — filename + count + the binary CTAs (+ Ajuster).
//   • done   — the card transforms into a confirmation ("Éclaté en 100
//              pièces") with an inline « Annuler ». After a short window
//              it dismisses itself and the pieces stay in the list.
//
// This is the surface a chat-driven split tool also lands on: whoever
// triggers the split, the card reflects it and offers the undo.
export default function SplitReviewCard({ pile, rule, onApply, onUndo, onDismiss, onAdjust }) {
  const { aggregate, originalName } = pile;

  // The resolved choice lives on the pile (set by the card's own CTAs, the
  // adjust panel's exit buttons, or the chat split tool) — so any of them
  // flips this card into its confirmation phase.
  const doneMode = pile.reviewChoice || null;
  const dismissTimer = useRef(null);

  // Auto-dismiss the confirmation after the undo window. Restarts whenever
  // a fresh choice is applied; cleared when undone.
  useEffect(() => {
    clearTimeout(dismissTimer.current);
    if (doneMode) {
      dismissTimer.current = setTimeout(() => onDismiss(), DISMISS_MS);
    }
    return () => clearTimeout(dismissTimer.current);
  }, [doneMode, onDismiss]);

  if (doneMode) {
    const doneLabel = doneMode === 'exploded' ? `Éclaté en ${aggregate.count} pièces` : 'Gardé en 1 pièce';
    return (
      <CardShell fade="fadeIn 220ms ease">
        <CardIcon bg="#e7f3ec" color="#4a9168"><Check className="w-3.5 h-3.5" strokeWidth={2.25} /></CardIcon>
        <CardLabel name={doneLabel} state={originalName} />
        <button onClick={() => onUndo()} className={`${btnLight} flex-shrink-0`}>
          <Undo2 className="w-3.5 h-3.5" strokeWidth={1.75} />Annuler
        </button>
        <DismissBar />
      </CardShell>
    );
  }

  return (
    <CardShell>
      <CardIcon bg="#f5f5f4" color="#44403c"><Scissors className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0 text-[13px] leading-[18px] truncate" title={`${originalName} · ${aggregate.count} pièces détectées`}>
        <span className="font-medium text-foreground-strong">{originalName}</span>
        <span className="text-foreground-secondary tabular-nums"> · {aggregate.count} pièces détectées</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onApply('bundle')} className={btnLight}>Garder en 1 pièce</button>
        <button onClick={() => onApply('exploded')} className={btnLight}>Éclater</button>
        <button onClick={onAdjust} className={btnLight} title="Vérifier et ajuster le découpage">
          <Scissors className="w-3.5 h-3.5" strokeWidth={1.5} />Ajuster
        </button>
      </div>
    </CardShell>
  );
}
