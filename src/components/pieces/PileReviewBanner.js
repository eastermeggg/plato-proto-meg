import React from 'react';
import LoadingCard from './reviewCards/LoadingCard';
import ErrorCard from './reviewCards/ErrorCard';
import DoublonCard from './reviewCards/DoublonCard';
import SplitReviewCard from './reviewCards/SplitReviewCard';

// "À vérifier" zone — sits between the "N pièces · Ajouter" header and the table.
// Documents are analysed in the background (the chat shows progress); only the
// ones that need the avocat's attention surface here, as compact single-row
// cards in one shared shell (see reviewCards/CardShell):
//   • loading pile       — aggregate background-processing indicator
//   • processing error   — analysis failed → Réessayer / Ignorer
//   • doublon            — possible duplicate → Garder les deux / Ignorer / Voir
//   • split              — detected as splittable → Garder / Éclater / Ajuster
export default function PileReviewBanner({
  processingCount = 0,
  errorItems = [],
  doublonItems = [],
  pileIds = [],
  piles,
  rule,
  onApply, onUndo, onDismiss, onAdjust,
  onDoublonKeepBoth, onDoublonIgnore, onDoublonView,
  onErrorRetry, onErrorIgnore,
}) {
  const splitItems = pileIds.map(id => piles[id]).filter(Boolean);
  const toCheck = errorItems.length + doublonItems.length + splitItems.length;
  if (processingCount <= 0 && toCheck === 0) return null;

  return (
    <section className="mt-3 flex flex-col gap-1.5" aria-label="Documents à vérifier">
      {processingCount > 0 && <LoadingCard count={processingCount} />}
      {errorItems.map(it => (
        <ErrorCard key={`err-${it.id}`} name={it.name} onRetry={() => onErrorRetry(it.id)} onIgnore={() => onErrorIgnore(it.id)} />
      ))}
      {doublonItems.map(it => (
        <DoublonCard
          key={`dup-${it.id}`}
          name={it.name}
          ofName={it.ofName}
          onKeepBoth={() => onDoublonKeepBoth(it.id)}
          onIgnore={() => onDoublonIgnore(it.id)}
          onView={() => onDoublonView(it.id, it.ofId)}
        />
      ))}
      {splitItems.map(pile => (
        <SplitReviewCard
          key={pile.id}
          pile={pile}
          rule={rule}
          onApply={(mode) => onApply(pile.id, mode)}
          onUndo={() => onUndo(pile.id)}
          onDismiss={() => onDismiss(pile.id)}
          onAdjust={() => onAdjust(pile.id)}
        />
      ))}
    </section>
  );
}
