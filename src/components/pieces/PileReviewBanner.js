import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw, Copy, Check, Undo2, Loader2, FileText } from 'lucide-react';
import PileReviewCard from './PileReviewCard';

// "À vérifier" zone — sits between the "N pièces · Ajouter" header and the table.
// Documents are analysed in the background (the chat shows progress); only the
// ones that need the avocat's attention surface here, as compact single-row
// cards in one shared shell:
//   • processing error   — analysis failed → Réessayer / Ignorer
//   • doublon            — possible duplicate → Garder les deux / Ignorer / Voir
//   • split              — detected as splittable → Garder / Éclater / Ajuster

const DISMISS_MS = 6000;
const SHELL_SHADOW = '0 1px 2px rgba(28,25,23,0.04), 0 6px 18px -10px rgba(28,25,23,0.10)';
const SHELL_SHADOW_HOVER = '0 1px 2px rgba(28,25,23,0.05), 0 10px 22px -10px rgba(28,25,23,0.14)';

// Shared compact action buttons — all the same height, padding and centering
// so the row of CTAs ends on a single clean right edge.
const btnBase = "inline-flex items-center justify-center gap-1.5 h-7 px-2.5 text-[13px] font-medium rounded-md whitespace-nowrap transition-colors";
// Cards use outline/secondary buttons only — no filled primary.
const btnLight = `${btnBase} text-[#44403c] bg-white border border-[#d6d3d1] hover:bg-[#f8f7f5]`;

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
    <section className="mt-3" aria-label="Documents à vérifier">
      {/* Boxed "à vérifier" section — bordered canvas with generous vertical
          padding; the white cards float on it to give the group structure. */}
      <div className="rounded-lg border border-[#e7e5e3] bg-[#f8f7f5] px-3 pt-4 pb-4">
        {toCheck > 0 && (
          <header className="px-1 pb-2.5">
            <span className="text-[12px] font-medium text-[#78716c]">
              {toCheck} document{toCheck > 1 ? 's' : ''} à vérifier
            </span>
          </header>
        )}
        <div className="flex flex-col gap-1.5">
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
      </div>
    </section>
  );
}

// Shared card chrome — a single compact row.
function CardShell({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-lg bg-white"
      style={{ boxShadow: hovered ? SHELL_SHADOW_HOVER : SHELL_SHADOW, transition: 'box-shadow 200ms ease' }}
    >
      <div className="px-3.5 py-2.5 flex items-center gap-3" style={{ animation: 'fadeIn 200ms ease' }}>
        {children}
      </div>
    </article>
  );
}

function CardIcon({ bg, color, children }) {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ background: bg, color }}>
      {children}
    </div>
  );
}

// filename + muted state on one truncating line (full text in the title attr).
function CardLabel({ name, state }) {
  return (
    <div className="flex-1 min-w-0 text-[13px] leading-[18px] truncate" title={`${name} · ${state}`}>
      <span className="font-medium text-[#1c1917]">{name}</span>
      <span className="text-[#78716c]"> · {state}</span>
    </div>
  );
}

// ── Loading card (aggregate background-processing indicator) ──────────────
function LoadingCard({ count }) {
  return (
    <CardShell>
      <CardIcon bg="#f5f5f4" color="#78716c"><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0 text-[13px] leading-[18px] text-[#44403c] truncate">
        Analyse de <span className="font-medium text-[#1c1917] tabular-nums">{count}</span> document{count > 1 ? 's' : ''}…
      </div>
    </CardShell>
  );
}

// ── Processing-error card ────────────────────────────────────────────────
function ErrorCard({ name, onRetry, onIgnore }) {
  return (
    <CardShell>
      <CardIcon bg="#fdecec" color="#c0392b"><AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <CardLabel name={name} state="Échec de l'analyse" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onRetry} className={btnLight}><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />Réessayer</button>
        <button onClick={onIgnore} className={btnLight}>Ignorer</button>
      </div>
    </CardShell>
  );
}

// ── Possible-duplicate card (choice → done phases) ──────────────────────────
function DoublonCard({ name, ofName, onKeepBoth, onIgnore, onView }) {
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
        <span className="absolute left-0 bottom-0 h-[2px]" style={{ background: '#4a9168', width: '100%', transformOrigin: 'left', animation: `pileReviewDismiss ${DISMISS_MS}ms linear forwards` }} />
      </CardShell>
    );
  }
  return (
    <CardShell>
      <CardIcon bg="#fdf4e7" color="#b45309"><Copy className="w-3.5 h-3.5" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-[16px] font-medium text-[#1c1917]">Doublon possible</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-[16px] text-[#78716c] min-w-0">
          <span className="flex items-center gap-1 min-w-0 max-w-[46%]" title={name}>
            <FileText className="w-3 h-3 text-[#a8a29e] flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{name}</span>
          </span>
          <span className="text-[#d6d3d1] flex-shrink-0">≈</span>
          <span className="flex items-center gap-1 min-w-0 max-w-[46%]" title={ofName}>
            <FileText className="w-3 h-3 text-[#a8a29e] flex-shrink-0" strokeWidth={1.75} />
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
