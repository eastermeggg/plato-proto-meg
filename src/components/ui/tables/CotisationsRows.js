import React, { useState } from 'react';
import { FileText, File, Gavel, Stamp, ArrowUpRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { colors, typography, radius, shadows } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';
import DataTableHeader from '../DataTableHeader';

/**
 * CotisationsRows — Plato design system. Sources Figma (ComponentTable) :
 *   « Section Captions »          node 37173:8139  (bande 2 de 2, h 40)
 *   « Row Prélèvement »           node 37171:52969 (12 types)
 *   « Cell Actions »              node 37165:52609 (Chevron / Aucune)
 *   « En-tête Page Prélèvement »  node 37173:8147  (h 52)
 *
 * Les rangées du tableau d'un prélèvement (cotisations salariales, CSG-CRDS,
 * impôt, cotisations patronales) — UNE RANGÉE = UNE SUITE DE CELLULES :
 * [pièce 50] [opérateur 46] [texte · fill] [valeur ≥124] [actions 30].
 * Compose DataTableCell pour les cellules qui mappent (DocSource, Operator*,
 * AmountEmphasis / AmountMuted / AmountResult / AmountProgress).
 *
 * Corrections vers le Figma (vs CotisationsSection.js, cf. rapport) :
 *   - Résultat de section : fond cream/100 (colors.semantic.muted), pas
 *     background.
 *   - Filet de la Règle : colors.semantic.border (Figma var(--border)), pas
 *     borderStrong.
 *   - Captions : libellés alignés à gauche dans leur cellule (p 12), pas
 *     centrés ; letterSpacing 0 (caption-header-cols), pas 0.02em.
 *   - Badges de source : familles accents.* (subtle / border / text), le
 *     mapping exact du set Figma « Source Badge » — pas les teintes piece.* /
 *     banner.* approximées de COT_BADGE_TOKENS.
 *
 * Écarts tokens (pas de valeur inventée, token le plus proche + note) :
 *   - Fond « Résultat du tableau » : Figma #e5eaf0 → colors.piece.expertise.bg
 *     (#dfe8f5), le bleu très clair déjà employé par CotRow.
 *   - Bordure de rangée : Figma var(--border) #e7e5e3 → colors.semantic.border
 *     (#dfdcd9, demi-cran assombri assumé du DS).
 *   - Badge « valeur dérivée » (Report) : Figma #eef1f5 / #d6dde5 / #52657d →
 *     slate (subtle / border / text) du set Source Badge canonique.
 *   - Total de l'en-tête : Inter semibold 15 (aucun cran 15 dans la typescale —
 *     valeur Figma conservée telle quelle).
 */

// ── Styles de texte dérivés des tokens ──────────────────────────────────────
const bodyRegular = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...bodyRegular, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`, // 0.12
};
const captionMedium = { ...caption, fontWeight: 500, letterSpacing: 0 };

// ── CotBadge — badge de source cotisations (5 familles d'autorité) ──────────
// Set Figma « Source Badge » : bg fam.subtle, bordure fam.border, texte
// fam.text, libellé IBM Plex Mono 11 medium lh 14 tracking -0.55, pl 7 pr 8
// py 3, gap 5, rayon 6. Le § porte le texte contraignant (marque universelle
// de l'article de loi) ; le marteau reste seul dans le champ judiciaire ; la
// flèche sortante d'une valeur dérivée NAVIGUE au lieu d'ouvrir.
const COT_FAMILLES = {
  piece:     { fam: colors.accents.indigo,  icon: FileText },
  texte:     { fam: colors.accents.violet,  icon: null },       // § glyphe
  decision:  { fam: colors.accents.emerald, icon: Gavel },
  reference: { fam: colors.accents.sand,    icon: Stamp },
  valeur:    { fam: colors.accents.slate,   icon: ArrowUpRight },
};
export function CotBadge({ famille = 'texte', label, onClick, style }) {
  const t = COT_FAMILLES[famille] || COT_FAMILLES.texte;
  const Icon = t.icon;
  if (!label) return null;
  return (
    <button
      type="button"
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px 3px 7px', borderRadius: radius.md,
        background: t.fam.subtle, border: `1px solid ${t.fam.border}`,
        cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
        ...style,
      }}
    >
      {famille === 'texte'
        ? <span aria-hidden style={{ fontFamily: typography.fontFamily.sans, fontSize: 11.5, fontWeight: 600, color: t.fam.text, opacity: 0.85, lineHeight: 1 }}>§</span>
        : Icon && <Icon style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={2} color={t.fam.text} />}
      <span style={{
        fontFamily: typography.fontFamily.mono, fontSize: 11, fontWeight: 500,
        lineHeight: '14px', letterSpacing: '-0.55px',
        color: t.fam.text, whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </button>
  );
}

// ── CellActions — node 37165:52609 ─────────────────────────────────────────
// Cellule actions d'une rangée (w 30) : chevron 14, calé à droite (pr 16).
// Chevron SEULEMENT si la rangée ouvre un panneau ; toujours visible, pleine
// intensité même sur une ligne écartée.
export function CellActions({ actions = 'chevron', height = '100%', style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      width: 30, height, paddingRight: 16, flexShrink: 0, boxSizing: 'border-box',
      ...style,
    }}>
      {actions === 'chevron' && (
        <ChevronRight style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={2} color={colors.semantic.foregroundMuted} />
      )}
    </div>
  );
}

// ── SectionCaptions — node 37173:8139 ──────────────────────────────────────
// Rangée de captions d'une section (bande 2 de 2, h 40) — composition de
// cellules DataTableHeader : « Pièce » (50) · « Ope. » (46) · le libellé de la
// colonne des valeurs calé à droite (fill) · gouttière actions (30). La
// colonne pièce se masque quand la table n'a aucune pièce ; le libellé de
// valeur porte la direction (« Montant demandé » puis « Montant »), jamais de
// signe collé au nombre.
export function SectionCaptions({
  colonnePiece = true,
  pieceLabel = 'Pièce',
  opeLabel = 'Ope.',
  valueLabel = 'Montant demandé',
  actionsCell = true,
  width = '100%',
  style,
}) {
  // Composition de cellules DataTableHeader (le canonique, node 2768:27447) —
  // chaque cellule porte son filet bas ; la gouttière actions porte le sien.
  return (
    <div style={{
      display: 'flex', alignItems: 'center', width, height: 40,
      background: colors.semantic.white,
      boxSizing: 'border-box', ...style,
    }}>
      {colonnePiece && <DataTableHeader label={pieceLabel} width={50} style={{ flexShrink: 0 }} />}
      <DataTableHeader label={opeLabel} width={46} style={{ flexShrink: 0 }} />
      <DataTableHeader label={valueLabel} rightAlign width="auto" style={{ flex: '1 0 0', minWidth: 0 }} />
      {actionsCell && (
        <div style={{ width: 30, height: 40, flexShrink: 0, boxSizing: 'border-box', borderBottom: `1px solid ${colors.semantic.border}` }} />
      )}
    </div>
  );
}

// ── EnTetePagePrelevement — node 37173:8147 ────────────────────────────────
// En-tête de la page de détail d'un prélèvement — bande flush pleine largeur,
// h 52, bordée en bas, COLLANTE en haut du scroll (prop sticky). De gauche à
// droite : retour (chevron) · titre · total (POSITIF — la direction vit sur la
// page Chiffrage) · « Copier chiffrage ». Le tableau n'a pas d'en-tête : ce
// serait le même chiffre une troisième fois.
export function EnTetePagePrelevement({
  titre = 'Cotisations salariales',
  total = '2 245 €',
  ctaLabel = 'Copier chiffrage',
  onBack,
  onCopy,
  sticky = false,
  width = '100%',
  style,
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, width, height: 52,
      padding: '0 16px', background: colors.semantic.white,
      borderBottom: `1px solid ${colors.semantic.border}`,
      boxSizing: 'border-box',
      ...(sticky ? { position: 'sticky', top: 0, zIndex: 20 } : {}),
      ...style,
    }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Retour au chiffrage"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 'none', background: 'transparent', cursor: onBack ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} color={colors.semantic.foreground} />
      </button>
      <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{titre}</span>
      <span style={{ flex: '1 0 0', minWidth: 0 }} />
      {total != null && (
        // Inter semibold 15/20 — valeur Figma exacte (aucun cran 15 dans la typescale).
        <span style={{ fontFamily: typography.fontFamily.sans, fontSize: 15, lineHeight: '20px', fontWeight: 600, color: colors.semantic.foreground, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {total}
        </span>
      )}
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            height: 32, padding: '0 12px', borderRadius: radius.md,
            background: colors.semantic.primary, color: colors.semantic.white,
            border: 'none', boxShadow: shadows.xs,
            ...bodyMedium, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// ── Cellule pièce (50) ──────────────────────────────────────────────────────
// Poste retenu : porte-document rempli (DataTableCell DocSource). Poste
// écarté : l'état vide — contour pointillé, fichier à 40 % (la cellule existe
// toujours : c'est elle qui tient la colonne). Autres familles : gouttière vide.
function CellPieceVide() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: 50, padding: 12, flexShrink: 0, boxSizing: 'border-box', alignSelf: 'stretch' }}>
      <span style={{
        width: 26, height: 26, flexShrink: 0, borderRadius: radius.md,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: colors.semantic.white,
        border: `1px dashed ${colors.semantic.foregroundMuted}`,
        boxSizing: 'border-box',
      }}>
        <File style={{ width: 16, height: 16, opacity: 0.4 }} strokeWidth={1.75} color={colors.semantic.foreground} />
      </span>
    </div>
  );
}

// ── La règle (dans la cellule texte) ────────────────────────────────────────
// Filet neutre 2 px (une structure : il ne s'atténue jamais), nom rédigé en
// caption medium gris, état d'application en mots, SES sources. Aucun chiffre.
function RegleLine({ regle }) {
  if (!regle) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: `2px solid ${colors.semantic.border}` }}>
      <span style={{ ...captionMedium, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{regle.nom}</span>
      {regle.etat && (
        <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>· {regle.etat}</span>
      )}
      {(regle.sources || []).map((s, i) => (
        <CotBadge key={i} famille={s.famille} label={s.label} onClick={s.onClick} />
      ))}
    </div>
  );
}

// ── RowPrelevement — node 37171:52969 (défaut export) ──────────────────────
// `type` (12, camelCase depuis les variants Figma) :
//   posteRetenu (50) · posteEcarte (70) · exclusionPartielle (70, indentée) ·
//   taux (70) · resultatIntermediaire (44) · deduction (92) · report (44) ·
//   attenteSaisie (53) · attenteCalcul (53) · enCours (44) ·
//   resultatSection (48, fond cream/100) · resultatTableau (48, fond bleu).
// Rangée active (panneau ouvert) : rail encre inset 3 px (prop `active`).
// Survol réel : fond subtle (prop `pinHover` pour figer).
const TYPES = {
  posteRetenu: {
    minHeight: 50, operator: 'OperatorPlus', piece: 'filled',
    label: "Rappel d'heures supplémentaires",
    renvois: [
      { famille: 'texte', label: 'Art. L. 3121-28 C. trav.' },
      { famille: 'decision', label: 'Cass. soc., 27 janv. 2021' },
    ],
    valeur: '8 874 €', valeurStyle: 'emphasis',
  },
  posteEcarte: {
    minHeight: 70, operator: 'OperatorPlus', operatorDimmed: true, piece: 'empty', labelMuted: true,
    label: 'Indemnité légale de licenciement',
    renvois: [{ famille: 'texte', label: 'Art. L. 1234-9 C. trav.' }],
    regle: { nom: 'Plafond commun des indemnités de rupture', sources: [{ famille: 'reference', label: 'BOSS · Indemnités de rupture 2025' }] },
    qualificatif: 'Non soumise', valeurSecondaire: '1 878 €', valeurStyle: 'qualificatif',
  },
  exclusionPartielle: {
    minHeight: 70, operator: 'OperatorMinus', indentee: true,
    label: "Part exonérée d'impôt",
    regle: { nom: "Exonération d'impôt des heures supplémentaires", etat: 'plafond annuel atteint', sources: [{ famille: 'texte', label: 'Art. L. 242-1 CSS' }] },
    valeur: '7 500 €', valeurStyle: 'emphasis',
  },
  taux: {
    minHeight: 70, operator: 'OperatorMultiply',
    label: 'Taux de cotisations salariales',
    regle: { nom: 'Taux de droit commun du régime général', sources: [{ famille: 'texte', label: 'Art. L. 242-1 CSS' }] },
    valeur: '22 %', valeurStyle: 'muted',
  },
  resultatIntermediaire: {
    minHeight: 44, operator: 'OperatorEqual',
    label: 'Cotisations avant déduction',
    valeur: '3 249 €', valeurStyle: 'emphasis',
  },
  deduction: {
    minHeight: 92, operator: 'OperatorMinus',
    label: 'Réduction sur heures supplémentaires',
    regle: { nom: 'Réduction salariale sur heures supplémentaires', etat: 'appliquée au taux maximum', sources: [{ famille: 'texte', label: 'Art. L. 242-1 CSS' }] },
    note: 'plafonnée aux cotisations vieillesse effectivement dues',
    valeur: '1 004 €', valeurStyle: 'emphasis',
  },
  report: {
    minHeight: 44, operator: 'OperatorPlus',
    label: 'Base soumise à cotisations',
    renvois: [{ famille: 'valeur', label: 'Cotisations salariales' }],
    valeur: '14 769 €', valeurStyle: 'emphasis',
  },
  attenteSaisie: {
    minHeight: 53, operator: 'OperatorMultiply',
    label: "Taux marginal d'imposition",
    motif: 'à renseigner · dépend du foyer fiscal', valeurStyle: 'attente',
  },
  attenteCalcul: {
    minHeight: 53, operator: 'OperatorMinus',
    label: 'Cotisations et CSG déductibles',
    motif: 'à calculer · suit les autres prélèvements', valeurStyle: 'attente',
  },
  enCours: {
    minHeight: 44, operator: 'OperatorEqual',
    label: 'Cotisations avant déduction',
    valeurStyle: 'progress',
  },
  resultatSection: {
    minHeight: 48, operator: 'OperatorEqualResult', emphase: 'section', labelStrong: true,
    label: 'Base soumise à cotisations',
    noteInline: '3 postes sur 5 retenus',
    valeur: '14 769 €', valeurStyle: 'result',
  },
  resultatTableau: {
    minHeight: 48, operator: 'OperatorEqualResult', emphase: 'tableau', labelStrong: true,
    label: 'Cotisations salariales',
    valeur: '2 245 €', valeurStyle: 'result',
  },
};

export default function RowPrelevement({
  type = 'posteRetenu',
  label,               // libellé — deux lignes max, jamais tronqué
  renvois,             // sources DU POSTE : [{ famille, label, onClick }], 2 max puis +N côté appelant
  regle,               // { nom, etat, sources: [{ famille, label }] }
  note,                // note grise sous la règle (provenance / constat, jamais de formule)
  noteInline,          // note inline après le libellé (résultat de section)
  valeur,              // montant / pourcentage formaté
  valeurSecondaire,    // montant demandé barré (poste écarté)
  qualificatif,        // « Non soumise » (poste écarté)
  motif,               // motif du tiret (attente) — dérivé, jamais rédigé à la main
  showPieceCell = true,
  actions = 'chevron', // 'chevron' | 'none'
  active = false,      // panneau ouvert : rail encre inset 3 px
  indentee,            // exclusion partielle : retrait +18 (défaut par type)
  pinHover = false,
  width = '100%',
  onClick,
  style,
}) {
  const t = TYPES[type] || TYPES.posteRetenu;
  const [hovered, setHovered] = useState(false);
  const hover = pinHover || hovered;

  const lbl = label ?? t.label;
  const rvs = renvois ?? t.renvois ?? [];
  const rgl = regle !== undefined ? regle : t.regle;
  const nt = note !== undefined ? note : t.note;
  const ntInline = noteInline !== undefined ? noteInline : t.noteInline;
  const val = valeur ?? t.valeur;
  const valSec = valeurSecondaire !== undefined ? valeurSecondaire : t.valeurSecondaire;
  const qual = qualificatif ?? t.qualificatif;
  const mtf = motif ?? t.motif;
  const indent = indentee !== undefined ? indentee : !!t.indentee;

  // Fonds : blanc / cream-100 (résultat de section, Figma) / bleu très clair
  // (résultat du tableau — LE chiffre que la page produit).
  const baseBg = t.emphase === 'tableau' ? colors.piece.expertise.bg
    : t.emphase === 'section' ? colors.semantic.muted
    : colors.semantic.white;
  const hoverBg = t.emphase === 'tableau' ? colors.piece.medical.bg
    : t.emphase === 'section' ? colors.semantic.muted
    : colors.banner.neutral.bgFrom;

  // Cellule valeur — droite, min 124.
  const valueCell = (() => {
    const shellStyle = { height: 'auto', alignSelf: 'stretch', flexShrink: 0 };
    switch (t.valeurStyle) {
      case 'result':
        return <DataTableCell type="AmountResult" text={val} width={124} style={shellStyle} />;
      case 'muted':
        return <DataTableCell type="AmountMuted" text={val} width={124} style={shellStyle} />;
      case 'progress':
        return <DataTableCell type="AmountProgress" text={val ?? '···'} width={124} style={shellStyle} />;
      case 'qualificatif':
        // Node 37171 : qualificatif en caption 12/16 muted + montant demandé
        // barré 12/16 stone-400 — jamais 0 €. (Diverge de DataTableCell
        // AmountQualificatif, câblé 14 encre sur le node 36554 : signalé.)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2, minWidth: 124, padding: 12, boxSizing: 'border-box', alignSelf: 'stretch' }}>
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{qual}</span>
            {valSec != null && (
              <span style={{ ...caption, color: colors.semantic.foregroundMuted, textDecoration: 'line-through', whiteSpace: 'nowrap' }}>{valSec}</span>
            )}
          </div>
        );
      case 'attente':
        // Tiret + motif dérivé (Inter medium 10 — cran `counter` de la typescale).
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2, minWidth: 124, padding: 12, boxSizing: 'border-box', alignSelf: 'stretch' }}>
            <span style={{ ...bodyRegular, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>{val ?? '—'}</span>
            {mtf && (
              <span style={{
                fontFamily: typography.fontFamily.sans,
                fontSize: typography.scale.counter.size, // 10
                fontWeight: typography.scale.counter.weight, // 500
                lineHeight: 'normal',
                color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap',
              }}>
                {mtf}
              </span>
            )}
          </div>
        );
      case 'emphasis':
      default:
        return <DataTableCell type="AmountEmphasis" text={val} width={124} style={shellStyle} />;
    }
  })();

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', width,
        minHeight: t.minHeight,
        background: hover ? hoverBg : baseBg,
        borderBottom: `1px solid ${colors.semantic.border}`,
        // Rail encre de 3 px sur la ligne dont le panneau est ouvert.
        boxShadow: active ? `inset 3px 0px 0px 0px ${colors.semantic.foreground}` : 'none',
        boxSizing: 'border-box', textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.12s',
        ...style,
      }}
    >
      {/* cellule pièce — 50 (12 + 26 + 12) : remplie / vide pointillée / gouttière */}
      {showPieceCell && (
        t.piece === 'filled'
          ? <DataTableCell type="DocSource" style={{ height: 'auto', alignSelf: 'stretch', flexShrink: 0 }} />
          : t.piece === 'empty'
            ? <CellPieceVide />
            : <div style={{ width: 50, flexShrink: 0, alignSelf: 'stretch' }} />
      )}
      {/* cellule opérateur — 46, la colonne qui raconte le calcul ; à 45 % sur
          une ligne écartée (une direction éteinte, pas une alerte) */}
      <DataTableCell
        type={t.operator}
        style={{ height: 'auto', alignSelf: 'stretch', flexShrink: 0, ...(t.operatorDimmed ? { opacity: 0.45 } : {}) }}
      />
      {/* cellule texte — fill : libellé + renvois (+ note inline), la règle, la note */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, flex: '1 0 0', minWidth: 0, padding: `12px 12px 12px ${indent ? 30 : 12}px`, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{
            ...(t.labelStrong ? bodyMedium : bodyRegular),
            color: t.labelMuted ? colors.semantic.mutedForeground : colors.semantic.foreground,
          }}>
            {lbl}
          </span>
          {ntInline && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{ntInline}</span>
          )}
          {rvs.map((s, i) => (
            <CotBadge key={i} famille={s.famille} label={s.label} onClick={s.onClick} />
          ))}
        </div>
        {rgl && <RegleLine regle={rgl} />}
        {nt && (
          <span style={{ ...caption, color: colors.semantic.foregroundMuted, whiteSpace: 'nowrap' }}>{nt}</span>
        )}
      </div>
      {/* cellule valeur — droite, min 124 */}
      {valueCell}
      {/* cellule actions — 30, chevron seulement si la rangée ouvre un panneau */}
      <CellActions actions={actions === 'chevron' ? 'chevron' : 'none'} />
    </div>
  );
}

// Liste ordonnée des 12 types — consommée par les démos du playground.
export const ROW_PRELEVEMENT_TYPES = [
  'posteRetenu', 'posteEcarte', 'exclusionPartielle', 'taux',
  'resultatIntermediaire', 'deduction', 'report',
  'attenteSaisie', 'attenteCalcul', 'enCours',
  'resultatSection', 'resultatTableau',
];
