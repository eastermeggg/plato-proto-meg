import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, FoldHorizontal } from 'lucide-react';
import { colors, shadows } from '../../design-system/tokens';

// Fusionner — confirm + name the merge of several selected documents into a
// single pièce. Layout follows the Plato "DialogMerge" design: a serif title,
// a named-input block, a mono-headed list of the documents being merged, and a
// footer with Annuler / a primary « Fusionner (N docs) » action.
//
// Each selected document becomes one part of the merged pièce, in the order
// shown here — so the result can be re-separated at any time via the document
// preview's « Modifier le découpage ». The actual state mutation lives in
// App.js (it spans dropFirstPieces + piles); this modal only confirms + names.

const SANS = "'Inter', system-ui, sans-serif";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";

export default function FusePiecesModal({ open, onOpenChange, sources = [], defaultName = '', onConfirm }) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [open, defaultName]);

  const clean = (name || '').trim();
  const commit = () => {
    if (!clean) return;
    onConfirm?.(clean);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const count = sources.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ paddingTop: '10vh' }}
      onClick={() => onOpenChange?.(false)}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] bg-surface rounded-[12px] overflow-hidden"
        style={{
          boxShadow: shadows['2xl'],
          border: `1px solid ${colors.semantic.border}`,
        }}
      >
        {/* Header — serif title only */}
        <div className="flex items-start gap-3 px-6 pt-6">
          <h2
            className="flex-1 min-w-0"
            style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, lineHeight: '28px', letterSpacing: '-0.6px', color: colors.semantic.foreground, margin: 0, wordBreak: 'break-word' }}
          >
            Fusionner {count} document{count > 1 ? 's' : ''}
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-7 px-6 py-8">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fuse-name" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: colors.semantic.foreground }}>
              Nom de la pièce fusionnée
            </label>
            <input
              id="fuse-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
              placeholder="Nom du document…"
              className="w-full rounded-[8px] px-3 py-2 text-[14px] text-foreground bg-surface border border-border hover:border-border-strong focus:border-border-hover focus:outline-none focus:ring-1 focus:ring-stone-subtle transition-colors"
              style={{ fontFamily: SANS, boxShadow: shadows.xs }}
            />
          </div>

          {/* Documents being merged */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center pb-4" style={{ borderBottom: `1px solid ${colors.semantic.border}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground, textTransform: 'uppercase' }}>
                Documents fusionnés
              </span>
            </div>
            <ul
              className="rounded-[8px] border border-border overflow-hidden"
              style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 240, overflowY: 'auto' }}
            >
              {sources.map((s, i) => (
                <li
                  key={s.rowId}
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{ borderBottom: i < sources.length - 1 ? `1px solid ${colors.semantic.border}` : 'none' }}
                >
                  <span className="inline-flex items-center justify-center w-[22px] h-[22px] flex-shrink-0">
                    <Paperclip className="w-4 h-4 text-foreground-secondary" strokeWidth={1.5} />
                  </span>
                  <span
                    className="flex-1 min-w-0 truncate"
                    style={{ fontFamily: SANS, fontSize: 14, lineHeight: '20px', color: colors.semantic.foreground }}
                    title={s.name}
                  >
                    {s.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <button
            onClick={() => onOpenChange?.(false)}
            className="inline-flex items-center justify-center h-9 px-4 rounded-[8px] bg-surface border border-border hover:bg-background transition-colors"
            style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: colors.semantic.foreground, boxShadow: shadows['2xs'] }}
          >
            Annuler
          </button>
          <button
            onClick={commit}
            disabled={!clean}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[8px] text-white transition-colors"
            style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, backgroundColor: clean ? colors.semantic.primary : colors.semantic.borderStrong, cursor: clean ? 'pointer' : 'not-allowed', boxShadow: shadows['2xs'] }}
          >
            <FoldHorizontal className="w-4 h-4" strokeWidth={1.75} />
            Fusionner ({count} doc{count > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}
