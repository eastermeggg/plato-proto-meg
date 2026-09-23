import React from 'react';
import { X } from 'lucide-react';
import { colors, shadows } from '../../design-system/tokens';

// JP list-item / standalone card.
// Figma:
//   - list-item (memory section)   → node 36768:50177  (border-bottom only)
//   - standalone card (JP Tab)     → node 36761:48857  (full border + rationale)
//
// Layout:
//   ┌──────────────────────────────────────────────────────────┐
//   │ Title · chambre           date  [│ × close on bordered]  │
//   │ Profile victime (subtitle)                                │
//   │ [category]  [status]  [ATPT 24€/h]      [tagsAction]      │
//   │ ┃ NOTE DE PERTINENCE                                      │
//   │ ┃ Rationale text clamped to 4 lines…                      │
//   ├──────────────────────────────────────────────────────────┤
//   │ N°…                              [DSA][DFT][Poste]…       │
//   └──────────────────────────────────────────────────────────┘
//
// Props:
//   decision         — required, full decision object
//   bordered         — full border + rounded card vs border-bottom-only list-item
//   onClick          — clicks on the card chrome (decision row open)
//   onRemove         — renders × in the header (next to date) when provided
//                      `bordered` cards put the × inline with the date; list rows
//                      can also use the `tagsAction` slot for the same purpose
//   removeTitle      — accessible label for the × button (default "Retirer")
//   rationale        — when provided, renders the NOTE DE PERTINENCE block
//                      clamped to 4 lines with overflow ellipsis
//   tagsAction       — React node to the right of the tags row
//                      (e.g. "+ Ajouter" / "Déjà en référence")
//   extraBadges      — [{ label, tone }] inserted before category/status badges
//   footerChips      — string[] rendered as outlined badges in the footer right
//   footerRight      — arbitrary node for the right of the footer (takes
//                      precedence over footerChips when both are provided)

const formatDateNumeric = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

// Heuristic — status text containing "décéd" renders destructive.
const isDestructiveStatus = (s) => /décéd/i.test(String(s || ''));

function Badge({ children, tone = 'secondary' }) {
  const palette = {
    secondary:   { backgroundColor: colors.semantic.muted, color: colors.semantic.foregroundTertiary },
    info:        { backgroundColor: colors.piece.expertise.bg, color: colors.feedback.info.text },
    accent:      { backgroundColor: colors.brand.subtle, color: colors.accents.ochre },
    destructive: { backgroundColor: colors.badge.destructive.bg, color: colors.semantic.white },
    outlined:    { backgroundColor: 'transparent', color: colors.semantic.foregroundTertiary, border: `1px solid ${colors.semantic.border}` },
  }[tone] || { backgroundColor: colors.semantic.muted, color: colors.semantic.foregroundTertiary };
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        ...palette,
        padding: '2px 8px',
        borderRadius: 6,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12, fontWeight: 500, lineHeight: '16px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: 220,
      }}
    >
      {children}
    </span>
  );
}

export default function JPMemoryRow({
  decision,
  bordered = false,
  onClick,
  onRemove,
  removeTitle = 'Retirer',
  rationale = null,
  tagsAction = null,
  // Backwards-compat: callers used `action` before this prop was renamed.
  action = null,
  extraBadges = [],
  footerChips = null,
  footerRight = null,
}) {
  if (!decision) return null;

  const title = `${decision.jurisdiction || ''}${decision.chambre ? ` · ${decision.chambre}` : ''}`;
  const date = formatDateNumeric(decision.date);
  const subtitle = decision.victimProfile || null;
  const amounts = decision.amounts || [];
  const interactive = !!onClick;
  const resolvedTagsAction = tagsAction ?? action;
  const statusTone = isDestructiveStatus(decision.status) ? 'destructive' : 'secondary';

  const containerStyle = bordered
    ? {
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 8,
        padding: 13,
        boxShadow: shadows.xs,
      }
    : {
        borderBottom: `1px solid ${colors.semantic.border}`,
        padding: '12px 12px 13px 12px',
      };

  return (
    <div
      onClick={onClick}
      className="bg-surface group"
      style={{
        ...containerStyle,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'background-color 0.18s ease, box-shadow 0.24s ease',
      }}
      onMouseOver={interactive ? (e) => {
        e.currentTarget.style.backgroundColor = colors.banner.neutral.bgFrom;
        if (bordered) e.currentTarget.style.boxShadow = '0px 12px 32px -6px rgba(26,26,26,0.10), 0px 4px 10px -4px rgba(26,26,26,0.05)';
      } : undefined}
      onMouseOut={interactive ? (e) => {
        e.currentTarget.style.backgroundColor = colors.semantic.white;
        if (bordered) e.currentTarget.style.boxShadow = shadows.xs;
      } : undefined}
    >
      <div className="flex flex-col" style={{ gap: 14 }}>
        {/* Header — title row + subtitle */}
        <div className="flex flex-col" style={{ gap: 4, padding: '0 2px' }}>
          <div className="flex items-center justify-between gap-3">
            <p
              className="truncate"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14, fontWeight: 500, lineHeight: '20px',
                color: colors.semantic.foreground, margin: 0,
              }}
            >
              {title}
            </p>
            <div className="flex items-center flex-shrink-0" style={{ gap: 6 }}>
              {date && (
                <p
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12, fontWeight: 400, lineHeight: '16px',
                    color: colors.semantic.mutedForeground, letterSpacing: '0.12px',
                    margin: 0, whiteSpace: 'nowrap',
                  }}
                >
                  {date}
                </p>
              )}
              {onRemove && (
                <>
                  <span style={{ width: 1, height: 12, backgroundColor: colors.semantic.borderAlt }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(decision); }}
                    title={removeTitle}
                    aria-label={removeTitle}
                    className="inline-flex items-center justify-center rounded transition-colors"
                    style={{ width: 20, height: 20, color: colors.semantic.foregroundMuted, backgroundColor: 'transparent' }}
                    onMouseOver={(e) => { e.currentTarget.style.color = colors.feedback.destructive.text; e.currentTarget.style.backgroundColor = colors.step.red.bg; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = colors.semantic.foregroundMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>
          </div>
          {subtitle && (
            <p
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12, fontWeight: 400, lineHeight: '16px',
                color: colors.semantic.mutedForeground, letterSpacing: '0.12px', margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Tags + tagsAction */}
        <div className="flex items-center" style={{ gap: 10 }}>
          <div className="flex flex-wrap items-center" style={{ gap: 6, flex: '1 0 0', minWidth: 0 }}>
            {extraBadges.map((b, i) => (
              <Badge key={`x-${i}`} tone={b.tone || 'accent'}>{b.label}</Badge>
            ))}
            {decision.category && <Badge tone="secondary">{decision.category}</Badge>}
            {decision.status && <Badge tone={statusTone}>{decision.status}</Badge>}
            {amounts.map((a, i) => (
              <Badge key={`a-${i}`} tone="info">
                <span>{a.poste}{' '}</span>
                <span style={{ color: statusTone === 'destructive' ? colors.feedback.info.text : colors.semantic.foregroundTertiary }}>{a.displayValue}</span>
              </Badge>
            ))}
          </div>
          {resolvedTagsAction && (
            <div
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {resolvedTagsAction}
            </div>
          )}
        </div>

        {/* Rationale block */}
        {rationale && (
          <div style={{ padding: '0 2px' }}>
            <div
              style={{
                borderLeft: `2px solid ${colors.semantic.borderHover}`,
                paddingLeft: 15, paddingTop: 4, paddingBottom: 4,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground,
                  textTransform: 'uppercase', letterSpacing: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                APPORT DE LA DÉCISION
              </div>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 400, lineHeight: '16px',
                  color: colors.semantic.foreground, letterSpacing: '0.12px', margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {rationale}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(decision.numero || footerRight || (footerChips && footerChips.length > 0)) && (
        <div
          className="flex items-center justify-between"
          style={{
            borderTop: `1px solid ${colors.semantic.border}`,
            marginTop: 14,
            paddingTop: 10,
            paddingLeft: 2,
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, fontWeight: 500,
              color: colors.semantic.mutedForeground, textTransform: 'uppercase',
              letterSpacing: 0, margin: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {decision.numero ? `n°${decision.numero}` : ''}
          </p>
          {(footerRight || (footerChips && footerChips.length > 0)) && (
            <div className="flex flex-wrap items-center justify-end" style={{ gap: 6 }}>
              {footerRight
                ? footerRight
                : footerChips.map((c, i) => (
                    <Badge key={`fc-${i}`} tone="outlined">{c}</Badge>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
