import React from 'react';
import { X as XIcon } from 'lucide-react';
import { colors } from '../../design-system/tokens';

const SIDE_STYLES = {
  right:  { right: 0,  top: 0, bottom: 0 },
  left:   { left: 0,  top: 0, bottom: 0 },
  bottom: { left: 0,  right: 0, bottom: 0, height: 320 },
  top:    { left: 0,  right: 0, top: 0,    height: 320 },
};

export default function Sheet({ open, side = 'right', onClose, title, children, width = 360 }) {
  if (!open) return null;
  const sideStyle = { ...SIDE_STYLES[side] };
  if (side === 'right' || side === 'left') sideStyle.width = width;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
      <div
        role="button"
        tabIndex={-1}
        aria-label="Fermer"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        style={{
          position: 'absolute',
          ...sideStyle,
          background: colors.semantic.white,
          padding: 20,
          boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', gap: 12,
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.semantic.foreground }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <XIcon style={{ width: 16, height: 16, color: colors.semantic.foregroundSecondary }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
