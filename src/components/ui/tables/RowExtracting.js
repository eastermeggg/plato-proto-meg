import React from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';

/**
 * RowExtracting — Plato design system. Source : Figma node 35810:14419
 * (page ComponentTable, groupe « Documents » des familles de rangées).
 *
 * Rangée de feedback d'extraction IA (pendant l'ingestion de documents) :
 *   status="pending"  (52px) spinner 20 + nom du document + « Extraction en
 *                     cours… ». Dégradé background → blanc à ~15%.
 *   status="progress" (52px) spinner + compteur de lot à gauche ; à droite
 *                     barre de progression 70x4 + « fait/total » + « N err. ».
 *   status="error"    (124px) pastille destructive 20 (X blanc) + titre +
 *                     liste fichier/raison. Dégradé destructive-subtle → blanc.
 *
 * Custom : rangée de statut pleine largeur, aucune cellule DataTableCell ne
 * mappe. Styles inline, tokens uniquement.
 */

const bodyMedium = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['body-medium'].size,                 // 14
  lineHeight: `${typography.scale['body-medium'].lineHeight}px`,  // 20
  fontWeight: typography.scale['body-medium'].weight,             // 500
};
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
  fontWeight: typography.scale.caption.weight,            // 400
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const captionMedium = {
  ...caption,
  fontWeight: typography.scale['caption-medium'].weight,  // 500
  letterSpacing: 0,
};
const counter = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.counter.size,                // 10
  lineHeight: 'normal',
  fontWeight: typography.scale.counter.weight,            // 500
};

function Spinner() {
  return (
    <LoaderCircle
      style={{ width: 20, height: 20, flexShrink: 0, animation: 'spin-slow 1s linear infinite' }}
      strokeWidth={2}
      color={colors.semantic.mutedForeground}
    />
  );
}

export default function RowExtracting({
  status = 'pending',     // 'pending' | 'progress' | 'error'
  width = '100%',
  // Contenu (défauts = exemples du Figma)
  docName = 'Nom du document.pdf',
  countLabel = '10 documents',
  caption: captionText = 'Extraction en cours…',
  progress = { done: 5, total: 10, errors: 2 },
  errorTitle = "Trois documents n'ont pas pu être traités ou les données n'ont pas pu être extraites.",
  errors = [
    { file: 'scan_ordonnance_floue.jpg', reason: 'Document illisible' },
    { file: 'decompte_secu.xlsx', reason: 'Format non supporté' },
    { file: 'facture_vide.pdf', reason: 'Fichier vide' },
  ],
  style,
}) {
  const isError = status === 'error';
  const isProgress = status === 'progress';

  const rowBase = {
    display: 'flex',
    width, boxSizing: 'border-box',
    padding: 16,
    borderBottom: `1px solid ${colors.semantic.border}`,
    background: `linear-gradient(to right, ${
      isError ? colors.feedback.destructive.subtle : colors.semantic.background
    } 0%, ${colors.semantic.white} 14.904%)`,
    ...style,
  };

  // ── Error : pastille + titre + liste fichier/raison (124px) ──────────────
  if (isError) {
    return (
      <div style={{ ...rowBase, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 20, height: 20, padding: '2px 4px', boxSizing: 'border-box',
            borderRadius: radius.full, background: colors.feedback.destructive.base,
            flexShrink: 0,
          }}>
            <X style={{ width: 12, height: 12 }} strokeWidth={2.5} color={colors.feedback.destructive.foreground} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.feedback.destructive.text, whiteSpace: 'nowrap' }}>
              {errorTitle}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {errors.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...captionMedium, color: colors.feedback.destructive.text, whiteSpace: 'nowrap' }}>
                    {e.file}
                  </span>
                  <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
                    {e.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending / Progress (52px = 16 + 20 + 16) ─────────────────────────────
  const pct = progress && progress.total
    ? Math.max(0, Math.min(100, (progress.done / progress.total) * 100))
    : 0;

  return (
    <div style={{ ...rowBase, alignItems: 'center', justifyContent: isProgress ? 'space-between' : 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Spinner />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {isProgress ? countLabel : docName}
          </span>
          <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
            {captionText}
          </span>
        </div>
      </div>
      {isProgress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{
            width: 70, height: 4, borderRadius: radius.full, overflow: 'hidden',
            background: colors.semantic.secondary, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
              background: colors.semantic.primary,
              borderRadius: `${radius.full} 0 0 ${radius.full}`,
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ ...counter, color: colors.semantic.mutedForeground }}>
              {progress.done}/{progress.total}
            </span>
            {progress.errors > 0 && (
              <span style={{ ...counter, color: colors.feedback.destructive.base }}>
                {progress.errors} err.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const ROW_EXTRACTING_STATUSES = ['pending', 'progress', 'error'];
