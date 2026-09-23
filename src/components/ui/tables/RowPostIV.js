import React, { useState } from 'react';
import { File, EllipsisVertical, CircleArrowUp } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';

/**
 * RowPostIV — Plato design system, famille « Postes ». Source : Figma node
 * 36458:22778 (page ComponentTable, « RowPostIV »).
 *
 * Rangée plate pour les postes IV Type B (Frais divers proches, Frais
 * obsèques). Colonnes : doc (porte-icône + compteur) · victime indirecte
 * (cellule IV : avatar pièce d'échecs + nom + lien) · libellé · montant
 * (revalorisation optionnelle) · options.
 *
 * Variants Figma : Type = Header (40px) / Row (52px) × State = Default / Hover.
 * Hover réel (souris) + `pinHover` pour figer le visuel en démo.
 * Compose DataTableCell (type IV) ; le porte-icône à compteur (Icon Holder
 * Docs + Badge/Counter) est local car DataTableCell.DocSource n'expose pas
 * le compteur.
 */

const sans = typography.fontFamily.sans;
const body = {
  fontFamily: sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...body, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const monoHeader = {
  margin: 0,
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,  // 11
  fontWeight: 500,
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: colors.semantic.mutedForeground,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

function HeaderCell({ label, width, flex = false, align = 'left' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      height: '100%', padding: 12, boxSizing: 'border-box',
      width, flexShrink: width != null ? 0 : undefined,
      flex: flex ? '1 0 0' : undefined, minWidth: flex ? 1 : undefined,
    }}>
      {label != null && (
        <p style={{ ...monoHeader, flex: '1 0 0', minWidth: 1, textAlign: align === 'right' ? 'right' : 'left' }}>
          {label}
        </p>
      )}
    </div>
  );
}

// Porte-icône docs (26px, info subtle) avec compteur (Badge/Counter Figma :
// 16px, fond info text, anneau blanc 2px, Inter 10 medium).
export function DocHolderCounterCell({ count = 1 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      height: 52, padding: 12, boxSizing: 'border-box', flexShrink: 0,
    }}>
      <span style={{
        position: 'relative', width: 26, height: 26, flexShrink: 0,
        borderRadius: radius.md, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        background: colors.feedback.info.subtle,
      }}>
        <File style={{ width: 16, height: 16 }} color={colors.feedback.info.text} />
        {count != null && (
          <span style={{
            position: 'absolute', top: -5, left: 18,
            minWidth: 16, height: 16, boxSizing: 'border-box',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: radius.full,
            background: colors.feedback.info.text,
            border: `2px solid ${colors.semantic.white}`,
            fontFamily: sans,
            fontSize: typography.scale.counter.size,     // 10
            fontWeight: typography.scale.counter.weight, // 500
            lineHeight: 'normal',
            color: colors.semantic.primaryForeground,
            whiteSpace: 'nowrap',
          }}>
            {count}
          </span>
        )}
      </span>
    </div>
  );
}

export default function RowPostIV({
  type = 'header',          // 'header' | 'row'
  state = 'default',        // 'default' | 'hover'
  pinHover = false,         // force le visuel hover (démo)
  revalorisation = false,   // affiche l'ancien montant + flèche de revalorisation
  width = '100%',           // Figma : 1152px
  docCount = 1,
  victime = 'Nom victime indirecte',
  lien = '(Lien)',
  avatarColor = 'purple',
  libelle = 'Analyse biologiques',
  montant = '24,12 €',
  ancienMontant = '23,50€',
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isRow = type === 'row';
  const hover = isRow && (pinHover || state === 'hover' || hovered);

  return (
    <div
      onMouseEnter={isRow ? () => setHovered(true) : undefined}
      onMouseLeave={isRow ? () => setHovered(false) : undefined}
      style={{
        display: 'flex', width, boxSizing: 'border-box',
        alignItems: isRow ? 'center' : 'stretch',
        height: isRow ? 52 : 40,
        background: hover ? colors.semantic.background : colors.semantic.white,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}
    >
      {isRow ? (
        <>
          {/* Doc : porte-icône + compteur */}
          <DocHolderCounterCell count={docCount} />
          {/* Victime indirecte : cellule IV canonique (avatar 28 + nom + lien) */}
          <DataTableCell
            type="IV"
            text={victime}
            subtext={lien}
            avatarColor={avatarColor}
            width="auto"
            style={{ gap: 12, flex: '1 0 0', minWidth: 1 }}
          />
          {/* Libellé */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <span style={{ ...body, color: colors.semantic.foreground, width: '100%', wordBreak: 'break-word' }}>{libelle}</span>
          </div>
          {/* Montant (droite, medium, revalorisation optionnelle) */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
            flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              {revalorisation && (
                <>
                  <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{ancienMontant} ·</span>
                  <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0, alignSelf: 'center' }} strokeWidth={2.66} color={colors.feedback.info.text} />
                </>
              )}
              <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{montant}</span>
            </div>
          </div>
          {/* Actions */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
            padding: '12px 16px 12px 12px', height: '100%', boxSizing: 'border-box', flexShrink: 0,
          }}>
            <EllipsisVertical style={{ width: 16, height: 16 }} color={colors.semantic.foregroundSecondary} />
          </div>
        </>
      ) : (
        <>
          {/* Espace icône (sans libellé ni bordure propre en maquette) */}
          <div style={{ width: 50, flexShrink: 0, alignSelf: 'stretch' }} />
          <HeaderCell label="Nom victime indirecte" flex />
          <HeaderCell label="Libellé" flex />
          <HeaderCell label="Montant" flex align="right" />
          <HeaderCell width={44} />
        </>
      )}
    </div>
  );
}
