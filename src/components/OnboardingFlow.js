import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Check, ChevronDown, Clock, Lock, Loader2, ShieldCheck, Sparkles, CreditCard, X } from 'lucide-react';
import { PRICING_PLANS, PLAN_BY_ID, fmtEur } from '../data/pricing';
import LicencePicker from './billing/LicencePicker';

// ───────────────────────────────────────────────────────────────────────────
// OnboardingFlow - first-run experience for a newly provisioned account.
//
// Accounts are created back-office by the founders, so there is NO self-serve
// account creation. The user logs in with issued credentials and lands here the
// first time. As the cabinet admin they: (1) pick their own licence, (2) add
// extra licences for collaborators (each with a plan) and see a recap, then
// (3) launch a Stripe-style payment modal layered over the flow. Once payment
// clears, an end step drops them into Plato (the dossiers home).
//
// The 7-day trial TIMELINE lives in a PERSISTENT rail on the RIGHT, visible on
// every step (except login).
//
// Reuses the settings billing components (single source of truth): the pricing
// model + LicencePicker (invite modal), LicenceSummaryCard ("Plan et
// facturation" forfait table), PlanFeatureList ("Inclus dans chaque licence")
// and WeeklyUsageCard ("Mon usage" gauge).
//
// Steps: login -> licence (own) -> team (licences + recap + pay) -> done.
// onEnter() flips the app into trial mode and routes to '/'. Invitations are
// prototype-visual only.
// ───────────────────────────────────────────────────────────────────────────

const TRIAL_DAYS = 7;
const REDIRECT_SECONDS = 5; // done step auto-launches into Plato after this

// ── Tokens (aligned with src/design-system/tokens.js) ──
const C = {
  canvas: '#f8f7f5',
  surface: '#ffffff',
  cream: '#eeece6',
  fg: '#292524',
  fgStrong: '#1c1917',
  fg2: '#78716c',
  fg3: '#57534e',
  muted: '#a8a29e',
  border: '#e7e5e3',
  borderStrong: '#d6d3d1',
  blue: '#1e3a8a',
  blueBg: '#eef3fa',
  blueBorder: '#d7e2f2',
};
const SERIF = "'RL Para Trial Central', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// Shared dark side-panel language (brand hero + trial timeline use the same
// shell so the onboarding reads as one continuous surface, left panel throughout).
const D = {
  bg: `linear-gradient(165deg, ${'#1c1917'} 0%, #262220 62%, #302b28 100%)`,
  head: '#faf9f7',
  title: '#f5f3f0',
  body: 'rgba(255,255,255,0.6)',
  muted: 'rgba(255,255,255,0.42)',
  line: 'rgba(255,255,255,0.1)',
  tile: 'rgba(255,255,255,0.07)',
  tileBorder: 'rgba(255,255,255,0.1)',
  accent: '#b8cdec',
  accentBg: 'rgba(184,205,236,0.12)',
  accentBorder: 'rgba(184,205,236,0.25)',
};
const PANEL_WIDTH = 468;
const panelShell = { width: PANEL_WIDTH, padding: '48px 48px', background: D.bg };

const eyebrow = { fontFamily: MONO, fontSize: 10.5, fontWeight: 500, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' };
const emailRe = /\S+@\S+\.\S+/;

// Plato logo mark (rounded-square temple glyph). Source: PlatoIcon in App.js.
function PlatoIcon({ size = 28, color = C.fgStrong }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M73.5996 0C75.8398 0 76.9608 -0.000427067 77.8164 0.435547C78.5689 0.819016 79.181 1.43109 79.5645 2.18359C80.0004 3.03924 80 4.16018 80 6.40039V73.5996C80 75.8398 80.0004 76.9608 79.5645 77.8164C79.181 78.5689 78.5689 79.181 77.8164 79.5645C76.9608 80.0004 75.8398 80 73.5996 80H55L53 70H57V62H23V70H27L25 80H6.40039C4.16018 80 3.03924 80.0004 2.18359 79.5645C1.43109 79.181 0.819016 78.5689 0.435547 77.8164C-0.000427067 76.9608 0 75.8398 0 73.5996V6.40039C0 4.16018 -0.000427067 3.03924 0.435547 2.18359C0.819016 1.43109 1.43109 0.819016 2.18359 0.435547C3.03924 -0.000427067 4.16018 0 6.40039 0H73.5996ZM28.916 39.083L21 32L15 36L26 56H54L65 36L59 32L51.083 39.083L40 28L28.916 39.083ZM33 17L40 24L47 17L40 10L33 17Z" fill={color} />
    </svg>
  );
}

function PlatoMark({ size = 28, color = C.fgStrong, wordColor = C.fgStrong }) {
  return (
    <div className="flex items-center gap-2.5">
      <PlatoIcon size={size} color={color} />
      <span style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 500, color: wordColor, letterSpacing: '-0.4px' }}>Plato</span>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, full, icon: Icon = ArrowRight }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-[14px] font-medium transition-all ${full ? 'w-full' : ''}`}
      style={{
        background: disabled ? C.borderStrong : C.fg,
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        boxShadow: disabled ? 'none' : '0 1px 2px rgba(41,37,36,0.18)',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#1c1917'; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = C.fg; }}
    >
      {children}
      {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span style={{ fontSize: 12.5, fontWeight: 500, color: C.fg3 }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: C.muted }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
  border: `1px solid ${C.border}`, background: C.surface, fontSize: 14, color: C.fg,
  fontFamily: SANS, outline: 'none', transition: 'border-color 120ms, box-shadow 120ms',
};
function TextInput(props) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...(props.style || {}) }}
      onFocus={(e) => { e.currentTarget.style.borderColor = C.fg; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.cream}`; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

// Accordion section for the merged plan step. Single-open; a collapsed row
// shows its summary and a chevron.
function AccordionRow({ n, title, optional, open, summary, onToggle, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${open ? C.borderStrong : C.border}`, background: C.surface, boxShadow: open ? '0 2px 8px rgba(41,37,36,0.06)' : 'none', transition: 'box-shadow 150ms' }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 text-left" style={{ height: 52 }}>
        <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, fontSize: 11, fontWeight: 600, fontFamily: MONO, background: open ? C.fg : C.cream, color: open ? '#fff' : C.fg2 }}>{n}</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.fg }}>{title}</span>
        {optional && <span style={{ fontSize: 11.5, color: C.muted }}>· optionnel</span>}
        <div className="ml-auto flex items-center gap-2.5 min-w-0">
          {!open && summary && <span className="truncate" style={{ fontSize: 12.5, color: C.fg2, maxWidth: 260 }}>{summary}</span>}
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} strokeWidth={2} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// Compact plan dropdown - one per collaborator licence row. Revealed only once
// an email is entered (email-first), so empty rows stay clean. Pro is default;
// includeFree adds a "lecture seule" (view-only, gratuit) option. The at-a-glance
// price/usage comparison lives in PlanLegend above the rows.
function PlanDropdown({ value, onChange, includeFree = false, height = 38 }) {
  const [open, setOpen] = useState(false);
  const opts = [
    ...PRICING_PLANS.map((p) => ({ id: p.id, name: p.name, price: `${p.monthly} €/m`, usage: p.usage })),
    ...(includeFree ? [{ id: null, name: 'Lecture seule', price: 'Gratuit', usage: 'Consultation, sans agent IA' }] : []),
  ];
  const current = opts.find((o) => o.id === value) || opts[0];
  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-1.5 rounded-lg px-3 transition-colors"
        style={{ height, minWidth: 118, border: `1px solid ${open ? C.borderStrong : C.border}`, background: C.surface, fontSize: 13, fontWeight: 500, color: value === null ? C.fg2 : C.fg }}
      >
        <span className="truncate">{current.name}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1.5 rounded-xl overflow-hidden" style={{ width: 244, background: C.surface, border: `1px solid ${C.borderStrong}`, boxShadow: '0 8px 24px rgba(41,37,36,0.12)' }}>
            {opts.map((o, i) => {
              const on = o.id === value;
              return (
                <button
                  key={o.id ?? 'free'}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-cream"
                  style={{ background: on ? C.cream : 'transparent', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}
                >
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 15, height: 15, marginTop: 1 }}>
                    {on && <Check className="w-3.5 h-3.5" style={{ color: C.fg }} strokeWidth={2.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{o.name}</span>
                      <span className="tabular-nums flex-shrink-0" style={{ fontSize: 11.5, color: C.fg2 }}>{o.price}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.fg2, marginTop: 1 }}>{o.usage}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Always-on price + usage reminder for each plan (compact, above the rows).
function PlanLegend() {
  return (
    <div className="grid grid-cols-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
      {PRICING_PLANS.map((p, i) => (
        <div key={p.id} className="px-3 py-2.5" style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : 'none' }}>
          <div className="flex items-baseline justify-between gap-1">
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.fg }}>{p.name}</span>
            <span className="tabular-nums" style={{ fontSize: 11.5, color: C.fg2 }}>{p.monthly} €<span style={{ color: C.muted }}>/m</span></span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.fg3, marginTop: 3 }}>{p.usage}</div>
          <div style={{ fontSize: 10.5, color: C.fg2, lineHeight: '14px', marginTop: 1 }}>{p.usageDesc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Persistent RIGHT rail: the 7-day trial as an always-visible timeline ──
// Branded hero panel shown alongside the login step. Carries the pitch: a
// litigation-SPECIALIST AI (not a generalist chatbot), built around three
// contentieux domains - the "trois terrains de jeu" from the landing page.
// Dark stone so the cream form beside it reads as the bright focal area.
function BrandPanel() {
  const domains = ['Dommage corporel', 'Contentieux social', 'Directions juridiques'];
  return (
    <div
      className="hidden lg:flex flex-col flex-shrink-0 relative overflow-hidden"
      style={panelShell}
    >
      {/* Soft top-light so the panel doesn't read as flat black */}
      <div className="absolute pointer-events-none" style={{ top: -160, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)' }} />

      {/* Chess engraving (from plato.legal) - the "coup d'avance" emblem */}
      <img
        src="/brand/chess-hand-right.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ right: -8, bottom: 0, width: 360, opacity: 0.6 }}
      />

      <div className="relative flex-1 flex flex-col justify-center" style={{ maxWidth: 320 }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
          L'IA des cabinets de contentieux
        </div>
        <h2 style={{ fontFamily: SERIF, fontSize: 33, fontWeight: 500, color: '#faf9f7', letterSpacing: '-0.6px', lineHeight: '40px', marginBottom: 14 }}>
          Spécialisée dans<br />vos contentieux.
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: '22px' }}>
          Pas un assistant généraliste. Une IA experte de vos dossiers, du premier acte au chiffrage des indemnités.
        </p>

        <div className="mt-7" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12 }}>
            Trois terrains de jeu
          </div>
          <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <span key={d} className="rounded-full" style={{ fontSize: 12, fontWeight: 500, color: '#f5f3f0', padding: '5px 11px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-2 mt-auto pt-10" style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)' }}>
        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
        Confidentialité avocat-client préservée
      </div>
    </div>
  );
}

function TimelineRail({ billingDate, started }) {
  const nodes = [
    { tag: 'Aujourd’hui', title: started ? 'Votre essai a démarré' : 'Votre essai démarre', body: "Accès complet immédiat à tout Plato. Aucun montant prélevé.", icon: Sparkles, now: true },
    { tag: 'Jour 7', title: "Dernier jour de l'essai", body: 'Annulable sans frais depuis Réglages.', icon: ShieldCheck },
    { tag: 'Jour 8', title: "L'abonnement démarre", body: `Premier prélèvement le ${billingDate}.`, icon: CreditCard },
  ];
  return (
    <div
      className="hidden lg:flex flex-col flex-shrink-0 relative overflow-hidden"
      style={panelShell}
    >
      {/* Soft top-light, matches the brand panel */}
      <div className="absolute pointer-events-none" style={{ top: -160, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)' }} />

      {/* Chess engraving - keeps the brand motif on the post-login panel */}
      <img
        src="/brand/chess-hand-right.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ right: -8, bottom: 0, width: 360, opacity: 0.5 }}
      />

      <div className="relative flex-1 flex flex-col justify-center">
        <div
          className="inline-flex items-center gap-1.5 mb-6 px-2.5 py-1 rounded-full self-start"
          style={{ background: D.accentBg, border: `1px solid ${D.accentBorder}` }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: D.accent }} strokeWidth={2} />
          <span style={{ fontSize: 12, fontWeight: 600, color: D.accent }}>Essai gratuit de {TRIAL_DAYS} jours</span>
        </div>

        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: D.head, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Votre essai, jour par jour
        </div>
        <p style={{ fontSize: 13, color: D.body, lineHeight: '19px', marginBottom: 22 }}>
          Sans engagement. Vous gardez la main du premier au dernier jour.
        </p>

        {/* 7-day progress bar */}
        <div className="flex items-center gap-2.5 mb-7">
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, color: D.muted, letterSpacing: '0.08em' }}>J1</span>
          <div className="flex flex-1" style={{ gap: 3 }}>
            {Array.from({ length: TRIAL_DAYS }, (_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 999, backgroundColor: i === 0 ? '#fff' : 'rgba(255,255,255,0.18)' }} />
            ))}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, color: D.muted, letterSpacing: '0.08em' }}>J7</span>
        </div>

        {/* Dotted timeline */}
        <div>
          {nodes.map((t, i) => {
            const last = i === nodes.length - 1;
            return (
              <div key={t.tag} className="flex gap-3.5">
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 28, height: 28,
                      background: t.now ? '#fff' : D.tile,
                      border: `1.5px solid ${t.now ? '#fff' : D.tileBorder}`,
                      boxShadow: t.now ? `0 0 0 4px rgba(255,255,255,0.12)` : 'none',
                    }}
                  >
                    <t.icon className="w-3.5 h-3.5" style={{ color: t.now ? C.fgStrong : D.muted }} strokeWidth={2} />
                  </div>
                  {!last && (
                    <div className="flex-1" style={{ width: 2, minHeight: 20, margin: '4px 0', borderRadius: 999, background: i === 0 ? 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.18) 100%)' : 'rgba(255,255,255,0.18)' }} />
                  )}
                </div>
                <div style={{ paddingBottom: last ? 0 : 16, paddingTop: 1 }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: t.now ? D.accent : D.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.tag}</span>
                    {t.now && (
                      <span className="px-1.5 py-px rounded-full" style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, color: D.accent, background: D.accentBg, border: `1px solid ${D.accentBorder}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {started ? 'Vous êtes ici' : 'Point de départ'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: D.title }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: D.body, lineHeight: '17px', marginTop: 2 }}>{t.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center gap-2 mt-auto pt-10" style={{ fontSize: 12, color: D.muted }}>
        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
        Chiffré et hébergé en France
      </div>
    </div>
  );
}

// Onboarding progress (after login). Payment is a modal, but it earns its own
// stage so the user knows it's coming; `activeIndex` is driven explicitly.
const STAGES = [
  { key: 'plan', label: 'Licences' },
  { key: 'pay',  label: 'Paiement' },
  { key: 'done', label: 'Prêt' },
];
function Stepper({ activeIndex }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STAGES.map((s, i) => {
        const done = i < activeIndex, active = i === activeIndex;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 22, height: 22, fontSize: 11, fontWeight: 600, fontFamily: MONO,
                  background: done ? C.fg : active ? C.blueBg : C.surface,
                  color: done ? '#fff' : active ? C.blue : C.muted,
                  border: `1px solid ${done ? C.fg : active ? C.blueBorder : C.border}`,
                }}
              >
                {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? C.fg : done ? C.fg3 : C.muted }}>{s.label}</span>
            </div>
            {i < STAGES.length - 1 && <div style={{ width: 20, height: 1, background: done ? C.fg : C.border }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Stripe-style payment modal, layered over the whole flow ──
function StripeModal({ open, totalMonthly, licenceCount, billingDate, defaultEmail, onClose, onPaid }) {
  const [payEmail, setPayEmail] = useState(defaultEmail || '');
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' });
  const [phase, setPhase] = useState('form'); // 'form' | 'processing' | 'success'

  useEffect(() => { if (open) { setPhase('form'); setPayEmail(defaultEmail || ''); } }, [open, defaultEmail]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && phase === 'form') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, phase, onClose]);

  const setNumber = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    setCard((c) => ({ ...c, number: digits.replace(/(\d{4})(?=\d)/g, '$1 ') }));
  };
  const setExp = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    setCard((c) => ({ ...c, exp: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }));
  };

  const cardValid =
    emailRe.test(payEmail) &&
    card.name.trim().length > 2 &&
    card.number.replace(/\s/g, '').length >= 16 &&
    /^\d{2}\/\d{2}$/.test(card.exp) &&
    card.cvc.length >= 3;

  const pay = () => {
    if (!cardValid) return;
    setPhase('processing');
    setTimeout(() => {
      setPhase('success');
      setTimeout(() => onPaid(), 900);
    }, 1300);
  };

  if (!open) return null;

  const cellInput = {
    width: '100%', height: 42, padding: '0 12px', border: 'none', outline: 'none',
    fontSize: 14, color: C.fg, fontFamily: SANS, background: 'transparent',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(2px)', zIndex: 100, fontFamily: SANS }}
      onClick={() => phase === 'form' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rounded-2xl overflow-hidden"
        style={{ width: '100%', maxWidth: 440, background: C.surface, boxShadow: '0 20px 50px rgba(28,25,23,0.30)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'success' ? (
          <div className="flex flex-col items-center text-center px-8 py-14">
            <div className="flex items-center justify-center rounded-full mb-5" style={{ width: 56, height: 56, background: C.fg }}>
              <Check className="w-7 h-7" style={{ color: '#fff' }} strokeWidth={2.5} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: C.fgStrong }}>Paiement confirmé</div>
            <div style={{ fontSize: 12.5, color: C.fg2, marginTop: 4 }}>Votre essai gratuit démarre maintenant.</div>
          </div>
        ) : (
          <>
            {/* Header - merchant + amount */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatoIcon size={22} color={C.fg} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>Plato</span>
                </div>
                <button onClick={onClose} disabled={phase !== 'form'} className="flex items-center justify-center rounded-md transition-colors hover:bg-cream" style={{ width: 26, height: 26, color: C.muted }} aria-label="Fermer">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.fgStrong }}>0,00 €</span>
                <span style={{ fontSize: 12, color: C.fg2 }}>aujourd'hui</span>
              </div>
              <div style={{ fontSize: 12, color: C.fg2, marginTop: 2 }}>
                {licenceCount} licence{licenceCount > 1 ? 's' : ''} · puis {fmtEur(totalMonthly)} € HT/mois à partir du {billingDate}
              </div>
            </div>

            {/* Body - Stripe-like fields */}
            <div className="px-6 py-5 space-y-3.5">
              <Field label="E-mail">
                <TextInput type="email" placeholder="vous@cabinet.fr" value={payEmail} onChange={(e) => setPayEmail(e.target.value)} disabled={phase !== 'form'} />
              </Field>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: C.fg3, marginBottom: 6 }}>Informations de carte</div>
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  <div style={{ position: 'relative', borderBottom: `1px solid ${C.border}` }}>
                    <input placeholder="1234 1234 1234 1234" value={card.number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" disabled={phase !== 'form'} style={{ ...cellInput, paddingRight: 40 }} />
                    <CreditCard className="w-4 h-4" style={{ position: 'absolute', right: 12, top: 13, color: C.muted }} strokeWidth={1.9} />
                  </div>
                  <div className="flex">
                    <input placeholder="MM / AA" value={card.exp} onChange={(e) => setExp(e.target.value)} inputMode="numeric" disabled={phase !== 'form'} style={{ ...cellInput, borderRight: `1px solid ${C.border}` }} />
                    <input placeholder="CVC" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} inputMode="numeric" disabled={phase !== 'form'} style={cellInput} />
                  </div>
                </div>
              </div>

              <Field label="Nom sur la carte">
                <TextInput placeholder="Marie Dupont" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} disabled={phase !== 'form'} />
              </Field>

              <button
                onClick={pay}
                disabled={!cardValid || phase !== 'form'}
                className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-lg text-[14px] font-medium transition-all mt-1"
                style={{
                  background: (!cardValid || phase !== 'form') ? C.borderStrong : C.fg,
                  color: '#fff',
                  cursor: (!cardValid || phase !== 'form') ? 'not-allowed' : 'pointer',
                  opacity: (!cardValid) ? 0.6 : 1,
                }}
              >
                {phase === 'processing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Traitement…</>
                ) : (
                  <><Lock className="w-3.5 h-3.5" strokeWidth={2} /> Démarrer l'essai gratuit</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1" style={{ fontSize: 11, color: C.muted }}>
                <Lock className="w-3 h-3" strokeWidth={2} /> Paiement sécurisé · Propulsé par Stripe
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OnboardingFlow({ onEnter, onSelectPlan }) {
  const [step, setStep] = useState('login');
  const [authStep, setAuthStep] = useState('email'); // 'email' -> 'password' (first-run activation)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [planId, setPlanId] = useState('MAX');
  const [invites, setInvites] = useState([]); // starts empty - added via "Ajouter une licence"
  const [payOpen, setPayOpen] = useState(false);
  const [openSection, setOpenSection] = useState('licence'); // accordion: 'licence' | 'team' | null
  const [redirectLeft, setRedirectLeft] = useState(REDIRECT_SECONDS);
  const [barFill, setBarFill] = useState(0);

  const plan = PLAN_BY_ID[planId];
  const validInvites = invites.filter((i) => emailRe.test(i.email));
  const paidInvites = validInvites.filter((i) => i.plan); // plan === null → lecture seule (gratuit)
  const readOnlyCount = validInvites.length - paidInvites.length;
  const licenceCount = 1 + paidInvites.length; // admin always holds a licence
  const totalMonthly = plan.monthly + paidInvites.reduce((s, i) => s + PLAN_BY_ID[i.plan].monthly, 0);

  // Per-tier breakdown for the recap (admin's plan + paid collaborators).
  const recapTiers = PRICING_PLANS
    .map((p) => ({ p, count: (planId === p.id ? 1 : 0) + paidInvites.filter((i) => i.plan === p.id).length }))
    .filter((x) => x.count > 0);

  const billingDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + TRIAL_DAYS);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const emailValid = emailRe.test(email);
  const passwordValid = password.length >= 8 && password === confirmPassword;

  // Stepper stage: licence(0) -> team(1) -> pay(2, while modal open) -> done(3)
  const activeIndex = step === 'plan' ? (payOpen ? 1 : 0) : 2;

  const goEnter = () => {
    onSelectPlan && onSelectPlan(planId);
    onEnter && onEnter();
  };

  // Once payment clears, the done step self-launches into Plato: fill the bar,
  // tick down the countdown, then enter. Any of it can be short-circuited by the
  // "maintenant" button (which calls goEnter directly).
  useEffect(() => {
    if (step !== 'done') { setBarFill(0); setRedirectLeft(REDIRECT_SECONDS); return; }
    const raf = requestAnimationFrame(() => setBarFill(100));
    const iv = setInterval(() => setRedirectLeft((n) => Math.max(0, n - 1)), 1000);
    const to = setTimeout(() => goEnter(), REDIRECT_SECONDS * 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(iv); clearTimeout(to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Licence row helpers ──
  const setInvite = (id, patch) => setInvites((v) => v.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addInvite = () => setInvites((v) => [...v, { id: (v[v.length - 1]?.id || 0) + 1, email: '', plan: 'PRO' }]);
  const removeInvite = (id) => setInvites((v) => v.filter((i) => i.id !== id));
  // Auto-grow: filling the last row's email spawns a fresh empty row, so there
  // is always exactly one trailing blank ready for the next collaborator.
  const handleInviteEmail = (id, value) =>
    setInvites((v) => {
      const next = v.map((i) => (i.id === id ? { ...i, email: value } : i));
      const last = next[next.length - 1];
      if (last && last.id === id && value.trim().length > 0) {
        next.push({ id: (last.id || 0) + 1, email: '', plan: 'PRO' });
      }
      return next;
    });

  const maxWidth = step === 'plan' ? 560 : 440;

  const isLogin = step === 'login';

  return (
    <div className="min-h-screen flex" style={{ background: C.canvas, fontFamily: SANS }}>
      {/* Main form column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 lg:px-16 pt-8 flex-shrink-0">
          <PlatoMark />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-10">
          <div style={{ width: '100%', maxWidth }}>

            {/* ══ ACTIVATION - enter email, then create a password ══ */}
            {step === 'login' && authStep === 'email' && (
              <div>
                <div style={{ ...eyebrow, marginBottom: 12 }}>Première connexion</div>
                <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: C.fgStrong, letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Bienvenue sur Plato
                </h1>
                <p style={{ fontSize: 13.5, color: C.fg2, lineHeight: '20px', marginBottom: 28 }}>
                  Entrez l'adresse e-mail avec laquelle votre compte a été créé.
                </p>

                <Field label="Adresse e-mail professionnelle">
                  <TextInput
                    type="email"
                    placeholder="prenom@cabinet.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && emailValid) setAuthStep('password'); }}
                    autoFocus
                  />
                </Field>

                <div className="mt-7">
                  <PrimaryButton full disabled={!emailValid} onClick={() => setAuthStep('password')}>
                    Continuer
                  </PrimaryButton>
                </div>

              </div>
            )}

            {step === 'login' && authStep === 'password' && (
              <div>
                <div style={{ ...eyebrow, marginBottom: 12 }}>Première connexion</div>
                <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: C.fgStrong, letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Créez votre mot de passe
                </h1>
                <p style={{ fontSize: 13.5, color: C.fg2, lineHeight: '20px', marginBottom: 20 }}>
                  Choisissez un mot de passe pour sécuriser votre compte.
                </p>

                {/* Email context + edit */}
                <div className="flex items-center justify-between rounded-lg px-3.5 py-2.5 mb-5" style={{ background: C.cream }}>
                  <span className="flex items-center gap-2 min-w-0" style={{ fontSize: 13, color: C.fg3 }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.blue }} strokeWidth={2.5} />
                    <span className="truncate">{email}</span>
                  </span>
                  <button onClick={() => setAuthStep('email')} className="flex-shrink-0" style={{ fontSize: 12.5, fontWeight: 500, color: C.blue }}>Modifier</button>
                </div>

                <div className="space-y-4">
                  <Field label="Mot de passe" hint="8 caractères minimum">
                    <TextInput type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                  </Field>
                  <Field label="Confirmez le mot de passe">
                    <TextInput
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && passwordValid) setStep('plan'); }}
                    />
                  </Field>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p style={{ fontSize: 12, color: '#991b1b' }}>Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-7">
                  <button onClick={() => setAuthStep('email')} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg text-[13.5px] font-medium transition-colors" style={{ color: C.fg3, background: 'transparent' }}>
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Retour
                  </button>
                  <PrimaryButton full disabled={!passwordValid} onClick={() => setStep('plan')}>
                    Créer mon compte
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* ══ LICENCE (own, admin) - reuses the settings LicencePicker ══ */}
            {/* ══ PLAN - your licence (+ optional team) in one focused screen ══ */}
            {step === 'plan' && (
              <div>
                <Stepper activeIndex={activeIndex} />
                <div
                  className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full"
                  style={{ background: C.blueBg, border: `1px solid ${C.blueBorder}` }}
                >
                  <Clock className="w-3.5 h-3.5" style={{ color: C.blue }} strokeWidth={2} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>Essai gratuit de {TRIAL_DAYS} jours</span>
                </div>
                <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 500, color: C.fgStrong, letterSpacing: '-0.5px', marginBottom: 6 }}>
                  Choisissez votre licence
                </h1>
                <p style={{ fontSize: 13.5, color: C.fg2, lineHeight: '20px', marginBottom: 22 }}>
                  Essayez tout Plato pendant {TRIAL_DAYS} jours. 0 € aujourd'hui, annulable à tout moment.
                </p>

                {/* Accordion: your licence, then optional collaborators */}
                <div className="space-y-2.5">
                  <AccordionRow
                    n={1}
                    title="Votre licence"
                    open={openSection === 'licence'}
                    summary={`Plan ${plan.name} · ${fmtEur(plan.monthly)} €/mois`}
                    onToggle={() => setOpenSection(openSection === 'licence' ? null : 'licence')}
                  >
                    <LicencePicker value={planId} onChange={(id) => id && setPlanId(id)} showUsage />
                    <div className="mt-3.5 flex justify-end">
                      <PrimaryButton onClick={() => { if (invites.length === 0) addInvite(); setOpenSection('team'); }}>
                        Continuer
                      </PrimaryButton>
                    </div>
                  </AccordionRow>

                  <AccordionRow
                    n={2}
                    title="Collaborateurs"
                    optional
                    open={openSection === 'team'}
                    summary={validInvites.length > 0 ? `${validInvites.length} collaborateur${validInvites.length > 1 ? 's' : ''}` : 'Aucun · à faire plus tard'}
                    onToggle={() => { if (openSection !== 'team' && invites.length === 0) addInvite(); setOpenSection(openSection === 'team' ? null : 'team'); }}
                  >
                    <PlanLegend />
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: '15px', marginTop: 8 }}>
                      Ou <span style={{ fontWeight: 600, color: C.fg2 }}>lecture seule</span> (gratuit) : consultation des dossiers, sans agent IA.
                    </p>
                    {invites.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {invites.map((inv) => (
                          <div key={inv.id} className="flex items-center gap-2">
                            <TextInput
                              type="email"
                              placeholder="collaborateur@cabinet.fr"
                              value={inv.email}
                              onChange={(e) => handleInviteEmail(inv.id, e.target.value)}
                              style={{ height: 38, fontSize: 13, flex: 1, width: 'auto' }}
                            />
                            {inv.email.trim().length > 0 && (
                              <>
                                <PlanDropdown value={inv.plan} onChange={(p) => setInvite(inv.id, { plan: p })} includeFree />
                                <button
                                  onClick={() => removeInvite(inv.id)}
                                  className="flex items-center justify-center rounded-lg flex-shrink-0 transition-colors hover:bg-cream"
                                  style={{ width: 30, height: 38, color: C.muted }}
                                  aria-label="Retirer cette licence"
                                >
                                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionRow>
                </div>

                {/* Transparent recap - itemized, no filled background */}
                <div className="mt-6 mb-4">
                  {recapTiers.map((x, i) => (
                    <div key={x.p.id} className="flex items-center justify-between py-2" style={{ fontSize: 13, borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ color: C.fg3 }}>{x.count} × Plan {x.p.name} <span style={{ color: C.muted }}>· {x.p.usage.toLowerCase()}</span></span>
                      <span className="tabular-nums" style={{ color: C.fg, fontWeight: 500 }}>{fmtEur(x.count * x.p.monthly)} €</span>
                    </div>
                  ))}
                  {readOnlyCount > 0 && (
                    <div className="flex items-center justify-between py-2" style={{ fontSize: 13, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ color: C.fg3 }}>{readOnlyCount} × Lecture seule <span style={{ color: C.muted }}>· consultation</span></span>
                      <span style={{ color: C.fg2 }}>Gratuit</span>
                    </div>
                  )}
                  <div className="pt-3 mt-1 text-right" style={{ borderTop: `1px solid ${C.borderStrong}` }}>
                    <div className="flex items-baseline justify-end gap-2.5">
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.fg }}>à payer aujourd'hui</span>
                      <span className="tabular-nums" style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: C.fgStrong, letterSpacing: '-1px', lineHeight: 1 }}>0 €</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.fg2, marginTop: 6 }}>
                      Puis <span className="tabular-nums" style={{ fontWeight: 600, color: C.fg }}>{fmtEur(totalMonthly)} € HT/mois</span> · premier prélèvement le {billingDate}
                    </div>
                  </div>
                </div>

                <PrimaryButton full icon={ArrowRight} onClick={() => setPayOpen(true)}>Démarrer mon essai gratuit</PrimaryButton>
                <p className="text-center" style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>
                  Sans engagement · annulable à tout moment · aucun prélèvement pendant {TRIAL_DAYS} jours
                </p>
              </div>
            )}

            {/* ══ DONE (payment cleared) - auto-launch into Plato ══ */}
            {step === 'done' && (
              <div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full mb-5" style={{ background: C.blueBg, border: `1px solid ${C.blueBorder}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>Paiement confirmé · Essai activé</span>
                </div>
                <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, color: C.fgStrong, letterSpacing: '-0.5px', lineHeight: '36px', marginBottom: 10, maxWidth: 460 }}>
                  Votre essai sur Plato commence maintenant&nbsp;!
                </h1>
                <p style={{ fontSize: 13.5, color: C.fg2, lineHeight: '21px', marginBottom: 28, maxWidth: 400 }}>
                  Essayez tout Plato pendant {TRIAL_DAYS} jours avec votre équipe. 0 € aujourd'hui, annulable à tout moment.
                </p>

                {/* Auto-launch: countdown + progress bar, redirect into Plato */}
                <div style={{ maxWidth: 420 }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: C.fg3 }}>Ouverture de Plato…</span>
                    <span className="tabular-nums" style={{ fontFamily: MONO, fontSize: 11.5, color: C.fg2 }}>{redirectLeft}s</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: C.cream, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barFill}%`, background: C.fg, borderRadius: 999, transition: `width ${REDIRECT_SECONDS}s linear` }} />
                  </div>

                  <div className="mt-6">
                    <PrimaryButton full onClick={goEnter}>Commencer à utiliser Plato</PrimaryButton>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Persistent trial timeline rail (right) */}
      {/* Persistent dark brand panel on the RIGHT throughout: brand hero at
          login, then the trial timeline once past it. One continuous surface. */}
      {isLogin && <BrandPanel />}
      {step === 'plan' && <TimelineRail billingDate={billingDate} started={false} />}

      {/* Stripe-style payment modal, layered above the flow */}
      <StripeModal
        open={payOpen}
        totalMonthly={totalMonthly}
        licenceCount={licenceCount}
        billingDate={billingDate}
        defaultEmail={email}
        onClose={() => setPayOpen(false)}
        onPaid={() => { setPayOpen(false); setStep('done'); }}
      />
    </div>
  );
}
