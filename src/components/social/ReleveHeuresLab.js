import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown, Plus, X, Paperclip, Copy,
  Clock, Check, Mail, FileText, Image as ImageIcon,
  Info, Link2, Moon, Coffee, Eye, Pencil,
  ArrowUp, ThumbsUp, ThumbsDown, PanelRightClose, MessageSquare, Calculator,
  Search, Scale, Home, MoreVertical, Folder, Lock, ShieldCheck, ArrowRight, Send,
  Bold, Italic, Underline,
  ArrowUpRight, CalendarClock, CalendarRange, AlertTriangle,
  User, Briefcase, Building2, SlidersHorizontal, Download, DollarSign, Sparkles,
} from 'lucide-react';
import PromptSuggestionCard from '../PromptSuggestionCard';
import Button from '../ui/Button';
import DropZone from '../ui/DropZone';
import Badge from '../ui/Badge';

// ─────────────────────────────────────────────────────────────────────────
// Relevé d'heures — Droit social.  Three UX explorations for the timesheet a
// lawyer (or their client) fills in to reconstruct worked hours across years,
// weeks and days, behind a Registre / Semaine / Liste toggle. Lives in the UI
// Components page (/ui-kit/releve-heures).
//
//   A — Le Registre  : a dense, auditable ledger. Year ▸ month ▸ week ▸ day,
//                      every créneau inline, running totals. For the lawyer
//                      reconstructing many months at once and exporting clean.
//   B — La Semaine   : a 7-day calendar where each créneau is a block placed
//                      on a time axis. Spatial, makes gaps / overlaps / nuits
//                      obvious. For seeing the shape of a week at a glance.
//   C — La Liste     : a guided, one-day-at-a-time card stack. This is the
//                      view a lawyer shares with the client — phone-friendly,
//                      hard to get lost in, "je n'ai pas travaillé" front and
//                      centre.
//
// All three read and write ONE shared dataset (edit a day in the calendar, the
// table total updates), so they compare 1:1. Everything is mocked and local.
// No HS +25 / +50 / COR — the brief is to count hours, sous-totaux, totaux.
// ─────────────────────────────────────────────────────────────────────────

// ── palette (Norma stone + cream) ────────────────────────────────────────
const INK    = '#292524';
const INK2   = '#44403c';
const MUTE   = '#78716c';
const FAINT  = '#a8a29e';
const LINE   = '#e7e5e3';
const PAPER  = '#F8F7F5';
const SUBTLE = '#fafaf9';
const CREAM  = '#eeece6';
const WHITE  = '#ffffff';
// brand emphasis = blue (cream + primary-black are the other two brand tokens)
const ACCENT_BG = '#eef3fa';   // light blue surface
const ACCENT_DK = '#1e3a8a';   // deep brand blue — figures / totals / links
const NIGHT     = '#5b6472';   // cool slate — work that crosses midnight
const REST_BG   = '#f6f5f3';
// subtle, diffused shadow shared by the relevé's blocks (cards)
const SHADOW = '0px 1px 2px rgba(26,26,26,0.04), 0px 8px 20px -8px rgba(26,26,26,0.10)';

const DOW = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTHS_ABBR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

let _uid = 1000;
const nextId = () => `p${++_uid}`;

// ── time helpers (everything in minutes; midnight-wrap aware) ─────────────
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const periodMin = (p) => (((toMin(p.end) - toMin(p.start)) % 1440) + 1440) % 1440;
const isOvernight = (p) => toMin(p.end) <= toMin(p.start);
const dayMin = (d) => (d.worked ? d.periods.reduce((a, p) => a + periodMin(p), 0) : 0);
const weekMin = (w) => w.days.reduce((a, d) => a + dayMin(d), 0);
const fmtHM = (min) => {
  if (!min) return '0h';
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};
// badge format — uppercase « H » unit, e.g. "440 H", "8 H 30"
const fmtHU = (min) => {
  const h = Math.floor((min || 0) / 60), m = (min || 0) % 60;
  return m ? `${h} H ${String(m).padStart(2, '0')}` : `${h} H`;
};

// ── period helpers (entry flow) ───────────────────────────────────────────
const fmtDateNum = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y.slice(2)}`; };   // 01/01/25
const daysBetween = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / 86400000);
const todayISO = () => new Date().toISOString().slice(0, 10);
// validation per the spec: both required, end > start, start not in the future, ≤ 12 months
const validatePeriod = (start, end) => {
  const r = { startError: '', endError: '', valid: false, days: 0 };
  if (!start) r.startError = 'Ce champ est requis';
  else if (Date.parse(start) > Date.parse(todayISO())) r.startError = 'La date de début ne peut pas être dans le futur';
  if (!end) r.endError = 'Ce champ est requis';
  else if (start && Date.parse(end) <= Date.parse(start)) r.endError = 'La date de fin doit être postérieure à la date de début';
  if (start && end) r.days = daysBetween(start, end);   // no upper bound — a relevé may span several years
  r.valid = !r.startError && !r.endError && !!start && !!end;
  return r;
};

// quarter-hour time options for the editors
const mkPeriod = (start, end) => ({ id: nextId(), start, end });

// Access code for the shared client link — the lawyer copies it with the link
// (SharePopover) and the client enters it to unlock the client view. Stable so the
// two sides agree (prototype; a real backend would issue a per-link secret).
const SHARE_PWD = '7K2-9F3';

// Empty ISO weeks covering an arbitrary period — a flat list (global week
// indices) the client app re-buckets into calendar months for navigation. It
// may span several years and always starts blank (the salariée fills it in).
function buildPeriodWeeks(startISO, endISO, restWeekends = true) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
  const offset = (start.getDay() + 6) % 7;            // 0 = Monday
  const monday0 = new Date(start);
  monday0.setDate(start.getDate() - offset);
  const weeks = [];
  const cursor = new Date(monday0);
  let w = 0;
  while (cursor <= end) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(cursor);
      dt.setDate(cursor.getDate() + i);
      days.push({
        id: `c-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`,
        iso: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`,
        dow: DOW[i], dateNum: dt.getDate(), month: dt.getMonth(), yearN: dt.getFullYear(),
        worked: false, rest: restWeekends && i >= 5, periods: [], note: '', attachments: [],   // client: weekends default to « Je n'ai pas travaillé »
      });
    }
    weeks.push({ id: `cw-${w}`, idx: w, label: `${days[0].dateNum} ${MONTHS_ABBR[days[0].month]} – ${days[6].dateNum} ${MONTHS_ABBR[days[6].month]}`, days });
    cursor.setDate(cursor.getDate() + 7);
    w++;
  }
  return weeks;
}

// The lawyer grid over an arbitrary (possibly multi-year) period — same flat
// weeks as the client, optionally seeded with the demo (« Commencer moi-même »
// shows a partly-reconstructed relevé; delegating leaves it empty for the client).
function buildLawyerWeeks(start, end, populate) {
  const weeks = buildPeriodWeeks(start, end, false);   // no weekend-rest default → nothing muted by default
  if (populate) {
    weeks.forEach((w, wi) => w.days.forEach((d, i) => {
      if (i < 5 && wi < 11) { d.worked = true; d.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:00')]; }
      decorate(d.yearN, d);   // self-checks: only the Jan-2025 overnight shift etc.
    }));
  }
  return weeks;
}

// ── immutable mutators over a { [year]: weeks } map, scoped to one year ──
// Shared by the lawyer grid and the standalone client app.
function makeOps(setData, year) {
  const mutate = (fn) => setData((prev) => { const next = structuredClone(prev); fn(next[year]); return next; });
  return {
    toggleWorked: (wi, di) => mutate((wk) => {
      const d = wk[wi].days[di];
      d.worked = !d.worked;
      if (d.worked && d.periods.length === 0) d.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:00')];
    }),
    // client list: explicit 3-state choice — 'worked' | 'rest' | 'todo'
    setDayStatus: (wi, di, status) => mutate((wk) => {
      const d = wk[wi].days[di];
      if (status === 'worked') {
        d.worked = true; d.rest = false;
        if (d.periods.length === 0) d.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:00')];
      } else if (status === 'rest') {
        d.worked = false; d.rest = true;
      } else {
        d.worked = false; d.rest = false;
      }
    }),
    addPeriod: (wi, di) => mutate((wk) => { wk[wi].days[di].periods.push(mkPeriod('18:00', '19:00')); }),
    removePeriod: (wi, di, pid) => mutate((wk) => { const d = wk[wi].days[di]; d.periods = d.periods.filter((p) => p.id !== pid); if (d.periods.length === 0) { d.worked = false; d.rest = false; } }),
    setPeriod: (wi, di, pid, field, val) => mutate((wk) => { const p = wk[wi].days[di].periods.find((x) => x.id === pid); if (p) p[field] = val; }),
    setNote: (wi, di, val) => mutate((wk) => { wk[wi].days[di].note = val; }),
    addAttach: (wi, di) => mutate((wk) => { const d = wk[wi].days[di]; const n = d.attachments.length + 1; d.attachments.push({ id: nextId(), name: `Justificatif_${d.dow}${d.dateNum}_${n}.pdf`, kind: 'pdf' }); }),
    removeAttach: (wi, di, aid) => mutate((wk) => { const d = wk[wi].days[di]; d.attachments = d.attachments.filter((a) => a.id !== aid); }),
    fillWeekdays: (wi) => mutate((wk) => {
      wk[wi].days.forEach((d, i) => {
        if (i < 5 && (!d.worked || d.periods.length === 0)) {
          d.worked = true; d.rest = false;
          d.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:00')];
        }
      });
    }),
    // ── duplication — NON-DESTRUCTIVE: only fills EMPTY days (status 'todo'); a
    // day is protected once it has a slot (worked) or « je n'ai pas travaillé » (rest).
    // Day → Week: copy this day's time slots to the week's empty (in-period) days.
    dayToWeek: (wi, di, startISO, endISO) => mutate((wk) => {
      const src = wk[wi].days[di];
      wk[wi].days.forEach((d, j) => {
        if (j === di || d.worked || d.rest) return;                       // self / protected
        if (startISO && (d.iso < startISO || d.iso > endISO)) return;      // outside the period
        d.worked = true; d.rest = false;
        d.periods = src.periods.map((p) => mkPeriod(p.start, p.end));
      });
    }),
    // Apply a suggested template (a sibling worked day's slots) to THIS empty day.
    applyDayTemplate: (wi, di, srcPeriods) => mutate((wk) => {
      const d = wk[wi].days[di];
      d.worked = true; d.rest = false;
      d.periods = srcPeriods.map((p) => mkPeriod(p.start, p.end));
    }),
    // Week → Month: copy this week's pattern (matched by weekday) to the month's empty days.
    weekToMonth: (wi, y, m, startISO, endISO) => mutate((wk) => {
      const srcDays = wk[wi].days;
      wk.forEach((w) => w.days.forEach((d, di) => {
        if (d.yearN !== y || d.month !== m || d.worked || d.rest) return;  // other month / protected
        if (startISO && (d.iso < startISO || d.iso > endISO)) return;      // outside the period
        const s = srcDays[di];                                            // same weekday in the source week
        if (s && s.worked) { d.worked = true; d.rest = false; d.periods = s.periods.map((p) => mkPeriod(p.start, p.end)); }
        else if (s && s.rest) { d.rest = true; d.worked = false; d.periods = []; }
      }));
    }),
    // Week → following week: copy this week's pattern (matched by weekday) to the next week's empty days.
    weekToNext: (wi, startISO, endISO) => mutate((wk) => {
      const src = wk[wi]; const dst = wk[wi + 1];
      if (!src || !dst) return;
      dst.days.forEach((d, j) => {
        if (d.worked || d.rest) return;                                   // protected
        if (startISO && (d.iso < startISO || d.iso > endISO)) return;      // outside the period
        const s = src.days[j];                                            // same weekday in the source week
        if (s && s.worked) { d.worked = true; d.rest = false; d.periods = s.periods.map((p) => mkPeriod(p.start, p.end)); }
        else if (s && s.rest) { d.rest = true; d.worked = false; d.periods = []; }
      });
    }),
    // Month → range: copy a source month's pattern (matched by weekday — first worked/rest
    // day of each weekday) to the empty days of every month inside [rangeStart, rangeEnd].
    // Powers « dupliquer ce mois vers les mois suivants / une période personnalisée ».
    monthToRange: (srcY, srcM, rangeStart, rangeEnd, startISO, endISO) => mutate((wk) => {
      const tpl = {};   // weekday index (0=Mon … 6=Dim) → template from the source month
      wk.forEach((w) => w.days.forEach((d, di) => {
        if (d.yearN !== srcY || d.month !== srcM || tpl[di] !== undefined) return;
        if (d.worked) tpl[di] = { worked: true, periods: d.periods };
        else if (d.rest) tpl[di] = { rest: true };
      }));
      wk.forEach((w) => w.days.forEach((d, di) => {
        if (d.worked || d.rest) return;                                   // protected
        if (d.iso < rangeStart || d.iso > rangeEnd) return;               // outside the target range
        if (startISO && (d.iso < startISO || d.iso > endISO)) return;     // outside the period
        const t = tpl[di];
        if (t && t.worked) { d.worked = true; d.rest = false; d.periods = t.periods.map((p) => mkPeriod(p.start, p.end)); }
        else if (t && t.rest) { d.rest = true; d.worked = false; d.periods = []; }
      }));
    }),
  };
}

// Overlay richer, more lifelike entries onto early January 2025 so the lab
// has notes, attachments, an evening slot and an overnight shift to show.
function decorate(year, day) {
  if (year !== 2025 || day.month !== 0) return;
  switch (day.dateNum) {
    case 2:
      day.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:15')];
      day.note = "SMS du manager : « Peux-tu traiter la relance fournisseur avant ce soir ? »";
      day.attachments = [{ id: nextId(), name: 'Capture SMS — 02/01.png', kind: 'image' }];
      break;
    case 3:
      day.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:30')];
      day.note = "Travail sur le rapport d'audit jusqu'à 18h30.";
      day.attachments = [{ id: nextId(), name: 'Rapport_audit_v3.pdf', kind: 'pdf' }];
      break;
    case 6:
      day.periods = [mkPeriod('08:45', '13:00'), mkPeriod('14:00', '18:30')];
      break;
    case 7:
      day.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '18:00'), mkPeriod('18:30', '21:00')];
      day.note = "Formation obligatoire en soirée (18h30–21h).";
      day.attachments = [
        { id: nextId(), name: 'Convocation_formation.pdf', kind: 'pdf' },
        { id: nextId(), name: 'Re: présence formation', kind: 'email' },
      ];
      break;
    case 8:
      day.periods = [mkPeriod('09:00', '13:00'), mkPeriod('14:00', '19:30')];
      day.note = "Inventaire de fin de trimestre — présence prolongée.";
      day.attachments = [{ id: nextId(), name: 'Planning_inventaire.png', kind: 'image' }];
      break;
    case 9:
      day.periods = [mkPeriod('22:00', '04:00')];
      day.note = "Astreinte de nuit déclenchée (incident production).";
      day.attachments = [{ id: nextId(), name: 'Ticket_incident_4821', kind: 'email' }];
      break;
    case 11:                                   // a worked Saturday — exception
      day.worked = true;
      day.periods = [mkPeriod('09:00', '12:00')];
      day.note = "Rattrapage samedi matin à la demande du service.";
      break;
    default:
      break;
  }
}

const ATTACH_ICON = { email: Mail, pdf: FileText, image: ImageIcon };

// ── tiny shared UI atoms ──────────────────────────────────────────────────
function useLabStyles() {
  useEffect(() => {
    if (document.getElementById('releve-lab-styles')) return;
    const el = document.createElement('style');
    el.id = 'releve-lab-styles';
    el.textContent = `
      @keyframes rh-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes rh-pop  { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
      @keyframes rh-slide-r { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes rh-dim { from { opacity: 0; } to { opacity: 1; } }
      .rh-fade { animation: rh-fade .22s ease-out both; }
      .rh-pop  { animation: rh-pop .14s ease-out both; }
      .rh-slide-r { animation: rh-slide-r .26s cubic-bezier(.32,.72,0,1) both; }
      .rh-dim { animation: rh-dim .2s ease-out both; }
      .rh-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
      .rh-scroll::-webkit-scrollbar-thumb { background: #e0ded9; border-radius: 8px; }
      .rh-scroll::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(el);
  }, []);
}

// Typeable time field — write the time directly (9, 930, 9h30, 9:30 → 09:30),
// normalised on blur/Enter; reverts to the last good value if unparseable.
function normalizeTime(s) {
  const d = String(s).replace(/[^0-9]/g, '');
  if (!d) return null;
  let h, m;
  if (d.length <= 2) { h = +d; m = 0; }
  else if (d.length === 3) { h = +d[0]; m = +d.slice(1); }
  else { h = +d.slice(0, 2); m = +d.slice(2, 4); }
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function TimeField({ value, onChange, label }) {
  const [raw, setRaw] = useState(value);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setRaw(value); }, [value]);

  const commit = (e) => {
    focused.current = false;
    if (e) e.currentTarget.style.borderColor = LINE;
    const n = normalizeTime(raw);
    if (n) { setRaw(n); if (n !== value) onChange(n); }
    else setRaw(value);
  };

  return (
    <input
      type="text" inputMode="numeric" aria-label={label} value={raw}
      onFocus={(e) => { focused.current = true; e.currentTarget.style.borderColor = INK; e.currentTarget.select(); }}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); else if (e.key === 'Escape') { setRaw(value); e.currentTarget.blur(); } }}
      className="rounded-md outline-none text-center transition-colors"
      style={{ width: 64, height: 34, fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: INK, background: WHITE, border: `1px solid ${LINE}` }}
    />
  );
}

// the editable list of créneaux for one day, reused by table + calendar + list
function PeriodsEditor({ day, ops, wi, di, compact }) {
  if (!day.worked) {
    return <Button variant="outline" size="md" icon={Plus} label="Déclarer des heures ce jour" onClick={() => ops.toggleWorked(wi, di)} />;
  }
  return (
    <div className="flex flex-col">
      {day.periods.map((p, i) => (
        <React.Fragment key={p.id}>
          {i > 0 && <div style={{ height: 1, background: LINE, margin: '10px 0' }} />}
          <div className="flex items-center gap-2 rh-pop">
            <button onClick={() => ops.removePeriod(wi, di, p.id)} className="flex items-center justify-center rounded-md transition-colors flex-shrink-0" style={{ width: 34, height: 34, border: `1px solid ${LINE}`, background: WHITE, color: MUTE }}
              onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; e.currentTarget.style.color = MUTE; }} title={day.periods.length > 1 ? 'Supprimer le créneau' : 'Supprimer — la journée repassera en non saisie'}>
              <X className="w-3.5 h-3.5" />
            </button>
            <TimeField value={p.start} onChange={(v) => ops.setPeriod(wi, di, p.id, 'start', v)} label="Heure de début" />
            <span style={{ color: FAINT, fontSize: 14 }}>→</span>
            <TimeField value={p.end} onChange={(v) => ops.setPeriod(wi, di, p.id, 'end', v)} label="Heure de fin" />
            {isOvernight(p) && (
              <span className="inline-flex items-center gap-1" style={{ fontSize: 11, color: NIGHT }} title="Ce créneau passe minuit">
                <Moon className="w-3 h-3" /> nuit
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
      <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
        <button onClick={() => ops.addPeriod(wi, di)} className="inline-flex items-center gap-1.5" style={{ fontSize: 14, fontWeight: 500, color: ACCENT_DK }}>
          <Plus className="w-3.5 h-3.5" /> Ajouter un créneau
        </button>
        {!compact && (
          <button onClick={() => ops.toggleWorked(wi, di)} className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: MUTE }}>
            <Coffee className="w-3.5 h-3.5" /> Je n'ai pas travaillé
          </button>
        )}
      </div>
    </div>
  );
}

function Justification({ day, ops, wi, di }) {
  return (
    <div className="flex flex-col gap-2.5">
      <textarea
        value={day.note}
        onChange={(e) => ops.setNote(wi, di, e.target.value)}
        placeholder="Justification — contexte, échanges, consigne du manager…"
        className="w-full rounded-lg outline-none resize-none rh-scroll"
        style={{ minHeight: 64, padding: '9px 11px', fontSize: 14, lineHeight: '20px', color: INK2, background: SUBTLE, border: `1px solid ${LINE}` }}
      />
      {/* attached documents — listed as document rows */}
      {day.attachments.length > 0 && (
        <div className="flex flex-col rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
          {day.attachments.map((a, i) => {
            const Icon = ATTACH_ICON[a.kind] || FileText;
            return (
              <div key={a.id} className="flex items-center gap-2.5 px-2.5 rh-pop" style={{ height: 44, background: WHITE, borderTop: i > 0 ? `1px solid ${LINE}` : 'none' }}>
                <span className="flex items-center justify-center rounded-md flex-shrink-0" style={{ width: 28, height: 28, background: SUBTLE, border: `1px solid ${LINE}` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: MUTE }} />
                </span>
                <span className="flex-1 min-w-0 truncate" style={{ fontSize: 13.5, color: INK2 }}>{a.name}</span>
                <button onClick={() => ops.removeAttach(wi, di, a.id)} className="flex items-center justify-center rounded-md transition-colors flex-shrink-0" style={{ width: 26, height: 26, color: FAINT }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = FAINT; }} title="Retirer le justificatif">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* drop component — joindre un justificatif */}
      <DropZone variant="inline" label="Joindre un justificatif — glisser ou cliquer" onClick={() => ops.addAttach(wi, di)} />
    </div>
  );
}

function SharePopover({ onOpenClient, open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  // an access code is shared with the link; the lawyer copies both at once and the
  // client enters it to unlock the client view (stable shared secret — see SHARE_PWD)
  const pwd = SHARE_PWD;
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) onOpenChange(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open, onOpenChange]);
  const LINK = 'https://norma.law/s/relv-9F3K2D';
  const copyBoth = () => {
    try { if (navigator.clipboard) navigator.clipboard.writeText(`${LINK}\nMot de passe : ${pwd}`); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => onOpenChange(!open)} className="inline-flex items-center gap-2 transition-all" style={{ height: 32, padding: '0 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: WHITE, background: INK, boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}>
        Partager au client <ArrowUpRight className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 rounded-xl rh-pop" style={{ top: 42, width: 340, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0 12px 32px rgba(41,37,36,0.16)', padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 2 }}>Lien de partage externe</div>
          <p style={{ fontSize: 12.5, color: MUTE, lineHeight: '17px', marginBottom: 12 }}>
            Envoyez le lien et le mot de passe à {MATTER.client}. Elle complète son relevé et vos modifications restent synchronisées.
          </p>
          <div className="flex items-center gap-1.5 rounded-lg" style={{ background: SUBTLE, border: `1px solid ${LINE}`, padding: '8px 9px', marginBottom: 6 }}>
            <Link2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT }} />
            <span className="truncate" style={{ fontSize: 12.5, color: INK2, fontFamily: "'IBM Plex Mono', monospace" }}>{LINK}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg" style={{ background: SUBTLE, border: `1px solid ${LINE}`, padding: '8px 9px', marginBottom: 12 }}>
            <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT }} />
            <span style={{ fontSize: 11.5, color: MUTE }}>Mot de passe</span>
            <span className="ml-auto" style={{ fontSize: 12.5, fontWeight: 600, color: INK2, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.06em' }}>{pwd}</span>
          </div>
          <button onClick={copyBoth} className="w-full inline-flex items-center justify-center gap-2 rounded-lg transition-colors" style={{ height: 40, fontSize: 13.5, fontWeight: 600, color: WHITE, background: copied ? '#3f7d5f' : INK }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = INK2; }} onMouseLeave={(e) => { e.currentTarget.style.background = copied ? '#3f7d5f' : INK; }}>
            {copied ? <><Check className="w-4 h-4" /> Lien et mot de passe copiés</> : <><Copy className="w-4 h-4" /> Copier le lien et le mot de passe</>}
          </button>
          {onOpenClient && (
            <div className="flex justify-center" style={{ marginTop: 10 }}>
              <button onClick={() => { onOpenChange(false); onOpenClient(); }} className="inline-flex items-center gap-1.5 transition-colors" style={{ fontSize: 12.5, fontWeight: 500, color: MUTE }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }} title="Ouvrir l'aperçu de la page client dans un nouvel onglet">
                <ArrowUpRight className="w-3.5 h-3.5" /> Ouvrir l'aperçu client
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Day-detail drawer — a right-side drawer that slides in over a dimmed
// backdrop (overlay, per the design system). The lawyer adds a day (declares
// hours on an empty day) or modifies one: serif title, créneaux + justification.
function DayDrawer({ day, wi, di, week, ops, onClose, start, end }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = dayMin(day);
  // for an empty day, suggest the nearest sibling worked day's hours (earlier first)
  const suggestion = useMemo(() => {
    if (day.worked || day.rest || !week) return null;
    const days = week.days;
    const ok = (s) => s && s.worked && s.periods.length > 0;
    for (let j = di - 1; j >= 0; j--) if (ok(days[j])) return days[j];
    for (let j = di + 1; j < days.length; j++) if (ok(days[j])) return days[j];
    return null;
  }, [week, di, day.worked, day.rest]);

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 rh-dim" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />
      <div onClick={(e) => e.stopPropagation()} className="absolute top-0 right-0 bottom-0 flex flex-col rh-slide-r" style={{ width: 408, maxWidth: '92vw', background: WHITE, borderLeft: `1px solid ${LINE}`, boxShadow: '-12px 0 32px -8px rgba(26,26,26,0.18)' }}>
      {/* header — title + the (fixed) day, since the row was clicked directly */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ minHeight: 56, padding: '11px 20px', borderBottom: `1px solid ${LINE}` }}>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 12, fontWeight: 500, color: MUTE, marginBottom: 1 }}>
            {day.worked ? 'Modifier le jour' : 'Saisir la journée'}
          </div>
          <h2 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: '-0.3px', color: INK, margin: 0, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>
            {day.dow} {day.dateNum === 1 ? '1er' : day.dateNum} {MONTHS[day.month].toLowerCase()} {day.yearN}
          </h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md transition-colors flex-shrink-0" style={{ color: FAINT }}
          onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = FAINT; }}>
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* body */}
      <div className="px-5 py-5 overflow-y-auto rh-scroll" style={{ flex: 1 }}>
        {!day.rest && (
          <>
            {suggestion && !day.worked && (
              <div className="rounded-xl rh-fade" style={{ marginBottom: 14, padding: '11px 13px', background: ACCENT_BG, border: `1px solid #c4d5ea` }}>
                <div style={{ fontSize: 12.5, color: ACCENT_DK, lineHeight: '17px', marginBottom: 9 }}>
                  Reprendre les horaires de <strong style={{ fontWeight: 700 }}>{suggestion.dow.toLowerCase()} {suggestion.dateNum}</strong> ?
                  <span style={{ display: 'block', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{suggestion.periods.map((p) => `${p.start}–${p.end}`).join('   ·   ')}</span>
                </div>
                <Button variant="primary" size="sm" icon={Copy} label="Appliquer ces horaires" onClick={() => ops.applyDayTemplate(wi, di, suggestion.periods)} />
              </div>
            )}
            {day.worked && (
              <div className="flex items-baseline gap-2" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>Créneaux travaillés</span>
                {total > 0 && <span style={{ fontSize: 12.5, color: MUTE }}>· Total <strong style={{ fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(total)}</strong></span>}
              </div>
            )}
            <PeriodsEditor day={day} ops={ops} wi={wi} di={di} compact />
            {day.worked && (
              <div style={{ marginTop: 12 }}>
                <Button variant="outline" size="sm" icon={Copy} label="Copier sur le reste de la semaine" onClick={() => ops.dayToWeek(wi, di, start, end)}
                  title="Recopier ces horaires sur les jours encore vides de la semaine (sans écraser ceux déjà saisis)" />
              </div>
            )}
          </>
        )}

        {/* discreet « jour non travaillé » toggle — sits just under the declare-hours action */}
        <button role="switch" aria-checked={day.rest} onClick={() => ops.setDayStatus(wi, di, day.rest ? 'todo' : 'rest')}
          className="inline-flex items-center gap-2.5" style={{ marginTop: day.rest ? 0 : 16, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
          <span className="relative flex-shrink-0" style={{ width: 34, height: 20, borderRadius: 99, background: day.rest ? INK : '#d6d3d1', transition: 'background .15s' }}>
            <span className="absolute" style={{ top: 2, left: day.rest ? 16 : 2, width: 16, height: 16, borderRadius: 99, background: WHITE, transition: 'left .15s ease', boxShadow: '0 1px 2px rgba(26,26,26,0.25)' }} />
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: day.rest ? 600 : 500, color: day.rest ? INK : MUTE }}>
            <Coffee className="w-3.5 h-3.5" style={{ color: day.rest ? '#9a7b4f' : FAINT }} /> Jour non travaillé
          </span>
        </button>
        {day.rest && (
          <div style={{ marginTop: 8, fontSize: 12.5, color: FAINT, lineHeight: '17px' }}>Aucune heure ce jour — un justificatif peut être joint ci-dessous (congé, arrêt maladie…).</div>
        )}

        {/* divider between sections */}
        <div style={{ height: 1, background: LINE, margin: '22px 0' }} />

        {/* ── Section: justificatif (available whatever the day status) ── */}
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginBottom: 14 }}>Note & justificatif</div>
        <Justification day={day} ops={ops} wi={wi} di={di} />
      </div>
      {/* footer */}
      <div className="flex items-center justify-end px-5 py-3.5 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
        <button onClick={onClose} className="rounded-lg transition-colors" style={{ height: 34, padding: '0 16px', fontSize: 13, fontWeight: 600, color: WHITE, background: INK }}
          onMouseEnter={(e) => { e.currentTarget.style.background = INK2; }} onMouseLeave={(e) => { e.currentTarget.style.background = INK; }}>Terminé</button>
      </div>
      </div>
    </div>
  );
}

// Year selector — a compact dropdown. Scales better than a segmented control
// when the period spans many years (used by both the lawyer bar and client nav).
function YearDropdown({ years, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen((o) => !o)} title="Aller à une autre année" className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ height: 32, padding: '0 8px 0 12px', background: CREAM, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 500, color: INK, border: 'none', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#e4e1da'; }} onMouseLeave={(e) => { e.currentTarget.style.background = CREAM; }}>
        {value}<ChevronDown className="w-3.5 h-3.5" style={{ color: MUTE, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && (
        <div className="absolute right-0 rh-pop rounded-lg" style={{ top: 38, minWidth: 104, maxHeight: 240, overflowY: 'auto', background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0 8px 24px rgba(26,26,26,0.14)', padding: 4, zIndex: 40 }}>
          {years.map((y) => {
            const active = y === value;
            return (
              <button key={y} onClick={() => { onChange(y); setOpen(false); }} className="w-full rounded-md transition-colors flex items-center gap-2" style={{ height: 30, padding: '0 8px 0 9px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 500, color: active ? INK : MUTE, background: active ? SUBTLE : 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                {active ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT_DK }} /> : <span style={{ width: 14, flexShrink: 0 }} />}{y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// « Dupliquer ce mois » dialog — copies a source month's weekday pattern forward to
// the subsequent months, or to a custom date range. Non-destructive (empty days only).
function MonthDuplicateDialog({ srcY, srcM, periodStart, periodEnd, ops, onClose }) {
  const srcLabel = `${MONTHS[srcM]} ${srcY}`;
  const pad = (n) => String(n).padStart(2, '0');
  // target 1 — just the next month (clamped to the period)
  const ny = srcM === 11 ? srcY + 1 : srcY;
  const nm = srcM === 11 ? 0 : srcM + 1;
  const nextFirst = `${ny}-${pad(nm + 1)}-01`;
  const nextLast = `${ny}-${pad(nm + 1)}-${pad(new Date(ny, nm + 1, 0).getDate())}`;
  const nextStart = nextFirst < periodStart ? periodStart : nextFirst;
  const nextEnd = nextLast > periodEnd ? periodEnd : nextLast;
  const hasNext = nextStart <= periodEnd;
  // target 2 — every month of the source year (clamped to the period)
  const srcFirst = `${srcY}-${pad(srcM + 1)}-01`;
  const srcLast = `${srcY}-${pad(srcM + 1)}-${pad(new Date(srcY, srcM + 1, 0).getDate())}`;
  const yearStart = `${srcY}-01-01` < periodStart ? periodStart : `${srcY}-01-01`;
  const yearEnd = `${srcY}-12-31` > periodEnd ? periodEnd : `${srcY}-12-31`;
  const hasYear = yearStart < srcFirst || yearEnd > srcLast;   // the year holds months other than the source
  // target 3 — a custom range
  const [mode, setMode] = useState(hasNext ? 'next' : hasYear ? 'year' : 'custom');
  const [cStart, setCStart] = useState(nextStart);
  const [cEnd, setCEnd] = useState(periodEnd);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const customValid = cStart && cEnd && cStart <= cEnd;
  const ranges = { next: { start: nextStart, end: nextEnd }, year: { start: yearStart, end: yearEnd }, custom: { start: cStart, end: cEnd } };
  const apply = () => {
    if (mode === 'custom' && !customValid) return;
    const r = ranges[mode];
    ops.monthToRange(srcY, srcM, r.start, r.end, periodStart, periodEnd);
    onClose();
  };
  const Option = ({ id, title, sub }) => (
    <button onClick={() => setMode(id)} className="w-full flex items-start gap-2.5 rounded-xl transition-colors" style={{ textAlign: 'left', padding: '12px 14px', border: `1px solid ${mode === id ? '#c4d5ea' : LINE}`, background: mode === id ? ACCENT_BG : WHITE, cursor: 'pointer' }}>
      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, borderRadius: 99, border: `1.5px solid ${mode === id ? ACCENT_DK : '#cbd5e1'}`, marginTop: 1 }}>
        {mode === id && <span style={{ width: 9, height: 9, borderRadius: 99, background: ACCENT_DK }} />}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: INK }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: MUTE, marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  );
  const dateInput = (label, value, setValue) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: FAINT, display: 'block', marginBottom: 5 }}>{label}</label>
      <input type="date" value={value} min={periodStart} max={periodEnd} onChange={(e) => setValue(e.target.value)} className="w-full outline-none" style={{ height: 36, padding: '0 10px', fontSize: 13.5, color: INK, background: WHITE, border: `1px solid ${LINE}`, borderRadius: 8, fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }} />
    </div>
  );
  return createPortal((
    <div className="fixed inset-0 z-[300] flex items-start justify-center px-5" style={{ paddingTop: '13vh' }} onClick={onClose}>
      <div className="absolute inset-0 rh-dim" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />
      <div onClick={(e) => e.stopPropagation()} className="relative rh-pop flex flex-col rounded-2xl" style={{ width: '100%', maxWidth: 460, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.10), 0px 16px 40px -8px rgba(26,26,26,0.14)' }}>
        <div className="flex items-start gap-3 px-6 pt-6">
          <div className="flex-1 min-w-0">
            <h2 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', lineHeight: '26px', color: INK, margin: 0 }}>Dupliquer {srcLabel}</h2>
            <p style={{ fontSize: 13, color: MUTE, marginTop: 7, lineHeight: '18px' }}>Recopie le rythme de {srcLabel} (par jour de semaine) sur les jours encore vides de la cible.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md transition-colors flex-shrink-0" style={{ color: FAINT }}
            onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = FAINT; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col" style={{ gap: 10 }}>
          {hasNext && <Option id="next" title="Le mois suivant" sub={`${MONTHS[nm]} ${ny} · ${fmtDateNum(nextStart)} → ${fmtDateNum(nextEnd)}`} />}
          {hasYear && <Option id="year" title={`Tous les mois de ${srcY}`} sub={`De ${fmtDateNum(yearStart)} à ${fmtDateNum(yearEnd)}`} />}
          <Option id="custom" title="Une période personnalisée" sub="Choisissez les dates de début et de fin" />
          {mode === 'custom' && (
            <div className="flex items-start gap-3 rh-fade" style={{ paddingLeft: 30, marginTop: 2 }}>
              {dateInput('Du', cStart, setCStart)}
              <span style={{ paddingTop: 28, color: FAINT, fontSize: 13 }}>→</span>
              {dateInput('Au', cEnd, setCEnd)}
            </div>
          )}
          <div className="flex items-start gap-2 rounded-lg" style={{ marginTop: 4, padding: '9px 11px', background: SUBTLE, border: `1px solid ${LINE}` }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT, marginTop: 1 }} />
            <span style={{ fontSize: 12, lineHeight: '16px', color: MUTE }}>Seuls les jours encore vides sont remplis. Vos saisies existantes ne sont jamais écrasées.</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${LINE}` }}>
          <Button variant="outline" size="md" label="Annuler" onClick={onClose} />
          <Button variant="primary" size="md" icon={Copy} label="Dupliquer" onClick={apply} disabled={mode === 'custom' && !customValid} />
        </div>
      </div>
    </div>
  ), document.body);
}

// ════════════════════════════════════════════════════════════════════════
// APPROACH A — LE REGISTRE  (table / ledger)
// ════════════════════════════════════════════════════════════════════════
function RegistreView({ weeks, year, ops, openDay, onOpenDay, month, start, end, demoExpand }) {
  // collapsed by default — track only what the user has expanded
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [dupMonth, setDupMonth] = useState(null);   // {y, m} being duplicated forward (lawyer month-row action)
  const single = !!month;   // single-month mode (client, navigated per month): no month-row, weeks open

  // re-bucket ISO weeks into calendar months, numbering S1..n within a month
  const months = useMemo(() => {
    const order = [];
    const map = {};
    weeks.forEach((w, wi) => {
      w.days.forEach((d, di) => {
        if (d.yearN !== year) return;   // a year tab only shows months of that year
        if (month && d.month !== month.m) return;   // single-month mode → just that month
        const key = `${d.yearN}-${d.month}`;
        if (!map[key]) { map[key] = { key, y: d.yearN, m: d.month, label: `${MONTHS[d.month]} ${d.yearN}`, weeks: {}, weekOrder: [] }; order.push(key); }
        const M = map[key];
        if (!M.weeks[w.id]) { M.weeks[w.id] = { id: w.id, days: [] }; M.weekOrder.push(w.id); }
        M.weeks[w.id].days.push({ d, wi, di });
      });
    });
    return order.map((k) => map[k]);
  }, [weeks, year, month]);

  // demo — open the first month (+ its 2nd week) so the between-week dividers are visible on load
  useEffect(() => {
    if (!demoExpand || !months.length) return;
    const M0 = months[0];
    setExpandedMonths({ [M0.key]: true });
    if (M0.weekOrder.length > 1) setExpandedWeeks({ [`${M0.key}:${M0.weekOrder[1]}`]: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoExpand, months.length]);

  const yearTotal = weeks.reduce((a, w) => a + w.days.filter((d) => d.yearN === year).reduce((s, d) => s + dayMin(d), 0), 0);

  const colHead = (label, w, extra) => (
    <div style={{ width: w, flexShrink: 0, textAlign: extra?.right ? 'right' : 'left', paddingRight: extra?.right ? 16 : 0 }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: FAINT }}>{label}</span>
    </div>
  );

  // hour totals are badged as a blue info pill — mono, medium, uppercase « H »
  const HourPill = ({ min }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 6, background: '#dfe8f5', color: ACCENT_DK, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{fmtHU(min)}</span>
  );

  return (
    <div className="rh-fade">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: WHITE, boxShadow: SHADOW }}>
        {/* column header */}
        <div className="flex items-center px-4" style={{ height: 42, background: SUBTLE, borderBottom: `1px solid ${LINE}` }}>
          <div className="flex-1">{colHead('Période')}</div>
          {colHead('Total', 96, { right: true })}
        </div>

        {months.map((M, mi) => {
          const monthMin = M.weekOrder.reduce((acc, wid) => acc + M.weeks[wid].days.reduce((a, x) => a + dayMin(x.d), 0), 0);
          const collapsed = single ? false : !expandedMonths[M.key];
          return (
            <React.Fragment key={M.key}>
              {/* months are separated by a thin line; the thick cream bands sit between weeks (Figma DataTableContent) */}
              <div>
                {/* month row — hidden in single-month mode (the month nav above carries it) */}
                {!single && (
                  <div onClick={() => setExpandedMonths((p) => ({ ...p, [M.key]: !p[M.key] }))} className="group w-full flex items-center px-4 cursor-pointer transition-colors" style={{ height: 52, background: WHITE, borderTop: mi > 0 ? `1px solid ${LINE}` : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: FAINT, transform: collapsed ? 'none' : 'rotate(90deg)', transition: 'transform .15s' }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: INK, marginLeft: 6 }}>{M.label}</span>
                    <div className="ml-auto flex items-center gap-3" style={{ paddingRight: 16 }}>
                      <button onClick={(e) => { e.stopPropagation(); setDupMonth({ y: M.y, m: M.m }); }} className="hidden group-hover:inline-flex items-center gap-1.5 transition-colors flex-shrink-0" style={{ fontSize: 12, fontWeight: 500, color: MUTE }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT_DK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }} title="Dupliquer ce mois vers les mois suivants ou une période personnalisée">
                        <Copy className="w-3.5 h-3.5" /> Dupliquer le mois
                      </button>
                      <HourPill min={monthMin} />
                    </div>
                  </div>
                )}

                {!collapsed && M.weekOrder.map((wid, wOrder) => {
                  const W = M.weeks[wid];
                  const wMin = W.days.reduce((a, x) => a + dayMin(x.d), 0);
                  const wKey = `${M.key}:${wid}`;
                  // collapsible in both modes; single-month weeks default OPEN, lawyer weeks default closed
                  const wCollapsed = !(expandedWeeks[wKey] ?? single);
                  const toggleWeek = () => setExpandedWeeks((p) => ({ ...p, [wKey]: !(p[wKey] ?? single) }));
                  const srcWi = W.days[0].wi;                                  // global index of this week
                  const weekHasWorked = W.days.some((x) => x.d.worked);                   // a pattern worth copying across the month
                  const weekHasEmpty = W.days.some((x) => !x.d.worked && !x.d.rest);      // room left to copy a day into
                  return (
                    <div key={wid}>
                      {/* thick divider between weeks (single-month / client view) — Figma DataTableContent, 6px cream */}
                      {single && wOrder > 0 && <div style={{ height: 6, background: CREAM, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }} />}
                      {/* week row — click to collapse/expand */}
                      <div className="group flex items-center px-4 cursor-pointer transition-colors" style={{ height: 44, background: WHITE, borderTop: single ? 'none' : `1px solid ${LINE}` }}
                        onClick={toggleWeek}
                        onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
                        {!single && <span style={{ width: 18 }} />}
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT, transform: wCollapsed ? 'none' : 'rotate(90deg)', transition: 'transform .15s' }} />
                        <span style={{ fontSize: single ? 14 : 13, fontWeight: single ? 500 : 700, color: INK, marginLeft: 6 }}>S{wOrder + 1}</span>
                        <span style={{ fontSize: single ? 13 : 12, color: single ? MUTE : FAINT, marginLeft: 8 }}>{single ? '- ' : ''}du {W.days[0].d.dateNum} {MONTHS_ABBR[W.days[0].d.month]}</span>
                        <div className="ml-auto flex items-center gap-3" style={{ paddingRight: 16 }}>
                          {weekHasWorked && (
                            <button onClick={(e) => { e.stopPropagation(); ops.weekToMonth(srcWi, M.y, M.m, start, end); }} className="hidden group-hover:inline-flex items-center gap-1.5 transition-colors flex-shrink-0" style={{ fontSize: 12, fontWeight: 500, color: MUTE }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT_DK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }} title="Recopier ce modèle de semaine sur les jours encore vides du mois (sans écraser ceux déjà saisis)">
                              <Copy className="w-3.5 h-3.5" /> Copier sur le mois
                            </button>
                          )}
                          <HourPill min={wMin} />
                        </div>
                      </div>

                      {/* day rows — total only; créneaux live in the panel */}
                      {!wCollapsed && W.days.map(({ d, wi, di }) => {
                        const key = `${wi}:${di}`;
                        const isOpen = openDay === key;
                        const total = dayMin(d);
                        const restBg = d.rest ? PAPER : WHITE;   // marked « non travaillé » recedes into the background; empty stays white
                        return (
                          <div key={d.id} style={{ borderTop: `1px solid ${LINE}` }}>
                            <div className="group flex items-center px-4 cursor-pointer transition-colors" style={{ minHeight: 48, background: isOpen ? ACCENT_BG : restBg }}
                              onClick={() => onOpenDay(key)}
                              onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = restBg; }}>
                              <div className="flex items-center flex-1 gap-2.5" style={{ minWidth: 0 }}>
                                {!single && <span style={{ width: 40, flexShrink: 0 }} />}
                                <span style={{ width: 104, flexShrink: 0, fontSize: 14, fontWeight: 400, fontStyle: d.rest ? 'italic' : 'normal', color: d.rest ? FAINT : INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                  {d.dow} {d.dateNum}
                                </span>
                                {d.worked && (
                                  <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                                    {d.periods.some(isOvernight) && <span className="inline-flex items-center gap-1 flex-shrink-0" style={{ fontSize: 14, color: NIGHT }}><Moon className="w-3 h-3" /> nuit</span>}
                                    {d.note && <span className="truncate" style={{ fontSize: 14, color: MUTE, fontStyle: 'italic' }}>{d.note}</span>}
                                    {d.attachments.length > 0 && (
                                      <span className="inline-flex items-center gap-0.5 flex-shrink-0" style={{ fontSize: 14, color: MUTE }}><Paperclip className="w-3 h-3" />{d.attachments.length}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* end of line — duplicate / hours pill / coffee (non travaillé) / hover quick-action */}
                              <div className="flex items-center justify-end flex-shrink-0 gap-2.5" style={{ paddingRight: 16 }}>
                                {d.worked && weekHasEmpty && (
                                  <span className="hidden group-hover:inline-flex flex-shrink-0">
                                    <Button variant="outline" size="sm" icon={Copy} label="Copier sur le reste de la semaine"
                                      onClick={(e) => { e.stopPropagation(); ops.dayToWeek(wi, di, start, end); }}
                                      title="Recopier ces horaires sur les jours encore vides de la semaine (sans écraser ceux déjà saisis)" />
                                  </span>
                                )}
                                {d.worked && <HourPill min={total} />}
                                {d.rest && <Badge variant="secondary" size="md" iconOnly icon={Coffee} title="Non travaillé" />}
                                {!d.worked && !d.rest && (
                                  <button onClick={(e) => { e.stopPropagation(); ops.setDayStatus(wi, di, 'rest'); }}
                                    className="inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                                    style={{ height: 26, padding: '0 9px', fontSize: 12.5, fontWeight: 500, color: MUTE, border: `1px solid ${LINE}`, background: WHITE }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}
                                    title="Marquer comme non travaillé (sans ouvrir le panneau)">
                                    <Coffee className="w-3.5 h-3.5" /> Non travaillé
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* thick divider after each week block (lawyer view) — Figma DataTableContent, 6px cream */}
                      {!single && <div style={{ height: 6, background: CREAM, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }} />}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}

      </div>
      {/* grand total — separate « Total Subtotal » cream card, serif figure + chevron (Figma 2786:27466) */}
      {!single && (() => {
        const th = Math.floor(yearTotal / 60), tm = yearTotal % 60;
        return (
          <div className="flex items-center" style={{ marginTop: 12, padding: '15px 16px', background: CREAM, border: `1px solid ${LINE}`, borderRadius: 8, boxShadow: '0px 1px 2px rgba(26,26,26,0.05)' }}>
            <Clock className="w-5 h-5 flex-shrink-0" style={{ color: MUTE }} strokeWidth={1.5} />
            <span style={{ fontSize: 14, fontWeight: 500, color: INK, marginLeft: 8 }}>Total heures travaillées {year}</span>
            <span className="ml-auto inline-flex items-center" style={{ gap: 8 }}>
              <span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 24, fontWeight: 500, color: INK, letterSpacing: '-0.6px', lineHeight: '28px' }}>{tm ? `${th} h ${String(tm).padStart(2, '0')}` : `${th} h`}</span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: MUTE }} />
            </span>
          </div>
        );
      })()}
      {dupMonth && <MonthDuplicateDialog srcY={dupMonth.y} srcM={dupMonth.m} periodStart={start} periodEnd={end} ops={ops} onClose={() => setDupMonth(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// APPROACH C — LA LISTE GUIDÉE  (client-facing card stack)
// ════════════════════════════════════════════════════════════════════════
function ListeView({ weeks, year, ops, standalone, paged, start, end, aside, renderMonth, onEditPeriod }) {
  const [openJustif, setOpenJustif] = useState(() => new Set());
  const [monthIdx, setMonthIdx] = useState(0);
  const [expandedDays, setExpandedDays] = useState(() => new Set());   // worked days shown expanded (vs collapsed summary)
  const [dupMonth, setDupMonth] = useState(null);   // {y, m} being duplicated forward (client month action)
  const topRef = useRef(null);
  const toggleJustif = (id) => setOpenJustif((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleDay = (id) => setExpandedDays((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const yearMin = weeks.reduce((a, w) => a + weekMin(w), 0);
  const workedDays = weeks.reduce((a, w) => a + w.days.filter((d) => d.worked).length, 0);

  // one three-state day row (undecided · worked · rest), shared by all modes.
  // `first` controls the top divider (so partial month-weeks don't double it).
  const renderDay = (d, wi, di, first) => {
    const total = dayMin(d);
    const weekend = di >= 5;
    const status = d.worked ? 'worked' : (d.rest ? 'rest' : 'todo');
    const justifOpen = openJustif.has(d.id) || !!d.note || d.attachments.length > 0;
    const dayExpanded = expandedDays.has(d.id);   // worked day shown expanded (vs collapsed summary)
    return (
      <div key={d.id} style={{ borderTop: first ? 'none' : `1px solid ${LINE}`, background: status === 'rest' ? REST_BG : WHITE }}>
        {/* header line — for a worked day, click to collapse/expand the section */}
        <div className="flex items-center gap-3 px-4" style={{ minHeight: 56, cursor: status === 'worked' ? 'pointer' : 'default' }}
          onClick={status === 'worked' ? () => toggleDay(d.id) : undefined}>
          {/* identity */}
          <div className="flex flex-col flex-shrink-0" style={{ minWidth: 96 }}>
            <span style={{ fontSize: 14, color: weekend ? FAINT : MUTE, lineHeight: '18px' }}>{d.dow}{weekend ? ' · w-e' : ''}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: status === 'rest' ? INK2 : INK, fontVariantNumeric: 'tabular-nums', lineHeight: '18px' }}>{d.dateNum} {MONTHS_ABBR[d.month]}</span>
          </div>

          {/* undecided — the client picks */}
          {status === 'todo' && (
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => { ops.setDayStatus(wi, di, 'worked'); setExpandedDays((p) => new Set(p).add(d.id)); }} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ height: 32, padding: '0 12px', fontSize: 12.5, fontWeight: 600, color: ACCENT_DK, border: `1px solid #c4d5ea`, background: ACCENT_BG }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e9f7'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT_BG; }}>
                <Clock className="w-3.5 h-3.5" /> Entrer mes heures
              </button>
              <button onClick={() => ops.setDayStatus(wi, di, 'rest')} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ height: 32, padding: '0 12px', fontSize: 12.5, fontWeight: 500, color: MUTE, border: `1px solid ${LINE}`, background: WHITE }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
                <Coffee className="w-3.5 h-3.5" /> Je n'ai pas travaillé
              </button>
            </div>
          )}

          {/* declared rest — still allows a note / justificatif */}
          {status === 'rest' && (
            <div className="ml-auto flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 13, color: MUTE }}><Coffee className="w-3.5 h-3.5" /> Je n'ai pas travaillé</span>
              {!justifOpen && (
                <button onClick={() => toggleJustif(d.id)} className="inline-flex items-center gap-1.5 transition-colors" style={{ fontSize: 12.5, color: MUTE }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
                  <Paperclip className="w-3.5 h-3.5" /> Note / justificatif
                </button>
              )}
              <button onClick={() => ops.setDayStatus(wi, di, 'todo')} className="rounded-md transition-colors" style={{ height: 28, padding: '0 9px', fontSize: 12, fontWeight: 500, color: MUTE, border: `1px solid ${LINE}` }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>Modifier</button>
            </div>
          )}

          {/* worked — collapsed shows the créneaux summary + total; chevron toggles */}
          {status === 'worked' && (
            <div className="ml-auto flex items-center gap-3" style={{ minWidth: 0 }}>
              {!dayExpanded && d.periods.length > 0 && (
                <span className="truncate" style={{ fontSize: 13, color: MUTE, fontVariantNumeric: 'tabular-nums' }}>{d.periods.map((p) => `${p.start}–${p.end}`).join('   ·   ')}</span>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmtHM(total)}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: FAINT, transform: dayExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
            </div>
          )}
        </div>

        {/* worked body — typeable créneaux + justification (only when expanded) */}
        {status === 'worked' && dayExpanded && (
          <div className="pb-4 rh-fade" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
            <PeriodsEditor day={d} ops={ops} wi={wi} di={di} compact />
            {justifOpen && <div style={{ marginTop: 12 }}><Justification day={d} ops={ops} wi={wi} di={di} /></div>}
            <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 12 }}>
              {!justifOpen && (
                <button onClick={() => toggleJustif(d.id)} className="inline-flex items-center gap-1.5 transition-colors" style={{ fontSize: 12.5, color: MUTE }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
                  <Paperclip className="w-3.5 h-3.5" /> Ajouter une justification / un justificatif
                </button>
              )}
              <Button variant="outline" size="sm" icon={Copy} label="Copier sur le reste de la semaine" onClick={() => ops.dayToWeek(wi, di, start, end)}
                title="Recopier ces horaires sur les jours encore vides de la semaine (sans écraser les jours déjà saisis)" />
              <button onClick={() => ops.setDayStatus(wi, di, 'rest')} className="inline-flex items-center gap-1.5 transition-colors" style={{ fontSize: 12.5, color: MUTE }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
                <Coffee className="w-3.5 h-3.5" /> Je n'ai pas travaillé ce jour
              </button>
            </div>
          </div>
        )}

        {/* non-worked body — a note / justificatif can still be attached (congé, arrêt…) */}
        {status === 'rest' && justifOpen && (
          <div className="pb-4 rh-fade" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
            <Justification day={d} ops={ops} wi={wi} di={di} />
          </div>
        )}
      </div>
    );
  };

  const banner = !standalone && (
    <div className="flex items-center gap-2.5 rounded-xl" style={{ background: ACCENT_BG, border: `1px solid #c4d5ea`, padding: '10px 14px', marginBottom: 18 }}>
      <Eye className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT_DK }} />
      <span style={{ fontSize: 13, color: ACCENT_DK }}>
        <strong style={{ fontWeight: 600 }}>Aperçu client.</strong> L'écran partagé : chaque jour, indiquez vos horaires ou marquez « je n'ai pas travaillé ».
      </span>
    </div>
  );

  const footer = !standalone && (
    <div className="flex items-center justify-between rounded-xl" style={{ background: INK, padding: '14px 18px', marginTop: 18 }}>
      <div className="flex items-center gap-2.5">
        <Clock className="w-4 h-4" style={{ color: '#9db4d8' }} />
        <span style={{ fontSize: 13.5, color: WHITE }}><strong style={{ fontWeight: 600 }}>{workedDays} jours travaillés</strong> · total déclaré {year}</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, color: WHITE, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(yearMin)}</span>
    </div>
  );

  // ── paged: one calendar month at a time, all its weeks on the page ──
  if (paged) {
    // ISO weeks back up to Monday, so the first/last weeks may carry days
    // outside the period — clip rendering to the real bounds.
    const inB = (d) => (!start || d.iso >= start) && (!end || d.iso <= end);
    // distinct calendar months actually inside the period, ordered
    const months = [];
    const seen = new Set();
    weeks.forEach((w) => w.days.forEach((d) => {
      if (!inB(d)) return;
      const k = `${d.yearN}-${d.month}`;
      if (!seen.has(k)) { seen.add(k); months.push({ y: d.yearN, m: d.month, k }); }
    }));
    months.sort((a, b) => a.y - b.y || a.m - b.m);
    const mi = Math.max(0, Math.min(monthIdx, months.length - 1));
    const cur = months[mi] || { y: 0, m: -1 };
    const years = [...new Set(months.map((x) => x.y))];
    // weeks that touch this month, carrying only their in-month, in-period days
    const monthWeeks = weeks.map((w, wi) => ({
      wi, w,
      dd: w.days.map((d, di) => ({ d, di })).filter(({ d }) => d.yearN === cur.y && d.month === cur.m && inB(d)),
    })).filter((x) => x.dd.length > 0);
    // global period stats — the prominent total + overall fill progress
    const allDays = weeks.flatMap((w) => w.days).filter(inB);
    const totalDays = allDays.length;
    const decidedAll = allDays.filter((d) => d.worked || d.rest).length;
    const periodMin = allDays.reduce((a, d) => a + dayMin(d), 0);
    const pct = totalDays ? Math.round((decidedAll / totalDays) * 100) : 0;
    // the période — the beige chip (same as the lawyer's), sits ON TOP of the completion widget
    const periodCard = (
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginBottom: 6 }}>Période à compléter</div>
        <button onClick={onEditPeriod} disabled={!onEditPeriod} title={onEditPeriod ? 'Modifier la période' : undefined} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ maxWidth: '100%', height: 34, padding: '0 10px 0 12px', background: CREAM, fontSize: 13, border: 'none', cursor: onEditPeriod ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
          onMouseEnter={(e) => { if (onEditPeriod) e.currentTarget.style.background = '#e4e1da'; }} onMouseLeave={(e) => { e.currentTarget.style.background = CREAM; }}>
          <CalendarRange className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTE }} />
          <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(start)} → {fmtDateNum(end)}</span>
          {onEditPeriod && <Pencil className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTE, marginLeft: 2 }} />}
        </button>
      </div>
    );
    const summaryCard = (
      <div className="rounded-xl" style={{ border: `1px solid ${LINE}`, background: WHITE, padding: '14px 16px', boxShadow: SHADOW }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginBottom: 5 }}>Total saisi</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 28, fontWeight: 600, color: INK, lineHeight: '30px', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', marginBottom: 12 }}>{fmtHM(periodMin)}</div>
        <div style={{ height: 8, borderRadius: 99, background: CREAM, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: ACCENT_DK, transition: 'width 0.35s ease' }} />
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          <span style={{ fontSize: 12, color: MUTE }}>{decidedAll} / {totalDays} j renseignés</span>
        </div>
      </div>
    );
    return (
      <div className="rh-fade" style={{ maxWidth: standalone ? 'none' : 760, margin: '0 auto' }}>
        <div ref={topRef} style={{ scrollMarginTop: 16 }} />
        {banner}
        <div className="xl:hidden flex flex-col" style={{ gap: 12, marginBottom: 16 }}>{periodCard}{summaryCard}</div>
        {/* one row — month navigator centred (the période now lives on top of the
            completion widget); year tabs on the right. flex-1 on both sides keeps
            the navigator truly centred */}
        <div className="flex items-center" style={{ gap: 12, marginBottom: 18 }}>
          {/* left spacer — keeps the navigator centred opposite « Dupliquer le mois » */}
          <div className="flex-1" style={{ minWidth: 0 }} />
          {/* navigator — centre: month arrows step the months, the year dropdown jumps years */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setMonthIdx(Math.max(0, mi - 1))} disabled={mi === 0} title="Mois précédent" className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, border: `1px solid ${LINE}`, color: INK2, background: WHITE, opacity: mi === 0 ? 0.4 : 1, cursor: mi === 0 ? 'default' : 'pointer' }}><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex items-center justify-center gap-2" style={{ minWidth: 150 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: INK }}>{MONTHS[cur.m]}</span>
              {years.length > 1
                ? <YearDropdown years={years} value={cur.y} onChange={(y) => setMonthIdx(months.findIndex((x) => x.y === y))} />
                : <span style={{ fontSize: 16, fontWeight: 500, color: MUTE, fontVariantNumeric: 'tabular-nums' }}>{cur.y}</span>}
            </div>
            <button onClick={() => setMonthIdx(Math.min(months.length - 1, mi + 1))} disabled={mi === months.length - 1} title="Mois suivant" className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, border: `1px solid ${LINE}`, color: INK2, background: WHITE, opacity: mi === months.length - 1 ? 0.4 : 1, cursor: mi === months.length - 1 ? 'default' : 'pointer' }}><ChevronRight className="w-4 h-4" /></button>
          </div>
          {/* « Dupliquer le mois » — right */}
          <div className="flex-1 flex justify-end" style={{ minWidth: 0 }}>
            {months.length > 1 && (
              <button onClick={() => setDupMonth({ y: cur.y, m: cur.m })} className="inline-flex items-center gap-1.5 rounded-lg transition-colors flex-shrink-0" style={{ height: 32, padding: '0 11px', fontSize: 12.5, fontWeight: 500, color: MUTE, border: `1px solid ${LINE}`, background: WHITE }}
                onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT_DK; e.currentTarget.style.borderColor = '#c4d5ea'; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; e.currentTarget.style.borderColor = LINE; }}
                title="Dupliquer ce mois vers le mois suivant, toute l'année ou une période personnalisée">
                <Copy className="w-3.5 h-3.5" /> Dupliquer le mois
              </button>
            )}
          </div>
        </div>
        {/* the month's weeks, each its own card — intro floats in the LEFT gutter
            and the period summary in the RIGHT, both sticky, tops aligned with the
            first week card */}
        <div style={{ position: 'relative' }}>
          {/* LEFT gutter — the période (work scope) on top, then the short intro */}
          <aside className="hidden xl:block rh-fade" style={{ position: 'absolute', top: 0, bottom: 0, right: '100%', marginRight: 18, width: 214 }}>
            <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>{periodCard}{aside}</div>
          </aside>
          {/* RIGHT gutter — completion / progress */}
          <aside className="hidden xl:block rh-fade" style={{ position: 'absolute', top: 0, bottom: 0, left: '100%', marginLeft: 18, width: 214 }}>
            <div style={{ position: 'sticky', top: 0 }}>{summaryCard}</div>
          </aside>
          {renderMonth ? renderMonth(cur) : (
          <div className="flex flex-col" style={{ gap: 14 }}>
          {monthWeeks.map(({ wi, w, dd }) => {
            const wkMin = dd.reduce((a, { d }) => a + dayMin(d), 0);
            const weekHasWorked = dd.some(({ d }) => d.worked);
            return (
              <div key={w.id} className="rounded-xl overflow-hidden rh-fade" style={{ border: `1px solid ${LINE}`, background: WHITE, boxShadow: SHADOW }}>
                <div className="flex items-center px-4" style={{ height: 40, background: SUBTLE, borderBottom: `1px solid ${LINE}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>S{wi + 1}</span>
                  <span style={{ fontSize: 12, color: MUTE, marginLeft: 10 }}>du {dd[0].d.dateNum} {MONTHS_ABBR[dd[0].d.month]}</span>
                  <div className="ml-auto flex items-center gap-4">
                    {weekHasWorked && (
                      <button onClick={() => ops.weekToMonth(wi, cur.y, cur.m, start, end)} className="inline-flex items-center gap-1.5 transition-colors" style={{ fontSize: 12, fontWeight: 500, color: MUTE }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT_DK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }} title="Recopier ce modèle de semaine sur les jours encore vides du mois (sans écraser les jours déjà saisis)">
                        <Copy className="w-3.5 h-3.5" /> Copier sur le mois
                      </button>
                    )}
                    <span className="inline-flex items-baseline gap-1.5">
                      <span style={{ fontSize: 11, color: FAINT }}>Total</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: wkMin > 0 ? ACCENT_DK : FAINT, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(wkMin)}</span>
                    </span>
                  </div>
                </div>
                {dd.map(({ d, di }, k) => renderDay(d, wi, di, k === 0))}
              </div>
            );
          })}
          </div>
          )}
        </div>
        {/* no validation step — every change is saved automatically (autosave) */}
        <div className="flex items-center justify-center gap-1.5 xl:hidden" style={{ marginTop: 24, fontSize: 12, color: '#3f7d5f' }}>
          <Check className="w-3.5 h-3.5 flex-shrink-0" /> Vos saisies sont enregistrées automatiquement
        </div>
        {footer}
        {dupMonth && <MonthDuplicateDialog srcY={dupMonth.y} srcM={dupMonth.m} periodStart={start} periodEnd={end} ops={ops} onClose={() => setDupMonth(null)} />}
      </div>
    );
  }

  // ── continuous: all weeks stacked (used when not paged) ──
  return (
    <div className="rh-fade" style={{ maxWidth: standalone ? 'none' : 760, margin: '0 auto' }}>
      {banner}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: WHITE }}>
        {weeks.map((w, wi) => {
          const wMin = weekMin(w);
          const wWorked = w.days.filter((d) => d.worked).length;
          return (
            <div key={w.id}>
              {/* week header band */}
              <div className="flex items-center px-4" style={{ height: 42, background: SUBTLE, borderTop: wi > 0 ? `1px solid ${LINE}` : 'none', borderBottom: `1px solid ${LINE}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>S{wi + 1}</span>
                <span style={{ fontSize: 12, color: FAINT, marginLeft: 10 }}>{w.label}</span>
                {wMin > 0 && <span style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT_DK, marginLeft: 12, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(wMin)} · {wWorked} j</span>}
              </div>
              {w.days.map((d, di) => renderDay(d, wi, di, di === 0))}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}

// ── the matter this relevé belongs to (droit social / prud'hommes) ────────
const MATTER = {
  client: 'Camille Aubert',
  civilite: 'Mme',                       // formal address for client-facing greetings (M. / Mme)
  nom: 'Aubert',                         // family name — client is greeted « Bonjour Mme Aubert »
  initials: 'CA',
  role: 'Salariée',
  adverse: 'SAS Delprat Logistique',
  juridiction: 'Conseil de prud\'hommes de Nanterre',
  objet: 'Rappel d\'heures supplémentaires & travail dissimulé',
  cabinet: 'Cabinet Mara & Associés',
  avocat: 'Me Inès Mara',
};

const LEGAL_MONTH_MIN = Math.round((151 + 2 / 3) * 60);   // 151 h 40 mensualisées (35h/sem)

// the client-app intro note (shown above « Total saisi », or inline)
const CLIENT_INTRO = "Pour chaque jour, indiquez vos horaires ou marquez-le « non travaillé ». Joignez un justificatif si besoin.";

// Plato wordmark (same glyph as the app's PlatoIcon)
function PlatoMark({ size = 16, color = INK }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M73.5996 0C75.8398 0 76.9608 -0.000427067 77.8164 0.435547C78.5689 0.819016 79.181 1.43109 79.5645 2.18359C80.0004 3.03924 80 4.16018 80 6.40039V73.5996C80 75.8398 80.0004 76.9608 79.5645 77.8164C79.181 78.5689 78.5689 79.181 77.8164 79.5645C76.9608 80.0004 75.8398 80 73.5996 80H55L53 70H57V62H23V70H27L25 80H6.40039C4.16018 80 3.03924 80.0004 2.18359 79.5645C1.43109 79.181 0.819016 78.5689 0.435547 77.8164C-0.000427067 76.9608 0 75.8398 0 73.5996V6.40039C0 4.16018 -0.000427067 3.03924 0.435547 2.18359C0.819016 1.43109 1.43109 0.819016 2.18359 0.435547C3.03924 -0.000427067 4.16018 0 6.40039 0H73.5996ZM28.916 39.083L21 32L15 36L26 56H54L65 36L59 32L51.083 39.083L40 28L28.916 39.083ZM33 17L40 24L47 17L40 10L33 17Z" fill={color} />
    </svg>
  );
}

// minimal **bold** renderer for the canned chat copy
function renderBold(text) {
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 600, color: INK }}>{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>);
}

// ── PLATO MASTER chat panel — mimics the app's renderChatSidebar ──────────
function ChatPanel({ ctx, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  const SUGGESTIONS = [
    { icon: Calculator, label: 'Chiffrer le rappel de salaire', reply: `Sur la base de ${fmtHM(ctx.overtimeMin)} d'heures supplémentaires (majorées 25 % puis 50 % au-delà de 8 h/semaine) et d'un taux horaire de 16,40 €, le rappel pour janvier ressort à ≈ 1 740 €. Je peux étendre le calcul aux 12 mois et y ajouter l'indemnité de travail dissimulé (6 mois de salaire).` },
    { icon: Search, label: 'Lister les jours sans justificatif', reply: `${ctx.missingProof} journées travaillées n'ont aucune pièce rattachée. Ce sont surtout des journées « standard » 9 h–18 h : un e-mail d'arrivée/départ ou un badge d'accès suffirait à les étayer. Je vous prépare la liste avec, pour chacune, la preuve la plus simple à réunir.` },
    { icon: Moon, label: 'Isoler les heures de nuit', reply: `J'ai identifié ${fmtHM(ctx.nightMin)} de travail de nuit (créneaux franchissant minuit, ex. l'astreinte du 9 janvier 22 h→04 h). Elles ouvrent droit à la majoration conventionnelle de nuit, distincte des heures supplémentaires — à chiffrer séparément.` },
  ];

  const replyFor = (text) => {
    const hit = SUGGESTIONS.find((s) => s.label === text);
    if (hit) return hit.reply;
    return "Bien noté. Je reprends le relevé et je prépare le décompte correspondant — je reviendrai avec le détail journée par journée et les pièces à l'appui.";
  };

  const send = (text) => {
    const t = (text || '').trim();
    if (!t) return;
    setMsgs((prev) => [...prev, { role: 'user', text: t }, { role: 'ai', thinking: 'Lecture du relevé · janvier 2025', text: replyFor(t) }]);
    setInput('');
  };

  return (
    <div className="flex-shrink-0 flex flex-col h-full" style={{ width: 384, background: PAPER, borderLeft: `1px solid ${LINE}` }}>
      {/* header */}
      <div className="px-3 flex items-center gap-2 flex-shrink-0" style={{ height: 48, borderBottom: `1px solid ${LINE}` }}>
        <button onClick={onClose} className="p-1.5 rounded-md transition-colors flex-shrink-0" title="Masquer le chat"
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0efec'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
          <PanelRightClose className="w-4 h-4" style={{ color: MUTE }} strokeWidth={1.75} />
        </button>
        <PlatoMark size={16} />
        <span className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 12, color: MUTE, letterSpacing: '0.02em' }}>PLATO MASTER</span>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto rh-scroll" style={{ padding: 20 }}>
        {/* standing analysis (always reflects the live relevé) */}
        <div className="flex flex-col gap-2.5 items-start" style={{ paddingRight: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: MUTE, margin: 0 }}>Analyse du relevé · janvier 2025{'  >'}</p>
          <div style={{ fontSize: 14, lineHeight: '20px', color: INK }}>
            {renderBold(`J'ai repris vos pointages de **janvier 2025**. Je compte **${fmtHM(ctx.totalMin)}** travaillées pour une durée légale de **151 h 40**, soit **${fmtHM(ctx.overtimeMin)} d'heures supplémentaires**. **${ctx.daysOver9} journées** dépassent 9 h, et **${fmtHM(ctx.nightMin)}** relèvent du travail de nuit. Il manque une pièce justificative sur **${ctx.missingProof} jours**.`)}
          </div>
          <div className="flex items-center gap-2.5" style={{ marginTop: 2 }}>
            <ThumbsUp className="w-3.5 h-3.5" style={{ color: FAINT }} />
            <ThumbsDown className="w-3.5 h-3.5" style={{ color: FAINT }} />
            <Copy className="w-3.5 h-3.5" style={{ color: FAINT }} />
          </div>
        </div>

        {/* suggested next steps (until the user takes over) */}
        {msgs.length === 0 && (
          <div className="flex flex-col gap-2" style={{ marginTop: 18 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pour continuer</span>
            {SUGGESTIONS.map((s) => (
              <PromptSuggestionCard key={s.label} icon={s.icon} label={s.label} onClick={() => send(s.label)} />
            ))}
          </div>
        )}

        {/* live conversation */}
        {msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="flex justify-end rh-fade" style={{ marginTop: 16 }}>
            <div style={{ maxWidth: '84%', background: CREAM, borderRadius: 12, padding: '8px 12px', fontSize: 14, lineHeight: '20px', color: INK2 }}>{m.text}</div>
          </div>
        ) : (
          <div key={i} className="flex flex-col gap-2.5 items-start rh-fade" style={{ marginTop: 16, paddingRight: 12 }}>
            {m.thinking && <p style={{ fontSize: 12, fontWeight: 500, color: MUTE, margin: 0 }}>{m.thinking}{'  >'}</p>}
            <div style={{ fontSize: 14, lineHeight: '20px', color: INK }}>{renderBold(m.text)}</div>
            <div className="flex items-center gap-2.5" style={{ marginTop: 2 }}>
              <ThumbsUp className="w-3.5 h-3.5" style={{ color: FAINT }} />
              <ThumbsDown className="w-3.5 h-3.5" style={{ color: FAINT }} />
              <Copy className="w-3.5 h-3.5" style={{ color: FAINT }} />
            </div>
          </div>
        ))}
      </div>

      {/* composer */}
      <div className="flex-shrink-0" style={{ padding: 12 }}>
        <div className="rounded-xl" style={{ border: `1px solid ${focused ? INK : LINE}`, background: WHITE, transition: 'border-color .15s', boxShadow: '0 1px 2px rgba(26,26,26,0.04)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            rows={2}
            placeholder="Demander à Plato : chiffrer le rappel, vérifier les justificatifs, rédiger la requête…"
            className="w-full resize-none focus:outline-none rh-scroll"
            style={{ padding: '10px 12px 2px', fontSize: 14, lineHeight: '20px', color: INK, background: 'transparent', maxHeight: 120 }}
          />
          <div className="flex items-center" style={{ padding: '4px 8px 8px' }}>
            <button className="p-1.5 rounded-md transition-colors" title="Joindre une pièce"
              onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <Paperclip className="w-4 h-4" style={{ color: MUTE }} />
            </button>
            <button onClick={() => send(input)} disabled={!input.trim()} className="ml-auto flex items-center justify-center rounded-full transition-all"
              style={{ width: 30, height: 30, background: input.trim() ? INK : '#e7e5e3', cursor: input.trim() ? 'pointer' : 'default' }}>
              <ArrowUp className="w-4 h-4" style={{ color: input.trim() ? WHITE : FAINT }} strokeWidth={2.25} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: 11, color: FAINT, textAlign: 'center', marginTop: 8 }}>Plato peut se tromper — vérifiez les chiffres clés.</p>
      </div>
    </div>
  );
}

// ── Standalone client interface ───────────────────────────────────────────
// The screen the client opens from the shared link, fully independent of the
// lawyer's matter shell (no tabs, no Plato chat). Security is the unique 30-day
// link; the period (read-only) is confirmed before the guided fill-in.
// Decorative « registration-mark » backdrop for the client access screens (Figma 2837:27437):
// a faded centered frame with diamond corner-markers + soft corner glows on cream, plus the
// « Interface par Plato » footer. Sits behind the centered access card (pointer-events: none).
function ClientAccessBackdrop() {
  const LC = '#e7e5e1', L0 = 'rgba(231,229,225,0)';          // frame line + its transparent fade
  const FW = 512, FH = 506;                                   // centered frame rectangle
  const hLine = `linear-gradient(to right, ${L0} 0%, ${LC} 20%, ${LC} 80%, ${L0} 100%)`;
  const vLine = `linear-gradient(to bottom, ${L0} 0%, ${LC} 20%, ${LC} 80%, ${L0} 100%)`;
  const glow = 'rgba(120,113,108,0.08)', g0 = 'rgba(120,113,108,0)';
  const diamond = { position: 'absolute', width: 9, height: 9, background: INK, transform: 'translate(-50%,-50%) rotate(45deg)' };
  const corner = (at) => ({ position: 'absolute', width: '46%', height: '42%', background: `radial-gradient(120% 120% at ${at}, ${glow}, ${g0} 62%)` });
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ zIndex: 0, pointerEvents: 'none' }}>
      {/* soft corner glows */}
      <div style={{ ...corner('0% 0%'), top: 0, left: 0 }} />
      <div style={{ ...corner('100% 0%'), top: 0, right: 0 }} />
      <div style={{ ...corner('0% 100%'), bottom: 45, left: 0 }} />
      <div style={{ ...corner('100% 100%'), bottom: 45, right: 0 }} />
      {/* centered registration frame — faded lines crossing at diamond corner-markers */}
      <div style={{ position: 'absolute', left: '50%', top: 'calc(50% - 22px)', width: FW, height: FH, transform: 'translate(-50%,-50%)' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '168%', height: 2, background: hLine }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '168%', height: 2, background: hLine }} />
        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: '168%', background: vLine }} />
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: '168%', background: vLine }} />
        <div style={{ ...diamond, left: 0, top: 0 }} />
        <div style={{ ...diamond, left: FW, top: 0 }} />
        <div style={{ ...diamond, left: 0, top: FH }} />
        <div style={{ ...diamond, left: FW, top: FH }} />
      </div>
      {/* footer — « Vos données sont protégées · Interface par Plato » */}
      <div className="flex items-center justify-center" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 45, gap: 8, borderTop: `1px solid ${LINE}`, fontSize: 12, color: MUTE }}>
        <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT }} />
        <span>Vos données sont protégées et confidentielles</span>
        <span style={{ color: '#d6d3d1' }}>·</span>
        <span style={{ color: FAINT }}>Interface par</span>
        <span className="inline-flex items-center gap-1"><PlatoMark size={12} color={INK} /><span style={{ fontWeight: 600, color: INK2 }}>Plato</span></span>
      </div>
    </div>
  );
}

function ClientReleveApp({ onExit, period, linkError, view = 'table' }) {
  const [unlocked, setUnlocked] = useState(false);   // password gate — the shared link requires the access code
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [started, setStarted] = useState(false);
  const [everStarted, setEverStarted] = useState(false);   // once true, the entry screen becomes a « resume » screen
  // demo capture hook — `?demo` skips the gate/entry and shows the guided liste directly (pixel-perfect Figma capture)
  useEffect(() => {
    try { if (new URLSearchParams(window.location.search).get('demo')) { setUnlocked(true); setStarted(true); setEverStarted(true); } } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // the client may adjust the period proposed by the lawyer before confirming
  const [cp, setCp] = useState(() => period || { start: '', end: '' });
  const cpv = validatePeriod(cp.start, cp.end);
  // self-contained, always-empty dataset built from the period — a flat list of
  // ISO weeks (the table re-buckets into months; the flow view pages by month).
  const [data, setData] = useState(() => (period ? { list: buildPeriodWeeks(period.start, period.end) } : { list: [] }));
  const [builtFor, setBuiltFor] = useState(() => (period ? `${period.start}|${period.end}` : ''));
  const weeks = data.list;
  const ops = useMemo(() => makeOps(setData, 'list'), []);
  // table view: the day drawer opens on row click (year + month nav live in ListeView)
  const [openDay, setOpenDay] = useState(null);
  const [pmodal, setPmodal] = useState(false);   // « modifier la période » modal over the table
  const openDayObj = openDay ? (() => { const [wi, di] = openDay.split(':').map(Number); return weeks[wi] && weeks[wi].days[di] ? { d: weeks[wi].days[di], wi, di } : null; })() : null;
  // overall fill progress — shown on the resume screen (period read-only + completion)
  const stats = useMemo(() => {
    const d = weeks.flatMap((w) => w.days).filter((x) => x.iso >= cp.start && x.iso <= cp.end);
    const totalDays = d.length;
    const decided = d.filter((x) => x.worked || x.rest).length;
    const min = d.reduce((a, x) => a + dayMin(x), 0);
    return { totalDays, decided, min, pct: totalDays ? Math.round((decided / totalDays) * 100) : 0 };
  }, [weeks, cp.start, cp.end]);

  const beginEntry = () => {
    if (!cpv.valid) return;
    const key = `${cp.start}|${cp.end}`;
    if (key !== builtFor) {            // period changed → rebuild (else keep entries)
      setData({ list: buildPeriodWeeks(cp.start, cp.end) });
      setBuiltFor(key);
    }
    setStarted(true); setEverStarted(true);
  };
  // modify the period from within the fill-in (modal over the table)
  const modifyPeriod = (start, end) => {
    const key = `${start}|${end}`;
    if (key !== builtFor) { setData({ list: buildPeriodWeeks(start, end) }); setBuiltFor(key); }
    setCp({ start, end });
    setPmodal(false);
  };

  const exitBtn = (
    <button onClick={onExit} className="absolute inline-flex items-center gap-1.5 rounded-md transition-colors" title="Aperçu — retour à l'espace avocat"
      style={{ top: 16, right: 16, height: 30, padding: '0 10px', fontSize: 12.5, color: MUTE, border: `1px solid ${LINE}`, background: WHITE }}
      onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
      <X className="w-3.5 h-3.5" /> Quitter l'aperçu
    </button>
  );

  // ── error screen: expired / invalid link ──
  if (linkError === 'expired' || linkError === 'invalid' || !period) {
    const expired = linkError === 'expired';
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
        {exitBtn}
        <ClientAccessBackdrop />
        <div className="rh-pop rounded-2xl flex flex-col items-center text-center" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 392, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.08), 0px 16px 40px -8px rgba(26,26,26,0.12)', padding: '36px 28px' }}>
          <span className="inline-flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: '#fbe7e4', marginBottom: 18 }}><AlertTriangle className="w-6 h-6" style={{ color: '#b4453a' }} /></span>
          <h1 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 23, fontWeight: 500, letterSpacing: '-0.4px', color: INK, margin: 0 }}>{expired ? 'Lien expiré' : 'Lien invalide'}</h1>
          <p style={{ fontSize: 13.5, lineHeight: '19px', color: MUTE, marginTop: 8, maxWidth: 300 }}>
            {expired ? 'Ce lien a expiré. Contactez votre avocat pour en obtenir un nouveau.' : 'Ce lien est invalide ou incomplet. Contactez votre avocat.'}
          </p>
          <div className="flex items-center gap-2" style={{ marginTop: 22, fontSize: 12, color: FAINT }}>
            <span className="inline-flex items-center justify-center rounded-lg" style={{ width: 22, height: 22, background: INK }}><PlatoMark size={11} color={WHITE} /></span>
            {MATTER.cabinet} · {MATTER.avocat}
          </div>
        </div>
      </div>
    );
  }

  // ── password gate — the shared link is protected by the access code the lawyer sent ──
  if (!unlocked) {
    const submitPw = () => { if (pwInput.trim().toUpperCase() === SHARE_PWD) { setUnlocked(true); setPwError(false); } else setPwError(true); };
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
        {exitBtn}
        <ClientAccessBackdrop />
        <div className="rh-pop rounded-2xl" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 388, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.08), 0px 16px 40px -8px rgba(26,26,26,0.12)', padding: '32px 28px' }}>
          <div className="flex items-center gap-2.5" style={{ marginBottom: 20 }}>
            <span className="inline-flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: INK }}><PlatoMark size={18} color={WHITE} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: '16px' }}>{MATTER.cabinet}</div>
              <div style={{ fontSize: 12, color: MUTE }}>{MATTER.avocat}</div>
            </div>
          </div>
          <span className="inline-flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: ACCENT_BG, marginBottom: 16 }}><Lock className="w-5 h-5" style={{ color: ACCENT_DK }} /></span>
          <h1 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 23, fontWeight: 500, letterSpacing: '-0.5px', lineHeight: '28px', color: INK, marginBottom: 7 }}>Relevé d'heures protégé</h1>
          <p style={{ fontSize: 13.5, lineHeight: '19px', color: INK2, marginBottom: 18 }}>Saisissez le mot de passe que {MATTER.avocat} vous a communiqué avec ce lien.</p>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: pwError ? '#991b1b' : FAINT, display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <input type="text" autoFocus value={pwInput} aria-label="Mot de passe"
            onChange={(e) => { setPwInput(e.target.value); if (pwError) setPwError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submitPw(); }}
            placeholder="XXX-XXX"
            className="w-full outline-none transition-colors"
            style={{ height: 42, padding: '0 12px', fontSize: 15, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em', color: INK, background: WHITE, border: `1px solid ${pwError ? '#b4453a' : LINE}`, borderRadius: 9, textTransform: 'uppercase' }}
            onFocus={(e) => { if (!pwError) e.currentTarget.style.borderColor = INK; }} onBlur={(e) => { e.currentTarget.style.borderColor = pwError ? '#b4453a' : LINE; }} />
          {pwError && <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6 }}>Mot de passe incorrect.</div>}
          <div style={{ marginTop: 18 }}>
            <Button variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="trailing" label="Accéder" onClick={submitPw} disabled={!pwInput.trim()} />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, color: FAINT }}><ShieldCheck className="w-3 h-3" /> Lien sécurisé · 30 jours</span>
            <span style={{ fontSize: 11, color: FAINT }}>Aperçu : <strong style={{ fontWeight: 600, color: MUTE, fontFamily: "'IBM Plex Mono', monospace" }}>{SHARE_PWD}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // ── entry screen — fresh: confirm / adjust the period; resuming (after « Terminer
  //    plus tard »): period read-only + completion + « Reprendre » (same card) ──
  if (!started) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
        {exitBtn}
        <ClientAccessBackdrop />
        <div className="rh-pop rounded-2xl" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 412, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.08), 0px 16px 40px -8px rgba(26,26,26,0.12)', padding: '32px 28px' }}>
          <div className="flex items-center gap-2.5" style={{ marginBottom: 22 }}>
            <span className="inline-flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: INK }}><PlatoMark size={18} color={WHITE} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: '16px' }}>{MATTER.cabinet}</div>
              <div style={{ fontSize: 12, color: MUTE }}>{MATTER.avocat}</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 24, fontWeight: 500, letterSpacing: '-0.5px', lineHeight: '29px', color: INK, marginBottom: 8 }}>
            Votre relevé d'heures
          </h1>
          <p style={{ fontSize: 13.5, lineHeight: '19px', color: INK2, marginBottom: 20 }}>
            {everStarted
              ? "Reprenez votre relevé là où vous l'avez laissé. Vos saisies ont été enregistrées automatiquement."
              : `${MATTER.avocat} vous a partagé un relevé d'heures à compléter dans le cadre de votre dossier devant le ${MATTER.juridiction}. Vérifiez la période ci-dessous et ajustez-la si besoin.`}
          </p>
          {everStarted ? (
            /* resume — period read-only + completion */
            <div className="rounded-xl" style={{ background: SUBTLE, border: `1px solid ${LINE}`, padding: '14px 16px' }}>
              <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: INK }}>
                <CalendarRange className="w-4 h-4 flex-shrink-0" style={{ color: MUTE }} />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(cp.start)} → {fmtDateNum(cp.end)}</span>
                <span style={{ fontWeight: 500, color: MUTE }}>· {cpv.days} j</span>
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: FAINT }}>Avancement</span>
                  <span style={{ fontSize: 12.5, color: MUTE }}>{fmtHM(stats.min)} saisies</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: CREAM, overflow: 'hidden' }}>
                  <div style={{ width: `${stats.pct}%`, height: '100%', borderRadius: 99, background: ACCENT_DK, transition: 'width .35s ease' }} />
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 7 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{stats.pct}%</span>
                  <span style={{ fontSize: 12, color: MUTE }}>{stats.decided} / {stats.totalDays} j renseignés</span>
                </div>
              </div>
            </div>
          ) : (
            /* fresh — confirm / adjust the period */
            <div className="rounded-xl" style={{ background: SUBTLE, border: `1px solid ${LINE}`, padding: '14px 16px' }}>
              <div className="flex items-start gap-3">
                {[['Du', 'start', todayISO()], ['Au', 'end', undefined]].map(([label, key, max]) => {
                  const err = key === 'start' ? cpv.startError : cpv.endError;
                  return (
                    <div key={key} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: err ? '#991b1b' : FAINT, marginBottom: 5 }}>{label}</div>
                      <input type="date" value={cp[key]} max={max} aria-label={label}
                        onChange={(e) => setCp((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full outline-none transition-colors"
                        style={{ height: 36, padding: '0 10px', fontSize: 13.5, fontWeight: 600, color: INK, background: WHITE, border: `1px solid ${err ? '#b4453a' : LINE}`, borderRadius: 8, fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}
                        onFocus={(e) => { if (!err) e.currentTarget.style.borderColor = INK; }} onBlur={(e) => { e.currentTarget.style.borderColor = err ? '#b4453a' : LINE; }} />
                      {err && <div style={{ fontSize: 11.5, color: '#991b1b', marginTop: 4 }}>{err}</div>}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}`, fontSize: 12.5, color: MUTE }}>
                <CalendarRange className="w-3.5 h-3.5" style={{ color: FAINT }} /> Durée · <strong style={{ fontWeight: 700, color: cpv.valid ? ACCENT_DK : FAINT }}>{cpv.valid ? `${cpv.days} jours` : '—'}</strong>
              </div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            {everStarted
              ? <Button variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="trailing" label="Reprendre ma saisie" onClick={() => setStarted(true)} />
              : <Button variant="primary" size="lg" fullWidth icon={ArrowRight} iconPosition="trailing" label="Commencer la saisie" onClick={beginEntry} disabled={!cpv.valid} />}
          </div>
        </div>
      </div>
    );
  }

  // ── unlocked: the guided fill-in (no submit step — every change autosaves) ──
  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      {/* client header — no tabs, no chat */}
      <header className="flex items-center px-5 flex-shrink-0" style={{ height: 60, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
        <span className="inline-flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: INK }}><PlatoMark size={16} color={WHITE} /></span>
        <div className="flex flex-col" style={{ marginLeft: 11, minWidth: 0 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: INK, lineHeight: '16px' }}>Votre relevé d'heures</span>
          <span className="truncate" style={{ fontSize: 11.5, color: MUTE, lineHeight: '14px' }}>{MATTER.cabinet} · {MATTER.avocat} — dossier {MATTER.juridiction}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full" style={{ height: 24, padding: '0 10px', background: '#e3f0e8', color: '#3f7d5f', fontSize: 11.5, fontWeight: 600 }}>
            <Check className="w-3.5 h-3.5" /> Enregistré automatiquement
          </span>
          <Button variant="outline" size="md" icon={Clock} label="Terminer plus tard" onClick={() => { setStarted(false); setUnlocked(false); setPwInput(''); setPwError(false); }} title="Vos saisies sont enregistrées — le mot de passe sera redemandé à la reprise" />
        </div>
      </header>

      {/* fill-in — same chrome (month nav, year jump, flanking intro + fill-progress
          modules) for both: TABLE view opens days in the drawer; FLOW view edits
          créneaux inline in the cards. */}
      <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 24px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="xl:hidden rounded-xl rh-fade" style={{ background: ACCENT_BG, border: `1px solid #c4d5ea`, padding: '14px 16px', marginBottom: 18, boxShadow: SHADOW }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: ACCENT_DK, marginBottom: 3 }}>Bonjour {MATTER.civilite} {MATTER.nom},</div>
            <div style={{ fontSize: 13, lineHeight: '19px', color: ACCENT_DK }}>{CLIENT_INTRO}</div>
          </div>
          <ListeView key={builtFor} weeks={weeks} ops={ops} standalone paged start={cp.start} end={cp.end}
            onEditPeriod={() => setPmodal(true)}
            renderMonth={view === 'table' ? ((cur) => (
              <RegistreView weeks={weeks} year={cur.y} month={cur} ops={ops} openDay={openDay} onOpenDay={setOpenDay} start={cp.start} end={cp.end} />
            )) : undefined}
            aside={(
              <div className="rounded-xl" style={{ background: ACCENT_BG, border: `1px solid #c4d5ea`, padding: '13px 15px', boxShadow: SHADOW }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: ACCENT_DK, marginBottom: 4 }}>Bonjour {MATTER.civilite} {MATTER.nom},</div>
                <div style={{ fontSize: 12, lineHeight: '17px', color: ACCENT_DK }}>{CLIENT_INTRO}</div>
              </div>
            )} />
        </div>
      </div>
      {/* bottom banner — neutral confidentiality reassurance + Plato attribution */}
      <div className="relative flex items-center justify-center gap-2 flex-shrink-0" style={{ minHeight: 38, padding: '8px 20px', background: SUBTLE, borderTop: `1px solid ${LINE}` }}>
        <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FAINT }} />
        <span style={{ fontSize: 12, color: MUTE, textAlign: 'center', lineHeight: '16px' }}>Vos données sont protégées et confidentielles — partagées uniquement avec {MATTER.avocat}.</span>
        <span className="hidden md:inline-flex items-center gap-1.5 absolute" style={{ right: 20, fontSize: 11, color: FAINT }}>
          Interface par <PlatoMark size={12} color="#a8a29e" /> <span style={{ fontWeight: 600, color: MUTE }}>Plato</span>
        </span>
      </div>
      {view === 'table' && openDayObj && (
        <DayDrawer day={openDayObj.d} wi={openDayObj.wi} di={openDayObj.di} week={weeks[openDayObj.wi]} ops={ops} onClose={() => setOpenDay(null)} start={cp.start} end={cp.end} />
      )}
      {pmodal && (
        <PeriodModal mode="log" modify hasEntries={weeks.some((w) => w.days.some((d) => d.worked))}
          defaultStart={cp.start} defaultEnd={cp.end}
          onClose={() => setPmodal(false)} onSubmit={({ start, end }) => modifyPeriod(start, end)} />
      )}
    </div>
  );
}

// Other matter tabs aren't the focus of this prototype — a calm placeholder
// keeps the shell believable without faking whole features.
function TabPlaceholder({ icon: Icon, title, blurb, onGoSuivi }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center rh-fade" style={{ padding: 40 }}>
      <span className="inline-flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: CREAM, marginBottom: 16 }}>
        <Icon className="w-6 h-6" style={{ color: MUTE }} />
      </span>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: INK, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: MUTE, textAlign: 'center', maxWidth: 380, lineHeight: '19px' }}>{blurb}</p>
      <button onClick={onGoSuivi} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ marginTop: 18, height: 34, padding: '0 14px', fontSize: 13, fontWeight: 600, color: WHITE, background: INK }}
        onMouseEnter={(e) => { e.currentTarget.style.background = INK2; }} onMouseLeave={(e) => { e.currentTarget.style.background = INK; }}>
        <Clock className="w-4 h-4" /> Aller au suivi des heures
      </button>
    </div>
  );
}

// ── Entry flow: define the reference period (start + end), validated ──────
// Shared by Path A (lawyer logs) and Path B (delegate to client).
function PeriodModal({ mode, defaultStart, defaultEnd, onClose, onSubmit, modify, hasEntries, suggested }) {
  const [start, setStart] = useState(defaultStart || '');
  const [end, setEnd] = useState(defaultEnd || '');
  const [touched, setTouched] = useState(false);
  const v = validatePeriod(start, end);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isDelegate = mode === 'delegate';
  const submit = () => { setTouched(true); if (v.valid) onSubmit({ start, end }); };

  const field = (label, value, setValue, error, max) => {
    const showErr = touched && !!error;
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: showErr ? '#991b1b' : INK, display: 'block', marginBottom: 6 }}>{label}</label>
        <input type="date" value={value} max={max} aria-label={label}
          onChange={(e) => setValue(e.target.value)}
          className="w-full outline-none transition-colors"
          style={{ height: 38, padding: '0 10px', fontSize: 14, color: INK, background: WHITE, border: `1px solid ${showErr ? '#b4453a' : LINE}`, borderRadius: 8, fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}
          onFocus={(e) => { if (!showErr) e.currentTarget.style.borderColor = INK; }} onBlur={(e) => { e.currentTarget.style.borderColor = showErr ? '#b4453a' : LINE; }} />
        {showErr && <div style={{ fontSize: 12, color: '#991b1b', marginTop: 5 }}>{error}</div>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-5" style={{ paddingTop: '13vh' }} onClick={onClose}>
      <div className="absolute inset-0 rh-dim" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />
      <div onClick={(e) => e.stopPropagation()} className="relative rh-pop flex flex-col rounded-2xl" style={{ width: '100%', maxWidth: 470, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.10), 0px 16px 40px -8px rgba(26,26,26,0.14)' }}>
        <div className="flex items-start gap-3 px-6 pt-6">
          <div className="flex-1 min-w-0">
            <h2 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 23, fontWeight: 500, letterSpacing: '-0.4px', lineHeight: '27px', color: INK, margin: 0 }}>{modify ? 'Modifier la période' : 'Définir la période'}</h2>
            <p style={{ fontSize: 13, color: MUTE, marginTop: 7, lineHeight: '18px' }}>
              {isDelegate ? 'La période encadre la saisie du client.' : 'Le relevé sera limité à cette période.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md transition-colors flex-shrink-0" style={{ color: FAINT }}
            onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = FAINT; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">
          {suggested && !modify && (() => {
            const applied = start === suggested.start && end === suggested.end;
            return (
              <button type="button" onClick={() => { if (!applied) { setStart(suggested.start); setEnd(suggested.end); } }} disabled={applied}
                className="w-full flex items-center gap-2.5 rounded-lg transition-colors text-left"
                style={{ marginBottom: 16, padding: '10px 12px', background: INTRANT_BG, border: `1px solid ${INTRANT_BORDER}`, cursor: applied ? 'default' : 'pointer' }}>
                <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: INTRANT }} strokeWidth={1.75} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: INTRANT, lineHeight: '16px', fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(suggested.start)} → {fmtDateNum(suggested.end)}</div>
                  <div style={{ fontSize: 11.5, color: '#3a5488', lineHeight: '15px', marginTop: 1 }}>Période repérée par l'agent d'après {suggested.source}</div>
                </div>
                {applied
                  ? <span className="inline-flex items-center gap-1 flex-shrink-0" style={{ fontSize: 12, fontWeight: 600, color: INTRANT }}><Check className="w-3.5 h-3.5" /> Appliquée</span>
                  : <span style={{ fontSize: 12, fontWeight: 600, color: INTRANT, flexShrink: 0 }}>Utiliser</span>}
              </button>
            );
          })()}
          <div className="flex items-start gap-3">
            {field('Date de début', start, setStart, v.startError, todayISO())}
            <span style={{ paddingTop: 32, color: FAINT, fontSize: 14, flexShrink: 0 }}>→</span>
            {field('Date de fin', end, setEnd, v.endError)}
          </div>
          <div style={{ marginTop: 14, fontSize: 12.5, color: v.valid ? MUTE : FAINT }}>
            {v.valid ? <>Durée : <strong style={{ fontWeight: 700, color: ACCENT_DK }}>{v.days} jours</strong></> : 'Renseignez les deux dates pour continuer.'}
          </div>
          {hasEntries && (
            <div className="flex items-start gap-2 rounded-lg" style={{ marginTop: 14, padding: '10px 12px', background: '#fbf3e0', border: '1px solid #e8d8a6' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#8a6d1f', marginTop: 1 }} />
              <div style={{ fontSize: 12.5, lineHeight: '17px', color: '#6f5a1f' }}>Des heures sont déjà saisies sur ce relevé. Modifier les dates réinitialisera les saisies en dehors de la nouvelle période.</div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${LINE}` }}>
          <Button variant="outline" size="md" label="Annuler" onClick={onClose} />
          {isDelegate
            ? <Button variant="primary" size="md" icon={Link2} label="Générer le lien" onClick={submit} disabled={!v.valid} />
            : (modify
                ? <Button variant="primary" size="md" icon={Check} label="Mettre à jour la période" onClick={submit} />
                : <Button variant="primary" size="md" icon={ArrowRight} iconPosition="trailing" label="Accéder à la grille" onClick={submit} />)}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════
// ── Lawyer relevé page — the « Notes / Argumentaire » (rich-text) + « Jurisprudence »
// sections below the table (Figma « Chiffrage > Param > Hours »), adapted to droit social.
function ReleveNotesJP() {
  const monoHead = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const toggle = (Icon, pos) => (
    <span className="inline-flex items-center justify-center" style={{ width: 36, height: 36, background: PAPER, border: `1px solid ${LINE}`, borderRightWidth: pos === 'last' ? 1 : 0, borderTopLeftRadius: pos === 'first' ? 8 : 0, borderBottomLeftRadius: pos === 'first' ? 8 : 0, borderTopRightRadius: pos === 'last' ? 8 : 0, borderBottomRightRadius: pos === 'last' ? 8 : 0 }}>
      <Icon className="w-4 h-4" style={{ color: INK2 }} />
    </span>
  );
  return (
    <div style={{ marginTop: 12 }}>
      {/* NOTES / ARGUMENTAIRE */}
      <div style={{ padding: '16px 0', borderTop: `1px solid ${LINE}` }}>
        <div style={monoHead}>Notes / Argumentaire</div>
        <div className="rounded-md" style={{ border: `1px solid ${LINE}`, background: WHITE, marginTop: 12, padding: '17px 16px' }}>
          <div className="inline-flex" style={{ boxShadow: '0 1px 2px rgba(26,26,26,0.05)', marginBottom: 14 }}>
            {toggle(Bold, 'first')}{toggle(Italic, 'mid')}{toggle(Underline, 'last')}
          </div>
          <div style={{ fontSize: 14, color: INK, lineHeight: '27px' }}>
            <p style={{ margin: 0 }}>Les heures supplémentaires accomplies au-delà de la durée légale (35 h/semaine, soit 151,67 h/mois) et non rémunérées ouvrent droit à un rappel de salaire majoré (art. L. 3121-28 et s. du Code du travail).</p>
            <p style={{ margin: 0 }}>Sur la base du relevé d’heures reconstitué (badges d’accès et e-mails) et d’un taux horaire de 16,40 € :</p>
            <ul style={{ margin: 0, paddingLeft: 21, listStyleType: 'disc' }}>
              <li>Heures supplémentaires majorées +25 % (de la 36e à la 43e heure) : 312 h × 16,40 € × 1,25 = 6 396,00 €</li>
              <li>Heures supplémentaires majorées +50 % (au-delà de la 43e heure) : 118 h × 16,40 € × 1,50 = 2 902,80 €</li>
              <li>Congés payés afférents (10 %) : 929,88 €</li>
            </ul>
            <p style={{ margin: 0 }}>Total rappel d’heures supplémentaires : 10 228,68 €</p>
          </div>
        </div>
      </div>
      {/* JURISPRUDENCE */}
      <div style={{ padding: '16px 0', borderTop: `1px solid ${LINE}` }}>
        <div style={monoHead}>Jurisprudence</div>
        <div className="rounded-md" style={{ border: `1px solid ${LINE}`, background: WHITE, marginTop: 12, overflow: 'hidden' }}>
          {[
            ['Cass. soc., 18 mars 2020, n° 18-10.919', 'Le salarié doit présenter des éléments suffisamment précis (relevé d’heures) pour étayer sa demande ; l’employeur doit y répondre en produisant ses propres éléments.'],
            ['Cass. soc., 27 janvier 2021, n° 17-31.046', 'Le contrôle de la durée du travail incombe à l’employeur ; à défaut d’éléments contraires, le relevé d’heures du salarié fait foi.'],
          ].map(([ref, desc], i) => (
            <div key={i} className="flex items-start gap-3" style={{ padding: '13px 16px', borderTop: i ? `1px solid ${LINE}` : 'none' }}>
              <Scale className="w-4 h-4 flex-shrink-0" style={{ color: MUTE, marginTop: 2 }} strokeWidth={1.5} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{ref}</div>
                <div style={{ fontSize: 13, color: MUTE, lineHeight: '18px', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Totals Amount Pill (Figma 2827:26534/5) — mono uppercase label + Inter-medium
// value. Default = outlined; emphasized = cream-filled (« Total période »).
function TotalsPill({ label, value, emphasized }) {
  return (
    <div className="inline-flex items-center flex-shrink-0" style={{ height: 36, gap: emphasized ? 8 : 10, padding: '0 12px', borderRadius: 8, background: emphasized ? CREAM : WHITE, border: `1px solid ${emphasized ? LINE : '#d6d3d1'}` }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em', color: emphasized ? INK : MUTE, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: emphasized ? INK : INK2, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// ── Embeddable relevé editor — the full lawyer Registre + client interface, no
// matter shell/chat. Rendered inside the real app's chiffrage (droit social).
// Composes the same leaves (RegistreView, DayDrawer, PeriodModal, SharePopover,
// ClientReleveApp) + orchestration as the lab, so it carries all lab features.
export function ReleveEditor({ onBack, demo, inset = { x: 32, top: 24 } } = {}) {
  useLabStyles();
  const [data, setData] = useState({ list: [] });
  const [lawyerYear, setLawyerYear] = useState(2025);
  const [lawyerBuiltFor, setLawyerBuiltFor] = useState('');
  const [lawyerPopulated, setLawyerPopulated] = useState(true);
  const [openDay, setOpenDay] = useState(null);
  const [period, setPeriod] = useState(null);
  const [periodModal, setPeriodModal] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [clientPreview, setClientPreview] = useState(false);   // the client interface, shown as an in-app overlay
  const year = lawyerYear;
  const weeks = data.list;
  const ops = useMemo(() => makeOps(setData, 'list'), []);
  const lawyerYears = useMemo(() => {
    const s = new Set();
    weeks.forEach((w) => w.days.forEach((d) => { if (period && d.iso >= period.start && d.iso <= period.end) s.add(d.yearN); }));
    return [...s].sort((a, b) => a - b);
  }, [weeks, period]);
  const lawyerStats = useMemo(() => {
    const days = weeks.flatMap((w) => w.days).filter((d) => period && d.iso >= period.start && d.iso <= period.end);
    const totalDays = days.length;
    const decided = days.filter((d) => d.worked || d.rest).length;
    const min = days.reduce((a, d) => a + dayMin(d), 0);
    return { totalDays, decided, min, pct: totalDays ? Math.round((decided / totalDays) * 100) : 0, complete: totalDays > 0 && decided === totalDays };
  }, [weeks, period]);
  const openDayObj = openDay ? (() => { const [wi, di] = openDay.split(':').map(Number); return weeks[wi] && weeks[wi].days[di] ? { d: weeks[wi].days[di], wi, di } : null; })() : null;
  const applyPeriod = (start, end, mode) => {
    const wasEmpty = !period;
    const sy = new Date(`${start}T00:00:00`).getFullYear();
    const key = `${start}|${end}`;
    if (mode === 'delegate') {
      setData({ list: buildLawyerWeeks(start, end, false) });
      setLawyerPopulated(false); setLawyerBuiltFor(key); setLawyerYear(sy);
      setPeriod({ start, end });
    } else {
      if (key !== lawyerBuiltFor) {
        const populate = period ? lawyerPopulated : true;
        setData({ list: buildLawyerWeeks(start, end, populate) });
        setLawyerPopulated(populate); setLawyerBuiltFor(key); setLawyerYear(sy);
      }
      setPeriod({ start, end });
    }
    // once the period is set the first time (or on an explicit delegation), surface
    // the share popover — the lawyer sends the link to the client, or dismisses it
    // and fills the grid themselves.
    if (wasEmpty || mode === 'delegate') setShareOpen(true);
    setPeriodModal(null);
  };
  const suggestedPeriod = { start: '2025-01-01', end: '2026-06-30', source: 'le contrat de travail et les bulletins de paie' };
  const openClient = () => setClientPreview(true);
  // total worked minutes for the year currently in view (within the period)
  const yearMin = weeks.reduce((a, w) => a + w.days.reduce((s, d) => s + ((d.yearN === year && period && d.iso >= period.start && d.iso <= period.end) ? dayMin(d) : 0), 0), 0);
  // demo — the « ?demo=social » deep-link lands straight on the filled table (skips the empty state / share popover)
  useEffect(() => {
    if (demo && !period) { applyPeriod(suggestedPeriod.start, suggestedPeriod.end, 'log'); setShareOpen(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);
  return (
    <div className="flex flex-col" style={{ minHeight: 460 }}>
      {/* sub-header — white toolbar bar (Figma « Sidebar Custom Items » 2827:26904): px-16 gap-12
          h-52, plain back chevron + round info-badge + 14/500 title + « Partager au client ».
          Breaks out of the chiffrage content padding (App.js px-8 pt-6) to span edge-to-edge. */}
      <div className="flex items-center flex-shrink-0" style={{ marginLeft: -inset.x, marginRight: -inset.x, marginTop: -inset.top, marginBottom: 22, padding: '0 16px', height: 52, background: WHITE, borderBottom: `1px solid ${LINE}`, gap: 12 }}>
        {onBack && (
          <button onClick={onBack} title="Retour au chiffrage" className="inline-flex items-center justify-center flex-shrink-0 transition-colors" style={{ width: 16, height: 20, padding: 0, color: FAINT, border: 'none', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = FAINT; }}>
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
        <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, borderRadius: 9999, background: INTRANT_BG }}><Clock className="w-3 h-3" style={{ color: INTRANT }} strokeWidth={2} /></span>
        <span style={{ fontSize: 14, fontWeight: 500, color: INK }}>Relevé d'heures</span>
        {period && <div className="ml-auto flex-shrink-0"><SharePopover open={shareOpen} onOpenChange={setShareOpen} onOpenClient={openClient} /></div>}
      </div>
      {!period ? (
        <div className="flex-1 flex items-center justify-center rh-fade" style={{ padding: 40 }}>
          <div className="flex flex-col items-center text-center" style={{ gap: 13, maxWidth: 390 }}>
            <span className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 9999, background: INTRANT_BG, border: `1px solid ${INTRANT_BORDER}` }}><CalendarRange className="w-6 h-6" style={{ color: INTRANT }} strokeWidth={1.5} /></span>
            <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 19, fontWeight: 500, color: INK, margin: 0, letterSpacing: '-0.3px' }}>Définir la période du relevé</p>
            <p style={{ fontSize: 13.5, color: MUTE, lineHeight: '20px', margin: 0 }}>Le relevé couvre la période travaillée par {MATTER.client}. Saisissez-la ou laissez l'agent la proposer, puis partagez le lien au client ou complétez vous-même.</p>
            <div style={{ marginTop: 6 }}>
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="trailing" label="Commencer" onClick={() => setPeriodModal('log')} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* période bar — date picker (label + white chip) + totals pills + year select (Figma 2786:27080) */}
          <div className="flex items-end justify-between" style={{ paddingBottom: 16, gap: 16 }}>
            <div className="flex flex-col items-start" style={{ gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: INK }}>Période</span>
              <button onClick={() => setPeriodModal('log')} title="Modifier la période" className="inline-flex items-center gap-2 transition-colors" style={{ height: 36, padding: '0 12px', background: WHITE, fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 8, cursor: 'pointer', boxShadow: '0px 1px 2px rgba(26,26,26,0.05)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d6d3d1'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = LINE; }}>
                <CalendarRange className="w-4 h-4" style={{ color: MUTE }} />
                <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(period.start)} <span style={{ color: MUTE }}>→</span> {fmtDateNum(period.end)}</span>
                <Pencil className="w-3.5 h-3.5" style={{ color: MUTE, marginLeft: 2 }} />
              </button>
            </div>
            <div className="flex items-center flex-shrink-0" style={{ gap: 10 }}>
              {lawyerYears.length > 1 && <TotalsPill label={`Total ${year}`} value={fmtHM(yearMin)} />}
              <TotalsPill label="Total période" value={fmtHM(lawyerStats.min)} emphasized />
              {lawyerYears.length > 1 && <YearDropdown years={lawyerYears} value={year} onChange={setLawyerYear} />}
            </div>
          </div>
          <RegistreView weeks={weeks} year={year} ops={ops} openDay={openDay} onOpenDay={setOpenDay} start={period.start} end={period.end} demoExpand={demo} />
              <ReleveNotesJP />
        </>
      )}
      {openDayObj && (
        <DayDrawer day={openDayObj.d} wi={openDayObj.wi} di={openDayObj.di} week={weeks[openDayObj.wi]} ops={ops} onClose={() => setOpenDay(null)} start={period.start} end={period.end} />
      )}
      {periodModal && (
        <PeriodModal mode={periodModal}
          modify={periodModal === 'log' && !!period}
          hasEntries={weeks.some((w) => w.days.some((d) => d.worked))}
          suggested={!period ? suggestedPeriod : null}
          defaultStart={period ? period.start : ''}
          defaultEnd={period ? period.end : ''}
          onClose={() => setPeriodModal(null)}
          onSubmit={({ start, end }) => applyPeriod(start, end, periodModal)} />
      )}
      {clientPreview && createPortal(
        <div className="fixed inset-0" style={{ zIndex: 300, background: PAPER }}>
          <ClientReleveApp period={period} onExit={() => setClientPreview(false)} linkError={null} view="table" />
        </div>, document.body)}
    </div>
  );
}

export default function ReleveHeuresLab({ navigate, setCurrentPage, clientFlowPreview = false }) {
  useLabStyles();
  // the lawyer grid is built from the period (flat, possibly spanning several
  // years) once the lawyer defines it — empty until then. The client tab builds
  // its own data, so MAIN's `data` is unused there.
  const [data, setData] = useState({ list: [] });
  const [lawyerYear, setLawyerYear] = useState(2025);   // the year tab in view
  const [lawyerBuiltFor, setLawyerBuiltFor] = useState('');
  const [lawyerPopulated, setLawyerPopulated] = useState(true);
  const year = lawyerYear;
  const [chatOpen, setChatOpen] = useState(true);
  const [tab, setTab] = useState('suivi');
  const [openDay, setOpenDay] = useState(null);   // `${wi}:${di}` — lawyer day drawer
  // the client opens the shared link in its own tab (?share=client) — that tab
  // renders ONLY the gated client app; the lawyer's tab never shows it.
  const [clientView, setClientView] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('share') === 'client'; } catch { return false; }
  });
  // entry flow — the lawyer defines a reference period before logging or delegating
  const [period, setPeriod] = useState(null);            // { start, end } | null
  const [periodModal, setPeriodModal] = useState(null);  // 'log' | 'delegate' | null
  const [shareOpen, setShareOpen] = useState(false);     // the « Partager au client » popover (auto-opens after delegating)
  // the client decodes the period (and any error) from the shared link
  const share = useMemo(() => {
    try { const p = new URLSearchParams(window.location.search); return { start: p.get('start'), end: p.get('end'), error: p.get('error') }; } catch { return {}; }
  }, []);

  const weeks = data.list;
  const demoPeriod = { start: '2025-01-01', end: '2025-04-06' };   // default for the period dialog
  // distinct years actually inside the period — drives the lawyer year tabs
  const lawyerYears = useMemo(() => {
    const s = new Set();
    weeks.forEach((w) => w.days.forEach((d) => { if (period && d.iso >= period.start && d.iso <= period.end) s.add(d.yearN); }));
    return [...s].sort((a, b) => a - b);
  }, [weeks, period]);
  // overall fill progress for the whole period — the lawyer's completion indicator
  const lawyerStats = useMemo(() => {
    const days = weeks.flatMap((w) => w.days).filter((d) => period && d.iso >= period.start && d.iso <= period.end);
    const totalDays = days.length;
    const decided = days.filter((d) => d.worked || d.rest).length;
    const min = days.reduce((a, d) => a + dayMin(d), 0);
    return { totalDays, decided, min, pct: totalDays ? Math.round((decided / totalDays) * 100) : 0, complete: totalDays > 0 && decided === totalDays };
  }, [weeks, period]);
  const openDayObj = openDay ? (() => { const [wi, di] = openDay.split(':').map(Number); return weeks[wi] && weeks[wi].days[di] ? { d: weeks[wi].days[di], wi, di } : null; })() : null;
  // build/rebuild the lawyer grid for a period — keeps edits when dates are unchanged
  const applyPeriod = (start, end, mode) => {
    const sy = new Date(`${start}T00:00:00`).getFullYear();
    const key = `${start}|${end}`;
    if (mode === 'delegate') {
      // delegating: just need the period → land on the (empty) table with the share popover open
      setData({ list: buildLawyerWeeks(start, end, false) });
      setLawyerPopulated(false); setLawyerBuiltFor(key); setLawyerYear(sy);
      setPeriod({ start, end }); setShareOpen(true);
    } else {
      if (key !== lawyerBuiltFor) {
        const populate = period ? lawyerPopulated : true;   // new → demo seed; modify → keep mode
        setData({ list: buildLawyerWeeks(start, end, populate) });
        setLawyerPopulated(populate); setLawyerBuiltFor(key); setLawyerYear(sy);
      }
      setPeriod({ start, end });
    }
    setPeriodModal(null);
  };

  // demo capture hook — `?demo` renders a populated grid directly (for pixel-perfect Figma capture)
  useEffect(() => {
    try { if (new URLSearchParams(window.location.search).get('demo') && !period) applyPeriod(demoPeriod.start, demoPeriod.end, 'log'); } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live January summary feeding the chat's standing analysis
  const ctx = useMemo(() => {
    const jan = weeks.flatMap((w) => w.days).filter((d) => d.yearN === year && d.month === 0);
    const totalMin = jan.reduce((a, d) => a + dayMin(d), 0);
    const nightMin = jan.reduce((a, d) => a + (d.worked ? d.periods.filter(isOvernight).reduce((s, p) => s + periodMin(p), 0) : 0), 0);
    return {
      totalMin,
      overtimeMin: Math.max(0, totalMin - LEGAL_MONTH_MIN),
      nightMin,
      daysOver9: jan.filter((d) => dayMin(d) > 9 * 60).length,
      missingProof: jan.filter((d) => d.worked && d.attachments.length === 0).length,
    };
  }, [weeks, year]);

  // ── immutable mutators (lawyer grid — a single flat weeks list) ──
  const ops = useMemo(() => makeOps(setData, 'list'), []);

  const onBack = () => { if (navigate) navigate('/ui-kit'); else if (setCurrentPage) setCurrentPage('components'); };

  // matter section tabs — Chiffrage → Suivi des heures, no Jurisprudence
  const TABS = [
    { id: 'dossier', label: 'Dossier', Icon: Folder, blurb: "La fiche du dossier — parties, juridiction, dates clés. Hors périmètre de cette maquette, centrée sur le suivi des heures." },
    { id: 'suivi', label: 'Suivi des heures', Icon: Clock },
    { id: 'pieces', label: 'Pièces', Icon: FileText, blurb: "Les pièces du dossier (bulletins de paie, e-mails, badges d'accès…), classées par catégorie. Hors périmètre de cette maquette." },
    { id: 'actes', label: 'Actes', Icon: Pencil, blurb: "Les actes de procédure (requête, conclusions) rédigés à partir du relevé. Hors périmètre de cette maquette." },
  ];

  const activeTab = TABS.find((t) => t.id === tab) || TABS[1];

  // Preserved exploration: the "flow" (month-by-month cards) client, on its own
  // UI-kit page — rendered standalone with a demo period.
  if (clientFlowPreview) {
    const back = () => { if (navigate) navigate('/ui-kit'); else if (setCurrentPage) setCurrentPage('components'); };
    return <ClientReleveApp view="flow" onExit={back} period={{ start: '2024-09-01', end: '2025-06-30' }} linkError={null} />;
  }

  // The client's shared link opens a fully standalone app — no matter tabs, no
  // Plato chat. The period is read from the link; "Quitter" closes the tab. The
  // default client mirrors the lawyer's Registre table (view='table').
  if (clientView) {
    const exit = () => { window.close(); setClientView(false); };
    return <ClientReleveApp onExit={exit}
      period={share.start && share.end ? { start: share.start, end: share.end } : null} linkError={share.error} />;
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      {/* body = matter shell (left) · PLATO MASTER chat (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — matter */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: PAPER, minWidth: 0 }}>
          {/* ── matter tab nav ── */}
          <div className="flex items-stretch px-4 flex-shrink-0" style={{ height: 56, borderBottom: `1px solid ${LINE}`, background: WHITE }}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={onBack} className="flex items-center justify-center rounded-lg transition-colors" title="Retour à UI Components" style={{ width: 36, height: 36, border: `1px solid ${LINE}`, background: WHITE }}
                onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
                <Home className="w-4 h-4" style={{ color: MUTE }} />
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full" style={{ height: 22, padding: '0 9px', background: '#e9f1ea', fontSize: 11.5, fontWeight: 600, color: '#4a7256' }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#5a9469' }} /> En cours
              </span>
              <span className="inline-flex items-center gap-1 rounded-full" style={{ height: 22, padding: '0 9px', background: CREAM, color: INK2, fontSize: 11.5, fontWeight: 600 }}>
                <Scale className="w-3 h-3" /> Droit social
              </span>
            </div>

            <nav className="flex-1 flex items-stretch justify-center gap-0.5">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} className="relative inline-flex items-center gap-1.5 px-3.5 transition-colors" style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? INK : MUTE }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = MUTE; }}>
                    <t.Icon className="w-4 h-4" style={{ color: active ? INK : FAINT }} /> {t.label}
                    {active && <span className="absolute" style={{ left: 8, right: 8, bottom: -1, height: 2, background: INK, borderRadius: 2 }} />}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!chatOpen && period && (
                <button onClick={() => setChatOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ height: 34, padding: '0 11px', fontSize: 13, fontWeight: 500, color: INK2, border: `1px solid ${LINE}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <MessageSquare className="w-4 h-4" style={{ color: MUTE }} /> Plato
                </button>
              )}
              <button className="flex items-center justify-center rounded-md transition-colors" title="Plus d'options" style={{ width: 32, height: 32 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <MoreVertical className="w-4 h-4" style={{ color: MUTE }} />
              </button>
            </div>
          </div>

          {/* ── tab content ── */}
          {tab !== 'suivi' ? (
            <TabPlaceholder icon={activeTab.Icon} title={activeTab.label} blurb={activeTab.blurb} onGoSuivi={() => setTab('suivi')} />
          ) : (
            <>
              {/* content sub-header */}
              <div className="px-7 flex items-center flex-shrink-0" style={{ height: 60, gap: 16, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="inline-flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: '#dbeafe', color: '#1e3a8a', fontSize: 12, fontWeight: 600 }}>{MATTER.initials}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, lineHeight: '16px' }}>Relevé d'heures</div>
                    <div className="truncate" style={{ fontSize: 11.5, color: MUTE, lineHeight: '15px', maxWidth: 300 }}>{MATTER.client} · {MATTER.role.toLowerCase()} — {MATTER.objet}</div>
                  </div>
                </div>
                {period && (
                  <div className="ml-auto flex items-center gap-3">
                    <SharePopover open={shareOpen} onOpenChange={setShareOpen} onOpenClient={() => window.open(window.location.pathname + `?share=client&start=${period.start}&end=${period.end}`, '_blank')} />
                  </div>
                )}
              </div>

              {/* content — empty state → (period defined) grid · (delegated) link-ready */}
              {period ? (
                <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>
                  {/* période bar — sticky; the relevé period (clickable to edit) left, completion + year nav right */}
                  <div className="flex items-center" style={{ position: 'sticky', top: 0, zIndex: 5, background: PAPER, paddingTop: 2, paddingBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginRight: 10, flexShrink: 0 }}>Période</span>
                    <button onClick={() => setPeriodModal('log')} title={`Période du relevé — celle travaillée par ${MATTER.client}, sur laquelle saisir les heures. Cliquer pour modifier.`} className="inline-flex items-center gap-2 rounded-lg transition-colors" style={{ height: 34, padding: '0 10px 0 12px', background: CREAM, fontSize: 13, border: 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e4e1da'; }} onMouseLeave={(e) => { e.currentTarget.style.background = CREAM; }}>
                      <CalendarRange className="w-3.5 h-3.5" style={{ color: MUTE }} />
                      <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(period.start)} → {fmtDateNum(period.end)}</span>
                      <span style={{ color: MUTE }}>· {daysBetween(period.start, period.end)} j</span>
                      <Pencil className="w-3.5 h-3.5" style={{ color: MUTE, marginLeft: 2 }} />
                    </button>
                    <div className="ml-auto flex items-center" style={{ gap: 16 }}>
                      {lawyerYears.length > 1 && (() => { const ym = weeks.reduce((a, w) => a + w.days.filter((d) => d.yearN === year && period && d.iso >= period.start && d.iso <= period.end).reduce((s, d) => s + dayMin(d), 0), 0); return <span style={{ fontSize: 12.5, color: MUTE, whiteSpace: 'nowrap' }}>Total période <strong style={{ fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(lawyerStats.min)}</strong> · {year} <strong style={{ fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(ym)}</strong></span>; })()}
                      {/* completion indicator — overall fill progress for the period */}
                      <div className="flex items-center gap-2.5 flex-shrink-0" title={`${lawyerStats.decided} jours renseignés sur ${lawyerStats.totalDays} · ${fmtHM(lawyerStats.min)} saisies`}>
                        {lawyerStats.complete
                          ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#3f7d5f' }} />
                          : <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT }}>Complété</span>}
                        <div style={{ width: 84, height: 6, borderRadius: 99, background: CREAM, overflow: 'hidden' }}>
                          <div style={{ width: `${lawyerStats.pct}%`, height: '100%', borderRadius: 99, background: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, transition: 'width .35s ease' }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.pct}%</span>
                        <span style={{ fontSize: 12, color: MUTE, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.decided}/{lawyerStats.totalDays} j</span>
                      </div>
                      {lawyerYears.length > 1 && (
                        <YearDropdown years={lawyerYears} value={year} onChange={setLawyerYear} />
                      )}
                    </div>
                  </div>
                  <RegistreView weeks={weeks} year={year} ops={ops} openDay={openDay} onOpenDay={setOpenDay} start={period.start} end={period.end} />
              <ReleveNotesJP />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center rh-fade" style={{ padding: 40 }}>
                  <div className="flex flex-col items-center text-center" style={{ gap: 22, maxWidth: 460 }}>
                    <span className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 9999, background: '#eeece6', border: '1px solid #d6d3d1', boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
                      <CalendarClock className="w-6 h-6" style={{ color: '#78716c' }} strokeWidth={1.5} />
                    </span>
                    <div className="flex flex-col items-center" style={{ gap: 5 }}>
                      <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 19, fontWeight: 500, color: INK, letterSpacing: '-0.5px', lineHeight: '25px', margin: 0 }}>Commencer le relevé d'heures</p>
                      <p style={{ fontSize: 14, fontWeight: 400, color: MUTE, lineHeight: '20px', margin: 0, maxWidth: 340 }}>Définissez la période concernée, puis déléguez la saisie à votre client ou saisissez les heures vous-même.</p>
                    </div>
                    <div className="flex items-center justify-center" style={{ gap: 8 }}>
                      <Button variant="primary" size="md" icon={Send} label="Déléguer au client" onClick={() => setPeriodModal('delegate')} />
                      <Button variant="outline" size="md" icon={Clock} label="Commencer moi-même" onClick={() => setPeriodModal('log')} />
                    </div>
                  </div>
                </div>
              )}

              {/* shared period dialog (both paths) */}
              {periodModal && (
                <PeriodModal mode={periodModal}
                  modify={periodModal === 'log' && !!period}
                  hasEntries={weeks.some((w) => w.days.some((d) => d.worked))}
                  defaultStart={period ? period.start : demoPeriod.start}
                  defaultEnd={period ? period.end : demoPeriod.end}
                  onClose={() => setPeriodModal(null)}
                  onSubmit={({ start, end }) => applyPeriod(start, end, periodModal)} />
              )}
            </>
          )}
        </div>

        {/* day drawer — a column between the table and the chat */}
        {tab === 'suivi' && openDayObj && (
          <DayDrawer day={openDayObj.d} wi={openDayObj.wi} di={openDayObj.di} week={weeks[openDayObj.wi]} ops={ops} onClose={() => setOpenDay(null)} start={period && period.start} end={period && period.end} />
        )}

        {/* RIGHT — PLATO MASTER chat */}
        {chatOpen && period && <ChatPanel ctx={ctx} onClose={() => setChatOpen(false)} />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAWYER PLACEMENTS — exploration: WHERE does the relevé live (never a tab)?
// One mock matter shell (real tabs), the hours feature placed three ways via a
// top switcher: Chiffrage·poste / Chiffrage·source / Dossier·widget. The heavy
// editor (RegistreView) opens as a full-screen overlay from whichever host.
// ════════════════════════════════════════════════════════════════════════
export function LawyerPlacementsLab({ navigate, setCurrentPage }) {
  useLabStyles();
  const [variant, setVariant] = useState('poste');     // 'poste' | 'source' | 'dossier'
  const [tab, setTab] = useState('chiffrage');          // matter tab
  const [posteOpen, setPosteOpen] = useState(false);    // variant 1: heures-poste detail
  const [editorOpen, setEditorOpen] = useState(false);  // full-screen relevé overlay
  const [taux, setTaux] = useState('18,50');            // taux horaire (valuation)
  const [chatOpen, setChatOpen] = useState(true);       // PLATO chat — shown on the right by default

  // hours state — mirrors MAIN's lawyer orchestration
  const [data, setData] = useState({ list: [] });
  const [lawyerYear, setLawyerYear] = useState(2025);
  const [lawyerBuiltFor, setLawyerBuiltFor] = useState('');
  const [lawyerPopulated, setLawyerPopulated] = useState(true);
  const [period, setPeriod] = useState(null);
  const [periodModal, setPeriodModal] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [openDay, setOpenDay] = useState(null);
  const year = lawyerYear;
  const weeks = data.list;
  const demoPeriod = { start: '2025-01-01', end: '2025-04-06' };
  const ops = useMemo(() => makeOps(setData, 'list'), []);
  const lawyerYears = useMemo(() => {
    const s = new Set();
    weeks.forEach((w) => w.days.forEach((d) => { if (period && d.iso >= period.start && d.iso <= period.end) s.add(d.yearN); }));
    return [...s].sort((a, b) => a - b);
  }, [weeks, period]);
  const lawyerStats = useMemo(() => {
    const days = weeks.flatMap((w) => w.days).filter((d) => period && d.iso >= period.start && d.iso <= period.end);
    const totalDays = days.length;
    const decided = days.filter((d) => d.worked || d.rest).length;
    const min = days.reduce((a, d) => a + dayMin(d), 0);
    return { totalDays, decided, min, pct: totalDays ? Math.round((decided / totalDays) * 100) : 0, complete: totalDays > 0 && decided === totalDays };
  }, [weeks, period]);
  const openDayObj = openDay ? (() => { const [wi, di] = openDay.split(':').map(Number); return weeks[wi] && weeks[wi].days[di] ? { d: weeks[wi].days[di], wi, di } : null; })() : null;
  // live January analysis feeding the PLATO chat (same as MAIN)
  const ctx = useMemo(() => {
    const jan = weeks.flatMap((w) => w.days).filter((d) => d.yearN === year && d.month === 0);
    const totalMin = jan.reduce((a, d) => a + dayMin(d), 0);
    const nightMin = jan.reduce((a, d) => a + (d.worked ? d.periods.filter(isOvernight).reduce((s, p) => s + periodMin(p), 0) : 0), 0);
    return { totalMin, overtimeMin: Math.max(0, totalMin - LEGAL_MONTH_MIN), nightMin, daysOver9: jan.filter((d) => dayMin(d) > 9 * 60).length, missingProof: jan.filter((d) => d.worked && d.attachments.length === 0).length };
  }, [weeks, year]);

  const applyPeriod = (start, end, mode) => {
    const sy = new Date(`${start}T00:00:00`).getFullYear();
    const key = `${start}|${end}`;
    if (mode === 'delegate') {
      setData({ list: buildLawyerWeeks(start, end, false) });
      setLawyerPopulated(false); setLawyerBuiltFor(key); setLawyerYear(sy);
      setPeriod({ start, end }); setEditorOpen(true); setShareOpen(true);
    } else {
      if (key !== lawyerBuiltFor) {
        const populate = period ? lawyerPopulated : true;
        setData({ list: buildLawyerWeeks(start, end, populate) });
        setLawyerPopulated(populate); setLawyerBuiltFor(key); setLawyerYear(sy);
      }
      setPeriod({ start, end }); setEditorOpen(true);
    }
    setPeriodModal(null);
  };

  // valuation — total saisi × taux, +25% (1ʳᵉˢ heures sup.) for the demo montant
  const tauxNum = parseFloat(String(taux).replace(',', '.')) || 0;
  const heures = lawyerStats.min / 60;
  const heuresMontant = Math.round(heures * tauxNum * 1.25);
  const fmtEur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;

  const onBack = () => { if (navigate) navigate('/ui-kit'); else if (setCurrentPage) setCurrentPage('components'); };
  const openClient = () => { if (period) window.open(`/ui-kit/releve-heures?share=client&start=${period.start}&end=${period.end}`, '_blank'); };
  const switchVariant = (v) => { setVariant(v); setTab(v === 'dossier' ? 'dossier' : 'chiffrage'); setPosteOpen(false); };

  // mock droit-social chiffrage (the heures poste is computed from the relevé)
  const POSTES = [
    { id: 'hs', acro: 'HS', label: 'Rappel d’heures supplémentaires', montant: heuresMontant, hours: true },
    { id: 'td', acro: 'TD', label: 'Indemnité pour travail dissimulé', montant: 13800 },
    { id: 'cp', acro: 'CP', label: 'Congés payés afférents', montant: Math.round(heuresMontant * 0.1) },
    { id: 'cor', acro: 'COR', label: 'Contrepartie obligatoire en repos', montant: 2150 },
  ];
  const total = POSTES.reduce((a, p) => a + p.montant, 0);

  // ── the hours feature, compact — the body of every host ──
  const hoursSummary = (
    period ? (
      <div className="flex flex-col" style={{ gap: 12 }}>
        <div className="flex items-center flex-wrap" style={{ gap: 10 }}>
          <span className="inline-flex items-center gap-2 rounded-lg" style={{ height: 30, padding: '0 10px', background: CREAM, fontSize: 12.5 }}>
            <CalendarRange className="w-3.5 h-3.5" style={{ color: MUTE }} />
            <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(period.start)} → {fmtDateNum(period.end)}</span>
          </span>
          <span className="inline-flex items-center gap-2" style={{ flex: 1, minWidth: 150 }}>
            <span style={{ flex: 1, height: 6, borderRadius: 99, background: CREAM, overflow: 'hidden' }}>
              <span className="block" style={{ width: `${lawyerStats.pct}%`, height: '100%', borderRadius: 99, background: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK }} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.pct}%</span>
          </span>
        </div>
        <div style={{ fontSize: 13, color: MUTE }}>Total saisi <strong style={{ color: INK, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtHM(lawyerStats.min)}</strong> · {lawyerStats.decided}/{lawyerStats.totalDays} j renseignés</div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" icon={ArrowUpRight} label="Ouvrir le relevé" onClick={() => setEditorOpen(true)} />
          <Button variant="outline" size="sm" icon={Send} label="Déléguer au client" onClick={() => { setEditorOpen(true); setShareOpen(true); }} />
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-start" style={{ gap: 12 }}>
        <p style={{ fontSize: 13, color: MUTE, margin: 0, lineHeight: '18px', maxWidth: 380 }}>Aucune période définie. Saisissez vous-même les heures travaillées, ou déléguez la saisie au salarié via un lien sécurisé.</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" icon={Send} label="Déléguer au client" onClick={() => setPeriodModal('delegate')} />
          <Button variant="outline" size="sm" icon={Clock} label="Commencer moi-même" onClick={() => setPeriodModal('log')} />
        </div>
      </div>
    )
  );

  const cardSh = { border: `1px solid ${LINE}`, background: WHITE, boxShadow: SHADOW, overflow: 'hidden' };
  const sectionLabel = (t) => <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginBottom: 8 }}>{t}</div>;

  // ── mock Chiffrage poste list ──
  const renderPosteList = () => (
    <>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', color: INK, margin: 0 }}>Chiffrage des demandes</h2>
        <span style={{ fontSize: 13, color: MUTE }}>Total demandé <strong style={{ fontSize: 15, color: ACCENT_DK, fontFamily: "'IBM Plex Mono', monospace" }}>{fmtEur(total)}</strong></span>
      </div>
      <div className="rounded-xl" style={cardSh}>
        <div className="flex items-center px-4" style={{ height: 40, background: SUBTLE, borderBottom: `1px solid ${LINE}`, fontSize: 12, fontWeight: 600, color: MUTE }}>Rappels de salaire & indemnités</div>
        {POSTES.map((p, i) => {
          const clickable = p.hours && variant === 'poste';
          return (
            <div key={p.id} onClick={clickable ? () => setPosteOpen(true) : undefined}
              className="flex items-center px-4 transition-colors" style={{ minHeight: 52, borderTop: i ? `1px solid ${LINE}` : 'none', cursor: clickable ? 'pointer' : 'default' }}
              onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <span className="inline-flex items-center justify-center rounded-md flex-shrink-0" style={{ minWidth: 38, height: 22, padding: '0 7px', background: p.hours ? ACCENT_BG : CREAM, color: p.hours ? ACCENT_DK : INK2, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600 }}>{p.acro}</span>
              <span style={{ fontSize: 13.5, color: INK, marginLeft: 12 }}>{p.label}</span>
              {p.hours && variant === 'source' && <span style={{ fontSize: 12, color: MUTE, marginLeft: 10 }}>· d’après le relevé d’heures</span>}
              {p.hours && variant === 'dossier' && <span style={{ fontSize: 12, color: MUTE, marginLeft: 10 }}>· via le relevé (onglet Dossier)</span>}
              <span className="ml-auto flex items-center gap-2 flex-shrink-0">
                <span style={{ fontSize: 13.5, fontWeight: 600, color: INK, fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>{fmtEur(p.montant)}</span>
                {clickable && <ChevronRight className="w-4 h-4" style={{ color: FAINT }} />}
              </span>
            </div>
          );
        })}
      </div>

      {variant === 'source' && (
        <div className="rounded-xl" style={{ ...cardSh, marginTop: 16 }}>
          <div className="flex items-center px-4" style={{ height: 40, background: SUBTLE, borderBottom: `1px solid ${LINE}`, fontSize: 12, fontWeight: 600, color: MUTE }}>Sources & réglages du chiffrage</div>
          <div className="px-4 py-3 flex flex-col" style={{ gap: 10 }}>
            <div className="flex items-center justify-between"><span style={{ fontSize: 12.5, color: MUTE }}>Taux horaire</span><span className="inline-flex items-center gap-1"><input value={taux} onChange={(e) => setTaux(e.target.value)} className="outline-none text-right" style={{ width: 56, height: 30, padding: '0 8px', fontSize: 13, border: `1px solid ${LINE}`, borderRadius: 7, fontVariantNumeric: 'tabular-nums' }} /><span style={{ fontSize: 13, color: MUTE }}>€</span></span></div>
            <div className="flex items-center justify-between"><span style={{ fontSize: 12.5, color: MUTE }}>Référentiel</span><span style={{ fontSize: 13, color: INK }}>Convention collective</span></div>
            <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12, marginTop: 2 }}>
              {sectionLabel('Relevé d’heures')}
              {hoursSummary}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── variant 1: the heures poste detail ──
  const renderPosteDetail = () => (
    <>
      <button onClick={() => setPosteOpen(false)} className="inline-flex items-center gap-1.5 rounded-md transition-colors" style={{ height: 30, padding: '0 9px 0 6px', fontSize: 12.5, color: MUTE, marginBottom: 14 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTE; }}>
        <ChevronLeft className="w-4 h-4" /> Chiffrage
      </button>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
        <span className="inline-flex items-center justify-center rounded-md" style={{ minWidth: 38, height: 24, padding: '0 8px', background: ACCENT_BG, color: ACCENT_DK, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600 }}>HS</span>
        <h2 style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 22, fontWeight: 500, letterSpacing: '-0.4px', color: INK, margin: 0 }}>Rappel d’heures supplémentaires</h2>
      </div>
      <div className="rounded-xl" style={{ ...cardSh, padding: '16px 18px', marginBottom: 14 }}>
        <div className="flex items-center flex-wrap" style={{ gap: 20 }}>
          <div><div style={{ fontSize: 11.5, color: FAINT, marginBottom: 3 }}>Heures retenues</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: INK }}>{fmtHM(lawyerStats.min)}</div></div>
          <span style={{ color: FAINT }}>×</span>
          <div><div style={{ fontSize: 11.5, color: FAINT, marginBottom: 3 }}>Taux horaire</div><span className="inline-flex items-center gap-1"><input value={taux} onChange={(e) => setTaux(e.target.value)} className="outline-none text-right" style={{ width: 64, height: 32, padding: '0 8px', fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 8, fontVariantNumeric: 'tabular-nums' }} /><span style={{ color: MUTE }}>€</span></span></div>
          <div className="flex items-center gap-1.5"><div style={{ fontSize: 11.5, color: FAINT, marginBottom: 3, width: '100%' }}>Majoration</div><span className="inline-flex items-center rounded-md" style={{ height: 24, padding: '0 8px', background: ACCENT_BG, color: ACCENT_DK, fontSize: 12, fontWeight: 600 }}>+25 %</span><span className="inline-flex items-center rounded-md" style={{ height: 24, padding: '0 8px', background: CREAM, color: MUTE, fontSize: 12, fontWeight: 600 }}>+50 %</span></div>
          <div className="ml-auto text-right"><div style={{ fontSize: 11.5, color: FAINT, marginBottom: 3 }}>Montant</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: ACCENT_DK }}>{fmtEur(heuresMontant)}</div></div>
        </div>
      </div>
      <div className="rounded-xl" style={{ ...cardSh, padding: '16px 18px' }}>
        {sectionLabel('Relevé d’heures — la base du calcul')}
        {hoursSummary}
      </div>
    </>
  );

  // ── mock Dossier (info) tab ──
  // ── mock Dossier (info) tab — replicates the body-injury dossier design (icon-header
  //    cards + two-column field rows + sub-blocks + sticky right summary), adapted to droit social ──
  const dHead = (Icon, title, right) => (
    <div className="flex items-center gap-2.5" style={{ padding: '13px 16px', borderBottom: `1px solid ${LINE}`, background: WHITE }}>
      <Icon className="w-4 h-4" style={{ color: MUTE }} strokeWidth={1.5} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
  const dField = (label, value) => (
    <div className="flex-1" style={{ padding: '16px 20px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? INK : FAINT, fontWeight: value ? 500 : 400, lineHeight: '19px' }}>{value || 'Non renseigné'}</div>
    </div>
  );
  const dRow = (a, b, last) => <div className="flex" style={last ? undefined : { borderBottom: `1px solid ${LINE}` }}>{a}{b}</div>;
  const dCard = (Icon, title, children, right) => (
    <div className="rounded-lg" style={{ border: `1px solid ${LINE}`, background: WHITE, boxShadow: '0 1px 2px rgba(26,26,26,0.04)', overflow: 'hidden' }}>{dHead(Icon, title, right)}{children}</div>
  );
  // full-width stacked cards (drop-first dossier layout) — the PLATO chat owns the right
  const renderDossier = () => (
    <div className="flex flex-col" style={{ gap: 16, maxWidth: 960, margin: '0 auto' }}>
      {dCard(User, 'Salarié', <>
        {dRow(dField('Nom', 'Aubert'), dField('Prénom', 'Camille'))}
        {dRow(dField('Sexe', 'Féminin'), dField('Date de naissance', <span className="inline-flex items-center gap-2">14/03/1989 <span style={{ width: 4, height: 4, borderRadius: 2, background: '#d9d9d9' }} /> <span style={{ color: MUTE, fontWeight: 400 }}>35 ans</span></span>))}
        {dRow(dField('Poste occupé', 'Cariste'), dField('Ancienneté', '3 ans · 2 mois'), true)}
      </>)}
      {dCard(Briefcase, 'Relation de travail', <>
        {dRow(dField('Type de contrat', 'CDI'), dField('Date d’embauche', '02/05/2020'))}
        {dRow(dField('Fin du contrat', '30/06/2023'), dField('Motif de la rupture', 'Licenciement'))}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>Résumé des faits</div>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: '19px' }}>Heures supplémentaires accomplies et non rémunérées, dépassement régulier de l’amplitude journalière ; horaires reconstitués à partir des badges d’accès et des e-mails.</div>
        </div>
        <div style={{ padding: '13px 20px' }}>
          <span style={{ fontSize: 13, color: MUTE }}>Salaire mensuel de référence</span>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: INK, marginTop: 4 }}>2 350 €</div>
        </div>
      </>)}
      {variant === 'dossier' && dCard(Clock, 'Suivi des heures', <div style={{ padding: '16px 20px' }}>{hoursSummary}</div>)}
      {dCard(Building2, 'Employeur', <>
        {dRow(dField('Société', MATTER.adverse), dField('Forme', 'SAS'))}
        {dRow(dField('Convention collective', 'Transport routier'), dField('Effectif', '120 salariés'), true)}
      </>)}
      {dCard(Scale, 'Procédure', <>
        {dRow(dField('Juridiction', MATTER.juridiction), dField('Stade', 'Bureau de jugement'))}
        {dRow(dField('Objet', MATTER.objet), <div className="flex-1" />, true)}
      </>)}
      {dCard(FileText, 'Faits et procédure', (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>Commentaire</div>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: '19px' }}>Saisine du conseil de prud’hommes le 12/09/2023 ; tentative de conciliation échouée. Demande principale : rappel d’heures supplémentaires et indemnités afférentes.</div>
        </div>
      ))}
    </div>
  );

  const PL_TABS = [
    { id: 'dossier', label: 'Dossier', Icon: Folder },
    { id: 'chiffrage', label: 'Chiffrage', Icon: Calculator },
    { id: 'pieces', label: 'Pièces', Icon: FileText },
    { id: 'actes', label: 'Actes', Icon: Pencil },
  ];

  return (
    <div className="h-screen flex flex-col" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      {/* exploration switcher */}
      <div className="flex items-center px-4 flex-shrink-0" style={{ height: 48, gap: 12, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
        <button onClick={onBack} className="flex items-center justify-center rounded-lg transition-colors" title="Retour à UI Components" style={{ width: 34, height: 34, border: `1px solid ${LINE}`, background: WHITE }}
          onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
          <Home className="w-4 h-4" style={{ color: MUTE }} />
        </button>
        <span style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT }}>Placement du relevé · exploration</span>
        <div className="ml-auto inline-flex items-center rounded-lg p-1" style={{ background: CREAM }}>
          {[['poste', 'Chiffrage · poste'], ['source', 'Chiffrage · source'], ['dossier', 'Dossier · widget']].map(([v, label]) => (
            <button key={v} onClick={() => switchVariant(v)} className="rounded-md transition-all" style={{ height: 28, padding: '0 12px', fontSize: 12.5, fontWeight: 500, color: variant === v ? INK : MUTE, background: variant === v ? WHITE : 'transparent', boxShadow: variant === v ? '0px 1px 3px rgba(26,26,26,0.08)' : 'none', border: 'none', cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* mock matter shell (left) + PLATO chat (right) */}
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        {/* tab nav */}
        <div className="flex items-stretch px-4 flex-shrink-0" style={{ height: 56, borderBottom: `1px solid ${LINE}`, background: WHITE }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: '#dbeafe', color: '#1e3a8a', fontSize: 11.5, fontWeight: 600 }}>{MATTER.initials}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, lineHeight: '15px' }}>{MATTER.client}</div>
              <div className="truncate" style={{ fontSize: 11, color: MUTE, lineHeight: '14px', maxWidth: 240 }}>c/ {MATTER.adverse}</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full" style={{ height: 22, padding: '0 9px', background: CREAM, color: INK2, fontSize: 11.5, fontWeight: 600, marginLeft: 4 }}><Scale className="w-3 h-3" /> Droit social</span>
          </div>
          <nav className="flex-1 flex items-stretch justify-center gap-0.5">
            {PL_TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className="relative inline-flex items-center gap-1.5 px-3.5 transition-colors" style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? INK : MUTE, background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = MUTE; }}>
                  <t.Icon className="w-4 h-4" style={{ color: active ? INK : FAINT }} /> {t.label}
                  {active && <span className="absolute" style={{ left: 8, right: 8, bottom: -1, height: 2, background: INK, borderRadius: 2 }} />}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center justify-end flex-shrink-0" style={{ width: 36 }}>
            {!chatOpen && (
              <button onClick={() => setChatOpen(true)} title="Ouvrir Plato" className="flex items-center justify-center rounded-md transition-colors" style={{ width: 32, height: 32 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <MessageSquare className="w-4 h-4" style={{ color: MUTE }} />
              </button>
            )}
          </div>
        </div>

        {/* tab content */}
        {tab === 'chiffrage' ? (
          <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>
            <div style={{ maxWidth: 940, margin: '0 auto' }}>{variant === 'poste' && posteOpen ? renderPosteDetail() : renderPosteList()}</div>
          </div>
        ) : tab === 'dossier' ? (
          <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>{renderDossier()}</div>
        ) : (
          <div className="flex-1 flex items-center justify-center rh-fade" style={{ padding: 40 }}>
            <div className="flex flex-col items-center text-center" style={{ gap: 14, maxWidth: 380 }}>
              <span className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 9999, background: '#eeece6', border: '1px solid #d6d3d1' }}>
                {tab === 'pieces' ? <FileText className="w-6 h-6" style={{ color: '#78716c' }} strokeWidth={1.5} /> : <Pencil className="w-6 h-6" style={{ color: '#78716c' }} strokeWidth={1.5} />}
              </span>
              <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 18, fontWeight: 500, color: INK, margin: 0 }}>{tab === 'pieces' ? 'Pièces' : 'Actes'}</p>
              <p style={{ fontSize: 13.5, color: MUTE, lineHeight: '19px', margin: 0 }}>Hors périmètre de cette maquette, centrée sur le placement du relevé d’heures.</p>
            </div>
          </div>
        )}
      </div>
        {chatOpen && <ChatPanel ctx={ctx} onClose={() => setChatOpen(false)} />}
      </div>

      {/* full-screen relevé editor overlay */}
      {editorOpen && period && (
        <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
          <header className="px-6 flex items-center flex-shrink-0" style={{ height: 60, gap: 14, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
            <button onClick={() => setEditorOpen(false)} className="inline-flex items-center gap-1.5 rounded-md transition-colors" style={{ height: 32, padding: '0 10px 0 7px', fontSize: 13, color: INK2, border: `1px solid ${LINE}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, lineHeight: '16px' }}>Relevé d'heures</div>
              <div className="truncate" style={{ fontSize: 11.5, color: MUTE, lineHeight: '15px', maxWidth: 320 }}>{MATTER.client} · {MATTER.role.toLowerCase()} — {MATTER.objet}</div>
            </div>
            <div className="ml-auto"><SharePopover open={shareOpen} onOpenChange={setShareOpen} onOpenClient={openClient} /></div>
          </header>
          <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px', minWidth: 0 }}>
            <div className="flex items-center" style={{ position: 'sticky', top: 0, zIndex: 5, background: PAPER, paddingTop: 2, paddingBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginRight: 10, flexShrink: 0 }}>Période</span>
              <button onClick={() => setPeriodModal('log')} title="Modifier la période" className="inline-flex items-center gap-2 rounded-lg transition-colors" style={{ height: 34, padding: '0 10px 0 12px', background: CREAM, fontSize: 13, border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e4e1da'; }} onMouseLeave={(e) => { e.currentTarget.style.background = CREAM; }}>
                <CalendarRange className="w-3.5 h-3.5" style={{ color: MUTE }} />
                <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(period.start)} → {fmtDateNum(period.end)}</span>
                <span style={{ color: MUTE }}>· {daysBetween(period.start, period.end)} j</span>
                <Pencil className="w-3.5 h-3.5" style={{ color: MUTE, marginLeft: 2 }} />
              </button>
              <div className="ml-auto flex items-center" style={{ gap: 16 }}>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {lawyerStats.complete
                    ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#3f7d5f' }} />
                    : <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT }}>Complété</span>}
                  <div style={{ width: 84, height: 6, borderRadius: 99, background: CREAM, overflow: 'hidden' }}>
                    <div style={{ width: `${lawyerStats.pct}%`, height: '100%', borderRadius: 99, background: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, transition: 'width .35s ease' }} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.pct}%</span>
                  <span style={{ fontSize: 12, color: MUTE, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.decided}/{lawyerStats.totalDays} j</span>
                </div>
                {lawyerYears.length > 1 && <YearDropdown years={lawyerYears} value={year} onChange={setLawyerYear} />}
              </div>
            </div>
            <RegistreView weeks={weeks} year={year} ops={ops} openDay={openDay} onOpenDay={setOpenDay} start={period.start} end={period.end} />
              <ReleveNotesJP />
          </div>
            {chatOpen && <ChatPanel ctx={ctx} onClose={() => setChatOpen(false)} />}
          </div>
          {openDayObj && (
            <DayDrawer day={openDayObj.d} wi={openDayObj.wi} di={openDayObj.di} week={weeks[openDayObj.wi]} ops={ops} onClose={() => setOpenDay(null)} start={period.start} end={period.end} />
          )}
        </div>
      )}

      {/* shared period dialog */}
      {periodModal && (
        <PeriodModal mode={periodModal}
          modify={periodModal === 'log' && !!period}
          hasEntries={weeks.some((w) => w.days.some((d) => d.worked))}
          defaultStart={period ? period.start : demoPeriod.start}
          defaultEnd={period ? period.end : demoPeriod.end}
          onClose={() => setPeriodModal(null)}
          onSubmit={({ start, end }) => applyPeriod(start, end, periodModal)} />
      )}
    </div>
  );
}
// ════════════════════════════════════════════════════════════════════════
// CHIFFRAGE DROIT SOCIAL — the body-injury chiffrage, declined for social law
// (no IV, droit-social postes). Same dual-panel (chat + canvas) and poste
// patterns. Materialises the distinction between POSTES CHIFFRÉS (outputs that
// sum to the total) and VARIABLES D'ENTRÉE / intrants (salaire de référence,
// relevé d'heures — inputs that feed the calc, appear on demand, never summed).
// A switcher offers 3 visual directions for that distinction.
// ════════════════════════════════════════════════════════════════════════
const INTRANT = '#1e3a8a';        // blue « info » — the « intrant » / variable nature (matches Figma CHIFFRAGE > LABOR)
const INTRANT_BG = '#dfe8f5';
const INTRANT_BORDER = '#aabcd5';

export function ChiffrageSocialLab({ navigate, setCurrentPage }) {
  useLabStyles();
  const [direction, setDirection] = useState('sections');   // 'sections' | 'tagged' | 'pinned'
  const [chatOpen, setChatOpen] = useState(true);
  const [salaireBasis, setSalaireBasis] = useState('12');   // '12' | '3' — reference-salary basis (the more favorable)
  const [salaireOpen, setSalaireOpen] = useState(false);    // the « Salaire de référence » page (bulletins + moyenne)
  const intrants = ['salaire', 'releve'];   // input variables (fixed set: salaire de référence + relevé d'heures)
  const [posteIds, setPosteIds] = useState(['hs', 'cphs', 'preavis', 'lic', 'dscrs']);
  const [addPoste, setAddPoste] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [tab, setTab] = useState('chiffrage');          // matter tab (the chiffrage lives inside the matter shell)

  // relevé (hours) state — same orchestration as the lawyer view
  const [data, setData] = useState({ list: [] });
  const [lawyerYear, setLawyerYear] = useState(2025);
  const [lawyerBuiltFor, setLawyerBuiltFor] = useState('');
  const [lawyerPopulated, setLawyerPopulated] = useState(true);
  const [period, setPeriod] = useState(null);
  const [periodModal, setPeriodModal] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [openDay, setOpenDay] = useState(null);
  const year = lawyerYear;
  const weeks = data.list;
  const demoPeriod = { start: '2025-01-01', end: '2025-04-06' };
  const ops = useMemo(() => makeOps(setData, 'list'), []);
  const lawyerYears = useMemo(() => {
    const s = new Set();
    weeks.forEach((w) => w.days.forEach((d) => { if (period && d.iso >= period.start && d.iso <= period.end) s.add(d.yearN); }));
    return [...s].sort((a, b) => a - b);
  }, [weeks, period]);
  const lawyerStats = useMemo(() => {
    const days = weeks.flatMap((w) => w.days).filter((d) => period && d.iso >= period.start && d.iso <= period.end);
    const totalDays = days.length;
    const decided = days.filter((d) => d.worked || d.rest).length;
    const min = days.reduce((a, d) => a + dayMin(d), 0);
    return { totalDays, decided, min, pct: totalDays ? Math.round((decided / totalDays) * 100) : 0, complete: totalDays > 0 && decided === totalDays };
  }, [weeks, period]);
  const openDayObj = openDay ? (() => { const [wi, di] = openDay.split(':').map(Number); return weeks[wi] && weeks[wi].days[di] ? { d: weeks[wi].days[di], wi, di } : null; })() : null;
  const ctx = useMemo(() => {
    const jan = weeks.flatMap((w) => w.days).filter((d) => d.yearN === year && d.month === 0);
    const totalMin = jan.reduce((a, d) => a + dayMin(d), 0);
    const nightMin = jan.reduce((a, d) => a + (d.worked ? d.periods.filter(isOvernight).reduce((s, p) => s + periodMin(p), 0) : 0), 0);
    return { totalMin, overtimeMin: Math.max(0, totalMin - LEGAL_MONTH_MIN), nightMin, daysOver9: jan.filter((d) => dayMin(d) > 9 * 60).length, missingProof: jan.filter((d) => d.worked && d.attachments.length === 0).length };
  }, [weeks, year]);
  const applyPeriod = (start, end, mode) => {
    const sy = new Date(`${start}T00:00:00`).getFullYear();
    const key = `${start}|${end}`;
    if (mode === 'delegate') {
      setData({ list: buildLawyerWeeks(start, end, false) }); setLawyerPopulated(false); setLawyerBuiltFor(key); setLawyerYear(sy);
      setPeriod({ start, end }); setEditorOpen(true); setShareOpen(true);
    } else {
      if (key !== lawyerBuiltFor) { const populate = period ? lawyerPopulated : true; setData({ list: buildLawyerWeeks(start, end, populate) }); setLawyerPopulated(populate); setLawyerBuiltFor(key); setLawyerYear(sy); }
      setPeriod({ start, end }); setEditorOpen(true);
    }
    setPeriodModal(null);
  };

  // demo capture hook — `?demo=releve` opens the relevé grid directly (pixel-perfect Figma capture)
  useEffect(() => {
    try { if (new URLSearchParams(window.location.search).get('demo') === 'releve' && !period) applyPeriod('2025-01-01', '2026-10-23', 'log'); } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onBack = () => { if (navigate) navigate('/ui-kit'); else if (setCurrentPage) setCurrentPage('components'); };
  const openClient = () => { if (period) window.open(`/ui-kit/releve-heures?share=client&start=${period.start}&end=${period.end}`, '_blank'); };
  const openSalaire = () => { setSalaireOpen(true); setEditorOpen(false); };
  const openReleve = () => { setEditorOpen(true); setSalaireOpen(false); };
  const fmtEur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;

  // salaire de référence — computed from the bulletins de salaire (the 12 last gross months), most-favorable basis
  const BULLETINS = [
    { m: 'Juil. 2022', brut: 2300 }, { m: 'Août 2022', brut: 2300 }, { m: 'Sept. 2022', brut: 2300 },
    { m: 'Oct. 2022', brut: 2300 }, { m: 'Nov. 2022', brut: 2300 }, { m: 'Déc. 2022', brut: 4600 },
    { m: 'Janv. 2023', brut: 2300 }, { m: 'Févr. 2023', brut: 2300 }, { m: 'Mars 2023', brut: 2300 },
    { m: 'Avr. 2023', brut: 2350 }, { m: 'Mai 2023', brut: 2350 }, { m: 'Juin 2023', brut: 2350 },
  ];
  const moyOf = (arr) => arr.reduce((a, b) => a + b.brut, 0) / arr.length;
  const moy12 = moyOf(BULLETINS);
  const moy3 = moyOf(BULLETINS.slice(-3));
  const salaireFav = moy12 >= moy3 ? '12' : '3';

  // valuation — postes are derived from the intrants (salaire de réf, relevé)
  const salaireNum = Math.round(salaireBasis === '3' ? moy3 : moy12);
  const tauxHoraire = salaireNum / 151.67;
  const heures = lawyerStats.min / 60;
  const ANCIEN = 3;
  const ALL_POSTES = [
    { id: 'hs', acro: 'HS', label: 'Rappel d’heures supplémentaires', montant: Math.round(heures * tauxHoraire * 1.25), basis: 'Relevé d’heures × taux horaire, majoré +25 %', feeds: ['releve', 'salaire'] },
    { id: 'cphs', acro: 'CP', label: 'Congés payés sur heures supplémentaires', montant: Math.round(heures * tauxHoraire * 1.25 * 0.1), basis: '10 % du rappel d’heures', feeds: ['releve', 'salaire'] },
    { id: 'preavis', acro: 'PRÉA', label: 'Indemnité compensatrice de préavis', montant: Math.round(salaireNum * 2), basis: '2 mois × salaire de référence', feeds: ['salaire'] },
    { id: 'icp', acro: 'ICP', label: 'Indemnité compensatrice de congés payés', montant: Math.round(salaireNum * 1.5), basis: 'Solde CP × salaire de référence', feeds: ['salaire'] },
    { id: 'lic', acro: 'IL', label: 'Indemnité légale de licenciement', montant: Math.round(salaireNum * 0.25 * ANCIEN), basis: '¼ mois × ancienneté (3 ans)', feeds: ['salaire'] },
    { id: 'dscrs', acro: 'DI', label: 'Dommages-intérêts — licenciement sans cause réelle', montant: Math.round(salaireNum * 4), basis: '4 mois × salaire de référence', feeds: ['salaire'] },
    { id: 'td', acro: 'TD', label: 'Indemnité pour travail dissimulé', montant: Math.round(salaireNum * 6), basis: '6 mois × salaire de référence', feeds: ['salaire'] },
  ];
  const postes = ALL_POSTES.filter((p) => posteIds.includes(p.id));
  const absentPostes = ALL_POSTES.filter((p) => !posteIds.includes(p.id));
  const total = postes.reduce((a, p) => a + p.montant, 0);
  const tagPill = <Badge variant="secondary" size="sm" label="Intrant" style={{ background: INTRANT_BG, color: INTRANT, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }} />;

  // an « intrant » (input variable) row — inline icon + name + blue value badge + chevron, clickable to open (Figma CHIFFRAGE > LABOR)
  const intrantRow = (kind, last) => {
    const isSal = kind === 'salaire';
    const Icon = isSal ? DollarSign : Clock;
    const name = isSal ? 'Salaire de référence' : 'Relevé d’heures';
    const onOpen = isSal ? openSalaire : openReleve;
    const value = isSal ? fmtEur(salaireNum) : (period ? `${Math.round(lawyerStats.min / 60)} H` : null);
    return (
      <button key={kind} onClick={onOpen} className="group flex items-center w-full transition-colors" style={{ height: 56, background: WHITE, borderBottom: last ? 'none' : `1px solid ${LINE}`, border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
        <div className="flex items-center flex-1 min-w-0" style={{ gap: 10, padding: '0 12px 0 14px' }}>
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: INK2 }} strokeWidth={1.75} />
          <span className="truncate" style={{ fontSize: 14, color: INK }}>{name}</span>
        </div>
        <div className="flex items-center justify-end" style={{ width: 176, maxWidth: 176, padding: '0 12px' }}>
          {value
            ? <span className="inline-flex items-center rounded-md" style={{ padding: '2px 8px', background: INTRANT_BG, color: INTRANT, fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            : <span style={{ fontSize: 12.5, color: FAINT }}>À définir</span>}
        </div>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, paddingLeft: 12, paddingRight: 16 }}>
          <ChevronRight className="w-4 h-4" style={{ color: FAINT }} />
        </div>
      </button>
    );
  };

  // ── the postes (outputs) card — same pattern as the existing chiffrage ──
  // droit-social nomenclature categories (the chiffrage groups postes by category)
  const CATEGORIES = [
    { id: 'rappels', label: 'Rappels de salaire', ids: ['hs', 'cphs'] },
    { id: 'rupture', label: 'Indemnités de rupture', ids: ['preavis', 'icp', 'lic'] },
    { id: 'di', label: 'Dommages-intérêts', ids: ['dscrs', 'td'] },
  ];
  // shared chiffrage styles — mirror the real app chiffrage exactly (App.js colHeaderStyle / serifAmountStyle)
  const colHead = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 11, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };
  const serifAmt = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, letterSpacing: '-0.5px', fontWeight: 400, color: INK };
  const cardChrome = { border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' };
  // section title — 32px square (avatar / icon) + mono eyebrow + title (+ optional sub) + right slot.
  // shared by the « Salarié » (postes) header and the « Bases de calcul » (intrants) header.
  const sectionHead = ({ visual, eyebrow, title, sub, right }) => (
    <div className="flex items-center justify-between" style={{ padding: '0 6px', marginBottom: 16 }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        {visual}
        <div className="flex flex-col" style={{ gap: sub ? 4 : 5 }}>
          {eyebrow && <span style={{ ...colHead, lineHeight: '1' }}>{eyebrow}</span>}
          <span style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: '18px' }}>{title}</span>
          {sub && <span style={{ fontSize: 11.5, color: MUTE, lineHeight: '1.3' }}>{sub}</span>}
        </div>
      </div>
      {right}
    </div>
  );
  // a poste row — acro · label · montant · actions (mirrors the real chiffrage RowCalculation)
  const posteRow = (p, isLast) => (
    <div key={p.id} className="group flex items-center" style={{ height: 56, background: WHITE, borderBottom: isLast ? 'none' : `1px solid ${LINE}` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
      <div className="flex-shrink-0" style={{ width: 64, padding: '0 16px' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: MUTE, lineHeight: '16px' }}>{p.acro}</span>
      </div>
      <div className="flex-1 min-w-0" style={{ padding: '0 12px' }}>
        <span className="truncate block" style={{ fontSize: 14, fontWeight: 400, color: INK, lineHeight: '20px' }}>{p.label}</span>
      </div>
      <div className="flex items-center justify-end" style={{ width: 176, maxWidth: 176, padding: '0 12px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: '20px', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(p.montant)}</span>
      </div>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, paddingLeft: 12, paddingRight: 16 }}>
        <button onClick={() => setPosteIds((ids) => ids.filter((x) => x !== p.id))} title="Retirer le poste" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: FAINT, lineHeight: 0 }} onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = FAINT; }}><MoreVertical className="w-4 h-4" /></button>
      </div>
    </div>
  );
  // salarié subject header + postes grouped by category (the « output » side) — mirrors the real chiffrage
  const postesBlock = (
    <>
      {sectionHead({
        visual: <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 8, background: '#e9f1ea', color: '#4a7256', fontSize: 12, fontWeight: 600 }}>{MATTER.initials}</span>,
        eyebrow: 'Salarié',
        title: MATTER.client,
        right: <span style={serifAmt}>{fmtEur(total)}</span>,
      })}
      <div className="flex flex-col" style={{ gap: 16 }}>
        {CATEGORIES.map((cat) => {
          const rows = postes.filter((p) => cat.ids.includes(p.id));
          if (!rows.length) return null;
          return (
            <div key={cat.id} style={{ ...cardChrome, background: WHITE }}>
              <div className="flex items-center" style={{ height: 40, padding: '0 16px', borderBottom: `1px solid ${LINE}`, background: PAPER }}>
                <span className="flex-1" style={colHead}>{cat.label}</span>
                <div className="flex items-center justify-end" style={{ width: 176, maxWidth: 176, padding: '0 12px' }}>
                  <span style={{ ...colHead, fontSize: 10 }}>Montant demandé</span>
                </div>
                <div className="flex-shrink-0" style={{ width: 44 }} />
              </div>
              {rows.map((p, i) => posteRow(p, i === rows.length - 1))}
            </div>
          );
        })}
      </div>
      {/* dark grand-total bar — « Indemnisation total » (Figma CHIFFRAGE > LABOR) */}
      <div className="flex items-center justify-between" style={{ background: INK, borderRadius: 8, padding: '14px 16px', marginTop: 16, boxShadow: '0px 1px 2px rgba(26,26,26,0.05)' }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Calculator className="w-5 h-5" style={{ color: WHITE }} strokeWidth={1.75} />
          <span style={{ fontSize: 14, fontWeight: 500, color: WHITE }}>Indemnisation total</span>
        </div>
        <span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 24, fontWeight: 500, color: WHITE, letterSpacing: '-0.6px', lineHeight: '28px' }}>{fmtEur(total)}</span>
      </div>
    </>
  );

  // ── three directions for the intrant / poste distinction (intrants precede the postes) ──
  // OPTION « sections » — the intrants live in the chiffrage as a « Bases de calcul » card
  const intrantsCard = (
    <div style={{ marginBottom: 24 }}>
      {sectionHead({
        visual: <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 8, background: INTRANT_BG, border: `1px solid ${INTRANT_BORDER}` }}><SlidersHorizontal className="w-4 h-4" style={{ color: INTRANT }} /></span>,
        eyebrow: 'Variables',
        title: 'Fondamentaux et variables du chiffrage',
        right: <p style={{ fontSize: 12, color: MUTE, lineHeight: '16px', textAlign: 'right', maxWidth: 365, margin: 0 }}>Les variables d’entrée qui fournissent des données aux postes, mais qui ne sont pas cumulées dans le total global.</p>,
      })}
      <div style={{ ...cardChrome, background: WHITE }}>
        {intrants.map((k, i) => intrantRow(k, i === intrants.length - 1))}
      </div>
    </div>
  );
  // the chiffrage canvas — intrants as a section (option « sections ») OR a note pointing to the Dossier (option « dossier »)
  const chiffrageBody = (
    <>
      {direction === 'sections' ? intrantsCard : (
        <div className="rounded-lg flex items-center gap-2" style={{ border: `1px solid ${INTRANT}40`, background: INTRANT_BG, padding: '11px 14px', marginBottom: 16 }}>
          <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: INTRANT }} />
          <span style={{ fontSize: 12.5, color: '#4f5b6e', lineHeight: '17px' }}>Les <strong style={{ color: INTRANT }}>bases de calcul</strong> (salaire de référence, relevé d’heures) sont renseignées dans le <button onClick={() => setTab('dossier')} style={{ color: INTRANT, fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Dossier</button>.</span>
        </div>
      )}
      {postesBlock}
    </>
  );

  // ── Dossier (info) tab — flat stacked cards (body-injury layout, droit social) ──
  const dHead = (Icon, title) => (
    <div className="flex items-center gap-2.5" style={{ padding: '13px 16px', borderBottom: `1px solid ${LINE}`, background: WHITE }}>
      <Icon className="w-4 h-4" style={{ color: MUTE }} strokeWidth={1.5} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
  );
  const dField = (label, value) => (
    <div className="flex-1" style={{ padding: '16px 20px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? INK : FAINT, fontWeight: value ? 500 : 400, lineHeight: '19px' }}>{value || 'Non renseigné'}</div>
    </div>
  );
  const dRow = (a, b, last) => <div className="flex" style={last ? undefined : { borderBottom: `1px solid ${LINE}` }}>{a}{b}</div>;
  const dCard = (Icon, title, children) => (
    <div className="rounded-lg" style={{ border: `1px solid ${LINE}`, background: WHITE, boxShadow: '0 1px 2px rgba(26,26,26,0.04)', overflow: 'hidden' }}>{dHead(Icon, title)}{children}</div>
  );
  // reconstructed contract-history timeline (droit social) — Plato rebuilds it from the pièces; each event cites its source
  const contratTimelineCard = (() => {
    const events = [
      { date: '02/05/2020', title: 'Embauche', desc: 'CDI · poste de Cariste · statut Employée · 2 100 € brut mensuel.', src: 'Pièce 1 · Contrat de travail', dot: '#4a7256' },
      { date: '01/09/2021', title: 'Avenant n°1', desc: 'Passage en horaires postés (équipes 2×8).', src: 'Pièce 3 · Avenant', dot: MUTE },
      { date: 'Janv. 2022 → juin 2023', title: 'Heures supplémentaires non rémunérées', desc: 'Dépassements réguliers de l’amplitude journalière, reconstitués à partir des badges d’accès et des e-mails.', src: 'Relevé d’heures', dot: INTRANT, intrant: true },
      { date: '01/04/2023', title: 'Augmentation', desc: 'Salaire mensuel porté à 2 350 € brut.', src: 'Pièce 5 · Bulletins de salaire', dot: MUTE },
      { date: '15/06/2023', title: 'Entretien préalable', desc: 'Convocation à un entretien préalable au licenciement.', src: 'Pièce 10 · Convocation', dot: MUTE },
      { date: '30/06/2023', title: 'Licenciement', desc: 'Rupture du CDI notifiée (motif : insuffisance professionnelle).', src: 'Pièce 12 · Lettre de licenciement', dot: '#b4593f' },
      { date: '12/09/2023', title: 'Saisine du conseil de prud’hommes', desc: 'CPH de Nanterre · tentative de conciliation échouée.', src: 'Pièce 14 · Requête', dot: INK },
    ];
    return (
      <div className="rounded-lg" style={{ border: `1px solid ${LINE}`, background: WHITE, boxShadow: '0 1px 2px rgba(26,26,26,0.04)', overflow: 'hidden' }}>
        <div className="flex items-center gap-2.5" style={{ padding: '13px 16px', borderBottom: `1px solid ${LINE}`, background: WHITE }}>
          <CalendarClock className="w-4 h-4" style={{ color: MUTE }} strokeWidth={1.5} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chronologie du contrat</span>
          <span className="ml-auto" style={{ fontSize: 11, color: FAINT }}>Reconstituée à partir des pièces</span>
        </div>
        <div style={{ padding: '18px 20px 6px' }}>
          {events.map((e, i) => {
            const last = i === events.length - 1;
            return (
              <div key={i} className="flex" style={{ gap: 14 }}>
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 9, background: e.dot, marginTop: 3, flexShrink: 0 }} />
                  {!last && <span style={{ flex: 1, width: 2, background: LINE, marginTop: 3 }} />}
                </div>
                <div style={{ minWidth: 0, flex: 1, paddingBottom: last ? 12 : 18 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTE, letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{e.date}</div>
                  <div className="flex items-center gap-2" style={{ marginTop: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: '18px' }}>{e.title}</span>
                    {e.intrant && tagPill}
                  </div>
                  <div style={{ fontSize: 13, color: MUTE, marginTop: 3, lineHeight: '18px' }}>{e.desc}</div>
                  <span className="inline-flex items-center gap-1.5 rounded-md" style={{ marginTop: 8, padding: '3px 8px', background: SUBTLE, border: `1px solid ${LINE}`, fontSize: 11.5, color: INK2 }}>
                    <FileText className="w-3 h-3 flex-shrink-0" style={{ color: FAINT }} /> {e.src}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  })();
  const renderDossier = () => (
    <div className="flex flex-col" style={{ gap: 16, maxWidth: 960, margin: '0 auto' }}>
      {dCard(User, 'Salarié', <>
        {dRow(dField('Nom', 'Aubert'), dField('Prénom', 'Camille'))}
        {dRow(dField('Sexe', 'Féminin'), dField('Date de naissance', <span className="inline-flex items-center gap-2">14/03/1989 <span style={{ width: 4, height: 4, borderRadius: 2, background: '#d9d9d9' }} /> <span style={{ color: MUTE, fontWeight: 400 }}>35 ans</span></span>))}
        {dRow(dField('Poste occupé', 'Cariste'), dField('Ancienneté', '3 ans · 2 mois'), true)}
      </>)}
      {dCard(Briefcase, 'Relation de travail', <>
        {dRow(dField('Type de contrat', 'CDI'), dField('Date d’embauche', '02/05/2020'))}
        {dRow(dField('Fin du contrat', '30/06/2023'), dField('Motif de la rupture', 'Licenciement'))}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>Résumé des faits</div>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: '19px' }}>Heures supplémentaires accomplies et non rémunérées, dépassement régulier de l’amplitude journalière ; horaires reconstitués à partir des badges d’accès et des e-mails.</div>
        </div>
        <div className="flex items-center gap-2" style={{ padding: '13px 20px' }}>
          <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: INTRANT }} />
          <span style={{ fontSize: 13, color: MUTE }}>Salaire mensuel de référence</span>{tagPill}
          <span className="ml-auto inline-flex items-center gap-2">
            <span style={{ fontSize: 14, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(salaireNum)}</span>
            <Button variant="outline" size="sm" icon={ArrowUpRight} label="Ouvrir le détail" onClick={openSalaire} />
          </span>
        </div>
      </>)}
      {contratTimelineCard}
      {direction === 'dossier' && (
        <div className="rounded-lg" style={{ border: `1px solid ${INTRANT}40`, background: WHITE, boxShadow: '0 1px 2px rgba(26,26,26,0.04)', overflow: 'hidden' }}>
          <div className="flex items-center gap-2.5" style={{ padding: '13px 16px', borderBottom: `1px solid ${INTRANT}33`, background: INTRANT_BG }}>
            <Clock className="w-4 h-4" style={{ color: INTRANT }} strokeWidth={1.5} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: INTRANT, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suivi des heures</span>{tagPill}
          </div>
          {intrantRow('releve', true)}
        </div>
      )}
      {dCard(Building2, 'Employeur', <>
        {dRow(dField('Société', MATTER.adverse), dField('Forme', 'SAS'))}
        {dRow(dField('Convention collective', 'Transport routier'), dField('Effectif', '120 salariés'), true)}
      </>)}
      {dCard(Scale, 'Procédure', <>
        {dRow(dField('Juridiction', MATTER.juridiction), dField('Stade', 'Bureau de jugement'))}
        {dRow(dField('Objet', MATTER.objet), <div className="flex-1" />, true)}
      </>)}
      {dCard(FileText, 'Faits et procédure', (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: MUTE, marginBottom: 5 }}>Commentaire</div>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: '19px' }}>Saisine du conseil de prud’hommes le 12/09/2023 ; tentative de conciliation échouée. Demande principale : rappel d’heures supplémentaires et indemnités afférentes.</div>
        </div>
      ))}
    </div>
  );

  // ── « Salaire de référence » page — opens IN PLACE like the relevé (tabs + chat stay) ──
  // the intrant is its own surface: the bulletins de salaire (documents) + the moyenne that yields the reference salary
  const renderSalairePage = () => (
    <>
      <div className="flex items-center px-7 flex-shrink-0" style={{ height: 56, gap: 14, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
        <button onClick={() => setSalaireOpen(false)} className="inline-flex items-center gap-1.5 rounded-md transition-colors" style={{ height: 32, padding: '0 10px 0 7px', fontSize: 13, color: INK2, border: `1px solid ${LINE}`, background: 'transparent', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
          <ChevronLeft className="w-4 h-4" /> {tab === 'dossier' ? 'Dossier' : 'Chiffrage'}
        </button>
        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>Salaire de référence</span>{tagPill}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          {/* retained reference salary + the two bases */}
          <div style={{ ...cardChrome, background: WHITE, marginBottom: 20 }}>
            <div className="flex items-center" style={{ height: 40, padding: '0 16px', background: PAPER, borderBottom: `1px solid ${LINE}` }}>
              <span className="flex-1" style={colHead}>Salaire de référence retenu</span>
              <span style={{ fontSize: 11, color: MUTE }}>base la plus favorable au salarié</span>
            </div>
            <div className="flex items-stretch">
              <div className="flex flex-col justify-center flex-shrink-0" style={{ padding: '18px 22px', borderRight: `1px solid ${LINE}`, minWidth: 210 }}>
                <span style={{ ...serifAmt, fontSize: 30 }}>{fmtEur(salaireNum)}</span>
                <span style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>brut mensuel · moyenne {salaireBasis === '3' ? 'sur 3 mois' : 'sur 12 mois'}</span>
              </div>
              <div className="flex-1 flex">
                {[['12', '12 derniers mois', moy12], ['3', '3 derniers mois', moy3]].map(([k, label, val]) => {
                  const active = salaireBasis === k;
                  return (
                    <button key={k} onClick={() => setSalaireBasis(k)} className="flex-1 flex flex-col justify-center transition-colors" style={{ padding: '14px 18px', borderRight: k === '12' ? `1px solid ${LINE}` : 'none', borderLeft: `3px solid ${active ? INTRANT : 'transparent'}`, background: active ? INTRANT_BG : WHITE, cursor: 'pointer', textAlign: 'left' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ ...colHead, color: active ? INTRANT : MUTE }}>{label}</span>
                        {salaireFav === k && <Badge variant="secondary" size="sm" label="Le plus favorable" style={{ background: INTRANT_BG, color: INTRANT, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }} />}
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 600, color: INK, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(val)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* bulletins de salaire — the source documents */}
          <div style={{ ...cardChrome, background: WHITE, marginBottom: 14 }}>
            <div className="flex items-center" style={{ height: 40, padding: '0 16px', background: PAPER, borderBottom: `1px solid ${LINE}` }}>
              <span className="flex-1" style={colHead}>Bulletins de salaire</span>
              <div className="flex items-center justify-end" style={{ width: 140, padding: '0 12px' }}><span style={{ ...colHead, fontSize: 10 }}>Brut</span></div>
              <div className="flex-shrink-0" style={{ width: 44 }} />
            </div>
            {BULLETINS.map((b, i) => (
              <div key={b.m} className="group flex items-center" style={{ height: 48, background: WHITE, borderBottom: i === BULLETINS.length - 1 ? 'none' : `1px solid ${LINE}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
                <div className="flex items-center flex-1 min-w-0" style={{ padding: '0 16px', gap: 10 }}>
                  <span className="inline-flex items-center justify-center rounded-md flex-shrink-0" style={{ width: 28, height: 28, background: PAPER, border: `1px solid ${LINE}` }}><FileText className="w-3.5 h-3.5" style={{ color: MUTE }} /></span>
                  <span className="flex-shrink-0" style={{ fontSize: 13.5, color: INK }}>{b.m}</span>
                  <span className="truncate" style={{ fontSize: 11.5, color: FAINT }}>Bulletin de paie.pdf</span>
                </div>
                <div className="flex items-center justify-end" style={{ width: 140, padding: '0 12px' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(b.brut)}</span>
                </div>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44 }}>
                  <button title="Options" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: FAINT, lineHeight: 0 }} onMouseEnter={(e) => { e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { e.currentTarget.style.color = FAINT; }}><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div style={{ padding: 12, borderTop: `1px solid ${LINE}` }}>
              <DropZone variant="inline" label="Glisser des bulletins de salaire (PDF) ou cliquer pour parcourir" />
            </div>
          </div>

          <p style={{ fontSize: 12, color: MUTE, margin: 0, lineHeight: '17px' }}>La moyenne sur 12 mois intègre les primes (13e mois, prime annuelle) au prorata. Le salaire de référence retenu est la moyenne la plus favorable au salarié (art. R. 1234-4 du Code du travail).</p>
        </div>
      </div>
    </>
  );

  const PL_TABS = [
    { id: 'dossier', label: 'Dossier', Icon: Folder },
    { id: 'chiffrage', label: 'Chiffrage', Icon: Calculator },
    { id: 'pieces', label: 'Pièces', Icon: FileText },
    { id: 'actes', label: 'Actes', Icon: Pencil },
    { id: 'jp', label: 'Jurisprudence', Icon: Scale },
  ];

  return (
    <div className="h-screen flex" style={{ background: PAPER, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      {/* left column: exploration meta-bar + matter shell — the PLATO chat is a full-height sibling on the right */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
      {/* meta bar — exploration control (not part of the product) */}
      <div className="flex items-center px-4 flex-shrink-0" style={{ height: 44, gap: 12, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
        <button onClick={onBack} className="flex items-center justify-center rounded-lg transition-colors" title="Retour à UI Components" style={{ width: 30, height: 30, border: `1px solid ${LINE}`, background: WHITE }}
          onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = WHITE; }}>
          <Home className="w-4 h-4" style={{ color: MUTE }} />
        </button>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chiffrage Droit social · exploration</span>
        <div className="ml-auto flex items-center gap-2.5">
          <span style={{ fontSize: 11.5, color: FAINT }}>Où placer le relevé</span>
          <div className="inline-flex items-center rounded-lg p-1" style={{ background: CREAM }}>
            {[['sections', 'Sections (chiffrage)'], ['dossier', 'Dossier · widget']].map(([v, label]) => (
              <button key={v} onClick={() => { setDirection(v); setTab(v === 'dossier' ? 'dossier' : 'chiffrage'); setEditorOpen(false); setSalaireOpen(false); }} className="rounded-md transition-all" style={{ height: 26, padding: '0 11px', fontSize: 12, fontWeight: 500, color: direction === v ? INK : MUTE, background: direction === v ? WHITE : 'transparent', boxShadow: direction === v ? '0px 1px 3px rgba(26,26,26,0.08)' : 'none', border: 'none', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* matter tab nav (kept across the chiffrage + the relevé sub-view) */}
      <div className="flex items-stretch px-4 flex-shrink-0" style={{ height: 56, borderBottom: `1px solid ${LINE}`, background: WHITE }}>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: '#dbeafe', color: '#1e3a8a', fontSize: 11.5, fontWeight: 600 }}>{MATTER.initials}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, lineHeight: '15px' }}>{MATTER.client}</div>
            <div className="truncate" style={{ fontSize: 11, color: MUTE, lineHeight: '14px', maxWidth: 240 }}>c/ {MATTER.adverse}</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full" style={{ height: 22, padding: '0 9px', background: CREAM, color: INK2, fontSize: 11.5, fontWeight: 600, marginLeft: 4 }}><Scale className="w-3 h-3" /> Droit social</span>
        </div>
        <nav className="flex-1 flex items-stretch justify-center gap-0.5">
          {PL_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="relative inline-flex items-center gap-1.5 px-3.5 transition-colors" style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? INK : MUTE, background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = INK; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = MUTE; }}>
                <t.Icon className="w-4 h-4" style={{ color: active ? INK : FAINT }} /> {t.label}
                {active && <span className="absolute" style={{ left: 8, right: 8, bottom: -1, height: 2, background: INK, borderRadius: 2 }} />}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center flex-shrink-0" style={{ width: 36, justifyContent: 'flex-end' }}>
          {!chatOpen && (
            <button onClick={() => setChatOpen(true)} title="Ouvrir Plato" className="flex items-center justify-center rounded-md transition-colors" style={{ width: 32, height: 32 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <MessageSquare className="w-4 h-4" style={{ color: MUTE }} />
            </button>
          )}
        </div>
      </div>

      {/* content (left) + PLATO chat (right) — tabs above stay visible in every view */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {salaireOpen ? renderSalairePage() : editorOpen ? (
            /* relevé sub-view — opens IN PLACE like a préjudice detail (tabs + chat stay) */
            <>
              <div className="flex items-center px-7 flex-shrink-0" style={{ height: 56, gap: 14, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
                <button onClick={() => setEditorOpen(false)} className="inline-flex items-center gap-1.5 rounded-md transition-colors" style={{ height: 32, padding: '0 10px 0 7px', fontSize: 13, color: INK2, border: `1px solid ${LINE}`, background: 'transparent', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <ChevronLeft className="w-4 h-4" /> {tab === 'dossier' ? 'Dossier' : 'Chiffrage'}
                </button>
                <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>Relevé d'heures</span>{tagPill}
                </div>
                {period && <div className="ml-auto"><SharePopover open={shareOpen} onOpenChange={setShareOpen} onOpenClient={openClient} /></div>}
              </div>
              {period ? (
              <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>
                <div className="flex items-center" style={{ position: 'sticky', top: 0, zIndex: 5, background: PAPER, paddingTop: 2, paddingBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT, marginRight: 10, flexShrink: 0 }}>Période</span>
                  <button onClick={() => setPeriodModal('log')} title="Modifier la période" className="inline-flex items-center gap-2 rounded-lg transition-colors" style={{ height: 34, padding: '0 10px 0 12px', background: CREAM, fontSize: 13, border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e4e1da'; }} onMouseLeave={(e) => { e.currentTarget.style.background = CREAM; }}>
                    <CalendarRange className="w-3.5 h-3.5" style={{ color: MUTE }} />
                    <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtDateNum(period.start)} → {fmtDateNum(period.end)}</span>
                    <span style={{ color: MUTE }}>· {daysBetween(period.start, period.end)} j</span>
                    <Pencil className="w-3.5 h-3.5" style={{ color: MUTE, marginLeft: 2 }} />
                  </button>
                  <div className="ml-auto flex items-center" style={{ gap: 16 }}>
                    {lawyerYears.length > 1 && (() => { const ym = weeks.reduce((a, w) => a + w.days.filter((d) => d.yearN === year && period && d.iso >= period.start && d.iso <= period.end).reduce((s, d) => s + dayMin(d), 0), 0); return <span style={{ fontSize: 12.5, color: MUTE, whiteSpace: 'nowrap' }}>Total période <strong style={{ fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(lawyerStats.min)}</strong> · {year} <strong style={{ fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtHM(ym)}</strong></span>; })()}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {lawyerStats.complete ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#3f7d5f' }} /> : <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: FAINT }}>Complété</span>}
                      <div style={{ width: 84, height: 6, borderRadius: 99, background: CREAM, overflow: 'hidden' }}><div style={{ width: `${lawyerStats.pct}%`, height: '100%', borderRadius: 99, background: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, transition: 'width .35s ease' }} /></div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: lawyerStats.complete ? '#3f7d5f' : ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{lawyerStats.pct}%</span>
                    </div>
                    {lawyerYears.length > 1 && <YearDropdown years={lawyerYears} value={year} onChange={setLawyerYear} />}
                  </div>
                </div>
                <RegistreView weeks={weeks} year={year} ops={ops} openDay={openDay} onOpenDay={setOpenDay} start={period.start} end={period.end} />
              <ReleveNotesJP />
              </div>
              ) : (
              <div className="flex-1 flex items-center justify-center rh-fade" style={{ padding: 40 }}>
                <div className="flex flex-col items-center text-center" style={{ gap: 14, maxWidth: 420 }}>
                  <span className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 9999, background: INTRANT_BG, border: `1px solid ${INTRANT_BORDER}` }}><Clock className="w-6 h-6" style={{ color: INTRANT }} strokeWidth={1.5} /></span>
                  <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 18, fontWeight: 500, color: INK, margin: 0 }}>Définir la période du relevé</p>
                  <p style={{ fontSize: 13.5, color: MUTE, lineHeight: '19px', margin: 0 }}>Indiquez la période travaillée par {MATTER.client}, puis saisissez les heures vous-même ou déléguez la saisie au client.</p>
                  <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                    <Button variant="primary" size="md" icon={Clock} label="Définir la période" onClick={() => setPeriodModal('log')} />
                    <Button variant="outline" size="md" icon={Send} label="Déléguer au client" onClick={() => setPeriodModal('delegate')} />
                  </div>
                </div>
              </div>
              )}
            </>
          ) : tab === 'dossier' ? (
            <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>{renderDossier()}</div>
          ) : tab === 'chiffrage' ? (
            /* chiffrage */
            <>
              <div className="flex items-center px-7 flex-shrink-0 relative" style={{ height: 56, gap: 12, background: WHITE, borderBottom: `1px solid ${LINE}` }}>
                <span className="inline-flex items-center gap-2 rounded-lg" style={{ height: 30, padding: '0 12px', background: CREAM }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: INK, letterSpacing: '0.01em' }}>Total demandé</span>
                  <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, fontWeight: 400, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtEur(total)}</span>
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="md" icon={Download} label="Exporter" />
                  <Button variant="primary" size="md" icon={Plus} label="Nouveau poste" onClick={() => setAddPoste((o) => !o)} />
                </div>
                {addPoste && (
                  <div className="absolute rh-pop rounded-lg" style={{ right: 28, top: 50, minWidth: 340, background: WHITE, border: `1px solid ${LINE}`, boxShadow: '0 8px 24px rgba(26,26,26,0.14)', padding: 4, zIndex: 30 }}>
                    {absentPostes.map((p) => (
                      <button key={p.id} onClick={() => { setPosteIds((ids) => [...ids, p.id]); setAddPoste(false); }} className="w-full text-left rounded-md transition-colors flex items-center gap-2" style={{ padding: '8px 9px', background: 'transparent', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <span style={{ width: 44, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, color: MUTE }}>{p.acro}</span>
                        <span style={{ fontSize: 13, color: INK }}>{p.label}</span>
                      </button>
                    ))}
                    {!absentPostes.length && <div style={{ padding: '8px 9px', fontSize: 12, color: FAINT }}>Tous les postes sont présents.</div>}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto rh-scroll" style={{ padding: '24px 28px 64px' }}>
                <div style={{ maxWidth: 920, margin: '0 auto' }}>
                  {chiffrageBody}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center rh-fade" style={{ padding: 40 }}>
              <div className="flex flex-col items-center text-center" style={{ gap: 12, maxWidth: 380 }}>
                <span className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 9999, background: '#eeece6', border: '1px solid #d6d3d1' }}>
                  {(PL_TABS.find((t) => t.id === tab) || {}).Icon && React.createElement((PL_TABS.find((t) => t.id === tab)).Icon, { className: 'w-6 h-6', style: { color: '#78716c' }, strokeWidth: 1.5 })}
                </span>
                <p style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 18, fontWeight: 500, color: INK, margin: 0 }}>{(PL_TABS.find((t) => t.id === tab) || {}).label}</p>
                <p style={{ fontSize: 13.5, color: MUTE, lineHeight: '19px', margin: 0 }}>Hors périmètre de cette maquette.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      {chatOpen && <ChatPanel ctx={ctx} onClose={() => setChatOpen(false)} />}

      {/* day drawer — overlays (the relevé sub-view opens days here) */}
      {editorOpen && openDayObj && (
        <DayDrawer day={openDayObj.d} wi={openDayObj.wi} di={openDayObj.di} week={weeks[openDayObj.wi]} ops={ops} onClose={() => setOpenDay(null)} start={period.start} end={period.end} />
      )}

      {/* shared period dialog */}
      {periodModal && (
        <PeriodModal mode={periodModal}
          modify={periodModal === 'log' && !!period}
          hasEntries={weeks.some((w) => w.days.some((d) => d.worked))}
          defaultStart={period ? period.start : demoPeriod.start}
          defaultEnd={period ? period.end : demoPeriod.end}
          onClose={() => setPeriodModal(null)}
          onSubmit={({ start, end }) => applyPeriod(start, end, periodModal)} />
      )}
    </div>
  );
}
