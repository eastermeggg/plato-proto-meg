import React from 'react';
import { FolderOpen, Link2 } from 'lucide-react';

// ── ScopeChip ────────────────────────────────────────────────────────
// States the conversation's perimeter on the composer toolbar.
//   Unscoped: « Hors dossier · {vertical} » + one action, « Rattacher » —
//             rendue seulement quand onAttach est fourni (pas d'action sur la
//             home : il n'y a pas encore de fil à rattacher).
//   Scoped:   « {dossierLabel} · {vertical} », no action — the chip is
//             never a scope selector mid-thread.
// flash=true plays a one-shot background pulse (after an attachment).

const FLASH_KEYFRAMES = `
@keyframes scope-chip-flash {
  0% { background-color: #ffffff; }
  30% { background-color: #eeece6; }
  100% { background-color: #ffffff; }
}
.scope-chip-flash { animation: scope-chip-flash 900ms ease-out 1; }
`;

export default function ScopeChip({ scope, dossierLabel, flash, onAttach, onFlashEnd }) {
  const scoped = !!(scope && scope.dossierId);
  const vertical = scope && scope.vertical;
  const label = scoped
    ? [dossierLabel, vertical].filter(Boolean).join(' · ')
    : ['Hors dossier', vertical].filter(Boolean).join(' · ');

  return (
    <div className="inline-flex items-center gap-1 min-w-0">
      <style>{FLASH_KEYFRAMES}</style>
      <span
        className={`inline-flex items-center gap-1.5 h-7 px-2 min-w-0 rounded-full border border-border bg-white text-[12px] ${scoped ? 'text-foreground' : 'text-foreground-secondary'} ${flash ? 'scope-chip-flash' : ''}`}
        onAnimationEnd={() => {
          if (flash && onFlashEnd) onFlashEnd();
        }}
        title={label}
      >
        <FolderOpen
          className={`w-3.5 h-3.5 flex-shrink-0 ${scoped ? 'text-foreground-secondary' : 'text-foreground-muted'}`}
          strokeWidth={1.75}
        />
        <span className="truncate">{label}</span>
      </span>
      {!scoped && onAttach && (
        <button
          type="button"
          onClick={onAttach}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-full text-[12px] font-medium text-foreground hover:bg-background-subtle transition-colors flex-shrink-0"
        >
          <Link2 className="w-3 h-3" strokeWidth={1.75} />
          Rattacher
        </button>
      )}
    </div>
  );
}
