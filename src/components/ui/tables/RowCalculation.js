import React, { useState } from 'react';
import { ChevronRight, Briefcase } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';
import Badge from '../Badge';
import IVAvatar from '../../IVAvatar';

/**
 * RowCalculation — Plato design system. Source : Figma node 36458:22699
 * (page ComponentTable, famille « Chiffrage / PGP / Totaux »).
 *
 * Rangée de calcul structurée du détail de poste IV (Type D - PGP).
 * Variants (prop `type` × `victims`) et hauteurs Figma :
 *   header  × direct    40px  bande de colonne mono 11 uppercase sur fond accent
 *   header  × indirect  60px  en-tête de groupe IV : avatar 32 + nom + méta + montant SERIF
 *   multiCol × direct   56px  ligne multi-colonnes (acronyme + libellé + 2 montants + nature + résultat)
 *   single  × direct    56px  ligne à valeur unique (acronyme + libellé + nature + résultat)
 *   subline × indirect  56px  sous-ligne victime indirecte (avatar 28 + nom + montant)
 *   subline × direct    52px  sous-ligne Échu (+ badge Rente optionnel)
 * State Default / Hover (hover réel + `pinHover` pour la démo).
 *
 * NB serif : dans cette famille, seul le montant de l'en-tête de groupe
 * (header × indirect) est en RL Para (style Figma display-xs 16/20, -0.5) —
 * les montants de lignes restent en Inter 14, conformément au design context.
 *
 * Compose DataTableCell (Accronym, IV), Badge (Rente info), IVAvatar.
 * Tokens uniquement.
 */

// ── Styles texte dérivés des tokens ─────────────────────────────────────────
const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                    // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,     // 20
  fontWeight: 400,
};
const bodyMedium = { ...body, fontWeight: 500 };
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,  // 11
  fontWeight: 500,
  textTransform: 'uppercase',
  lineHeight: 'normal',
  textBoxTrim: 'trim-both',
  textBoxEdge: 'cap alphabetic',
};
// Montant serif de l'en-tête de groupe — style Figma display-xs (16/20, -0.5, 500).
const serifAmount = {
  fontFamily: typography.fontFamily.serif,
  fontSize: typography.scale['display-xs'].size,           // 16
  lineHeight: '20px',
  fontWeight: typography.scale['display-xs'].weight,       // 500
  letterSpacing: `${typography.scale['display-xs'].letterSpacing}px`, // -0.5
};

// Hover des sous-lignes : voile encre 2% par-dessus le fond cream (Figma :
// linear-gradient rgba encre 0.02 sur le token background).
const SUBLINE_HOVER_OVERLAY =
  'linear-gradient(90deg, rgba(41, 37, 36, 0.02), rgba(41, 37, 36, 0.02))';

// Badge « Nature » (Salariale…) : pastille neutre mono 11, distincte du
// SourceBadge canonique (familles teintées) — relevé Figma node 37327:4712.
function NatureBadge({ label, icon: Icon = Briefcase }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px 3px 7px',
      background: colors.semantic.backgroundSubtle,
      border: `1px solid ${colors.semantic.border}`,
      borderRadius: radius.md,
      whiteSpace: 'nowrap',
    }}>
      <Icon style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.foregroundQuaternary} />
      <span style={{
        fontFamily: typography.fontFamily.mono, fontSize: 11, fontWeight: 500,
        lineHeight: '14px', letterSpacing: '-0.55px',
        color: colors.semantic.foregroundQuaternary,
      }}>
        {label}
      </span>
    </span>
  );
}

// Colonne montant : flex 1, max 176, alignée droite (relevé Figma « Amount »).
function AmountCol({ children, gap = 4 }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 1, maxWidth: 176, height: '100%',
      padding: 12, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      justifyContent: 'center', gap,
    }}>
      {children}
    </div>
  );
}

// Montant résultat (Inter 500) + ligne rente optionnelle (info, 12/16).
function ResultAmount({ amount, rente }) {
  return (
    <>
      <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{amount}</span>
      {rente && (
        <span style={{
          fontFamily: typography.fontFamily.sans, fontSize: 12, lineHeight: '16px',
          fontWeight: 500, color: colors.feedback.info.text, whiteSpace: 'nowrap',
        }}>
          {rente}
        </span>
      )}
    </>
  );
}

// Cellule Actions : chevron 16 aligné droite (pl 12 / pr 16).
function ActionsCell() {
  return (
    <div style={{
      height: '100%', flexShrink: 0, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
      padding: '12px 16px 12px 12px', gap: 4,
    }}>
      <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
    </div>
  );
}

export default function RowCalculation({
  type = 'header',            // 'header' | 'multiCol' | 'single' | 'subline'
  victims = 'indirect',       // 'direct' | 'indirect'
  state = 'default',          // 'default' | 'hover'
  pinHover = false,           // fige l'état hover (démo playground)
  expandable = false,         // multiCol/single direct : colonne chevron gauche
  showRente = false,          // rente annuelle (badge Rente / ligne « + … € / an »)
  // Contenu data-driven — défauts = exemples du Figma
  label,                      // libellé colonne (header direct) / libellé de ligne
  accronym,                   // acronyme mono (multiCol/single)
  name,                       // nom (header indirect / subline indirect)
  meta,                       // méta grise (header indirect : « Épouse • 41 ans »)
  lien,                       // lien de parenté (subline indirect : « (Lien) »)
  amounts,                    // [demandé, offert] (multiCol) — montants muted
  nature,                     // libellé du badge Nature (« Salariale »)
  amount,                     // montant résultat / montant de sous-ligne
  rente,                      // ligne rente (« + 6 242, 50 € / an »)
  avatarColor,                // palette IVAvatar
  width = '100%',
  onClick,
  className,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isHover = pinHover || state === 'hover' || hovered;
  const isDirect = victims === 'direct';

  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  const rowBase = {
    display: 'flex',
    width,
    boxSizing: 'border-box',
    borderBottom: `1px solid ${colors.semantic.border}`,
    cursor: onClick ? 'pointer' : 'default',
  };

  // ── Header × direct : bande de colonne 40px, mono uppercase sur accent ────
  if (type === 'header' && isDirect) {
    return (
      <div className={className} onClick={onClick} style={{ ...rowBase, height: 40, alignItems: 'stretch', background: colors.semantic.white, ...style }}>
        <div style={{
          flex: '1 1 0', minWidth: 1, display: 'flex', alignItems: 'center',
          padding: '12px 16px', boxSizing: 'border-box',
          background: colors.semantic.accent,
        }}>
          <span style={{ ...monoCol, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
            {label ?? 'Préjudices patrimoniaux temporaires'}
          </span>
        </div>
      </div>
    );
  }

  // ── Header × indirect : en-tête de groupe IV 60px, montant SERIF ──────────
  if (type === 'header') {
    return (
      <div className={className} onClick={onClick} style={{
        ...rowBase, alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: colors.semantic.background, ...style,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <IVAvatar size={32} color={avatarColor || 'orange'} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
              {name ?? 'Marie Dupont'}
            </span>
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
              {meta ?? 'Épouse • 41 ans'}
            </span>
          </div>
        </div>
        <span style={{ ...serifAmount, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {amount ?? 'X XXX €'}
        </span>
      </div>
    );
  }

  // ── Subline × direct : Échu 52px (+ badge Rente) ──────────────────────────
  if (type === 'subline' && isDirect) {
    return (
      <div
        className={className}
        onClick={onClick}
        {...hoverHandlers}
        style={{
          ...rowBase, height: 52, alignItems: 'stretch',
          background: colors.semantic.background,
          backgroundImage: isHover ? SUBLINE_HOVER_OVERLAY : undefined,
          ...style,
        }}
      >
        <div style={{ width: 52, flexShrink: 0 }} />
        <div style={{
          flex: '1 1 0', minWidth: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: 12, boxSizing: 'border-box',
        }}>
          <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
            {label ?? 'Échu'}
          </span>
          {showRente && <Badge variant="info" label="Rente" />}
        </div>
        <AmountCol gap={0}>
          <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
            {amount ?? '48 000 €'}
          </span>
        </AmountCol>
        <div style={{ width: 44, flexShrink: 0 }} />
      </div>
    );
  }

  // ── Subline × indirect : victime indirecte 56px ───────────────────────────
  if (type === 'subline') {
    return (
      <div
        className={className}
        onClick={onClick}
        {...hoverHandlers}
        style={{
          ...rowBase, height: 56, alignItems: 'stretch',
          background: colors.semantic.background,
          backgroundImage: isHover ? SUBLINE_HOVER_OVERLAY : undefined,
          ...style,
        }}
      >
        <div style={{ width: 42, flexShrink: 0 }} />
        <div style={{ width: 52, flexShrink: 0 }} />
        <DataTableCell
          type="IV"
          text={name ?? 'Nom victime indirecte'}
          subtext={lien ?? '(Lien)'}
          avatarColor={avatarColor || 'plum'}
          width="auto"
          style={{ flex: '1 1 0', minWidth: 1, height: '100%' }}
        />
        <AmountCol>
          <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {amount ?? '1 200 €'}
          </span>
        </AmountCol>
        <ActionsCell />
      </div>
    );
  }

  // ── MultiCol / Single × direct : lignes 56px ──────────────────────────────
  const isMultiCol = type === 'multiCol';
  const [demanded, offered] = amounts || ['XX €', 'XX €'];
  return (
    <div
      className={className}
      onClick={onClick}
      {...hoverHandlers}
      style={{
        ...rowBase, height: 56, alignItems: 'stretch',
        background: isHover ? colors.semantic.background : colors.semantic.white,
        ...style,
      }}
    >
      {expandable && (
        <div style={{
          height: '100%', flexShrink: 0, boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '12px 12px 12px 16px', gap: 4,
        }}>
          <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
        </div>
      )}
      <DataTableCell
        type="Accronym"
        text={accronym ?? (isMultiCol ? 'ATPT' : 'SE')}
        width={52}
        style={{ height: '100%' }}
      />
      <div style={{
        flex: '1 1 0', minWidth: 1, display: 'flex', alignItems: 'center', gap: 10,
        padding: 12, boxSizing: 'border-box', overflow: 'hidden',
      }}>
        <span style={{ ...body, color: colors.semantic.foreground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label ?? (isMultiCol ? 'Assistance Tierce Personne Temporaire' : 'Souffrances Endurées')}
        </span>
      </div>
      {isMultiCol ? (
        <>
          <AmountCol>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{demanded}</span>
          </AmountCol>
          <AmountCol>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{offered}</span>
          </AmountCol>
        </>
      ) : (
        <>
          <div style={{ flex: '1 1 0', minWidth: 1, maxWidth: 176 }} />
          <div style={{ flex: '1 1 0', minWidth: 1, maxWidth: 176 }} />
        </>
      )}
      <div style={{
        width: 186, flexShrink: 0, height: '100%', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', padding: '0 12px', overflow: 'hidden',
      }}>
        <NatureBadge label={nature ?? 'Salariale'} />
      </div>
      <AmountCol gap={0}>
        <ResultAmount amount={amount ?? '48 000 €'} rente={showRente ? (rente ?? '+ 6 242, 50 € / an') : null} />
      </AmountCol>
      <ActionsCell />
    </div>
  );
}

// Grille des variants — consommée par la démo du playground.
export const ROW_CALCULATION_VARIANTS = [
  { type: 'header', victims: 'direct' },
  { type: 'header', victims: 'indirect' },
  { type: 'multiCol', victims: 'direct' },
  { type: 'single', victims: 'direct' },
  { type: 'subline', victims: 'indirect' },
  { type: 'subline', victims: 'direct' },
];
