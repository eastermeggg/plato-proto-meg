import React from 'react';
import {Easing, interpolate, staticFile} from 'remotion';
import {
  AtSign,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Sparkles,
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
  PAPER,
  SUIVI,
  SUIVI_BG,
  SUIVI_TXT,
  WARN_BG,
  WARN_TXT,
  WHITE,
  softShadow,
} from './theme';

// Répliques statiques (fidèles) des composants du lab /ui-kit/import-dossier -
// mêmes métriques : coche 16, rangée mail py-8, cartes rayon 12, panneau 440.

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

// ── Contrôles ───────────────────────────────────────────────────────────────

// `p` : progression 0→1 de la coche (anim de pose).
export const Checkbox: React.FC<{p?: number}> = ({p = 0}) => {
  const on = p > 0.01;
  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1px solid ${on ? INK : '#d6d3d1'}`,
        background: on ? INK : WHITE,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: on ? undefined : '0px 1px 1px rgba(26,26,26,0.05)',
      }}
    >
      {on ? (
        <Check
          style={{width: 12, height: 12, color: WHITE, transform: `scale(${Math.min(1, p)})`}}
          strokeWidth={3}
        />
      ) : null}
    </span>
  );
};

// LabSwitch - `p` : progression 0→1 du passage on.
export const Switchy: React.FC<{p?: number}> = ({p = 0}) => (
  <span
    style={{
      width: 36,
      height: 20,
      borderRadius: 999,
      background: p > 0.5 ? INK : '#e0ddd5',
      position: 'relative',
      display: 'inline-block',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: 2,
        left: 2 + 16 * p,
        width: 16,
        height: 16,
        borderRadius: 999,
        background: WHITE,
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
      }}
    />
  </span>
);

// ── Badges (mêmes couleurs, mêmes emplacements partout) ─────────────────────

export const SuiviBadge: React.FC<{on?: boolean}> = ({on = true}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      fontWeight: 500,
      color: on ? SUIVI : FAINT,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: on ? SUIVI : 'transparent',
        border: on ? undefined : `1px solid ${FAINT}`,
      }}
    />
    {on ? 'Suivi' : 'Non suivi'}
  </span>
);

export const NouveauBadge: React.FC = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 6px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
      background: NOUVEAU_BG,
      color: NOUVEAU_TXT,
      flexShrink: 0,
    }}
  >
    Nouveau
  </span>
);

export const CountBadge: React.FC<{n: number}> = ({n}) =>
  n > 0 ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 6px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        background: NOUVEAU_BG,
        color: NOUVEAU_TXT,
        flexShrink: 0,
      }}
    >
      +{n}
    </span>
  ) : null;

export const TypeChip: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 6px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
      background: CREAM,
      color: MUTE,
      flexShrink: 0,
    }}
  >
    {children}
  </span>
);

// ── Découpe : off « Découper » sobre, on pill verte « Sera découpé » ────────

export const Decoupe: React.FC<{on?: boolean}> = ({on = false}) =>
  on ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        background: SUIVI_BG,
        color: SUIVI_TXT,
        flexShrink: 0,
      }}
    >
      <Check style={{width: 12, height: 12}} strokeWidth={2.5} />
      Sera découpé
    </span>
  ) : (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        color: MUTE,
        flexShrink: 0,
      }}
    >
      <Scissors style={{width: 12, height: 12}} strokeWidth={1.75} />
      Découper
    </span>
  );

// Coude d'indentation des PJ.
export const Elbow: React.FC = () => (
  <span style={{width: 18, height: 18, flexShrink: 0}}>
    <span
      style={{
        display: 'block',
        width: 15,
        height: 18,
        marginLeft: 3,
        borderLeft: '1.11px solid #d6d3d1',
        borderBottom: '1.11px solid #d6d3d1',
        borderBottomLeftRadius: 5,
      }}
    />
  </span>
);

export const OutlookLogo: React.FC<{size?: number}> = ({size = 32}) => (
  <img src={staticFile('outlook.svg')} alt="" style={{width: size, height: size, flexShrink: 0}} />
);

// ── Recherche (colonne mail) ────────────────────────────────────────────────

export const SearchBar: React.FC<{text: string; placeholder?: string; caret?: boolean}> = ({
  text,
  placeholder = 'Rechercher un dossier ou un échange…',
  caret = false,
}) => (
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
      <span style={{fontSize: 14, color: FAINT}}>{placeholder}</span>
    )}
  </div>
);

// ── Lignes de la colonne mail ───────────────────────────────────────────────

export const MonoHeader: React.FC<{children: React.ReactNode}> = ({children}) => (
  <p style={{...monoLabel, padding: '8px 12px 4px', margin: 0}}>{children}</p>
);

export const FolderRow: React.FC<{
  name: string;
  path?: string;
  meta: string;
  check?: number;
}> = ({name, path, meta, check = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      background: check > 0.5 ? CREAM : 'transparent',
    }}
  >
    <Checkbox p={check} />
    <Folder style={{width: 16, height: 16, color: INK2_C, flexShrink: 0}} strokeWidth={1.75} />
    <span style={{flex: 1, minWidth: 0}}>
      <span style={{display: 'block', fontSize: 13, color: INK, lineHeight: '18px'}}>{name}</span>
      {path ? (
        <span style={{display: 'block', fontSize: 11, color: FAINT, lineHeight: '15px'}}>{path}</span>
      ) : null}
    </span>
    <span style={{fontSize: 11, color: FAINT, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
      {meta}
    </span>
    <ChevronRight style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={1.75} />
  </div>
);

const INK2_C = '#57534e';

export const ThreadRow: React.FC<{
  subject: string;
  sender: string;
  date: string;
  msg?: number;
  pj?: number;
  check?: number;
}> = ({subject, sender, date, msg = 0, pj = 0, check = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      background: check > 0.5 ? CREAM : 'transparent',
      boxShadow: check > 0.5 ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : undefined,
    }}
  >
    <span style={{paddingTop: 2, display: 'inline-flex'}}>
      <Checkbox p={check} />
    </span>
    <span style={{flex: 1, minWidth: 0}}>
      <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            lineHeight: '20px',
            fontWeight: 500,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subject}
        </span>
        <span style={{fontSize: 11, color: FAINT, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
          {date}
        </span>
      </span>
      <span style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
        <span
          style={{
            fontSize: 11,
            color: INK2_C,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {sender}
        </span>
        {msg > 1 ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0}}>
            <Mail style={{width: 12, height: 12, color: INK2_C, opacity: 0.6}} strokeWidth={1.75} />
            <span style={{fontFamily: MONO, fontSize: 10, fontWeight: 500, color: INK2_C}}>
              {msg} MSG
            </span>
          </span>
        ) : null}
        {pj > 0 ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0}}>
            <Paperclip style={{width: 12, height: 12, color: INK2_C, opacity: 0.6}} strokeWidth={1.75} />
            <span style={{fontFamily: MONO, fontSize: 10, fontWeight: 500, color: INK2_C}}>
              {pj} PJ
            </span>
          </span>
        ) : null}
      </span>
    </span>
  </div>
);

// ── Cartes du panier ────────────────────────────────────────────────────────

export const panierCard: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  background: WHITE,
};

export const PJLine: React.FC<{name: string; decoupe?: boolean | null}> = ({name, decoupe}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 28, minWidth: 0}}>
    <Elbow />
    <FileText style={{width: 16, height: 16, color: DOCRED, flexShrink: 0}} strokeWidth={1.75} />
    <span
      style={{
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        color: INK,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {name}
    </span>
    {decoupe === null || decoupe === undefined ? null : <Decoupe on={decoupe} />}
  </div>
);

export const FileCard: React.FC<{name: string; meta: string; decoupe?: boolean}> = ({
  name,
  meta,
  decoupe = false,
}) => (
  <div style={{...panierCard, padding: '8px 14px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, minHeight: 28}}>
      <FileText style={{width: 16, height: 16, color: DOCRED, flexShrink: 0}} strokeWidth={1.75} />
      <span style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontSize: 14, fontWeight: 500, color: INK, whiteSpace: 'nowrap'}}>{name}</span>
        <span style={{fontSize: 11, color: FAINT, flexShrink: 0}}>{meta}</span>
      </span>
      <Decoupe on={decoupe} />
    </div>
  </div>
);

// Pied « Suivre » (phase 2 - sources email uniquement).
export const SuivreFoot: React.FC<{p: number; label: string; hint: string}> = ({p, label, hint}) => (
  <div
    style={{
      marginTop: 12,
      paddingTop: 12,
      borderTop: `1px solid ${LINE_SOFT}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}
  >
    <Switchy p={p} />
    <span style={{fontSize: 12, fontWeight: 500, color: INK, flexShrink: 0}}>{label}</span>
    <span
      style={{
        fontSize: 11,
        color: FAINT,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {hint}
    </span>
  </div>
);

export const ThreadCard: React.FC<{
  subject: string;
  meta: string;
  pj?: {name: string; decoupe?: boolean | null}[];
  suivre?: number | null;
  suivreHint?: string;
}> = ({subject, meta, pj = [], suivre = null, suivreHint}) => (
  <div style={{...panierCard, padding: 14}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
      <Mail style={{width: 16, height: 16, color: MAILBLUE, flexShrink: 0}} strokeWidth={1.75} />
      <span style={{flex: 1, minWidth: 0}}>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            lineHeight: '20px',
            fontWeight: 500,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subject}
        </span>
        <span style={{display: 'block', fontSize: 11, lineHeight: '16px', color: FAINT, marginTop: 2}}>
          {meta}
        </span>
      </span>
      <span style={{fontSize: 11, color: FAINT, flexShrink: 0}}>Échange courriel</span>
    </div>
    {pj.length > 0 ? (
      <div style={{marginTop: 8, paddingLeft: 4, display: 'flex', flexDirection: 'column'}}>
        {pj.map((a) => (
          <PJLine key={a.name} name={a.name} decoupe={a.decoupe} />
        ))}
      </div>
    ) : null}
    {suivre === null ? null : (
      <SuivreFoot
        p={suivre}
        label="Suivre cet échange"
        hint={suivreHint ?? 'les prochains messages arriveront dans les pièces, marqués « Nouveau »'}
      />
    )}
  </div>
);

export const FolderCard: React.FC<{
  name: string;
  meta: string;
  suivre?: number | null;
}> = ({name, meta, suivre = null}) => (
  <div style={{...panierCard, padding: 14}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
      <ChevronRight style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={2} />
      <Folder style={{width: 16, height: 16, color: MAILBLUE, flexShrink: 0}} strokeWidth={1.75} />
      <span style={{flex: 1, minWidth: 0, marginLeft: 2}}>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            lineHeight: '20px',
            fontWeight: 500,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        <span style={{display: 'block', fontSize: 11, lineHeight: '16px', color: FAINT, marginTop: 2}}>
          {meta}
        </span>
      </span>
      <span style={{fontSize: 11, color: FAINT, flexShrink: 0}}>Dossier Outlook</span>
    </div>
    {suivre === null ? null : (
      <SuivreFoot
        p={suivre}
        label="Suivre ce dossier"
        hint="tout son contenu, y compris les futurs sous-dossiers"
      />
    )}
  </div>
);

// ── Onglet Pièces (geste A) ─────────────────────────────────────────────────

export const CategoryRow: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: 44,
      borderBottom: `1px solid ${LINE_SOFT}`,
    }}
  >
    <span style={{width: 16, flexShrink: 0}} />
    <ChevronDown style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={1.75} />
    <Folder
      style={{width: 16, height: 16, color: INK2_C, flexShrink: 0, marginLeft: 6}}
      strokeWidth={1.75}
    />
    <span style={{marginLeft: 8, fontSize: 14, fontWeight: 500, color: INK}}>{label}</span>
  </div>
);

export const NouveautesRow: React.FC<{n: number}> = ({n}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: 44,
      borderBottom: `1px solid ${LINE_SOFT}`,
    }}
  >
    <span style={{width: 16, flexShrink: 0}} />
    <ChevronRight style={{width: 14, height: 14, color: NOUVEAU_TXT, flexShrink: 0}} strokeWidth={1.75} />
    <Sparkles
      style={{width: 16, height: 16, color: NOUVEAU_TXT, flexShrink: 0, marginLeft: 6}}
      strokeWidth={1.75}
    />
    <span style={{marginLeft: 8, fontSize: 14, fontWeight: 500, color: NOUVEAU_TXT}}>Nouveautés</span>
    <span style={{marginLeft: 8, display: 'inline-flex'}}>
      <CountBadge n={n} />
    </span>
  </div>
);

export const PieceRow: React.FC<{
  name: string;
  provenance?: string;
  pages: string;
  date: string;
  email?: boolean;
  isNew?: boolean;
}> = ({name, provenance, pages, date, email = false, isNew = false}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: 58,
      borderBottom: `1px solid ${LINE_SOFT}`,
      background: isNew ? '#fbfcfe' : WHITE,
    }}
  >
    <span style={{width: 40, flexShrink: 0}} />
    {isNew ? (
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: NOUVEAU_TXT,
          flexShrink: 0,
          marginRight: 8,
        }}
      />
    ) : null}
    {email ? (
      <Mail style={{width: 16, height: 16, color: MAILBLUE, flexShrink: 0}} strokeWidth={1.75} />
    ) : (
      <FileText style={{width: 16, height: 16, color: MUTE, flexShrink: 0}} strokeWidth={1.75} />
    )}
    <span style={{flex: 1, minWidth: 0, marginLeft: 10, marginRight: 12}}>
      <span style={{display: 'flex', alignItems: 'center', gap: 8, minWidth: 0}}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {isNew ? <NouveauBadge /> : null}
      </span>
      {provenance ? (
        <span style={{display: 'block', fontSize: 12, color: FAINT, marginTop: 2}}>{provenance}</span>
      ) : null}
    </span>
    <span
      style={{
        width: 44,
        flexShrink: 0,
        fontSize: 12,
        color: FAINT,
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        marginRight: 16,
      }}
    >
      {pages}
    </span>
    <span
      style={{
        width: 96,
        flexShrink: 0,
        fontSize: 14,
        color: INK2_C,
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        paddingRight: 16,
      }}
    >
      {date}
    </span>
  </div>
);

// Pill de sync (header de l'onglet Pièces) - point + texte, jamais animé en
// permanence : la confiance vient du timestamp.
export const SyncPill: React.FC<{label: string; active?: boolean}> = ({label, active = true}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 28,
      padding: '0 12px',
      borderRadius: 999,
      border: `1px solid ${LINE}`,
      background: WHITE,
      fontSize: 12,
      fontWeight: 500,
      color: INK2_C,
      boxShadow: softShadow,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        background: active ? SUIVI : 'transparent',
        border: active ? undefined : `1px solid ${FAINT}`,
      }}
    />
    {label}
  </span>
);

// ── Panneau Sources ─────────────────────────────────────────────────────────

const KIND_ICON = {folder: Folder, thread: Mail, sender: AtSign} as const;

export const SourceRow: React.FC<{
  kind: 'folder' | 'thread' | 'sender';
  path: string;
  meta: string;
  count?: number;
  followed?: number;
  syncing?: boolean;
}> = ({kind, path, meta, count = 0, followed = 1, syncing = false}) => {
  const Icon = KIND_ICON[kind];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderBottom: `1px solid ${LINE_SOFT}`,
      }}
    >
      <Icon
        style={{width: 16, height: 16, color: kind === 'sender' ? MUTE : MAILBLUE, flexShrink: 0}}
        strokeWidth={1.75}
      />
      <span style={{flex: 1, minWidth: 0}}>
        <span
          style={{
            display: 'block',
            fontSize: 13,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {path}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 11,
            color: FAINT,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {meta}
        </span>
      </span>
      <CountBadge n={count} />
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0}}>
        <span style={{fontSize: 11, fontWeight: 500, color: followed > 0.5 ? INK2_C : FAINT}}>
          {followed > 0.5 ? 'Suivi' : 'Non suivi'}
        </span>
        <Switchy p={followed} />
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 28,
          padding: '0 8px',
          borderRadius: 6,
          border: `1px solid ${LINE}`,
          background: WHITE,
          fontSize: 11,
          fontWeight: 500,
          color: INK,
          flexShrink: 0,
          opacity: followed > 0.5 ? 1 : 0.4,
        }}
      >
        <RefreshCw
          style={{
            width: 12,
            height: 12,
            transform: syncing ? 'rotate(180deg)' : undefined,
          }}
          strokeWidth={1.75}
        />
        Synchroniser
      </span>
      <ChevronRight style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={1.75} />
    </div>
  );
};

export const HistoryRow: React.FC<{
  date: string;
  kind: 'arrival' | 'doublon' | 'decoupe' | 'initial';
  name?: string;
  note?: string;
  tag?: string;
  count?: number;
}> = ({date, kind, name, note, tag, count}) => {
  if (kind === 'initial') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderBottom: `1px solid ${LINE_SOFT}`,
        }}
      >
        <span style={{width: 46, fontSize: 11, color: FAINT, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
          {date}
        </span>
        <span style={{fontSize: 12, color: INK2_C}}>{count} pièces versées à l'import initial</span>
      </div>
    );
  }
  const Icon = kind === 'doublon' ? Copy : kind === 'decoupe' ? Scissors : FileText;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderBottom: `1px solid ${LINE_SOFT}`,
      }}
    >
      <span style={{width: 46, fontSize: 11, color: FAINT, fontVariantNumeric: 'tabular-nums', flexShrink: 0}}>
        {date}
      </span>
      <Icon style={{width: 14, height: 14, color: FAINT, flexShrink: 0}} strokeWidth={1.75} />
      <span style={{flex: 1, minWidth: 0}}>
        <span
          style={{
            display: 'block',
            fontSize: 12,
            color: INK,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        {note ? (
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: FAINT,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {note}
          </span>
        ) : null}
      </span>
      {tag ? <TypeChip>{tag}</TypeChip> : null}
    </div>
  );
};

// ── Boutons ─────────────────────────────────────────────────────────────────

export const DarkButton: React.FC<{label: string; pressed?: boolean; icon?: boolean}> = ({
  label,
  pressed = false,
  icon = false,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 34,
      padding: '0 14px',
      borderRadius: 8,
      background: INK,
      color: WHITE,
      fontSize: 14,
      fontWeight: 500,
      flexShrink: 0,
      transform: pressed ? 'scale(0.96)' : undefined,
      boxShadow: '0px 1px 1px rgba(26,26,26,0.05)',
    }}
  >
    {icon ? <Plus style={{width: 14, height: 14}} strokeWidth={2} /> : null}
    {label}
  </span>
);

export const OutlineButton: React.FC<{label: string; icon?: React.ReactNode}> = ({label, icon}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 34,
      padding: '0 14px',
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
    {icon}
    {label}
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
