import React from 'react';
import { X } from 'lucide-react';
import {
  getPrimaryAmount,
  formatDateLong,
} from '../../data/mockDecisions';
import { colors, shadows } from '../../design-system/tokens';

// Décédé/Décédée → destructive color; everything else stays muted.
const STATUS_DECEASED = (s) => s === 'Décédé' || s === 'Décédée';

// ─── Tag primitive ──────────────────────────────────────────────────────
// All facts (category · status · amounts) render as inline tags below the
// title, packing left so they sit close to the identity.
const TAG_BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 8px',
  borderRadius: 4,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};
const TAG_NEUTRAL = { ...TAG_BASE, backgroundColor: colors.semantic.backgroundSubtle, color: colors.semantic.foregroundTertiary };
const TAG_DESTRUCTIVE = { ...TAG_BASE, backgroundColor: colors.feedback.destructive.text, color: colors.semantic.white };
const TAG_AMOUNT = { ...TAG_BASE, backgroundColor: colors.piece.medical.bg, color: colors.feedback.info.text, fontWeight: 600 };

function Tag({ style, children, title }) {
  return <span style={style || TAG_NEUTRAL} title={title}>{children}</span>;
}

// ─── Footer poste chip (Figma 36760:48635) ──────────────────────────────
// Outline pill in the footer — represents a poste the JP is attached to.
const PosteFooterChip = ({ acronym }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      border: `1px solid ${colors.semantic.border}`,
      backgroundColor: 'white',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 11,
      fontWeight: 500,
      color: colors.semantic.mutedForeground,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}
  >
    {acronym}
  </span>
);

// Unit row primitive. Wrap inside JPListingChat (mini-table) or use directly
// with `asCard` inside JPListingPosteDetail (floating cards).
//
// Layout (Figma 36760:48635):
//   Header     [⭐][🔖] Jurisdiction · Chambre              10/01/2024
//              Profile subline
//              [Type] [Status] [Amount...]
//              ┃ NOTE DE PERTINENCE  (optional, when rationale)
//              ┃ rationale text…
//   ─────────────────────────────────────────────────
//   Footer     N°22/12458              [DSA] [DFT] [Poste]
//
// Props:
//   - decision        : Decision (required)
//   - favorited       : ⭐ JP de référence du cabinet (workspace scope)
//   - bookmarked      : 🔖 attachée à ce poste sur ce dossier (matter scope)
//   - showAmount      : when true, render the matching amount(s) as tags (default true)
//   - posteChips      : optional string[] of poste acronyms to render in the FOOTER
//   - isSelected      : orange tint for the open-drawer row
//   - currentPosteId  : when set (poste-detail), only that poste's amount tag shows
//   - subline         : optional ReactNode override of the default subline
//   - renderAccessory : optional (d) => node — appended outside the main column
//   - rationale       : optional string — renders the NOTE DE PERTINENCE block
//   - rowStyle        : optional extra style merged into the row container
//   - isLast          : drop bottom border when this is the last row in a list
//   - asCard          : standalone card chrome (own border + radius + shadow)
//   - onClick         : (d) => void

export default function JPRow({
  decision,
  favorited = false,
  bookmarked = false,
  showAmount = true,
  posteChips = null,
  isSelected = false,
  currentPosteId = null,
  subline = null,
  renderAccessory = null,
  rationale = null,
  rowStyle = null,
  isLast = false,
  asCard = false,
  onClick,
  // Quick-remove: when provided, renders a hover-revealed `×` in the top-right
  // corner. Click removes the JP from the *current scope* (parent decides).
  // Stops event propagation so the drawer doesn't also open.
  onRemove,
  removeTitle = 'Retirer',
}) {
  if (!decision) return null;

  const d = decision;
  const hasDate = d.date && /^\d{4}-\d{2}-\d{2}/.test(d.date);

  // Pick which amounts to render as inline tags:
  //  - currentPosteId set (poste detail) → just that poste's amount
  //  - otherwise → all amounts
  let amountTags = [];
  if (showAmount && d.amounts && d.amounts.length > 0) {
    if (currentPosteId) {
      const match = d.amounts.find(a => a.poste.toLowerCase() === String(currentPosteId).toLowerCase()) || getPrimaryAmount(d);
      if (match) amountTags = [match];
    } else {
      amountTags = d.amounts;
    }
  }

  const hasFooter = !!d.numero || (Array.isArray(posteChips) && posteChips.length > 0);

  return (
    <div
      onClick={() => onClick?.(d)}
      className="group cursor-pointer flex items-stretch relative"
      style={{
        backgroundColor: isSelected ? colors.brand.subtle : 'white',
        ...(asCard
          ? {
              border: `1px solid ${colors.semantic.border}`,
              borderRadius: 4,
              boxShadow: shadows.xs,
            }
          : {
              borderBottom: isLast ? 'none' : `1px solid ${colors.semantic.border}`,
            }
        ),
        transition: 'background-color 0.12s ease',
        ...(rowStyle || {}),
      }}
      onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = colors.banner.neutral.bgFrom; }}
      onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
    >
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ── Header block (padded) ──────────────────────────────────── */}
        <div className="px-3 pt-2.5 pb-3 flex flex-col" style={{ gap: 6 }}>

          {/* Title row — jurisdiction · chambre (left) · date | × (right).
              Saved state is not shown via icon here anymore - it's communicated
              by the footer poste chips (JP Tab) or the action button state. */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: colors.semantic.foreground }}>
              {d.jurisdiction}{d.chambre ? ` · ${d.chambre}` : ''}
            </span>
            <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
              {hasDate && (
                <span style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 400, color: colors.semantic.mutedForeground,
                  whiteSpace: 'nowrap',
                }}>
                  {formatDateLong(d.date)}
                </span>
              )}
              {onRemove && (
                <>
                  {hasDate && <span style={{ width: 1, height: 12, backgroundColor: colors.semantic.borderStrong }} />}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(d); }}
                    title={removeTitle}
                    aria-label={removeTitle}
                    className="inline-flex items-center justify-center rounded transition-colors"
                    style={{ width: 18, height: 18, color: colors.semantic.foregroundMuted }}
                    onMouseOver={(e) => { e.currentTarget.style.color = colors.feedback.destructive.text; e.currentTarget.style.backgroundColor = colors.step.red.bg; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = colors.semantic.foregroundMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile subline (e.g. Femme, 22 ans) */}
          {(d.victimProfile || subline != null) && (
            <span className="truncate" style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 400, color: colors.semantic.mutedForeground,
              lineHeight: '16px',
            }}>
              {subline != null ? subline : d.victimProfile}
            </span>
          )}

          {/* Tags row — category · status · amount(s) */}
          {(d.category || d.status || amountTags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {d.category && <Tag>{d.category}</Tag>}
              {d.status && (
                <Tag style={STATUS_DECEASED(d.status) ? TAG_DESTRUCTIVE : TAG_NEUTRAL}>
                  {d.status}
                </Tag>
              )}
              {amountTags.map((a, i) => (
                <Tag key={`amt-${i}`} style={TAG_AMOUNT} title={a.label}>
                  <span style={{ color: colors.feedback.info.text, fontWeight: 500, opacity: 0.75 }}>{a.poste}</span>
                  <span>{a.displayValue}</span>
                </Tag>
              ))}
            </div>
          )}

          {/* NOTE DE PERTINENCE — rationale quote block (clamped to 4 lines) */}
          {rationale && (
            <div
              className="mt-2"
              style={{ borderLeft: `2px solid ${colors.semantic.borderHover}`, paddingLeft: 15, paddingTop: 4, paddingBottom: 4 }}
            >
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground,
                opacity: 0.8, textTransform: 'uppercase',
                letterSpacing: '0.04em', marginBottom: 6, whiteSpace: 'nowrap',
              }}>
                NOTE DE PERTINENCE
              </div>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 400, lineHeight: '16px',
                  color: colors.semantic.mutedForeground, letterSpacing: '0.12px', margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {rationale}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer block — N° (left) · poste chips (right) ─────────── */}
        {hasFooter && (
          <div
            className="px-3 py-2 flex items-center justify-between gap-2"
            style={{ borderTop: `1px solid ${colors.semantic.backgroundSubtle}` }}
          >
            {d.numero ? (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted,
                whiteSpace: 'nowrap',
              }}>
                N°{d.numero}
              </span>
            ) : <span />}
            {Array.isArray(posteChips) && posteChips.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {posteChips.map((acronym) => (
                  <PosteFooterChip key={acronym} acronym={acronym} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {renderAccessory && renderAccessory(d)}
    </div>
  );
}
