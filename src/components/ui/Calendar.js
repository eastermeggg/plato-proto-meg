import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Calendar — Plato design system. Source de vérité : page Figma « Calendar »
 * (canvas 2819:19886) : .Calendar Day Button (305:4208), .Calendar Arrow
 * Button (6733:2244), .CalendarDayHeader (6734:4882), .Calendar Header
 * Type=Default (6735:17260).
 *
 * Calendrier de sélection de date, mode `single` (le set Figma ne maquette pas
 * de plage : Alignment=Central uniquement). Semaine commençant le lundi,
 * libellés français via Intl.DateTimeFormat('fr-FR') — aucune lib de dates.
 *
 * Relevé Figma → tokens :
 *  - Jour 32x32 (Default) / 48x48 (Large) / 52x52 (Custom days, sous-libellé),
 *    radius 8, Inter 14/20 regular (typography.scale.body).
 *  - Jour sélectionné : bg primary / fg primary-foreground.
 *  - Jour hors-mois ou désactivé (état Disabled) : muted-foreground, opacité 50 %.
 *  - Survol : fond accent (rendu ici avec colors.semantic.muted — dans la
 *    palette du repo, accent == background, le survol serait invisible).
 *  - Focus : anneau 3px custom/focus rgba(163,163,163,.5) — rendu avec
 *    colors.semantic.borderHover (pas de token alpha), via :focus-visible.
 *  - Flèches : 32x32, chevron lucide 16, opacité 50 % au repos, pleine + fond
 *    au survol. Bouton local (Button `icon` fait 34px et n'a pas l'état
 *    « repos à 50 % » — géométrie Figma non alignée, cf. fiche).
 */

const CELL_SIZES = {
  default: 32, // Size=Default
  large:   48, // Size=Large
  custom:  52, // Size=Custom days (activée par `dayDetail`)
};
const COL_GAP = 6;
const ROW_GAP = 4;

const DAY_TEXT = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                    // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,     // 20
  fontWeight: typography.scale.body.weight,                // 400
};

// :hover / :focus-visible ne s'expriment pas en style inline — feuille
// injectée une fois (même mécanique que Button.js).
let calCss = false;
function ensureCalCss() {
  if (calCss || typeof document === 'undefined') return;
  calCss = true;
  const s = document.createElement('style');
  s.id = 'ds-calendar-css';
  s.textContent = [
    // Jour — survol (Figma State=Hover : bg accent) ; le fond sélectionné est
    // posé en inline (il gagne), le survol ne s'applique donc qu'aux autres.
    `.ds-cal-day:hover:not(:disabled){background:${colors.semantic.muted}}`,
    `.ds-cal-day:focus-visible{outline:none;box-shadow:0 0 0 3px ${colors.semantic.borderHover}}`,
    // Flèches — repos à 50 % (Figma State=Enabled), plein + fond au survol.
    // (fonds posés ici, pas en inline, pour que :hover puisse les surcharger)
    `.ds-cal-nav{opacity:.5;background:${colors.semantic.background}}`,
    `.ds-cal-nav:hover:not(:disabled){opacity:1;background:${colors.semantic.muted}}`,
    `.ds-cal-nav:focus-visible{outline:none;opacity:1;box-shadow:0 0 0 3px ${colors.semantic.borderHover}}`,
    `.ds-cal-nav:disabled{opacity:.5;cursor:not-allowed}`,
  ].join('\n');
  document.head.appendChild(s);
}

// ── Helpers date (sans lib) ──────────────────────────────────────────────
const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameDay = (a, b) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Grille du mois, semaines complètes commençant le lundi.
function buildWeeks(month) {
  const first = firstOfMonth(month);
  const startOffset = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((startOffset + daysInMonth) / 7);
  const weeks = [];
  const cursor = new Date(first);
  cursor.setDate(1 - startOffset);
  for (let w = 0; w < weekCount; w++) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// Libellés français. Le 5 janvier 2026 est un lundi (ancre stable).
function weekdayLabels() {
  const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 0, 5 + i)));
}
function monthLabel(month) {
  const raw = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(month);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function NavButton({ direction, onClick, disabled, label }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      className="ds-cal-nav"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        padding: 8,
        border: 'none',
        borderRadius: radius.lg,
        color: colors.semantic.foreground,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 150ms ease, background 150ms ease',
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: 16, height: 16 }} />
    </button>
  );
}

export default function Calendar({
  // Sélection contrôlée
  value = null,          // Date sélectionnée
  onChange,              // (Date) => void
  // Mois affiché — contrôlé (month/onMonthChange) ou non (defaultMonth)
  month,                 // Date (n'importe quel jour du mois affiché)
  onMonthChange,         // (Date premier du mois) => void
  defaultMonth,
  // API
  mode = 'single',       // seul mode maquetté (pas de range dans le set Figma)
  size = 'default',      // 'default' 32px · 'large' 48px
  dayDetail,             // (date) => string — sous-libellé (Size=Custom days)
  disabled,              // (date) => boolean
  showOutsideDays = true,
  // Échappatoires
  className,
  style,
}) {
  ensureCalCss();
  const [internalMonth, setInternalMonth] = useState(() =>
    firstOfMonth(defaultMonth || value || new Date())
  );
  const shownMonth = month ? firstOfMonth(month) : internalMonth;
  const today = new Date();

  const weeks = useMemo(() => buildWeeks(shownMonth), [shownMonth]);
  const dayNames = useMemo(weekdayLabels, []);

  const cellSize = dayDetail ? CELL_SIZES.custom : (CELL_SIZES[size] || CELL_SIZES.default);
  const gridWidth = cellSize * 7 + COL_GAP * 6;

  const goTo = (delta) => {
    const next = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + delta, 1);
    if (!month) setInternalMonth(next);
    if (onMonthChange) onMonthChange(next);
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(7, ${cellSize}px)`,
    columnGap: COL_GAP,
  };

  return (
    <div
      className={className}
      role="application"
      aria-label={`Calendrier, ${monthLabel(shownMonth)}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 16,
        width: gridWidth,
        fontFamily: typography.fontFamily.sans,
        ...style,
      }}
    >
      {/* En-tête — Figma .Calendar Header Type=Default (6735:17260) */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <NavButton direction="prev" onClick={() => goTo(-1)} label="Mois précédent" />
        </div>
        <span
          style={{
            fontSize: typography.scale['body-medium'].size,                // 14
            lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
            fontWeight: typography.scale['body-medium'].weight,            // 500
            color: colors.semantic.foreground,
            textAlign: 'center',
          }}
        >
          {monthLabel(shownMonth)}
        </span>
        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          <NavButton direction="next" onClick={() => goTo(1)} label="Mois suivant" />
        </div>
      </div>

      {/* Jours de semaine — Figma .CalendarDayHeader (6734:4882) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
        <div style={rowStyle} aria-hidden="true">
          {dayNames.map((d) => (
            <span
              key={d}
              style={{
                height: 20,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontSize: typography.scale.caption.size,   // 12
                lineHeight: 1,
                fontWeight: typography.scale.caption.weight,
                color: colors.semantic.mutedForeground,
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Grille — Figma .Calendar Day Button (305:4208) */}
        {weeks.map((week, w) => (
          <div key={w} style={rowStyle}>
            {week.map((date) => {
              const outside = date.getMonth() !== shownMonth.getMonth();
              if (outside && !showOutsideDays) return <span key={date.getTime()} style={{ width: cellSize, height: cellSize }} />;
              const isDisabled = disabled ? !!disabled(date) : false;
              const isSelected = mode === 'single' && sameDay(date, value);
              const isToday = sameDay(date, today);
              const detail = dayDetail ? dayDetail(date) : null;
              const dimmed = outside || isDisabled; // état Disabled du set
              return (
                <button
                  key={date.getTime()}
                  type="button"
                  className="ds-cal-day"
                  disabled={isDisabled}
                  onClick={() => onChange && onChange(date)}
                  aria-pressed={isSelected}
                  aria-label={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(date)}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: detail ? 4 : 0,
                    width: cellSize,
                    height: cellSize,
                    padding: detail ? 6 : 0,
                    border: 'none',
                    borderRadius: radius.lg, // 8 — Figma calc(radius - 2px)
                    // Pas de fond inline pour l'état repos : le survol (CSS
                    // injecté) doit pouvoir s'appliquer. Sélection et
                    // aujourd'hui gagnent en inline.
                    background: isSelected
                      ? colors.semantic.primary
                      : isToday
                        ? colors.semantic.muted // marqueur « aujourd'hui » (cf. fiche)
                        : undefined,
                    color: isSelected
                      ? colors.semantic.primaryForeground
                      : dimmed
                        ? colors.semantic.mutedForeground
                        : colors.semantic.foreground,
                    opacity: dimmed ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background 150ms ease',
                    ...DAY_TEXT,
                  }}
                >
                  <span style={{ pointerEvents: 'none' }}>{date.getDate()}</span>
                  {detail && (
                    <span
                      style={{
                        pointerEvents: 'none',
                        fontSize: typography.scale.caption.size, // 12
                        lineHeight: 1,
                        color: isSelected ? undefined : colors.semantic.mutedForeground,
                        opacity: isSelected ? 0.7 : 1,
                      }}
                    >
                      {detail}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
