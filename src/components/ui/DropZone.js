import React from 'react';
import { Upload } from 'lucide-react';
import { colors } from '../../design-system/tokens';

export default function DropZone({ variant = 'container', label = 'Drop a file here or click to upload', sublabel = 'PDF, DOCX up to 20 MB', onFiles, isDragging }) {
  if (variant === 'inline') {
    return (
      <div
        className={`dropzone-inline ${isDragging ? 'dropzone-drop' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          border: `1px dashed ${colors.semantic.borderStrong}`,
          borderRadius: 6, background: colors.semantic.white,
          fontSize: 13, color: colors.semantic.foregroundSecondary,
          cursor: 'pointer',
        }}
      >
        <Upload style={{ width: 14, height: 14 }} strokeWidth={1.75} />
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div
      className={`dropzone-container ${isDragging ? 'dropzone-drop' : ''}`}
      style={{
        position: 'relative',
        padding: 32,
        border: `2px dashed ${colors.semantic.borderStrong}`,
        borderRadius: 12,
        background: colors.semantic.white,
        textAlign: 'center',
        cursor: 'pointer',
        minWidth: 320,
      }}
    >
      <div className="dropzone-default-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: colors.semantic.cream, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload style={{ width: 18, height: 18, color: colors.semantic.foregroundTertiary }} strokeWidth={1.75} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: colors.semantic.foreground }}>{label}</div>
        <div style={{ fontSize: 12, color: colors.semantic.foregroundSecondary }}>{sublabel}</div>
      </div>
    </div>
  );
}
