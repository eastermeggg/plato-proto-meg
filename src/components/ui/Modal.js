import React from 'react';
import { X as XIcon } from 'lucide-react';
import { colors } from '../../design-system/tokens';

const WIDTHS = { sm: 380, md: 512, lg: 640 };

export default function Modal({ open, onClose, title, description, children, size = 'md' }) {
  if (!open) return null;
  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Fermer"
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, zIndex: 5,
      }}
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: WIDTHS[size],
          background: colors.semantic.white,
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 18, fontWeight: 500, color: colors.semantic.foreground }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: colors.semantic.foregroundSecondary }}>
            <XIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
        {description && (
          <p style={{ margin: 0, fontSize: 14, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
