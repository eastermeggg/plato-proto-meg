import React from 'react';
import {
  ChevronRight,
  Diamond,
  Equal,
  FileText,
  Gavel,
  Globe,
  Minus,
  Plus,
  SlidersHorizontal,
  Stamp,
  X,
  ArrowUpRight,
} from 'lucide-react';
import {
  BADGE_TOKENS,
  FAINT,
  INK,
  INK2,
  LINE,
  MONO,
  MUTE,
  PAPER,
  RESULT_TABLEAU_BG,
  RULE_RAIL,
} from './theme';

// Répliques fidèles (statiques) des composants de CotisationsSection.js -
// mêmes métriques Plato : pastille 22 px, rangée 52 px, carte rayon 10.

export const cardChrome: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  overflow: 'hidden',
  boxShadow:
    '0px 1px 2px 0px rgba(26,26,26,0.05), 0px 1px 1px 0px rgba(26,26,26,0.05)',
  background: 'white',
};

const OP_ICONS: Record<string, React.ComponentType<{style?: React.CSSProperties; strokeWidth?: number}>> = {
  '+': Plus,
  '-': Minus,
  x: X,
  '=': Equal,
};

export const Operateur: React.FC<{op?: string; emphase?: boolean; ecartee?: boolean}> = ({
  op,
  emphase,
  ecartee,
}) => {
  if (!op) return <span style={{width: 22, height: 22, flexShrink: 0}} />;
  const Icon = OP_ICONS[op];
  const dark = op === '=' && emphase;
  const ring = op === '-' ? 'rgba(127,29,29,0.2)' : 'rgba(41,37,36,0.1)';
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 9999,
        border: `2px solid ${ring}`,
        background: dark ? INK : 'transparent',
        opacity: ecartee ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {Icon ? (
        <Icon style={{width: 10, height: 10, color: dark ? 'white' : INK2}} strokeWidth={2.75} />
      ) : null}
    </span>
  );
};

const FAMILLE_ICONS: Record<string, React.ComponentType<{style?: React.CSSProperties; strokeWidth?: number}>> = {
  PIECE: FileText,
  DECISION: Gavel,
  REFERENCE: Stamp,
  WEB: Globe,
  VALEUR: ArrowUpRight,
  VARIABLE: SlidersHorizontal,
};

export const Badge: React.FC<{famille: string; label: string; millesime?: string}> = ({
  famille,
  label,
  millesime,
}) => {
  const tok = BADGE_TOKENS[famille === 'VARIABLE' ? 'VALEUR' : famille] || BADGE_TOKENS.TEXTE;
  const Icon = FAMILLE_ICONS[famille];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        background: tok.bg,
        border: `1px ${tok.dashed ? 'dashed' : 'solid'} ${tok.dashed || tok.border || 'transparent'}`,
        boxShadow: tok.dashed ? 'none' : '0px 1px 2px 0px rgba(26,26,26,0.05)',
        flexShrink: 0,
      }}
    >
      {famille === 'TEXTE' ? (
        <span style={{fontSize: 11.5, fontWeight: 600, color: tok.color, opacity: 0.85, lineHeight: 1}}>
          §
        </span>
      ) : Icon ? (
        <Icon style={{width: 12, height: 12, color: tok.color, opacity: 0.85}} strokeWidth={2} />
      ) : null}
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 500,
          color: tok.color,
          whiteSpace: 'nowrap',
          lineHeight: '14px',
        }}
      >
        {label}
      </span>
      {millesime ? (
        <span style={{fontFamily: MONO, fontSize: 10.5, color: tok.color, opacity: 0.62}}>
          {millesime}
        </span>
      ) : null}
    </span>
  );
};

export const PieceHolder: React.FC<{count?: number}> = ({count = 1}) => (
  <span
    style={{
      position: 'relative',
      width: 26,
      height: 26,
      borderRadius: 6,
      background: BADGE_TOKENS.PIECE.bg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <FileText style={{width: 15, height: 15, color: BADGE_TOKENS.PIECE.color}} strokeWidth={2} />
    {count > 1 ? (
      <span
        style={{
          position: 'absolute',
          top: -5,
          left: 16,
          minWidth: 15,
          height: 15,
          padding: '0 3px',
          background: BADGE_TOKENS.PIECE.color,
          color: '#fff',
          fontSize: 9.5,
          fontWeight: 600,
          lineHeight: 1,
          borderRadius: 9999,
          border: '2px solid #fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {count}
      </span>
    ) : null}
  </span>
);

export const PiecePlaceholder: React.FC = () => (
  <span
    style={{
      width: 26,
      height: 26,
      borderRadius: 6,
      background: 'white',
      border: `1px dashed ${FAINT}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <FileText style={{width: 15, height: 15, color: INK2, opacity: 0.4}} strokeWidth={1.75} />
  </span>
);

export const Regle: React.FC<{
  nom: string;
  etat?: string;
  badges?: {famille: string; label: string; millesime?: string}[];
}> = ({nom, etat, badges = []}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: '3px 8px',
      paddingLeft: 8,
      borderLeft: `2px solid ${RULE_RAIL}`,
    }}
  >
    <span style={{fontSize: 12, fontWeight: 500, color: MUTE, lineHeight: '16px'}}>
      {nom}
      {etat ? <span style={{fontWeight: 400, color: FAINT}}> · {etat}</span> : null}
    </span>
    {badges.map((b) => (
      <Badge key={b.label} {...b} />
    ))}
  </span>
);

export type RowSpec = {
  op?: string;
  label: string;
  value?: string;
  qualificatif?: string;
  barre?: string;
  motif?: string;
  note?: string;
  noteInline?: string;
  piece?: number | 'empty' | null;
  badges?: {famille: string; label: string; millesime?: string}[];
  regle?: {nom: string; etat?: string; badges?: {famille: string; label: string; millesime?: string}[]};
  ecartee?: boolean;
  emphase?: 'section' | 'tableau';
  indentee?: boolean;
  euro?: boolean;
  chevron?: boolean;
};

// La rangée de cellules Plato : [pièce 50] [opérateur 46] [texte flex]
// [valeur] [chevron 30].
export const Row: React.FC<{spec: RowSpec; isLast?: boolean; showPieceCell?: boolean}> = ({
  spec,
  isLast,
  showPieceCell,
}) => {
  const isResultat = !!spec.emphase;
  const bg =
    spec.emphase === 'tableau' ? RESULT_TABLEAU_BG : spec.emphase === 'section' ? PAPER : 'white';
  const euro = spec.euro !== false;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        minHeight: 52,
        background: bg,
        borderBottom: isLast ? 'none' : `1px solid ${LINE}`,
      }}
    >
      {showPieceCell ? (
        <div style={{width: 50, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {spec.piece === 'empty' ? (
            <PiecePlaceholder />
          ) : spec.piece ? (
            <PieceHolder count={spec.piece} />
          ) : null}
        </div>
      ) : null}
      <div style={{width: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Operateur op={spec.op} emphase={isResultat} ecartee={spec.ecartee} />
      </div>
      <div
        style={{
          flex: '1 0 0',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          padding: `12px 12px 12px ${spec.indentee ? 30 : 12}px`,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0}}>
          <span style={{display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '2px 8px'}}>
            <span
              style={{
                fontSize: 14,
                color: spec.ecartee ? MUTE : INK,
                fontWeight: isResultat ? 500 : 400,
                lineHeight: '20px',
              }}
            >
              {spec.label}
            </span>
            {spec.noteInline ? (
              <span style={{fontSize: 12, color: MUTE, letterSpacing: 0.12, lineHeight: '16px'}}>
                {spec.noteInline}
              </span>
            ) : null}
            {(spec.badges || []).map((b) => (
              <Badge key={b.label} {...b} />
            ))}
          </span>
          {spec.regle ? <Regle {...spec.regle} /> : null}
          {spec.note ? (
            <span style={{fontSize: 12, color: FAINT, letterSpacing: 0.12, lineHeight: '16px'}}>
              {spec.note}
            </span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 100,
            gap: 2,
          }}
        >
          {spec.qualificatif ? (
            <span style={{fontSize: 13, color: MUTE, lineHeight: '18px'}}>{spec.qualificatif}</span>
          ) : (
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                lineHeight: '20px',
                fontSize: isResultat ? 16 : 14,
                fontWeight: isResultat ? 600 : euro && spec.value !== '—' ? 500 : 400,
                color: spec.value === '—' ? FAINT : euro ? INK : MUTE,
              }}
            >
              {spec.value}
            </span>
          )}
          {spec.barre ? (
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontSize: 12,
                color: FAINT,
                textDecoration: 'line-through',
                lineHeight: '15px',
              }}
            >
              {spec.barre}
            </span>
          ) : null}
          {spec.motif ? (
            <span style={{fontSize: 10.5, color: FAINT, lineHeight: '13px', whiteSpace: 'nowrap'}}>
              {spec.motif}
            </span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          width: 30,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 16,
        }}
      >
        {spec.chevron !== false ? (
          <ChevronRight style={{width: 14, height: 14, color: FAINT}} />
        ) : null}
      </div>
    </div>
  );
};

const captionStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  fontWeight: 500,
  color: MUTE,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

export const SectionHeader: React.FC<{
  titre: string;
  description?: string;
  libelleColonne?: string;
  showPieceCell?: boolean;
}> = ({titre, description, libelleColonne, showPieceCell}) => (
  <>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '12px 16px',
        gap: 6,
        background: 'white',
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <Diamond style={{width: 10, height: 10, color: INK, flexShrink: 0}} strokeWidth={2} />
      <span style={{fontSize: 14, fontWeight: 500, color: INK, lineHeight: '20px'}}>{titre}</span>
      {description ? (
        <>
          <span style={{width: 4, height: 4, borderRadius: 4, background: '#d6d3d1', margin: '0 2px'}} />
          <span style={{fontSize: 12, color: MUTE, letterSpacing: 0.12, lineHeight: '16px'}}>
            {description}
          </span>
        </>
      ) : null}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 40,
        background: 'white',
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      {showPieceCell ? (
        <div style={{width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={captionStyle}>Pièce</span>
        </div>
      ) : null}
      <div style={{width: 46, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={captionStyle}>Ope.</span>
      </div>
      <div
        style={{
          flex: '1 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 12px',
        }}
      >
        {libelleColonne ? <span style={captionStyle}>{libelleColonne}</span> : null}
      </div>
      <div style={{width: 30}} />
    </div>
  </>
);

export const MonoChip: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 15,
      fontWeight: 500,
      color: INK2,
      background: 'white',
      border: `1px solid ${LINE}`,
      borderRadius: 8,
      padding: '6px 14px',
      boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)',
    }}
  >
    {children}
  </span>
);
