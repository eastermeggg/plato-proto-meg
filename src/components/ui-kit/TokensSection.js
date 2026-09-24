import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import { colors, typography, motion } from '../../design-system/tokens';
import InventoryRow from './InventoryRow';

const TABS = [
  { id: 'colors',     label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing',    label: 'Spacing' },
  { id: 'radius',     label: 'Radius' },
  { id: 'shadows',    label: 'Shadows' },
  { id: 'motion',     label: 'Motion' },
];

// Pick a legible "Aa" color (near-black or near-white) for a given background,
// so single-value tokens (no explicit fg) don't render dark-on-dark / light-on-light.
function legibleForeground(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return colors.semantic.foreground;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  // Relative luminance (sRGB), good enough for a contrast pick.
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? colors.semantic.foreground : colors.semantic.background;
}

function ColorPreview({ value }) {
  // value is "#hex" or "#hex / #hex" or "#a / #b / #c" — show first as bg, optional second as fg.
  const parts = String(value).split('/').map(s => s.trim());
  const bg = parts[0] || '#fff';
  const safeBg = bg.startsWith('transparent') ? '#fff' : bg;
  const fg = parts[1] || legibleForeground(safeBg);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <div
        title={bg}
        style={{
          width: 40, height: 40, borderRadius: 6,
          backgroundColor: safeBg,
          border: `1px solid ${colors.semantic.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: fg,
        }}
      >
        Aa
      </div>
      {parts.length > 1 && (
        <div
          title={parts[1]}
          style={{
            width: 24, height: 40, borderRadius: 6,
            backgroundColor: parts[1],
            border: `1px solid ${colors.semantic.border}`,
          }}
        />
      )}
    </div>
  );
}

function TypePreview({ name }) {
  // Render "Aa" using the corresponding .text-* class so we see the actual scale.
  const className = `text-${name}`;
  return (
    <div className={className} style={{ color: colors.semantic.foreground, fontFamily: typography.fontFamily.sans }}>
      Aa
    </div>
  );
}

function SpacingPreview({ value }) {
  const px = parseInt(value, 10) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: px,
          height: 12,
          backgroundColor: colors.banner.info.accent,
          borderRadius: 2,
        }}
      />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.foregroundSecondary }}>
        {value}
      </span>
    </div>
  );
}

function RadiusPreview({ value }) {
  return (
    <div
      style={{
        width: 40, height: 40,
        backgroundColor: colors.semantic.cream,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: value,
      }}
    />
  );
}

function ShadowPreview({ value }) {
  return (
    <div
      style={{
        width: 40, height: 40,
        backgroundColor: '#fff',
        borderRadius: 6,
        boxShadow: value,
      }}
    />
  );
}

function MotionPreview({ id }) {
  // Pick an animation that visually represents the duration/easing token.
  if (id.startsWith('motion.anim.')) {
    return (
      <div
        style={{
          width: 32, height: 32, borderRadius: 6,
          background: `linear-gradient(135deg, ${colors.banner.ai.accent}, ${colors.banner.info.accent})`,
          animation: `gradient-shift ${motion.duration.gradient} ease infinite`,
          backgroundSize: '200% 200%',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.banner.ai.accent,
        animation: `pulse-scale ${motion.duration.pulse} ease-in-out infinite`,
      }}
    />
  );
}

function CategoryHeader({ children }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 500,
        color: colors.semantic.foregroundMuted,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        padding: '20px 0 8px 0',
      }}
    >
      {children}
    </div>
  );
}

export default function TokensSection() {
  const [tab, setTab] = useState('colors');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const tokens = inventory.tokens[tab] || [];
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(t =>
      t.name.toLowerCase().includes(q) ||
      String(t.value).toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q)
    );
  }, [tab, query]);

  // Group by category if present (colors, typography). Otherwise single flat list.
  const grouped = useMemo(() => {
    const out = new Map();
    filtered.forEach(t => {
      const key = t.category || '__flat__';
      if (!out.has(key)) out.set(key, []);
      out.get(key).push(t);
    });
    return out;
  }, [filtered]);

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${colors.semantic.border}`, marginBottom: 16 }}>
        {TABS.map(t => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
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
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: colors.semantic.foregroundMuted,
                }}
              >
                {(inventory.tokens[t.id] || []).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 8, maxWidth: 320 }}>
        <Search style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: colors.semantic.foregroundMuted }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tokens…"
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 6,
            fontSize: 13,
            color: colors.semantic.foreground,
            outline: 'none',
          }}
        />
      </div>

      {/* Rows */}
      <div style={{ borderTop: `1px solid ${colors.semantic.border}` }}>
        {[...grouped.entries()].map(([cat, items]) => (
          <div key={cat}>
            {cat !== '__flat__' && <CategoryHeader>{cat}</CategoryHeader>}
            {items.map(t => {
              let preview = null;
              if (tab === 'colors')     preview = <ColorPreview value={t.value} />;
              else if (tab === 'typography') preview = <TypePreview name={t.name} />;
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
                    <>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {t.value}
                        {t.valueDark ? <span style={{ opacity: 0.55 }}>{`  ·  dark ${t.valueDark}`}</span> : null}
                      </span>
                      {t.usage && (
                        <span style={{ display: 'block', marginTop: 2, color: colors.semantic.foregroundSecondary }}>
                          {t.usage}
                        </span>
                      )}
                    </>
                  }
                  status={null}
                  figmaRef={t.figmaRef}
                  notes={t.notes}
                />
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: colors.semantic.foregroundSecondary, fontSize: 13 }}>
            No tokens match “{query}”.
          </div>
        )}
      </div>
    </div>
  );
}
