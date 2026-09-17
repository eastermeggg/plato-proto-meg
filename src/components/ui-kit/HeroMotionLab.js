import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, PanelLeft, Inbox, Folder, MessageCircle, Settings, ChevronsUpDown,
  Clock4, CheckCircle2, CalendarDays, Scale, FileText, ArrowRight, ArrowUp,
  Mic, Check, Loader2, BookOpen,
} from 'lucide-react';
import { colors } from '../../design-system/tokens';
import PlatoIcon from '../shell/PlatoIcon';
import IVAvatar from '../IVAvatar';
import ReasoningStepper from '../ReasoningStepper';
import AssistantComposer from '../assistant/AssistantComposer';
import HeroMotionExtracts from './HeroMotionExtracts';

// ── Hero motion - 3 key screens pour le hero de la landing ───────────────
// Séquence scriptée sur le design Plato (réf. Figma « workspace-this-morning »,
// node 4036:5065) :
//   Scene 1 - morning brief « Hey John » : 3 cartes (BILL / REVIEW / RESCHEDULE).
//     Clic BILL  → animation « Billing started » sur place.
//     Clic RESCHEDULE ou REVIEW (carte audience) → Scene 2.
//   Scene 2 - thinking steps, 2 réunions déplacées, note d'audience complète
//     (référé en annulation d'un licenciement abusif, contenu en anglais).
//   Scene 3 - prompt box en bas à droite, le texte de l'avocat se tape seul.
// Stage fixe 1440x900 mis à l'échelle : à enregistrer tel quel pour le motion.

const S = colors.semantic;
const FB = colors.feedback;
const BRAND = colors.brand.DEFAULT;
const BRAND_DEEP = colors.brand.mutedForeground;

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

const STAGE_W = 1440;
const STAGE_H = 900;

// ── Petites briques partagées ─────────────────────────────────────────────

const monoCaption = (color = S.mutedForeground) => ({
  fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: '0.22px',
  textTransform: 'uppercase', color,
});

function Badge({ tone = 'warning', children, style }) {
  const t = tone === 'success' ? FB.success : tone === 'warning' ? FB.warning : FB.info;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px',
      borderRadius: 6, background: t.subtle, color: t.text, fontFamily: SANS,
      fontSize: 12, fontWeight: 500, lineHeight: '16px', whiteSpace: 'nowrap',
      textTransform: 'uppercase', ...style,
    }}>{children}</span>
  );
}

function DarkButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 26,
        padding: '0 8px', borderRadius: 4, border: 'none', cursor: onClick ? 'pointer' : 'default',
        background: S.primary, color: S.primaryForeground, fontFamily: SANS,
        fontSize: 12, fontWeight: 500, letterSpacing: '0.24px',
        boxShadow: '0px 1px 1px rgba(26,26,26,0.05)', whiteSpace: 'nowrap',
      }}
    >{children}</button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 26,
        padding: '0 8px', borderRadius: 4, cursor: 'pointer',
        background: S.card, color: S.foreground, border: `1px solid ${S.borderStrong}`,
        fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: '0.24px',
        boxShadow: '0px 1px 1px rgba(26,26,26,0.05)', whiteSpace: 'nowrap',
      }}
    >{children}</button>
  );
}

// Pastille de citation inline (pièces / textes / JP) dans la note.
function Cite({ children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', margin: '0 2px', borderRadius: 4,
      background: S.muted, color: S.foregroundQuaternary, fontFamily: MONO,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', verticalAlign: '1px',
    }}>{children}</span>
  );
}

// ── Sidebar (réf. Figma, 256px) ───────────────────────────────────────────

function NavRow({ icon, label, active = false, dot = null, medium = false }) {
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
      height: 32, padding: '6px 10px', borderRadius: 6, width: '100%',
      background: active ? S.muted : 'transparent',
      border: active ? `1px solid ${S.borderStrong}` : '1px solid transparent',
      boxShadow: active ? '0px 1px 1px rgba(26,26,26,0.05)' : 'none',
    }}>
      {dot
        ? <span style={{ width: 16, display: 'flex', justifyContent: 'center' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} /></span>
        : icon}
      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: SANS, fontSize: 14, lineHeight: '20px',
        fontWeight: active || medium ? 500 : 400, color: S.foreground,
      }}>{label}</span>
      {active && (
        <span style={{
          position: 'absolute', left: -9, top: 7.5, width: 2, height: 15,
          background: BRAND, borderRadius: '0 2px 2px 0',
          boxShadow: '0px 0px 6px 0px rgba(244,122,44,0.38)',
        }} />
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ padding: '6px 8px', width: '100%' }}>
      <span style={{ ...monoCaption(), opacity: 0.7 }}>{children}</span>
    </div>
  );
}

function Sidebar() {
  const iconProps = { size: 16, strokeWidth: 1.75, color: S.foregroundQuaternary };
  return (
    <div style={{
      width: 256, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: S.background, borderRight: `1px solid ${S.border}`,
    }}>
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${S.border}`,
      }}>
        <img src="/logo-plato-wordmark.svg" alt="Plato" style={{ width: 75, height: 24 }} />
        <PanelLeft size={16} strokeWidth={1.75} color={S.mutedForeground} />
      </div>

      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavRow active icon={<Inbox size={16} strokeWidth={1.75} color={BRAND_DEEP} />} label="Ready to review" />
        <NavRow icon={<Folder {...iconProps} />} label="Matters" />
        <NavRow icon={<MessageCircle {...iconProps} />} label="Chats" />
      </div>

      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SectionLabel>Recent matters</SectionLabel>
        <NavRow icon={<Folder {...iconProps} />} label="Doe - Closing" />
        <NavRow icon={<Folder {...iconProps} />} label="Siemens - Litigation" />
        <NavRow icon={<Folder {...iconProps} />} label="Marchal - Dismissal" />
      </div>

      <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SectionLabel>My agents</SectionLabel>
        <NavRow icon={<IVAvatar size={16} color="green" />} label="Litigation" medium />
        <NavRow icon={<IVAvatar size={16} color="blue" />} label="Back-office / Billing" medium />
        <NavRow icon={<IVAvatar size={16} color="default" />} label="Acquisition" />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '10px 8px' }}>
        <NavRow icon={<Settings {...iconProps} />} label="Settings" />
      </div>

      <div style={{ borderTop: `1px solid ${S.border}`, padding: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 6 }}>
          <IVAvatar size={24} color="plum" />
          <span style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'baseline', minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: S.foreground }}>John</span>
            <span style={{ fontFamily: SANS, fontSize: 12, color: S.mutedForeground, letterSpacing: '0.12px' }}>Whitfield LLP</span>
          </span>
          <ChevronsUpDown size={16} strokeWidth={1.75} color={S.mutedForeground} />
        </div>
      </div>
    </div>
  );
}

// ── Bande d'en-tête + composer (chrome commun aux 3 scènes) ──────────────

function HeaderBand({ crumb }) {
  return (
    <div style={{
      height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', background: S.card, borderBottom: `1px solid ${S.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 14, color: S.mutedForeground }}>Workspace</span>
        <span style={{ fontFamily: SANS, fontSize: 12, color: S.mutedForeground }}>/</span>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: S.foreground }}>{crumb}</span>
      </div>
      <span style={{ background: S.background, borderRadius: 100, padding: 6, display: 'flex' }}>
        <Bell size={14} strokeWidth={1.75} color={S.foreground} />
      </span>
    </div>
  );
}

function Composer() {
  // Le vrai composer hero de l'accueil (AssistantComposer), avec sa bordure à
  // glow mobile « comète » - pas une réplique.
  return (
    <div style={{ flexShrink: 0, padding: '12px 24px 24px' }}>
      <AssistantComposer
        variant="hero"
        catalog={{ objects: [], intentions: [] }}
        placeholder="Ask Plato anything about your cases..."
        onSend={() => {}}
      />
    </div>
  );
}

// ── Scene 1 - morning brief ───────────────────────────────────────────────

// Puce dossier : chaque tâche est rattachée à un matter (pattern flag dossier).
function MatterChip({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
      padding: '2px 6px', borderRadius: 4, background: 'rgba(238,236,230,0.75)',
    }}>
      <Folder size={12} strokeWidth={1.75} color={S.mutedForeground} />
      <span style={{ fontFamily: SANS, fontSize: 12, color: S.foregroundQuaternary, whiteSpace: 'nowrap' }}>{children}</span>
    </span>
  );
}

function TaskCard({ icon, title, agent, matter, body, right, entered, delay, liseré = null }) {
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: 18, background: S.card, borderRadius: 8, overflow: 'hidden',
      border: `1px solid ${S.border}`, boxShadow: '0px 1px 1px rgba(26,26,26,0.05)',
      opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(10px)',
      transition: `opacity 480ms ease ${delay}ms, transform 480ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      {liseré && (
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
          background: liseré, boxShadow: `0 0 6px ${liseré}66`,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '0 1 360px', minWidth: 0 }}>
        <span style={{
          width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: S.background, border: `1px solid ${S.border}`, borderRadius: 6,
        }}>{icon}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: S.foreground, whiteSpace: 'nowrap' }}>{title}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={monoCaption()}>{agent}</span>
            {matter && <MatterChip>{matter}</MatterChip>}
          </span>
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
        <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: '20px', color: S.secondaryForeground }}>{body}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function BucketHeader({ icon, label, badge, entered, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: 2,
      opacity: entered ? 1 : 0, transition: `opacity 480ms ease ${delay}ms`,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={monoCaption()}>{label}</span>
      </span>
      {badge}
    </div>
  );
}

function SceneMorning({ onOpenHearing }) {
  const [entered, setEntered] = useState(false);
  // idle → billing (spinner) → billed (confirmation sur place)
  const [billState, setBillState] = useState('idle');

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const startBilling = () => {
    if (billState !== 'idle') return;
    setBillState('billing');
    setTimeout(() => setBillState('billed'), 1100);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '34px 74px 0', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)',
        transition: 'opacity 560ms ease, transform 560ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        <span style={monoCaption(BRAND_DEEP)}>Wednesday, 8:20 AM - Good morning John</span>
        <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: '34px', letterSpacing: '-0.6px', color: '#000' }}>
          Hey John. This is what happened
          <br />
          <em style={{ color: S.foregroundQuaternary }}>since yesterday.</em>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fait pendant la nuit : le dossier Doe est prêt à facturer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BucketHeader
            entered={entered} delay={150}
            icon={<CheckCircle2 size={16} strokeWidth={1.75} color={S.mutedForeground} />}
            label="Done overnight"
            badge={<Badge tone="success">1 ready</Badge>}
          />
          <TaskCard
            entered={entered} delay={220}
            icon={<FileText size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Doe case closed" agent="Agent · Back-office" matter="Doe - Closing"
            liseré={billState === 'billed' ? FB.success.base : null}
            body={billState === 'billed'
              ? 'Invoice #2216 sent to Doe - tracked in Billing'
              : 'The matter is closed - the invoice is ready, can we bill?'}
            right={
              <>
                <Badge tone="success">{billState === 'billed' ? 'Billing started' : 'Ready'}</Badge>
                {billState === 'billed' ? (
                  <DarkButton style={{ background: FB.success.base }}>
                    Billed <Check size={14} strokeWidth={2.5} color="#fff" />
                  </DarkButton>
                ) : (
                  <DarkButton onClick={startBilling}>
                    {billState === 'billing'
                      ? (<><Loader2 size={14} strokeWidth={2} color="#fff" style={{ animation: 'hm-spin 800ms linear infinite' }} /> Billing</>)
                      : (<>Bill <ArrowRight size={14} strokeWidth={2} color="#fff" /></>)}
                  </DarkButton>
                )}
              </>
            }
          />
        </div>

        {/* À revoir : l'appel Siemens et l'audience de demain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BucketHeader
            entered={entered} delay={330}
            icon={<Clock4 size={16} strokeWidth={1.75} color={S.mutedForeground} />}
            label="Needs review"
            badge={<Badge tone="warning">2 pending</Badge>}
          />
          <TaskCard
            entered={entered} delay={400}
            icon={<Scale size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Siemens case lost" agent="Agent · Litigation" matter="Siemens - Litigation"
            body="We should appeal - I drafted the analysis and a note for the client"
            right={
              <>
                <Badge tone="warning">Needs you</Badge>
                <DarkButton onClick={() => {}}>Review <ArrowRight size={14} strokeWidth={2} color="#fff" /></DarkButton>
              </>
            }
          />
          <TaskCard
            entered={entered} delay={480}
            icon={<CalendarDays size={20} strokeWidth={1.75} color={S.foregroundQuaternary} />}
            title="Emergency hearing tomorrow" agent="Agent · Litigation" matter="Marchal - Dismissal"
            body="I can move your two meetings and brief you on the way there"
            right={
              <>
                <Badge tone="warning">Needs you</Badge>
                <GhostButton onClick={onOpenHearing}>Reschedule</GhostButton>
                <DarkButton onClick={onOpenHearing}>Review <ArrowRight size={14} strokeWidth={2} color="#fff" /></DarkButton>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

// ── Scene 2 - préparation de l'audience ──────────────────────────────────
// Timeline auto : steps → réunions déplacées → note complète → (scene 3).

// Les étapes passent par le vrai ReasoningStepper de l'app (icônes par type,
// gif plato-thinking sur l'étape en cours de streaming).
const HEARING_STEPS = [
  { type: 'read_documents', label: 'Reading the summons and the 14 exhibits on file' },
  { type: 'navigate', label: 'Clearing your morning - moving 2 meetings' },
  { type: 'summarize', label: 'Drafting the hearing note with authorities' },
];

function MeetingRow({ title, kind, from, to, moved, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
      animation: `hm-rise 460ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
    }}>
      <span style={{
        width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: S.background, border: `1px solid ${S.border}`, borderRadius: 6,
      }}>
        <CalendarDays size={16} strokeWidth={1.75} color={S.foregroundQuaternary} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: S.foreground }}>{title}</span>
        <span style={monoCaption()}>{kind}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: SANS, fontSize: 13, color: S.mutedForeground, whiteSpace: 'nowrap',
          textDecoration: moved ? 'line-through' : 'none', transition: 'text-decoration 200ms',
        }}>{from}</span>
        <ArrowRight size={13} strokeWidth={1.75} color={S.foregroundMuted} />
        <span style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 500, color: FB.success.text, whiteSpace: 'nowrap',
          padding: '3px 8px', borderRadius: 6, background: FB.success.subtle,
          opacity: moved ? 1 : 0, transform: moved ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 320ms ease, transform 320ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>{to}</span>
      </span>
    </div>
  );
}

function HearingNote() {
  return (
    <div style={{
      background: S.card, border: `1px solid ${S.border}`, borderRadius: 8,
      boxShadow: '0px 12px 24px rgba(26,26,26,0.06), 0px 2px 4px rgba(26,26,26,0.05)',
      padding: '26px 30px 30px', width: '100%',
      animation: 'hm-rise 640ms cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={15} strokeWidth={1.75} color={S.mutedForeground} />
          <span style={monoCaption()}>Hearing note · Marchal v. Optima Retail</span>
        </span>
        <Badge tone="warning">For review</Badge>
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 23, lineHeight: '29px', letterSpacing: '-0.35px', color: '#000', marginBottom: 4 }}>
        Interim proceedings - annulment of Ms Marchal's dismissal
      </div>
      <div style={{ ...monoCaption(), marginBottom: 18 }}>Labor court · Summary hearing · Tomorrow 9:00 AM</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: SANS, fontSize: 14, lineHeight: '22px', color: S.secondaryForeground }}>
        <p style={{ margin: 0 }}>
          <strong style={{ fontWeight: 600, color: S.foreground }}>Our position.</strong>{' '}
          Ms Marchal was dismissed nine days after testifying in the internal harassment
          investigation <Cite>Exhibit 7</Cite> <Cite>Exhibit 12</Cite>. A dismissal in retaliation
          for testimony is null and void <Cite>Art. L.1152-3</Cite>, which entitles her to
          reinstatement and full back pay rather than mere damages.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ fontWeight: 600, color: S.foreground }}>Why summary proceedings.</strong>{' '}
          The nullity is blatant enough to qualify as a manifestly unlawful disturbance, which the
          interim judge can stop without a trial on the merits <Cite>Art. R.1455-6</Cite>. The
          chronology, a spotless 11-year record <Cite>Exhibit 3</Cite> and the role being reposted
          three weeks later <Cite>Exhibit 15</Cite> leave no serious defense.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ fontWeight: 600, color: S.foreground }}>Authorities.</strong>{' '}
          Nullity of retaliatory dismissal <Cite>Cass. soc., 30 June 2016, n°15-10.557</Cite>;
          provisional reinstatement ordered in summary proceedings
          <Cite>Cass. soc., 31 March 2016, n°14-25.237</Cite>.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ fontWeight: 600, color: S.foreground }}>Tomorrow at the hearing.</strong>{' '}
          Lead with the timeline, ask for provisional reinstatement and a €8,400 provisional
          award, and pre-empt the "economic ground" defense with the repost of the role
          <Cite>Exhibit 15</Cite>. Full argument and exhibits bundle are in the case file.
        </p>
      </div>
    </div>
  );
}

function SceneHearing({ phase }) {
  // phase pilotée par le parent : indexe la progression de la timeline.
  const runAt = [1, 2, 4];   // phase à laquelle le step i passe en running
  const doneAt = [2, 4, 5];  // ... puis en done
  const visibleSteps = HEARING_STEPS
    .map((s, i) => ({ ...s, status: phase >= doneAt[i] ? 'done' : phase >= runAt[i] ? 'loading' : null }))
    .filter((s) => s.status);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'hidden', padding: '34px 74px 0' }}>
      <div style={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, animation: 'hm-rise 560ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <span style={monoCaption(BRAND_DEEP)}>Agent · Litigation - Emergency hearing</span>
          <span style={{ fontFamily: SERIF, fontSize: 30, lineHeight: '34px', letterSpacing: '-0.6px', color: '#000' }}>
            Preparing tomorrow's hearing.
            {' '}<em style={{ color: S.foregroundQuaternary }}>Here is what I did.</em>
          </span>
        </div>

        {visibleSteps.length > 0 && (
          // Zoom léger : garde le rendu app tout en restant lisible sur le hero.
          <div style={{ maxWidth: 520, zoom: 1.2 }}>
            <ReasoningStepper steps={visibleSteps} status="streaming" />
          </div>
        )}

        {phase >= 3 && (
          <div style={{
            background: S.card, border: `1px solid ${S.border}`, borderRadius: 8,
            boxShadow: '0px 1px 1px rgba(26,26,26,0.05)', overflow: 'hidden',
            animation: 'hm-rise 520ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <MeetingRow
              title="Kick-off - Doe closing" kind="Meeting · 45 min"
              from="Wed 9:00 AM" to="Thu 3:00 PM" moved={phase >= 4} delay={0}
            />
            <div style={{ height: 1, background: S.border, margin: '0 16px' }} />
            <MeetingRow
              title="Client call - Ms Marchal" kind="Call · 30 min"
              from="Wed 11:30 AM" to="Thu 5:00 PM" moved={phase >= 4} delay={140}
            />
          </div>
        )}

        {phase >= 5 && <HearingNote />}
      </div>
    </div>
  );
}

// ── Scene 3 - la prompt box en bas à droite ──────────────────────────────

const PROMPT_TEXT = "That's great, once we win tomorrow I'd like to ask the company to settle on a 60k€ damage for the employee. Run several scenarios to compute unfair dismissal compensation and over-paid hours.";

function PromptBox({ active }) {
  const [typed, setTyped] = useState(0);
  const done = typed >= PROMPT_TEXT.length;

  useEffect(() => {
    if (!active) { setTyped(0); return undefined; }
    let i = 0;
    let timer;
    const start = setTimeout(function tick() {
      i += 1;
      setTyped(i);
      if (i < PROMPT_TEXT.length) timer = setTimeout(tick, 26 + (PROMPT_TEXT[i - 1] === ' ' ? 14 : 0));
    }, 900);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, [active]);

  if (!active) return null;

  return (
    <div style={{
      position: 'absolute', right: 28, bottom: 28, width: 470, zIndex: 5,
      background: S.card, borderRadius: 10,
      boxShadow: '0px 32px 48px rgba(26,26,26,0.14), 0px 8px 16px rgba(26,26,26,0.08)',
      padding: '16px 16px 12px', animation: 'hm-rise 560ms cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <span className="hm-glow-bloom" aria-hidden="true" />
      <span className="hm-glow-ring" aria-hidden="true" />
      <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: '21px', color: S.foreground, minHeight: 105 }}>
        {PROMPT_TEXT.slice(0, typed)}
        {!done && <span style={{ display: 'inline-block', width: 1.5, height: 15, background: S.foreground, verticalAlign: '-2px', marginLeft: 1, animation: 'hm-caret 1s steps(1) infinite' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlatoIcon size={18} color={BRAND} />
          <span style={monoCaption(S.foregroundMuted)}>To · Agent Litigation</span>
        </span>
        <span style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={14} strokeWidth={1.75} color={S.mutedForeground} />
          </span>
          <span style={{
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, background: S.primary,
            boxShadow: done ? `0 0 0 4px ${colors.brand.subtle}, 0 0 12px rgba(244,122,44,0.45)` : 'none',
            transition: 'box-shadow 420ms ease',
          }}>
            <ArrowUp size={14} strokeWidth={2} color={S.primaryForeground} />
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Le stage 1440x900 + chrome du lab ────────────────────────────────────

export default function HeroMotionLab() {
  // 'app' = écran complet (V1) · 'extract' = extraits produit façon motions
  // du site précédent (V2, HeroMotionExtracts).
  const [variant, setVariant] = useState('app');
  const [scene, setScene] = useState(1);       // 1 morning · 2 hearing · 3 hearing+prompt
  const [phase, setPhase] = useState(0);       // timeline interne de la scene 2
  const [runId, setRunId] = useState(0);       // incrémenté pour rejouer
  const [scale, setScale] = useState(1);
  const [scaleX, setScaleX] = useState(1);     // échelle du stage extraits (1232x760)
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const at = (ms, fn) => timersRef.current.push(setTimeout(fn, ms));

  // Déroulé automatique de la scene 2, puis bascule en scene 3.
  const playHearing = useCallback(() => {
    clearTimers();
    setPhase(0);
    at(350, () => setPhase(1));    // step 1 running
    at(1700, () => setPhase(2));   // step 1 done, step 2 running
    at(2150, () => setPhase(3));   // carte réunions
    at(3100, () => setPhase(4));   // heures barrées + nouvelles heures, step 3 running
    at(4900, () => setPhase(5));   // steps done + la note apparaît
    at(6800, () => setScene(3));   // la prompt box entre en bas à droite
  }, []);

  const goto = useCallback((target) => {
    clearTimers();
    setRunId((r) => r + 1);
    if (target === 1) { setScene(1); setPhase(0); return; }
    setScene(target);
    if (target === 2) playHearing();
    else setPhase(5); // scene 3 directe : scene 2 terminée + prompt
  }, [playHearing]);

  useEffect(() => clearTimers, []);

  // Mise à l'échelle du stage dans la fenêtre.
  useEffect(() => {
    const fit = () => {
      setScale(Math.min(1, (window.innerWidth - 64) / STAGE_W, (window.innerHeight - 150) / STAGE_H));
      setScaleX(Math.min(1, (window.innerWidth - 64) / 1232, (window.innerHeight - 210) / 760));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const chip = (n, label) => (
    <button
      key={n}
      onClick={() => goto(n)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px',
        borderRadius: 100, cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
        background: scene === n ? S.primary : S.card,
        color: scene === n ? S.primaryForeground : S.secondaryForeground,
        border: `1px solid ${scene === n ? S.primary : S.borderStrong}`,
      }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.muted, fontFamily: SANS }}>
      <style>{`
        @keyframes hm-spin { to { transform: rotate(360deg); } }
        @keyframes hm-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes hm-caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        @keyframes hm-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        /* Bordure à glow mobile (comète + bloom), même recette que le composer
           hero de l'app (AssistantComposer), rayon adapté aux cartes r10. */
        @property --hm-glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes hm-glow-spin { to { --hm-glow-angle: 360deg; } }
        .hm-glow-ring, .hm-glow-bloom {
          position: absolute; border-radius: 11px; pointer-events: none;
          animation: hm-glow-spin 3.4s linear infinite;
        }
        .hm-glow-ring {
          inset: -1px; padding: 1px; z-index: 1;
          background:
            conic-gradient(from var(--hm-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg),
            linear-gradient(#cbc7c4, #cbc7c4);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
        .hm-glow-bloom {
          inset: -3px; padding: 4px; z-index: 0; filter: blur(7px); opacity: 0.75;
          background: conic-gradient(from var(--hm-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
        }
      `}</style>

      {/* Chrome du lab (hors stage, pas dans l'enregistrement) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 32px 14px' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: S.foregroundMuted }}>Lab · Landing hero</div>
          <div style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: '-0.3px', color: S.foreground }}>Hero motion - 3 key screens</div>
        </div>
        {/* Bascule V1 / V2 */}
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 100, background: S.background, border: `1px solid ${S.border}` }}>
          {[['app', 'Écran complet'], ['extract', 'Extraits motion']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              style={{
                height: 24, padding: '0 12px', borderRadius: 100, cursor: 'pointer', border: 'none',
                fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
                background: variant === v ? S.primary : 'transparent',
                color: variant === v ? S.primaryForeground : S.secondaryForeground,
              }}
            >{label}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {variant === 'app' && (
          <>
            <span style={{ fontFamily: SANS, fontSize: 12.5, color: S.mutedForeground }}>
              Cliquez BILL, puis RESCHEDULE : la suite se déroule toute seule.
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {chip(1, '1 · Morning brief')}
              {chip(2, '2 · Hearing prep')}
              {chip(3, '3 · Prompt')}
            </div>
            <button
              onClick={() => goto(scene === 1 ? 1 : 2)}
              style={{
                height: 28, padding: '0 12px', borderRadius: 100, cursor: 'pointer',
                fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
                background: S.card, color: S.foreground, border: `1px solid ${S.borderStrong}`,
              }}
            >Rejouer</button>
          </>
        )}
      </div>

      {variant === 'extract' && <HeroMotionExtracts scale={scaleX} />}

      {/* Stage 1440x900 */}
      <div style={{ display: variant === 'app' ? 'flex' : 'none', justifyContent: 'center', paddingBottom: 32 }}>
        <div style={{ width: STAGE_W * scale, height: STAGE_H * scale }}>
          <div
            key={runId}
            style={{
              width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left',
              display: 'flex', background: S.background, overflow: 'hidden', position: 'relative',
              borderRadius: 10, border: `1px solid ${S.borderStrong}`,
              boxShadow: '0px 24px 60px rgba(26,26,26,0.12)',
            }}
          >
            <Sidebar />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <HeaderBand crumb={scene === 1 ? 'This morning' : 'Hearing tomorrow'} />
              {scene === 1
                ? <SceneMorning onOpenHearing={() => goto(2)} />
                : <SceneHearing phase={phase} />}
              <Composer />
              <PromptBox active={scene === 3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
