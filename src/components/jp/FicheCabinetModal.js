import React, { useState, useEffect } from 'react';
import { Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { colors, shadows } from '../../design-system/tokens';

/**
 * Simple modal to fill in a "fiche cabinet" for a JP not in the Plato JP DB.
 * Visual chrome follows Plato's standard modal pattern (border, shadow,
 * serif title, dashed drop zone with cream gradient).
 *
 * Props:
 *   - reference (string)        — pre-filled label of the decision (read-only)
 *   - existing (object|null)    — current customJP record (for re-edit)
 *   - onClose()                 — dismiss
 *   - onSave({ pdfFileName, url, impact }) — persist
 */
export default function FicheCabinetModal({ reference, existing, onClose, onSave }) {
  const [pdfFileName, setPdfFileName] = useState(existing?.pdfFileName || '');
  const [pdfDataURL, setPdfDataURL] = useState(existing?.pdfDataURL || '');
  const [url, setUrl] = useState(existing?.url || '');
  const [impact, setImpact] = useState(existing?.impact || '');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFile = (file) => {
    if (!file || !file.name) return;
    setPdfFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPdfDataURL(reader.result);
    reader.readAsDataURL(file);
  };
  const hasSource = pdfFileName.trim() || url.trim();
  const canSave = hasSource && impact.trim().length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border flex flex-col"
        style={{
          width: 520,
          borderRadius: 12,
          boxShadow: shadows['md'],
        }}
      >
        {/* Card Header */}
        <div className="flex flex-col gap-1 px-6 pt-6 pb-0">
          <h2 style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: 24, fontWeight: 500, color: colors.semantic.foreground, letterSpacing: '-0.6px', lineHeight: '28px', margin: 0 }}>
            Dites-nous pourquoi cette jurisprudence est pertinente&nbsp;?
          </h2>
          {reference && (
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: colors.semantic.mutedForeground, lineHeight: '20px', marginTop: 4 }}>
              {reference}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-6 pt-6 pb-8">
          {/* PDF drop zone */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fiche-cabinet-pdf" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: colors.semantic.foreground, lineHeight: '20px' }}>
              PDF de la décision
            </label>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="flex items-center justify-center cursor-pointer"
              style={{
                border: `1px dashed ${dragOver ? colors.accents.ochre : (pdfFileName ? colors.accents.ochre : colors.semantic.borderStrong)}`,
                borderRadius: 8,
                padding: 6,
              }}
            >
              <div
                className="flex flex-1 items-center justify-center gap-4 px-4 py-4 w-full"
                style={{
                  borderRadius: 8,
                  background: pdfFileName || dragOver
                    ? `linear-gradient(to top, ${colors.semantic.accent} 50%, rgba(253, 248, 244, 0))`
                    : `linear-gradient(to top, ${colors.semantic.accent} 50%, rgba(238,236,230, 0))`,
                }}
              >
                {pdfFileName ? (
                  <>
                    <FileText className="w-5 h-5" style={{ color: colors.accents.ochre }} />
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: colors.semantic.foreground, lineHeight: '20px' }}>
                      {pdfFileName}
                      <span style={{ color: colors.semantic.mutedForeground, marginLeft: 6 }}> · cliquez pour remplacer</span>
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" style={{ color: colors.semantic.mutedForeground }} />
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, lineHeight: '20px', color: colors.semantic.mutedForeground }}>
                      Déposez ou{' '}
                      <span style={{ color: colors.feedback.info.text, fontWeight: 500 }}>cliquez</span>
                      {' '}pour ajouter un justificatif
                    </p>
                  </>
                )}
              </div>
              <input id="fiche-cabinet-pdf" type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
            </label>
          </div>

          {/* OU divider */}
          <div className="flex items-center gap-3" style={{ marginTop: -4, marginBottom: -4 }}>
            <span className="flex-1 h-px bg-border" />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, letterSpacing: '0.1em' }}>
              OU
            </span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {/* Lien de la décision */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fiche-cabinet-url" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: colors.semantic.foreground, lineHeight: '20px' }}>
              Lien de la décision
            </label>
            <div
              className="flex items-center gap-1 px-3 py-2 bg-surface"
              style={{
                border: `1px solid ${colors.semantic.border}`,
                borderRadius: 8,
                boxShadow: shadows.xs,
              }}
            >
              <LinkIcon className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" />
              <input
                id="fiche-cabinet-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder-foreground-muted focus:outline-none"
                style={{ fontFamily: "'Inter', system-ui, sans-serif", lineHeight: '20px' }}
              />
            </div>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: colors.semantic.foregroundMuted, lineHeight: '18px' }}>
              Lien doctrine, lexis, lexbase, légifrance, etc.
            </p>
          </div>

          {/* Apport */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fiche-cabinet-impact" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: colors.semantic.foreground, lineHeight: '20px' }}>
              Apport de la décision
            </label>
            <textarea
              id="fiche-cabinet-impact"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              rows={6}
              placeholder="Ex. Taux horaire ATPT de 28 €/h pour une étudiante résidant à Paris intra-muros."
              className="w-full px-3 py-2 text-[14px] text-foreground bg-surface placeholder-foreground-muted focus:outline-none focus:border-foreground-muted resize-y"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: '20px',
                border: `1px solid ${colors.semantic.border}`,
                borderRadius: 8,
                boxShadow: shadows.xs,
              }}
            />
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pt-0 pb-6">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 transition-colors hover:opacity-90"
            style={{
              height: 36,
              borderRadius: 8,
              backgroundColor: colors.semantic.muted,
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1))',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: colors.semantic.foregroundTertiary,
              lineHeight: '20px',
            }}
          >
            Annuler
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave?.({ pdfFileName: pdfFileName.trim(), pdfDataURL, url: url.trim(), impact: impact.trim() })}
            className="flex items-center justify-center px-4 py-2 transition-all"
            style={{
              height: 36,
              borderRadius: 8,
              backgroundColor: canSave ? colors.semantic.primary : colors.semantic.muted,
              color: canSave ? 'white' : colors.semantic.foregroundMuted,
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
