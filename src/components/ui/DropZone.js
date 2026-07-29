import React from 'react';
import { Upload } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Plato DropZone — promoted faithfully from the validated preview in
// src/components/ui-kit/previews.jsx. Hover / drag styling lives in the global
// `.dropzone-*` rules in src/index.css. See DropZone.md.
//
// variant: 'container' (large dashed box) | 'inline' (compact dashed row)
export default function DropZone({
  variant = 'container',
  label = 'Glisser un fichier ici ou cliquer pour parcourir',
  sublabel = 'PDF, DOCX jusqu’à 20 Mo',
  onFiles, onClick, isDragging,
}) {
  if (variant === 'inline') {
    return (
      <div
        onClick={onClick}
        className={`dropzone-inline ${isDragging ? 'dropzone-drop' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          border: '1px dashed #d6d3d1',
          borderRadius: 8, background: '#fff',
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
      onClick={onClick}
      className={`dropzone-container ${isDragging ? 'dropzone-drop' : ''}`}
      style={{
        position: 'relative',
        padding: 32,
        border: '2px dashed #d6d3d1',
        borderRadius: 12,
        background: '#fff',
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
