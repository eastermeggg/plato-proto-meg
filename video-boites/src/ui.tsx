import React from 'react';
import {Easing, interpolate, staticFile} from 'remotion';
import {
  Check,
  FileText,
  Lock,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  CREAM,
  DOCRED,
  FAINT,
  INK,
  LINE,
  LINE_SOFT,
  MAILBLUE,
  MONO,
  MUTE,
  NOUVEAU_BG,
  NOUVEAU_TXT,
  SUIVI,
  WHITE,
  softShadow,
} from './theme';

// Répliques statiques (fidèles) des écrans Réglages › Ma boîte / Connecteurs
// et du picker multi-boîtes d'import-v2 - mêmes métriques que le prototype.

const INK2_C = '#57534e';

export const monoLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
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

// ── Marques fournisseur ─────────────────────────────────────────────────────

export const OutlookLogo: React.FC<{size?: number}> = ({size = 20}) => (
  <img src={staticFile('outlook.svg')} alt="" style={{width: size, height: size, flexShrink: 0}} />
);

export const GmailMark: React.FC<{size?: number}> = ({size = 18}) => (
  <svg viewBox="0 0 24 24" style={{width: size, height: size, flexShrink: 0}}>
    <path
      fill="#EA4335"
      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
    />
  </svg>
);

export const ProviderButton: React.FC<{provider: 'outlook' | 'gmail'; label: string}> = ({
  provider,
  label,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 36,
      padding: '0 16px',
      borderRadius: 8,
      background: WHITE,
      border: `1px solid ${LINE}`,
      color: INK,
      fontSize: 14,
      fontWeight: 500,
      flexShrink: 0,
      boxShadow: softShadow,
    }}
  >
    {provider === 'outlook' ? <OutlookLogo size={18} /> : <GmailMark size={16} />}
    {label}
  </span>
);

// ── Chips de scope : la teinte dit qui voit la boîte ────────────────────────

export const ScopeChip: React.FC<{scope: 'commune' | 'perso'}> = ({scope}) =>
  scope === 'commune' ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 6px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: NOUVEAU_BG,
        color: NOUVEAU_TXT,
        flexShrink: 0,
      }}
    >
      <Users style={{width: 12, height: 12}} strokeWidth={2} />
      Commune
    </span>
  ) : (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 6px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        background: CREAM,
        color: INK2_C,
        flexShrink: 0,
      }}
    >
      <Lock style={{width: 11, height: 11}} strokeWidth={2} />
      Personnelle
    </span>
  );

export const ConnecteeBadge: React.FC = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: 20,
      padding: '0 6px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
      background: '#e4efe8',
      color: '#4a9168',
      flexShrink: 0,
    }}
  >
    <Check style={{width: 12, height: 12}} strokeWidth={3} />
    Connectée
  </span>
);

// ── Carte réglages : en-tête + rangées ──────────────────────────────────────

export const SettingsCard: React.FC<{
  icon: 'users' | 'mail';
  title: string;
  note: string;
  children: React.ReactNode;
}> = ({icon, title, note, children}) => {
  const Icon = icon === 'users' ? Users : Mail;
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        boxShadow: softShadow,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderBottom: `1px solid ${LINE_SOFT}`,
        }}
      >
        <Icon style={{width: 16, height: 16, color: INK2_C, flexShrink: 0}} strokeWidth={1.75} />
        <span style={{fontSize: 14, fontWeight: 500, color: INK, flexShrink: 0}}>{title}</span>
        <span
          style={{
            fontSize: 12,
            color: FAINT,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {note}
        </span>
      </div>
      {children}
    </div>
  );
};

// Rangée d'une boîte connectée : adresse · chip scope · Connectée, méta
// « Lecture seule · vérifiée » en dessous, actions à droite.
export const MailboxRow: React.FC<{
  address: string;
  meta: string;
  scope: 'commune' | 'perso';
  actions?: boolean;
}> = ({address, meta, scope, actions = true}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 18px',
      borderBottom: `1px solid ${LINE_SOFT}`,
    }}
  >
    <span
      style={{
        width: 38,
        height: 38,
        borderRadius: 9,
        background: '#dfe8f5',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Mail style={{width: 19, height: 19, color: MAILBLUE}} strokeWidth={1.75} />
    </span>
    <span style={{flex: 1, minWidth: 0}}>
      <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 14, fontWeight: 500, color: INK}}>{address}</span>
        <ScopeChip scope={scope} />
        <ConnecteeBadge />
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          color: INK2_C,
          marginTop: 3,
        }}
      >
        <Lock style={{width: 11, height: 11, flexShrink: 0}} strokeWidth={2} />
        {meta}
      </span>
    </span>
    {actions ? (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0}}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 500,
            color: INK2_C,
          }}
        >
          <RefreshCw style={{width: 12, height: 12}} strokeWidth={1.75} />
          Vérifier
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 30,
            padding: '0 12px',
            borderRadius: 7,
            border: `1px solid ${LINE}`,
            background: WHITE,
            fontSize: 12,
            fontWeight: 500,
            color: INK2_C,
          }}
        >
          Déconnecter
        </span>
      </span>
    ) : null}
  </div>
);

// ── État vide : le geste de connexion EST l'écran ───────────────────────────

export const GuaranteePills: React.FC = () => (
  <span style={{display: 'inline-flex', gap: 8}}>
    {[
      {Icon: Lock, label: 'Lecture seule'},
      {Icon: ShieldCheck, label: 'Hébergé en UE'},
      {Icon: RefreshCw, label: 'Réversible'},
    ].map(({Icon, label}) => (
      <span
        key={label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          height: 24,
          padding: '0 10px',
          borderRadius: 999,
          background: CREAM,
          fontSize: 11,
          fontWeight: 500,
          color: INK2_C,
        }}
      >
        <Icon style={{width: 12, height: 12, color: SUIVI}} strokeWidth={1.75} />
        {label}
      </span>
    ))}
  </span>
);

export const EmptyMailState: React.FC<{
  icon: 'users' | 'mail';
  title: string;
  body: string;
  withActions?: boolean;
}> = ({icon, title, body, withActions = true}) => {
  const Icon = icon === 'users' ? Users : Mail;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '34px 30px 30px',
      }}
    >
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: 999,
          background: CREAM,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon style={{width: 20, height: 20, color: INK}} strokeWidth={1.75} />
      </span>
      <p style={{fontSize: 15, fontWeight: 500, color: INK, margin: '12px 0 0'}}>{title}</p>
      <p style={{fontSize: 13, lineHeight: '19px', color: INK2_C, margin: '5px 0 0', maxWidth: 440}}>
        {body}
      </p>
      {withActions ? (
        <>
          <span style={{display: 'inline-flex', gap: 10, marginTop: 18}}>
            <ProviderButton provider="outlook" label="Connecter Outlook" />
            <ProviderButton provider="gmail" label="Connecter Gmail" />
          </span>
          <span style={{marginTop: 16}}>
            <GuaranteePills />
          </span>
        </>
      ) : null}
    </div>
  );
};

// ── Rangée d'ajout gated : UN CTA, puis le choix du fournisseur ─────────────

export const AddRow: React.FC<{label: string; open: number}> = ({label, open}) => (
  <div style={{position: 'relative', padding: '10px 18px', minHeight: 52}}>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        fontSize: 13,
        fontWeight: 500,
        color: INK2_C,
        opacity: 1 - open,
      }}
    >
      <Plus style={{width: 15, height: 15}} strokeWidth={1.75} />
      {label}
    </span>
    <span
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        top: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: open,
      }}
    >
      <span style={{flex: 1, fontSize: 12, color: FAINT}}>Avec quel fournisseur ?</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          background: WHITE,
          border: `1px solid ${LINE}`,
          fontSize: 13,
          fontWeight: 500,
          color: INK,
          boxShadow: softShadow,
        }}
      >
        <OutlookLogo size={16} /> Outlook
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          background: WHITE,
          border: `1px solid ${LINE}`,
          fontSize: 13,
          fontWeight: 500,
          color: INK,
          boxShadow: softShadow,
        }}
      >
        <GmailMark size={14} /> Gmail
      </span>
      <X style={{width: 14, height: 14, color: FAINT}} strokeWidth={2} />
    </span>
  </div>
);

// Bandeau de l'invariant privacy (Ma boîte).
export const InvariantBanner: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '13px 16px',
      borderRadius: 10,
      background: '#f6f5f2',
      border: `1px solid ${LINE}`,
    }}
  >
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: WHITE,
        border: `1px solid ${LINE}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Lock style={{width: 13, height: 13, color: INK}} strokeWidth={1.75} />
    </span>
    <p style={{fontSize: 13, lineHeight: '20px', color: INK2_C, margin: 0}}>
      Votre boîte n'apparaît jamais dans la recherche ni dans les sources d'un autre membre.{' '}
      <span style={{fontWeight: 500, color: INK}}>Le seul pont vers le cabinet est le geste de verser</span>{' '}
      : ce qui entre au dossier est partagé, le reste de la boîte jamais.
    </p>
  </div>
);

// ── Picker multi-boîtes (colonne récolte d'import-v2) ───────────────────────

export const PickerHeader: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 14px 4px'}}>
    <OutlookLogo size={30} />
    <span style={{minWidth: 0}}>
      <span style={{display: 'block', fontSize: 14, fontWeight: 500, color: INK, lineHeight: '20px'}}>
        Vos boîtes
      </span>
      <span style={{display: 'block', fontSize: 12, color: MUTE, lineHeight: '16px'}}>
        Boîte cabinet · cabinet@durand-avocats.fr
      </span>
      <span style={{display: 'block', fontSize: 12, color: MUTE, lineHeight: '16px'}}>
        Ma boîte · marie@durand-avocats.fr
      </span>
    </span>
  </div>
);

export const SearchBar: React.FC<{text: string; caret?: boolean}> = ({text, caret = false}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 11px',
      height: 36,
      background: WHITE,
      border: `1px solid ${text ? '#78716c' : LINE}`,
      borderRadius: 8,
      boxShadow: '0px 1px 1px rgba(26,26,26,0.05)',
    }}
  >
    <Search style={{width: 16, height: 16, color: MUTE, flexShrink: 0}} strokeWidth={1.75} />
    {text ? (
      <span style={{fontSize: 14, color: INK}}>
        {text}
        {caret ? <span style={{color: INK, fontWeight: 300}}>|</span> : null}
      </span>
    ) : (
      <span style={{fontSize: 14, color: FAINT}}>Rechercher un dossier ou un échange…</span>
    )}
  </div>
);

export const SectionMono: React.FC<{children: React.ReactNode}> = ({children}) => (
  <p style={{...monoLabel, padding: '10px 14px 4px', margin: 0}}>{children}</p>
);

// Carte candidat du picker : sujet · date · expéditeur · note de provenance.
export const PickerRow: React.FC<{
  subject: string;
  date: string;
  sender: string;
  pj?: number;
  note?: string;
  excerpt?: string;
}> = ({subject, date, sender, pj = 0, note, excerpt}) => (
  <div style={{padding: '10px 14px', borderTop: `1px solid ${LINE_SOFT}`, background: WHITE}}>
    <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          fontWeight: 500,
          color: INK,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {subject}
      </span>
    </span>
    <span style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, minWidth: 0}}>
      <span style={{fontSize: 12, fontWeight: 500, color: MUTE, flexShrink: 0}}>{date}</span>
      <Dot />
      <span
        style={{
          fontSize: 12,
          color: MUTE,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {sender}
      </span>
      {pj > 0 ? (
        <>
          <Dot />
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0}}>
            <Paperclip style={{width: 12, height: 12, color: MAILBLUE, opacity: 0.6}} strokeWidth={1.75} />
            <span style={{fontFamily: MONO, fontSize: 11, fontWeight: 500, color: MUTE}}>{pj}</span>
          </span>
        </>
      ) : null}
      {note ? (
        <>
          <Dot />
          <span style={{fontSize: 12, color: MUTE, fontStyle: 'normal', flexShrink: 0}}>{note}</span>
        </>
      ) : null}
    </span>
    {excerpt ? (
      <p
        style={{
          fontSize: 12,
          lineHeight: '16px',
          color: MUTE,
          margin: '7px 0 0',
          paddingLeft: 8,
          borderLeft: '2px solid #7e22ce',
        }}
      >
        {excerpt}
      </p>
    ) : null}
  </div>
);

const Dot: React.FC = () => (
  <span
    style={{
      width: 3,
      height: 3,
      background: '#d6d3d1',
      transform: 'rotate(45deg)',
      flexShrink: 0,
    }}
  />
);

// Chapeau d'un groupe du bordereau + tag de provenance boîte.
export const ChapeauCard: React.FC<{
  title: string;
  tag: 'perso' | 'deux';
  pieces: string[];
}> = ({title, tag, pieces}) => (
  <div
    style={{
      background: WHITE,
      border: `1px solid ${LINE}`,
      borderRadius: 8,
      boxShadow: softShadow,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 14px',
        borderBottom: `1px solid ${LINE_SOFT}`,
      }}
    >
      <Mail style={{width: 16, height: 16, color: INK2_C, flexShrink: 0}} strokeWidth={1.33} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          fontWeight: 500,
          color: INK,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 20,
          padding: '0 6px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          background: CREAM,
          color: INK2_C,
          flexShrink: 0,
        }}
      >
        {tag === 'perso' ? 'Depuis votre boîte' : 'Aussi dans votre boîte'}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 26,
          padding: '0 8px',
          borderRadius: 4,
          background: CREAM,
          fontSize: 12,
          fontWeight: 500,
          color: '#44403c',
          flexShrink: 0,
        }}
      >
        <X style={{width: 11, height: 11}} strokeWidth={2} />
        Retirer
      </span>
    </div>
    <div style={{padding: '6px 14px 10px'}}>
      {pieces.map((p, i) => (
        <span
          key={p}
          style={{display: 'flex', alignItems: 'center', gap: 8, height: 30, minWidth: 0}}
        >
          {i === 0 ? (
            <Mail style={{width: 15, height: 15, color: MUTE, flexShrink: 0}} strokeWidth={1.33} />
          ) : (
            <FileText style={{width: 15, height: 15, color: DOCRED, flexShrink: 0}} strokeWidth={1.33} />
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: INK,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {p}
          </span>
        </span>
      ))}
    </div>
  </div>
);

// Toast sombre (signal d'exposition - dit une fois).
export const Toast: React.FC<{text: string}> = ({text}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 40,
      padding: '0 16px',
      borderRadius: 8,
      background: INK,
      color: WHITE,
      fontSize: 13,
      boxShadow: '0 8px 24px -6px rgba(28,25,23,0.35)',
    }}
  >
    <Check style={{width: 15, height: 15, color: '#8fc7a6', flexShrink: 0}} strokeWidth={2.5} />
    {text}
  </span>
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
