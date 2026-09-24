import React from 'react';
import { ChevronLeft } from 'lucide-react';
import inventory from '../../data/designSystemInventory.json';
import componentDocs from '../../data/componentDocs.json';
import { colors, typography } from '../../design-system/tokens';
import { useDemoValues, DemoCanvas, ControlsPanel } from './ComponentSandbox';
import UpdateEntryForm from './UpdateEntryForm';
import { getComponentDemo } from './componentDemos';
import Markdown from './Markdown';

// Page composant du playground - épurée : nom + usage + une ligne de méta
// discrète, le canvas comme héros, les Controls à droite, la doc en mesure de
// lecture. Pas de pastilles décoratives, pas de fond pointillé.
const LAYER_LABEL = { shadcn: 'Base shadcn', 'shadcn-extended': 'Étendu', custom: 'Custom' };

export default function ComponentDetailPage({ componentId, navigate }) {
  const component = inventory.components.find(c => c.id === componentId);
  const demo = getComponentDemo(componentId);
  const doc = (componentDocs.components || {})[componentId] || null;
  const sandbox = useDemoValues(demo);

  if (!component) {
    return (
      <div style={{ padding: '32px 44px', fontFamily: typography.fontFamily.sans }}>
        <BackLink navigate={navigate} />
        <h1 style={{ fontSize: 24, fontWeight: 600, color: colors.semantic.foreground, margin: '16px 0 0' }}>Composant introuvable</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: colors.semantic.foregroundSecondary }}>
          Aucun composant <code style={{ fontFamily: typography.fontFamily.mono }}>{componentId}</code> dans l'inventaire.
        </p>
      </div>
    );
  }

  const figmaUrl = (doc && doc.figma) || component.figmaRef;
  const hasControls = demo && !demo.placeholder && demo.controls && Object.keys(demo.controls).length > 0;
  const meta = [LAYER_LABEL[component.layer], component.family || component.category, component.filePath].filter(Boolean);

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'stretch', fontFamily: typography.fontFamily.sans }}>
      {/* Colonne principale */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: '30px 44px 72px' }}>
          <BackLink navigate={navigate} />

          {/* En-tête : nom, usage, méta discrète (aucune pastille) */}
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.4px', color: colors.semantic.foreground, margin: '18px 0 0' }}>
            {component.id}
          </h1>
          {doc && doc.usage && (
            <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: '23px', color: colors.semantic.foregroundSecondary, maxWidth: 720 }}>
              {doc.usage}
            </p>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontFamily: typography.fontFamily.mono, fontSize: 11.5, color: colors.semantic.foregroundMuted }}>
            {meta.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <span>{m}</span>
              </React.Fragment>
            ))}
            {figmaUrl && (
              <>
                {meta.length > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                <a href={figmaUrl} target="_blank" rel="noreferrer" style={{ color: colors.banner.info.accent, textDecoration: 'none' }}>Figma ↗</a>
              </>
            )}
          </div>

          {/* Canvas - le héros */}
          <div style={{ marginTop: 28 }}>
            <DemoCanvas demo={demo} componentId={componentId} values={sandbox.values} applyPreset={sandbox.applyPreset} />
          </div>

          {/* Documentation - mesure de lecture confortable */}
          {doc && doc.sections && doc.sections.pattern ? (
            <div style={{ maxWidth: 780, marginTop: 48 }}>
              <SectionLabel>Documentation</SectionLabel>
              <Markdown>{doc.sections.pattern}</Markdown>
            </div>
          ) : !doc ? (
            <p style={{ fontSize: 13, color: colors.semantic.foregroundMuted, fontStyle: 'italic', marginTop: 24 }}>
              Pas de fiche <code style={{ fontFamily: typography.fontFamily.mono }}>src/components/ui/{componentId}.md</code>.
            </p>
          ) : null}

          {/* Métadonnées / validation - replié, discret */}
          <details style={{ maxWidth: 780, marginTop: 40 }}>
            <summary style={{ cursor: 'pointer', fontFamily: typography.fontFamily.mono, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.semantic.foregroundMuted }}>
              Métadonnées
            </summary>
            <div style={{ marginTop: 14 }}>
              <UpdateEntryForm entry={component} kind="component" />
            </div>
          </details>
        </div>
      </div>

      {/* Controls - rail droit, pleine hauteur */}
      {hasControls && (
        <aside style={{ width: 296, flexShrink: 0, height: '100%', overflowY: 'auto', borderLeft: `1px solid ${colors.semantic.border}`, background: colors.semantic.background }}>
          <ControlsPanel bare demo={demo} values={sandbox.values} setValue={sandbox.setValue} reset={sandbox.reset} />
        </aside>
      )}
    </div>
  );
}

function BackLink({ navigate }) {
  return (
    <button
      onClick={() => navigate('/ui-kit/inventory')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: colors.semantic.foregroundMuted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <ChevronLeft style={{ width: 16, height: 16 }} /> Composants
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: typography.fontFamily.mono, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.semantic.foregroundMuted, paddingBottom: 8, marginBottom: 18, borderBottom: `1px solid ${colors.semantic.border}` }}>
      {children}
    </div>
  );
}
