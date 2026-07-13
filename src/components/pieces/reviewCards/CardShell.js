import React, { useState } from 'react';

// Shared chrome for every "À vérifier" review card. Each card is a single
// compact row that floats on the boxed review zone: a white rounded shell
// with a soft shadow that lifts on hover, a left status icon, a truncating
// label, and a right-aligned cluster of CTAs.

export const DISMISS_MS = 6000;

const SHELL_SHADOW = '0 1px 2px rgba(28,25,23,0.04), 0 6px 18px -10px rgba(28,25,23,0.10)';
const SHELL_SHADOW_HOVER = '0 1px 2px rgba(28,25,23,0.05), 0 10px 22px -10px rgba(28,25,23,0.14)';

// Shared compact action buttons — all the same height, padding and centering
// so the row of CTAs ends on a single clean right edge. Cards use
// outline/secondary buttons only — no filled primary.
export const btnBase = "inline-flex items-center justify-center gap-1.5 h-7 px-2.5 text-[13px] font-medium rounded-md whitespace-nowrap transition-colors";
export const btnLight = `${btnBase} text-foreground-tertiary bg-white border border-border-strong hover:bg-background-canvas`;

// White rounded shell that lifts on hover. `fade` re-keys the inner fade-in
// when a card swaps phases (e.g. choice → done).
export function CardShell({ children, fade = 'fadeIn 200ms ease' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-lg bg-white"
      style={{ boxShadow: hovered ? SHELL_SHADOW_HOVER : SHELL_SHADOW, transition: 'box-shadow 200ms ease' }}
    >
      <div className="px-3.5 py-2.5 flex items-center gap-3" style={{ animation: fade }}>
        {children}
      </div>
    </article>
  );
}

export function CardIcon({ bg, color, children }) {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ background: bg, color }}>
      {children}
    </div>
  );
}

// filename + muted state on one truncating line (full text in the title attr).
export function CardLabel({ name, state }) {
  return (
    <div className="flex-1 min-w-0 text-[13px] leading-[18px] truncate" title={`${name} · ${state}`}>
      <span className="font-medium text-foreground-strong">{name}</span>
      <span className="text-foreground-secondary"> · {state}</span>
    </div>
  );
}

// Green auto-dismiss progress line pinned to the bottom edge of a done card.
export function DismissBar() {
  return (
    <span
      className="absolute left-0 bottom-0 h-[2px]"
      style={{ background: '#4a9168', width: '100%', transformOrigin: 'left', animation: `pileReviewDismiss ${DISMISS_MS}ms linear forwards` }}
    />
  );
}
