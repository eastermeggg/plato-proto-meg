import React, { useState } from 'react';
import { colors } from '../../design-system/tokens';

export default function Popover({ open: openProp, anchor, children, side = 'bottom', align = 'start' }) {
  const [openInternal, setOpen] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
      >
        {anchor}
      </span>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: side === 'bottom' ? 'calc(100% + 6px)' : undefined,
            bottom: side === 'top' ? 'calc(100% + 6px)' : undefined,
            left: align === 'start' ? 0 : align === 'center' ? '50%' : undefined,
            right: align === 'end' ? 0 : undefined,
            transform: align === 'center' ? 'translateX(-50%)' : undefined,
            background: colors.semantic.white,
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.05)',
            padding: 12,
            zIndex: 10,
            minWidth: 180,
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}
