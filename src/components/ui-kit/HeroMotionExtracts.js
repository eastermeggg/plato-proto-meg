import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CalendarDays, Scale, FileText, ArrowRight, ArrowUp, Mic, Check, Loader2,
  Paperclip, Lightbulb, BookOpen, Folder,
} from 'lucide-react';
import { colors } from '../../design-system/tokens';
import IVAvatar from '../IVAvatar';
import ReasoningStepper from '../ReasoningStepper';

// ── Hero motion V2 - « extraits produit » ────────────────────────────────
// Déclinaison allégée des 3 key screens, dans le langage des motions du site
// précédent (réf. Figma « Plato - Brand - Website », node 1074:11651) :
// un seul élément produit par écran, isolé sur fond crème avec repères de
// découpe (hairlines + diamants), grande ombre douce, cartouche orange mono
// en bas. Même design system que l'app (tokens, serif RL Para, IBM Plex Mono).
// Tout se déroule automatiquement : idéal à enregistrer tel quel.

const S = colors.semantic;
const FB = colors.feedback;
const BRAND = colors.brand.DEFAULT;
const BRAND_DEEP = colors.brand.mutedForeground;

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

const STAGE_W = 1232;
const STAGE_H = 760;

// Zoom global du contenu des scènes dans la planche : tout est agrandi d'un
// bloc (typo, cartes, espaces), le cartouche orange reste à l'échelle planche.
const CONTENT_ZOOM = 1.2;

// Ombre « extrait » : l'élément flotte, pas de bordure dure.
const FLOAT_SHADOW = '0px 24px 40px rgba(26,26,26,0.07), 0px 6px 12px rgba(26,26,26,0.04)';

const monoCaption = (color = S.mutedForeground, size = 11) => ({
  fontFamily: MONO, fontSize: size, fontWeight: 500, letterSpacing: '0.6px',
  textTransform: 'uppercase', color,
});

// ── La planche : fond crème nu + cartouche orange ────────────────────────

function Plate({ label, children }) {
  const bottom = STAGE_H - 62;
  return (
    <div style={{ position: 'relative', width: STAGE_W, height: STAGE_H, background: S.muted, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zoom: CONTENT_ZOOM }}>
        {children}
      </div>

      {label && (
        <span style={{
          position: 'absolute', left: '50%', top: bottom, transform: 'translate(-50%, -50%)',
          padding: '9px 18px', borderRadius: 4, background: BRAND,
          boxShadow: '0px 0px 24px rgba(244,122,44,0.55)',
          fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '2.4px',
          textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap',
        }}>{label}</span>
      )}
    </div>
  );
}

function Badge({ tone = 'warning', children }) {
  const t = tone === 'success' ? FB.success : FB.warning;
  return (
    <span style={{
      padding: '4px 9px', borderRadius: 6, background: t.subtle, color: t.text,
      fontFamily: SANS, fontSize: 12, fontWeight: 500, textTransform: 'uppercase',
      letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function DarkButton({ children, pressed = false, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, height: 30, padding: '0 11px',
      borderRadius: 4, background: S.primary, color: '#fff', fontFamily: SANS,
      fontSize: 12.5, fontWeight: 500, letterSpacing: '0.24px', whiteSpace: 'nowrap',
      transform: pressed ? 'scale(0.94)' : 'scale(1)', transition: 'transform 160ms ease, background 240ms ease',
      ...style,
    }}>{children}</span>
  );
}

// Puce dossier : chaque tâche est rattachée à un matter (pattern flag dossier).
function MatterChip({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '3px 8px', borderRadius: 4, background: 'rgba(238,236,230,0.75)',
    }}>
      <Folder size={12} strokeWidth={1.75} color={S.mutedForeground} />
      <span style={{ fontFamily: SANS, fontSize: 12, color: S.foregroundQuaternary, whiteSpace: 'nowrap' }}>{children}</span>
    </span>
  );
}

// ── Écran 1 - morning brief en 3 extraits ────────────────────────────────

function ExtractCard({ icon, title, matter, body, right, entered, delay, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18, width: '100%', padding: '20px 24px',
      background: S.card, borderRadius: 8, boxShadow: FLOAT_SHADOW,
      opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 520ms ease ${delay}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      <span style={{
        width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: S.background, borderRadius: 6,
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, lineHeight: '23px', color: S.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
          {matter && <MatterChip>{matter}</MatterChip>}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: '19px', color: S.mutedForeground }}>{body}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>{right}</span>
      {children}
    </div>
  );
}

function SceneBrief({ phase }) {
  // phase : 0 entrée · 1 bill pressé · 2 billing · 3 billed
  const entered = phase >= 0;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }}>
      <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)',
          transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)',
        }}>
          <span style={monoCaption(BRAND_DEEP)}>Wednesday, 8:20 AM</span>
          <span style={{ fontFamily: SERIF, fontSize: 34, lineHeight: '38px', letterSpacing: '-0.7px', color: '#000' }}>
            Hey John. This is what happened <em style={{ color: S.foregroundQuaternary }}>since yesterday.</em>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ExtractCard
            entered={entered} delay={250}
            icon={<FileText size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Doe case closed" matter="Doe - Closing"
            body={phase >= 3 ? 'Invoice #2216 sent to Doe - tracked in Billing' : 'The invoice is ready - can we bill?'}
            right={
              <>
                <Badge tone="success">{phase >= 3 ? 'Billing started' : 'Ready'}</Badge>
                <DarkButton pressed={phase === 1} style={phase >= 3 ? { background: FB.success.base } : undefined}>
                  {phase >= 3
                    ? (<>Billed <Check size={14} strokeWidth={2.5} color="#fff" /></>)
                    : phase === 2
                      ? (<><Loader2 size={14} strokeWidth={2} color="#fff" style={{ animation: 'hmx-spin 800ms linear infinite' }} /> Billing</>)
                      : (<>Bill <ArrowRight size={14} strokeWidth={2} color="#fff" /></>)}
                </DarkButton>
              </>
            }
          />
          <ExtractCard
            entered={entered} delay={400}
            icon={<Scale size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Siemens case lost" matter="Siemens - Litigation"
            body="We should appeal - analysis and client note drafted"
            right={<><Badge tone="warning">Needs you</Badge><DarkButton>Review <ArrowRight size={14} strokeWidth={2} color="#fff" /></DarkButton></>}
          />
          <ExtractCard
            entered={entered} delay={550}
            icon={<CalendarDays size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Emergency hearing tomorrow" matter="Marchal - Dismissal"
            body="I can move your two meetings and brief you on the way"
            right={<><Badge tone="warning">Needs you</Badge><DarkButton>Reschedule <ArrowRight size={14} strokeWidth={2} color="#fff" /></DarkButton></>}
          />
        </div>
      </div>
    </div>
  );
}

// ── Écran 2 - préparation d'audience en extraits ─────────────────────────

function MeetingExtract({ title, kind, from, to, moved, entered, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px',
      background: S.card, borderRadius: 8, boxShadow: FLOAT_SHADOW,
      opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 520ms ease ${delay}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      <span style={{ width: 42, height: 42, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: S.background, borderRadius: 6 }}>
        <CalendarDays size={18} strokeWidth={1.75} color={S.foregroundQuaternary} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: S.foreground }}>{title}</span>
        <span style={monoCaption(S.mutedForeground, 11)}>{kind}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: SANS, fontSize: 15, color: S.mutedForeground, textDecoration: moved ? 'line-through' : 'none' }}>{from}</span>
        <ArrowRight size={15} strokeWidth={1.75} color={S.foregroundMuted} />
        <span style={{
          fontFamily: SANS, fontSize: 15, fontWeight: 500, color: FB.success.text,
          padding: '4px 10px', borderRadius: 6, background: FB.success.subtle,
          opacity: moved ? 1 : 0, transform: moved ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 320ms ease, transform 320ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>{to}</span>
      </span>
    </div>
  );
}

function SceneHearingExtract({ phase }) {
  // phase : 0 header · 1 steps · 2 réunions · 3 déplacées · 4 note
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 64 }}>
      <div style={{ width: 740, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'hmx-rise 560ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <IVAvatar size={44} color="green" />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={monoCaption()}>Matter · Summary hearing tomorrow 9:00 AM</span>
            <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 500, color: S.foreground }}>Marchal v. Optima Retail</span>
          </span>
        </div>

        {phase >= 1 && (
          // Le vrai ReasoningStepper de l'app : icônes par type d'étape,
          // gif plato-thinking sur l'étape en cours. Zoomé pour l'échelle
          // « extrait » (le 12px de l'app est trop petit sur un hero).
          <div style={{ maxWidth: 480, zoom: 1.25, animation: 'hmx-rise 420ms cubic-bezier(0.22,1,0.36,1) both' }}>
            <ReasoningStepper
              status="streaming"
              steps={[
                { type: 'read_documents', label: 'Reading the summons and the 14 exhibits', status: 'done' },
                { type: 'navigate', label: 'Moving your two morning meetings', status: phase >= 3 ? 'done' : 'loading' },
                ...(phase >= 3 ? [{ type: 'summarize', label: 'Drafting the hearing note with authorities', status: phase >= 4 ? 'done' : 'loading' }] : []),
              ]}
            />
          </div>
        )}

        {phase >= 2 && phase < 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MeetingExtract entered delay={0} title="Kick-off - Doe closing" kind="Meeting · 45 min" from="Wed 9:00 AM" to="Thu 3:00 PM" moved={phase >= 3} />
            <MeetingExtract entered delay={150} title="Client call - Ms Marchal" kind="Call · 30 min" from="Wed 11:30 AM" to="Thu 5:00 PM" moved={phase >= 3} />
          </div>
        )}

        {phase >= 4 && (
          <div style={{
            position: 'relative', background: S.card, borderRadius: 8, boxShadow: FLOAT_SHADOW,
            padding: '26px 30px 0', height: 310, overflow: 'hidden',
            animation: 'hmx-rise 640ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={14} strokeWidth={1.75} color={S.mutedForeground} />
                <span style={monoCaption()}>Hearing note</span>
              </span>
              <Badge tone="warning">For review</Badge>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: '27px', letterSpacing: '-0.3px', color: '#000', marginBottom: 12 }}>
              Interim proceedings - annulment of Ms Marchal's dismissal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: SANS, fontSize: 14, lineHeight: '22px', color: S.secondaryForeground }}>
              <p style={{ margin: 0 }}>
                <strong style={{ fontWeight: 600, color: S.foreground }}>Our position.</strong>{' '}
                Ms Marchal was dismissed nine days after testifying in the internal harassment
                investigation. A retaliatory dismissal is null and void (Art. L.1152-3): she is
                entitled to reinstatement and full back pay, not mere damages.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ fontWeight: 600, color: S.foreground }}>Why summary proceedings.</strong>{' '}
                The nullity is blatant enough to qualify as a manifestly unlawful disturbance
                (Art. R.1455-6). The chronology, a spotless 11-year record and the role being
                reposted three weeks later leave no serious defense.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ fontWeight: 600, color: S.foreground }}>Authorities.</strong>{' '}
                Cass. soc., 30 June 2016, n°15-10.557 - nullity of retaliatory dismissal.
              </p>
            </div>
            {/* Fondu bas : l'extrait suggère un document plus long */}
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 80,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff)',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Écran 3 - la grande prompt box ───────────────────────────────────────

const PROMPT_TEXT = "That's great, once we win tomorrow I'd like to ask the company to settle on a 60k€ damage for the employee. Run several scenarios to compute unfair dismissal compensation and over-paid hours.";

function SceneComposer({ active }) {
  const [typed, setTyped] = useState(0);
  const done = typed >= PROMPT_TEXT.length;

  useEffect(() => {
    if (!active) { setTyped(0); return undefined; }
    let i = 0;
    let timer;
    const start = setTimeout(function tick() {
      i += 1;
      setTyped(i);
      if (i < PROMPT_TEXT.length) timer = setTimeout(tick, 24 + (PROMPT_TEXT[i - 1] === ' ' ? 12 : 0));
    }, 1000);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, [active]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'relative', width: 860, background: S.card, borderRadius: 10, boxShadow: FLOAT_SHADOW,
        padding: '26px 28px 18px', animation: 'hmx-rise 620ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <span className="hmx-glow-bloom" aria-hidden="true" />
        <span className="hmx-glow-ring" aria-hidden="true" />
        <div style={{ fontFamily: SANS, fontSize: 18, lineHeight: '28px', color: S.foreground, minHeight: 112 }}>
          {typed === 0 && <span style={{ color: S.mutedForeground }}>Ask Plato anything about your cases...</span>}
          {PROMPT_TEXT.slice(0, typed)}
          {typed > 0 && !done && <span style={{ display: 'inline-block', width: 1.5, height: 19, background: S.foreground, verticalAlign: '-3px', marginLeft: 1, animation: 'hmx-caret 1s steps(1) infinite' }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Paperclip size={20} strokeWidth={1.75} color={S.foreground} />
            <Lightbulb size={20} strokeWidth={1.75} color={S.foreground} />
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Mic size={20} strokeWidth={1.75} color={S.foreground} />
            <span style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, background: S.primary,
              boxShadow: done ? `0 0 0 5px ${colors.brand.subtle}, 0 0 18px rgba(244,122,44,0.5)` : 'none',
              transition: 'box-shadow 420ms ease',
            }}>
              <ArrowUp size={20} strokeWidth={2} color="#fff" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Orchestration : timeline auto des 3 écrans ───────────────────────────

const SCENE_LABELS = { 1: 'Morning brief', 2: 'Hearing prep', 3: 'Settlement scenarios' };

export default function HeroMotionExtracts({ scale = 1 }) {
  const [scene, setScene] = useState(1);
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(true);
  const [runId, setRunId] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const at = (ms, fn) => timersRef.current.push(setTimeout(fn, ms));

  const play = useCallback((target, chain) => {
    clearTimers();
    setRunId((r) => r + 1);
    setScene(target);
    setPhase(0);
    if (target === 1) {
      at(2400, () => setPhase(1));   // BILL se presse tout seul
      at(2600, () => setPhase(2));   // spinner
      at(3700, () => setPhase(3));   // billing started
      if (chain) at(5600, () => play(2, true));
    } else if (target === 2) {
      at(700, () => setPhase(1));    // steps
      at(1500, () => setPhase(2));   // réunions
      at(2700, () => setPhase(3));   // déplacées
      at(4300, () => setPhase(4));   // la note remplace les réunions
      if (chain) at(7600, () => play(3, true));
    }
    // scène 3 : la frappe se lance via SceneComposer
  }, []);

  useEffect(() => { play(1, auto); return clearTimers; /* eslint-disable-next-line */ }, []);

  const chip = (n) => (
    <button
      key={n}
      onClick={() => play(n, false)}
      style={{
        display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px',
        borderRadius: 100, cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
        background: scene === n ? S.primary : S.card,
        color: scene === n ? S.primaryForeground : S.secondaryForeground,
        border: `1px solid ${scene === n ? S.primary : S.borderStrong}`,
      }}
    >{n} · {SCENE_LABELS[n]}</button>
  );

  return (
    <div>
      <style>{`
        @keyframes hmx-spin { to { transform: rotate(360deg); } }
        @keyframes hmx-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes hmx-caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        @keyframes hmx-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        /* Bordure à glow mobile (comète + bloom), même recette que le composer
           hero de l'app (AssistantComposer), rayon adapté à la carte r10. */
        @property --hmx-glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes hmx-glow-spin { to { --hmx-glow-angle: 360deg; } }
        .hmx-glow-ring, .hmx-glow-bloom {
          position: absolute; border-radius: 11px; pointer-events: none;
          animation: hmx-glow-spin 3.4s linear infinite;
        }
        .hmx-glow-ring {
          inset: -1px; padding: 1px; z-index: 1;
          background:
            conic-gradient(from var(--hmx-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg),
            linear-gradient(#cbc7c4, #cbc7c4);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        .hmx-glow-bloom {
          inset: -3px; padding: 4px; z-index: 0; filter: blur(7px); opacity: 0.75;
          background: conic-gradient(from var(--hmx-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', paddingBottom: 14 }}>
        {[1, 2, 3].map(chip)}
        <span style={{ width: 10 }} />
        <button
          onClick={() => { setAuto(true); play(1, true); }}
          style={{
            height: 28, padding: '0 12px', borderRadius: 100, cursor: 'pointer',
            fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
            background: S.card, color: S.foreground, border: `1px solid ${S.borderStrong}`,
          }}
        >Rejouer la séquence</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
          <div key={runId} style={{
            transform: `scale(${scale})`, transformOrigin: 'top left',
            borderRadius: 10, overflow: 'hidden', border: `1px solid ${S.borderStrong}`,
            boxShadow: '0px 24px 60px rgba(26,26,26,0.12)', width: STAGE_W, height: STAGE_H,
          }}>
            <Plate label={SCENE_LABELS[scene] && scene === 3 ? 'Settlement scenarios' : scene === 2 ? 'Hearing prep' : 'Morning brief'}>
              {scene === 1 && <SceneBrief phase={phase} />}
              {scene === 2 && <SceneHearingExtract phase={phase} />}
              {scene === 3 && <SceneComposer active />}
            </Plate>
          </div>
        </div>
      </div>
    </div>
  );
}
