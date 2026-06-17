import React, { useState, useEffect, useRef } from 'react';
import { X, Combine, FileText } from 'lucide-react';

// Fusionner — confirm + name the merge of several selected documents into a
// single pièce. Chrome mirrors MoveToFolderModal (white rounded card, header
// with icon + subtitle, body, footer Annuler / primary dark action) so the
// bulk-action modals feel like one family.
//
// Each selected document becomes one part of the merged pièce, in the order
// shown here — so the result can be re-separated at any time via the document
// preview's « Modifier le découpage ». The actual state mutation lives in
// App.js (it spans dropFirstPieces + piles); this modal only confirms + names.

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

  const totalPages = sources.reduce((n, s) => n + (s.pages || 1), 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ paddingTop: '10vh' }}
      onClick={() => onOpenChange?.(false)}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-white rounded-[12px] overflow-hidden"
        style={{
          boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.10), 0px 16px 40px -8px rgba(26,26,26,0.14)',
          border: '1px solid #e7e5e3',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 bg-[#f5f5f4] text-[#44403c]">
              <Combine className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                Fusionner {sources.length} documents
              </h2>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: '#78716c', margin: '2px 0 0' }}>
                Combinés en une seule pièce de {totalPages} page{totalPages > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange?.(false)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#78716c] hover:bg-[#fafaf9] hover:text-[#292524] transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid #e7e5e3' }}>
          <label className="block text-[12px] text-[#a8a29e] mb-1" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Nom de la pièce fusionnée
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
            placeholder="Nom du document…"
            className="w-full rounded-[8px] px-3 h-10 text-[14px] text-[#292524] bg-[#fafaf9] border border-[#e7e5e3] hover:border-[#d6d3d1] focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          />

          <div className="text-[12px] text-[#a8a29e] mt-4 mb-1.5" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Documents à fusionner ({sources.length})
          </div>
          <ul
            className="rounded-[8px] border border-[#e7e5e3] overflow-hidden"
            style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 220, overflowY: 'auto' }}
          >
            {sources.map((s, i) => (
              <li
                key={s.rowId}
                className="flex items-center gap-2.5 px-3 py-2"
                style={{ borderBottom: i < sources.length - 1 ? '1px solid #f0efed' : 'none' }}
              >
                <span className="text-[11px] tabular-nums text-[#d6d3d1] w-4 flex-shrink-0 text-right">{i + 1}</span>
                <FileText className="w-3.5 h-3.5 text-[#a8a29e] flex-shrink-0" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 text-[13px] text-[#44403c] truncate" title={s.name}>{s.name}</span>
                <span className="text-[11px] tabular-nums text-[#a8a29e] flex-shrink-0">{s.pages || 1} p.</span>
              </li>
            ))}
          </ul>

          <p className="text-[12px] text-[#a8a29e] mt-3 leading-[16px]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            Vous pourrez les re-séparer à tout moment via « Modifier le découpage ».
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3"
          style={{ borderTop: '1px solid #e7e5e3', backgroundColor: '#fafaf9' }}
        >
          <button
            onClick={() => onOpenChange?.(false)}
            className="inline-flex items-center px-3 h-9 rounded-[8px] text-[13px] font-medium text-[#44403c] hover:bg-[#f0efed] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={commit}
            disabled={!clean}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[8px] text-[13px] font-medium text-white transition-colors"
            style={{ backgroundColor: clean ? '#292524' : '#d6d3d1', cursor: clean ? 'pointer' : 'not-allowed' }}
          >
            <Combine className="w-3.5 h-3.5" strokeWidth={2} />
            Fusionner
          </button>
        </div>
      </div>
    </div>
  );
}
