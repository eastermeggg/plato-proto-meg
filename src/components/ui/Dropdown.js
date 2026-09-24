import React, { useEffect, useRef, useState } from 'react';
import { SelectMenuPanel, SelectMenuItem, SelectMenuLabel } from './Select';

/**
 * Dropdown — Plato design system. Menu d'actions / navigation ancré à un
 * déclencheur. Décision steward 24/09/2026 : skin STRICTEMENT identique au
 * menu du Select (Figma 6729:4904 - panel 13:2034, rows 37122:19624) — il
 * compose SelectMenuPanel / SelectMenuItem / SelectMenuLabel, rien d'autre.
 * Réf. d'inventaire d'origine : page « Dropdown Menu » (2819:24797).
 *
 * Select = choisir UNE VALEUR (le trigger affiche la valeur).
 * Dropdown = déclencher des ACTIONS (le trigger est un bouton/icône libre).
 *
 * Items : { key, label, icon?, shortcut?, disabled?, selected?, group?, onSelect? }
 * (les groupes rendent un label mono uppercase par section - conventions du
 * panel ; les variantes riches switch/radio/recherche restent des menus
 * assemblés sur SelectMenuPanel).
 */

export default function Dropdown({
  trigger,
  items = [],
  onSelect,
  align = 'start',
  width = 200,
  className,
  style,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const groups = [];
  for (const it of items) {
    const key = it.group || '';
    const g = groups.find((x) => x.key === key);
    if (g) g.items.push(it); else groups.push({ key, items: [it] });
  }

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <span
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ display: 'inline-flex' }}
      >
        {trigger}
      </span>

      {open && (
        <SelectMenuPanel
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'end' ? 'right' : 'left']: 0,
            width,
            zIndex: 50,
          }}
        >
          <div role="menu" style={{ padding: 4, display: 'flex', flexDirection: 'column' }}>
            {groups.map((g) => (
              <React.Fragment key={g.key || '_'}>
                {g.key && <SelectMenuLabel>{g.key}</SelectMenuLabel>}
                {g.items.map((it) => (
                  <SelectMenuItem
                    key={it.key ?? it.label}
                    label={it.label}
                    icon={it.icon}
                    shortcut={it.shortcut}
                    disabled={it.disabled}
                    selected={it.selected}
                    onSelect={() => { it.onSelect?.(); onSelect?.(it); setOpen(false); }}
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
