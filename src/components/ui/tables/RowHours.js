import React, { useState } from 'react';
import { ChevronRight, File, Copy, Coffee } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../../design-system/tokens';
import Badge from '../Badge';
import DataTableHeader from '../DataTableHeader';

/**
 * RowHours — Plato design system. Source : Figma node 36935:5317
 * (page ComponentTable, « Row Labor / Hours »).
 *
 * La rangée du relevé d'heures (droit social) : un tableau à trois crans
 * (mois → semaines → jours) + une rangée d'en-tête de colonnes.
 *
 * `type` :
 *   header  h 40 — deux DataTableHeader (mono 11 uppercase) : « Période » à
 *           gauche, « Total » calé à droite.
 *   month   h 72 — titre medium + sous-ligne grise ; badge secondaire « 100 % »
 *           à droite. Hover : fond background + action « Dupliquer le mois »
 *           (lien info) + badge info « 124 H ».
 *   weeks   h 52 (état Figma « L ») — chevron 16 (opacité 70) + « S1 » +
 *           « du 1er janv. ». Hover : action « Appliquer aux autres sem. » +
 *           badge info.
 *   days    h 51-52 — `state` : 'empty' (libellé seul, retrait 60) ·
 *           'filled' (libellé + note italique + badge info « 124 H ») ·
 *           'nonWorked' (libellé italique gris, pastille café, fond background ;
 *           hover : fond muted). Hover empty : bouton outline « Non travaillé »
 *           (+ la note-signal si fournie) ; hover filled : action « Appliquer
 *           au reste de la sem. ».
 *
 * Hover réel (useState) ; `pinHover` fige l'état survolé (démos / screenshots).
 * Compose Badge (secondary « 100 % », info « 124 H », iconOnly café).
 * Tokens uniquement ; défauts = exemples de la maquette.
 *
 * Écarts notés : bordure de rangée = colors.semantic.border (#dfdcd9, le
 * demi-cran assombri du DS) là où le Figma affiche var(--border) #e7e5e3 ;
 * les boutons de survol sont rendus localement (le Button canonique n'expose
 * pas la géométrie exacte lien-flush / h32-px12 de la maquette).
 */

const bodyRegular = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...bodyRegular, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`, // 0.12
};
// Action « lien » du survol (mois / semaines / jour rempli) : icône copy 16 +
// libellé 14 medium info — flush, sans fond (géométrie exacte de la maquette).
function HoverLinkAction({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Copy style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.feedback.info.text} />
      <span style={{ ...bodyMedium, color: colors.feedback.info.text, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

// Action « outline » du survol d'un jour vide : « Non travaillé » (café 16,
// h 32, px 12, rayon 8, ombre xs).
function HoverOutlineAction({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 32, padding: '8px 12px', borderRadius: radius.lg,
        background: colors.semantic.white,
        border: `1px solid ${colors.semantic.input}`,
        boxShadow: shadows.xs,
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      <Coffee style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.foreground} />
      <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

export default function RowHours({
  type = 'header',           // 'header' | 'month' | 'weeks' | 'days'
  state = 'empty',           // days : 'empty' | 'filled' | 'nonWorked'
  label,                     // libellé principal (mois, semaine, jour)
  subline,                   // sous-ligne grise (mois, semaine « du 1er janv. », jour)
  note,                      // note italique (jour : signal extrait, ex. SMS)
  badge,                     // badge de droite au repos ('100 %' mois/semaines, '124 H' jour rempli)
  hoverBadge,                // badge de droite au survol (mois/semaines : '124 H')
  hoverActionLabel,          // libellé de l'action de survol (défaut par type)
  onAction,                  // clic sur l'action de survol
  onClick,                   // clic sur la rangée
  collapsable = false,       // jour vide : chevron de dépliage
  icon = false,              // jour vide : icône fichier 16
  colLeftLabel = 'Période',  // header : colonne de gauche
  colRightLabel = 'Total',   // header : colonne de droite
  pinHover = false,          // fige l'état survolé (démos)
  width = '100%',
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const hover = pinHover || hovered;

  // ── header — h 40, deux cellules DataTableHeader (le canonique) ────────────
  if (type === 'header') {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', width,
          height: 40, background: colors.semantic.white,
          boxSizing: 'border-box', ...style,
        }}
      >
        <DataTableHeader label={colLeftLabel} width="auto" style={{ flex: '1 0 0', minWidth: 0 }} />
        <DataTableHeader label={colRightLabel} rightAlign width="auto" style={{ flex: '1 0 0', minWidth: 0 }} />
      </div>
    );
  }

  const isMonth = type === 'month';
  const isWeeks = type === 'weeks';
  const isDays = type === 'days';
  const isNonWorked = isDays && state === 'nonWorked';
  const isFilled = isDays && state === 'filled';
  const isEmpty = isDays && state === 'empty';

  // Défauts = exemples Figma.
  const lbl = label ?? (isMonth ? 'Janvier 2025' : isWeeks ? 'S1' : isNonWorked ? 'Samedi 4' : 'Lundi 1er');
  const sub = subline !== undefined ? subline : (isMonth ? 'Factures_Analyses-biologiques_Labo.pdf' : isWeeks ? 'du 1er janv.' : null);
  const restBadge = badge ?? (isFilled ? '124 H' : '100 %');
  const hovBadge = hoverBadge ?? '124 H';
  const actionLabel = hoverActionLabel ?? (
    isMonth ? 'Dupliquer le mois'
      : isWeeks ? 'Appliquer aux autres sem.'
      : isFilled ? 'Appliquer au reste de la sem.'
      : 'Non travaillé'
  );

  // Fonds : blanc au repos, background au survol ; jour non travaillé vit sur
  // background et fonce vers muted au survol.
  const baseBg = isNonWorked ? colors.semantic.background : colors.semantic.white;
  const hoverBg = isNonWorked ? colors.semantic.muted : colors.semantic.background;
  const minHeight = isMonth ? 72 : isEmpty ? 51 : 52;

  const rowStyle = {
    display: 'flex', alignItems: 'center', width, minHeight,
    background: hover ? hoverBg : baseBg,
    borderBottom: `1px solid ${colors.semantic.border}`,
    boxSizing: 'border-box',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.12s',
    ...style,
  };
  const rowHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
  };

  // Côté droit partagé (mois / semaines) : badge au repos, action + badge info
  // au survol.
  const rightMonthWeeks = (
    <div style={{ display: 'flex', flex: '1 0 0', minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '16px 12px', alignSelf: 'stretch', boxSizing: 'border-box' }}>
      {hover ? (
        <>
          <HoverLinkAction label={actionLabel} onClick={onAction} />
          <Badge variant="info" size="md" label={hovBadge} />
        </>
      ) : (
        restBadge != null && <Badge variant="secondary" size="md" label={restBadge} />
      )}
    </div>
  );

  // ── month — h 72 ───────────────────────────────────────────────────────────
  if (isMonth) {
    return (
      <div style={rowStyle} {...rowHandlers}>
        <div style={{ display: 'flex', flex: '1 0 0', minWidth: 0, alignItems: 'center', gap: 8, padding: '16px 12px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.semantic.foreground }}>{lbl}</span>
            {sub && (
              <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
            )}
          </div>
        </div>
        {rightMonthWeeks}
      </div>
    );
  }

  // ── weeks — h 52, état « L » ───────────────────────────────────────────────
  if (isWeeks) {
    return (
      <div style={rowStyle} {...rowHandlers}>
        <div style={{ display: 'flex', flex: '1 0 0', minWidth: 0, alignItems: 'center', gap: 10, padding: '16px 12px 16px 36px', boxSizing: 'border-box' }}>
          <ChevronRight style={{ width: 16, height: 16, flexShrink: 0, opacity: 0.7 }} strokeWidth={1.75} color={colors.semantic.foreground} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{lbl}</span>
            {sub && <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{sub}</span>}
          </div>
        </div>
        {rightMonthWeeks}
      </div>
    );
  }

  // ── days / nonWorked — libellé italique gris + pastille café ───────────────
  if (isNonWorked) {
    return (
      <div style={rowStyle} {...rowHandlers}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 406, flexShrink: 0, padding: '12px 12px 12px 60px', boxSizing: 'border-box' }}>
          <span style={{ ...bodyRegular, fontStyle: 'italic', color: colors.semantic.mutedForeground }}>{lbl}</span>
        </div>
        <div style={{ display: 'flex', flex: '1 0 0', minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '16px 12px', boxSizing: 'border-box' }}>
          <Badge variant="secondary" size="md" iconOnly icon={Coffee} title="Non travaillé" />
        </div>
      </div>
    );
  }

  // ── days / empty & filled — h 51-52 ────────────────────────────────────────
  // Vide au repos : libellé seul (retrait 60). Vide au survol : la note-signal
  // (si fournie) + bouton « Non travaillé ». Rempli : note italique + badge
  // « 124 H » ; au survol s'ajoute « Appliquer au reste de la sem. ».
  const nte = note !== undefined ? note
    : 'SMS du manager : « Peux-tu traiter la relance fournisseur avant ce soir ? »';
  const showNote = nte && (isFilled || hover);
  return (
    <div style={rowStyle} {...rowHandlers}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 406, flexShrink: 0, padding: '12px 12px 12px 60px', boxSizing: 'border-box', alignSelf: 'stretch' }}>
        {collapsable && (
          <ChevronRight style={{ width: 16, height: 16, flexShrink: 0, opacity: 0.7 }} strokeWidth={1.75} color={colors.semantic.foreground} />
        )}
        {icon && (
          <File style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.foreground} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
          <span style={{ ...bodyRegular, color: colors.semantic.foreground }}>{lbl}</span>
          {sub && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
          )}
        </div>
      </div>
      {showNote && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 406, flexShrink: 0, padding: 12, boxSizing: 'border-box' }}>
          <span style={{ ...bodyRegular, fontStyle: 'italic', color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {nte}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flex: '1 0 0', minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 12, padding: '16px 12px', boxSizing: 'border-box' }}>
        {isEmpty && hover && <HoverOutlineAction label={actionLabel} onClick={onAction} />}
        {isFilled && hover && <HoverLinkAction label={actionLabel} onClick={onAction} />}
        {isFilled && <Badge variant="info" size="md" label={restBadge} />}
      </div>
    </div>
  );
}

// Liste ordonnée des combinaisons — consommée par les démos du playground.
export const ROW_HOURS_VARIANTS = [
  { type: 'header' },
  { type: 'month' },
  { type: 'month', pinHover: true },
  { type: 'weeks' },
  { type: 'weeks', pinHover: true },
  { type: 'days', state: 'empty' },
  { type: 'days', state: 'empty', pinHover: true },
  { type: 'days', state: 'filled' },
  { type: 'days', state: 'filled', pinHover: true },
  { type: 'days', state: 'nonWorked' },
  { type: 'days', state: 'nonWorked', pinHover: true },
];
