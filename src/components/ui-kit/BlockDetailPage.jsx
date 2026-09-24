import React from 'react';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import { getBlock } from './blocks';
import { useDemoValues, DemoCanvas, ControlsPanel } from './ComponentSandbox';
import Markdown from './Markdown';

// Statut du block = même langage que l'inventaire composant.
const STATUS = {
  validated: { label: 'Validé',       bg: colors.feedback.success.subtle,     fg: colors.feedback.success.text },
  pending:   { label: 'En cours',     bg: colors.feedback.warning.subtle,     fg: colors.feedback.warning.text },
  missing:   { label: 'À construire', bg: colors.feedback.destructive.subtle, fg: colors.feedback.destructive.text },
};

// Page « fiche block » (/ui-kit/b/<id>) - rendue DANS le shell de la plateforme
// (la nav vit dans App.js). MÊME anatomie que la fiche composant : contenu à
// gauche (en-tête, méta, canvas, docs), rail Controls STICKY à droite.
export default function BlockDetailPage({ blockId, navigate }) {
  const block = getBlock(blockId);
  const demo = block && block.demo;
  const sandbox = useDemoValues(demo);

  if (!block) {
    return (
      <div style={{ padding: '24px 32px', fontFamily: typography.fontFamily.sans }}>
        <BackLink navigate={navigate} />
        <h1 style={{ fontSize: 22, fontWeight: 600, color: colors.semantic.foreground, margin: 0 }}>Block introuvable</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: colors.semantic.foregroundSecondary }}>
          Aucun block <code style={{ fontFamily: typography.fontFamily.mono }}>{blockId}</code>.
        </p>
      </div>
    );
  }

  const status = STATUS[block.status] || STATUS.pending;
  const hasControls = demo && !demo.placeholder && demo.controls && Object.keys(demo.controls).length > 0;
  const hasRenderCanvas = demo && !demo.placeholder && typeof demo.render === 'function';

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'stretch', fontFamily: typography.fontFamily.sans }}>
      {/* ── Colonne principale (scroll indépendant) ── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '24px 32px' }}>
       <div>
        <BackLink navigate={navigate} />

        {/* En-tête épuré : titre + usage + méta discrète (aucune pastille) */}
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: colors.semantic.foreground, margin: '18px 0 0' }}>
          {block.title}
        </h1>
        {block.description && (
          <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: '23px', color: colors.semantic.foregroundSecondary, maxWidth: 720 }}>{block.description}</p>
        )}
        <div style={{ marginTop: 12, marginBottom: 26, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontFamily: typography.fontFamily.mono, fontSize: 11.5, color: colors.semantic.foregroundMuted }}>
          <span>{status.label}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{block.family}</span>
          {block.filePath && (<><span style={{ opacity: 0.4 }}>·</span><span>{block.filePath}</span></>)}
          {block.figmaRef && (<><span style={{ opacity: 0.4 }}>·</span><a href={block.figmaRef} target="_blank" rel="noreferrer" style={{ color: colors.banner.info.accent, textDecoration: 'none' }}>Figma ↗</a></>)}
        </div>

        {/* Canvas de rendu : les shells se cadrent eux-mêmes (pleine largeur) ;
            les tables « à construire » retombent sur le placeholder de la sandbox. */}
        {hasRenderCanvas ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {demo.render(sandbox.values)}
          </div>
        ) : (
          <DemoCanvas demo={demo} componentId={block.id} values={sandbox.values} applyPreset={sandbox.applyPreset} />
        )}

        {/* Docs (fiche markdown inline du block) */}
        {block.doc && (
          <Section title="Docs">
            <Markdown>{block.doc}</Markdown>
          </Section>
        )}
       </div>
      </div>

      {/* ── Rail Controls — vraie sidebar droite, pleine hauteur, collée au bord
          (bordure gauche façon nav), scroll indépendant. ── */}
      {hasControls && (
        <aside style={{
          width: 300, flexShrink: 0, height: '100%', overflowY: 'auto',
          borderLeft: `1px solid ${colors.semantic.borderStrong}`,
          background: colors.semantic.background,
        }}>
          <ControlsPanel bare demo={demo} values={sandbox.values} setValue={sandbox.setValue} reset={sandbox.reset} />
        </aside>
      )}
    </div>
  );
}

function BackLink({ navigate }) {
  return (
    <button
      onClick={() => navigate('/ui-kit/blocks')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 500,
        color: colors.semantic.foregroundSecondary,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        marginBottom: 12,
      }}
    >
      <ChevronLeft style={{ width: 16, height: 16 }} /> Blocks
    </button>
  );
}

// Bloc de section — titre mono + filet, cohérent DS.
function Section({ title, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{
        fontFamily: typography.fontFamily.mono, fontWeight: 500, fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: colors.semantic.mutedForeground, marginBottom: 12,
        paddingBottom: 6, borderBottom: `1px solid ${colors.semantic.border}`,
      }}>
        {title}
      </div>
      {children}
    </section>
  );
}
