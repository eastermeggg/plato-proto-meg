import React, { useEffect, useRef } from 'react';
import {colors, typography, shadows } from '../../design-system/tokens';

// Floating menu shown on right-click or via a kebab anchor. `position`
// is {x, y} screen coords; `items` is [{ icon, label, onClick, destructive?, separator? }].

export default function RowContextMenu({ open, position, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!ref.current?.contains(e.target)) onClose?.();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !position) return null;

  // Clamp to viewport — assume menu is ~220×N items*32 + 16 pad
  const menuW = 220;
  const menuH = items.reduce((h, it) => h + (it.separator ? 9 : 32), 16);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = Math.min(position.x, vw - menuW - 8);
  const y = Math.min(position.y, vh - menuH - 8);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 60,
        backgroundColor: colors.semantic.white,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 8,
        boxShadow: shadows['lg'],
        padding: 4,
        minWidth: menuW,
      }}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} style={{ height: 1, margin: '4px 0', backgroundColor: colors.semantic.border }} />;
        }
        const Icon = item.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); item.onClick?.(); onClose?.(); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              border: 'none',
              background: 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: typography.fontFamily.sans,
              fontSize: 13,
              color: item.destructive ? colors.feedback.destructive.base : colors.semantic.foreground,
              textAlign: 'left',
              transition: 'background-color 100ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = item.destructive ? colors.step.red.bg : colors.semantic.backgroundHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {Icon && <Icon style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.5} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
