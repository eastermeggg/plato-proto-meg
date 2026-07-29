import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { quotaTone } from '../../data/pricing';

// Weekly usage / quota gauge - shared by settings ("Mon usage", sidebar
// indicator) and the onboarding flow. Pure: pass `trial` ({ tone, daysRemaining })
// to render the settings-only trial header row; omit it everywhere else.
//   plan     - plan object ({ name, quotaMult }) or null (→ lecture seule state)
//   pct      - 0-100
//   variant  - 'full' (bordered card) | 'compact' (transparent, sidebar)
export default function WeeklyUsageCard({ plan, pct = 0, variant = 'full', trial = null }) {
  const compact = variant === 'compact';
  const isNone = !plan;
  const tone = quotaTone(pct);
  const shell = {
    borderRadius: 4,
    border: compact ? 'none' : (tone.warn ? '1px solid rgba(238,185,126,0.5)' : '1px solid #e7e5e3'),
    boxShadow: compact ? 'none' : '0 4px 6px -4px rgba(26,26,26,0.05), 0 10px 15px -3px rgba(26,26,26,0.05)',
    backgroundColor: compact ? 'transparent' : '#ffffff',
  };

  // ── Ø licence - lecture seule ────────────────────────────────────────────
  if (isNone) {
    return (
      <div className="overflow-hidden" style={shell}>
        <div style={{ padding: compact ? '14px 16px 16px' : '20px' }}>
          <div className="inline-flex items-center gap-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: '#78716c', textTransform: 'uppercase' }}>
            <Eye className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
            <span>Lecture seule</span>
          </div>
          <div style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: compact ? 22 : 28, fontWeight: 400, color: '#292524', letterSpacing: '-0.015em', marginTop: 8 }}>
            Aucune licence
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#78716c', marginTop: 4, lineHeight: '16px' }}>
            Demandez une licence à votre administrateur pour reprendre la main.
          </p>
        </div>
      </div>
    );
  }

  const headerWarn = tone.warn;
  const headerBg = headerWarn ? 'linear-gradient(180deg, #f9e6d3 0%, #ffffff 100%)' : 'transparent';
  const headerColor = headerWarn ? '#855b31' : '#78716c';

  return (
    <div className="overflow-hidden" style={shell}>
      {/* Trial header row - settings only (trial supplied) */}
      {trial && (
        <div
          className="flex items-center justify-between gap-2"
          style={{ padding: compact ? '10px 16px' : '12px 20px', borderBottom: `1px solid ${trial.tone.border}`, background: trial.tone.bg, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: trial.tone.text, textTransform: 'uppercase', letterSpacing: 'normal' }}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">Essai gratuit pour toute l'organisation</span>
          </span>
          <span className="flex-shrink-0">Expire dans <span style={{ fontWeight: 700 }}>{trial.daysRemaining} jour{trial.daysRemaining > 1 ? 's' : ''}</span></span>
        </div>
      )}

      {/* Header - eyebrow + plan chip */}
      <div style={{ padding: compact ? '14px 16px 0' : '20px 20px 0', background: headerBg }}>
        <div className="flex items-center justify-between gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: headerColor, textTransform: 'uppercase', letterSpacing: 'normal' }}>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <span className="truncate">Quota hebdomadaire</span>
          </span>
          {plan && (
            <span className="flex-shrink-0" style={{ color: tone.warn ? '#855b31' : '#a8a29e' }}>{plan.name} · ×{plan.quotaMult}</span>
          )}
        </div>
      </div>

      {/* Body - big % + caption + gauge bar */}
      <div style={{ padding: compact ? '8px 16px 18px' : '12px 20px 24px', display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="flex items-baseline gap-0.5">
            <span className="tabular-nums" style={{ fontFamily: "'RL Para Trial Central', Georgia, 'Times New Roman', serif", fontSize: compact ? 30 : 48, fontWeight: 400, color: tone.warn ? '#bd6c1a' : '#292524', letterSpacing: '-0.6px', lineHeight: 1 }}>
              {pct}
            </span>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: compact ? 16 : 24, fontWeight: 500, color: '#78716c', opacity: 0.5 }}>%</span>
          </div>
          <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, fontWeight: 500, color: '#78716c', lineHeight: '16px' }}>
            {pct >= 100 ? 'Quota atteint - se recharge lundi, 9h' : 'utilisé cette semaine - se recharge lundi, 9h'}
          </div>
        </div>
        <div style={{ height: 4, width: '100%', borderRadius: 999, overflow: 'hidden', backgroundColor: tone.warn ? tone.fill : tone.track }}>
          {!tone.warn && (
            <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: tone.fill, borderRadius: 999, transition: 'width 0.5s ease' }} />
          )}
        </div>
      </div>
    </div>
  );
}
