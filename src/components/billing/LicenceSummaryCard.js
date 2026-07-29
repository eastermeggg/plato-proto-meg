import React from 'react';
import { ChessPawn } from 'lucide-react';
import { PRICING_PLANS, TIER_GLYPH, QUOTA_LABEL, fmtEur } from '../../data/pricing';

// Per-tier licence breakdown + account total. Shared by the settings "Plan et
// facturation" forfait table and the onboarding recap (same shape: how many
// licences per tier, and the monthly total).
//   counts    - { PRO: n, MAX: n, 'MAX+': n }
//   total     - monthly total (number)
//   totalLabel- eyebrow on the footer ("Total du compte" | "Total")
export default function LicenceSummaryCard({ counts = {}, total = 0, totalLabel = 'Total du compte' }) {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="flex items-stretch">
        {PRICING_PLANS.map((p, i) => {
          const count = counts[p.id] || 0;
          const Glyph = TIER_GLYPH[p.id] || ChessPawn;
          return (
            <div key={p.id} className={`flex-1 min-w-0 px-4 py-4 ${i < PRICING_PLANS.length - 1 ? 'border-r border-border' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Glyph className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} />
                  <span style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: '18px', fontWeight: 500, color: '#292524', letterSpacing: '-0.01em' }} className="truncate">
                    Plan {p.name}
                  </span>
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', letterSpacing: '0.06em' }} className="uppercase whitespace-nowrap">
                  {QUOTA_LABEL[p.id]}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] leading-5">
                <span className="text-foreground font-medium">{p.monthly} € </span>
                <span className="text-foreground-secondary">HT / mois / licence</span>
              </p>
              <div className="h-px bg-border my-2.5" />
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: '24px', fontWeight: 500, color: '#292524', letterSpacing: '-0.02em' }} className="tabular-nums">
                  {count}
                </span>
                <span className="text-[14px] text-foreground-secondary">licence{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-5 py-3.5 bg-background border-t border-border">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: '#78716c', letterSpacing: '0.06em' }} className="uppercase">
          {totalLabel}
        </span>
        <p className="whitespace-nowrap">
          <span style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: '30px', fontWeight: 400, color: '#18181b', letterSpacing: '-0.02em' }} className="tabular-nums">
            {fmtEur(total)} €
          </span>
          <span className="text-[13px] text-foreground-secondary ml-2">HT / mois</span>
        </p>
      </div>
    </div>
  );
}
