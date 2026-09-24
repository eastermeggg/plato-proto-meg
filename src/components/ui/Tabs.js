import React, { useState } from 'react';
import { colors, typography } from '../../design-system/tokens';

/**
 * Tabs — Plato design system. Source of truth: Figma « Tabs Inline »
 * (Plato---System 36099:45289) — le variant INLINE, décision steward 24/09.
 *
 * Tab = label Inter Medium 14/20 + indicateur 2px arrondi en haut (30px) :
 *  - repos    : label `mutedForeground`, indicateur invisible
 *  - hover    : label `secondaryForeground`, indicateur `border`
 *  - actif    : label `foreground`, indicateur `primary`
 *  - disabled : repos + opacité 50
 * Options par onglet : icône 16 à gauche, compteur (pill 20 bordée `border`,
 * 12 medium `mutedForeground`). Variant `padded` : pt-10, gap label 6.
 *
 * Le style « pills / segmented » n'est PAS ce set : segmented → `ButtonGroup`
 * (cf. PairTabs dans l'audit), et le set Tabs 2819:31095 reste à arbitrer.
 */

function TabItem({ label, icon: Icon, count, active, disabled, padded, onClick }) {
  const [hover, setHover] = useState(false);
  const labelColor = active
    ? colors.semantic.foreground
    : hover && !disabled
      ? colors.semantic.secondaryForeground
      : colors.semantic.mutedForeground;
  const indicator = active
    ? colors.semantic.primary
    : hover && !disabled
      ? colors.semantic.border
      : 'transparent';
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={() => !disabled && onClick?.()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: padded ? 6 : 10,
        padding: 0,
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: padded ? 10 : 0 }}>
        {Icon && <Icon style={{ width: 16, height: 16, flexShrink: 0, color: labelColor }} strokeWidth={1.75} />}
        <span
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: 14,
            lineHeight: '20px',
            fontWeight: 500,
            color: labelColor,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {count !== undefined && count !== null && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 20,
              minWidth: 20,
              padding: '2px 4px',
              borderRadius: 9999,
              border: `1px solid ${colors.semantic.border}`,
              fontFamily: typography.fontFamily.sans,
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 500,
              color: colors.semantic.mutedForeground,
            }}
          >
            {count}
          </span>
        )}
      </span>
      <span
        aria-hidden
        style={{
          height: 2,
          width: '100%',
          borderRadius: '30px 30px 0 0',
          background: indicator,
        }}
      />
    </button>
  );
}

export default function Tabs({
  value,
  options = [],
  onChange,
  padded = false,
  gap = 16,
  className,
  style,
}) {
  return (
    <div role="tablist" className={className} style={{ display: 'flex', alignItems: 'flex-end', gap, ...style }}>
      {options.map((o) => (
        <TabItem
          key={o.value}
          label={o.label}
          icon={o.icon}
          count={o.count}
          disabled={o.disabled}
          padded={padded}
          active={o.value === value}
          onClick={() => onChange?.(o.value)}
        />
      ))}
    </div>
  );
}
