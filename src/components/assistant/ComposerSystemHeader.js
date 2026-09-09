import React from 'react';
import { ArrowRight, Loader2, Lock, Zap } from 'lucide-react';

// ── ComposerSystemHeader ─────────────────────────────────────────────
// The system-state row that caps the composer frame. One state at a
// time (the caller resolves priority: blocked > warning > inProgress).
// It never renders a decision — at most a « Voir » link.
//
// state = null | { kind: 'inProgress'|'warning'|'blocked', label, detail?, onOpen? }
//
// Visual model adapted from ChatComposerNotice (stone / amber / mauve tints).

const KIND_STYLE = {
  inProgress: { bg: '#e5e3da', color: '#292524' },
  warning: { bg: '#ecdbc9', color: '#855b31' },
  blocked: { bg: '#e5d4d2', color: '#7f1d1d' },
};

export default function ComposerSystemHeader({ state }) {
  if (!state || !KIND_STYLE[state.kind]) return null;
  const { bg, color } = KIND_STYLE[state.kind];

  const icon =
    state.kind === 'inProgress' ? (
      <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" style={{ color }} strokeWidth={1.75} />
    ) : state.kind === 'blocked' ? (
      <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} strokeWidth={1.75} />
    ) : (
      <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} fill={color} strokeWidth={0} />
    );

  return (
    <div className="flex items-center gap-2.5" style={{ backgroundColor: bg, padding: '8px 12px' }}>
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
