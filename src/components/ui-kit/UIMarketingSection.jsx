import React from 'react';
import { Megaphone, Sparkles, ArrowLeft } from 'lucide-react';
import { colors } from '../../design-system/tokens';

// Section /ui-kit/ui-marketing - le handoff GTM (founder / sales / marketing).
// Assets FIDÈLES rendus depuis le vrai DS (@plato/ui-product) via Remotion.
const asset = (f) => `${process.env.PUBLIC_URL || ''}/ui-marketing/${f}`;

const PILLARS = [
  { title: 'Ça répond avant le dossier', desc: 'La valeur est immédiate - dès la première question, sans onboarding.' },
  { title: 'Chaque réponse est sourcée', desc: 'Article de loi, jurisprudence cités inline. La confiance d\'un pro, pas d\'un chatbot.' },
  { title: 'Rien ne se perd', desc: 'Les conversations sont rangées, rattachables à un dossier. Le travail se capitalise.' },
];

const EXTRACTS = [
  { file: 'extract-accueil.png', title: "L'assistant dès l'accueil", caption: 'Composer hero, halo animé, serif de marque - le vrai écran.' },
  { file: 'extract-conversations.png', title: 'Mes conversations', caption: 'Chaque fil gardé, rattachable à un dossier - la vraie table produit.' },
];

export default function UIMarketingSection({ navigate }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: colors.semantic.foreground, maxWidth: 920 }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.brand.darker.DEFAULT }}>
        @plato/ui-marketing
      </span>
      <p style={{ fontSize: 15, color: colors.semantic.foregroundSecondary, lineHeight: '22px', margin: '10px 0 0', maxWidth: 660 }}>
        L'extension <strong style={{ color: colors.semantic.foreground }}>marketing / GTM</strong> - le handoff pour founder, sales et
        marketing. Assets landing, motion et extraits produits <strong style={{ color: colors.semantic.foreground }}>fidèles</strong>,
        rendus depuis le vrai design system, jamais réimités.
      </p>

      {/* Principe de fidélité */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 20, padding: '14px 16px', borderRadius: 12, background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}` }}>
        <Megaphone style={{ width: 18, height: 18, color: colors.semantic.foregroundTertiary, flexShrink: 0, marginTop: 1 }} strokeWidth={1.75} />
        <p style={{ fontSize: 13, lineHeight: '20px', color: colors.semantic.foregroundSecondary, margin: 0 }}>
          <strong style={{ color: colors.semantic.foreground }}>Fidèle parce que c'est le vrai produit.</strong> Un extract n'est pas une
          maquette qui ressemble : c'est le vrai composant <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>ui-product</code>
          {' '}rendu sur données mock (mêmes tokens, même serif). Dépendance à sens unique : ui-marketing consomme
          ui-product, jamais l'inverse.
        </p>
      </div>

      {/* Motion live */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, margin: '28px 0 10px' }}>Le composer, vivant</h3>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${colors.semantic.border}`, background: colors.semantic.card }}>
        <video
          src={asset('accueil-live.mp4')}
          autoPlay
          loop
          muted
          playsInline
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      {/* Extraits fidèles */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, margin: '28px 0 10px' }}>Extraits produits (straight from DS)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {EXTRACTS.map((e) => (
          <figure key={e.file} style={{ margin: 0, borderRadius: 14, overflow: 'hidden', border: `1px solid ${colors.semantic.border}`, background: colors.semantic.card }}>
            <img src={asset(e.file)} alt={e.title} style={{ display: 'block', width: '100%', height: 'auto', borderBottom: `1px solid ${colors.semantic.border}` }} />
            <figcaption style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.semantic.foreground }}>{e.title}</div>
              <div style={{ fontSize: 12.5, color: colors.semantic.foregroundSecondary, lineHeight: '18px', marginTop: 3 }}>{e.caption}</div>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Piliers de message */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.semantic.foreground, margin: '28px 0 10px' }}>Les messages</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {PILLARS.map((p, i) => (
          <div key={p.title} style={{ background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 14, padding: 18 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.semantic.foregroundMuted }}>{`0${i + 1}`}</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.semantic.foreground, marginTop: 6 }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: colors.semantic.foregroundSecondary, lineHeight: '18px', marginTop: 4 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Provenance + retour */}
      <p style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles style={{ width: 13, height: 13 }} /> Assets rendus depuis
        <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>video-assistant</code> ·
        handoff complet : <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>packages/ui-marketing/HANDOFF.md</code>
      </p>
      <button /* ds-raw-ok: lien de navigation inline entre sections ; cible Button variant link */
        onClick={() => navigate('/ui-kit/ui-product')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 6, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: colors.brand.darker.DEFAULT }}
      >
        <ArrowLeft style={{ width: 15, height: 15 }} strokeWidth={2} /> Revenir à UI Product
      </button>
    </div>
  );
}
