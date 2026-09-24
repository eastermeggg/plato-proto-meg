import React, { useState, useEffect, useRef } from 'react';
import { Play, Search as SearchIcon } from 'lucide-react';
import { SCENARIO_LIST } from '../../data/demoScenarios';
import {colors, shadows } from '../../design-system/tokens';

export default function SlashCommandPalette({ query, onSelect, onDismiss, scenarios }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Filter scenarios by query (text after /)
  const allScenarios = scenarios || SCENARIO_LIST;
  const filtered = allScenarios.filter(s =>
    !query || s.command.includes(query) || s.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) onSelect(filtered[selectedIndex].command);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedIndex, onSelect, onDismiss]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        border: `1px solid ${colors.semantic.border}`,
        boxShadow: shadows['lg'],
        overflow: 'hidden',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle" style={{ backgroundColor: colors.banner.neutral.bgFrom }}>
        <SearchIcon className="w-3 h-3 text-foreground-muted" />
        <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: colors.semantic.mutedForeground }}>
          COMMANDES
        </span>
      </div>

      {/* List */}
      <div ref={listRef} style={{ maxHeight: 240, overflowY: 'auto' }}>
        {filtered.map((s, i) => (
          <div
            key={s.command}
            onClick={() => onSelect(s.command)}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
            style={{
              backgroundColor: i === selectedIndex ? colors.banner.neutral.bgFrom : 'transparent',
              borderBottom: i < filtered.length - 1 ? `1px solid ${colors.semantic.backgroundSubtle}` : 'none',
            }}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <Play className="w-3 h-3 flex-shrink-0" style={{ color: colors.accents.ochre }} />
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.foreground, display: 'block' }}>{s.label}</span>
              <span style={{ fontSize: 12, color: colors.semantic.foregroundMuted, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
