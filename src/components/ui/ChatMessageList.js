import React from 'react';
import { colors } from '../../design-system/tokens';
import ChatBubble from './ChatBubble';
import Avatar from './Avatar';

export default function ChatMessageList({ messages = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, maxWidth: 520 }}>
      {messages.map((m, i) => (
        <ChatBubble
          key={i}
          author={m.author}
          content={m.content}
          timestamp={m.timestamp}
          avatar={m.author === 'assistant'
            ? <Avatar size="sm" initials="N" color="cream" />
            : <Avatar size="sm" initials="M" color="blue" />
          }
        />
      ))}
    </div>
  );
}
