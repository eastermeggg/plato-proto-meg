import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

// ── ChatComposerNotice ───────────────────────────────────────────────
// The notice row that caps the chat composer. Three variants:
//   'analyzing'      Document analysis in progress. Stone tint, plato gif.
//   'quota-warning'  ~90% weekly quota used. Amber tint, "Voir" -> Mon usage.
//   'quota-full'     Quota exhausted. Mauve tint, "Voir" -> upgrade. Locks composer.
//
// Props: variant, pct (quota-warning), onOpenUsage, onRequestUpgrade.

export const NOTICE_WRAP_BG = {
  analyzing: '#e5e3da',
  'quota-warning': '#ecdbc9',
  'quota-full': '#e5d4d2',
};

const NOTICE_TEXT = {
  analyzing: '#292524',
  'quota-warning': '#855b31',
  'quota-full': '#7f1d1d',
};

const ChatComposerNotice = ({ variant, pct, onOpenUsage, onRequestUpgrade }) => {
  if (!NOTICE_WRAP_BG[variant]) return null;
  const color = NOTICE_TEXT[variant];

  const icon =
    variant === 'analyzing' ? (
      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 16 }}>
        <img src="/plato-thinking.gif" alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
      </span>
    ) : (
      <Zap className="flex-shrink-0" style={{ width: 16, height: 16, color }} fill={color} strokeWidth={0} />
    );

  const label =
    variant === 'analyzing'
      ? 'Analyse des documents en cours...'
      : variant === 'quota-warning'
      ? `${Math.round(pct)}% de votre quota d'utilisation hebdo utilisé`
      : 'Quota hebdomadaire atteint - Upgrade';

  const showLink = variant !== 'analyzing';
  const onLink = variant === 'quota-warning' ? onOpenUsage : onRequestUpgrade;

  return (
    <div className="flex items-center gap-2.5" style={{ padding: '10px 12px' }}>
      {icon}
      <span
        className="flex-1 min-w-0 text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color, lineHeight: '16px' }}
      >
        {label}
      </span>
      {showLink && (
        <button
          onClick={onLink}
          className="inline-flex items-center gap-0.5 flex-shrink-0 text-[12px] font-medium hover:opacity-70 transition-opacity"
          style={{ color }}
        >
          Voir
          <ArrowRight className="w-3 h-3" strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
};

export default ChatComposerNotice;
