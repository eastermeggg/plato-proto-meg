import React, { useState } from 'react';
import {
  Euro, HandCoins, TrendingDown, Coins, ChevronDown, CircleArrowUp,
  EllipsisVertical, File, ArrowRight, Repeat,
} from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';
import Badge from '../Badge';

/**
 * RowPGP — Plato design system. Sources : Figma nodes
 *   36459:3308 « Row PGP / Reference »  (Title 66 / Header 40 / Line 52 / Footer 48)
 *   36459:3355 « Row PGP / Perceived »  (Title 48 / Header 40 / Line 52)
 *   36459:3406 « Row PGP / Loss »       (Title 48 / Header 40 / Line 52)
 *   36459:3447 « Row PGP / Echoir »     (Title 52)
 * Page ComponentTable, famille « Chiffrage / PGP / Totaux ».
 *
 * Rangées des tables PGP (Type D) : revenu de référence, revenus perçus,
 * perte de chance, arrérage à échoir.
 *
 * API : `family` ('reference' | 'perceived' | 'loss' | 'echoir') ×
 *       `type` ('title' | 'header' | 'line' | 'footer').
 * State Default / Hover sur les lignes (hover réel + `pinHover`).
 *
 * NB serif : les montants des rangées Title (« 3 200€ », « X XXX € ») sont en
 * RL Para (style Figma display-xs 16/20, -0.5) — marqueur voulu de la famille.
 * Les montants de Line / Footer restent en Inter 500 14 (design context).
 *
 * Compose Badge (Sync. PGPA info / coefficient secondary). Tokens uniquement.
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
const counter = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.counter.size,                 // 10
  fontWeight: typography.scale.counter.weight,             // 500
  lineHeight: 'normal',
};
const serifAmount = {
  fontFamily: typography.fontFamily.serif,
  fontSize: typography.scale['display-xs'].size,           // 16
  lineHeight: '20px',
  fontWeight: typography.scale['display-xs'].weight,       // 500
  letterSpacing: `${typography.scale['display-xs'].letterSpacing}px`, // -0.5
};

// ── Config par famille (icône de titre + libellés + colonnes du header) ─────
const FAMILIES = {
  reference: {
    icon: Euro,
    title: 'Revenu de référence',
    iconBg: colors.semantic.secondary,
    headers: [
      { label: 'Doc', width: 52, align: 'center' },
      { label: 'Période', width: 294 },
      { label: 'Revenu net période', flex: true, align: 'right', padX: 8 },
      { width: 32 },
    ],
  },
  perceived: {
    icon: HandCoins,
    title: 'Revenus perçus',
    iconBg: colors.semantic.muted,
    headers: [
      { label: 'Doc', width: 52, align: 'center' },
      { label: 'Période', width: 294 },
      { label: 'Revenu net période', flex: true, align: 'right', padX: 8 },
      { width: 32 },
    ],
  },
  loss: {
    icon: TrendingDown,
    title: 'Perte de chance',
    iconBg: colors.semantic.muted,
    headers: [
      { label: 'Doc', width: 52, align: 'center' },
      { label: 'Libellé', flex: true },
      { label: 'Montant espéré', flex: true, align: 'right', padX: 8 },
      { label: 'Coefficient', flex: true, align: 'right' },
      { label: 'Montant proraté', flex: true, align: 'right', padX: 8 },
      { width: 32 },
    ],
  },
  echoir: {
    icon: Coins,
    title: 'Arrérage à échoir',
    iconBg: colors.semantic.muted,
  },
};

// Pastille d'icône de titre : conteneur teinté p4 radius 6, glyphe 16.
function TitleIcon({ family }) {
  const fam = FAMILIES[family];
  const Icon = fam.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: 4, borderRadius: radius.md, background: fam.iconBg, flexShrink: 0,
    }}>
      <Icon style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.foreground} />
    </span>
  );
}

// Cellule Doc : porte-icône 26 info-subtle + compteur 16 (Icon Holder Docs 35734:36392).
function DocCell({ count = 1 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, height: 52,
      padding: 12, boxSizing: 'border-box', flexShrink: 0,
    }}>
      <span style={{
        position: 'relative', width: 26, height: 26, flexShrink: 0,
        borderRadius: radius.md, background: colors.feedback.info.subtle,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <File style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.feedback.info.text} />
        <span style={{
          ...counter, color: colors.semantic.primaryForeground,
          position: 'absolute', top: -5, left: 18, minWidth: 16, height: 16,
          borderRadius: radius.full, background: colors.feedback.info.text,
          border: `2px solid ${colors.semantic.white}`, boxSizing: 'border-box',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {count}
        </span>
      </span>
    </div>
  );
}

// Mention revalorisation : « 23,50€ · » + circle-arrow-up 12.
function Revalorisation({ text }) {
  return (
    <>
      <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
        {text ?? '23,50€ ·'}
      </span>
      <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
    </>
  );
}

// Cellule Actions : ellipsis-vertical 16 (pr 16).
function ActionsCell() {
  return (
    <div style={{
      height: '100%', flexShrink: 0, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
      padding: '12px 16px 12px 0', gap: 4,
    }}>
      <EllipsisVertical style={{ width: 16, height: 16 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
    </div>
  );
}

export default function RowPGP({
  family = 'reference',       // 'reference' | 'perceived' | 'loss' | 'echoir'
  type = 'title',             // 'title' | 'header' | 'line' | 'footer'
  state = 'default',          // 'default' | 'hover'
  pinHover = false,
  // Flags Figma
  emptyState = false,         // Title : « Aucune donnée renseignée »
  syncPgpActuels = false,     // Title reference : badge « Sync. PGPA »
  revalorisation = false,     // Line : mention 23,50€ + circle-arrow-up
  showRevalorisation = false, // montant revalorisé secondaire (reference)
  showDescription = false,    // Line perceived : sous-libellé
  showRente = true,           // Echoir : « / an »
  // Contenu data-driven — défauts = exemples du Figma
  title,                      // libellé du Title
  amount,                     // montant principal (Title serif / Line 500)
  amountSuffix,               // suffixe sans (« / mois », « / an »)
  description,                // Title reference : « soit XX XXX € sur la période (10 mois) »
  label,                      // Line : libellé (période / libellé de perte) · Footer : libellé
  dateStart,                  // Line perceived
  dateEnd,                    // Line perceived
  sublabel,                   // Line perceived : « Libellé, IJ reçues »
  revalue,                    // montant revalorisé secondaire (« 32 000 € »)
  coefficient,                // Line loss : « 100 % »
  expectedAmount,             // Line loss : montant espéré
  docCount = 1,
  onClick,
  width = '100%',
  className,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isHover = pinHover || state === 'hover' || hovered;
  const fam = FAMILIES[family] || FAMILIES.reference;

  const rowBase = {
    display: 'flex',
    width,
    boxSizing: 'border-box',
    borderBottom: `1px solid ${colors.semantic.border}`,
    cursor: onClick ? 'pointer' : 'default',
  };
  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  // ── Footer (reference) : moyenne 48px sur fond background ────────────────
  if (type === 'footer') {
    return (
      <div className={className} onClick={onClick} style={{
        ...rowBase, alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: colors.semantic.background, ...style,
      }}>
        <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
          {label ?? 'Revenu moyen sur la période (10 mois)'}
        </span>
        <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {amount ?? '31 000 €'}
        </span>
      </div>
    );
  }

  // ── Header : bande de colonnes mono 11, cellules h 40 ────────────────────
  if (type === 'header') {
    return (
      <div className={className} style={{ ...rowBase, alignItems: 'stretch', background: colors.semantic.white, ...style }}>
        {(fam.headers || []).map((col, i) => (
          <div key={i} style={{
            height: 40, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center',
            justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
            padding: `12px ${col.padX ?? 12}px`,
            ...(col.flex ? { flex: '1 1 0', minWidth: 1 } : { width: col.width, flexShrink: 0 }),
          }}>
            {col.label && (
              <span style={{
                ...monoCol, color: colors.semantic.mutedForeground,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textAlign: col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left',
              }}>
                {col.label}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Line : rangée de données 52px ────────────────────────────────────────
  if (type === 'line') {
    return (
      <div
        className={className}
        onClick={onClick}
        {...hoverHandlers}
        style={{
          ...rowBase, minHeight: 52, alignItems: 'center',
          background: isHover ? colors.semantic.background : colors.semantic.white,
          ...style,
        }}
      >
        <DocCell count={docCount} />
        {family === 'perceived' ? (
          <div style={{
            flex: '1 1 0', minWidth: 1, alignSelf: 'stretch', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, padding: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
                {dateStart ?? '03/02/2026'}
              </span>
              <ArrowRight style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
              <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
                {dateEnd ?? '15/02/2026'}
              </span>
            </div>
            {showDescription && (
              <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
                {sublabel ?? 'Libellé, IJ reçues'}
              </span>
            )}
          </div>
        ) : (
          <div style={{
            flex: '1 1 0', minWidth: 1, alignSelf: 'stretch', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 8, padding: 12,
          }}>
            <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
              {label ?? (family === 'loss' ? 'Perte de chance libellé' : 'Janvier 2022')}
            </span>
          </div>
        )}
        {family === 'loss' ? (
          <>
            <div style={{
              flex: '1 1 0', minWidth: 1, alignSelf: 'stretch', boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, padding: 12,
            }}>
              {revalorisation && <Revalorisation />}
              <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
                {expectedAmount ?? '1 600 €'}
              </span>
            </div>
            <div style={{
              flex: '1 1 0', minWidth: 1, alignSelf: 'stretch', boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: 12,
            }}>
              <Badge variant="secondary" size="md" label={coefficient ?? '100 %'} />
            </div>
          </>
        ) : null}
        <div style={{
          flex: '1 1 0', minWidth: 1, alignSelf: 'stretch', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, padding: 12,
        }}>
          {revalorisation && <Revalorisation />}
          {showRevalorisation && (
            <>
              <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
                {revalue ?? '32 000 €'}
              </span>
              <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
            </>
          )}
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
            {amount ?? (family === 'reference' ? '50 €' : family === 'perceived' ? '8 400 €' : '1 600 €')}
          </span>
        </div>
        <ActionsCell />
      </div>
    );
  }

  // ── Title : en-tête de section (66 / 48 / 48 / 52 px) ────────────────────
  const isReference = family === 'reference';
  const isEchoir = family === 'echoir';
  const defaultAmount = isReference ? '3 200€ ' : 'X XXX €';
  const defaultSuffix = isReference ? '/ mois' : isEchoir && showRente ? '/ an' : null;
  return (
    <div className={className} onClick={onClick} style={{
      ...rowBase, alignItems: 'center', justifyContent: 'space-between',
      padding: isEchoir ? '14px 16px' : '12px 16px',
      background: colors.semantic.white, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <TitleIcon family={family} />
        <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>
          {title ?? fam.title}
        </span>
        {isReference && syncPgpActuels && (
          <Badge variant="info" label="Sync. PGPA" leftIcon={Repeat} />
        )}
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 6, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {emptyState && (
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
              Aucune donnée renseignée
            </span>
          )}
          {showRevalorisation && (
            <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
          )}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span style={{ ...serifAmount, color: colors.semantic.foreground }}>
              {amount ?? defaultAmount}
            </span>
            {isReference && (amountSuffix ?? defaultSuffix) && (
              <span style={{ ...body, color: colors.semantic.mutedForeground }}>
                {amountSuffix ?? defaultSuffix}
              </span>
            )}
          </span>
          {isEchoir && (amountSuffix ?? defaultSuffix) && (
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>
              {amountSuffix ?? defaultSuffix}
            </span>
          )}
          <ChevronDown style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
        </div>
        {isReference && (
          <div style={{ paddingRight: 25 }}>
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap', textAlign: 'right' }}>
              {description ?? 'soit XX XXX € sur la période (10 mois)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Grille des variants — consommée par la démo du playground.
export const ROW_PGP_VARIANTS = [
  { family: 'reference', type: 'title' },
  { family: 'reference', type: 'header' },
  { family: 'reference', type: 'line' },
  { family: 'reference', type: 'footer' },
  { family: 'perceived', type: 'title' },
  { family: 'perceived', type: 'header' },
  { family: 'perceived', type: 'line' },
  { family: 'loss', type: 'title' },
  { family: 'loss', type: 'header' },
  { family: 'loss', type: 'line' },
  { family: 'echoir', type: 'title' },
];
