import React from 'react';
import { CircleArrowUp } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';

/**
 * TotalsAmountPills — Plato design system. Source : Figma node 36104:7511
 * (page ComponentTable, famille « Chiffrage / PGP / Totaux »).
 *
 * Pastilles de totaux d'une barre récapitulative :
 *   type      'totalExp' (Total dépenses, tout muted) ·
 *             'rac' (Reste à charge, valeur encre + icône revalorisation) ·
 *             'totalIndemn' (Total indemnisé, fond muted plein, tout encre)
 *   size      'default' (pastille 32px, bord + radius 8, px 12) ·
 *             'sm' (nue 16px : libellé caption 12 + valeur 14)
 *   emphasis  false (seule valeur du set Figma - prop gardée pour parité d'API)
 *
 * En `default`, le libellé est en IBM Plex Mono 11 uppercase ; en `sm`, en
 * Inter caption 12. Les valeurs sont en Inter 500 14 (aucun serif dans ce
 * nœud, conformément au design context).
 */

const value14 = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['body-medium'].size,          // 14
  lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
  fontWeight: typography.scale['body-medium'].weight,      // 500
};
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,  // 11
  fontWeight: 500,
  textTransform: 'uppercase',
  lineHeight: 'normal',
  textBoxTrim: 'trim-both',
  textBoxEdge: 'cap alphabetic',
};

// Libellés Figma par type × taille.
const DEFAULT_LABELS = {
  totalExp: { default: 'Total dépenses', sm: 'Total dépenses' },
  rac: { default: 'Reste à charge', sm: 'R.A.C' },
  totalIndemn: { default: 'Total', sm: 'Total indem.' },
};
const DEFAULT_VALUES = {
  totalExp: { default: '551,20 €', sm: '551,20 €' },
  rac: { default: '551,20 €', sm: '551,20 €' },
  totalIndemn: { default: '551,20 €', sm: '540 €' },
};

export default function TotalsAmountPills({
  type = 'totalExp',          // 'totalExp' | 'rac' | 'totalIndemn'
  size = 'default',           // 'default' (32px) | 'sm'
  emphasis = false,           // parité d'API Figma (seul False existe)
  revalorisation = true,      // rac : icône circle-arrow-up devant la valeur
  label,
  value,
  className,
  style,
}) {
  const isSm = size === 'sm';
  const isIndemn = type === 'totalIndemn';
  const isRac = type === 'rac';
  const theLabel = label ?? DEFAULT_LABELS[type]?.[size] ?? '';
  const theValue = value ?? DEFAULT_VALUES[type]?.[size] ?? '';

  // Couleurs : totalExp = tout muted · rac = libellé muted / valeur encre ·
  // totalIndemn = tout encre (fond muted en default).
  const labelColor = isIndemn ? colors.semantic.foreground : colors.semantic.mutedForeground;
  const valueColor = type === 'totalExp' ? colors.semantic.mutedForeground : colors.semantic.foreground;

  const labelStyle = isSm
    ? { ...caption, color: labelColor, whiteSpace: 'nowrap' }
    : { ...monoCol, color: labelColor, whiteSpace: 'nowrap' };

  const shell = isSm
    ? {
        display: 'inline-flex',
        alignItems: isIndemn ? 'baseline' : 'center',
        gap: isIndemn ? 8 : 10,
        height: 16,
      }
    : {
        display: 'inline-flex', alignItems: 'center',
        gap: isIndemn ? 8 : 10,
        height: 32, padding: '0 12px', boxSizing: 'border-box',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radius.lg,
        background: isIndemn ? colors.semantic.muted : 'transparent',
      };

  return (
    <div className={className} style={{ ...shell, ...style }}>
      <span style={labelStyle}>{theLabel}</span>
      {isRac ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {revalorisation && (
            <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
          )}
          <span style={{ ...value14, color: valueColor, whiteSpace: 'nowrap' }}>{theValue}</span>
        </span>
      ) : (
        <span style={{ ...value14, color: valueColor, whiteSpace: 'nowrap' }}>{theValue}</span>
      )}
    </div>
  );
}

// Grille des variants — consommée par la démo du playground.
export const TOTALS_AMOUNT_PILLS_VARIANTS = [
  { type: 'totalExp', size: 'default' },
  { type: 'rac', size: 'default' },
  { type: 'totalIndemn', size: 'default' },
  { type: 'totalExp', size: 'sm' },
  { type: 'rac', size: 'sm' },
  { type: 'totalIndemn', size: 'sm' },
];
