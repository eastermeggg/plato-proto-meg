import React from 'react';
import {
  FileText, File, FolderOpen, GripVertical, Pencil, Trash2,
  EllipsisVertical, ChevronRight, Plus, Minus, X, Equal, Diamond,
} from 'lucide-react';
import { colors, typography, radius } from '../../design-system/tokens';
import IVAvatar from '../IVAvatar';
import Badge from './Badge';
import SourceBadge from './SourceBadge';

/**
 * DataTableCell — Plato design system. Source : Figma node 36554:5657
 * (page ComponentTable, « DataTableCell » / DataTableContent 36554:4713).
 *
 * L'unité atomique de TOUTES les tables Plato. Les tables du produit ne
 * dérivent pas du `<table>` shadcn (retiré du DS) : ce sont des systèmes
 * compositionnels div-based dont chaque rangée n'est faite QUE d'instances de
 * cellules typées. Aucune primitive existante ne couvrait ce besoin — d'où ce
 * custom (cf. docs/table-system.md, ds-decide « créer »).
 *
 * `type` sélectionne un des ~30 rôles métier de la maquette :
 *   Texte     Text · TextEmphasis · TextMuted · TextComposed
 *   Montant   AmountRegular · AmountMuted · AmountEmphasis · AmountResult ·
 *             NegativeAmount · AmountQualificatif · AmountMissing · AmountProgress
 *   Entité    IV · User · Folder · IconHolder · DocSource
 *   Marqueur  Badge · Number · Accronym · Grip · Options · Divider
 *   Calcul    OperatorPlus · OperatorMinus · OperatorMultiply · OperatorEqual ·
 *             OperatorEqualResult · Rule
 *   Section   SectionBandeau
 *
 * NB montants : la maquette Figma les câble en Inter (sans), pas en serif — on
 * suit le Figma (source d'intention du composant). docs/table-system.md évoque
 * « RL Para sur les montants » : divergence signalée, non arbitrée ici.
 *
 * Compose les primitives existantes : IVAvatar (IV/User), Badge (Badge),
 * SourceBadge (renvois de Rule / TextComposed). Tokens uniquement.
 */

// ── Styles de texte dérivés des tokens (Figma : body/caption sans, mono 11) ──
const bodyRegular = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,          // 14
  lineHeight: `${typography.scale.body.lineHeight}px`, // 20
  fontWeight: typography.scale.body.weight,      // 400
};
const bodyMedium = { ...bodyRegular, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,       // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const captionMedium = { ...caption, fontWeight: 500, letterSpacing: 0 };
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size, // 11
  fontWeight: 500,
  textTransform: 'uppercase',
};

// Rangée standard : hauteur fixe 52, padding 12, largeur métier 406.
const ROW_H = 52;
const PAD = 12;

// ── Familles d'alignement / largeur par défaut ──────────────────────────────
const AMOUNT_TYPES = ['AmountRegular', 'AmountMuted', 'AmountEmphasis', 'NegativeAmount'];
const RIGHT_TYPES = [...AMOUNT_TYPES, 'AmountResult', 'AmountQualificatif', 'AmountMissing', 'AmountProgress', 'Options'];

function amountColor(type) {
  if (type === 'NegativeAmount') return colors.feedback.destructive.base;
  if (type === 'AmountMuted') return colors.semantic.mutedForeground;
  return colors.semantic.foreground; // Regular / Emphasis / Result
}

// Pastille d'opérateur : anneau 22px, glyphe lucide 10px.
function Operator({ type }) {
  const isResult = type === 'OperatorEqualResult';
  const isMinus = type === 'OperatorMinus';
  const Glyph = type === 'OperatorPlus' ? Plus
    : isMinus ? Minus
    : type === 'OperatorMultiply' ? X
    : Equal;
  // Minus porte l'anneau « lie-de-vin » à 20% (une direction, pas une alerte) ;
  // EqualResult est encre pleine (un résultat ressort) ; le reste = bord neutre.
  const ring = isResult ? colors.semantic.foreground
    : isMinus ? 'rgba(127, 29, 29, 0.2)'                // feedback.destructive.text @ 20%
    : colors.semantic.border;
  return (
    <span style={{
      width: 22, height: 22, flexShrink: 0, borderRadius: radius.full,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${ring}`,
      background: isResult ? colors.semantic.foreground : 'transparent',
      boxSizing: 'border-box',
    }}>
      <Glyph
        style={{ width: 10, height: 10 }}
        strokeWidth={2.25}
        color={isResult ? colors.semantic.white : colors.semantic.foregroundSecondary}
      />
    </span>
  );
}

// Petit porte-icône « docs » (DocSource / IconHolder) — carré teinté + icône.
function IconHolderDocs({ tint = 'info', icon: Icon = File }) {
  const bg = tint === 'info' ? colors.feedback.info.subtle : colors.semantic.muted;
  const fg = tint === 'info' ? colors.feedback.info.text : colors.semantic.foreground;
  return (
    <span style={{
      width: 26, height: 26, flexShrink: 0, borderRadius: radius.md,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: bg,
    }}>
      <Icon style={{ width: 16, height: 16 }} strokeWidth={1.75} color={fg} />
    </span>
  );
}

export default function DataTableCell({
  type = 'Text',
  // Contenu commun
  text,            // libellé principal / montant / valeur de badge / acronyme
  subtext,         // ligne secondaire (email, nom de fichier, lien, montant barré…)
  icon,            // icône de tête (Text / IconHolder / DocSource) — override
  // SectionBandeau
  title,
  description,
  // Rule / TextComposed
  ruleName,
  ruleState,
  sources,         // [{ type, label }] rendus en SourceBadge
  note,            // note grise (TextComposed)
  // IV / User
  avatarColor = 'plum',
  // Divers
  align,           // 'left' | 'right' — override l'alignement par défaut
  width,           // largeur fixe optionnelle (défaut : selon le type)
  onClick,
  className,
  style,
}) {
  const rightAligned = align ? align === 'right' : RIGHT_TYPES.includes(type);

  // Coquille standard partagée par la majorité des types.
  const shell = (children, opts = {}) => (
    <div
      className={className}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: rightAligned ? 'flex-end' : 'flex-start',
        gap: 8,
        height: ROW_H,
        padding: PAD,
        width: width ?? opts.width ?? 406,
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );

  switch (type) {
    // ── Divider : filet plein pleine largeur ──────────────────────────────
    case 'Divider':
      return (
        <div className={className} style={{
          height: 6, width: width ?? '100%',
          background: colors.semantic.muted,
          borderBottom: `1px solid ${colors.semantic.border}`,
          ...style,
        }} />
      );

    // ── Montants simples (droite) ─────────────────────────────────────────
    case 'AmountRegular':
    case 'AmountMuted':
    case 'AmountEmphasis':
    case 'NegativeAmount':
      return shell(
        <span style={{ ...bodyRegular, fontWeight: type === 'AmountEmphasis' ? 500 : 400, color: amountColor(type), whiteSpace: 'nowrap' }}>
          {text ?? (type === 'NegativeAmount' ? '-100 €' : '24,12 €')}
        </span>
      );

    // ── Montant résultat : 16 semibold ────────────────────────────────────
    case 'AmountResult':
      return shell(
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.scale['heading-sm'].size, // 16
          lineHeight: `${typography.scale['heading-sm'].lineHeight}px`, // 24
          fontWeight: 600, color: colors.semantic.foreground, whiteSpace: 'nowrap',
        }}>
          {text ?? '14 769 €'}
        </span>
      );

    // ── Montant qualificatif : qualifieur + montant demandé barré ─────────
    case 'AmountQualificatif':
      return shell(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ ...bodyRegular, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {text ?? 'Non soumise'}
          </span>
          {subtext && (
            <span style={{ ...caption, color: colors.semantic.foregroundMuted, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
              {subtext}
            </span>
          )}
        </div>
      );

    // ── Montant manquant : tiret + raison dérivée ─────────────────────────
    case 'AmountMissing':
      return shell(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ ...bodyRegular, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>
            {text ?? '—'}
          </span>
          {subtext && (
            <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>
              {subtext}
            </span>
          )}
        </div>
      );

    // ── Montant en attente : la ligne existe, pas encore sa valeur ────────
    case 'AmountProgress':
      return shell(
        <span style={{ ...bodyRegular, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>
          {text ?? '···'}
        </span>
      );

    // ── Opérateurs de la colonne calcul (centrés, 46px) ───────────────────
    case 'OperatorPlus':
    case 'OperatorMinus':
    case 'OperatorMultiply':
    case 'OperatorEqual':
    case 'OperatorEqualResult':
      return (
        <div className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: ROW_H, width: width ?? 46, boxSizing: 'border-box', ...style,
        }}>
          <Operator type={type} />
        </div>
      );

    // ── IV / User : avatar + nom (+ lien / email) ─────────────────────────
    case 'IV':
    case 'User': {
      const isUser = type === 'User';
      return shell(
        <>
          <IVAvatar size={isUser ? 32 : 28} color={avatarColor} />
          {isUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{text ?? 'Username'}</span>
              {subtext && <span style={{ ...caption, color: colors.semantic.mutedForeground }}>{subtext}</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ ...bodyRegular, color: colors.semantic.primary, whiteSpace: 'nowrap' }}>{text ?? 'Nom victime indirecte'}</span>
              {subtext && <span style={{ ...caption, color: colors.semantic.mutedForeground }}>{subtext}</span>}
            </div>
          )}
        </>
      );
    }

    // ── DocSource : porte-icône seul ──────────────────────────────────────
    case 'DocSource':
      return (
        <div className={className} onClick={onClick} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          height: ROW_H, padding: PAD, boxSizing: 'border-box',
          cursor: onClick ? 'pointer' : 'default', ...style,
        }}>
          <IconHolderDocs tint="info" icon={icon || File} />
        </div>
      );

    // ── IconHolder : porte-icône muted + libellé medium ──────────────────
    case 'IconHolder':
      return shell(
        <>
          <span style={{
            width: 28, height: 28, flexShrink: 0, borderRadius: radius.md,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: colors.semantic.muted,
          }}>
            {React.createElement(icon || File, { style: { width: 16, height: 16 }, strokeWidth: 1.75, color: colors.semantic.foreground })}
          </span>
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text ?? 'Analyse biologiques'}
          </span>
        </>
      );

    // ── Folder : icône dossier + libellé medium ──────────────────────────
    case 'Folder':
      return shell(
        <>
          <FolderOpen style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.feedback.info.text} />
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text ?? 'Analyse biologiques'}
          </span>
        </>
      );

    // ── Text : icône + libellé (+ nom de fichier muted inline) ────────────
    case 'Text':
      return (
        <div className={className} onClick={onClick} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: PAD, boxSizing: 'border-box', width,
          cursor: onClick ? 'pointer' : 'default', ...style,
        }}>
          {React.createElement(icon || FileText, { style: { width: 16, height: 16, flexShrink: 0 }, strokeWidth: 1.75, color: colors.semantic.foreground })}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <span style={{ ...bodyRegular, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{text ?? 'Analyse biologiques'}</span>
            {subtext && <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtext}</span>}
          </span>
        </div>
      );

    // ── TextEmphasis : libellé medium + sous-ligne (2 lignes) ─────────────
    case 'TextEmphasis':
      return (
        <div className={className} onClick={onClick} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: PAD, boxSizing: 'border-box', width: width ?? 406,
          cursor: onClick ? 'pointer' : 'default', ...style,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.semantic.foreground }}>{text ?? 'Analyse biologiques'}</span>
            {subtext && <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtext}</span>}
          </div>
        </div>
      );

    // ── TextMuted : libellé grisé ─────────────────────────────────────────
    case 'TextMuted':
      return shell(
        <span style={{ ...bodyRegular, color: colors.semantic.mutedForeground, flex: 1, minWidth: 0 }}>
          {text ?? 'Analyse biologiques'}
        </span>
      );

    // ── Badge : compose la primitive Badge (secondary) ────────────────────
    case 'Badge':
      return shell(
        <Badge variant="secondary" label={text ?? '100 %'} />
      );

    // ── Number : petit badge numéroté mono ────────────────────────────────
    case 'Number':
      return shell(
        <span style={{
          minWidth: 22, height: 22, padding: '0 6px', borderRadius: radius.md,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: colors.semantic.muted,
          ...monoCol, color: colors.semantic.mutedForeground,
        }}>
          {text ?? '1'}
        </span>
      );

    // ── Accronym : mono 11 uppercase (largeur 64) ─────────────────────────
    case 'Accronym':
      return shell(
        <span style={{ ...monoCol, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {text ?? 'SE'}
        </span>,
        { width: 64 }
      );

    // ── Grip : poignée de drag ────────────────────────────────────────────
    case 'Grip':
      return shell(
        <GripVertical style={{ width: 12, height: 12 }} strokeWidth={2} color={colors.semantic.foregroundMuted} />
      );

    // ── Options : rangée d'actions (crayon / corbeille / … / chevron) ─────
    case 'Options':
      return shell(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[Pencil, Trash2, EllipsisVertical, ChevronRight].map((I, i) => (
            <I key={i} style={{ width: 14, height: 14 }} strokeWidth={1.75} color={colors.semantic.foregroundSecondary} />
          ))}
        </div>
      );

    // ── Rule : la règle appliquée à une rangée (nom + état + ses sources) ─
    // Filet 2px à gauche, jamais atténué. Aucun chiffre : la formule vit dans
    // la prose du panneau.
    case 'Rule':
      return (
        <div className={className} style={{
          display: 'flex', alignItems: 'center',
          height: ROW_H, padding: PAD, boxSizing: 'border-box', ...style,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingLeft: 10, borderLeft: `2px solid ${colors.semantic.border}`,
          }}>
            <span style={{ ...captionMedium, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
              {ruleName ?? 'Plafond commun des indemnités de rupture'}
            </span>
            {ruleState && (
              <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>· {ruleState}</span>
            )}
            {(sources || []).map((s, i) => (
              <SourceBadge key={i} type={s.type || 'code'} label={s.label} />
            ))}
          </div>
        </div>
      );

    // ── TextComposed : libellé (jamais tronqué) + renvois + règle + note ──
    case 'TextComposed':
      return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', width: width ?? 747, ...style }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0, padding: PAD }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...bodyRegular, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
                {text ?? 'Réduction sur heures supplémentaires'}
              </span>
              {(sources || []).map((s, i) => (
                <SourceBadge key={i} type={s.type || 'code'} label={s.label} />
              ))}
            </div>
            {ruleName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: `2px solid ${colors.semantic.border}` }}>
                <span style={{ ...captionMedium, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{ruleName}</span>
                {ruleState && <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>· {ruleState}</span>}
              </div>
            )}
            {note && <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>{note}</span>}
          </div>
        </div>
      );

    // ── SectionBandeau : bande-titre d'une section (diamant + titre + point) ─
    case 'SectionBandeau':
      return (
        <div className={className} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '12px 16px', width: width ?? '100%',
          background: colors.semantic.white,
          borderBottom: `1px solid ${colors.semantic.border}`,
          boxSizing: 'border-box', ...style,
        }}>
          <Diamond style={{ width: 10, height: 10, flexShrink: 0 }} strokeWidth={2} color={colors.semantic.foreground} />
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {title ?? 'Base soumise à cotisations'}
          </span>
          {description && (
            <>
              <span style={{ width: 4, height: 4, borderRadius: radius.full, background: colors.semantic.foregroundMuted, flexShrink: 0 }} />
              <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{description}</span>
            </>
          )}
        </div>
      );

    default:
      return shell(
        <span style={{ ...bodyRegular, color: colors.semantic.foregroundMuted }}>{`(type inconnu : ${type})`}</span>
      );
  }
}

// Liste ordonnée des types — consommée par la démo du playground.
export const DATA_TABLE_CELL_TYPES = [
  'IV', 'User', 'DocSource', 'IconHolder', 'Folder',
  'Text', 'TextEmphasis', 'TextMuted', 'TextComposed',
  'Badge', 'Number', 'Accronym', 'Grip', 'Options', 'Divider',
  'AmountRegular', 'AmountMuted', 'AmountEmphasis', 'AmountResult',
  'NegativeAmount', 'AmountQualificatif', 'AmountMissing', 'AmountProgress',
  'OperatorPlus', 'OperatorMinus', 'OperatorMultiply', 'OperatorEqual', 'OperatorEqualResult',
  'Rule', 'SectionBandeau',
];
