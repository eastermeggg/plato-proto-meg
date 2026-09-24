import React, { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown, Search } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';
import { SelectMenuPanel, SelectMenuItem } from './Select';

/**
 * Combobox — Plato design system. shadcn BRUT mappé sur les tokens, aucun
 * design custom (décision steward 24/09) : trigger bouton (valeur ou
 * placeholder + chevrons-up-down) + panel du Select avec recherche en tête
 * (rangée Command Search du set 6729:4904 : p-12, border-b, loupe 16, texte
 * 14 muted) + liste filtrée (rows du Select, Check sur la sélection) + état
 * vide. Esquisse Figma du kit : 2819:22160.
 *
 * API héritée de l'esquisse : value / options / onChange / placeholder.
 */

export default function Combobox({
  value,
  options = [],
  onChange,
  placeholder = 'Rechercher…',
  emptyText = 'Aucun résultat.',
  width = 280,
  disabled = false,
  className,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const current = options.find((o) => o.value === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    inputRef.current?.focus();
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', width, ...style }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%',
          padding: '7px 12px',
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.card,
          border: `1px solid ${open ? colors.semantic.foreground : colors.semantic.input}`,
          borderRadius: radius.lg,
          boxShadow: shadows['2xs'],
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          lineHeight: '20px',
          color: current ? colors.semantic.foreground : colors.semantic.mutedForeground,
        }}
      >
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current ? current.label : placeholder}
        </span>
        <ChevronsUpDown style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.mutedForeground }} strokeWidth={1.75} />
      </button>

      {open && (
        <SelectMenuPanel style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, padding: 0 }}>
          {/* Command Search — rangée de recherche en tête (border-b, loupe) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderBottom: `1px solid ${colors.semantic.border}`,
            }}
          >
            <Search style={{ width: 16, height: 16, flexShrink: 0, color: colors.semantic.mutedForeground, opacity: 0.5 }} strokeWidth={1.75} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: typography.fontFamily.sans,
                fontSize: 14,
                lineHeight: '20px',
                color: colors.semantic.foreground,
              }}
            />
          </div>
          <div role="listbox" style={{ padding: 8, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontFamily: typography.fontFamily.sans,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: colors.semantic.mutedForeground,
                }}
              >
                {emptyText}
              </div>
            )}
            {filtered.map((o) => (
              <SelectMenuItem
                key={o.value}
                label={o.label}
                icon={o.icon}
                disabled={o.disabled}
                selected={o.value === value}
                onSelect={() => { onChange?.(o.value); setOpen(false); }}
              />
            ))}
          </div>
        </SelectMenuPanel>
      )}
    </div>
  );
}
