import React from 'react';
import { CardShell, CardIcon } from './CardShell';
import Spinner from '../../ui/Spinner';
import { colors } from '../../../design-system/tokens';

// Aggregate background-processing indicator — a single row standing in for the
// N documents still being analysed (the chat shows the per-document progress).
export default function LoadingCard({ count }) {
  return (
    <CardShell>
      <CardIcon bg={colors.semantic.backgroundSubtle} color={colors.semantic.mutedForeground}><Spinner size="sm" color={colors.semantic.mutedForeground} /></CardIcon>
      <div className="flex-1 min-w-0 text-[13px] leading-[18px] text-foreground-tertiary truncate">
        Analyse de <span className="font-medium text-foreground-strong tabular-nums">{count}</span> document{count > 1 ? 's' : ''}…
      </div>
    </CardShell>
  );
}
