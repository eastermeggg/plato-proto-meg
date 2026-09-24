import React, { useState } from 'react';
import { Copy, Check, Wand2, Download, ArrowRight } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Section « Illustrations » : la librairie d'illustrations de marque Plato
// (gravure monochrome façon eau-forte 19e) + la méthodo de prompting pour en
// générer de nouvelles à partir d'une image ou d'un icône avec Nano Banana Pro.
// Les assets vivent dans /public/illustrations/plato/ (exportés du Figma
// « Plato - Brand - Website »). Source du style : les 2 mains « héro » ont été
// produites exactement avec le prompt ci-dessous (before/after dans le Figma).

const BASE = '/illustrations/plato';

// Motif de marque : les échecs, signature Plato (stratégie, coup d'avance).
const BRAND = [
  { src: `${BASE}/hand-pawn.png`,     label: 'Main posant un pion',       tag: 'héro' },
  { src: `${BASE}/hand-knight.png`,   label: 'Main tenant un cavalier',   tag: 'héro' },
  { src: `${BASE}/roi.png`,           label: 'Roi' },
  { src: `${BASE}/pion-debout.png`,   label: 'Pion, de face' },
  { src: `${BASE}/pion-renverse.png`, label: 'Pion renversé' },
  { src: `${BASE}/pion-dessus-1.png`, label: 'Pion, vue de dessus I' },
  { src: `${BASE}/pion-dessus-2.png`, label: 'Pion, vue de dessus II' },
  { src: `${BASE}/pion-dessus-3.png`, label: 'Pion, vue de dessus III' },
];

// Icônes thématiques : un domaine métier = un objet gravé.
const THEMES = [
  { src: `${BASE}/social.png`,             label: 'Droit social',       hint: 'Maillet de justice' },
  { src: `${BASE}/dommages-corporels.png`, label: 'Dommages corporels', hint: 'Stéthoscope' },
  { src: `${BASE}/organigramme.png`,       label: 'Organigramme',       hint: 'Hiérarchie' },
  { src: `${BASE}/cabinet.png`,            label: 'Cabinet',            hint: 'Immeuble' },
];

// Le prompt de base, reconstitué depuis le calque source du Figma
// (« transform the provided image into a highly detailed vintage engraving,
//  19th-century etching style print… »). C'est le socle : on l'applique tel
// quel à une image, on ajuste seulement les variantes plus bas.
const BASE_PROMPT = `Transform the provided image into a highly detailed vintage engraving, 19th-century etching / copperplate print.
Render it as pure black ink line-work on a plain white background: fine parallel hatching and cross-hatching for shading, stippling for the mid-tones, crisp confident contours.
Monochrome only — no color, no flat gray fills, no gradients.
Keep the exact subject, pose and proportions of the input; do not add, remove or restyle any element.
Subject centered with generous white margin and a soft engraved cast shadow beneath it. Antique scientific-illustration aesthetic (old banknote / naturalist plate).
High resolution, clean edges, no text, no signature, no watermark, no frame or border.`;

// Variantes = ce qu'on change selon l'entrée, sans toucher au socle.
const VARIANTS = [
  { when: 'À partir d\'un icône / picto', add: 'Treat it as a single iconic object, one clear silhouette, lots of negative space — a spot illustration, not a scene.' },
  { when: 'À partir d\'une photo', add: 'Simplify to the essential forms of the engraving; drop the photographic background entirely, keep only the subject.' },
  { when: 'Fond transparent (spot)', add: 'Isolate the subject on a fully transparent background, keep the engraved cast shadow.' },
  { when: 'Plus fin / plus dense', add: 'Adjust hatch density: looser lines for a lighter feel, tighter cross-hatching for deeper contrast.' },
];

function Tile({ item, big }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        background: colors.semantic.card,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 12, overflow: 'hidden',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.semantic.borderStrong; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(26,26,26,0.16)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.semantic.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', height: big ? 240 : 168, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: big ? 20 : 22, background: colors.semantic.card, borderBottom: `1px solid ${colors.semantic.border}` }}>
        <img src={item.src} alt={item.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        {item.tag && (
          <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.semantic.foregroundMuted, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 4, padding: '1px 6px' }}>
            {item.tag}
          </span>
        )}
        <a href={item.src} download title="Télécharger le PNG" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: colors.semantic.foregroundMuted, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}` }}>
          <Download style={{ width: 13, height: 13 }} strokeWidth={1.75} />
        </a>
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.semantic.foreground }}>{item.label}</span>
        {item.hint && <span style={{ fontSize: 11.5, color: colors.semantic.foregroundMuted }}>{item.hint}</span>}
      </div>
    </div>
  );
}

function familyHeader(label, n, desc) {
  return (
    <div style={{ padding: '24px 0 12px 0' }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label} <span style={{ opacity: 0.6 }}>· {n}</span>
      </div>
      {desc && <div style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 3, maxWidth: 720 }}>{desc}</div>}
    </div>
  );
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: done ? colors.feedback.success.text : colors.semantic.foreground, background: done ? colors.feedback.success.subtle : colors.semantic.card, border: `1px solid ${done ? colors.feedback.success.text : colors.semantic.border}`, borderRadius: 6, padding: '6px 11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {done ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
      {done ? 'Copié' : 'Copier le prompt'}
    </button>
  );
}

export default function IllustrationsSection() {
  return (
    <div>
      <p style={{ fontSize: 13, color: colors.semantic.foregroundSecondary, lineHeight: '20px', margin: '0 0 8px 0', maxWidth: 820 }}>
        La librairie d'illustrations de marque Plato : des gravures monochromes façon <strong>eau-forte 19e</strong> (trait
        d'encre noir, hachures, fond blanc). Le motif signature est l'<strong>échiquier</strong> - le coup d'avance -
        décliné en pièces et en mains ; les <strong>icônes thématiques</strong> traduisent chaque domaine métier en un
        objet gravé. Source : Figma « Plato - Brand - Website ». Assets : <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>/public/illustrations/plato/</code>.
      </p>

      {/* ── Méthodo de prompting (le cœur) ─────────────────────────────── */}
      <div style={{ marginTop: 20, borderRadius: 16, border: `1px solid ${colors.semantic.border}`, background: colors.semantic.background, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: `1px solid ${colors.semantic.border}`, background: colors.semantic.card }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foreground, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, flexShrink: 0 }}>
            <Wand2 style={{ width: 17, height: 17 }} strokeWidth={1.7} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'RL Para Trial Central', Georgia, serif", fontSize: 18, fontWeight: 500, letterSpacing: '-0.3px', color: colors.semantic.foreground }}>
              Générer une illustration dans ce style
            </div>
            <div style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 1 }}>
              À partir d'une image ou d'un icône, avec Nano Banana Pro (image-to-image).
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Pipeline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5, color: colors.semantic.foregroundSecondary }}>
            {['Image / icône d\'entrée', 'Nano Banana Pro + prompt', 'Gravure Plato'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span style={{ fontWeight: 600, color: colors.semantic.foreground, background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 999, padding: '4px 12px' }}>{step}</span>
                {i < arr.length - 1 && <ArrowRight style={{ width: 15, height: 15, color: colors.semantic.foregroundMuted }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Prompt de base */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.semantic.foreground }}>Prompt de base</span>
              <CopyButton text={BASE_PROMPT} />
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: '19px', color: colors.semantic.foreground, background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: '14px 16px' }}>
              {BASE_PROMPT}
            </pre>
          </div>

          {/* Variantes */}
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.semantic.foreground }}>Selon l'entrée, on ajoute une ligne</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, marginTop: 8 }}>
              {VARIANTS.map(v => (
                <div key={v.when} style={{ background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: '11px 13px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.semantic.foreground, marginBottom: 4 }}>{v.when}</div>
                  <div style={{ fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", color: colors.semantic.foregroundSecondary, lineHeight: '17px' }}>{v.add}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Garde-fous */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.feedback.success.text, marginBottom: 6 }}>À exiger</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
                <li>Trait d'encre noir, hachures / eau-forte</li>
                <li>Monochrome strict, fond blanc (ou transparent)</li>
                <li>Sujet, pose et proportions préservés</li>
                <li>Ombre gravée douce sous le sujet</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.feedback.destructive.text, marginBottom: 6 }}>À bannir</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: colors.semantic.foregroundSecondary, lineHeight: '20px' }}>
                <li>Couleur, aplats gris, dégradés</li>
                <li>Ombres photo, décor, arrière-plan</li>
                <li>Texte, signature, filigrane, cadre</li>
                <li>Rendu 3D, style cartoon ou flat</li>
              </ul>
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: colors.semantic.foregroundMuted, lineHeight: '17px', paddingTop: 4, borderTop: `1px solid ${colors.semantic.border}` }}>
            Les deux mains « héro » ci-dessous ont été produites exactement avec ce prompt (l'avant/après vit dans le Figma).
            Méthodo complète et catalogue : <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>docs/illustrations.md</code>.
          </div>
        </div>
      </div>

      {/* ── Librairie ──────────────────────────────────────────────────── */}
      {familyHeader('Motif de marque - échecs', BRAND.length, "La signature Plato : le coup d'avance. Mains « héro » pour les grandes surfaces, pièces isolées pour ponctuer.")}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {BRAND.map(it => <Tile key={it.src} item={it} big={it.tag === 'héro'} />)}
      </div>

      {familyHeader('Icônes thématiques - domaines', THEMES.length, 'Un domaine métier = un objet gravé. Utilisées en spot (cartes, empty states, en-têtes de domaine).')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 8 }}>
        {THEMES.map(it => <Tile key={it.src} item={it} />)}
      </div>
    </div>
  );
}
