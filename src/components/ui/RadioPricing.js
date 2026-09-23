import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../design-system/tokens';

/**
 * RadioPricing — Plato design system. Source : Figma node 36915:6122
 * (« Radio Group Item Pricing », radio shadcn étendu en carte de choix).
 *
 * Carte-option radio pour les choix de licence / pricing : toggle radio
 * shadcn 16px + icône + libellé 14 medium + description 12 muted, dans une
 * carte bordée radius 12 padding 16. États Figma : Default · Hover (fond
 * background) · Active/selected (fond background + bord fort + ombre xs) ·
 * Disabled (opacité 50 %). Le shadcn RadioGroup nu ne porte pas la carte —
 * d'où ce custom (couche shadcn-extended).
 *
 * NB bord fort : le Figma câble border-strong #d6d3d1 ; le token du repo est
 * #cbc7c4 (assombri d'un demi-cran, dérive délibérée documentée dans
 * tokens.js) — le token gagne.
 */

function RadioToggle({ checked }) {
  return (
    <span style={{
      width: 16, height: 16, flexShrink: 0, borderRadius: radius.full,
      boxSizing: 'border-box',
      background: colors.semantic.white,
      border: `1px solid ${colors.semantic.border}`,
      boxShadow: shadows.xs,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {checked && (
        <span style={{ width: 7, height: 7, borderRadius: radius.full, background: colors.semantic.primary }} />
      )}
    </span>
  );
}

export default function RadioPricing({
  label = 'Radio label',
  description = 'Description',
  icon: Icon = Receipt,
  selected = false,
  disabled = false,
  onSelect,
  pinHover = false,   // force le visuel hover (démos)
  width = '100%',
  style,
  className,
}) {
  const [hovered, setHovered] = useState(false);
  const hover = !disabled && (pinHover || hovered);
  const active = selected;

  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={className}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: 16, width, boxSizing: 'border-box',
        borderRadius: radius.xl,
        border: `1px solid ${active ? colors.semantic.borderStrong : colors.semantic.border}`,
        background: active || hover ? colors.semantic.background : 'transparent',
        boxShadow: active ? shadows.xs : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 120ms ease-out, border-color 120ms ease-out, box-shadow 120ms ease-out',
        ...style,
      }}
    >
      <RadioToggle checked={selected} />
      {Icon && <Icon style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.foreground} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, paddingTop: 1, whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale['body-medium'].size, // 14
          fontWeight: typography.scale['body-medium'].weight, // 500
          lineHeight: 1,
          color: colors.semantic.foreground,
        }}>
          {label}
        </span>
        {description && (
          <span style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.scale.caption.size, // 12
            lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
            fontWeight: 400,
            letterSpacing: `${typography.scale.caption.letterSpacing}px`,
            color: colors.semantic.mutedForeground,
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
