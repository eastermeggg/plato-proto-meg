import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { formatDateShort, splitValue } from '../../data/mockDecisions';
import { colors } from '../../design-system/tokens';

// Inline JP reference. Two real contexts — chat and acte — expressed as
// five variants:
//
//   ── Chat context (agent prose) ────────────────────────────────────────
//   - ref : [saved?] n° pourvoi [↗]
//           → bare reference used INSIDE textual citations the agent writes
//             (e.g. "Cass. 2e civ., 12 décembre 2019, n° [pill]"). The prose
//             carries jurisdiction + date; the pill carries the id + an
//             external-link affordance.
//
//   - quantum : [saved?] n° · poste·quantum [↗]
//           → ref + the headline figure (value + unit). For chat moments
//             where the agent says "and the court fixed it at [pill]".
//
//   ── Acte context (generated legal documents) ──────────────────────────
//   - acte : [saved?] jurisdiction · date · n°
//           → full prose citation inside a generated acte. No external-link
//             icon — actes are static documents, not interactive surfaces.
//
//   ── Legacy / dense lists (kept for backwards-compat) ──────────────────
//   - xs  : [saved?] jurisdiction · n° pourvoi
//   - sm  : [saved?] jurisdiction · date · n° · poste · quantum
//
// All variants share the same height (22–24 px) and baseline so they flow
// inside running text without breaking the line.
//
// One typography rule: Inter · 12px · weight 500. Four colors:
//   #44403c — primary slots (jurisdiction · poste)
//   #78716c — muted (date)
//   #a8a29e — faint (n° pourvoi — citable id, present but subdued)
//   #b9703f — quantum (value + unit) — headline accent
//
// Chamber is hidden in Pill per spec (reserved for Card).

const PILL_TEXT = { fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary };
const PILL_MUTED = { fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundSecondary };
const PILL_FAINT = { fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundMuted };
const PILL_ACCENT = { fontSize: 12, fontWeight: 500, color: '#b9703f' }; // brand accent — no token in tokens.js yet
const SEP_STYLE = { fontSize: 12, color: colors.semantic.foregroundMuted };

export default function JPPill({
  decision,
  variant = 'sm',
  saved = false,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!decision) return null;

  const isRef = variant === 'ref';
  const isXs = variant === 'xs';
  const isQuantum = variant === 'quantum';
  const isActe = variant === 'acte';
  const isSm = variant === 'sm';
  const amt = decision.amounts?.[0];
  const { num, unit } = splitValue(amt?.displayValue);

  const sep = <span style={SEP_STYLE}>·</span>;

  // Slot composition by variant:
  //  - ref     → numero + external-link icon
  //  - quantum → numero + poste + quantum + external-link icon
  //  - acte    → jurisdiction + date + numero (no icon — static doc context)
  //  - xs      → jurisdiction + numero
  //  - sm      → jurisdiction + date + numero + poste + quantum (default)
  const showJurisdiction = isXs || isActe || isSm;
  const showDate = isActe || isSm;
  const showNumero = !!decision.numero;
  const showPoste = (isQuantum || isSm) && amt;
  const showExternalIcon = isRef || isQuantum;

  return (
    <span
      className="jp-pill"
      data-pill-id={decision.id}
      data-variant={variant}
      onClick={(e) => { e.stopPropagation(); onClick?.(decision); }}
      onMouseEnter={(e) => onMouseEnter?.(e, decision)}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 6,
        border: isSelected ? '1.5px solid #b9703f' : '1px solid transparent',
        backgroundColor: isSelected ? 'rgba(185, 112, 63, 0.06)' : '#eeece6',
        cursor: 'pointer',
        verticalAlign: 'baseline',
        lineHeight: '16px',
        transition: 'border-color 0.15s, background-color 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = '#b9703f';
      }}
      onMouseOut={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {saved && (
        <Bookmark
          className="flex-shrink-0"
          style={{ width: 12, height: 12, color: '#b9703f', fill: '#b9703f', position: 'relative', top: 1 }}
        />
      )}
      {showJurisdiction && (
        <span style={PILL_TEXT}>{decision.jurisdiction}</span>
      )}
      {showDate && (
        <>
          {sep}
          <span style={PILL_MUTED}>{formatDateShort(decision.date)}</span>
        </>
      )}
      {showNumero && (
        <>
          {(showJurisdiction || showDate) && sep}
          <span style={(isRef || isQuantum) ? PILL_TEXT : PILL_FAINT}>{decision.numero}</span>
        </>
      )}
      {showPoste && (
        <>
          {sep}
          <span style={PILL_TEXT}>{amt.poste}</span>
          <span style={PILL_ACCENT}>{num}{unit ? ` ${unit}` : ''}</span>
        </>
      )}
      {showExternalIcon && (
        <ExternalLink
          className="flex-shrink-0"
          style={{ width: 10, height: 10, color: '#78716c', position: 'relative', top: 1, marginLeft: 2 }}
          strokeWidth={1.75}
        />
      )}
    </span>
  );
}
