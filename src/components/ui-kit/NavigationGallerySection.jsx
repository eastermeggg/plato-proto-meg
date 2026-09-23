import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import inventory from '../../data/designSystemInventory.json';
import componentDocs from '../../data/componentDocs.json';
import { getComponentDemo } from './componentDemos';
import { useDemoValues, DemoCanvas } from './ComponentSandbox';

// Galerie « Navigation & Shell » : chaque composant de nav (frame Figma
// « Documentation / Navigation », 37497:56098) posé DANS le playground avec sa
// démo vivante + un accès à la fiche complète. Piloté par l'inventaire (aucune
// liste en dur à maintenir) : on prend les composants de la catégorie
// navigation + le shell, dans l'ordre canonique de la maquette.
const ORDER = [
  'AppSidebar', 'SidebarUserInfo', 'NavItem', 'NavSectionHeader',
  'NavExpandControl', 'NavPromoBanner', 'TopBar', 'PageHeader',
  'PlatoAssistantButton', 'Niveau3Strip',
];

function NavComponentCard({ id, navigate }) {
  const component = inventory.components.find((c) => c.id === id);
  const demo = getComponentDemo(id);
  const doc = (componentDocs.components || {})[id] || null;
  const sandbox = useDemoValues(demo);
  if (!component) return null;

  return (
    <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden', background: colors.semantic.card }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderBottom: `1px solid ${colors.semantic.border}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: colors.semantic.foreground }}>{id}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted }}>
              {(doc && doc.type) || component.category}
            </span>
          </div>
          {doc && doc.usage && (
            <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: colors.semantic.foregroundSecondary, maxWidth: 560, lineHeight: '17px' }}>{doc.usage}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/ui-kit/c/${id}`)}
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 500, color: colors.semantic.foreground, background: colors.semantic.cream, border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          title={`Fiche ${id} + playground`}
        >
          Fiche + playground <ArrowUpRight style={{ width: 13, height: 13 }} />
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <DemoCanvas demo={demo} componentId={id} values={sandbox.values} applyPreset={sandbox.applyPreset} />
      </div>
    </div>
  );
}

export default function NavigationGallerySection({ navigate }) {
  // Ordre canonique d'abord, puis tout autre composant de catégorie navigation.
  const byId = new Map(inventory.components.map((c) => [c.id, c]));
  const navIds = inventory.components.filter((c) => c.category === 'navigation' || c.category === 'layout').map((c) => c.id);
  const ids = [...ORDER.filter((id) => byId.has(id)), ...navIds.filter((id) => !ORDER.includes(id))];

  return (
    <div>
      <p style={{ fontSize: 14, color: colors.semantic.mutedForeground, marginBottom: 16, maxWidth: 780 }}>
        Tous les composants de la frame Figma <strong>« Documentation / Navigation »</strong> (37497:56098),
        posés ici avec leur démo vivante. Chaque carte ouvre la fiche complète + le playground à contrôles.
        Le rail à gauche de cette plateforme <strong>est</strong> lui-même composé de ces pièces (dogfooding).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {ids.map((id) => <NavComponentCard key={id} id={id} navigate={navigate} />)}
      </div>
    </div>
  );
}
