import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, ExternalLink, Percent, FileText, Gavel, Stamp, ArrowUpRight, SlidersHorizontal, Globe, Diamond, Plus, Minus, Equal } from 'lucide-react';
import {
  CHIFFRAGE_PRELEVEMENTS, COTISATIONS_PAGES, RESULTATS_BLOC, COTISATIONS_SOURCES,
  resolveCotLigne, fmtCot, fmtCotValeur, fmtCotManque, getCotValeur,
  sourceFamille, COT_BADGE_TOKENS, pageSections, pageLignes,
} from '../../data/cotisationsSocial';

// ─────────────────────────────────────────────────────────────────────────────
// COTISATIONS & IMPÔTS - composants (spec v3).
//
// La ligne a HUIT EMPLACEMENTS : l'opérateur (pastille de largeur fixe -
// l'alignement vertical de cette colonne rend le calcul lisible sans lire les
// libellés), la pièce, le libellé (deux lignes max, jamais tronqué), les
// renvois (les sources DU POSTE, deux max puis compteur), la règle (composant
// déclaré : filet 2 px, nom rédigé, état d'application en mots, SES sources),
// la note (provenance / dénombrement / constat - jamais de formule), la
// valeur (chasse fixe pour un nombre, texte normal gris pour un qualificatif :
// cette bascule typographique est le seul signal qui distingue ce qui
// s'additionne), le chevron (seulement si la ligne ouvre un panneau).
//
// Aucune formule dans le tableau - elle vit dans la prose du panneau, valeurs
// substituées et arrondi visible. Aucun montant négatif : la direction est
// portée par l'opérateur ou le libellé de colonne. L'opérateur « − » est
// NEUTRE : le rouge est réservé au destructif, l'orange à l'alerte, et aucun
// des deux n'apparaît dans un tableau en lecture.
//
// Navigation, trois niveaux jamais plus :
//   Chiffrage → PrelevementPage (remplace l'écran) → LinePanel (latéral).
// ─────────────────────────────────────────────────────────────────────────────

const LINE = '#e7e5e3', INK = '#292524', INK2 = '#44403c', MUTE = '#78716c', FAINT = '#a8a29e', PAPER = '#f8f7f5', SUBTLE = '#fafaf9';
const MONO = "'IBM Plex Mono', monospace";
// Filet de séparation entre lignes : la bordure système - les rangées de
// 52 px aérées suffisent à faire lire chaque ligne (métrique Plato).
export const ROW_DIVIDER = '#e7e5e3';
// Fond du résultat du tableau : le bleu très clair Plato - c'est LE chiffre
// que la page produit, il porte la seule teinte du tableau.
const RESULT_TABLEAU_BG = '#eaf1ff', RESULT_TABLEAU_HOVER = '#dfe9fb';
// Filet de la règle : une structure, pas un contenu - il ne s'atténue JAMAIS,
// même sur une ligne écartée.
const RULE_RAIL = '#d6d3d1';
const colHeaderStyle = { fontFamily: MONO, fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' };
// Carte Plato : rayon 10, ombre sm à deux couches.
export const cardChrome = { border: `1px solid ${LINE}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05), 0px 1px 1px 0px rgba(26,26,26,0.05)', background: 'white' };

// ── la cellule ──────────────────────────────────────────────────────────────
// La ligne n'est pas un flex ad hoc : c'est une rangée de CELLULES autonomes
// (convention Plato « DataTableContent »). Chaque cellule porte sa largeur et
// son padding ; la rangée ne fait qu'aligner. C'est ce qui garantit que les
// colonnes (pièce, opérateur, libellé, valeur, chevron) tombent au même
// endroit sur toute la hauteur du tableau.
function RowCell({ width, flex = false, align = 'center', padding = 0, children, style }) {
  return (
    <div
      className="flex items-center"
      style={{
        width, flex: flex ? '1 0 0' : 'none', minWidth: flex ? 0 : undefined,
        flexShrink: flex ? undefined : 0, justifyContent: align, padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── l'opérateur ─────────────────────────────────────────────────────────────
// Une icône Lucide (plus / minus / x / equal) dans une pastille circulaire de
// 22 px à anneau de 2 px - la forme exacte du système Plato. Jamais un signe
// collé au nombre. L'anneau du « − » prend la teinte lie-de-vin à 20 % du
// système (à peine perceptible : ce n'est pas une alerte, juste une
// direction). Le « = » d'un résultat passe en encre pleine, glyphe blanc ;
// un résultat intermédiaire reste sans emphase.
const OP_ICONS = { '+': Plus, '-': Minus, x: X, '×': X, '=': Equal };
export function OperateurCell({ op, emphase = false, ecartee = false }) {
  if (!op) return null;
  const Icon = OP_ICONS[op];
  const dark = op === '=' && emphase;
  const ring = op === '-' ? 'rgba(127,29,29,0.2)' : 'rgba(41,37,36,0.1)';
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      aria-hidden
      style={{
        width: 22, height: 22, borderRadius: 9999,
        border: `2px solid ${ring}`,
        background: dark ? INK : 'transparent',
        opacity: ecartee ? 0.45 : 1,
      }}
    >
      {Icon && <Icon style={{ width: 10, height: 10, color: dark ? 'white' : INK2 }} strokeWidth={2.75} />}
    </span>
  );
}

// ── le badge ────────────────────────────────────────────────────────────────
// La couleur dit ce qui se passe au clic et quel poids d'autorité on invoque ;
// le préfixe dit le type précis. Cinq teintes + un traitement sans teinte pour
// douze types de référence :
//   PIECE (bleu · fichier · ouvre le document) · TEXTE (violet · § · ouvre
//   l'extrait) · DECISION (vert · marteau · ouvre l'extrait) · REFERENCE
//   (sépia · tampon · ouvre l'extrait) · VALEUR (neutre · flèche sortante si
//   dérivée, curseurs si variable · NAVIGUE) · WEB (contour pointillé · globe).
// Le § porte le texte contraignant : marque universelle de l'article de loi,
// aucune mémorisation, et le marteau reste seul dans le champ judiciaire.
// Un badge est toujours cliquable, jamais tronqué, ne porte jamais de montant
// et garde sa pleine intensité sur une ligne écartée.
const FAMILLE_ICONS = { PIECE: FileText, DECISION: Gavel, REFERENCE: Stamp, WEB: Globe };
export function BadgePill({ source, valeur, onOpen, onNavigate, active = false }) {
  const isValeur = !!valeur;
  const famille = isValeur ? 'VALEUR' : sourceFamille(source?.type);
  const tok = COT_BADGE_TOKENS[famille] || COT_BADGE_TOKENS.TEXTE;
  const label = isValeur ? valeur.label : source?.citation;
  if (!label) return null;
  const Icon = isValeur ? (valeur.variable ? SlidersHorizontal : ArrowUpRight) : FAMILLE_ICONS[famille];
  const handle = (e) => {
    e.stopPropagation();
    if (isValeur) { onNavigate && onNavigate(valeur.target); } else { onOpen && onOpen(source); }
  };
  return (
    <button
      onClick={handle}
      title={isValeur ? `Voir : ${label}` : (source?.extrait || label)}
      className="inline-flex items-center transition-opacity hover:opacity-80 align-baseline flex-shrink-0"
      style={{
        gap: 4, padding: '3px 8px', borderRadius: 6, background: tok.bg,
        border: `1px ${tok.dashed ? 'dashed' : 'solid'} ${active ? tok.color : (tok.dashed || tok.border || 'transparent')}`,
        boxShadow: tok.dashed ? 'none' : '0px 1px 2px 0px rgba(26,26,26,0.05)',
        cursor: 'pointer',
      }}
    >
      {famille === 'TEXTE'
        ? <span aria-hidden style={{ fontSize: 11.5, fontWeight: 600, color: tok.color, opacity: 0.85, lineHeight: 1 }}>§</span>
        : Icon && <Icon className="flex-shrink-0" style={{ width: 12, height: 12, color: tok.color, opacity: 0.85 }} strokeWidth={2} />}
      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: tok.color, whiteSpace: 'nowrap', lineHeight: '14px' }}>{label}</span>
      {source?.millesime && (
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: tok.color, opacity: 0.62 }}>{source.millesime}</span>
      )}
    </button>
  );
}

// Porte-document + pastille de compteur - la représentation des pièces déjà
// établie dans le chiffrage (dommage corporel), réutilisée telle quelle
// (Icon Holder Docs : 26 px, rayon 6, fichier 16 px).
export function PieceHolder({ sources = [], onClick }) {
  const count = sources.length;
  if (!count) return null;
  const title = sources.map(s => s.citation).filter(Boolean).join(' · ');
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      title={title}
      aria-label={title}
      className="relative inline-flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
      style={{ width: 26, height: 26, borderRadius: 6, background: COT_BADGE_TOKENS.PIECE.bg, border: 'none', cursor: onClick ? 'pointer' : 'default' }}
    >
      <FileText style={{ width: 15, height: 15, color: COT_BADGE_TOKENS.PIECE.color }} strokeWidth={2} />
      {count > 1 && (
        <span className="absolute inline-flex items-center justify-center" style={{ top: -5, left: 16, minWidth: 15, height: 15, padding: '0 3px', background: COT_BADGE_TOKENS.PIECE.color, color: '#fff', fontSize: 9.5, fontWeight: 600, lineHeight: 1, borderRadius: 9999, border: '2px solid #fff' }}>{count}</span>
      )}
    </button>
  );
}

// L'état vide du porte-document (Icon Holder Docs · Empty) : un contour
// pointillé - la cellule existe toujours, c'est elle qui tient la colonne.
// Rendu seulement sur un poste (un fait attend une pièce), jamais sur une
// opération ou un résultat.
export function PiecePlaceholder() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ width: 26, height: 26, borderRadius: 6, background: 'white', border: `1px dashed ${FAINT}` }}
    >
      <FileText style={{ width: 15, height: 15, color: INK2, opacity: 0.4 }} strokeWidth={1.75} />
    </span>
  );
}

// Pilule de valeur - une variable de chiffrage sur la page Chiffrage, avec sa
// valeur dedans. Même style que le badge de variable (curseurs · teinte
// neutre VALEUR · bordure teintée · ombre xs · chasse fixe) : le langage
// visuel dit « ceci est un levier réglable dans le chat », la pilule porte en
// plus la valeur courante. (L'interdit « un badge ne porte jamais de
// montant » vise les sources ; ici la valeur EST le contenu.)
export function ValuePill({ children }) {
  const tok = COT_BADGE_TOKENS.VALEUR;
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 5, padding: '4px 10px', borderRadius: 6, background: tok.bg,
        border: `1px solid ${tok.border}`, boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)',
      }}
    >
      <SlidersHorizontal className="flex-shrink-0" style={{ width: 12, height: 12, color: tok.color, opacity: 0.85 }} strokeWidth={2} />
      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color: tok.color, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', lineHeight: '16px' }}>
        {children}
      </span>
    </span>
  );
}

// ── la règle ────────────────────────────────────────────────────────────────
// Un composant, pas une note. Filet neutre de 2 px à gauche (une structure :
// il ne s'atténue jamais, même sur une ligne écartée), nom rédigé en medium
// gris, état d'application en mots, et SES sources - distinctes de celles du
// poste : une source appartient à ce qu'elle justifie. Aucun chiffre. La
// règle n'ouvre pas son propre panneau ; seuls ses badges sont cliquables.
export function RegleTag({ regle, etatApplication, onOpenSource }) {
  if (!regle) return null;
  const etat = etatApplication ?? regle.etatApplication;
  const sources = (regle.sources || []).map(id => COTISATIONS_SOURCES[id]).filter(Boolean);
  return (
    <span className="inline-flex items-baseline flex-wrap" style={{ gap: '3px 8px', paddingLeft: 8, borderLeft: `2px solid ${RULE_RAIL}` }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: MUTE, lineHeight: '16px' }}>
        {regle.nom}
        {etat && <span style={{ fontWeight: 400, color: FAINT }}> · {etat}</span>}
      </span>
      {sources.slice(0, 2).map(s => (
        <BadgePill key={s.id} source={s} onOpen={onOpenSource} />
      ))}
    </span>
  );
}

// ── la valeur ───────────────────────────────────────────────────────────────
// Chiffres à largeur fixe (Inter + tabular-nums, la convention des montants
// dans toute l'app) : euro en medium noir, pourcentage et heures en graisse
// normale grise - non monétaires, donc visiblement différents. Un résultat
// passe en 16 px demi-gras. Texte normal gris pour un qualificatif : ce qui
// ne s'additionne pas ne ressemble pas à ce qui s'additionne. Le montant
// demandé d'un poste écarté passe en dessous, barré, hors colonne. Un tiret +
// motif dérivé quand la valeur manque ; trois points quand elle se calcule.
export function MontantCell({ valeur, qualificatif = null, valeurSecondaire = null, emphase = false, enCours = false }) {
  const missing = !valeur || valeur.value == null;
  const isEuro = valeur?.unit === 'EUR' || !valeur;
  const motif = fmtCotManque(valeur);
  return (
    <div className="flex flex-col items-end justify-center flex-shrink-0" style={{ minWidth: 100, gap: 2 }}>
      {enCours ? (
        <span className="animate-pulse" style={{ fontSize: 14, color: FAINT, letterSpacing: 2, lineHeight: '20px' }}>···</span>
      ) : qualificatif ? (
        <span style={{ fontSize: 13, color: MUTE, lineHeight: '18px' }}>{qualificatif}</span>
      ) : (
        <span style={{
          fontVariantNumeric: 'tabular-nums', lineHeight: '20px',
          fontSize: emphase ? 16 : 14,
          fontWeight: emphase ? 600 : (isEuro && !missing ? 500 : 400),
          color: missing ? FAINT : (isEuro ? INK : MUTE),
        }}>
          {fmtCotValeur(valeur)}
        </span>
      )}
      {valeurSecondaire != null && (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: FAINT, textDecoration: 'line-through', lineHeight: '15px' }}>
          {fmtCot(valeurSecondaire)}
        </span>
      )}
      {!enCours && missing && motif && (
        <span style={{ fontSize: 10.5, color: FAINT, lineHeight: '13px', whiteSpace: 'nowrap' }}>{motif}</span>
      )}
    </div>
  );
}

// ── la ligne ────────────────────────────────────────────────────────────────
// Trois familles (poste / opération / résultat) × quatre états (normale /
// écartée / en attente / en cours) × deux réglages (indentée, mise en avant).
// Les vingt-six cas de la spec sont des combinaisons de ces axes - aucun
// n'ajoute de composant. Deux combinaisons n'existent pas : une opération ou
// un résultat ne s'écartent jamais (ils ne produisent pas de ligne).
// La rangée = une suite de cellules, dans l'ordre Plato : [pièce] [opérateur]
// [texte : libellé + renvois / règle / note] [valeur] [actions]. La cellule
// pièce est pilotée par tableau (showPieceCell) : présente pour toutes les
// lignes ou pour aucune, jamais au cas par cas - c'est elle qui tient la
// colonne. Un poste sans pièce y montre l'état vide (contour pointillé) ; une
// opération ou un résultat, rien.
export function CotRow({ resolved, isLast, onOpenPanel, onOpenSource, onNavigate, showPieceCell = 'auto', active = false }) {
  const {
    famille, etat, operateur, label, valeur, regle, etatApplication, note,
    renvois = [], renvoiValeur, pieces = [], qualificatif, valeurSecondaire,
    indentee, emphase, hasPanel,
  } = resolved;
  const ecartee = etat === 'ecartee';
  const enCours = etat === 'en_cours';
  const isResultat = famille === 'resultat';
  const clickable = hasPanel && !!onOpenPanel;
  // Emphases Plato : résultat de section sur crème, résultat du tableau sur
  // le bleu très clair - la seule teinte de fond du tableau, pour LE chiffre
  // que la page produit.
  const baseBg = emphase === 'tableau' ? RESULT_TABLEAU_BG : emphase === 'section' ? PAPER : 'white';
  const hoverBg = emphase === 'tableau' ? RESULT_TABLEAU_HOVER : emphase === 'section' ? '#f1efe9' : SUBTLE;
  const pieceCell = showPieceCell === 'auto' ? pieces.length > 0 : showPieceCell;
  const handle = () => { if (clickable) onOpenPanel(resolved); };
  const openSource = (s) => {
    if (onOpenSource) onOpenSource(s);
    else if (clickable) onOpenPanel(resolved);
  };
  // Deux renvois au maximum ; le surplus est compté, le compteur ouvre le panneau.
  const shownRenvois = renvois.slice(0, 2);
  const extraRenvois = renvois.length - shownRenvois.length;
  // La règle ne s'affiche pas quand son nom répète le libellé de la ligne
  // (résultats, intermédiaires) : elle n'apporterait rien - son travail vit
  // alors dans le panneau. Elle s'affiche quand elle a autre chose à dire.
  const showRegle = regle && (regle.nom.trim().toLowerCase() !== String(label).trim().toLowerCase() || !!(etatApplication ?? regle.etatApplication));
  return (
    <div
      className="group flex items-stretch w-full transition-colors"
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handle}
      onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handle(); } }}
      style={{
        minHeight: 52,
        background: baseBg,
        borderBottom: isLast ? 'none' : `1px solid ${ROW_DIVIDER}`,
        // Rail encre de 3 px sur la ligne dont le panneau est ouvert - le
        // marqueur « ligne dépliée » du système.
        boxShadow: active ? `inset 3px 0px 0px 0px ${INK}` : 'none',
        cursor: clickable ? 'pointer' : 'default', textAlign: 'left',
      }}
      // Une ligne écartée reste entièrement cliquable : le survol réagit à la
      // même intensité que les lignes actives (question ouverte : plus doux ?).
      onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = baseBg; }}
    >
      {/* cellule pièce - 50 px (12 + 26 + 12) */}
      {pieceCell && (
        <RowCell width={50}>
          {pieces.length > 0 ? (
            <PieceHolder sources={pieces} onClick={() => { if (clickable) onOpenPanel(resolved); else if (onOpenSource) onOpenSource(pieces[0]); }} />
          ) : famille === 'poste' && !enCours ? (
            <PiecePlaceholder />
          ) : null}
        </RowCell>
      )}
      {/* cellule opérateur - 46 px, la colonne qui raconte le calcul */}
      <RowCell width={46}>
        <OperateurCell op={operateur} emphase={isResultat} ecartee={ecartee} />
      </RowCell>
      {/* cellule texte - libellé + renvois, puis la règle, puis la note. Sur
          un résultat, la note se glisse en ligne après le libellé (le pattern
          « = le brut · plafond appliqué une fois » du système). */}
      <RowCell flex align="flex-start" padding={`12px 12px 12px ${indentee ? 30 : 12}px`}>
        <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
          <span className="inline-flex items-baseline flex-wrap" style={{ gap: '2px 8px' }}>
            {/* le libellé passe sur deux lignes s'il est long - jamais tronqué */}
            <span style={{ fontSize: 14, color: ecartee ? MUTE : INK, fontWeight: isResultat ? 500 : 400, lineHeight: '20px' }}>
              {label}
            </span>
            {isResultat && note && (
              <span style={{ fontSize: 12, color: MUTE, letterSpacing: '0.12px', lineHeight: '16px' }}>{note}</span>
            )}
            {shownRenvois.map(s => <BadgePill key={s.id} source={s} onOpen={openSource} />)}
            {extraRenvois > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); if (clickable) onOpenPanel(resolved); }}
                className="inline-flex items-center rounded transition-opacity hover:opacity-70"
                style={{ padding: '3px 7px', borderRadius: 6, background: '#eeece6', border: 'none', fontFamily: MONO, fontSize: 11, fontWeight: 500, color: MUTE, cursor: 'pointer', lineHeight: '14px' }}
              >
                +{extraRenvois}
              </button>
            )}
            {renvoiValeur && <BadgePill valeur={renvoiValeur} onNavigate={onNavigate} />}
          </span>
          {showRegle && <span><RegleTag regle={regle} etatApplication={etatApplication} onOpenSource={openSource} /></span>}
          {!isResultat && note && <span style={{ fontSize: 12, color: FAINT, letterSpacing: '0.12px', lineHeight: '16px' }}>{note}</span>}
        </div>
      </RowCell>
      {/* cellule valeur */}
      <RowCell align="flex-end" padding="12px">
        <MontantCell
          valeur={valeur}
          qualificatif={ecartee ? qualificatif : null}
          valeurSecondaire={ecartee ? valeurSecondaire : null}
          emphase={isResultat}
          enCours={enCours}
        />
      </RowCell>
      {/* cellule actions - chevron seulement si la ligne ouvre un panneau,
          toujours visible (un affordance ne se découvre pas au survol), et à
          pleine intensité même sur une ligne écartée (celle qu'on audite) */}
      <RowCell width={30} align="flex-end" padding="0 16px 0 0">
        {clickable && <ChevronRight className="w-3.5 h-3.5 transition-colors" style={{ color: FAINT }} />}
      </RowCell>
    </div>
  );
}

// ── la section ──────────────────────────────────────────────────────────────
// Deux bandes, la structure exacte du système Plato :
// 1. Le bandeau-titre : un losange de 10 px, le titre qui NOMME CE QUE LA
//    SECTION PRODUIT (14 px medium encre), un point de 4 px, puis une courte
//    description grise (12 px). Blanc, bordé en bas, px-16 py-12.
// 2. La rangée de captions (h-40) : « PIÈCE · OPE. » en mono 11 uppercase,
//    chaque caption au-dessus de SA cellule (mêmes largeurs que les lignes),
//    et le libellé de la colonne des valeurs calé à droite - c'est lui qui
//    permet un seul tableau où « Montant demandé » et « Montant » cohabitent.
// Pas d'en-tête de tableau au sens « total répété » : l'en-tête de page suffit.
const captionStyle = { fontFamily: MONO, fontSize: 11, fontWeight: 500, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export function SectionHeader({ titre, description, libelleColonne, showPieceCell = true }) {
  return (
    <>
      <div className="flex items-center flex-wrap" style={{ padding: '12px 16px', gap: 6, background: 'white', borderBottom: `1px solid ${LINE}` }}>
        <Diamond aria-hidden className="flex-shrink-0" style={{ width: 10, height: 10, color: INK }} strokeWidth={2} />
        <span style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: '20px' }}>{titre}</span>
        {description && (
          <>
            <span aria-hidden className="flex-shrink-0" style={{ width: 4, height: 4, borderRadius: 4, background: '#d6d3d1', margin: '0 2px' }} />
            <span style={{ fontSize: 12, color: MUTE, letterSpacing: '0.12px', lineHeight: '16px' }}>{description}</span>
          </>
        )}
      </div>
      <div className="flex items-stretch" style={{ height: 40, background: 'white', borderBottom: `1px solid ${LINE}` }}>
        {showPieceCell && <RowCell width={50}><span style={captionStyle}>Pièce</span></RowCell>}
        <RowCell width={46}><span style={captionStyle}>Ope.</span></RowCell>
        <RowCell flex align="flex-end" padding="0 12px">
          {libelleColonne && <span style={captionStyle}>{libelleColonne}</span>}
        </RowCell>
        <RowCell width={30} />
      </div>
    </>
  );
}

// ── la prose ────────────────────────────────────────────────────────────────
// L'explication du panneau : des paragraphes avec références typées en ligne.
// Un MONTANT est en chasse fixe souligné en pointillé et NAVIGUE vers la
// ligne qui le produit ; une SOURCE reste un badge de sa famille et OUVRE
// l'extrait. Ils ne mènent pas au même endroit, donc ils ne se ressemblent
// pas. Tout montant cité est une référence, jamais un nombre recopié.
const PROSE_TOKEN = /(\{montant:[^}]+\}|\{source:[^}]+\}|\*\*[^*]+\*\*)/g;
export function ProseText({ paragraphs = [], onNavigateValue, compact = false }) {
  const [openSource, setOpenSource] = useState(null);
  if (!paragraphs.length) return null;
  const renderPart = (part, i) => {
    if (part.startsWith('{montant:')) {
      const cle = part.slice(9, -1);
      const v = getCotValeur(cle);
      const nav = !!onNavigateValue;
      return (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); if (nav) onNavigateValue(cle); }}
          title={v?.label}
          className={nav ? 'transition-opacity hover:opacity-70' : ''}
          style={{
            fontFamily: MONO, fontSize: '0.92em', fontVariantNumeric: 'tabular-nums',
            color: INK, background: 'transparent', border: 'none', padding: 0,
            borderBottom: `1px dashed ${FAINT}`, cursor: nav ? 'pointer' : 'default',
          }}
        >
          {fmtCotValeur(v)}
        </button>
      );
    }
    if (part.startsWith('{source:')) {
      const id = part.slice(8, -1);
      const s = COTISATIONS_SOURCES[id];
      if (!s) return null;
      return (
        <span key={i} style={{ display: 'inline-flex', verticalAlign: 'text-bottom', margin: '0 1px' }}>
          <BadgePill source={s} active={openSource?.id === s.id} onOpen={() => setOpenSource(openSource?.id === s.id ? null : s)} />
        </span>
      );
    }
    if (part.startsWith('**')) return <strong key={i} style={{ fontWeight: 600, color: INK }}>{part.slice(2, -2)}</strong>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  };
  const tok = openSource ? (COT_BADGE_TOKENS[sourceFamille(openSource.type)] || COT_BADGE_TOKENS.TEXTE) : null;
  return (
    <div className="flex flex-col" style={{ gap: compact ? 8 : 10 }}>
      {paragraphs.map((p, pi) => (
        <p key={pi} style={{ margin: 0, fontSize: compact ? 12.5 : 13.5, color: INK2, lineHeight: compact ? '19px' : '21px' }}>
          {p.split(PROSE_TOKEN).map(renderPart)}
        </p>
      ))}
      {openSource && (
        <div className="flex items-baseline" style={{ gap: 8, padding: '8px 12px', background: tok.bg === 'transparent' ? SUBTLE : tok.bg, borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: tok.color, lineHeight: '18px', fontStyle: 'italic', flex: 1 }}>« {openSource.extrait} »</p>
          {openSource.url && <a href={openSource.url} target="_blank" rel="noreferrer" aria-label="Ouvrir la source" onClick={(e) => e.stopPropagation()}><ExternalLink className="w-3.5 h-3.5" style={{ color: tok.color }} /></a>}
        </div>
      )}
    </div>
  );
}

// ── le panneau (3e niveau) ──────────────────────────────────────────────────
// Trois blocs seulement : le titre, le montant, et une explication en langage
// naturel. La prose porte tout - le calcul substitué, l'arrondi, la nuance,
// le placement, ce qui manque - en phrases, jamais en blocs séparés. Quand
// une valeur manque, la prose dit quoi, pourquoi, et comment la fournir : une
// phrase renvoyant à la conversation, jamais un bouton ni un champ éditable.
export function LinePanel({ resolved, onClose, onNavigateValue, onNavigatePage }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!resolved) return null;
  const { label, valeur, etat, qualificatif, valeurSecondaire, prose } = resolved;
  const ecartee = etat === 'ecartee';
  const motif = fmtCotManque(valeur);
  return (
    <div className="fixed inset-0 z-50" onClick={onClose} style={{ right: 'var(--chat-offset, 0px)' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(41,37,36,0.15)' }} />
      <div
        className="absolute top-0 right-0 bottom-0 bg-white flex flex-col"
        style={{ width: 400, maxWidth: '92vw', borderLeft: `1px solid ${LINE}`, boxShadow: '-8px 0 24px rgba(26,26,26,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. le titre */}
        <div className="flex items-start gap-3" style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${LINE}` }}>
          <div className="flex-1 min-w-0" style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: '20px' }}>{label}</div>
          <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-md hover:bg-background transition-colors flex-shrink-0" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X className="w-4 h-4" style={{ color: MUTE }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* 2. le montant */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${LINE}` }}>
            <div style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 28, color: ecartee || !valeur || valeur.value == null ? MUTE : INK, letterSpacing: '-0.5px', lineHeight: '32px' }}>
              {ecartee && qualificatif ? qualificatif : fmtCotValeur(valeur)}
            </div>
            {ecartee && valeurSecondaire != null && (
              <div style={{ fontFamily: MONO, fontSize: 13, color: FAINT, textDecoration: 'line-through', marginTop: 4 }}>{fmtCot(valeurSecondaire)}</div>
            )}
            {!ecartee && motif && (
              <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>{motif}</div>
            )}
          </div>
          {/* 3. l'explication - en prose, montants et sources cliquables en ligne */}
          {prose && (
            <div style={{ padding: '16px 20px 20px' }}>
              <ProseText paragraphs={prose} onNavigateValue={onNavigateValue} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── en-tête de page — bande flush, bordée, collante ─────────────────────────
// La structure Plato d'un en-tête de détail (Figma « Row / sub-header ») :
// une bande pleine largeur, bordée en bas, qui porte le retour, le titre et le
// total à gauche→droite, et l'action « Copier chiffrage » au bout. Elle est
// COLLANTE : le calcul est long, le titre et le total doivent rester sous les
// yeux quand on descend. Le tableau, lui, n'a pas d'en-tête — ce serait le même
// chiffre une troisième fois. Le total reste positif : la direction vit sur la
// page Chiffrage (« Montant prélevé »).
export function PrelevementHeader({ title, amount, badge, onBack, onCopy, sticky = false }) {
  return (
    <div
      style={{
        position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 20,
        background: 'white', borderBottom: `1px solid ${LINE}`,
      }}
    >
      <div className="flex items-center" style={{ height: 52, padding: '0 16px', gap: 12 }}>
        <button
          onClick={onBack}
          aria-label="Retour au chiffrage"
          title="Retour au chiffrage"
          className="inline-flex items-center justify-center rounded-md transition-colors flex-shrink-0"
          style={{ width: 28, height: 28, border: 'none', background: 'transparent', color: MUTE, cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {badge && (
          <span className="inline-flex items-center flex-shrink-0" style={{ padding: '2px 8px', borderRadius: 6, border: `1px solid ${LINE}`, fontFamily: MONO, fontSize: 10.5, fontWeight: 600, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{badge}</span>
        )}
        <span className="min-w-0 truncate" style={{ fontSize: 15, fontWeight: 600, color: INK }}>{title}</span>
        <span className="ml-auto flex-shrink-0" style={{ fontSize: 15, fontWeight: 600, color: amount?.value == null ? FAINT : INK, fontVariantNumeric: 'tabular-nums' }}>
          {fmtCotValeur(amount)}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="inline-flex items-center transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ height: 32, padding: '0 12px', borderRadius: 6, background: INK, color: 'white', border: 'none', boxShadow: '0px 1px 2px rgba(26,26,26,0.05)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Copier chiffrage
          </button>
        )}
      </div>
    </div>
  );
}

// ── page d'un prélèvement (2e niveau - remplace l'écran) ────────────────────
// `flush` : l'en-tête va de bord à bord (dans l'app, on annule le padding du
// conteneur autour de la page) ; `sticky` : l'en-tête reste collé en haut du
// scroll. Le lab passe `flush` sans `sticky` (la page entière défile).
export function PrelevementPage({ pageKey, onBack, onNavigatePage, sticky = false, flush = false, onCopy, badge }) {
  const [panelLine, setPanelLine] = useState(null);
  const page = COTISATIONS_PAGES[pageKey];
  // « montants cités dans la prose » : naviguer vers la page où vit la valeur.
  const homeOf = (key) => {
    if (key.startsWith('poste.') || key === 'base.salaire' || key === 'base.heures' || key === 'total.brut') return 'chiffrage';
    if (['base.sal', 'cot.salBrut', 'reduc.tepaSal', 'cot.sal', 'param.tauxSal', 'param.tauxReducHs'].includes(key)) return 'cot-sal';
    if (['abat.csg', 'base.csg', 'cot.csg', 'param.tauxCsg'].includes(key)) return 'cot-csg';
    if (['exo.irHs', 'deduct.ir', 'base.ir', 'cot.ir', 'param.tauxMarginal'].includes(key)) return 'cot-ir';
    if (['base.pat', 'cot.patBrut', 'deduc.tepaPat', 'cot.pat', 'param.tauxPat', 'param.effectif'].includes(key)) return 'cot-pat';
    return null;
  };
  if (!page) return null;
  const amount = getCotValeur(page.amountKey);
  // La cellule pièce est une décision de tableau : présente pour toutes les
  // lignes dès qu'une seule en porte, absente sinon (pas de gouttière morte).
  const hasPieceCol = pageLignes(page).some(l => l.pieceId);
  const navigateToValue = (key) => {
    const home = homeOf(key);
    if (!home || !onNavigatePage) return;
    setPanelLine(null);
    onNavigatePage(home === pageKey ? null : home);
  };
  return (
    <div>
      <PrelevementHeader
        title={page.title}
        amount={amount}
        badge={badge}
        onBack={onBack}
        onCopy={onCopy}
        sticky={sticky}
      />
      {/* les deux sections — chacune nomme ce qu'elle produit ; les cartes
          s'étalent sur toute la largeur de la page (comme l'en-tête flush),
          la valeur restant calée à droite */}
      <div style={{ padding: flush ? '20px 32px 28px' : '20px 0 0' }}>
        <div className="space-y-6">
          {pageSections(page).map((section) => (
            <div key={section.titre} style={cardChrome}>
              <SectionHeader
                titre={section.titre}
                description={section.description}
                libelleColonne={section.libelleColonne}
                showPieceCell={hasPieceCol}
              />
              {section.lignes.map((l, i) => (
                <CotRow
                  key={l.id}
                  resolved={resolveCotLigne(l)}
                  isLast={i === section.lignes.length - 1}
                  showPieceCell={hasPieceCol}
                  active={panelLine?.id === l.id}
                  onOpenPanel={setPanelLine}
                  onOpenSource={() => setPanelLine(resolveCotLigne(l))}
                  onNavigate={(target) => onNavigatePage && onNavigatePage(target === pageKey ? null : target)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {panelLine && (
        <LinePanel
          key={panelLine.id || 'panel'}
          resolved={panelLine}
          onClose={() => setPanelLine(null)}
          onNavigateValue={navigateToValue}
          onNavigatePage={(target) => { setPanelLine(null); onNavigatePage && onNavigatePage(target === pageKey ? null : target); }}
        />
      )}
    </div>
  );
}

// ── bloc de résultats ───────────────────────────────────────────────────────
// Deux chiffres côte à côte (un seul argument de négociation) + l'écart.
// Chaque résultat s'ouvre et s'audite comme n'importe quelle ligne.
const RESULT_ACCENTS = {
  'r-net': { color: '#4a7256' },
  'r-emp': { color: '#7A6244' },
};
export function ResultatsBloc({ sticky = false, onOpenPanel }) {
  const blocs = RESULTATS_BLOC.blocs.map((b) => resolveCotLigne(b));
  const ecart = resolveCotLigne(RESULTATS_BLOC.ecart);
  return (
    <div
      className={sticky ? 'sticky z-10' : ''}
      style={{
        ...(sticky ? { bottom: 12 } : {}),
        background: 'white', border: `1px solid ${LINE}`, borderRadius: 12,
        boxShadow: sticky ? '0px 8px 28px rgba(26,26,26,0.16)' : '0px 1px 2px rgba(26,26,26,0.05)',
        overflow: 'hidden',
      }}
    >
      <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${LINE}` }}>
        {blocs.map((b, i) => {
          const accent = RESULT_ACCENTS[b.id] || RESULT_ACCENTS['r-net'];
          const dep = b.mentionWhenMissing ? getCotValeur(b.mentionWhenMissing.dependsOn) : null;
          const mention = b.mentionWhenMissing && dep?.value == null ? b.mentionWhenMissing.mention : null;
          return (
            <button
              key={b.id}
              onClick={() => onOpenPanel && onOpenPanel(b)}
              className="group flex flex-col text-left transition-colors"
              style={{ padding: '14px 18px 12px', gap: 3, border: 'none', background: 'white', cursor: onOpenPanel ? 'pointer' : 'default', borderLeft: i > 0 ? `1px solid ${LINE}` : 'none' }}
              onMouseEnter={(e) => { if (onOpenPanel) e.currentTarget.style.background = SUBTLE; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
            >
              <span className="inline-flex items-center" style={{ gap: 7 }}>
                <span aria-hidden style={{ width: 8, height: 8, borderRadius: 8, background: accent.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.label}</span>
              </span>
              <span className="inline-flex items-baseline" style={{ gap: 8 }}>
                <span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 30, fontWeight: 500, color: INK, letterSpacing: '-0.75px', lineHeight: '36px' }}>
                  {fmtCotValeur(b.valeur)}
                </span>
                {onOpenPanel && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: FAINT, alignSelf: 'center' }} />}
              </span>
              <span style={{ fontSize: 11, color: mention ? '#7A6244' : FAINT, lineHeight: '14px', minHeight: 14 }}>{mention || ''}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onOpenPanel && onOpenPanel(ecart)}
        className="flex items-center w-full text-left transition-colors"
        style={{ padding: '8px 18px', gap: 6, border: 'none', background: PAPER, cursor: onOpenPanel ? 'pointer' : 'default' }}
        onMouseEnter={(e) => { if (onOpenPanel) e.currentTarget.style.background = '#f1efe9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = PAPER; }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: INK, fontVariantNumeric: 'tabular-nums' }}>{fmtCotValeur(ecart.valeur)}</span>
        <span style={{ fontSize: 12, color: MUTE }}>{RESULTATS_BLOC.ecart.phrase}</span>
      </button>
    </div>
  );
}

// ── section ③ de la page Chiffrage ──────────────────────────────────────────
// Quatre lignes, chacune ouvre sa page de détail. Point de cohérence tranché :
// la colonne s'intitule « Montant prélevé » et les signes disparaissent -
// aucun montant n'est négatif, la direction est portée par le titre de
// colonne, comme « Montant demandé » au-dessus.
export default function CotisationsSection({ onOpenPage }) {
  const ACCENT = '#7A6244', ACCENT_BG = '#F3EEE4', ACCENT_BORDER = '#e3d8c2';
  return (
    <div>
      <div className="flex items-center justify-between" style={{ padding: '0 6px', marginBottom: 16 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}>
            <Percent className="w-4 h-4" style={{ color: ACCENT }} />
          </span>
          <div className="flex flex-col" style={{ gap: 5 }}>
            <span style={{ ...colHeaderStyle, lineHeight: '1' }}>Estimations</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: '18px' }}>Cotisations et impôts</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: MUTE, lineHeight: '16px', textAlign: 'right', maxWidth: 365, margin: 0 }}>
          Ce qui est ponctionné sur les montants demandés. Chaque ligne ouvre sa page : ce qui entre dans le calcul, puis le calcul lui-même.
        </p>
      </div>
      <div style={cardChrome}>
        {/* l'en-tête de colonne porte la direction ; plus de signe collé au nombre */}
        <div className="flex items-center" style={{ height: 34, padding: '0 16px', background: PAPER, borderBottom: `1px solid ${ROW_DIVIDER}` }}>
          <span className="flex-1" />
          <div className="flex items-center justify-end" style={{ width: 176, maxWidth: 176, padding: '0 12px' }}>
            <span style={{ ...colHeaderStyle, fontSize: 10 }}>Montant prélevé</span>
          </div>
          <span style={{ width: 44, flexShrink: 0 }} />
        </div>
        {CHIFFRAGE_PRELEVEMENTS.map((l, i) => {
          const r = resolveCotLigne(l);
          const v = r.valeur;
          const missing = !v || v.value == null;
          const motif = fmtCotManque(v);
          const isLast = i === CHIFFRAGE_PRELEVEMENTS.length - 1;
          return (
            <button
              key={l.id}
              onClick={() => onOpenPage && onOpenPage(l.pageKey)}
              className="group flex items-center w-full transition-colors"
              style={{ height: 56, background: 'white', border: 'none', borderBottom: isLast ? 'none' : `1px solid ${ROW_DIVIDER}`, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = SUBTLE; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
            >
              <div className="flex-1 min-w-0" style={{ padding: '0 12px 0 16px' }}>
                <span className="truncate block" style={{ fontSize: 14, color: INK }}>{r.label}</span>
              </div>
              <div className="flex flex-col items-end justify-center flex-shrink-0" style={{ width: 176, maxWidth: 176, padding: '0 12px' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: missing ? FAINT : INK, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtCotValeur(v)}
                </span>
                {missing && motif && (
                  <span style={{ fontSize: 10.5, color: FAINT, lineHeight: '13px', whiteSpace: 'nowrap' }}>{motif}</span>
                )}
              </div>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: 44, paddingLeft: 12, paddingRight: 16 }}>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: FAINT }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Extrait de source - conservé pour le lab (dans l'app, l'extrait vit dans la
// prose du panneau).
export function SourceExtrait({ source, onClose }) {
  if (!source) return null;
  const tok = COT_BADGE_TOKENS[sourceFamille(source.type)] || COT_BADGE_TOKENS.TEXTE;
  return (
    <div style={cardChrome}>
      <div className="flex items-center gap-2" style={{ padding: '10px 14px', borderBottom: `1px solid ${LINE}`, background: PAPER }}>
        <BadgePill source={source} onOpen={() => {}} />
        <span className="flex-1" />
        {source.url && <a href={source.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} aria-label="Ouvrir la source"><ExternalLink className="w-3.5 h-3.5" style={{ color: MUTE }} /></a>}
        {onClose && <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: MUTE }}>Fermer</button>}
      </div>
      {source.extrait && (
        <p style={{ margin: 0, padding: '12px 14px', fontSize: 13, color: tok.color, lineHeight: '19px', fontStyle: 'italic' }}>« {source.extrait} »</p>
      )}
    </div>
  );
}
