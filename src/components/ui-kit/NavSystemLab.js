// Lab « Nav du dossier - proposition (V2) » (/ui-kit/nav-system).
//
// UNE proposition, dans son shell complet (sidebar org + workspace matter).
// La nav du dossier tient sur deux plans :
//   - CHROME (1 bande fixe) : [Menu si nav masquée] breadcrumb « Mes dossiers │
//     dossier » + onglets + outils de workspace.
//   - CONTENU (en-tête de page sticky) : à la racine d'un onglet = ses actions ;
//     au niveau 3 (poste, acte) = ← retour + titre serif + CTA.
// « Mes dossiers » (chrome) sort du dossier ; « ← retour » (contenu) remonte
// d'un cran : jamais sur le même plan. Maquette Figma 4046.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FolderOpen, FolderPlus, Home, MessageCircle,
  MessageCirclePlus, Settings, Gift, ChevronsUpDown, Copy, Download,
  Search, Plus, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, FileText, ListChecks,
  Maximize2, Minimize2, SquarePen, Archive,
} from 'lucide-react';
import NavItem from '../shell/NavItem';
import NavSectionHeader from '../shell/NavSectionHeader';
import NavExpandControl from '../shell/NavExpandControl';
import NavPromoBanner from '../shell/NavPromoBanner';
import PanelToggleIcon from '../shell/PanelToggleIcon';
import PlatoAssistantButton from '../shell/PlatoAssistantButton';
import { CodeBadge } from '../shell/Niveau3Strip';

const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";
const MONO = "'IBM Plex Mono', monospace";
const NAV_BEZIER = 'cubic-bezier(.22,1,.36,1)';
const PEEK_SHADOW = '14px 0 34px rgba(41,37,36,.16)';

const serifTitle = { fontFamily: SERIF, fontWeight: 500, color: '#292524', letterSpacing: '-0.01em' };
const monoLabel = { fontFamily: MONO, fontWeight: 500, fontSize: 11, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em' };

const SERIF_AMOUNT = { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, letterSpacing: '-0.5px' };
const serifAmt = (v, size = 18) => <span className="text-foreground flex-shrink-0" style={{ ...SERIF_AMOUNT, fontSize: size }}>{v}</span>;

function AnnotationCard({ title, children }) {
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3.5">
      <div style={{ ...monoLabel, color: '#292524' }}>{title}</div>
      <p className="text-[12.5px] text-foreground-secondary leading-[19px] mt-1.5">{children}</p>
    </div>
  );
}

// ── Briques du workspace ─────────────────────────────────────────────
function WorkspaceTools() {
  return (
    <div className="flex items-center gap-2 justify-end flex-shrink-0">
      <PlatoAssistantButton onClick={() => {}} />
      <button className="p-1.5 rounded-lg transition-colors hover:bg-stone-100" title="Plus d'options"><MoreVertical className="w-5 h-5 text-stone-500" strokeWidth={1.5} /></button>
    </div>
  );
}
function PrimaryCTA({ icon: Icon, children }) {
  return (
    <button className="h-8 flex items-center gap-1.5 px-3 text-[14px] font-medium text-white bg-foreground rounded-[6px] hover:bg-foreground-tertiary transition-colors flex-shrink-0" style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.05)' }}>
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}{children}
    </button>
  );
}
function SecondaryCTA({ icon: Icon, children }) {
  return (
    <button className="h-8 flex items-center gap-1.5 px-3 text-[14px] font-medium text-foreground bg-white border border-border-strong rounded-[6px] hover:bg-background-subtle transition-colors flex-shrink-0" style={{ boxShadow: '0px 1px 0.5px 0px rgba(26,26,26,0.03)' }}>
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}{children}
    </button>
  );
}
function TotalPill({ code, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-[6px] flex-shrink-0" style={{ backgroundColor: '#fff', border: '1px solid #e7e5e1' }}>
      <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#78716c', letterSpacing: '0.04em' }}>{code}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </span>
  );
}
function StickyHeader({ children }) {
  return (
    <div className="sticky top-0 z-10 px-6 bg-white border-b border-border" style={{ boxShadow: '0 1px 0 rgba(41,37,36,0.03)' }}>
      {children}
    </div>
  );
}
function BackLink({ label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-[13px] text-foreground-tertiary hover:text-foreground transition-colors" title={label}>
      <ChevronLeft className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {label}
    </button>
  );
}
function Rows({ label, rows = 4, onRow = null, items = null }) {
  if (items) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <button key={i} onClick={onRow ? () => onRow(it) : undefined} className={`w-full flex items-center gap-3 px-3 h-11 rounded-lg border border-border text-left ${onRow ? 'hover:bg-background-subtle transition-colors' : ''}`}>
            {it.code ? <CodeBadge>{it.code}</CodeBadge> : it.icon ? <it.icon className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} /> : null}
            <span className="flex-1 min-w-0 truncate text-[14px] text-foreground">{it.name}</span>
            {it.meta && <span className="text-[13px] text-foreground-muted flex-shrink-0">{it.meta}</span>}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: '#dfdcd9', backgroundColor: '#fbfaf9' }}>
          <span style={{ ...monoLabel, color: '#c6c1ba', fontSize: 10 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const V2_TABS = [
  { id: 'Informations', label: 'Informations' },
  { id: 'Chiffrage', label: 'Chiffrage' },
  { id: 'Pièces', label: 'Pièces', count: 26 },
  { id: 'Actes', label: 'Actes', count: 3 },
  { id: 'JP', label: 'JP', count: 1 },
];

// Le workspace matter : chrome (breadcrumb + onglets + outils) + contenu sticky.
// `leading` = le contrôle « Menu » injecté à gauche quand la nav org est masquée.
function MatterWorkspace({ leading = null, onGoList }) {
  const [tab, setTab] = useState('Chiffrage');
  const [sub, setSub] = useState(null); // null | 'poste' | 'acte'
  const go = (t) => { setTab(t); setSub(null); };
  // Hiérarchie B (validée) : le nom du dossier est une ancre serif, le titre
  // d'objet reste serif 20, le montant à 16 (ne télescope plus le titre serif).
  const objTitle = { fontFamily: SERIF, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' };
  const dossierNameCls = 'text-foreground hover:text-foreground-secondary transition-colors truncate';
  const dossierNameStyle = { fontFamily: SERIF, fontSize: 15, fontWeight: 500 };

  let header = null;
  if (sub === 'poste') {
    header = (
      <StickyHeader>
        <div className="py-3">
          <BackLink label="Retour au chiffrage" onClick={() => setSub(null)} />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CodeBadge>DFP</CodeBadge>
              <h3 className="text-foreground truncate" style={objTitle}>Déficit fonctionnel permanent</h3>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">{serifAmt('38 900 €', 16)}<PrimaryCTA icon={Copy}>Copier chiffrage</PrimaryCTA></div>
          </div>
        </div>
      </StickyHeader>
    );
  } else if (sub === 'acte') {
    header = (
      <StickyHeader>
        <div className="py-3">
          <BackLink label="Retour aux actes" onClick={() => setSub(null)} />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-foreground truncate" style={objTitle}>Assignation en référé-expertise — Dupont c/ Martin</h3>
              <span className="text-[12px] text-foreground-muted flex-shrink-0">14/09/2026</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center rounded-md border border-border overflow-hidden text-[12px] font-medium">
                <span className="px-2.5 py-1 bg-white text-foreground">Acte</span>
                <span className="px-2.5 py-1 text-foreground-muted border-l border-border">Bordereau</span>
              </div>
              <button className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] hover:bg-border transition-colors" style={{ backgroundColor: '#eeece6', color: '#44403c' }} title="Copier"><Copy className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
              <button className="h-8 flex items-center gap-1.5 pl-3 pr-2.5 text-[14px] font-medium text-white bg-foreground rounded-[6px] hover:bg-foreground-tertiary transition-colors"><Download className="w-3.5 h-3.5" strokeWidth={1.75} />Télécharger<ChevronDown className="w-3.5 h-3.5 opacity-80" strokeWidth={2} /></button>
            </div>
          </div>
        </div>
      </StickyHeader>
    );
  } else if (tab === 'Chiffrage') {
    header = (
      <StickyHeader>
        <div className="min-h-[56px] py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <TotalPill code="VD" value="1 242 985 €" />
            <TotalPill code="VI" value="578 296 €" />
            <TotalPill code="TP" value="—" />
            <span className="inline-flex items-center gap-2 h-7 px-2.5 rounded-[6px] flex-shrink-0" style={{ backgroundColor: '#eeece6' }}>
              <span className="text-[12px] text-foreground-secondary">Indemnisation totale</span>{serifAmt('1 821 281 €', 15)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0"><SecondaryCTA icon={Download}>Exporter</SecondaryCTA><PrimaryCTA icon={Plus}>Ajouter un poste</PrimaryCTA></div>
        </div>
      </StickyHeader>
    );
  } else if (tab === 'Pièces') {
    header = (
      <StickyHeader>
        <div className="min-h-[56px] py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 h-8 px-3 rounded-[6px] bg-white border border-border flex-1 max-w-[320px]"><Search className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} /><span className="text-[13.5px] text-foreground-muted truncate">Rechercher une pièce...</span></div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SecondaryCTA icon={FolderPlus}>Nouveau dossier</SecondaryCTA><PrimaryCTA icon={Plus}>Ajouter des documents</PrimaryCTA>
          </div>
        </div>
      </StickyHeader>
    );
  } else if (tab === 'Actes') {
    header = (
      <StickyHeader>
        <div className="min-h-[56px] py-2.5 flex items-center justify-between gap-3">
          <span className="text-[13.5px] text-foreground-secondary flex-shrink-0">3 actes</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <SecondaryCTA icon={ListChecks}>Nouveau bordereau</SecondaryCTA><PrimaryCTA icon={Plus}>Nouvel acte</PrimaryCTA>
          </div>
        </div>
      </StickyHeader>
    );
  } else if (tab === 'JP') {
    header = (
      <StickyHeader>
        <div className="min-h-[56px] py-2.5 flex items-center justify-between gap-3">
          <span className="text-foreground truncate" style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500 }}>Jurisprudence retenues</span>
          <PrimaryCTA icon={Search}>Rechercher</PrimaryCTA>
        </div>
      </StickyHeader>
    );
  }
  // Informations : pas d'en-tête de contenu.

  let body;
  if (sub === 'poste') body = <Rows label="Détail du poste - lignes, justificatifs…" rows={8} />;
  else if (sub === 'acte') body = <Rows label="Corps de l'acte…" rows={8} />;
  else if (tab === 'Chiffrage') body = <Rows onRow={() => setSub('poste')} items={[
    { code: 'DFP', name: 'Déficit fonctionnel permanent', meta: '38 900 €' },
    { code: 'DSA', name: 'Dépenses de santé actuelles', meta: '200 000 €' },
    { code: 'PGPA', name: 'Pertes de gains prof. actuelles', meta: '38 200 €' },
  ]} />;
  else if (tab === 'Actes') body = <Rows onRow={() => setSub('acte')} items={[
    { icon: FileText, name: 'Assignation en référé-expertise — Dupont c/ Martin', meta: '14/09/2026' },
  ]} />;
  else if (tab === 'Pièces') body = <Rows label="Liste des pièces (26)" rows={7} />;
  else if (tab === 'JP') body = <Rows label="Fiches de jurisprudence retenue" rows={4} />;
  else body = <Rows label="Fiche du dossier - Victime, coordonnées…" rows={7} />;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      {/* CHROME : [Menu] breadcrumb ┃ onglets ┃ outils (1 bande fixe) */}
      <div className="px-6 flex items-stretch justify-between gap-4 border-b border-border bg-white flex-shrink-0" style={{ height: 48 }}>
        <div className="flex items-stretch gap-3 min-w-0">
          {leading && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {leading}
              <span className="w-px h-4 bg-border-strong flex-shrink-0" />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <button onClick={onGoList} className="flex items-center gap-1.5 text-[13.5px] text-foreground-secondary hover:text-foreground transition-colors" title="Retour à la liste des dossiers"><FolderOpen className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} /> Mes dossiers</button>
            <span className="w-px h-4 bg-border-strong flex-shrink-0" />
            <button className={dossierNameCls} style={dossierNameStyle} title="Aperçu du dossier">Martin c/ Axa</button>
          </div>
          <div className="flex items-center"><span className="w-px h-4 bg-border-strong flex-shrink-0" /></div>
          <nav className="flex items-end gap-5 min-w-0">
            {V2_TABS.map(t => {
              const on = t.id === tab;
              return (
                <button key={t.id} onClick={() => go(t.id)} className={`flex items-center gap-1.5 pt-3 pb-[13px] -mb-px border-b-2 text-[13.5px] whitespace-nowrap transition-colors ${on ? 'border-foreground text-foreground font-medium' : 'border-transparent text-foreground-secondary hover:text-foreground'}`}>
                  {on && sub && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#f47a2c' }} />}
                  {t.label}
                  {t.count != null && <span className="text-[11px] text-foreground-muted">{t.count}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center flex-shrink-0"><WorkspaceTools /></div>
      </div>
      {/* CONTENU : en-tête sticky + corps défilant */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {header}
        <div className="px-6 py-4">{body}</div>
      </div>
    </div>
  );
}

// ── Sidebar org (miniature fidèle à renderUnifiedSidebar) ────────────
// Un seul item actif à la fois : dans un dossier, c'est la ligne du dossier
// (Martin c/ Axa) qui s'allume - PAS « Mes dossiers ». Sur la liste, c'est
// « Mes dossiers » qui s'allume.
function DemoSidebar({ onToggle, pinned, view, onGo }) {
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#f8f7f5', borderRight: '1px solid #dfdcd9' }}>
      <div className="h-12 border-b border-border flex items-center pl-4 pr-3 gap-2 flex-shrink-0">
        <span className="flex items-center flex-1 min-w-0"><img src="/logo-plato-wordmark.svg" alt="Plato" className="h-6 flex-shrink-0" style={{ width: 75 }} /></span>
        <button
          onClick={onToggle}
          className="group p-1.5 rounded-md hover:bg-background-subtle transition-colors flex-shrink-0"
          title={pinned ? 'Épingler la navigation' : 'Masquer la navigation'}
          aria-label={pinned ? 'Épingler la navigation' : 'Masquer la navigation'}
        >
          <PanelToggleIcon dir="collapse" className="w-4 h-4 text-foreground-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-2">
        <div className="px-2 pt-3 flex flex-col gap-0.5">
          <NavItem variant="destination" icon={Home} label="Accueil" active={view === 'home'} onClick={() => onGo('home')} />
          <NavItem variant="destination" icon={FolderOpen} label="Mes dossiers" active={view === 'list'} onClick={() => onGo('list')} />
          <NavItem variant="destination" icon={MessageCircle} label="Mes conversations" active={view === 'conversations' || view === 'conversation'} onClick={() => onGo('conversations')} />
          <NavItem variant="destination" icon={Settings} label="Paramètres" active={view === 'settings'} onClick={() => onGo('settings')} />
        </div>
        <div className="px-2 pt-5 flex flex-col">
          <NavSectionHeader label="Dossiers récents" />
          <div className="flex flex-col gap-0.5">
            <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={() => {}} />
            <NavItem variant="recent" icon={FolderOpen} label="Martin c/ Axa" active={view === 'matter'} onClick={() => onGo('matter')} />
            <NavItem variant="recent" icon={FolderOpen} label="Ballanger c. Groupama" onClick={() => onGo('matter')} />
            <NavItem variant="see-all" label="Voir tout" onClick={() => onGo('list')} />
          </div>
        </div>
        <div className="px-2 pt-5 flex flex-col">
          <NavSectionHeader label="Conv. récentes" />
          <div className="flex flex-col gap-0.5">
            <NavItem variant="create" icon={MessageCirclePlus} label="Nouvelle conversation" onClick={() => onGo('conversations')} />
            <NavItem variant="recent" icon={MessageCircle} label="Barème Mornet 2024" trail="Martin c/ Axa" onClick={() => onGo('matter')} />
            <NavItem variant="see-all" label="Voir tout" onClick={() => onGo('conversations')} />
          </div>
        </div>
      </div>

      <NavPromoBanner icon={Gift} label="-10% à chaque parrainage" edge="bottom" title="Programme de parrainage" onClick={() => {}} />
      <div className="border-t border-border flex-shrink-0 p-2">
        <div className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-background-subtle transition-colors">
          <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-white" style={{ backgroundColor: '#57534e' }}>M</span>
          <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
            <span className="text-[14px] font-medium text-foreground truncate leading-[20px]">Meghan</span>
            <span className="text-[12px] text-foreground-secondary truncate leading-[16px]" style={{ letterSpacing: '0.12px' }}>Cabinet Hexa</span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

// ── La liste des dossiers (vue « Mes dossiers ») ─────────────────────
function DossiersList({ leading = null, onOpen }) {
  const dossiers = [
    { name: 'Martin c/ Axa', meta: 'Dommages corporels · En cours' },
    { name: 'Ballanger c. Groupama', meta: 'Dommages corporels · En cours' },
    { name: 'Consorts Petit c/ MAIF', meta: 'Droit social · En cours' },
  ];
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      {/* Page Header Type=Dossiers : titre + CTA, puis onglets Ouverts/Archivés */}
      <div className="px-6 pt-4 border-b border-border flex-shrink-0">
        {leading && <div className="flex items-center mb-2">{leading}</div>}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground truncate" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>Mes dossiers</h2>
          <PrimaryCTA icon={Plus}>Nouveau dossier</PrimaryCTA>
        </div>
        <nav className="flex items-end gap-5 mt-3 -mb-px">
          <button className="flex items-center gap-1.5 pb-2.5 border-b-2 border-foreground text-foreground font-medium text-[13.5px]"><FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} /> Ouverts <span className="text-[11px] text-foreground-muted">50</span></button>
          <button className="flex items-center gap-1.5 pb-2.5 border-b-2 border-transparent text-foreground-secondary hover:text-foreground transition-colors text-[13.5px]"><Archive className="w-3.5 h-3.5" strokeWidth={1.75} /> Archivés <span className="text-[11px] text-foreground-muted">8</span></button>
        </nav>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-2">
          {dossiers.map(d => (
            <button key={d.name} onClick={onOpen} className="w-full flex items-center gap-3 px-3 h-14 rounded-lg border border-border text-left hover:bg-background-subtle transition-colors">
              <FolderOpen className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-[14px] font-medium text-foreground">{d.name}</span>
                <span className="block truncate text-[12px] text-foreground-muted">{d.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Accueil (assistant, hors dossier) ────────────────────────────────
function HomeSurface({ leading }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      <div className="h-12 flex items-center px-4 flex-shrink-0">{leading}</div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 pb-12 text-center">
        <img src="/logo-plato.svg" alt="" className="w-8 h-8 mb-3" />
        <h2 className="text-foreground" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Bonjour, Meghan.</h2>
        <p className="text-[13.5px] text-foreground-secondary mt-1">Par où voulez-vous commencer ?</p>
        <div className="mt-5 w-full max-w-[520px] h-12 rounded-xl border border-border bg-white flex items-center px-4 text-[13.5px] text-foreground-muted">Écrivez à Plato…</div>
      </div>
    </div>
  );
}

// ── Mes conversations (index) ────────────────────────────────────────
function ConversationsSurface({ leading, onOpenConversation, onOpenMatter }) {
  const convs = [
    { name: 'Barème Mornet 2024', meta: 'Martin c/ Axa · il y a 2 h', matter: true },
    { name: 'Prescription - assignation Renault', meta: 'il y a 1 j' },
    { name: 'Rédaction assignation référé', meta: 'Martin c/ Axa · il y a 3 j', matter: true },
  ];
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      {/* Page Header Type=Conversations : titre serif + CTA */}
      <div className="px-6 flex items-center gap-3 border-b border-border flex-shrink-0" style={{ height: 64 }}>
        {leading && (<>{leading}<span className="w-px h-4 bg-border-strong flex-shrink-0" /></>)}
        <h2 className="text-foreground truncate" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>Mes conversations</h2>
        <span className="flex-1" />
        <PrimaryCTA icon={SquarePen}>Nouvelle conversation</PrimaryCTA>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-2">
          {convs.map(c => (
            <button key={c.name} onClick={c.matter ? onOpenMatter : onOpenConversation} className="w-full flex items-center gap-3 px-3 h-14 rounded-lg border border-border text-left hover:bg-background-subtle transition-colors">
              <MessageCircle className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.5} />
              <span className="flex-1 min-w-0">
                <span className="block truncate text-[14px] font-medium text-foreground">{c.name}</span>
                <span className="block truncate text-[12px] text-foreground-muted">{c.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Une conversation ouverte (Top Bar Type=Conversation) ─────────────
function ConversationView({ leading, onBack }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      <div className="px-4 flex items-center gap-1.5 border-b border-border flex-shrink-0" style={{ height: 48 }}>
        {leading && (<>{leading}<span className="w-px h-4 bg-border-strong flex-shrink-0 mr-1" /></>)}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0"><ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Mes conversations</button>
        <ChevronRight className="w-3.5 h-3.5 text-foreground-quaternary flex-shrink-0" strokeWidth={1.75} />
        <span className="group flex items-center gap-1.5 min-w-0 text-[13.5px] font-medium text-foreground">
          <span className="truncate">Prescription - assignation Renault</span>
          <SquarePen className="w-3.5 h-3.5 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 flex flex-col gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: '#dfdcd9', backgroundColor: '#fbfaf9' }}>
            <span style={{ ...monoLabel, color: '#c6c1ba', fontSize: 10 }}>Message</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Paramètres (sous-rail + contenu) ─────────────────────────────────
function SettingsSurface({ leading, onBack }) {
  const nav = ['Mon compte', 'Ma boîte mail', 'Connecteurs', 'Mon usage', 'Cabinet', 'Facturation'];
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-white">
      {/* Top Bar Type=Settings : « ← Retour à Plato » */}
      <div className="px-4 flex items-center gap-3 border-b border-border flex-shrink-0" style={{ height: 48 }}>
        {leading && (<>{leading}<span className="w-px h-4 bg-border-strong flex-shrink-0" /></>)}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground transition-colors"><ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Retour à Plato</button>
      </div>
      <div className="flex-1 min-h-0 flex">
        <div className="w-48 flex-shrink-0 border-r border-border p-2 flex flex-col gap-0.5">
          {nav.map((n, i) => (
            <span key={n} className={`px-2.5 h-8 flex items-center rounded-md text-[13.5px] ${i === 0 ? 'bg-cream text-foreground font-medium' : 'text-foreground-secondary'}`}>{n}</span>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5">
          <h3 className="text-foreground" style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500 }}>Mon compte</h3>
          <div className="mt-3 flex flex-col gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: '#dfdcd9', backgroundColor: '#fbfaf9' }}><span style={{ ...monoLabel, color: '#c6c1ba', fontSize: 10 }}>Réglage</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Le shell complet : sidebar org + surface, ouverte / masquée / peek ─
function MatterShell() {
  const [open, setOpen] = useState(true);
  const [peek, setPeek] = useState(false);
  const [view, setView] = useState('matter'); // home | list | conversations | settings | matter
  const [fullscreen, setFullscreen] = useState(false);
  const go = (t) => setView(t);
  const peekRef = useRef(false);
  peekRef.current = peek;
  const lockUntilRef = useRef(0);
  const closeTimerRef = useRef(null);
  const edgeTimerRef = useRef(null);

  const hide = () => { setOpen(false); setPeek(false); lockUntilRef.current = Date.now() + 600; };
  const expand = () => { clearTimeout(closeTimerRef.current); setPeek(false); setOpen(true); };
  const openPeek = () => { if (Date.now() < lockUntilRef.current) return; clearTimeout(closeTimerRef.current); setPeek(true); };
  const armPeekClose = () => { clearTimeout(closeTimerRef.current); closeTimerRef.current = setTimeout(() => setPeek(false), 220); };
  const cancelPeekClose = () => clearTimeout(closeTimerRef.current);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (peekRef.current) { setPeek(false); return; }
      setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFrameMove = (e) => {
    if (open || peekRef.current) return;
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    if (x <= 6) {
      if (!edgeTimerRef.current && Date.now() >= lockUntilRef.current) {
        edgeTimerRef.current = setTimeout(() => { edgeTimerRef.current = null; openPeek(); }, 180);
      }
    } else if (x > 28 && edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);
      edgeTimerRef.current = null;
    }
  };

  const state = peek ? 'peek' : open ? 'ouverte' : 'masquée';
  const menuControl = <NavExpandControl onExpand={expand} onPeekEnter={openPeek} onPeekLeave={armPeekClose} onHome={() => go('home')} />;

  // La surface affichée à droite selon la destination.
  const lead = open ? null : menuControl;
  let surface;
  if (view === 'home') surface = <HomeSurface leading={lead} />;
  else if (view === 'list') surface = <DossiersList leading={lead} onOpen={() => go('matter')} />;
  else if (view === 'conversations') surface = <ConversationsSurface leading={lead} onOpenConversation={() => go('conversation')} onOpenMatter={() => go('matter')} />;
  else if (view === 'conversation') surface = <ConversationView leading={lead} onBack={() => go('conversations')} />;
  else if (view === 'settings') surface = <SettingsSurface leading={lead} onBack={() => go('home')} />;
  else surface = <MatterWorkspace leading={lead} onGoList={() => go('list')} />;

  const pills = (
    <div className="flex items-center gap-2">
      {[{ id: 'ouverte', do: expand }, { id: 'masquée', do: hide }].map(s => (
        <button
          key={s.id}
          onClick={s.do}
          className={`h-7 px-3 rounded-full text-[12.5px] font-medium border transition-colors ${
            state === s.id ? 'bg-foreground text-white border-foreground' : 'bg-white text-foreground-secondary border-border hover:text-foreground hover:border-border-hover'
          }`}
        >
          Sidebar {s.id}
        </button>
      ))}
      <span className={`h-7 px-3 rounded-full text-[12.5px] font-medium border inline-flex items-center ${state === 'peek' ? 'bg-foreground text-white border-foreground' : 'bg-white text-foreground-muted border-dashed border-border'}`}>
        Peek
      </span>
    </div>
  );

  // Le cadre = sidebar + workspace + peek. Hauteur/bordure selon le mode.
  const frame = (
    <div
      className={`relative flex bg-white overflow-hidden ${fullscreen ? '' : 'border border-border rounded-xl'}`}
      style={{ height: fullscreen ? '100%' : 560 }}
      onMouseMove={onFrameMove}
    >
      <style>{`@keyframes nav-lab-peek-slide { from { transform: translateX(-24px); opacity: 0.4; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* Sidebar org en flux : 264 → 0 */}
      <div
        aria-hidden={!open}
        className="h-full flex-shrink-0 overflow-hidden"
        style={{
          width: open ? 264 : 0,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: `width 300ms ${NAV_BEZIER}, opacity 200ms ease, visibility 0s linear ${open ? '0s' : '300ms'}`,
        }}
      >
        <div className="h-full" style={{ width: 264 }}>
          <DemoSidebar onToggle={hide} pinned={false} view={view} onGo={go} />
        </div>
      </div>

      {/* Surface : accueil / liste / conversations / paramètres / matter */}
      {surface}

      {/* Peek : sidebar en overlay, ancrée au coin */}
      {!open && peek && (
        <div
          className="absolute inset-y-0 left-0 z-30"
          style={{ width: 264, boxShadow: PEEK_SHADOW, animation: `nav-lab-peek-slide 240ms cubic-bezier(.32,.72,0,1)` }}
          onMouseEnter={cancelPeekClose}
          onMouseLeave={armPeekClose}
        >
          <DemoSidebar onToggle={expand} pinned view={view} onGo={(t) => { go(t); expand(); }} />
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-border flex-shrink-0">
          {pills}
          <button onClick={() => setFullscreen(false)} className="h-7 flex items-center gap-1.5 px-3 rounded-full text-[12.5px] font-medium border border-border bg-white text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
            <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Quitter le plein écran (Esc)
          </button>
        </div>
        <div className="flex-1 min-h-0">{frame}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-x-4 gap-y-2 mb-3 flex-wrap">
        {pills}
        <button onClick={() => setFullscreen(true)} className="h-7 flex items-center gap-1.5 px-3 rounded-full text-[12.5px] font-medium border border-border bg-white text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
          <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Plein écran
        </button>
        <span className="text-[12px] text-foreground-muted ml-1">
          Sidebar masquée : le contrôle « Menu » apparaît à gauche du header ; survolez-le pour le peek.
        </span>
      </div>
      {frame}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════

function LabSection({ kicker, title, hint, children }) {
  return (
    <section className="mt-14">
      <div style={monoLabel}>{kicker}</div>
      {title && <h2 className="mt-1.5" style={{ ...serifTitle, fontSize: 20 }}>{title}</h2>}
      {hint && <p className="text-[13px] text-foreground-muted leading-[19px] mt-1.5" style={{ maxWidth: 640 }}>{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function NavSystemLab() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7f5' }}>
      <div className="mx-auto" style={{ maxWidth: 1080, padding: '28px 32px 72px' }}>
        <button
          onClick={() => navigate('/ui-kit')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} /> UI Kit
        </button>

        {/* En-tête */}
        <header className="mt-5">
          <div style={monoLabel}>App shell · Navigation</div>
          <h1 className="mt-2" style={{ ...serifTitle, fontSize: 30 }}>Nav du dossier</h1>
          <p className="text-[14px] text-foreground-secondary leading-[22px] mt-2.5" style={{ maxWidth: 660 }}>
            La navigation d'un dossier tient en deux plans : une <b>barre fixe</b> en haut
            (retour « Mes dossiers » + nom du dossier + onglets + outils) et l'<b>en-tête de page</b>
            dans le contenu, qui reste collé en haut au défilement. Démo complète ci-dessous : sidebar, surfaces, poste, acte, plein écran.
          </p>
        </header>

        <LabSection
          kicker="01 · La démo"
          title="Le matter complet, navigable"
          hint="Basculez la sidebar (ouverte / masquée / peek), parcourez les surfaces, ouvrez un poste ou un acte, passez en plein écran."
        >
          <MatterShell />
        </LabSection>

        <LabSection kicker="02 · Le modèle" title="Deux plans, jamais plus">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AnnotationCard title="La barre (fixe)">
              <b>[Menu si masquée] Mes dossiers │ Nom du dossier ┃ onglets ┃ outils.</b>
              « Mes dossiers » pour sortir du dossier, puis le nom du dossier (l'ancre - pas un fil
              d'Ariane, ça ne s'approfondit jamais) ; les onglets toujours visibles ; les outils
              (Plato Assistant, ⋮) à droite.
            </AnnotationCard>
            <AnnotationCard title="Le contenu (épinglé)">
              L'en-tête de page vit dans le contenu et reste collé en haut : à la racine, les actions
              de l'onglet ; au niveau 3, le <b>← retour + titre serif + CTA</b>.
            </AnnotationCard>
            <AnnotationCard title="Deux retours, jamais empilés">
              « Mes dossiers » (la barre) sort du dossier ; « ← retour » (le contenu) remonte d'un cran.
              Plans différents, jamais deux flèches côte à côte.
            </AnnotationCard>
          </div>
        </LabSection>

        <LabSection kicker="03 · Le pourquoi" title="Le problème, et pourquoi ce choix">
          <div style={{ maxWidth: 700 }}>
          {(() => {
            const H = ({ children }) => <h3 className="mt-6 first:mt-0" style={{ ...serifTitle, fontSize: 17 }}>{children}</h3>;
            const P = ({ children }) => <p className="text-[13.5px] text-foreground-secondary leading-[21px] mt-2">{children}</p>;
            const UL = ({ children }) => <ul className="mt-2 flex flex-col gap-1.5">{children}</ul>;
            const LI = ({ children }) => (
              <li className="flex items-start gap-2 text-[13.5px] text-foreground-secondary leading-[21px]">
                <span className="w-1 h-1 rounded-full flex-shrink-0 mt-[9px]" style={{ backgroundColor: '#f47a2c', opacity: 0.6 }} />
                <span>{children}</span>
              </li>
            );
            return (
              <>
                <H>Le problème</H>
                <P>
                  L'en-tête d'un dossier faisait quatre bandes empilées : « ‹ Mes dossiers », puis le
                  nom + le statut + les outils, puis les onglets, puis (dans un poste) le strip de
                  l'objet. Deux vrais soucis :
                </P>
                <UL>
                  <LI>On traversait trois ou quatre bandes avant de voir le contenu.</LI>
                  <LI>Deux retours cohabitaient, « ‹ Mes dossiers » et « ← Retour au chiffrage », souvent l'un sous l'autre. Deux flèches, et on ne savait pas laquelle menait où.</LI>
                </UL>

                <H>Ce qu'on fait</H>
                <P>
                  Une seule barre en haut (48px) : <b>Mes dossiers / Nom du dossier | onglets … Plato
                  Assistant · ⋮</b>. Le nom du dossier est en serif : c'est l'ancre, ce qui dit « tu es
                  dans ce dossier ». Les onglets restent là à tous les niveaux.
                </P>
                <P>
                  Le reste - le titre de la page et ses actions - descend dans le contenu, pas dans la
                  barre. En racine d'onglet : les actions de l'onglet (Chiffrage = totaux +
                  Exporter/Ajouter, Pièces = recherche + Ajouter, etc.). Dans un poste ou un acte :
                  deux lignes, le retour puis le titre serif + le montant + les boutons. Cet en-tête
                  reste collé en haut quand on défile la page.
                </P>

                <H>Le retour</H>
                <P>Deux retours, jamais au même endroit :</P>
                <UL>
                  <LI><b>« Mes dossiers »</b> (barre du haut) = quitter le dossier.</LI>
                  <LI><b>« ← Retour au chiffrage / aux actes »</b> (dans la page) = revenir d'un cran.</LI>
                </UL>
                <P>Sur deux plans différents - la barre contre le contenu - on ne les confond plus.</P>

                <H>Pourquoi c'est mieux</H>
                <UL>
                  <LI>Une barre au lieu de quatre : on se repère d'un coup d'œil, et on récupère ~80px de hauteur pour le contenu.</LI>
                  <LI>Chaque chose a sa forme : nom du dossier en serif, onglets en gris, actions en boutons. On trie sans y penser.</LI>
                  <LI>Un seul retour visible à la fois : fini le « deux flèches, laquelle ? ».</LI>
                  <LI>On change d'onglet ou on agit (les CTA restent épinglés) sans jamais remonter.</LI>
                </UL>

                <H>Détails</H>
                <UL>
                  <LI>Barre à 48px partout (même hauteur que la sidebar et le rail chat).</LI>
                  <LI>Onglet actif : le trait touche le filet du bas de la barre ; il reste allumé dans un poste.</LI>
                  <LI>Serif pour les titres (dossier, page, objet), Georgia pour les montants, Inter pour le reste. Pas de compteur en double : si l'onglet dit « Pièces 26 », la barre d'action ne répète pas « 26 fichiers ».</LI>
                </UL>
              </>
            );
          })()}
          </div>
        </LabSection>

        <p className="text-[12px] text-foreground-muted mt-12" style={{ fontFamily: MONO }}>
          Réf : Figma System 37497 · spec src/components/shell/NAV-BEHAVIOR.md · App.js (renderDossierWorkspaceHeader)
        </p>
      </div>
    </div>
  );
}
