import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Select — Plato design system. Source of truth: Figma « Select »
 * (Plato---System 6729:4904 : trigger 2738:3407 + états 33541:60808…,
 * panel « Select Menu » 13:2034, rows « Select Menu Item » 37122:19624).
 *
 * Anatomie :
 *  - trigger : champ card bordé `input`, px-12 py-8 (h-36), radius 8,
 *    ombre 2xs, placeholder muted / valeur foreground, chevron-down 16
 *  - focus : bordure `foreground` + anneau 3px (color-mix foregroundMuted 50 %
 *    — le nœud pointe `custom/focus`, token absent du code : arbitrage
 *    SIGNALEMENTS §12, jamais un rgba inline)
 *  - panel : `popover` bordé `border`, radius 8, ombre xl, sections p-4,
 *    labels mono 11 uppercase muted, rows px-8 py-6 radius 6 gap 8 ;
 *    hover `accent`, sélection = label medium + Check 16
 *
 * Les variantes riches du set (recherche, arbre de pièces, switch, radio,
 * raccourcis) appartiennent au Dropdown / menus assemblés — même panel.
 * API héritée de l'esquisse : value / options / onChange / placeholder /
 * disabled (+ option.group, option.icon, option.disabled).
 */

const FOCUS_RING = `0 0 0 3px color-mix(in srgb, ${colors.semantic.foregroundMuted} 50%, transparent)`;

export function SelectMenuLabel({ children }) {
  return (
    <div
      style={{
        padding: '6px 8px',
        fontFamily: typography.fontFamily.mono,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        color: colors.semantic.mutedForeground,
        opacity: 0.7,
      }}
    >
      {children}
    </div>
  );
}

export function SelectMenuItem({ label, icon: Icon, selected = false, disabled = false, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect?.()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '6px 8px',
        borderRadius: radius.md,
        border: 'none',
        textAlign: 'left',
        background: hover && !disabled ? colors.semantic.accent : 'transparent',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {Icon && <Icon style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.foreground }} strokeWidth={1.75} />}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          lineHeight: '20px',
          fontWeight: selected ? 500 : 400,
          color: colors.semantic.foreground,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {selected && <Check style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.foreground }} strokeWidth={2} />}
    </button>
  );
}

// Panel partagé Select / Dropdown (Figma « Select Menu » 13:2034).
export function SelectMenuPanel({ children, style }) {
  return (
    <div
      style={{
        background: colors.semantic.popover,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radius.lg,
        boxShadow: shadows.xl,
        padding: 4,
        minWidth: 136,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Select({
  value,
  options = [],
  onChange,
  placeholder = 'Sélectionner…',
  disabled = false,
  width = 240,
  className,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Groupes optionnels : options portant `group` → sections avec label mono.
  const groups = [];
  for (const o of options) {
    const key = o.group || '';
    const g = groups.find((x) => x.key === key);
    if (g) g.items.push(o); else groups.push({ key, items: [o] });
  }

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', maxWidth: 448, minWidth: 64, width, ...style }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '7px 12px',
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.card,
          border: `1px solid ${focused || open ? colors.semantic.foreground : colors.semantic.input}`,
          borderRadius: radius.lg,
          boxShadow: focused || open ? FOCUS_RING : shadows['2xs'],
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            fontFamily: typography.fontFamily.sans,
            fontSize: 14,
            lineHeight: '20px',
            color: current ? colors.semantic.foreground : colors.semantic.mutedForeground,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {current ? current.label : placeholder}
        </span>
        <ChevronDown style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.foreground, opacity: 0.7 }} strokeWidth={1.75} />
      </button>

      {open && (
        <SelectMenuPanel style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50 }}>
          <div role="listbox" style={{ padding: 4, display: 'flex', flexDirection: 'column' }}>
            {groups.map((g) => (
              <React.Fragment key={g.key || '_'}>
                {g.key && <SelectMenuLabel>{g.key}</SelectMenuLabel>}
                {g.items.map((o) => (
                  <SelectMenuItem
                    key={o.value}
                    label={o.label}
                    icon={o.icon}
                    disabled={o.disabled}
                    selected={o.value === value}
                    onSelect={() => { onChange?.(o.value); setOpen(false); }}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </SelectMenuPanel>
      )}
    </div>
  );
}
