import React, { useState } from 'react';
import { File, FileText, EllipsisVertical, CircleArrowUp, HandCoins } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';

/**
 * RowPostTP — Plato design system, famille « Postes ». Source : Figma node
 * 36606:46300 (page ComponentTable, « RowPostTP »).
 *
 * Rangée « Créances Tiers Payeur » d'un poste. Trois niveaux :
 *  - Title (48px)  : bande-titre (chip muted + icône hand-coins + titre medium)
 *  - Header (40px) : en-têtes de colonnes mono 11
 *  - Row (52px)    : doc (porte-icône + compteur) · libellé (file-text rouge
 *    « PDF » + nom de fichier) · période · TP · montant (revalorisation
 *    optionnelle) · options
 *
 * Variants Figma : Type = Title / Header / Row × State = Default / Hover
 * (hover sur Row uniquement). Hover réel (souris) + `pinHover` (démo).
 * NB fidélité Figma : la cellule libellé de la Row est intrinsèque (hug),
 * période / TP sont les colonnes fluides.
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

// Porte-icône docs (26px, info subtle) avec compteur (Badge/Counter Figma).
function DocHolderCounterCell({ count = 1 }) {
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

export default function RowPostTP({
  type = 'header',          // 'title' | 'header' | 'row'
  state = 'default',        // 'default' | 'hover'
  pinHover = false,         // force le visuel hover (démo)
  revalorisation = false,   // affiche l'ancien montant + flèche de revalorisation
  width = '100%',           // Figma : 1152px
  titre = 'Créances Tiers Payeur',
  docCount = 1,
  libelle = 'Frais hospitaliers',
  fichier = 'Factures_Analyses-biologiques_Labo.pdf',
  periode = 'XX/XX/XXXX → XX/XX/XXXX',
  tp = 'CPAM / Harmo / Mutuelle',
  montant = '70 000 €',
  ancienMontant = '23,50€',
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isRow = type === 'row';
  const isTitle = type === 'title';
  const hover = isRow && (pinHover || state === 'hover' || hovered);

  return (
    <div
      onMouseEnter={isRow ? () => setHovered(true) : undefined}
      onMouseLeave={isRow ? () => setHovered(false) : undefined}
      style={{
        display: 'flex', width, boxSizing: 'border-box',
        alignItems: isRow || isTitle ? 'center' : 'stretch',
        height: isRow ? 52 : isTitle ? 48 : 40,
        padding: isTitle ? '12px 16px' : 0,
        background: hover ? colors.semantic.background : colors.semantic.white,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}
    >
      {isTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: 4, borderRadius: radius.md,
            background: colors.semantic.muted,
          }}>
            <HandCoins style={{ width: 20, height: 16 }} strokeWidth={1.6} color={colors.semantic.foregroundSecondary} />
          </span>
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{titre}</span>
        </div>
      )}
      {isRow && (
        <>
          {/* Doc : porte-icône + compteur */}
          <DocHolderCounterCell count={docCount} />
          {/* Libellé : file-text rouge + nom + fichier (hug) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 12, height: '100%', boxSizing: 'border-box', flexShrink: 0,
          }}>
            <FileText style={{ width: 16, height: 16, flexShrink: 0 }} color={colors.doc.pdf} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{libelle}</span>
              <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fichier}</span>
            </div>
          </div>
          {/* Période */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, width: '100%', wordBreak: 'break-word' }}>{periode}</span>
          </div>
          {/* TP */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, width: '100%', wordBreak: 'break-word' }}>{tp}</span>
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
      )}
      {!isRow && !isTitle && (
        <>
          {/* Espace icône (sans libellé ni bordure propre en maquette) */}
          <div style={{ width: 50, flexShrink: 0, alignSelf: 'stretch' }} />
          <HeaderCell label="Libellé" flex />
          <HeaderCell label="Période" flex />
          <HeaderCell label="TP" flex />
          <HeaderCell label="Montant" flex align="right" />
          <HeaderCell width={44} />
        </>
      )}
    </div>
  );
}
