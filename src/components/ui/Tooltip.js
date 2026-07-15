import React, { useState } from 'react';
import { colors } from '../../design-system/tokens';

const POSITIONS = {
  top:    { bottom: 'calc(100% + 6px)', left: '50%',  transform: 'translateX(-50%)' },
  bottom: { top:    'calc(100% + 6px)', left: '50%',  transform: 'translateX(-50%)' },
  left:   { right:  'calc(100% + 6px)', top:  '50%',  transform: 'translateY(-50%)' },
  right:  { left:   'calc(100% + 6px)', top:  '50%',  transform: 'translateY(-50%)' },
};

export default function Tooltip({ content, side = 'top', children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: 'absolute',
            ...POSITIONS[side],
            padding: '5px 8px',
            borderRadius: 6,
            background: colors.semantic.foreground,
            color: colors.semantic.white,
            fontSize: 12, lineHeight: '16px', fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
