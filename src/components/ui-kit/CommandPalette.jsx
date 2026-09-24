import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Component, Palette, LayoutGrid, CornerDownLeft } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors } from '../../design-system/tokens';

// Cmd+K - la palette de navigation globale du DS. On atteint N'IMPORTE QUOI :
// une page (tokens, shell, inventaire…), un composant (→ sa fiche), un token.
// Clavier : ↑/↓ naviguer · ↵ ouvrir · esc fermer. Piloté par l'inventaire +
// designSystemInventory.json (aucune liste en dur à maintenir côté data).
const PAGES = [
  { id: 'welcome',     label: 'Accueil - Design System', hint: "vue d'ensemble",            path: '/' },
  { id: 'tokens',      label: 'Design Tokens',            hint: 'couleurs, typo, espacements, ombres…', path: '/ui-kit/tokens' },
  { id: 'blocks',      label: 'Blocks',                   hint: 'shell, pages, tables',      path: '/ui-kit/blocks' },
  { id: 'inventory',   label: 'Inventaire composants',    hint: 'tous les composants',       path: '/ui-kit/inventory' },
  { id: 'proto',       label: 'Ouvrir le proto',          hint: "l'app Plato",               path: '/app' },
];

function Glyph({ row }) {
  if (row.kind === 'token' && row.swatch) {
    return <span style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: row.swatch, border: `1px solid ${colors.semantic.border}` }} />;
  }
  const Icon = row.kind === 'page' ? LayoutGrid : row.kind === 'component' ? Component : Palette;
  return (
    <span style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.semantic.backgroundSubtle, color: colors.semantic.foregroundTertiary }}>
      <Icon style={{ width: 13, height: 13 }} strokeWidth={1.75} />
    </span>
  );
}

export default function CommandPalette({ navigate, onClose }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const tokensFlat = useMemo(() => {
    const groups = inventory.tokens || {};
    const out = [];
    for (const g of Object.keys(groups)) {
      if (!Array.isArray(groups[g])) continue;
      for (const t of groups[g]) out.push({ ...t, group: g });
    }
    return out;
  }, []);

  const sections = useMemo(() => {
    const query = q.trim().toLowerCase();
    const match = (s) => !query || String(s ?? '').toLowerCase().includes(query);
    const cap = (arr, n) => (query ? arr : arr.slice(0, n));

    const pages = PAGES.filter(p => match(p.label) || match(p.hint))
      .map(p => ({ kind: 'page', key: 'page:' + p.id, label: p.label, hint: p.hint, path: p.path }));
    const comps = inventory.components
      .filter(c => match(c.id) || match(c.notes) || match(c.category))
      .sort((a, b) => Number(!!b.used) - Number(!!a.used) || a.id.localeCompare(b.id))
      .map(c => ({ kind: 'component', key: 'c:' + c.id, label: c.id, hint: `${c.used ? 'en usage' : 'pas encore utilisé'} · ${c.layer}`, path: '/ui-kit/c/' + c.id }));
    const toks = tokensFlat
      .filter(t => match(t.id) || match(t.name) || match(t.usage))
      .map(t => ({ kind: 'token', key: 't:' + t.id, label: t.id, hint: t.usage || t.value, path: '/ui-kit/tokens', swatch: t.group === 'colors' ? t.value : null }));

    return [
      { header: 'Pages', rows: cap(pages, 6) },
      { header: 'Composants', rows: cap(comps, 8) },
      { header: 'Tokens', rows: cap(toks, 8) },
    ].filter(s => s.rows.length);
  }, [q, tokensFlat]);

  const flat = useMemo(() => sections.flatMap(s => s.rows), [sections]);
  useEffect(() => { setIdx(0); }, [q]);

  const choose = (row) => { if (!row) return; navigate(row.path); onClose(); };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(flat[idx]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div
      onMouseDown={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,26,26,0.32)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={onKey}
        style={{ width: 'min(92vw, 600px)', background: colors.semantic.card, borderRadius: 14, border: `1px solid ${colors.semantic.borderStrong}`, boxShadow: '0 24px 84px -20px rgba(0,0,0,0.35)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${colors.semantic.border}` }}>
          <Search style={{ width: 18, height: 18, color: colors.semantic.foregroundMuted, flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Chercher un composant, un token, une page…"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: colors.semantic.foreground }}
          />
          <kbd style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.foregroundMuted, border: `1px solid ${colors.semantic.border}`, borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>esc</kbd>
        </div>

        <div style={{ overflowY: 'auto', padding: 6 }}>
          {flat.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: colors.semantic.foregroundMuted }}>
              Aucun résultat pour « {q} ».
            </div>
          )}
          {sections.map(section => (
            <div key={section.header}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.semantic.foregroundMuted, padding: '10px 10px 4px' }}>
                {section.header}
              </div>
              {section.rows.map(row => {
                const active = flat[idx]?.key === row.key;
                return (
                  <button
                    key={row.key}
                    onMouseMove={() => setIdx(flat.findIndex(r => r.key === row.key))}
                    onClick={() => choose(row)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: active ? colors.semantic.cream : 'transparent' }}
                  >
                    <Glyph row={row} />
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: colors.semantic.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.label}</span>
                      {row.hint && <span style={{ fontSize: 11.5, color: colors.semantic.foregroundSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.hint}</span>}
                    </span>
                    {active && <CornerDownLeft style={{ width: 14, height: 14, color: colors.semantic.foregroundMuted, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, padding: '8px 14px', borderTop: `1px solid ${colors.semantic.border}`, fontSize: 11, color: colors.semantic.foregroundMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>↑↓ naviguer</span><span>↵ ouvrir</span><span>esc fermer</span>
        </div>
      </div>
    </div>
  );
}
