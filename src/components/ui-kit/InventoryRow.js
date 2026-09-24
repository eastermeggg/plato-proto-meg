import React from 'react';
import StatusPill from './StatusPill';
import { colors } from '../../design-system/tokens';

/**
 * Single inventory row — used by both /ui-kit/tokens and /ui-kit/inventory.
 *
 * Props:
 * - preview: ReactNode
 * - name: string
 * - meta: ReactNode
 * - status: 'pending' | 'validated' | 'needs-revision' | 'missing'
 * - figmaRef: string (read-only display)
 * - notes: string (read-only display)
 * - actions: ReactNode
 */
export default function InventoryRow({ preview, name, meta, status, figmaRef, notes, actions }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1fr auto',
        gap: 16,
        padding: '14px 16px',
        borderBottom: `1px solid ${colors.semantic.border}`,
        alignItems: 'flex-start',
      }}
    >
      {/* Preview cell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 40 }}>
        {preview}
      </div>

      {/* Body cell */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: colors.semantic.foreground }}>
            {name}
          </span>
          {status ? <StatusPill status={status} /> : null}
        </div>
        {meta && (
          <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary, lineHeight: '16px' }}>{meta}</div>
        )}
        {(figmaRef || notes) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            {figmaRef && (
              <div style={{ fontSize: 12, lineHeight: '16px', color: colors.semantic.foregroundSecondary }}>
                <span style={{ fontWeight: 500, color: colors.semantic.foregroundTertiary }}>Figma: </span>
                <a href={figmaRef} target="_blank" rel="noreferrer" style={{ color: colors.banner.info.accent, textDecoration: 'underline', wordBreak: 'break-all' }}>{figmaRef}</a>
              </div>
            )}
            {notes && (
              <div style={{ fontSize: 12, lineHeight: '16px', color: colors.semantic.foregroundSecondary, fontStyle: 'italic' }}>
                {notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions cell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>
    </div>
  );
}
