import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors, typography, motion } from '../../design-system/tokens';
import InventoryRow from './InventoryRow';

// ── Lyse color tokens ─────────────────────────────────────────────────────────
// Mirrored from tailwind.config.js theme.extend.colors.
// These are exactly the tokens lyse tracks for coverage (text-*, bg-*, border-*).

const COLOR_GROUPS = [
  {
    label: 'Foreground',
    prefixes: ['text', 'bg', 'border'],
    tokens: [
      { token: 'foreground',            hex: '#292524', jsRef: 'colors.semantic.foreground' },
      { token: 'foreground-secondary',  hex: '#78716c', jsRef: 'colors.semantic.foregroundSecondary' },
      { token: 'foreground-muted',      hex: '#a8a29e', jsRef: 'colors.semantic.foregroundMuted' },
      { token: 'foreground-tertiary',   hex: '#44403c', jsRef: 'colors.semantic.foregroundTertiary' },
      { token: 'foreground-quaternary', hex: '#57534e', jsRef: 'colors.semantic.foregroundQuaternary' },
      { token: 'foreground-strong',     hex: '#1c1917', jsRef: null },
    ],
  },
  {
    label: 'Border',
    prefixes: ['border', 'bg'],
    tokens: [
      { token: 'border',        hex: '#e7e5e3', jsRef: 'colors.semantic.border' },
      { token: 'border-alt',    hex: '#e7e5e4', jsRef: 'colors.semantic.borderAlt' },
      { token: 'border-strong', hex: '#d6d3d1', jsRef: null },
      { token: 'border-subtle', hex: '#f0efed', jsRef: null },
    ],
  },
  {
    label: 'Background',
    prefixes: ['bg', 'border'],
    tokens: [
      { token: 'background',        hex: '#fafaf9', jsRef: 'colors.semantic.background' },
      { token: 'background-canvas', hex: '#f8f7f5', jsRef: 'colors.semantic.backgroundCanvas' },
      { token: 'background-subtle', hex: '#f5f5f4', jsRef: 'colors.semantic.backgroundSubtle' },
    ],
  },
  {
    label: 'Accent',
    prefixes: ['bg', 'text', 'border'],
    tokens: [
      { token: 'cream',         hex: '#eeece6', jsRef: 'colors.semantic.cream' },
      { token: 'link',          hex: '#1e3a8a', jsRef: null },
      { token: 'brand',         hex: '#b9703f', jsRef: null },
      { token: 'info',          hex: '#2563eb', jsRef: 'colors.banner.info.accent' },
      { token: 'info-subtle',   hex: '#dfe8f5', jsRef: 'colors.badge.info.bg' },
      { token: 'info-bg',       hex: '#eef3fa', jsRef: null },
      { token: 'danger',        hex: '#991b1b', jsRef: 'colors.badge.destructive.bg' },
      { token: 'danger-subtle', hex: '#fef2f2', jsRef: 'colors.badge.destructiveSubtle.bg' },
      { token: 'danger-border', hex: '#fecaca', jsRef: null },
    ],
  },
];

const ALL_TOKENS = COLOR_GROUPS.flatMap(g => g.tokens);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

// ── CopyChip ──────────────────────────────────────────────────────────────────

function CopyChip({ cls }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard?.writeText(cls); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={copy}
      title={`Copy "${cls}"`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 7px',
        borderRadius: 4,
        border: `1px solid ${copied ? colors.badge.success.bg : colors.semantic.border}`,
        background: copied ? colors.badge.success.bg : colors.semantic.background,
        cursor: 'pointer',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: copied ? colors.badge.success.fg : colors.semantic.foregroundSecondary,
        transition: 'all 150ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {copied && <Check style={{ width: 10, height: 10, flexShrink: 0 }} />}
      {cls}
    </button>
  );
}

// ── ColorRow ──────────────────────────────────────────────────────────────────

function ColorRow({ token: t, prefixes }) {
  const light = isLight(t.hex);
  const aaColor = light ? colors.semantic.foregroundTertiary : '#ffffff';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr auto',
        alignItems: 'center',
        gap: 16,
        padding: '10px 0',
        borderBottom: `1px solid ${colors.semantic.border}`,
      }}
    >
      {/* Swatch */}
      <div
        style={{
          width: 48, height: 48, borderRadius: 8,
          backgroundColor: t.hex,
          border: `1px solid ${colors.semantic.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: typography.fontFamily.sans,
          fontSize: 13, fontWeight: 600, color: aaColor,
          flexShrink: 0,
        }}
      >
        Aa
      </div>

      {/* Name + chips + tokens.js ref */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13, fontWeight: 600,
          color: colors.semantic.foreground,
        }}>
          {t.token}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {prefixes.map(p => <CopyChip key={p} cls={`${p}-${t.token}`} />)}
        </div>
        {t.jsRef && (
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10, color: colors.semantic.foregroundMuted,
          }}>
            tokens.js → {t.jsRef}
          </span>
        )}
      </div>

      {/* Hex */}
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12, color: colors.semantic.foregroundSecondary,
        alignSelf: 'flex-start', paddingTop: 3,
      }}>
        {t.hex}
      </span>
    </div>
  );
}

// ── Other-tab sub-components (unchanged) ─────────────────────────────────────

function TypePreview({ name }) {
  return (
    <div className={`text-${name}`} style={{ color: colors.semantic.foreground, fontFamily: typography.fontFamily.sans }}>
      Aa
    </div>
  );
}

function SpacingPreview({ value }) {
  const px = parseInt(value, 10) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: px, height: 12, backgroundColor: colors.banner.info.accent, borderRadius: 2 }} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.foregroundSecondary }}>
        {value}
      </span>
    </div>
  );
}

function RadiusPreview({ value }) {
  return (
    <div style={{
      width: 40, height: 40,
      backgroundColor: colors.semantic.cream,
      border: `1px solid ${colors.semantic.border}`,
      borderRadius: value,
    }} />
  );
}

function ShadowPreview({ value }) {
  return (
    <div style={{ width: 40, height: 40, backgroundColor: '#fff', borderRadius: 6, boxShadow: value }} />
  );
}

function MotionPreview({ id }) {
  if (id.startsWith('motion.anim.')) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: `linear-gradient(135deg, ${colors.banner.ai.accent}, ${colors.banner.info.accent})`,
        animation: `gradient-shift ${motion.duration.gradient} ease infinite`,
        backgroundSize: '200% 200%',
      }} />
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.banner.ai.accent,
      animation: `pulse-scale ${motion.duration.pulse} ease-in-out infinite`,
    }} />
  );
}

function GroupHeader({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, fontWeight: 500,
      color: colors.semantic.foregroundMuted,
      textTransform: 'uppercase', letterSpacing: '1px',
      padding: '20px 0 6px',
    }}>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'colors',     label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing',    label: 'Spacing' },
  { id: 'radius',     label: 'Radius' },
  { id: 'shadows',    label: 'Shadows' },
  { id: 'motion',     label: 'Motion' },
];

export default function TokensSection() {
  const [tab, setTab] = useState('colors');
  const [query, setQuery] = useState('');

  const filteredColorGroups = useMemo(() => {
    if (!query.trim()) return COLOR_GROUPS;
    const q = query.toLowerCase();
    return COLOR_GROUPS
      .map(g => ({
        ...g,
        tokens: g.tokens.filter(t =>
          t.token.includes(q) ||
          t.hex.toLowerCase().includes(q) ||
          (t.jsRef || '').toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.tokens.length > 0);
  }, [query]);

  const filteredOther = useMemo(() => {
    const items = inventory.tokens[tab] || [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(t =>
      t.name.toLowerCase().includes(q) ||
      String(t.value).toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q)
    );
  }, [tab, query]);

  const groupedOther = useMemo(() => {
    const out = new Map();
    filteredOther.forEach(t => {
      const key = t.category || '__flat__';
      if (!out.has(key)) out.set(key, []);
      out.get(key).push(t);
    });
    return out;
  }, [filteredOther]);

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${colors.semantic.border}`, marginBottom: 16 }}>
        {TABS.map(t => {
          const active = t.id === tab;
          const count = t.id === 'colors'
            ? ALL_TOKENS.length
            : (inventory.tokens[t.id] || []).length;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setQuery(''); }}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
                borderBottom: active ? `2px solid ${colors.semantic.foreground}` : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              {t.label}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 320 }}>
        <Search style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: colors.semantic.foregroundMuted }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={tab === 'colors' ? 'Search token, hex, class…' : 'Search tokens…'}
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 6,
            fontSize: 13,
            color: colors.semantic.foreground,
            outline: 'none',
            fontFamily: typography.fontFamily.sans,
          }}
        />
      </div>

      {/* Colors tab */}
      {tab === 'colors' && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 16, padding: '7px 12px',
            background: colors.semantic.backgroundSubtle,
            borderRadius: 6, border: `1px solid ${colors.semantic.border}`,
          }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.foregroundMuted }}>
              Click any chip to copy the Tailwind utility class name
            </span>
          </div>

          {filteredColorGroups.map(group => (
            <div key={group.label}>
              <GroupHeader>{group.label}</GroupHeader>
              {group.tokens.map(t => (
                <ColorRow key={t.token} token={t} prefixes={group.prefixes} />
              ))}
            </div>
          ))}

          {filteredColorGroups.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
              No tokens match "{query}".
            </div>
          )}
        </div>
      )}

      {/* Other tabs */}
      {tab !== 'colors' && (
        <div style={{ borderTop: `1px solid ${colors.semantic.border}` }}>
          {[...groupedOther.entries()].map(([cat, items]) => (
            <div key={cat}>
              {cat !== '__flat__' && <GroupHeader>{cat}</GroupHeader>}
              {items.map(t => {
                let preview = null;
                if (tab === 'typography') preview = <TypePreview name={t.name} />;
                else if (tab === 'spacing')    preview = <SpacingPreview value={t.value} />;
                else if (tab === 'radius')     preview = <RadiusPreview value={t.value} />;
                else if (tab === 'shadows')    preview = <ShadowPreview value={t.value} />;
                else if (tab === 'motion')     preview = <MotionPreview id={t.id} />;
                return (
                  <InventoryRow
                    key={t.id}
                    preview={preview}
                    name={t.name}
                    meta={
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {t.value}{t.usage ? `  ·  ${t.usage}` : ''}
                      </span>
                    }
                    status={t.status}
                    figmaRef={t.figmaRef}
                    notes={t.notes}
                  />
                );
              })}
            </div>
          ))}

          {filteredOther.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
              No tokens match "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
