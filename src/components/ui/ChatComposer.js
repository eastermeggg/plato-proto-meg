import React from 'react';
import { colors } from '../../design-system/tokens';
import Button from './Button';

export default function ChatComposer({ value = '', placeholder = 'Demande à Norma…', onChange, onSend, disabled, maxRows = 6 }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: 8,
        background: colors.semantic.white,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 12,
        maxWidth: 520,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <textarea
        value={value}
        onChange={onChange}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1, resize: 'none',
          padding: '8px 10px',
          fontSize: 14, lineHeight: '20px',
          color: colors.semantic.foreground,
          background: 'transparent',
          border: 'none', outline: 'none',
          fontFamily: 'inherit',
          maxHeight: maxRows * 24,
        }}
      />
      <Button variant="primary" size="sm" label="Envoyer" onClick={onSend} disabled={disabled || !value} />
    </div>
  );
}
