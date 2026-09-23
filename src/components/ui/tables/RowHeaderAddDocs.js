import React, { useState } from 'react';
import { Upload, ChevronDown, Plus, Sparkle } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../../design-system/tokens';

/**
 * RowHeaderAddDocs — Plato design system. Source : Figma node 35820:10289
 * (page ComponentTable, groupe « Documents » des familles de rangées).
 *
 * Rangée d'en-tête « ajouter des documents » d'une table de pièces :
 *   type="default" (68px)  zone de dépôt en pointillés (flex-1) + bouton
 *                          optionnel « Extraire depuis un doc. existant »
 *                          (existingDoc) + action ghost bleue « + Label ».
 *                          Le hover (fond accent + bord renforcé) est réel
 *                          (souris) ou forcé via pinHover / type="hover".
 *   type="simple" (52px)   compteur d'items à gauche + action ghost à droite.
 *   type="report" (76px)   bandeau info (dégradé info-subtle → carte à ~15%) :
 *                          sparkle pleine + 2 lignes + boutons Extraire /
 *                          Ajouter manuellement.
 *
 * Custom : aucune primitive existante ne couvre cette rangée composite
 * (dropzone inline 36px + boutons dans une rangée de table). Styles inline,
 * tokens uniquement (cf. src/components/ui/CLAUDE.md).
 */

const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...body, fontWeight: typography.scale['body-medium'].weight }; // 500

export default function RowHeaderAddDocs({
  type = 'default',        // 'default' | 'hover' | 'simple' | 'report'
  pinHover = false,        // force le visuel hover de la drop zone (démo)
  existingDoc = false,     // variante Default/hover : bouton « doc. existant »
  width = '100%',
  // Contenu (défauts = exemples du Figma)
  dropPrefix = 'Déposez ou ',
  dropAction = 'cliquez',
  dropSuffix = ' pour ajouter un justificatif',
  existingDocLabel = 'Extraire depuis un doc. existant',
  actionLabel = 'Label',
  itemsLabel = 'XXX items',
  reportTitle = "Rapport d'expertise disponible. Les périodes de DFT peuvent être extraites.",
  reportMeta = 'Nom du document ici · 18/04/2025',
  extractLabel = 'Extraire',
  manualLabel = 'Ajouter manuellement',
  onDrop,
  onAction,
  onExistingDoc,
  onExtract,
  onManual,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isReport = type === 'report';
  const isSimple = type === 'simple';
  const dropHover = pinHover || type === 'hover' || hovered;

  const rowBase = {
    display: 'flex',
    alignItems: 'center',
    width,
    boxSizing: 'border-box',
    borderBottom: `1px solid ${colors.semantic.border}`,
    ...style,
  };

  // Bouton ghost « + Label » (info) partagé Default / Simple.
  const ghostAction = (
    <button
      type="button"
      onClick={onAction}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Plus style={{ width: 16, height: 16 }} strokeWidth={2} color={colors.feedback.info.text} />
      <span style={{ ...bodyMedium, color: colors.feedback.info.text, whiteSpace: 'nowrap' }}>
        {actionLabel}
      </span>
    </button>
  );

  // ── Simple : « XXX items » + action (52px = 16 + 20 + 16) ────────────────
  if (isSimple) {
    return (
      <div style={{
        ...rowBase,
        justifyContent: 'space-between',
        background: colors.semantic.card,
        padding: '16px 16px 16px 18px',
      }}>
        <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {itemsLabel}
        </span>
        {ghostAction}
      </div>
    );
  }

  // ── Report : bandeau « rapport disponible » (76px = 16 + 44 + 16) ────────
  if (isReport) {
    return (
      <div style={{
        ...rowBase,
        justifyContent: 'space-between',
        alignItems: 'center',
        background: `linear-gradient(to right, ${colors.feedback.info.subtle} 0%, ${colors.semantic.card} 14.774%)`,
        padding: 16,
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '3px 0', flexShrink: 0 }}>
            <Sparkle
              style={{ width: 16, height: 16 }}
              strokeWidth={1.75}
              color={colors.feedback.info.text}
              fill={colors.feedback.info.text}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.feedback.info.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reportTitle}
            </span>
            <span style={{ ...body, color: colors.semantic.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reportMeta}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onExtract}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 36, padding: '8px 14px', boxSizing: 'border-box',
              background: colors.semantic.primary,
              border: 'none', borderRadius: radius.lg,
              boxShadow: shadows.xs, cursor: 'pointer',
            }}
          >
            <Sparkle style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.primaryForeground} />
            <span style={{ ...bodyMedium, color: colors.semantic.primaryForeground, whiteSpace: 'nowrap' }}>
              {extractLabel}
            </span>
          </button>
          <button
            type="button"
            onClick={onManual}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 36, padding: '8px 16px', boxSizing: 'border-box',
              background: colors.semantic.white,
              border: `1px solid ${colors.semantic.input}`, borderRadius: radius.lg,
              boxShadow: shadows.xs, cursor: 'pointer',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} strokeWidth={2} color={colors.semantic.foreground} />
            <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
              {manualLabel}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Default / hover : drop zone + actions (68px = 16 + 36 + 16) ──────────
  return (
    <div style={{
      ...rowBase,
      justifyContent: 'flex-end',
      background: colors.semantic.card,
      padding: 16,
      gap: 16,
    }}>
      <div
        onClick={onDrop}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          flex: '1 0 0', minWidth: 1, height: 36,
          padding: '6px 10px', boxSizing: 'border-box',
          border: `1px dashed ${dropHover ? colors.semantic.borderHover : colors.semantic.borderStrong}`,
          borderRadius: radius.lg,
          background: dropHover ? colors.semantic.accent : 'transparent',
          cursor: 'pointer',
        }}
      >
        <Upload style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
        <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {dropPrefix}
          <span style={{ ...bodyMedium, color: colors.feedback.info.text }}>{dropAction}</span>
          {dropSuffix}
        </span>
      </div>
      {existingDoc && (
        <button
          type="button"
          onClick={onExistingDoc}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 36, padding: '8px 16px', boxSizing: 'border-box', flexShrink: 0,
            background: colors.semantic.secondary,
            border: 'none', borderRadius: radius.lg, cursor: 'pointer',
          }}
        >
          <span style={{ ...bodyMedium, color: colors.semantic.secondaryForeground, whiteSpace: 'nowrap' }}>
            {existingDocLabel}
          </span>
          <ChevronDown style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.secondaryForeground} />
        </button>
      )}
      {ghostAction}
    </div>
  );
}

export const ROW_HEADER_ADD_DOCS_TYPES = ['default', 'hover', 'simple', 'report'];
