import React from 'react';
import { Loader2 } from 'lucide-react';
import { CardShell, CardIcon } from './CardShell';

// Aggregate background-processing indicator — a single row standing in for the
// N documents still being analysed (the chat shows the per-document progress).
export default function LoadingCard({ count }) {
  return (
    <CardShell>
      <CardIcon bg="#f5f5f4" color="#78716c"><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.75} /></CardIcon>
      <div className="flex-1 min-w-0 text-[13px] leading-[18px] text-foreground-tertiary truncate">
        Analyse de <span className="font-medium text-foreground-strong tabular-nums">{count}</span> document{count > 1 ? 's' : ''}…
      </div>
    </CardShell>
  );
}
