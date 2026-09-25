import React from 'react';
import {Easing, interpolate, staticFile} from 'remotion';
import {
  ArrowUp,
  BookOpen,
  Folder,
  FolderOpen,
  HelpCircle,
  Home,
  Landmark,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Mic,
  PencilLine,
  Scale,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  BORDER,
  BRAND,
  BRAND_DARK,
  CREAM,
  FAINT,
  FOCUS,
  INK,
  LINE,
  LINE_SOFT,
  MONO,
  MUTE,
  NAV_BG,
  SERIF,
  softShadow,
  TERTIARY_FG,
  WHITE,
} from './theme';

// Répliques statiques (fidèles) des surfaces Accueil (composer hero + pills) et
// Mes conversations (table) du prototype - mêmes métriques, tokens et copies.

export const monoLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: FAINT,
};

export const MonoChip: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 15,
      fontWeight: 500,
      color: '#44403c',
      background: WHITE,
      border: `1px solid ${LINE}`,
      borderRadius: 8,
      padding: '6px 14px',
      boxShadow: softShadow,
    }}
  >
    {children}
  </span>
);

// ── Shell : rail + zone de contenu ──────────────────────────────────────────

type NavKey = 'accueil' | 'dossiers' | 'conversations' | 'parametres';

const NAV: {key: NavKey; label: string; Icon: React.FC<any>}[] = [
  {key: 'accueil', label: 'Accueil', Icon: Home},
  {key: 'dossiers', label: 'Mes dossiers', Icon: FolderOpen},
  {key: 'conversations', label: 'Mes conversations', Icon: MessageCircle},
  {key: 'parametres', label: 'Paramètres', Icon: Settings},
];

const NavRow: React.FC<{
  label: string;
  Icon: React.FC<any>;
  active: boolean;
  glow?: number;
}> = ({label, Icon, active, glow = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 42,
      padding: '0 12px',
      borderRadius: 9,
      background: active ? WHITE : glow > 0 ? `rgba(255,255,255,${0.9 * glow})` : 'transparent',
      border: `1px solid ${active || glow > 0 ? LINE : 'transparent'}`,
      boxShadow: active || glow > 0.5 ? softShadow : undefined,
      color: active ? INK : TERTIARY_FG,
    }}
  >
    <Icon
      style={{width: 19, height: 19, color: active ? INK : MUTE, flexShrink: 0}}
      strokeWidth={active ? 2 : 1.75}
    />
    <span style={{fontSize: 15, fontWeight: active ? 600 : 500}}>{label}</span>
  </div>
);

// glow: 0..1 sur l'item « conversations » pour signaler le survol avant clic.
export const AppShell: React.FC<{
  active: NavKey;
  navGlow?: number;
  children: React.ReactNode;
}> = ({active, navGlow = 0, children}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', background: PAPER_BG}}>
    {/* rail */}
    <div
      style={{
        width: 288,
        flexShrink: 0,
        background: NAV_BG,
        borderRight: `1px solid ${LINE}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 18px 20px',
      }}
    >
      <img
        src={staticFile('plato-wordmark.svg')}
        alt="Plato"
        style={{width: 96, height: 30.7, objectFit: 'contain', marginLeft: 8, marginBottom: 30}}
      />
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {NAV.map((n) => (
          <NavRow
            key={n.key}
            label={n.label}
            Icon={n.Icon}
            active={active === n.key}
            glow={n.key === 'conversations' && active !== 'conversations' ? navGlow : 0}
          />
        ))}
      </div>
      <div style={{marginTop: 28, ...monoLabel, fontSize: 11, paddingLeft: 12}}>
        Conversations récentes
      </div>
      <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', gap: 2}}>
        {['Prescription biennale', 'Barème Macron 8 ans', 'Fracture du poignet'].map((t) => (
          <div
            key={t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              height: 32,
              padding: '0 12px',
              fontSize: 13.5,
              color: MUTE,
            }}
          >
            <MessageSquare style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={1.75} />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t}
            </span>
          </div>
        ))}
      </div>
      <div style={{marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px'}}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: '#e7d9c8',
            color: BRAND_DARK,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          MR
        </span>
        <span style={{fontSize: 13.5, fontWeight: 500, color: INK}}>Meghan Régior</span>
      </div>
    </div>
    {/* contenu */}
    <div style={{flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden'}}>{children}</div>
  </div>
);

const PAPER_BG = '#f8f7f5';

// ── Accueil : eyebrow + question serif + composer + pills ────────────────────

export const HeroComposer: React.FC<{
  typed: string;
  caret?: boolean;
  canSend?: boolean;
  sendFlash?: number;
}> = ({typed, caret = false, canSend = false, sendFlash = 0}) => (
  <div style={{position: 'relative', width: 720}}>
    {/* halo brand */}
    <div
      style={{
        position: 'absolute',
        inset: -3,
        borderRadius: 16,
        background: `linear-gradient(120deg, ${BRAND}, #f6a765 60%, ${BRAND})`,
        opacity: 0.55,
        filter: 'blur(9px)',
      }}
    />
    <div
      style={{
        position: 'relative',
        background: WHITE,
        border: `1px solid ${canSend ? FOCUS : LINE}`,
        borderRadius: 14,
        boxShadow:
          '0px 24px 84px -20px rgba(0,0,0,0.25), 0px 8px 10px -1px rgba(26,26,26,0.05)',
        padding: '20px 20px 14px',
      }}
    >
      <div style={{minHeight: 30, display: 'flex', alignItems: 'flex-start'}}>
        {typed ? (
          <span style={{fontSize: 19, lineHeight: '28px', color: INK}}>
            {typed}
            {caret ? <span style={{color: BRAND_DARK, fontWeight: 300}}>|</span> : null}
          </span>
        ) : (
          <span style={{fontSize: 19, lineHeight: '28px', color: FAINT}}>
            Posez une question de droit…
          </span>
        )}
      </div>
      <div style={{display: 'flex', alignItems: 'center', marginTop: 14}}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            height: 34,
            padding: '0 12px',
            borderRadius: 9,
            border: `1px solid ${LINE}`,
            color: MUTE,
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <Lightbulb style={{width: 16, height: 16}} strokeWidth={1.75} /> Suggestions
        </span>
        <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10}}>
          <Mic style={{width: 20, height: 20, color: FAINT}} strokeWidth={1.75} />
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: canSend ? INK : '#e7e5e3',
              transform: `scale(${1 + sendFlash * 0.12})`,
            }}
          >
            <ArrowUp
              style={{width: 20, height: 20, color: canSend ? WHITE : FAINT}}
              strokeWidth={2.25}
            />
          </span>
        </span>
      </div>
    </div>
  </div>
);

const PILLS: {Icon: React.FC<any>; label: string}[] = [
  {Icon: Landmark, label: 'Chercher une jurisprudence'},
  {Icon: BookOpen, label: 'Vérifier un délai de prescription'},
  {Icon: HelpCircle, label: 'Poser une question de droit'},
  {Icon: Scale, label: 'Expliquer une règle applicable'},
];

export const SuggestionPills: React.FC = () => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, width: 720, paddingLeft: 4}}>
    {PILLS.map(({Icon, label}) => (
      <span
        key={label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          height: 34,
          padding: '0 13px 0 11px',
          borderRadius: 9,
          border: `1px solid ${BORDER}`,
          background: WHITE,
          fontSize: 13.5,
          color: MUTE,
        }}
      >
        <Icon style={{width: 15, height: 15, color: TERTIARY_FG}} strokeWidth={1.75} />
        {label}
      </span>
    ))}
  </div>
);

// ── Conversation : bulle question + réponse assistant ────────────────────────

export const UserBubble: React.FC<{text: string}> = ({text}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
    <div
      style={{
        maxWidth: 620,
        background: CREAM,
        border: `1px solid ${LINE}`,
        borderRadius: 14,
        padding: '13px 18px',
        fontSize: 17,
        lineHeight: '25px',
        color: INK,
      }}
    >
      {text}
    </div>
  </div>
);

export const AssistantBlock: React.FC<{
  lines: {text: React.ReactNode; shown: number}[];
  thinking?: number;
}> = ({lines, thinking = 0}) => (
  <div style={{display: 'flex', gap: 14, maxWidth: 720}}>
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        background: '#f4ede3',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Sparkles style={{width: 17, height: 17, color: BRAND_DARK}} strokeWidth={1.75} />
    </span>
    <div style={{flex: 1, minWidth: 0}}>
      {thinking > 0 ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: MONO,
            fontSize: 12.5,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: MUTE,
            opacity: thinking,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: BRAND,
            }}
          />
          Recherche dans le Code du travail…
        </span>
      ) : null}
      {lines.map((l, i) => (
        <p
          key={i}
          style={{
            fontSize: 17,
            lineHeight: '26px',
            color: INK,
            margin: i === 0 ? '2px 0 0' : '14px 0 0',
            opacity: l.shown,
            transform: `translateY(${(1 - l.shown) * 6}px)`,
          }}
        >
          {l.text}
        </p>
      ))}
    </div>
  </div>
);

// ── Mes conversations : en-tête + table ──────────────────────────────────────

export const PageHeaderBar: React.FC<{title: string}> = ({title}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0 40px',
      height: 84,
      borderBottom: `1px solid ${LINE}`,
    }}
  >
    <span style={{fontFamily: SERIF, fontSize: 27, fontWeight: 500, letterSpacing: '-0.6px', color: INK}}>
      {title}
    </span>
    <span
      style={{
        marginLeft: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 16px',
        borderRadius: 10,
        background: INK,
        color: WHITE,
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      <PencilLine style={{width: 16, height: 16}} strokeWidth={1.75} /> Nouvelle conversation
    </span>
  </div>
);

export type ConvRow = {
  question: string;
  dossier: string | null;
  activity: string;
  fresh?: number; // 0..1 - surbrillance d'apparition
};

export const ConversationsTable: React.FC<{rows: ConvRow[]}> = ({rows}) => (
  <div
    style={{
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: WHITE,
    }}
  >
    {/* header */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: 44,
        borderBottom: `1px solid ${BORDER}`,
        ...monoLabel,
        fontSize: 11.5,
        color: MUTE,
      }}
    >
      <span style={{flex: 1}}>Question</span>
      <span style={{width: 300}}>Dossier</span>
      <span style={{width: 200}}>Dernière activité</span>
    </div>
    {rows.map((r, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          height: 62,
          borderBottom: i < rows.length - 1 ? `1px solid ${LINE_SOFT}` : undefined,
          background: r.fresh
            ? `rgba(244,122,44,${0.07 * r.fresh})`
            : WHITE,
        }}
      >
        <span style={{flex: 1, display: 'flex', alignItems: 'center', gap: 11, minWidth: 0}}>
          <MessageSquare
            style={{width: 17, height: 17, color: r.fresh ? BRAND_DARK : MUTE, flexShrink: 0}}
            strokeWidth={1.75}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: INK,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {r.question}
          </span>
          {r.fresh && r.fresh > 0.4 ? (
            <span
              style={{
                flexShrink: 0,
                height: 20,
                padding: '0 7px',
                borderRadius: 5,
                background: '#f4e7d9',
                color: BRAND_DARK,
                fontSize: 11,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                opacity: r.fresh,
              }}
            >
              À l'instant
            </span>
          ) : null}
        </span>
        <span style={{width: 300, display: 'flex', alignItems: 'center', gap: 8}}>
          {r.dossier ? (
            <>
              <Folder style={{width: 15, height: 15, color: TERTIARY_FG, flexShrink: 0}} strokeWidth={1.75} />
              <span style={{fontSize: 14, color: INK}}>{r.dossier}</span>
            </>
          ) : (
            <span style={{fontSize: 14, color: FAINT}}>Sans dossier</span>
          )}
        </span>
        <span style={{width: 200, fontSize: 14, color: MUTE}}>{r.activity}</span>
      </div>
    ))}
  </div>
);

// ── Curseur (le geste, littéralement) ───────────────────────────────────────

export type CursorKey = {f: number; x: number; y: number};

const ease = Easing.bezier(0.35, 0, 0.25, 1);

export const cursorXY = (frame: number, keys: CursorKey[]) => {
  const fs = keys.map((k) => k.f);
  const x = interpolate(frame, fs, keys.map((k) => k.x), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const y = interpolate(frame, fs, keys.map((k) => k.y), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  return {x, y};
};

export const Cursor: React.FC<{x: number; y: number; clicks?: number[]; frame: number}> = ({
  x,
  y,
  clicks = [],
  frame,
}) => {
  const active = clicks.find((c) => frame >= c && frame < c + 18);
  const p = active === undefined ? 0 : (frame - active) / 18;
  const down = active !== undefined && frame - active < 6;
  return (
    <div style={{position: 'absolute', left: x, top: y, zIndex: 80, pointerEvents: 'none'}}>
      {active !== undefined ? (
        <span
          style={{
            position: 'absolute',
            left: -4 - 22 * p,
            top: -4 - 22 * p,
            width: 8 + 44 * p,
            height: 8 + 44 * p,
            borderRadius: 999,
            border: '2px solid rgba(41,37,36,0.45)',
            opacity: 1 - p,
          }}
        />
      ) : null}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        style={{transform: down ? 'scale(0.85)' : undefined, transformOrigin: '4px 3px'}}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z"
          fill={INK}
          stroke={WHITE}
          strokeWidth="1.4"
        />
      </svg>
    </div>
  );
};
