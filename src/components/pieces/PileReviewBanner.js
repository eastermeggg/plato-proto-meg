import React from 'react';
import PileReviewCard from './PileReviewCard';

// "À vérifier" zone — only renders when at least one pile is awaiting
// a binary decision. The avocat scans the aggregate (count + date range),
// picks one of two equally-weighted buttons, and the card resolves with
// a micro-animation (handled by PileReviewCard).
//
// Visual language matches the adjust panel: neutral canvas, borderless
// white cards floating on layered shadows, dark primary pills.

export default function PileReviewBanner({ pileIds, piles, rule, onApply, onUndo, onDismiss, onAdjust }) {
  const items = pileIds.map(id => piles[id]).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <section className="mb-5" aria-label="Piles à vérifier">
      <header className="pb-3">
        <span className="text-[13px] text-[#44403c]">
          Nous avons détecté <span className="font-medium text-[#1c1917] tabular-nums">{items.length}</span> fichier{items.length > 1 ? 's' : ''} qui {items.length > 1 ? 'pourraient' : 'pourrait'} être découpé{items.length > 1 ? 's' : ''}.
        </span>
      </header>
      <div className="flex flex-col gap-2.5">
        {items.map(pile => (
          <PileReviewCard
            key={pile.id}
            pile={pile}
            rule={rule}
            onApply={(mode) => onApply(pile.id, mode)}
            onUndo={() => onUndo(pile.id)}
            onDismiss={() => onDismiss(pile.id)}
            onAdjust={() => onAdjust(pile.id)}
          />
        ))}
      </div>
    </section>
  );
}
