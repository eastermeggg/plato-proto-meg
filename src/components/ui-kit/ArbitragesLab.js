import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Paperclip, FileText, ChevronDown, Check, Scale } from 'lucide-react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Select, { SelectMenuPanel, SelectMenuItem, SelectMenuLabel } from '../ui/Select';
import Slider from '../ui/Slider';
import InputGroup from '../ui/InputGroup';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { V2 } from './import-v2/pieceRow';

// ─────────────────────────────────────────────────────────────────────────────
// Arbitrages design - board de validation steward (24/09/2026).
//
// Trois décisions déléguées, chacune rendue en RETENU vs REFUSÉ pour
// validation à l'œil :
//   1. Icône dossier du bordereau (master Figma bleue) -> vert icon.success.
//   2. Focus des contrôles de saisie -> token unique shadows.focusRing.
//   3. Ombres en dark -> aucun fork, élévation par surfaces (doctrine B).
// Les valeurs REFUSÉES sont rendues telles quelles (ds-hex-ok au cas par cas) :
// c'est un board de comparaison, pas de l'UI produit.
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

function Kicker({ children }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.semantic.mutedForeground }}>
      {children}
    </div>
  );
}

function Verdict({ retenu, refuse }) {
  return (
    <div className="flex flex-col gap-1.5" style={{ marginTop: 8 }}>
      <div className="flex items-start gap-2">
        <Badge variant="success" label="Retenu" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', color: colors.semantic.secondaryForeground }}>{retenu}</p>
      </div>
      <div className="flex items-start gap-2">
        <Badge variant="destructive" label="Refusé" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: '19px', color: colors.semantic.mutedForeground }}>{refuse}</p>
      </div>
    </div>
  );
}

function SectionShell({ num, title, verdict, children }) {
  return (
    <section className="flex flex-col gap-5" style={{ paddingTop: 36, borderTop: `1px solid ${colors.semantic.border}` }}>
      <div>
        <Kicker>Arbitrage {num}</Kicker>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '-0.4px', lineHeight: '30px', color: colors.semantic.foreground, margin: '4px 0 0' }}>
          {title}
        </h2>
        {verdict}
      </div>
      {children}
    </section>
  );
}

function PaneLabel({ tone = 'neutral', children }) {
  const fg = tone === 'ok' ? colors.feedback.success.text : tone === 'ko' ? colors.feedback.destructive.text : colors.semantic.mutedForeground;
  return (
    <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: fg, marginBottom: 8 }}>
      {children}
    </div>
  );
}

// ── §1 - un mini-bordereau représentatif : header collapsible + rangées.
// La couleur du dossier est le paramètre ; le bleu PJ des rangées montre la
// collision quand le dossier passe bleu.
function MiniBordereau({ folderColor }) {
  const row = (icon, iconColor, label, badge) => (
    <div className="flex items-center gap-2" style={{ height: 40, padding: '0 12px', borderTop: `1px solid ${colors.semantic.border}` }}>
      {React.createElement(icon, { style: { width: 16, height: 16, color: iconColor, flexShrink: 0 }, strokeWidth: 2 })}
      <span style={{ fontSize: 13, color: colors.semantic.foreground, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {badge}
    </div>
  );
  return (
    <div style={{ width: 320, background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: radius.xl, boxShadow: shadows.sm, overflow: 'hidden' }}>
      {/* Header collapsible du master 3698:29236 - l'icône en arbitrage */}
      <div className="flex items-center gap-2" style={{ height: 44, padding: '0 12px' }}>
        <ChevronDown style={{ width: 12, height: 12, color: colors.semantic.mutedForeground, flexShrink: 0 }} strokeWidth={2.66} />
        <FolderOpen style={{ width: 16, height: 16, color: folderColor, flexShrink: 0 }} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.semantic.foreground, flex: 1 }}>Pièces médicales</span>
        <Badge variant="secondary" label="4" />
      </div>
      {row(Paperclip, V2.pj, 'CR opératoire - Dr Lambert.pdf')}
      {row(Paperclip, V2.pj, 'IRM lombaire 12-03.pdf')}
      {row(FileText, V2.muted, 'Échange du 14 mars - Mutuelle')}
    </div>
  );
}

// ── §2 - rappel des trois halos historiques, posés sur un gabarit de champ
// inerte (aperçu de la valeur seule ; les vrais contrôles jouables sont à côté).
function HaloSwatch({ label, ring, borderColor }) {
  return (
    <div className="flex flex-col gap-2" style={{ width: 200 }}>
      <div style={{ height: 36, borderRadius: radius.lg, background: colors.semantic.card, border: `1px solid ${borderColor}`, boxShadow: ring, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, color: colors.semantic.mutedForeground }}>
        Valeur
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: colors.semantic.mutedForeground, lineHeight: '15px' }}>{label}</div>
    </div>
  );
}

// ── §3 - spécimens d'élévation L1/L2/L3/L4 posés sur une surface de page.
// `boost` remplace les crans par la variante refusée (opacités gonflées).
function ElevationSpecimens({ boost = false }) {
  // Variante REFUSÉE : mêmes géométries, opacités x2 - rendue uniquement pour
  // le board (jamais en tokens). ds-hex-ok équivalent : chaînes locales au lab.
  const S = boost
    ? {
        md: '0 2px 6px -1px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.22)',
        lg: '0 6px 16px -4px rgba(0,0,0,0.38), 0 2px 6px -2px rgba(0,0,0,0.26)',
        '2xl': '0 14px 36px -8px rgba(0,0,0,0.44), 0 4px 10px -4px rgba(0,0,0,0.28)',
        '4xl': '0 24px 60px -14px rgba(0,0,0,0.66), 0 8px 20px -8px rgba(0,0,0,0.44)',
      }
    : shadows;
  const spec = (label, surface, shadow, w = 150, h = 84) => (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: w, height: h, background: surface, border: `1px solid ${colors.semantic.border}`, borderRadius: radius.xl, boxShadow: shadow }} />
      <div style={{ fontFamily: MONO, fontSize: 10, color: colors.semantic.mutedForeground }}>{label}</div>
    </div>
  );
  return (
    <div className="flex items-end gap-6" style={{ padding: '28px 24px', background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: radius.xl }}>
      {spec('L1 · card · md', colors.semantic.card, S.md)}
      {spec('L2 · popover · lg', colors.semantic.popover, S.lg)}
      {spec('L3 · surfaceRaised · 2xl', colors.semantic.surfaceRaised, S['2xl'])}
      {spec('L4 · surfaceRaised · 4xl', colors.semantic.surfaceRaised, S['4xl'], 170, 100)}
    </div>
  );
}

export default function ArbitragesLab() {
  const navigate = useNavigate();
  const [ville, setVille] = useState('paris');
  const [taux, setTaux] = useState(35);

  // Bleu du master Figma (fill blue/500) - REFUSÉ, rendu pour comparaison.
  const FIGMA_BLUE = '#3b82f6'; // ds-hex-ok: option refusée du board arbitrages (blue/500 Figma, aucune famille de tokens)

  return (
    <div className="min-h-screen" style={{ background: colors.semantic.background, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* En-tête */}
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-2"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: colors.semantic.mutedForeground, marginBottom: 24 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.75} /> Playground
        </button>
        <div className="flex items-center gap-3">
          <span style={{ width: 34, height: 34, borderRadius: radius.lg, background: colors.semantic.secondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scale style={{ width: 17, height: 17, color: colors.semantic.secondaryForeground }} strokeWidth={1.75} />
          </span>
          <div>
            <Kicker>Board steward · 24/09/2026</Kicker>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, letterSpacing: '-0.5px', lineHeight: '38px', color: colors.semantic.foreground, margin: 0 }}>
              Trois arbitrages design
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: '21px', color: colors.semantic.mutedForeground, margin: '12px 0 36px', maxWidth: 640 }}>
          Décisions prises le 24/09 (délégation steward) et déjà écrites dans les tokens,
          les fiches et les conventions. Chaque section montre le retenu face au refusé -
          valider ici, ou demander le revert d'une section.
        </p>

        <div className="flex flex-col gap-10">
          {/* §1 - Icône dossier */}
          <SectionShell
            num="1/3"
            title="Icône dossier du bordereau - vert, pas bleu"
            verdict={
              <Verdict
                retenu="icon.success partout : une couleur par nature (dossier vert, échange encre, PJ bleu, découpe violette). Conflit interne au Figma (l'inbox du même fichier peint le dossier en vert) - le code fait foi, écart déclaré."
                refuse="Le bleu blue/500 du master bordereau : il entre en collision avec le bleu PJ des mêmes rangées et n'appartient à aucune famille de tokens (en créer une pour une icône serait de la dette)."
              />
            }
          >
            <div className="flex flex-wrap gap-8">
              <div>
                <PaneLabel tone="ok">Retenu - dossier icon.success</PaneLabel>
                <MiniBordereau folderColor={V2.folder} />
              </div>
              <div>
                <PaneLabel tone="ko">Refusé - dossier blue/500 du master</PaneLabel>
                <MiniBordereau folderColor={FIGMA_BLUE} />
              </div>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: '18px', color: colors.semantic.mutedForeground, margin: 0, maxWidth: 640 }}>
              À droite, l'œil met dossier et pièces jointes dans le même seau « bleu » :
              la lecture par nature disparaît. Aucun fichier à changer - le lab et
              l'app rendaient déjà le vert.
            </p>
          </SectionShell>

          {/* §2 - Focus */}
          <SectionShell
            num="2/3"
            title="Focus - un seul halo, deux tokens"
            verdict={
              <Verdict
                retenu="shadows.focusRing (halo 3px borderHover à 50 %, bord ring) pour TOUS les contrôles de saisie ; shadows.focusRingError (accent erreur à 40 %) pour l'état erreur. Theme-aware. Button (outline 2px) et ParamPill (halo background) gardent leurs états Figma propres."
                refuse="Trois halos locaux divergents : Select sur foregroundMuted 50 %, InputGroup et Slider sur borderHover 50 %, Calendar sur borderHover plein (le plus dur des trois)."
              />
            }
          >
            <div className="flex flex-col gap-6">
              <div>
                <PaneLabel tone="ok">Retenu - jouable : cliquez ou tabulez dans les contrôles</PaneLabel>
                <div className="flex flex-wrap items-start gap-6">
                  <div style={{ width: 240 }}>
                    <Input label="Intitulé de la ligne" placeholder="Assistance tierce personne" />
                  </div>
                  <div style={{ width: 240 }}>
                    <Input label="Cour d'appel">
                      <Select
                        value={ville}
                        onChange={setVille}
                        width="100%"
                        options={[
                          { value: 'paris', label: 'CA Paris' },
                          { value: 'lyon', label: 'CA Lyon' },
                          { value: 'bordeaux', label: 'CA Bordeaux' },
                        ]}
                      />
                    </Input>
                  </div>
                  <div style={{ width: 240 }}>
                    <InputGroup placeholder="Champ en erreur" error />
                  </div>
                  <div style={{ width: 240, paddingTop: 10 }}>
                    <Slider value={taux} onChange={setTaux} min={0} max={100} />
                  </div>
                </div>
              </div>
              <div>
                <PaneLabel>Avant - les trois halos qui coexistaient (aperçus inertes ; le 2e devient LE token)</PaneLabel>
                <div className="flex flex-wrap gap-5">
                  <HaloSwatch
                    label="Select - foregroundMuted 50 %"
                    ring={`0 0 0 3px color-mix(in srgb, ${colors.semantic.foregroundMuted} 50%, transparent)`}
                    borderColor={colors.semantic.foreground}
                  />
                  <HaloSwatch
                    label="InputGroup / Slider - borderHover 50 % (devenu LE token)"
                    ring={shadows.focusRing}
                    borderColor={colors.semantic.ring}
                  />
                  <HaloSwatch
                    label="Calendar - borderHover plein (trop dur)"
                    ring={`0 0 0 3px ${colors.semantic.borderHover}`}
                    borderColor={colors.semantic.ring}
                  />
                </div>
              </div>
            </div>
          </SectionShell>

          {/* §3 - Ombres dark */}
          <SectionShell
            num="3/3"
            title="Ombres en dark - aucun fork, l'élévation passe par la surface"
            verdict={
              <Verdict
                retenu="Les 9 crans shadows restent identiques light/dark. En dark, l'élévation se lit par la surface (doctrine B) : L0/L1 card, L2 popover, L3/L4 surfaceRaised. Les ombres restent posées (liseré de séparation) mais ne portent jamais l'élévation seules."
                refuse="Un pendant dark opacifié (opacités doublées) : halos boueux autour des surfaces, l'élévation ne se lit toujours pas mieux, et chaque cran existerait en deux exemplaires à maintenir."
              />
            }
          >
            <div className="flex flex-col gap-6">
              <div>
                <PaneLabel>Light - échelle par rôle (référence)</PaneLabel>
                <ElevationSpecimens />
              </div>
              <div>
                <PaneLabel tone="ok">Retenu - dark : mêmes ombres, surfaces par niveau</PaneLabel>
                <div className="dark">
                  <ElevationSpecimens />
                </div>
              </div>
              <div>
                <PaneLabel tone="ko">Refusé - dark : ombres opacifiées (halos boueux, élévation inchangée)</PaneLabel>
                <div className="dark">
                  <ElevationSpecimens boost />
                </div>
              </div>
              <Card style={{ maxWidth: 640 }}>
                <CardHeader>
                  <CardTitle>Où c'est écrit</CardTitle>
                  <CardDescription>
                    tokens.js (commentaires shadows + focusRing/focusRingError) · conventions §10 ·
                    docs/dark-mode.md (tableau des surfaces par niveau) · fiches Select, Slider,
                    InputGroup, Calendar · palette V2 du lab import (icône dossier).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ fontSize: 12.5, lineHeight: '19px', color: colors.semantic.mutedForeground }}>
                    Menu témoin (L2, panel du Select) pour juger l'ombre lg en contexte :
                  </div>
                  <div style={{ marginTop: 10, width: 220 }}>
                    <SelectMenuPanel style={{ position: 'static' }}>
                      <SelectMenuLabel>Postes</SelectMenuLabel>
                      <SelectMenuItem label="ATPT" icon={Check} selected onSelect={() => {}} />
                      <SelectMenuItem label="DSA" onSelect={() => {}} />
                      <SelectMenuItem label="PGPF" onSelect={() => {}} />
                    </SelectMenuPanel>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SectionShell>
        </div>
      </div>
    </div>
  );
}
