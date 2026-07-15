import React from 'react';
import { colors } from '../../design-system/tokens';

export default function ChatBubble({ author = 'user', content, timestamp, avatar }) {
  const isUser = author === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {avatar}
      <div
        style={{
          maxWidth: 420,
          padding: '10px 14px',
          borderRadius: 12,
          background: isUser ? colors.semantic.foreground : colors.semantic.cream,
          color: isUser ? colors.semantic.white : colors.semantic.foreground,
          fontSize: 14, lineHeight: '20px',
        }}
      >
        {content}
        {timestamp && (
          <div style={{ marginTop: 4, fontSize: 11, color: isUser ? 'rgba(255,255,255,0.6)' : colors.semantic.foregroundMuted }}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
