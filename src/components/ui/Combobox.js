import React, { useState } from 'react';
import { colors } from '../../design-system/tokens';

export default function Combobox({ value, options = [], onChange, placeholder = 'Search…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ position: 'relative', maxWidth: 280 }}>
      <input
        value={query || (value ? options.find(o => o.value === value)?.label : '')}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '7px 12px',
          fontSize: 14, color: colors.semantic.foreground,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 8, background: colors.semantic.white,
          outline: 'none', fontFamily: 'inherit',
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, padding: 4, zIndex: 5, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxHeight: 200, overflow: 'auto' }}>
          {filtered.map(o => (
            <button
              key={o.value}
              onMouseDown={() => { onChange?.(o.value); setQuery(''); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '6px 10px', borderRadius: 6,
                fontSize: 14, color: colors.semantic.foreground,
                background: value === o.value ? colors.semantic.cream : 'transparent',
                border: 'none', cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
