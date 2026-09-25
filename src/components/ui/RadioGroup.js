import React from 'react';
import { colors, radius, shadows } from '../../design-system/tokens';

/**
 * RadioGroup — Plato design system. Source of truth: Figma « Radio Group »
 * (Plato---System 2819:29275). Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Choix exclusif : une seule option cochée à la fois. Deux variantes, toutes
 * deux dans le kit Figma :
 *  - `list` (défaut) : pastille 16px + libellé + description optionnelle.
 *  - `card` : chaque option dans une boîte bordée ; l'option cochée prend la
 *    bordure `foreground` (le set Pricing custom garde son propre composant
 *    `RadioPricing`).
 *
 * Coché = anneau `foreground` + point `foreground` 8px. Toutes les valeurs
 * viennent de tokens.js. Remplace les `input type=radio` inline.
 */

export default function RadioGroup({
  value,
  options = [],
  onChange,
  name = 'radio',
  variant = 'list',
  disabled = false,
  className,
  style,
}) {
  const isCard = variant === 'card';
  return (
    <div
      role="radiogroup"
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: isCard ? 8 : 12, ...style }}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        const optDisabled = disabled || opt.disabled;
        return (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: opt.description ? 'flex-start' : 'center',
              gap: 10,
              cursor: optDisabled ? 'not-allowed' : 'pointer',
              opacity: optDisabled ? 0.5 : 1,
              userSelect: 'none',
              ...(isCard
                ? {
                    padding: '12px 14px',
                    borderRadius: radius.lg,
                    border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
                    background: colors.semantic.card,
                    boxShadow: checked ? shadows.xs : 'none',
                    transition: 'border-color 120ms ease, box-shadow 120ms ease',
                  }
                : {}),
            }}
          >
            <span
              role="radio"
              aria-checked={checked}
              onClick={() => !optDisabled && onChange?.(opt.value)}
              style={{
                marginTop: opt.description ? 2 : 0,
                width: 16,
                height: 16,
                borderRadius: radius.full,
                border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
                background: colors.semantic.card,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {checked && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: radius.full,
                    background: colors.semantic.foreground,
                  }}
                />
              )}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 14, lineHeight: '18px', color: colors.semantic.foreground }}>
                {opt.label}
              </span>
              {opt.description && (
                <span style={{ fontSize: 12, lineHeight: '16px', color: colors.semantic.mutedForeground }}>
                  {opt.description}
                </span>
              )}
            </span>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              disabled={optDisabled}
              onChange={() => onChange?.(opt.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            />
          </label>
        );
      })}
    </div>
  );
}
