import React, { useState } from 'react';
import { Home, FolderOpen, MessageCircle, Settings, Plus, Table2, PencilLine, MessageSquare, Folder } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import { AppSidebar, SidebarBrand, NavItem, NavSectionHeader, SidebarUserInfo } from '../ui/AppSidebar';
import TopBar from '../ui/TopBar';
import PageHeader from '../ui/PageHeader';
import Niveau3Strip, { BreadcrumbReturn, CodeBadge, SiblingNav } from '../ui/Niveau3Strip';
import NavExpandControl from '../ui/NavExpandControl';
import PlatoAssistantButton from '../ui/PlatoAssistantButton';
import Button from '../ui/Button';
import DossierTab from '../shell/DossierTab';
import ConversationTopBar from '../shell/ConversationTopBar';
import SettingsSidebar from '../shell/SettingsSidebar';
import { DomainTableRowsDemo } from './componentDemos';
import { InfosTabContent, ChiffrageTabContent, PosteDetailContent, MatterChatPanel, ConversationContent } from './matterTabContents';
import GabaritContent from './gabaritContent';

// Rendu d'une famille de rangées du système de tables (assemblage complet),
// centré dans la sandbox du block.
const tableFamilyDemo = (famille) => ({
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <DomainTableRowsDemo famille={famille} />
    </div>
  ),
});

// Registre des BLOCKS = les gros assemblages du produit. Un block se joue
// EXACTEMENT comme une fiche composant : un `demo` (controls + render(values))
// consommé par la même sandbox (useDemoValues / ControlsPanel / DemoCanvas), plus
// des métadonnées (famille, statut, code, Figma, fiche). Deux natures :
//   - shell   → un playground jouable, piloté par des controls (page + état).
//               + un playground « matter » spécifique (onglets + niveau 3).
//   - table   → cartes du système de tables custom (docs/table-system.md).
// Doctrine App Shell : Plato---Design 4127:30731.
const noop = () => {};
const RAIL_W = 264; // largeur du rail (= AppSidebar par défaut, Figma 37416:1376) - partagée par le slot animé

function Rail({ active, onCollapse }) {
  const avatar = (
    <span className="rounded-full flex-shrink-0 flex items-center justify-center" style={{ width: 24, height: 24, background: colors.avatar[0].bg, color: colors.avatar[0].fill, fontSize: 12, fontWeight: 600 }}>MR</span>
  );
  return (
    <AppSidebar width={RAIL_W} header={<SidebarBrand />} footer={<SidebarUserInfo name="Meghan" org="Cabinet Hexa" avatar={avatar} onClick={noop} />} onCollapse={onCollapse}>
      <div className="px-2 pt-3 flex flex-col gap-0.5">
        <NavItem icon={Home} label="Accueil" active={active === 'home'} onClick={noop} />
        <NavItem icon={FolderOpen} label="Mes dossiers" active={active === 'dossiers'} onClick={noop} />
        <NavItem icon={MessageCircle} label="Mes conversations" active={active === 'conversations'} onClick={noop} />
        <NavItem icon={Settings} label="Paramètres" active={active === 'settings'} onClick={noop} />
      </div>
      <div className="px-2 pt-5 pb-2">
        <NavSectionHeader label="Dossiers récents" />
        <div className="flex flex-col gap-0.5">
          <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" active={active === 'dossiers'} onClick={noop} />
          <NavItem variant="see-all" label="Voir tout" onClick={noop} />
        </div>
      </div>
    </AppSidebar>
  );
}

const Zone = ({ children }) => (
  <div style={{ flex: 1, minHeight: 0, minWidth: 0, background: colors.semantic.background, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundMuted, fontSize: 12.5, padding: 16, textAlign: 'center' }}>
    {children}
  </div>
);

// Surface sans barre : masquée = « Menu » qui FLOTTE (aucun fond, aucun filet).
const floatMenu = (menu) => (menu ? <div style={{ padding: '10px 12px', flexShrink: 0 }}>{menu}</div> : null);

function MatterTabs({ activeTab = 'Informations' }) {
  const tabs = [['Informations'], ['Chiffrage'], ['Pièces', 12], ['Actes'], ['JP']];
  return (
    <>
      <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <span className="flex items-center gap-1.5 text-[13.5px] flex-shrink-0" style={{ color: colors.semantic.foregroundSecondary }}>
          <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} /> Mes dossiers
        </span>
        <span aria-hidden style={{ width: 1, height: 16, background: colors.semantic.borderStrong }} />
        <span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 16, color: colors.semantic.foreground, letterSpacing: '-0.5px' }}>Martel / AXA</span>
      </div>
      <span aria-hidden style={{ width: 1, height: 16, background: colors.semantic.borderStrong, alignSelf: 'center' }} />
      <div className="flex items-stretch gap-4 min-w-0">
        {tabs.map(([label, count]) => (
          <DossierTab key={label} label={label} count={count ?? null} active={activeTab === label} onClick={noop} />
        ))}
      </div>
    </>
  );
}

const matterLeading = (menu) => (menu
  ? <div className="flex items-center gap-3 flex-shrink-0">{menu}<span aria-hidden style={{ width: 1, height: 16, background: colors.semantic.borderStrong, alignSelf: 'center' }} /></div>
  : null);

// Le canvas interactif d'un shell : ouverte / masquée / peek. `block` fournit
// active, renderRail (optionnel), renderColumn, initial, height.
function ShellCanvas({ block, interactive = true, height, trapFixed = false }) {
  const [st, setSt] = useState(block.initial || 'ouverte');
  const shell = { open: () => setSt('ouverte'), collapse: () => setSt('masquee'), peek: () => setSt('peek') };
  const menu = <NavExpandControl onExpand={shell.open} onHome={shell.open} onPeekEnter={shell.peek} onPeekLeave={shell.collapse} />;
  const h = height || block.height || 400;
  const open = st === 'ouverte';
  const renderRailNode = () => (block.renderRail ? block.renderRail(shell) : <Rail active={block.active} onCollapse={shell.collapse} />);
  return (
    // trapFixed : un `transform` fait du canvas le bloc englobant des enfants
    // `position: fixed` (Dialog / Drawer / AlertDialog) — ils restent DANS le
    // block au lieu de couvrir la fenêtre (même mécanique que ScopedDialogFrame).
    <div style={{ height: h, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 12, overflow: 'hidden', display: 'flex', position: 'relative', background: colors.semantic.background, boxShadow: '0 1px 2px rgba(26,26,26,0.05)', pointerEvents: interactive ? 'auto' : 'none', ...(trapFixed ? { transform: 'translateZ(0)' } : null) }}>
      <style>{'@keyframes ds-peek-slide{from{transform:translateX(-26px);opacity:.35}to{transform:translateX(0);opacity:1}}'}</style>
      {/* Rail en flux - largeur + opacité animées (collapse fluide, courbe de la nav).
          Le rail garde une largeur FIXE à l'intérieur (ne s'écrase pas pendant l'anim). */}
      <div style={{ width: open ? RAIL_W : 0, opacity: open ? 1 : 0, height: '100%', flexShrink: 0, overflow: 'hidden', pointerEvents: open ? 'auto' : 'none', transition: 'width 300ms cubic-bezier(.22,1,.36,1), opacity 200ms ease' }}>
        <div style={{ width: RAIL_W, height: '100%' }}>{renderRailNode()}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {block.renderColumn(open ? null : menu)}
      </div>
      {/* Peek : overlay plein-hauteur qui GLISSE du coin (240ms), seule ombre du rail. */}
      {st === 'peek' && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: RAIL_W, zIndex: 5, boxShadow: '14px 0 34px rgba(41,37,36,.16)', animation: 'ds-peek-slide 240ms cubic-bezier(.32,.72,0,1)' }} onMouseEnter={shell.peek} onMouseLeave={shell.collapse}>
        {renderRailNode()}
        </div>
      )}
    </div>
  );
}

const STATE_OPTS = ['Ouverte', 'Masquée', 'Peek'];
const STATE_BY_LABEL = { Ouverte: 'ouverte', 'Masquée': 'masquee', Peek: 'peek' };

// Hauteur des canvas de shell : s'adapte à l'écran (jusqu'à 900px de haut,
// plancher 560px pour les petites fenêtres).
const SHELL_CANVAS_H = 'clamp(560px, calc(100vh - 300px), 900px)';

// Index « Mes conversations » (miroir de shell/ConversationsIndexPage) : table
// blanche Question / Dossier / Dernière activité, badge « Archivée ». Mock inline
// pour le playground (le vrai composant est plein écran + gère ses propres slots).
const colHeaderStyle = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: '11px', color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };
const CONV_ROWS = [
  { title: 'Préavis et indemnités - synthèse', dossier: 'Martel / AXA', activity: 'il y a 2 h', archived: false },
  { title: 'Recherche JP - barème DFP', dossier: 'Bonnet / MAIF', activity: 'hier', archived: false },
  { title: 'Calcul PGPA - revenu de référence', dossier: null, activity: 'il y a 3 j', archived: false },
  { title: 'Note de synthèse (ancienne)', dossier: 'Duval / Groupama', activity: 'il y a 45 j', archived: true },
];
function ConversationsListContent() {
  return (
    <div className="flex-1 overflow-y-auto px-8 pb-6" style={{ minHeight: 0 }}>
      <div className="rounded-lg border border-border overflow-hidden" style={{ backgroundColor: colors.semantic.card }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-background-subtle">
              <th className="px-5 py-3 text-left" style={colHeaderStyle}>Question</th>
              <th className="px-5 py-3 text-left" style={colHeaderStyle}>Dossier</th>
              <th className="px-5 py-3 text-left" style={colHeaderStyle}>Dernière activité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CONV_ROWS.map((t, i) => (
              <tr key={i} className="hover:bg-background cursor-pointer transition-colors" style={{ backgroundColor: colors.semantic.card }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-body-medium text-foreground truncate">{t.title}</span>
                    {t.archived && <span className="badge badge-sm badge-secondary flex-shrink-0">Archivée</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {t.dossier ? (
                    <span className="inline-flex items-center gap-1.5 text-body text-foreground">
                      <Folder className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                      {t.dossier}
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-body text-foreground-secondary">{t.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── LE shell playground (page + état) ─────────────────────────────────────
const PAGE_DEFS = {
  accueil: {
    active: 'home',
    renderColumn: (menu) => (<>{floatMenu(menu)}<Zone>Contenu accueil (hors scope)</Zone></>),
  },
  'mes-dossiers': {
    active: 'dossiers',
    renderColumn: (menu) => (<>
      {floatMenu(menu)}
      <PageHeader title="Mes dossiers" action={<Button variant="primary" size="sm" icon={Plus} label="Nouveau dossier" onClick={noop} />} tabs={[{ key: 'ouverts', label: 'Ouverts', count: 50 }, { key: 'archives', label: 'Archivés', count: 8 }]} activeTab="ouverts" onTabChange={noop} />
      <Zone>Liste des dossiers (hors scope)</Zone>
    </>),
  },
  'mes-conversations': {
    active: 'conversations',
    renderColumn: (menu) => (<>
      {floatMenu(menu)}
      <PageHeader title="Mes conversations" action={<Button variant="primary" size="sm" icon={PencilLine} label="Nouvelle conversation" onClick={noop} />} />
      <ConversationsListContent />
    </>),
  },
  conversation: {
    active: 'conversations',
    renderColumn: (menu) => (<>
      <ConversationTopBar title="Préavis et indemnités - synthèse" leading={menu} onOpenIndex={noop} onRename={noop} />
      <ConversationContent />
    </>),
  },
  parametres: {
    active: 'settings',
    renderRail: (shell) => <SettingsSidebar onCollapse={shell.collapse} />,
    renderColumn: (menu) => (<>
      <TopBar leading={menu} left={<span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 20, color: colors.semantic.foreground, letterSpacing: '-0.4px' }}>Général</span>} />
      <Zone>Panneau de réglages - Général (hors scope)</Zone>
    </>),
  },
};
const PAGE_BY_LABEL = { Accueil: 'accueil', 'Mes dossiers': 'mes-dossiers', 'Mes conversations': 'mes-conversations', Conversation: 'conversation', Paramètres: 'parametres' };
const SHELL_DEMO = {
  controls: {
    page:  { group: 'Contenu', type: 'select', default: 'Accueil', options: ['Accueil', 'Mes dossiers', 'Mes conversations', 'Conversation', 'Paramètres'], description: "La page de l'app rendue dans le shell." },
    state: { group: 'État',    type: 'select', default: 'Ouverte', options: STATE_OPTS, description: 'Rail : ouverte, masquée (« Menu »), ou peek (overlay). Collapse & peek jouables.' },
  },
  render: (v) => {
    const page = PAGE_BY_LABEL[v.page] || 'accueil';
    const state = STATE_BY_LABEL[v.state] || 'ouverte';
    const p = PAGE_DEFS[page];
    return <ShellCanvas key={`${page}-${state}`} block={{ active: p.active, renderRail: p.renderRail, renderColumn: p.renderColumn, initial: state, height: SHELL_CANVAS_H }} interactive />;
  },
};

// ── LE shell playground MATTER (objet + état) ─────────────────────────────
const MATTER_VIEWS = {
  onglet: {
    tab: 'Informations', strip: null, content: () => <InfosTabContent />,
    chat: [
      { role: 'user', text: 'Complète les informations du dossier' },
      { role: 'ai', text: "J'ai parcouru les pièces du dossier. La date d'accident retenue est le 15/03/2023 (PV de gendarmerie) et j'ai rédigé le résumé des faits à partir du rapport d'expertise. Deux victimes indirectes sont déclarées." },
    ],
  },
  chiffrage: {
    tab: 'Chiffrage', strip: null, content: (vals) => <ChiffrageTabContent withVI={vals.vi} />,
    chat: [
      { role: 'user', text: 'Commençons le chiffrage de ce dossier' },
      { role: 'ai', text: "Au vu du dossier, je propose de chiffrer en priorité : DSA (factures CPAM disponibles), PGPA (18 mois d'arrêt), DFT et DFP (taux fixé à 12% par l'expert). Par lequel souhaitez-vous commencer ?" },
    ],
  },
  poste: {
    tab: 'Chiffrage',
    strip: (
      <Niveau3Strip justify="between" back={<BreadcrumbReturn label="Retour au chiffrage" onClick={noop} />}>
        <div className="flex items-center gap-2.5 min-w-0">
          <CodeBadge>PGPA</CodeBadge>
          <span className="text-foreground truncate" style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>Pertes de gains professionnels actuels</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <SiblingNav index={2} total={9} onPrev={noop} onNext={noop} />
          <span className="text-foreground" style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 18, letterSpacing: '-0.5px' }}>6 700 €</span>
          <Button variant="primary" size="sm" label="Copier chiffrage" onClick={noop} />
        </div>
      </Niveau3Strip>
    ),
    content: () => <PosteDetailContent />,
    chat: [
      { role: 'user', text: 'Calcule le PGPA' },
      { role: 'ai', text: "PGPA calculé : 6 700 €. Revenu de référence : 37 800 €/an, 18 mois d'arrêt, déduction des IJ et du maintien de salaire. Argumentation rédigée dans les notes du poste." },
    ],
  },
  jp: {
    tab: 'JP',
    strip: (
      <Niveau3Strip justify="start" back={<BreadcrumbReturn label="Retour à la JP" onClick={noop} />}>
        <span className="text-foreground truncate" style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>Cass. 2e civ., 12 sept. 2024, n° 22-14.532</span>
      </Niveau3Strip>
    ),
    chat: [
      { role: 'user', text: 'Recherche une jurisprudence pour ce poste' },
      { role: 'ai', text: "Voici 3 décisions pertinentes au regard du dossier, dont Cass. 2e civ., 12 sept. 2024 qui pose le barème actuel. Je l'ai épinglée sur le poste PGPA." },
    ],
  },
};
const VIEW_BY_LABEL = { 'Onglet Informations': 'onglet', 'Onglet Chiffrage': 'chiffrage', 'Poste (niveau 3)': 'poste', 'JP (niveau 3)': 'jp' };
const MATTER_DEMO = {
  controls: {
    objet: { group: 'Contenu', type: 'select', default: 'Onglet Informations', options: ['Onglet Informations', 'Onglet Chiffrage', 'Poste (niveau 3)', 'JP (niveau 3)'], description: 'Vue du dossier : onglet workspace (Informations / Chiffrage), ou objet niveau 3 (poste PGPA / JP).' },
    vi:    { group: 'Contenu', type: 'boolean', default: true, description: 'Chiffrage : section Victimes indirectes + total consolidé (Figma « Avec VI »).' },
  },
  render: (vals) => {
    const view = VIEW_BY_LABEL[vals.objet] || 'onglet';
    // Doctrine dossier : la nav est TOUJOURS auto-repliée (« Menu » flottant +
    // peek au survol). Pas de control d'état ici, contrairement au shell générique.
    const state = 'masquee';
    const v = MATTER_VIEWS[view];
    const block = {
      active: 'dossiers', initial: state, height: SHELL_CANVAS_H,
      renderColumn: (menu) => (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <TopBar leading={matterLeading(menu)} left={<MatterTabs activeTab={v.tab} />} />
            {v.strip}
            {v.content ? v.content(vals) : <Zone>Workspace du dossier - {v.tab} (hors scope)</Zone>}
          </div>
          <MatterChatPanel messages={v.chat} />
        </div>
      ),
    };
    // Taille 100% (aucun scale) : le shell occupe toute la largeur disponible,
    // avec un plancher pour préserver le chrome complet (scroll horizontal en deçà).
    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: 1160 }}>
          <ShellCanvas key={`${view}-${state}-${vals.vi}`} block={block} interactive />
        </div>
      </div>
    );
  },
};

// ── LE gabarit d'écran CRUD (état + couche) ───────────────────────────────
// Un écran de référence complet, composé UNIQUEMENT de primitives du DS :
// shell + PageHeader + table + Dropdown de ligne + Dialog de création + Drawer
// de modification + AlertDialog de suppression + les 5 états d'un écran de
// données. C'est CE block qu'un PM / dev copie (jamais un écran d'App.js).
const GABARIT_STATE_BY_LABEL = { Idéal: 'ideal', Vide: 'empty', Chargement: 'loading', Erreur: 'error', Partiel: 'partial' };
const GABARIT_LAYER_BY_LABEL = { Aucune: 'none', 'Dialog création': 'create', 'Drawer modification': 'edit', 'Confirmation suppression': 'delete' };
const GABARIT_DEMO = {
  controls: {
    etat:   { group: 'Données', type: 'select', default: 'Idéal', options: ['Idéal', 'Vide', 'Chargement', 'Erreur', 'Partiel'], description: 'Les 5 états d\'un écran de données (règle §6) : idéal (table pleine), vide (EmptyState + CTA), chargement (skeleton), erreur (Alert + réessayer), partiel (bannière + table réduite).' },
    couche: { group: 'Couche',  type: 'select', default: 'Aucune', options: ['Aucune', 'Dialog création', 'Drawer modification', 'Confirmation suppression'], description: 'Force une couche ouverte pour la juger : Dialog = créer, Drawer = modifier, AlertDialog = confirmer. L\'écran reste jouable (Nouveau / ⋯ ouvrent les vraies couches).' },
  },
  render: (v) => {
    const state = GABARIT_STATE_BY_LABEL[v.etat] || 'ideal';
    const layer = GABARIT_LAYER_BY_LABEL[v.couche] || 'none';
    const block = {
      active: 'dossiers', initial: 'ouverte', height: SHELL_CANVAS_H,
      renderColumn: (menu) => <GabaritContent menu={floatMenu(menu)} state={state} forcedOverlay={layer} />,
    };
    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: 1080 }}>
          <ShellCanvas key={`${state}-${layer}`} block={block} interactive trapFixed />
        </div>
      </div>
    );
  },
};

// ── Registre ────────────────────────────────────────────────────────────────
// Chaque block = mêmes clés qu'une entrée d'inventaire composant (id, title,
// family, status, filePath, figmaRef, description) + un `demo` (le playground)
// et une `doc` (fiche markdown rendue dans la page, comme componentDocs).
export const SHELL_BLOCKS = [
  {
    id: 'ecran-gabarit',
    family: 'Shell & pages',
    title: 'Écran-gabarit (CRUD + 5 états)',
    kind: 'shell',
    status: 'validated',
    filePath: 'src/components/ui-kit/gabaritContent.jsx',
    figmaRef: 'https://www.figma.com/design/?node-id=4127-30731',
    figmaPage: 'App Shell',
    description: 'L\'écran de référence à copier : shell + PageHeader + table + menu de ligne (Dropdown) + Dialog de création + Drawer de modification + AlertDialog de suppression + les 5 états. Zéro élément brut, zéro barre inline.',
    demo: GABARIT_DEMO,
    doc: `### Rôle
Le **gabarit d'un écran CRUD** produit, composé UNIQUEMENT de primitives du DS. Un PM / dev / designer le **copie** pour un nouvel écran (liste + création + modification + suppression) sans rien redécider. C'est la référence : on imite CE block, jamais un écran d'\`App.js\` (qui porte des anti-patterns hérités).

### Controls
- **état** - les **5 états** d'un écran de données (règle §6, obligatoire) :
  - **Idéal** : la table pleine (\`Badge\` de type/statut, \`Dropdown\` d'actions par ligne).
  - **Vide** : \`EmptyState\` centré (icône + titre + aide + action primaire).
  - **Chargement** : skeleton de rangées + \`Spinner\`.
  - **Erreur** : \`Alert\` destructif + action « Réessayer ».
  - **Partiel** : bannière \`Alert\` warning + table réduite.
- **couche** - force une couche ouverte pour la juger : **Dialog création** (modale centrée), **Drawer modification** (panneau latéral), **Confirmation suppression** (\`AlertDialog\`). L'écran reste jouable : « Nouveau dossier » ouvre le Dialog, le menu ⋯ d'une ligne ouvre le Drawer (Modifier) ou l'AlertDialog (Supprimer).

### La doctrine des couches (à ne pas redécider)
| Geste | Composant | Forme |
|---|---|---|
| **Créer** un objet | \`Dialog\` | modale **centrée** |
| **Modifier** un objet | \`Drawer\` | panneau **latéral** (le chat reste visible) |
| **Confirmer** une suppression | \`AlertDialog\` | interruption centrée, action destructive |
| **Menu d'actions** sur une ligne | \`Dropdown\` | menu ancré (JAMAIS un Popover recodé) |

### Le gabarit (structure)
1. **\`PageHeader\`** - titre serif + action primaire (« Nouveau dossier ») + onglets. Padding intégré \`px-8 pt-7\`.
2. **Zone de contenu scrollable** \`flex-1 overflow-y-auto px-8 py-6\` - la table (ou l'un des 4 autres états). Pleine largeur, aucun \`max-width\`.
3. **Couches** (Dialog / Drawer / AlertDialog) - montées à la racine de l'écran, jamais imbriquées dans une rangée.

### Un agent NE fait jamais
Pas de \`<button>\`/\`<input>\`/\`<select>\` brut (primitives \`Button\` / \`Input\` / \`Select\`) ; pas de menu d'actions recodé (\`Dropdown\`) ; pas de panneau latéral inline (\`Drawer\`) ; pas de modale de création à la main (\`Dialog\`) ; pas de \`<table>\` sans en-têtes mono ni \`Badge\` pour les statuts ; jamais moins de 5 états sur un écran de données.

### Doctrine
Voir le block **Shell** pour le gabarit de page (châssis + valeurs canoniques) et \`AGENTS.md\` § « Imiter /ui-kit, jamais App.js ».`,
  },
  {
    id: 'shell',
    family: 'Shell & pages',
    title: 'Shell',
    kind: 'shell',
    status: 'validated',
    filePath: 'src/components/ui/AppSidebar.js · TopBar.js · PageHeader.js',
    figmaRef: 'https://www.figma.com/design/?node-id=4127-30731',
    figmaPage: 'App Shell',
    description: "Le shell de l'app : rail + barre de tête + en-tête de page. Choisis la page et l'état du rail pour voir comment le contenu s'y insère.",
    demo: SHELL_DEMO,
    doc: `### Rôle
Le châssis de toute page produit : rail de navigation (\`AppSidebar\`), barre de tête (\`TopBar\`), en-tête de page (\`PageHeader\`). Une nouvelle page = du **contenu** passé à ces composants, jamais une barre inline.

### Controls
- **page** - la page rendue dans le shell (Accueil, Mes dossiers, Mes conversations, Conversation, Paramètres). Chacune montre la bonne combinaison barre + en-tête - dont l'index « Mes conversations » (liste) distinct du fil d'une conversation.
- **state** - l'état du rail : **ouverte**, **masquée** (bouton « Menu » flottant), ou **peek** (overlay au survol).

### Jouable
Une fois ouvert, clique le bouton collapse du rail pour le masquer, puis survole « Menu » pour le peek. Collapse et peek sont animés (courbe de la nav).

### Gabarit de page (le contrat)
Structure verticale d'une page produit, du châssis vers le contenu :
1. **Bannière trial** (optionnelle) - pleine largeur, tout en haut, \`flex-shrink-0\`.
2. **Rangée** \`flex-1 flex overflow-hidden\` : rail (\`AppSidebar\` via le slot de nav) + colonne de contenu, côte à côte.
3. **Colonne de contenu** \`flex-1 flex flex-col overflow-hidden\`, fond \`colors.semantic.background\` :
   - *nav masquée uniquement* : bande « Menu » \`px-8 pt-3 pb-1 flex-shrink-0\` (\`NavExpandControl\`), AU-DESSUS du titre - jamais en overlay ;
   - \`PageHeader\` (titre serif + action + onglets) - padding intégré \`px-8 pt-7\` (passer \`className="pt-3"\` si nav masquée) ;
   - **zone de contenu scrollable** \`flex-1 overflow-y-auto px-8 py-6\` - c'est ici que vit la page.

**Valeurs canoniques - à ne pas redécider :**
| Propriété | Valeur | Note |
|---|---|---|
| Padding horizontal | \`px-8\` (32px) | MÊME valeur partout : titre, contenu, empty state. En-tête et corps s'alignent. |
| Padding vertical (zone scroll) | \`py-6\` (24px) | listing. Dossier (workspace) : \`pt-6 pb-8\`. |
| **Max-width du contenu** | **AUCUNE - pleine largeur** | La page occupe TOUTE la colonne. Ne jamais capper une page. Seule la **prose de lecture** (paragraphes de doc) peut capper ~720px. |
| Fond de page | \`colors.semantic.background\` | |
| Hauteur / scroll | \`h-screen\` sur la racine ; scroll INTERNE à la zone contenu | jamais de scroll sur la page entière. |
| Empty state | centré \`py-20 text-center\`, icône \`w-12 h-12 rounded-xl bg-cream\` | 1 ligne titre + 1 ligne aide. |

**Un agent NE fait jamais :** pas de \`max-w-*\` / \`maxWidth\` sur la colonne de page ; pas de padding horizontal différent entre en-tête et corps (toujours \`px-8\`) ; pas de barre inline (\`h-12 border-b\`, \`border-r flex-col\`) - on compose \`AppSidebar\` / \`TopBar\` / \`PageHeader\` / \`Niveau3Strip\` ; pas de \`<h1>\` serif + boutons inline - c'est \`PageHeader\`.

### Doctrine
Rail, barre de tête, en-tête et barre de contexte sont des composants canoniques. Ne jamais re-rouler une barre. Voir \`AGENTS.md\` § « Shell, nav & barres ».`,
  },
  {
    id: 'matter',
    family: 'Shell & pages',
    title: 'Shell - dossier (matter)',
    kind: 'matter',
    status: 'validated',
    filePath: 'src/components/shell/DossierTab.js · ui/Niveau3Strip.js',
    figmaRef: 'https://www.figma.com/design/?node-id=4046-0',
    figmaPage: 'Dossier V2',
    description: 'Le shell spécifique au dossier, avec ses contenus d\'onglet : Informations (fiche dossier), Chiffrage (overview VD/VI), et le détail de poste niveau 3 (params, tables, total, notes, JP). La nav démarre auto-repliée.',
    demo: MATTER_DEMO,
    doc: `### Rôle
Le shell d'un dossier ouvert, **chrome complet** : rail de nav, barre de tête (onglets \`DossierTab\`), bande de contexte **Niveau 3** (\`Niveau3Strip\`) quand on entre dans un objet (poste de chiffrage, JP), et le **panneau Plato Assistant toujours affiché** à droite (fil contextuel + composer canonique \`AssistantComposer\`). Deux retours ne s'empilent jamais. Chaque vue rend son **contenu réel** (données mock), composé des blocks canoniques - \`src/components/ui-kit/matterTabContents.jsx\`.

### Controls
- **objet** - la vue :
  - **Onglet Informations** - fiche dossier : victime directe, victimes indirectes, fait générateur, tiers payeurs (Figma « PI - Infos Dossier & Victimes » 1078:48402).
  - **Onglet Chiffrage** - overview : pills de totaux + actions, sections VD / VI (\`SectionCalculation\` + \`RowCalculation\`), total consolidé (\`TotalSubtotal\`) (Figma « PI - Chiffrage Overview » 1078:48403).
  - **Poste (niveau 3)** - détail PGPA sur le **Layout Template (Base)** (Figma 1078:44413) : params strip → table blocks (\`RowPGP\`) → total summary → notes / argumentaire → JP retenues (\`JPListing\`).
  - **JP (niveau 3)** - bande de contexte JP (contenu hors scope).
- **vi** - Chiffrage : affiche la section Victimes indirectes + le total consolidé (variante Figma « Avec VI »).

### Jouable
La nav du dossier est **toujours auto-repliée** (doctrine) : survole « Menu » pour faire apparaître le rail en peek sans quitter le dossier. Les tiers payeurs (Informations) et le total (Chiffrage / Poste) se déplient au clic.

### Gabarit dossier (le contrat)
Même colonne pleine largeur que le shell générique (aucun max-width), mais chrome et découpage propres au dossier :
1. **\`TopBar\`** (h-12, \`px-3\` nav ouverte / \`px-4\` nav masquée) - breadcrumb + nom serif + onglets de vue (\`DossierTab\`). Nav masquée : la bande porte elle-même « Menu » + hairline.
2. **\`Niveau3Strip\`** (optionnelle) - bande de contexte quand on entre dans un objet (poste, JP). Ne s'empile JAMAIS avec un autre retour.
3. **Corps de l'onglet** \`flex-1 overflow-y-auto\`, padding \`px-8 pt-6 pb-8\` (variante workspace du contrat), gap interne 10px entre blocks.
4. **Panneau Plato Assistant** - colonne de droite TOUJOURS affichée (largeur fixe), \`flex-shrink-0\` ; le corps du dossier prend \`flex-1 min-w-0\`.

Plancher \`minWidth: 1160\` pour préserver le chrome complet (scroll horizontal en deçà) ; sinon **pleine largeur**, aucun cap.

### Doctrine
« V2 » (Figma 4046) : breadcrumb + onglets + outils en chrome fixe, en-tête de page sticky dans le contenu. Registre : \`docs/design-truth.md\`.`,
  },
];

const TABLE_DOC = (name, detail) => `### Rôle
${detail}

### Système
Table du **système custom** de Plato : cellules typées (\`DataTableCell\`) + en-têtes (\`DataTableHeader\`) + rangées métier. Décision (custom, pas shadcn) et architecture : \`docs/table-system.md\`.

### Statut
${name}`;

export const TABLE_BLOCKS = [
  {
    id: 'table-bordereau',
    family: 'Tables',
    title: 'Bordereau de pièces',
    kind: 'table',
    status: 'pending',
    filePath: 'src/components/pieces/BordereauTable.js',
    description: 'Le bordereau : rangées par catégorie, sélection, tri, menu contextuel. En code (famille Row Bordereau). Table complète jouable depuis la fiche composant.',
    demo: tableFamilyDemo('bordereau'),
    doc: TABLE_DOC('En code (`src/components/pieces/BordereauTable.js`). Table interactive complète : ouvre la fiche BordereauTable.', 'La table du bordereau de pièces : rangées par catégorie, sélection multiple, tri de colonnes, menu contextuel (déplacer, fusionner, découper).'),
  },
  {
    id: 'table-documents',
    family: 'Tables',
    title: 'Documents / pièces',
    kind: 'table',
    status: 'pending',
    filePath: 'src/components/ui/tables/RowDocuments.js',
    description: 'Row Documents (OCR, split, statuts). Vue liste des documents importés avant classement.',
    demo: tableFamilyDemo('documents'),
    doc: TABLE_DOC('En code (`src/components/ui/tables/RowDocuments.js`).', 'Vue liste des documents importés : statut OCR, découpage (split), badges de statut, avant classement en pièces.'),
  },
  {
    id: 'table-chiffrage',
    family: 'Tables',
    title: 'Chiffrage',
    kind: 'table',
    status: 'pending',
    filePath: 'src/components/ui/tables/RowCalculation.js',
    description: 'RowCalculation (postes type D). La table des postes de préjudice avec calcul.',
    demo: tableFamilyDemo('chiffrage'),
    doc: TABLE_DOC('En code (`src/components/ui/tables/RowCalculation.js`).', 'La table du chiffrage : postes de préjudice (type D), montants calculés, sous-totaux.'),
  },
  {
    id: 'table-pgp',
    family: 'Tables',
    title: 'PGP - revenus',
    kind: 'table',
    status: 'pending',
    filePath: 'src/components/ui/tables/RowPGP.js',
    description: 'Référence / Perçus / Perte / À échoir. La table de la perte de gains professionnels.',
    demo: tableFamilyDemo('pgp'),
    doc: TABLE_DOC('En code (`src/components/ui/tables/RowPGP.js`).', 'La perte de gains professionnels : colonnes Référence, Perçus, Perte, À échoir.'),
  },
  {
    id: 'table-cotisations',
    family: 'Tables',
    title: 'Cotisations & impôts',
    kind: 'table',
    status: 'pending',
    filePath: 'src/components/ui/tables/CotisationsRows.js',
    description: 'Row Prélèvement (12 types). La page de prélèvement du droit social.',
    demo: tableFamilyDemo('cotisations'),
    doc: TABLE_DOC('En code (`src/components/ui/tables/CotisationsRows.js`).', 'Les cotisations & impôts (droit social) : rangées de prélèvement (12 types), badges par autorité juridique.'),
  },
];

export const BLOCKS = [...SHELL_BLOCKS, ...TABLE_BLOCKS];
export const getBlock = (id) => BLOCKS.find((b) => b.id === id);

// Vignette non-interactive pour la carte de galerie.
export function BlockThumb({ block }) {
  if (block.kind === 'table') {
    return (
      <div style={{ width: 56, height: 56, borderRadius: 12, background: colors.semantic.cream, border: `1px solid ${colors.semantic.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundTertiary }}>
        <Table2 style={{ width: 26, height: 26 }} strokeWidth={1.5} />
      </div>
    );
  }
  // Aperçu réel scalé, ancré en haut-gauche (montre le rail + la barre).
  const preview = block.kind === 'matter'
    ? { active: 'dossiers', initial: 'ouverte', renderColumn: (menu) => (<><TopBar left={<MatterTabs />} right={<PlatoAssistantButton onClick={noop} />} />{floatMenu(menu)}<Zone>Workspace</Zone></>) }
    : { active: 'home', initial: 'ouverte', renderColumn: (menu) => (<>{floatMenu(menu)}<Zone>Contenu</Zone></>) };
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 900, transform: 'scale(0.44)', transformOrigin: 'top left', pointerEvents: 'none' }}>
        <ShellCanvas block={preview} interactive={false} height={370} />
      </div>
    </div>
  );
}
