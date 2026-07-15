import React from 'react';
import { colors } from '../../design-system/tokens';

export function Table({ columns = [], rows = [], variant = 'default' }) {
  return (
    <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 8, overflow: 'hidden', background: colors.semantic.white }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: colors.semantic.backgroundSubtle }}>
            {columns.map(col => (
              <th key={col.key} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderTop: `1px solid ${colors.semantic.border}`,
                backgroundColor: variant === 'striped' && i % 2 === 1 ? colors.semantic.backgroundSubtle : 'transparent',
              }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '10px 12px', verticalAlign: 'top', color: colors.semantic.foreground }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Header / Row / Cell are exposed as named exports for composing custom tables.
export function TableHeader({ columns = [] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: colors.semantic.backgroundSubtle }}>
          {columns.map(col => (
            <th key={col.key} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
    </table>
  );
}

export function TableRow({ cells = [], diff }) {
  const diffColors = { add: colors.diff.add, edit: colors.diff.edit, delete: colors.diff.delete };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: `1px solid ${colors.semantic.border}` }}>
      <tbody>
        <tr style={{ position: 'relative' }}>
          {diff && <td style={{ width: 4, padding: 0, background: diffColors[diff] || 'transparent' }} />}
          {cells.map((cell, i) => (
            <td key={i} style={{ padding: '10px 12px', fontSize: 13, color: colors.semantic.foreground }}>{cell}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export function TableCell({ children, align = 'left', mono }) {
  return (
    <span style={{ fontSize: 13, color: colors.semantic.foreground, fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit', textAlign: align, display: 'block' }}>
      {children}
    </span>
  );
}

export default Table;
