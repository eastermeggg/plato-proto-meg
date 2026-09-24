import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import componentDocs from '../../data/componentDocs.json';
import { getComponentDemo } from './componentDemos';
import { useDemoValues, DemoCanvas, ControlsPanel } from './ComponentSandbox';
import Markdown from './Markdown';

// Page « Shell & Navigation » : un VRAI playground du composant original qui
// assemble tout (AppSidebar) — canvas vivant + Controls à droite — suivi de la
// doc (fiche AppSidebar.md via componentDocs). Le rail à gauche EST ce composant.
export default function ShellDocSection({ navigate }) {
  const doc = (componentDocs.components || {}).AppSidebar;
  const demo = getComponentDemo('AppSidebar');
  const sandbox = useDemoValues(demo);

  return (
    <div style={{ maxWidth: 1000 }}>
      <p style={{ fontSize: 14, color: colors.semantic.foregroundSecondary, lineHeight: '20px', marginTop: 0, marginBottom: 16 }}>
        {doc?.usage || 'Le shell de navigation canonique.'}. Le rail à gauche <strong>est</strong> ce composant
        (dogfooding) ; ci-dessous, joue avec le composant original complet — brand, groupes,
        items (destination / create / recent / see-all), replié, footer.
      </p>

      {/* Playground : canvas vivant + Controls à droite */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <DemoCanvas demo={demo} componentId="AppSidebar" values={sandbox.values} applyPreset={sandbox.applyPreset} />
        </div>
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 8 }}>
          <ControlsPanel demo={demo} values={sandbox.values} setValue={sandbox.setValue} reset={sandbox.reset} />
        </div>
      </div>

      {/* Accès : fiche complète + lab d'états + comportement */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/ui-kit/c/AppSidebar')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: colors.semantic.foreground, background: colors.semantic.cream, border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
        >
          Fiche AppSidebar <ArrowUpRight style={{ width: 14, height: 14 }} />
        </button>
        <button
          onClick={() => navigate('/ui-kit/nav-system')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: colors.semantic.foregroundSecondary, background: 'transparent', border: `1px solid ${colors.semantic.border}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
        >
          Lab : navigation - shell et états
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, color: colors.semantic.foregroundMuted }}>
          Comportement détaillé : <code style={{ fontFamily: "'IBM Plex Mono', monospace", marginLeft: 4 }}>src/components/shell/NAV-BEHAVIOR.md</code>
        </span>
      </div>

      {/* Les surfaces assemblées (Accueil, Mes dossiers, dossier + onglets…) vivent
          dans la section Blocks - ici on documente le rail lui-même. */}
      <div style={{ marginTop: 4, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/ui-kit/blocks')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: colors.semantic.foreground, background: colors.semantic.cream, border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer' }}
        >
          Voir les surfaces assemblées dans Blocks <ArrowUpRight style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {doc?.sections?.pattern && <Markdown>{doc.sections.pattern}</Markdown>}
    </div>
  );
}
