import React, { useEffect, useRef, useState } from 'react';
import { Scissors, Check, Undo2 } from 'lucide-react';

// One card per pile awaiting review. Two phases in the SAME shell:
//   • choice — filename + count + the binary CTAs (+ Ajuster).
//   • done   — the card transforms into a confirmation ("Éclaté en 100
//              pièces") with an inline « Annuler ». After a short window
//              it dismisses itself and the pieces stay in the list.
//
// This is the surface a chat-driven split tool also lands on: whoever
// triggers the split, the card reflects it and offers the undo.

const DISMISS_MS = 6000;

export default function PileReviewCard({ pile, rule, onApply, onUndo, onDismiss, onAdjust }) {
  const { aggregate, originalName } = pile;
  const recommended = rule === 'explode' ? 'exploded' : rule === 'group' ? 'bundle' : null;

  // The resolved choice lives on the pile (set by the card's own CTAs, the
  // adjust panel's exit buttons, or the chat split tool) — so any of them
  // flips this card into its confirmation phase.
  const doneMode = pile.reviewChoice || null;
  const phase = doneMode ? 'done' : 'choice';

  const [hovered, setHovered] = useState(false);
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

  const choose = (mode) => onApply(mode);
  const undo = () => onUndo();

  const doneLabel = doneMode === 'exploded'
    ? `Éclaté en ${aggregate.count} pièces`
    : 'Gardé en 1 pièce';

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="overflow-hidden rounded-lg bg-white"
      style={{
        boxShadow: hovered
          ? '0 1px 2px rgba(28,25,23,0.05), 0 12px 28px -8px rgba(28,25,23,0.12)'
          : '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -8px rgba(28,25,23,0.08)',
        transition: 'box-shadow 200ms ease',
      }}
    >
      {phase === 'choice' ? (
        <div className="px-4 py-3.5 flex items-center gap-3.5" style={{ animation: 'fadeIn 200ms ease' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 bg-[#f5f5f4] text-[#44403c]">
            <Scissors className="w-4 h-4" strokeWidth={1.75} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[#1c1917] tracking-[-0.01em] truncate">{originalName}</div>
            <div className="mt-0.5 text-[12px] text-[#78716c] truncate tabular-nums">
              {aggregate.count} pièces détectées
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => choose('bundle')}
              className={`h-9 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                recommended === 'bundle'
                  ? 'text-white bg-[#292524] hover:bg-[#44403c]'
                  : 'text-[#44403c] bg-white border border-[#d6d3d1] hover:bg-[#f8f7f5]'
              }`}
            >
              Garder en 1 pièce
            </button>
            <button
              onClick={() => choose('exploded')}
              className={`h-9 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                recommended === 'exploded'
                  ? 'text-white bg-[#292524] hover:bg-[#44403c]'
                  : 'text-[#44403c] bg-white border border-[#d6d3d1] hover:bg-[#f8f7f5]'
              }`}
            >
              Éclater ({aggregate.count} pièces)
            </button>
            <span className="w-px h-6 bg-[#f0efed]" />
            <button
              onClick={onAdjust}
              className="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium text-[#78716c] hover:text-[#292524] hover:bg-[#f8f7f5] rounded-md transition-colors"
              title="Vérifier et ajuster le découpage"
            >
              <Scissors className="w-4 h-4" strokeWidth={1.5} />
              Ajuster
            </button>
          </div>
        </div>
      ) : (
        <div className="relative px-4 py-3.5 flex items-center gap-3.5" style={{ animation: 'fadeIn 220ms ease' }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0" style={{ background: '#e7f3ec', color: '#4a9168' }}>
            <Check className="w-4 h-4" strokeWidth={2.25} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[#1c1917] tracking-[-0.01em] truncate">{doneLabel}</div>
            <div className="mt-0.5 text-[12px] text-[#78716c] truncate">{originalName}</div>
          </div>

          <button
            onClick={undo}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-[#44403c] bg-white border border-[#d6d3d1] rounded-md hover:bg-[#f8f7f5] transition-colors flex-shrink-0"
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.75} />
            Annuler
          </button>

          {/* auto-dismiss progress line */}
          <span
            className="absolute left-0 bottom-0 h-[2px]"
            style={{
              background: '#4a9168',
              width: '100%',
              transformOrigin: 'left',
              animation: `pileReviewDismiss ${DISMISS_MS}ms linear forwards`,
            }}
          />
        </div>
      )}
    </article>
  );
}
