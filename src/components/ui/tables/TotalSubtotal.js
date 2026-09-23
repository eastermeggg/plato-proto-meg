import React, { useState } from 'react';
import { Calculator, ChevronRight, ChevronDown, CircleArrowUp } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../../design-system/tokens';

/**
 * TotalSubtotal — Plato design system. Source : Figma node 36459:3458
 * (page ComponentTable, famille « Chiffrage / PGP / Totaux »).
 *
 * Bloc total / sous-total repliable, posé au pied de toutes les tables.
 * Variants (prop `variant`) et hauteurs Figma :
 *   collapsed  60px   une rangée : calculatrice + libellé + montant SERIF + chevron
 *   subtotal   60px   idem, fond assombri (voile encre 5% sur muted)
 *   expanded   194px  + filet + détail ligne à ligne (Inter 14)
 *   emphasis   165px  fond encre (grand total) : détail + filet + rangée total, sans chevron
 *
 * Le montant principal est en RL Para 20/28, -0.6 (style Figma display-sm en
 * corps 20 - métriques partagées avec heading-lg-medium) — marqueur voulu de
 * la famille. Les lignes de détail restent en Inter 14.
 *
 * Repli contrôlable : `expanded` (contrôlé) ou `defaultExpanded` + clic sur la
 * rangée de tête (variants collapsed / expanded uniquement). Tokens uniquement.
 */

const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                    // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,     // 20
  fontWeight: 400,
};
const bodyMedium = { ...body, fontWeight: 500 };
// Montant serif 20/28 -0.6 : famille serif + métriques du scale heading-lg-medium.
const serifTotal = {
  fontFamily: typography.fontFamily.serif,
  fontSize: typography.scale['heading-lg-medium'].size,    // 20
  lineHeight: `${typography.scale['heading-lg-medium'].lineHeight}px`, // 28
  fontWeight: 500,
  letterSpacing: `${typography.scale['heading-lg-medium'].letterSpacing}px`, // -0.6
};

const DEFAULT_DETAILS = [
  { label: 'Revenus attendus sur la période (XX mois)', value: '31 000 €' },
  { label: 'Revenus perçus sur la période (XX mois)', value: '− 8 400 €' },
  { label: 'Calcul line', value: '+ 1 600€' },
  { label: 'Calcul line', value: '+ 1 600€' },
];
const DEFAULT_EMPHASIS_DETAILS = [
  { label: 'Victime directe', value: 'XX €' },
  { label: 'Victimes indirectes', value: 'XX €' },
  { label: 'Tiers payeur', value: 'XX €' },
];

// Rangée de tête : icône 20 + libellé 500 + montant serif + chevron.
function HeadRow({ title, amount, showRente, showRevalorisation, dark, chevron, onClick, collapsedSpacing }) {
  const fg = dark ? colors.semantic.primaryForeground : colors.semantic.foreground;
  const labelFg = dark ? colors.semantic.primaryForeground : colors.semantic.foreground;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <Calculator style={{ width: 20, height: 20, flexShrink: 0 }} strokeWidth={1.75} color={labelFg} />
        <span style={{ ...bodyMedium, color: labelFg, whiteSpace: 'nowrap' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          // Figma collapsed/subtotal : boîte 113px justify-between qui décale le
          // chevron du montant ; expanded : gap 8 simple.
          ...(collapsedSpacing ? { minWidth: 113, justifyContent: 'space-between' } : { gap: 8 }),
        }}>
          {showRevalorisation && (
            <CircleArrowUp style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} color={dark ? colors.semantic.secondary : colors.semantic.mutedForeground} />
          )}
          <span style={{ ...serifTotal, color: fg, whiteSpace: 'nowrap' }}>{amount}</span>
          {showRente && (
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>/ an</span>
          )}
        </div>
        {chevron && React.createElement(chevron, {
          style: { width: 14, height: 14, flexShrink: 0 },
          strokeWidth: 1.75,
          color: dark ? colors.semantic.primaryForeground : colors.semantic.foreground,
        })}
      </div>
    </div>
  );
}

// Bloc de détail : rangées label / valeur, Inter 14, gap 9.
function DetailRows({ rows, dark, showRevalorisation }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%' }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{
            ...body, whiteSpace: 'nowrap',
            color: dark ? colors.semantic.primaryForeground : colors.semantic.mutedForeground,
          }}>
            {row.label}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {!dark && i === 0 && showRevalorisation && (
              <CircleArrowUp style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
            )}
            <span style={{
              ...body, whiteSpace: 'nowrap',
              color: dark ? colors.semantic.secondary : colors.semantic.foreground,
            }}>
              {row.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TotalSubtotal({
  variant = 'collapsed',      // 'collapsed' | 'subtotal' | 'expanded' | 'emphasis'
  expanded: expandedProp,     // contrôlé (collapsed/expanded uniquement)
  defaultExpanded,
  onToggle,
  showRente = false,
  showRevalorisation = false,
  title,                      // défauts : « Total perte PGPA » / « Indemnisation total »
  amount = '24 200 €',
  details,                    // [{ label, value }]
  width = '100%',
  className,
  style,
}) {
  const isEmphasis = variant === 'emphasis';
  const isSubtotal = variant === 'subtotal';
  const collapsible = !isEmphasis && !isSubtotal;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? variant === 'expanded');
  const isExpanded = collapsible && (expandedProp ?? internalExpanded);

  const toggle = collapsible ? () => {
    if (expandedProp === undefined) setInternalExpanded((v) => !v);
    onToggle?.(!isExpanded);
  } : undefined;

  const cardBase = {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    width, boxSizing: 'border-box', padding: 16, overflow: 'hidden',
    border: `1px solid ${colors.semantic.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.xs,
  };

  // ── Emphasis : fond encre, détail + filet + rangée total ─────────────────
  if (isEmphasis) {
    return (
      <div className={className} style={{ ...cardBase, gap: 13, background: colors.semantic.primary, ...style }}>
        <DetailRows rows={details || DEFAULT_EMPHASIS_DETAILS} dark />
        <div style={{ height: 1, width: '100%', background: colors.semantic.secondaryForeground }} />
        <HeadRow
          title={title ?? 'Indemnisation total'}
          amount={amount}
          showRente={showRente}
          showRevalorisation={showRevalorisation}
          dark
          chevron={null}
        />
      </div>
    );
  }

  // ── Subtotal : rangée seule sur fond assombri (voile encre 5% sur muted) ─
  if (isSubtotal) {
    return (
      <div className={className} style={{
        ...cardBase, justifyContent: 'center',
        background: colors.semantic.muted,
        backgroundImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))',
        ...style,
      }}>
        <HeadRow
          title={title ?? 'Total perte PGPA'}
          amount={amount}
          showRente={showRente}
          showRevalorisation={showRevalorisation}
          chevron={ChevronRight}
          collapsedSpacing
        />
      </div>
    );
  }

  // ── Collapsed / Expanded : repliable ─────────────────────────────────────
  return (
    <div className={className} style={{
      ...cardBase,
      background: colors.semantic.muted,
      ...(isExpanded ? { gap: 13 } : { justifyContent: 'center' }),
      ...style,
    }}>
      <HeadRow
        title={title ?? 'Total perte PGPA'}
        amount={amount}
        showRente={showRente}
        showRevalorisation={showRevalorisation}
        chevron={isExpanded ? ChevronDown : ChevronRight}
        collapsedSpacing={!isExpanded}
        onClick={toggle}
      />
      {isExpanded && (
        <>
          <div style={{ height: 1, width: '100%', background: colors.semantic.borderStrong }} />
          <DetailRows rows={details || DEFAULT_DETAILS} showRevalorisation={showRevalorisation} />
        </>
      )}
    </div>
  );
}

// Variants — consommés par la démo du playground.
export const TOTAL_SUBTOTAL_VARIANTS = ['collapsed', 'subtotal', 'expanded', 'emphasis'];
