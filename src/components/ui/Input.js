import React from 'react';
import { Sparkles } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Input — Plato design system "Field" component.
 *
 * Source of truth: Figma node 33541:69574 (Plato---System).
 *
 * A field is a label + optional helper text + a slot (the actual input).
 * By default the slot renders a text input. Pass `children` to swap in any
 * other input shape (Select, Combobox, Textarea, custom controls).
 *
 * Three layouts:
 *  - layout="vertical"   helperPosition="below"   — label / input / helper (default)
 *  - layout="vertical"   helperPosition="between" — label / helper / input
 *  - layout="horizontal" — (label + helper) | input
 *
 * Three states: default, error, warning. The state colors only the label and
 * helper text — the slotted input keeps its standard appearance.
 *
 * See src/components/ui/Input.md for usage rules.
 */

const LABEL_COLOR = {
  default: colors.semantic.foreground,            // #292524
  error:   colors.badge.destructive.bg,           // #991b1b
  warning: colors.badge.warning.fg,               // #855b31
};

const HORIZONTAL_DEFAULT_LABEL_COLOR = colors.semantic.foregroundSecondary; // #78716c

const HELPER_COLOR = {
  default: colors.semantic.foregroundSecondary,   // #78716c
  error:   colors.badge.destructive.bg,           // #991b1b — Figma: invalid helper stays muted; surface red on the label
  warning: colors.badge.warning.fg,               // #855b31
};

// In Figma, the destructive helper actually stays muted (#78716c). Override
// HELPER_COLOR.error to match unless an explicit prop says otherwise.
HELPER_COLOR.error = colors.semantic.foregroundSecondary;

const FIELD_GAP = 6;
const HORIZONTAL_GAP = 12;
const HEADER_INNER_GAP = 4;
const HORIZONTAL_INNER_GAP = 8;

export default function Input({
  label,
  helperText,
  layout = 'vertical',          // 'vertical' | 'horizontal'
  helperPosition = 'below',     // 'below' | 'between'  (vertical only)
  error = false,
  warning = false,
  aiGenerated = false,
  // Slot — when provided, replaces the default text input
  children,
  // Default-input pass-through (ignored when `children` is set)
  type = 'text',
  value,
  defaultValue,
  placeholder,
  onChange,
  disabled = false,
  inputProps,
  // Escape hatches
  className,
  style,
  width,
}) {
  const state = error ? 'error' : warning ? 'warning' : 'default';

  const labelColor =
    layout === 'horizontal' && state === 'default'
      ? HORIZONTAL_DEFAULT_LABEL_COLOR
      : LABEL_COLOR[state];

  const labelEl = label ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: HEADER_INNER_GAP, flexShrink: 0 }}>
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
      {aiGenerated && (
        <Sparkles style={{ width: 12, height: 12, color: labelColor, flexShrink: 0 }} strokeWidth={1.75} />
      )}
    </span>
  ) : null;

  const helperEl = helperText ? (
    <span
      style={{
        fontFamily: typography.fontFamily.sans,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 400,
        letterSpacing: '0.12px',
        color: HELPER_COLOR[state],
      }}
    >
      {helperText}
    </span>
  ) : null;

  const inputEl =
    children !== undefined && children !== null ? (
      children
    ) : (
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: radius.lg,                  // 8
          border: `1px solid ${colors.semantic.border}`,
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.card,
          boxShadow: shadows.xs,
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          lineHeight: '20px',
          color: colors.semantic.foreground,
          outline: 'none',
          opacity: disabled ? 0.7 : 1,
        }}
        {...inputProps}
      />
    );

  // Horizontal layout: (label + helper) | input
  if (layout === 'horizontal') {
    const headerVertical = state === 'error';
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          gap: HORIZONTAL_GAP,
          alignItems: headerVertical ? 'flex-start' : 'center',
          width: width ?? '100%',
          ...style,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: headerVertical ? 'column' : 'row',
            gap: headerVertical ? FIELD_GAP : HORIZONTAL_INNER_GAP,
            alignItems: headerVertical ? 'flex-start' : 'center',
          }}
        >
          {labelEl}
          {helperEl}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{inputEl}</div>
      </div>
    );
  }

  // Vertical layouts
  const between = helperPosition === 'between';
  const items = [];
  if (label) items.push(<React.Fragment key="label">{labelEl}</React.Fragment>);
  if (between && helperText) items.push(<React.Fragment key="helper-between">{helperEl}</React.Fragment>);
  items.push(<React.Fragment key="input">{inputEl}</React.Fragment>);
  if (!between && helperText) items.push(<React.Fragment key="helper-below">{helperEl}</React.Fragment>);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: FIELD_GAP,
        width: width ?? '100%',
        ...style,
      }}
    >
      {items}
    </div>
  );
}
