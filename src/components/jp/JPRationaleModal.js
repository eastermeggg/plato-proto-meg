import React, { useState, useEffect } from 'react';
import JPMemoryRow from './JPMemoryRow';

// Chato pre-fills a draft rationale from the decision's metadata.
function draftRationaleFor(decision) {
  if (!decision) return '';
  const amt = decision.amounts?.[0];
  const profile = decision.victimProfile ? ` pour ${decision.victimProfile.toLowerCase()}` : '';
  const sub = amt ? `${amt.poste} à ${amt.displayValue}` : 'une décision de référence';
  return `${decision.jurisdiction || 'Décision'} retenant ${sub}${profile}. À conserver comme référence cabinet pour les dossiers comparables.`;
}

/**
 * Modal that asks the lawyer to confirm WHY they're saving this JP as a
 * cabinet reference. Pre-fills a Chato-drafted rationale that the lawyer
 * can edit before saving.
 *
 * Props:
 *   decision (object)        — the JP being saved (read-only preview at top)
 *   initialRationale         — optional override of the Chato draft
 *   onClose()
 *   onSave(rationale: string)
 */
export default function JPRationaleModal({ decision, initialRationale, onClose, onSave }) {
  const [rationale, setRationale] = useState(
    initialRationale != null && initialRationale.length > 0
      ? initialRationale
      : draftRationaleFor(decision)
  );

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!decision) return null;
  const canSave = rationale.trim().length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#e7e5e3] flex flex-col"
        style={{
          width: 520,
          borderRadius: 12,
          boxShadow: '0 2px 4px -2px rgba(26,26,26,0.05), 0 4px 6px -1px rgba(26,26,26,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1 px-6 pt-6 pb-0">
          <h2 style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 24, fontWeight: 500, color: '#292524', letterSpacing: '-0.6px', lineHeight: '28px', margin: 0 }}>
            Dites-nous pourquoi cette jurisprudence est pertinente&nbsp;?
          </h2>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#78716c', lineHeight: '20px', marginTop: 4 }}>
            Cette note guide l'agent quand il citera la décision dans vos actes.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-8">
          {/* JP card preview */}
          <div
            style={{
              border: '1px solid #e7e5e3',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <JPMemoryRow decision={decision} />
          </div>

          {/* Apport */}
          <div className="flex flex-col gap-2">
            <label htmlFor="jp-rationale-impact" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: '#292524', lineHeight: '20px' }}>
              Apport de la décision
            </label>
            <textarea
              id="jp-rationale-impact"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={6}
              placeholder="Ex. Taux horaire ATPT de 28 €/h pour une étudiante résidant à Paris intra-muros."
              className="w-full px-3 py-2 text-[14px] text-[#292524] bg-white placeholder-[#a8a29e] focus:outline-none focus:border-[#a8a29e] resize-y"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: '24px',
                border: '1px solid #e7e5e3',
                borderRadius: 8,
                boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
                minHeight: 140,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pt-0 pb-6">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 transition-colors hover:opacity-90"
            style={{
              height: 36,
              borderRadius: 8,
              backgroundColor: '#eeece6',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: '#44403c',
              lineHeight: '20px',
            }}
          >
            Annuler
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave?.(rationale.trim())}
            className="flex items-center justify-center px-4 py-2 transition-all"
            style={{
              height: 36,
              borderRadius: 8,
              backgroundColor: canSave ? '#292524' : '#eeece6',
              color: canSave ? 'white' : '#a8a29e',
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '20px',
              filter: canSave ? 'drop-shadow(0 1px 1px rgba(26,26,26,0.05))' : 'none',
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
