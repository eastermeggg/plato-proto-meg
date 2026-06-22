import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, FoldHorizontal } from 'lucide-react';

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
        className="relative w-full max-w-[500px] bg-white rounded-[12px] overflow-hidden"
        style={{
          boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.10), 0px 16px 40px -8px rgba(26,26,26,0.14)',
          border: '1px solid #e7e5e3',
        }}
      >
        {/* Header — serif title only */}
        <div className="flex items-start gap-3 px-6 pt-6">
          <h2
            className="flex-1 min-w-0"
            style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, lineHeight: '28px', letterSpacing: '-0.6px', color: '#292524', margin: 0, wordBreak: 'break-word' }}
          >
            Fusionner {count} document{count > 1 ? 's' : ''}
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-7 px-6 py-8">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fuse-name" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#292524' }}>
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
              className="w-full rounded-[8px] px-3 py-2 text-[14px] text-[#292524] bg-white border border-[#e7e5e3] hover:border-[#d6d3d1] focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
              style={{ fontFamily: SANS, boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}
            />
          </div>

          {/* Documents being merged */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center pb-4" style={{ borderBottom: '1px solid #e7e5e3' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase' }}>
                Documents fusionnés
              </span>
            </div>
            <ul
              className="rounded-[8px] border border-[#e7e5e3] overflow-hidden"
              style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 240, overflowY: 'auto' }}
            >
              {sources.map((s, i) => (
                <li
                  key={s.rowId}
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{ borderBottom: i < sources.length - 1 ? '1px solid #e7e5e3' : 'none' }}
                >
                  <span className="inline-flex items-center justify-center w-[22px] h-[22px] flex-shrink-0">
                    <Paperclip className="w-4 h-4 text-[#78716c]" strokeWidth={1.5} />
                  </span>
                  <span
                    className="flex-1 min-w-0 truncate"
                    style={{ fontFamily: SANS, fontSize: 14, lineHeight: '20px', color: '#292524' }}
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
            className="inline-flex items-center justify-center h-9 px-4 rounded-[8px] bg-white border border-[#e7e5e3] hover:bg-[#fafaf9] transition-colors"
            style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: '#292524', boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}
          >
            Annuler
          </button>
          <button
            onClick={commit}
            disabled={!clean}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[8px] text-white transition-colors"
            style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, backgroundColor: clean ? '#292524' : '#d6d3d1', cursor: clean ? 'pointer' : 'not-allowed', boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}
          >
            <FoldHorizontal className="w-4 h-4" strokeWidth={1.75} />
            Fusionner ({count} doc{count > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}
