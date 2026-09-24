import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { colors } from '../../design-system/tokens';

// ── ComposerSystemHeader ─────────────────────────────────────────────
// The system-state row that caps the composer. One state at a time (the
// caller resolves priority: blocked > warning > inProgress). It never
// renders a decision — at most a « Voir » link.
//
// state = null | { kind: 'inProgress'|'warning'|'blocked', label, detail?, onOpen? }
//
// Figma « Chat Input » (node 1081:50926) : la rangée est TRANSPARENTE ;
// le fond teinté vit sur le wrapper qui enveloppe la carte blanche
// (AssistantComposer, colors.composer.*). Éclair plein pour les états
// quota (limite / atteint), spinner pour l'analyse en cours.

const KIND_STYLE = {
  inProgress: { color: colors.semantic.foreground },
  warning: { color: colors.feedback.warning.text },
  blocked: { color: colors.feedback.destructive.text },
};

export default function ComposerSystemHeader({ state }) {
  if (!state || !KIND_STYLE[state.kind]) return null;
  const { color } = KIND_STYLE[state.kind];

  const icon =
    state.kind === 'inProgress' ? (
      <Spinner size="sm" color={color} />
    ) : (
      <Zap className="w-4 h-4 flex-shrink-0" style={{ color }} fill={color} strokeWidth={0} />
    );

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      {icon}
      <span
        className="flex-1 min-w-0 text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color, lineHeight: '16px' }}
      >
        {state.label}
        {state.detail && (
          <span className="font-normal opacity-80"> · {state.detail}</span>
        )}
      </span>
      {state.onOpen && (
        <button
          type="button"
          onClick={state.onOpen}
          className="inline-flex items-center gap-0.5 flex-shrink-0 text-[12px] font-medium hover:opacity-70 transition-opacity"
          style={{ color }}
        >
          Voir
          <ArrowRight className="w-3 h-3" strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
}
