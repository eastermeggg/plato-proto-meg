import React, { useState } from 'react';
import { Upload, FileText, Link as LinkIcon } from 'lucide-react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Separator from '../ui/Separator';
import { colors, shadows } from '../../design-system/tokens';

/**
 * Simple modal to fill in a "fiche cabinet" for a JP not in the Plato JP DB.
 *
 * Coquille : ui/Dialog (adoption pilote 24/09 - scrim overlay, surface
 * surfaceRaised, ombre L4/4xl par rôle, titre display-sm) ; séparateur
 * « OU » = ui/Separator label. Le corps (dropzone PDF, lien, apport) est
 * inchangé.
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
    <Dialog
      open
      onOpenChange={(o) => { if (!o) onClose?.(); }}
      width={520}
      title={'Dites-nous pourquoi cette jurisprudence est pertinente ?'}
      description={reference || undefined}
      footer={
        <>
          <Button variant="secondary" label="Annuler" onClick={onClose} />
          <Button
            label="Enregistrer"
            disabled={!canSave}
            onClick={() => onSave?.({ pdfFileName: pdfFileName.trim(), pdfDataURL, url: url.trim(), impact: impact.trim() })}
          />
        </>
      }
    >
      <div className="flex flex-col gap-6">
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

        {/* OU divider — Separator DS (label mono) */}
        <div style={{ marginTop: -4, marginBottom: -4 }}>
          <Separator label="OU" />
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
    </Dialog>
  );
}
