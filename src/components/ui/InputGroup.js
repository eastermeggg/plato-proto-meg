import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';
import Kbd from './Kbd';

/**
 * InputGroup — Plato design system. Source of truth: Figma node 27510:119942
 * (set "Input Group" 29794:41968, addons inline 29794:42318, addons block
 * 30081:23727).
 *
 * LE champ à segments accolés : un conteneur bordé unique (h 36, px 12,
 * gap 8, radius 8, ombre xs) qui aligne des addons inline (icône 16, texte,
 * Kbd, coche, bouton) autour du <input>. Type "textarea" : conteneur en
 * colonne avec rangées d'addons "block" au-dessus / en-dessous.
 *
 * États du set Figma : Enabled · Focus (bord ring + halo 3px) · Filled ·
 * Disabled (opacité 0.5) · Error (bord destructive, halo destructif au
 * focus) · Warning (bord warning + halo warning.subtle permanent) ·
 * Calculated (fond accent, lecture seule).
 *
 * Ne PAS imbriquer un Input (Field) dedans - c'est l'inverse : InputGroup
 * remplit le slot `children` de Input pour recevoir label + helper :
 *   <Input label="Site web"><InputGroup leading={…} placeholder="…" /></Input>
 *
 * Écarts tokens (notés dans InputGroup.md) :
 *  - halo focus Figma rgba(163,163,163,0.5) → color-mix 50% sur
 *    colors.semantic.borderHover (#a8a29e), token le plus proche.
 *  - halo focus erreur Figma rgba(220,38,38,0.4) → color-mix 40% sur
 *    colors.banner.error.accent (#dc2626, hex exact).
 *  - fond Figma --custom/bg-input-30 (blanc) → colors.semantic.card.
 */

const FIELD_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,               // 14
  lineHeight: `${typography.scale.body.lineHeight}px`, // 20
  fontWeight: typography.scale.body.weight,           // 400
};

// Focus/erreur : tokens uniques shadows.focusRing / focusRingError (arbitrage 24/09).
const FOCUS_RING = shadows.focusRing;
const ERROR_RING = shadows.focusRingError;
const WARNING_RING = `0 0 0 3px ${colors.feedback.warning.subtle}`;

// ::placeholder n'existe pas en style inline — feuille injectée une fois.
let placeholderCss = false;
function ensurePlaceholderCss() {
  if (placeholderCss || typeof document === 'undefined') return;
  placeholderCss = true;
  const s = document.createElement('style');
  s.id = 'ds-inputgroup-placeholder';
  s.textContent = `.ds-inputgroup-field::placeholder{color:${colors.semantic.mutedForeground};opacity:1}`;
  document.head.appendChild(s);
}

function borderAndRing({ focused, error, warning }) {
  if (error) {
    return {
      borderColor: colors.feedback.destructive.base,
      boxShadow: focused ? ERROR_RING : shadows.xs,
    };
  }
  if (warning) {
    return {
      borderColor: colors.feedback.warning.base,
      boxShadow: WARNING_RING, // halo permanent dans le set Figma (Enabled + Focus)
    };
  }
  if (focused) {
    return { borderColor: colors.semantic.ring, boxShadow: FOCUS_RING };
  }
  return { borderColor: colors.semantic.input, boxShadow: shadows.xs };
}

/** Addon texte inline — Inter Medium 14, mutedForeground (ex. "https://"). */
export function InputGroupText({ children, className, style }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.scale['body-medium'].size,   // 14
        lineHeight: 1,
        fontWeight: typography.scale['body-medium'].weight, // 500
        color: colors.semantic.mutedForeground,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Addon Kbd — alias de composition : rend la primitive Kbd (./Kbd.js),
 * pixel-identique à l'addon "Type=Kbd" du set (20px, fond muted, radius 6).
 */
export function InputGroupKbd({ children, className, style, title }) {
  return <Kbd label={children} className={className} style={{ flexShrink: 0, ...style }} title={title} />;
}

/** Addon "check circle" — pastille 16px foreground, coche 12px inversée. */
export function InputGroupCheck({ className, style }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        background: colors.semantic.foreground,
        borderRadius: radius.full,
        flexShrink: 0,
        ...style,
      }}
    >
      <Check style={{ width: 12, height: 12, color: colors.semantic.card }} strokeWidth={2} />
    </span>
  );
}

/**
 * Rangée d'addons "block" (textarea) — px 12, deux bords : start pt 12 /
 * pb 6, end pt 6 / pb 12. `left` / `right` sont des slots libres (composer
 * avec InputGroupText, Button size="xs" / "icon-xs", icônes lucide 16px…).
 */
function AddonBlockRow({ position, left, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
        padding: position === 'start' ? '12px 12px 6px' : '6px 12px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{left}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
    </div>
  );
}

export default function InputGroup({
  type = 'text',            // 'text' | 'textarea'
  // Addons inline (type text) : nœuds libres, avant / après le champ.
  // Icône lucide : la passer déjà rendue, 16px, color mutedForeground.
  leading,
  trailing,
  // Addons block (type textarea) : { left, right } de nœuds libres.
  blockStart,
  blockEnd,
  // États
  error = false,
  warning = false,
  disabled = false,
  calculated = false,       // fond accent, lecture seule (état Plato)
  // Champ
  value,
  defaultValue,
  placeholder = 'Placeholder text',
  onChange,
  onFocus,
  onBlur,
  rows = 2,
  inputProps,
  // Échappatoires
  className,
  style,
  width,
}) {
  ensurePlaceholderCss();
  const [focused, setFocused] = useState(false);
  const readOnly = calculated || (inputProps && inputProps.readOnly);
  const { borderColor, boxShadow } = borderAndRing({ focused: focused && !disabled, error, warning });

  const containerBase = {
    background: calculated ? colors.semantic.accent : colors.semantic.card,
    border: `1px solid ${borderColor}`,
    borderRadius: radius.lg,
    boxShadow,
    opacity: disabled ? 0.5 : 1,
    width: width ?? '100%',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  const handleFocus = (e) => { setFocused(true); if (onFocus) onFocus(e); };
  const handleBlur = (e) => { setFocused(false); if (onBlur) onBlur(e); };

  const fieldStyle = {
    ...FIELD_TEXT,
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: colors.semantic.foreground,
    padding: 0,
    cursor: disabled ? 'not-allowed' : undefined,
  };

  if (type === 'textarea') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', ...containerBase, ...style }}>
        {blockStart && <AddonBlockRow position="start" left={blockStart.left} right={blockStart.right} />}
        <div style={{ display: 'flex', padding: 12, width: '100%', boxSizing: 'border-box' }}>
          <textarea
            className="ds-inputgroup-field"
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            style={{ ...fieldStyle, resize: 'none', minHeight: 40 }}
            {...inputProps}
          />
        </div>
        {blockEnd && <AddonBlockRow position="end" left={blockEnd.left} right={blockEnd.right} />}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '8px 12px',
        overflow: 'hidden',
        ...containerBase,
        ...style,
      }}
    >
      {leading}
      <input
        className="ds-inputgroup-field"
        type="text"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        style={fieldStyle}
        {...inputProps}
      />
      {trailing}
    </div>
  );
}
