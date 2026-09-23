import React from 'react';
import { Check, Minus } from 'lucide-react';
import { colors, radius } from '../../design-system/tokens';

/**
 * Checkbox — Plato design system. Source of truth: Figma « Checkbox »
 * (Plato---System 2819:21779). Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Case 16px, radius sm. États : off, on (Check), indéterminé (Minus, tri-state),
 * disabled. Coché = fond + bordure `foreground`, glyphe `white`.
 *
 * Toutes les valeurs viennent de tokens.js. Remplace les cases inline
 * (SaveDestinationPopover, JPAddStepper, ImportEmailDialog…).
 */

export default function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  disabled = false,
  onChange,
  className,
  style,
}) {
  const on = checked || indeterminate;
  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        style={{
          width: 16,
          height: 16,
          padding: 0,
          borderRadius: radius.sm,
          border: `1px solid ${on ? colors.semantic.foreground : colors.semantic.border}`,
          background: on ? colors.semantic.foreground : colors.semantic.card,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'inherit',
          flexShrink: 0,
        }}
      >
        {indeterminate ? (
          <Minus style={{ width: 11, height: 11, color: colors.semantic.white }} strokeWidth={3} />
        ) : checked ? (
          <Check style={{ width: 11, height: 11, color: colors.semantic.white }} strokeWidth={3} />
        ) : null}
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}
