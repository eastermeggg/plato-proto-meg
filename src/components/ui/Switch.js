import React from 'react';
import { colors, shadows } from '../../design-system/tokens';

/**
 * Switch — Plato design system. Source of truth: Figma « Switch »
 * (Plato---System 2819:30732). Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Bascule 36x20, pouce 16px. ON = piste `foreground`, OFF = piste `cream`,
 * pouce `white` (élévation shadows.xs). Remplace les toggles CSS inline
 * (`peer-checked` ×6 dans App.js, ReleveHeuresLab…).
 *
 * Toutes les valeurs viennent de tokens.js.
 */

export default function Switch({ checked = false, label, disabled = false, onChange, className, style }) {
  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          padding: 0,
          borderRadius: 10,
          border: 'none',
          background: checked ? colors.semantic.foreground : colors.semantic.cream,
          transition: 'background 150ms ease',
          cursor: 'inherit',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: colors.semantic.white,
            boxShadow: shadows.xs,
            transition: 'left 150ms ease',
          }}
        />
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}
