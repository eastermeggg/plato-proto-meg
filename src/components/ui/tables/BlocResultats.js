import React, { useState } from 'react';
import { colors, typography, shadows } from '../../../design-system/tokens';

/**
 * BlocResultats — Plato design system. Source : Figma node 37174:8144
 * (page ComponentTable, « Bloc Résultats »).
 *
 * Le bloc de résultats de la page Chiffrage : DEUX CHIFFRES CÔTE À CÔTE parce
 * qu'ils forment un seul argument de négociation — deux demandes du même brut
 * donnent des nets très différents selon leur composition. Point de couleur
 * par partie (sépia employeur à gauche, vert salarié à droite), chiffres serif
 * encre (display-lg 30/28, -0.6). L'écart vit dans le bandeau du bas — la part
 * qui ne revient à aucune des deux parties.
 *
 * La mention « hors impôt sur le revenu » est DÉRIVÉE (une entrée transitive
 * est nulle), jamais écrite à la main : elle disparaît d'elle-même quand
 * `irRenseigne` passe à true.
 *
 * Chaque chiffre s'ouvre et s'audite comme n'importe quelle rangée (panneau
 * prose) : `onOpenEmployeur` / `onOpenSalarie` / `onOpenEcart` rendent les
 * zones cliquables (hover réel, `pinHover` pour figer). `sticky` colle le bloc
 * en bas de l'écran avec l'ombre portée vers le haut de la maquette.
 *
 * Écarts tokens : bordure Figma #d6d3d1 (stone/300) → colors.semantic
 * .borderStrong (#cbc7c4, demi-cran assombri assumé du DS) ; rayon 10 (aucun
 * cran 10 dans radius — valeur cardChrome du système cotisations) ; ombre
 * sticky = pile Figma exacte (rgba, à promouvoir en token shadows) ; la
 * sous-ligne employeur (Figma Inter 11/14, anomalie) est normalisée sur le
 * cran caption 12/16 de la colonne salarié.
 */

const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`, // 0.12
};
const captionMedium = { ...caption, fontWeight: 500, letterSpacing: 0 };
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,     // 11
  fontWeight: typography.scale['caption-header-cols'].weight, // 500
  textTransform: 'uppercase',
  color: colors.semantic.mutedForeground,
  whiteSpace: 'nowrap',
};
const serifAmount = {
  fontFamily: typography.fontFamily.serif,
  fontSize: typography.scale['display-lg'].size,                 // 30
  lineHeight: `${typography.scale['display-lg'].lineHeight}px`,  // 28
  letterSpacing: `${typography.scale['display-lg'].letterSpacing}px`, // -0.6
  fontWeight: typography.scale['display-lg'].weight,             // 400
  color: colors.semantic.foreground,
  whiteSpace: 'nowrap',
};

// Ombre portée vers le haut de la maquette (bloc collé en bas de l'écran).
// Aucun token shadows n'existe pour cette pile — transcrite telle quelle,
// à promouvoir.
const STICKY_SHADOW = '43px -170px 49px 0px rgba(0,0,0,0), 28px -109px 45px 0px rgba(0,0,0,0.01), 16px -61px 38px 0px rgba(0,0,0,0.02), 7px -27px 28px 0px rgba(0,0,0,0.03), 2px -7px 15px 0px rgba(0,0,0,0.04)';

// Une colonne-chiffre : point de partie + libellé mono uppercase, montant
// serif, sous-ligne, mention dérivée éventuelle.
function ResultatCol({ dotColor, label, amount, sub, mention, borderRight = false, onClick, pinHover }) {
  const [hovered, setHovered] = useState(false);
  const hover = onClick && (pinHover || hovered);
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
        flex: '1 0 0', minWidth: 0, padding: 20, boxSizing: 'border-box',
        alignSelf: 'stretch', textAlign: 'left',
        background: hover ? colors.banner.neutral.bgFrom : 'transparent',
        borderRight: borderRight ? `1px solid ${colors.semantic.border}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={monoCol}>{label}</span>
      </div>
      <span style={serifAmount}>{amount}</span>
      {sub && <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{sub}</span>}
      {mention && <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{mention}</span>}
    </div>
  );
}

export default function BlocResultats({
  // Défauts = exemples Figma. Employeur à GAUCHE (sépia), salarié à DROITE (vert).
  employeur = { label: 'Coût total employeur', amount: '32 651 €', sub: 'sur 26 663 € demandés' },
  salarie = { label: 'Net estimé pour le salarié', amount: '23 010 €', sub: 'sur 26 663 € demandés' },
  irRenseigne = false,       // mention « hors impôt sur le revenu » DÉRIVÉE : disparaît quand true
  ecart = { amount: '9 641 €', phrase: 'de prélèvements sociaux ne reviennent à aucune des deux parties' },
  sticky = false,
  onOpenEmployeur,
  onOpenSalarie,
  onOpenEcart,
  pinHover = false,
  width = '100%',
  style,
}) {
  const [ecartHovered, setEcartHovered] = useState(false);
  const ecartHover = onOpenEcart && (pinHover || ecartHovered);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width,
      background: colors.semantic.white,
      border: `1px solid ${colors.semantic.borderStrong}`,
      borderRadius: 10, overflow: 'hidden', boxSizing: 'border-box',
      boxShadow: sticky ? STICKY_SHADOW : shadows.xs,
      ...(sticky ? { position: 'sticky', bottom: 12, zIndex: 10 } : {}),
      ...style,
    }}>
      {/* deux chiffres côte à côte — un seul argument de négociation */}
      <div style={{ display: 'flex', alignItems: 'stretch', width: '100%', borderBottom: `1px solid ${colors.semantic.border}`, boxSizing: 'border-box' }}>
        <ResultatCol
          dotColor={colors.accents.sand.base}
          label={employeur.label}
          amount={employeur.amount}
          sub={employeur.sub}
          borderRight
          onClick={onOpenEmployeur}
          pinHover={pinHover}
        />
        <ResultatCol
          dotColor={colors.accents.emerald.base}
          label={salarie.label}
          amount={salarie.amount}
          sub={salarie.sub}
          mention={irRenseigne ? null : 'hors impôt sur le revenu'}
          onClick={onOpenSalarie}
          pinHover={pinHover}
        />
      </div>
      {/* la bande d'écart — la part qui ne revient à aucune des deux parties */}
      <div
        role={onOpenEcart ? 'button' : undefined}
        tabIndex={onOpenEcart ? 0 : undefined}
        onClick={onOpenEcart}
        onKeyDown={onOpenEcart ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenEcart(e); } } : undefined}
        onMouseEnter={() => setEcartHovered(true)}
        onMouseLeave={() => setEcartHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          padding: '8px 18px', boxSizing: 'border-box',
          background: ecartHover ? colors.semantic.muted : colors.semantic.background,
          cursor: onOpenEcart ? 'pointer' : 'default',
          transition: 'background-color 0.12s',
        }}
      >
        <span style={{ ...captionMedium, color: colors.semantic.foreground, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{ecart.amount}</span>
        <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ecart.phrase}</span>
      </div>
    </div>
  );
}
