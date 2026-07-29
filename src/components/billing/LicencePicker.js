import React from 'react';
import { Eye, Check, ChessPawn, ChessRook, ChessQueen } from 'lucide-react';
import { PRICING_PLANS } from '../../data/pricing';

const GLYPH = { PRO: ChessPawn, MAX: ChessRook, 'MAX+': ChessQueen };

// Selectable licence list - the same control used in the settings "Inviter des
// collaborateurs" modal, reused in the onboarding flow.
//   value        - selected plan id, or null for lecture seule
//   onChange     - (planId | null) => void
//   includeFree  - show the "Lecture seule · gratuit" option (invite: yes)
//   showDelta    - show "+ licence · X €/mois" on unselected rows (invite: yes)
//   showUsage    - render the usage implication under each plan (onboarding: yes)
export default function LicencePicker({ value, onChange, includeFree = false, showDelta = false, showUsage = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      {includeFree && (
        <button
          onClick={() => onChange(null)}
          className={`w-full flex items-center justify-between gap-3 px-3 h-10 rounded-lg border text-left transition-colors ${value === null ? 'border-foreground bg-background' : 'border-border hover:bg-background'}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Eye className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[14px] text-foreground">Lecture seule</span>
            <span className="text-[12px] text-foreground-muted">gratuit</span>
          </span>
          {value === null && <Check className="w-4 h-4 text-foreground flex-shrink-0" strokeWidth={2} />}
        </button>
      )}
      {PRICING_PLANS.map((p) => {
        const isCurrent = value === p.id;
        const PG = GLYPH[p.id] || ChessPawn;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`w-full flex items-center justify-between gap-3 px-3 rounded-lg border text-left transition-colors ${showUsage ? 'py-2.5 items-start' : 'h-11'} ${isCurrent ? 'border-foreground bg-background' : 'border-border hover:bg-background'}`}
          >
            <span className={`flex gap-2 min-w-0 ${showUsage ? 'items-start' : 'items-center'}`}>
              <PG className={`w-4 h-4 text-foreground-secondary flex-shrink-0 ${showUsage ? 'mt-0.5' : ''}`} strokeWidth={1.5} />
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="text-[14px] text-foreground">Plan {p.name}</span>
                  <span className="text-[12px] text-foreground-muted tabular-nums">{p.monthly} €/mois</span>
                </span>
                {showUsage && (
                  <span className="block text-[12px] text-foreground-secondary leading-4 mt-0.5">
                    <span className="font-medium text-foreground-tertiary">{p.usage}</span> - {p.usageDesc}
                  </span>
                )}
              </span>
            </span>
            {isCurrent ? (
              <Check className={`w-4 h-4 text-foreground flex-shrink-0 ${showUsage ? 'mt-0.5' : ''}`} strokeWidth={2} />
            ) : showDelta ? (
              <span className="text-[11px] font-medium text-[#855b31] tabular-nums flex-shrink-0">+ licence · {p.monthly} €/mois</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
