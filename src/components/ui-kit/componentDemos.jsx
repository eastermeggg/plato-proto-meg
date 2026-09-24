import React, { useState, useEffect } from 'react';
import {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
  LayoutGrid, Layers, PanelRight, ClipboardList, FolderPlus, PencilLine,
  Home, FolderOpen, MessageCircle, MessageCirclePlus, ChevronDown, BadgeCheck,
  ArrowUp,
} from 'lucide-react';
import { colors } from '../../design-system/tokens';
import { AppSidebar, SidebarBrand, SidebarGroup, NavItem, NavSectionHeader } from '../ui/AppSidebar';
import AlertDialog from '../AlertDialog';
import EmptyState from '../EmptyState';
import PromptSuggestionCard from '../PromptSuggestionCard';
import SuggestionsMenu from '../SuggestionsMenu';
import JPPill from '../jp/JPPill';
import JPRow from '../jp/JPRow';
import JPListingChat from '../jp/JPListingChat';
import JPListingPosteDetail from '../jp/JPListingPosteDetail';
import JPPopoverCardReal from '../jp/JPPopoverCard';
import DecisionDrawerReal from '../jp/DecisionDrawer';
import JPAddStepperReal from '../jp/JPAddStepper';
import SaveDestinationPopoverReal from '../jp/SaveDestinationPopover';
import SlashCommandPaletteReal from '../jp/SlashCommandPalette';
import ActesListReal from '../redaction/ActesList';
import ActCanvasReal from '../redaction/ActCanvas';
import { MOCK_ASSIGNATION_TEXT } from '../../data/redactionScenarios';
import { getDecisionById as getMockDecisionById } from '../../data/mockDecisions';
import { samplePosteOptions, sampleActes, sampleReasoningSteps, sampleDecision } from '../../data/sampleDemoData';
import * as P from './previews';
import ButtonReal from '../ui/Button';
import DropZoneReal from '../ui/DropZone';
import SourceBadgeReal from '../ui/SourceBadge';
import PageHeaderReal from '../ui/PageHeader';
import TopBarReal, { TopBarHairline } from '../ui/TopBar';
import DossierTab from '../shell/DossierTab';
import NavExpandControlReal from '../ui/NavExpandControl';
import NavPromoBannerReal from '../ui/NavPromoBanner';
import PlatoAssistantButtonReal from '../ui/PlatoAssistantButton';
import Niveau3StripReal, { BreadcrumbReturn, SiblingNav, CodeBadge, StripDivider, StripTitle, StripAmount } from '../ui/Niveau3Strip';
import SidebarUserInfoReal from '../ui/SidebarUserInfo';
import SettingsSidebarReal from '../shell/SettingsSidebar';
import DataTableCellReal, { DATA_TABLE_CELL_TYPES } from '../ui/DataTableCell';
import DataTableHeaderReal from '../ui/DataTableHeader';
import RadioPricingReal from '../ui/RadioPricing';
import IVAvatarReal, { IV_PIECES, IV_PALETTES } from '../IVAvatar';
import JPListingReal from '../jp/JPListing';
import StatusPillReal from './StatusPill';
import PreviewPanelReal from '../preview/PreviewPanel';
import { KindIcon as KindIconReal, PanelHeader as PanelHeaderReal, CiteRow as CiteRowReal, MetaChip as MetaChipReal } from '../preview/PreviewAtoms';
import { LayoutTemplate, Globe, Table, Download, ExternalLink } from 'lucide-react';
import { PREVIEW_SAMPLES, POSTE_LIGNES } from '../preview/previewSamples';
import AssistantComposerReal from '../assistant/AssistantComposer';
import RowHeaderAddDocs from '../ui/tables/RowHeaderAddDocs';
import RowFolders from '../ui/tables/RowFolders';
import RowDocuments from '../ui/tables/RowDocuments';
import RowExtracting from '../ui/tables/RowExtracting';
import RowBordereau from '../ui/tables/RowBordereau';
import RowDSA from '../ui/tables/RowDSA';
import ActRow from '../ui/tables/ActRow';
import RowDFT from '../ui/tables/RowDFT';
import RowPostIV from '../ui/tables/RowPostIV';
import RowPostTP from '../ui/tables/RowPostTP';
import RowCalculation from '../ui/tables/RowCalculation';
import SectionCalculation from '../ui/tables/SectionCalculation';
import RowPGP from '../ui/tables/RowPGP';
import TotalSubtotal from '../ui/tables/TotalSubtotal';
import TotalsAmountPills from '../ui/tables/TotalsAmountPills';
import RowHours from '../ui/tables/RowHours';
import RowPrelevement, { SectionCaptions, EnTetePagePrelevement } from '../ui/tables/CotisationsRows';
import BlocResultats from '../ui/tables/BlocResultats';
import ChatComposerNoticeReal from '../ChatComposerNotice';
import ParallelTasksReal from '../ParallelTasks';
import ReasoningStepperReal from '../ReasoningStepper';
import BordereauTableReal from '../pieces/BordereauTable';
import KbdReal, { KbdGroup } from '../ui/Kbd';
import SpinnerReal from '../ui/Spinner';
import ProgressReal from '../ui/Progress';
import StepperReal from '../ui/Stepper';
import DialogReal from '../ui/Dialog';
import ButtonGroupReal from '../ui/ButtonGroup';
import ItemReal from '../ui/Item';
import CalendarReal from '../ui/Calendar';
import ChartReal from '../ui/Chart';
import AlertReal from '../ui/Alert';
import InputGroupReal, { InputGroupText, InputGroupKbd, InputGroupCheck } from '../ui/InputGroup';
import SliderReal from '../ui/Slider';

// Calendrier contrôlé (sélection + navigation de mois en état local).
function CalendarDemo({ size, weekendsOff, withDetail }) {
  const [date, setDate] = useState(() => new Date(2026, 8, 23));
  return (
    <CalendarReal
      value={date}
      onChange={setDate}
      defaultMonth={new Date(2026, 8, 1)}
      size={size}
      disabled={weekendsOff ? (d) => d.getDay() === 0 || d.getDay() === 6 : undefined}
      dayDetail={withDetail ? (d) => (d.getDate() % 3 === 0 ? '100 EUR' : '') : undefined}
    />
  );
}

// Jeux de données d'exemple du Chart (par forme).
const CHART_DATA = {
  simple: [
    { label: 'Jan', values: 125 }, { label: 'Fév', values: 66 }, { label: 'Mar', values: 97 },
    { label: 'Avr', values: 51 }, { label: 'Mai', values: 89 }, { label: 'Juin', values: 97 },
  ],
  series: [
    { label: 'Jan', values: [40, 24] }, { label: 'Fév', values: [30, 13] }, { label: 'Mar', values: [50, 38] },
    { label: 'Avr', values: [47, 39] }, { label: 'Mai', values: [36, 20] },
  ],
  parts: [
    { label: 'Dommages corporels', values: 45 }, { label: 'Droit social', values: 30 }, { label: 'Autres', values: 25 },
  ],
};

// Données minimales du BordereauTable (démo interactive : état local).
function BordereauTableDemo() {
  const [pieces, setPieces] = useState([
    { id: 'p1', intitule: "Rapport d'expertise médicale Dr. Dubois", nom: 'rapport_expertise.pdf', date: '15/03/2023', categoryId: 'c1' },
    { id: 'p2', intitule: 'Factures analyses biologiques', nom: 'factures_labo.pdf', date: '02/04/2023', categoryId: 'c1' },
    { id: 'p3', intitule: 'Avis de situation Pôle emploi', nom: 'avis_pole_emploi.pdf', date: '11/05/2023', categoryId: 'c2' },
    { id: 'p4', intitule: 'Courrier assureur (offre)', nom: 'offre_axa.pdf', date: '06/02/2024', categoryId: null },
  ]);
  const [categories, setCategories] = useState([
    { id: 'c1', name: 'I - MEDICAL', parentId: null, order: 0 },
    { id: 'c2', name: 'II - REVENUS', parentId: null, order: 1 },
  ]);
  return (
    <div style={{ width: 880 }}>
      <BordereauTableReal
        pieces={pieces}
        categories={categories}
        setPieces={setPieces}
        setCategories={setCategories}
        initialExpandedIds={['c1', 'c2']}
        onOpenPiecePreview={noop}
        onAskChato={noop}
      />
    </div>
  );
}

const noop = () => {};

// Aperçu des familles de rangées métier (DomainTableRows) : chaque famille
// est montrée en ASSEMBLAGE (header + rangées + états), comme la maquette
// « ComponentTable » — on compose des instances, jamais du markup de cellule.
export function DomainTableRowsDemo({ famille }) {
  const card = (children, w = 920) => (
    <div style={{ width: w, background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, overflow: 'hidden' }}>
      {children}
    </div>
  );
  switch (famille) {
    case 'documents':
      return card(
        <>
          <RowHeaderAddDocs type="default" existingDoc />
          <RowDocuments type="header" />
          <RowDocuments type="row" status="loading" />
          <RowDocuments type="row" status="default" />
          <RowDocuments type="rowSplitted" />
          <RowDocuments type="row" status="hover" pinHover />
          <RowDocuments type="row" status="selected" />
        </>
      );
    case 'dossiers':
      return card(
        <>
          <RowFolders type="header" />
          <RowFolders type="row" status="default" />
          <RowFolders type="row" status="hover" pinHover />
        </>
      );
    case 'extraction':
      return card(
        <>
          <RowExtracting status="pending" />
          <RowExtracting status="progress" progress={{ done: 5, total: 10, errors: 2 }} />
          <RowExtracting status="error" />
        </>
      );
    case 'bordereau':
      return card(
        <>
          <RowBordereau status="header" />
          <RowBordereau status="section" />
          <RowBordereau status="default" num="1" />
          <RowBordereau status="hover" pinHover num="2" />
        </>
      );
    case 'dsa-act-dft':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card(<><RowDSA type="header" /><RowDSA type="line" /><RowDSA type="line" pinHover revalorisation /></>)}
          {card(<><ActRow type="header" /><ActRow type="line" /><ActRow type="line" pinHover /></>)}
          {card(<><RowDFT type="header" /><RowDFT type="row" /><RowDFT type="row" pinHover revalorisation /></>)}
        </div>
      );
    case 'iv-tp':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card(<><RowPostIV type="header" /><RowPostIV type="row" /><RowPostIV type="row" pinHover revalorisation /></>)}
          {card(<><RowPostTP type="title" /><RowPostTP type="header" /><RowPostTP type="row" /><RowPostTP type="row" pinHover /></>)}
        </div>
      );
    case 'chiffrage':
      return card(
        <>
          <div style={{ padding: '10px 12px' }}><SectionCalculation victimType="direct" /></div>
          <RowCalculation type="header" victims="direct" />
          <RowCalculation type="multiCol" victims="direct" expandable showRente />
          <RowCalculation type="subline" victims="direct" showRente />
          <RowCalculation type="single" victims="direct" />
          <div style={{ padding: '10px 12px' }}><SectionCalculation victimType="indirect" /></div>
          <RowCalculation type="header" victims="indirect" />
          <RowCalculation type="subline" victims="indirect" />
        </>
      );
    case 'pgp':
      return card(
        <>
          <RowPGP family="reference" type="title" syncPgpActuels />
          <RowPGP family="reference" type="header" />
          <RowPGP family="reference" type="line" />
          <RowPGP family="reference" type="line" revalorisation pinHover />
          <RowPGP family="reference" type="footer" />
        </>
      );
    case 'totaux':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 920 }}>
          <TotalSubtotal variant="collapsed" />
          <TotalSubtotal variant="expanded" defaultExpanded />
          <TotalSubtotal variant="emphasis" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <TotalsAmountPills type="totalExp" />
            <TotalsAmountPills type="rac" revalorisation />
            <TotalsAmountPills type="totalIndemn" />
            <TotalsAmountPills type="totalExp" size="sm" />
            <TotalsAmountPills type="rac" size="sm" />
            <TotalsAmountPills type="totalIndemn" size="sm" />
          </div>
        </div>
      );
    case 'heures':
      return card(
        <>
          <RowHours type="header" />
          <RowHours type="month" />
          <RowHours type="weeks" />
          <RowHours type="days" state="empty" />
          <RowHours type="days" state="filled" />
          <RowHours type="days" state="filled" pinHover />
          <RowHours type="days" state="nonWorked" />
        </>
      );
    case 'cotisations':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card(
            <>
              <EnTetePagePrelevement />
              <SectionCaptions />
              <RowPrelevement type="posteRetenu" />
              <RowPrelevement type="posteEcarte" />
              <RowPrelevement type="taux" />
              <RowPrelevement type="deduction" />
              <RowPrelevement type="attenteSaisie" />
              <RowPrelevement type="resultatSection" />
              <RowPrelevement type="resultatTableau" active />
            </>
          )}
          <div style={{ width: 920 }}><BlocResultats /></div>
        </div>
      );
    default:
      return null;
  }
}

// Sources d'exemple du PreviewPanel : une par kind (piece / modele / jp / email
// / loi / ligne / web) + les lignes de poste pour l'état « Éditer la ligne ».
// Source unique partagée avec le lab /ui-kit/preview-panel (previewSamples.js).
// Carte de fallback pour le kind `web` : le panneau interne n'existe pas (on ne
// contrôle pas la source), le clic ouvre l'onglet - on montre donc l'état vide
// à la place, comme dans le lab.
function PreviewExternalCard({ source }) {
  return (
    <div className="rounded-xl border border-border bg-white h-[520px] flex flex-col items-center justify-center text-center px-6 sm:px-10">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background-subtle text-foreground-tertiary mb-5">
        <Globe className="w-6 h-6" strokeWidth={1.5} />
      </span>
      <div className="text-[15px] font-semibold text-foreground-strong">Lien web - pas de panneau</div>
      <p className="text-[13px] text-foreground-secondary mt-2 max-w-[360px] leading-relaxed">
        On ne contrôle pas la source : la prévisualiser en interne serait une fidélité factice. Le clic ouvre directement l'onglet.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-background-canvas text-[13px] text-foreground-secondary max-w-full">
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-foreground-muted" strokeWidth={1.75} />
        <span className="truncate">{source.url}</span>
      </div>
    </div>
  );
}

// Aperçu vivant de la cellule typée (DataTableCell) : posée sur une carte
// blanche bordée pour que la cellule (fond transparent/blanc) se lise sur le
// canvas pointillé. Le sélecteur `type` couvre les ~30 rôles ; les champs
// texte n'alimentent que les types qui les consomment.
function DataTableCellDemo(v) {
  return (
    <div style={{ width: v.type === 'TextComposed' ? 560 : 420, background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <DataTableCellReal
        type={v.type}
        text={v.text || undefined}
        subtext={v.subtext || undefined}
        title={v.title || undefined}
        description={v.description || undefined}
        ruleName={v.ruleName || undefined}
        ruleState={v.ruleState || undefined}
        sources={v.sourceLabel ? [{ type: 'code', label: v.sourceLabel }] : undefined}
        width="100%"
      />
    </div>
  );
}

// Aperçu vivant de la ligne de nav (NavItem) : posée dans un mini-rail (fond
// background, largeur 250) pour que fond cream / bord / liseré actif se lisent.
// (Le mode `collapsed` icône-seule est legacy - pas exposé ici.)
function NavItemDemo({ variant, label, icon, trail, active }) {
  const Icon = ICON_OPTIONS[icon] || undefined;
  return (
    <div style={{ width: 250, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: 8 }}>
      <NavItem
        variant={variant}
        icon={variant === 'see-all' ? undefined : Icon}
        label={label}
        trail={variant === 'recent' ? (trail || null) : null}
        active={active}
        onClick={noop}
      />
    </div>
  );
}

// Aperçu vivant de l'en-tête de page canonique (PageHeader) : titre serif +
// action primaire (Button) + onglets à compteurs (Badge). Type=Dossiers montre
// les onglets, Type=Conversations n'en a pas. Onglet actif interactif.
function PageHeaderDemo({ type, title, actionLabel }) {
  const [tab, setTab] = useState('ouverts');
  const isDossiers = type === 'Dossiers';
  return (
    <div style={{ width: '100%', maxWidth: 720, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <PageHeaderReal
        title={title}
        action={<ButtonReal variant="primary" icon={isDossiers ? Plus : PencilLine} label={actionLabel} onClick={noop} />}
        tabs={isDossiers ? [{ key: 'ouverts', label: 'Ouverts', count: 50 }, { key: 'archives', label: 'Archivés', count: 8 }] : undefined}
        activeTab={tab}
        onTabChange={setTab}
      />
    </div>
  );
}

// Aperçu vivant du shell canonique (AppSidebar) qui ASSEMBLE toutes les pièces.
// EXEMPLE = la nav du PROTO Plato (pas la nav DS) : destinations produit
// (Accueil / Mes dossiers / Mes conversations / Paramètres), sections récentes
// et pied profil (SidebarUserInfo). C'est le même rail que le proto tourne.
//
// TROIS ÉTATS (App Shell doctrine, Plato---Design 4127:30731) - PAS de rail
// d'icônes réduit (mode Reduced = Generation=Legacy, abandonné) :
//   ouverte  rail 250px en flux + contenu à côté
//   masquée  RIEN ne subsiste : plus de rail, juste le contrôle « Menu »
//            (NavExpandControl) dans une TopBar
//   peek     rail complet en OVERLAY (ombre), le contenu ne reflue pas
function ShellRail({ chip, active, withRecents, withFooter, onCollapse }) {
  const avatar = (
    <span className="rounded-full flex-shrink-0 flex items-center justify-center" style={{ width: 24, height: 24, background: colors.avatar[0].bg, color: colors.avatar[0].fill, fontSize: 12, fontWeight: 600 }}>MR</span>
  );
  const footer = withFooter ? (
    <SidebarUserInfoReal name="Meghan" org="Cabinet Hexa" avatar={avatar} onClick={noop} />
  ) : null;
  return (
    <AppSidebar width={264} header={<SidebarBrand chip={chip || undefined} />} footer={footer} onCollapse={onCollapse || noop}>
      {/* Destinations produit - sans en-tête de section (comme le proto). */}
      <div className="px-2 pt-3 flex flex-col gap-0.5">
        <NavItem icon={Home} label="Accueil" active={active === 'home'} onClick={noop} />
        <NavItem icon={FolderOpen} label="Mes dossiers" active={active === 'dossiers'} onClick={noop} />
        <NavItem icon={MessageCircle} label="Mes conversations" active={active === 'conversations'} onClick={noop} />
        <NavItem icon={Settings} label="Paramètres" active={active === 'settings'} onClick={noop} />
      </div>
      {withRecents && (
        <div className="px-2 pt-5">
          <NavSectionHeader label="Dossiers récents" />
          <div className="flex flex-col gap-0.5">
            <NavItem variant="create" icon={FolderPlus} label="Nouveau dossier" onClick={noop} />
            <NavItem variant="recent" icon={FolderOpen} label="Martel / AXA" active={active === 'dossiers'} onClick={noop} />
            <NavItem variant="recent" icon={FolderOpen} label="Lefèvre / MAIF" onClick={noop} />
            <NavItem variant="see-all" label="Voir tout" onClick={noop} />
          </div>
        </div>
      )}
      {withRecents && (
        <div className="px-2 pt-5 pb-2">
          <NavSectionHeader label="Conv. récentes" />
          <div className="flex flex-col gap-0.5">
            <NavItem variant="create" icon={MessageCirclePlus} label="Nouvelle conversation" onClick={noop} />
            <NavItem variant="recent" icon={MessageCircle} label="Préavis - fin de contrat" trail="Martel / AXA" onClick={noop} />
            <NavItem variant="see-all" label="Voir tout" onClick={noop} />
          </div>
        </div>
      )}
    </AppSidebar>
  );
}

function ShellPreview({ chip, state = 'ouverte', active, withRecents, withFooter }) {
  // INTERACTIF : le contrôle `state` donne l'état initial, mais on peut vraiment
  // jouer - le bouton collapse masque le rail, le contrôle « Menu » le rouvre,
  // son survol déclenche le peek (overlay). C'est le vrai comportement proto.
  const [st, setSt] = useState(state);
  useEffect(() => { setSt(state); }, [state]);
  const railProps = { chip, active, withRecents, withFooter, onCollapse: () => setSt('masquee') };
  const contentZone = (label) => (
    <div style={{ flex: 1, minHeight: 0, background: colors.semantic.backgroundSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.semantic.foregroundMuted, fontSize: 13, textAlign: 'center', padding: 16 }}>
      {label}
    </div>
  );
  // Surface sans barre de tête : masquée = le « Menu » FLOTTE (aucun fond, aucun filet).
  const menuTopBar = (
    <div style={{ padding: '10px 12px', flexShrink: 0 }}>
      <NavExpandControlReal
        onExpand={() => setSt('ouverte')}
        onHome={() => setSt('ouverte')}
        onPeekEnter={() => setSt('peek')}
        onPeekLeave={() => setSt('masquee')}
      />
    </div>
  );
  const frame = { height: 520, width: '100%', maxWidth: 760, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 12, overflow: 'hidden', background: colors.semantic.card, boxShadow: '0 1px 2px rgba(26,26,26,0.05)', display: 'flex', position: 'relative' };
  const open = st === 'ouverte';
  return (
    <div style={frame}>
      <style>{'@keyframes ds-peek-slide{from{transform:translateX(-26px);opacity:.35}to{transform:translateX(0);opacity:1}}'}</style>
      {/* Rail en flux - largeur + opacité animées (collapse fluide, courbe de la nav). */}
      <div style={{ width: open ? 264 : 0, opacity: open ? 1 : 0, height: '100%', flexShrink: 0, overflow: 'hidden', pointerEvents: open ? 'auto' : 'none', transition: 'width 300ms cubic-bezier(.22,1,.36,1), opacity 200ms ease' }}>
        <div style={{ width: 264, height: '100%' }}><ShellRail {...railProps} /></div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!open && menuTopBar}
        {contentZone(open ? 'Zone de contenu - clique le bouton collapse du header pour masquer' : 'Zone de contenu - survole « Menu » pour le peek, ou clique-le pour rouvrir')}
      </div>
      {/* Peek : overlay plein-hauteur qui GLISSE du coin (240ms). */}
      {st === 'peek' && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 264, zIndex: 5, boxShadow: '14px 0 34px rgba(41,37,36,.16)', animation: 'ds-peek-slide 240ms cubic-bezier(.32,.72,0,1)' }} onMouseEnter={() => setSt('peek')} onMouseLeave={() => setSt('masquee')}>
        <ShellRail {...railProps} />
        </div>
      )}
    </div>
  );
}

// Available Lucide icons exposed to the icon-type controls.
export const ICON_OPTIONS = {
  Sparkles, FileText, BookOpen, Search, Calculator, Inbox, Plus, Briefcase,
  Heart, Scale, Mail, Bell, Settings, User, Trash2, Edit, Filter, Eye,
};

// Jeux d'exemple partagés (shapes documentées) : src/data/sampleDemoData.js.

// SaveDestinationPopover — état local des toggles, popover ouvert dans un cadre
// relatif (l'ancrage `absolute` du composant se scope au cadre).
function SaveDestinationPopoverDemo() {
  const [workspacePinned, setWorkspacePinned] = useState(false);
  const [matterPinned, setMatterPinned] = useState(true);
  const [assignedPosteIds, setAssignedPosteIds] = useState(['atpt']);
  const togglePoste = (id) =>
    setAssignedPosteIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  return (
    <div style={{ position: 'relative', width: 320, height: 340 }}>
      <SaveDestinationPopoverReal
        className="absolute top-0 right-0"
        workspacePinned={workspacePinned}
        onToggleWorkspace={() => setWorkspacePinned(v => !v)}
        matterPinned={matterPinned}
        onToggleMatter={() => setMatterPinned(v => !v)}
        assignedPosteIds={assignedPosteIds}
        onTogglePoste={togglePoste}
        posteOptions={samplePosteOptions}
        onClose={noop}
      />
    </div>
  );
}

// SlashCommandPalette — mini composer : taper « / » ouvre la palette au-dessus
// du champ (ancrage `bottom: 100%` scopé au cadre relatif).
function SlashCommandPaletteDemo() {
  const [value, setValue] = useState('/');
  const showPalette = value.startsWith('/');
  const query = showPalette ? value.slice(1) : '';
  return (
    <div style={{ width: 460 }}>
      <div style={{ position: 'relative' }}>
        {showPalette && (
          <SlashCommandPaletteReal
            query={query}
            onSelect={(cmd) => setValue(cmd ? `/${cmd.command} ` : '')}
            onDismiss={() => setValue('')}
          />
        )}
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Tape « / » pour ouvrir la palette…"
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14,
            color: colors.semantic.foreground, background: colors.semantic.card,
            border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 10, outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

// Sandbox frame that scopes `position: fixed` descendants (like AlertDialog's
// fullscreen overlay) to the wrapper instead of the whole viewport.
// The `transform` creates a containing block for fixed-position children.
function ScopedDialogFrame({ width = 640, height = 360, children, onReopen, isOpen }) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px dashed #cbc7c4',
        background: '#ffffff',
        backgroundImage: 'radial-gradient(#dfdcd9 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        transform: 'translateZ(0)',
      }}
    >
      {children}
      {!isOpen && (
        <button
          onClick={onReopen}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1,
            padding: '6px 10px', fontSize: 12, fontWeight: 500,
            color: '#44403c', background: '#eeece6',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Reopen dialog
        </button>
      )}
    </div>
  );
}

// AlertDialog rendered inline — open by default, contained in the sandbox frame.
function AlertDialogTrigger({ title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning }) {
  const [open, setOpen] = useState(true);
  // Reset to open whenever any control value changes
  React.useEffect(() => { setOpen(true); }, [title, description, iconVariant, actionLabel, actionVariant, cancelLabel, warning]);
  return (
    <ScopedDialogFrame isOpen={open} onReopen={() => setOpen(true)}>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        iconVariant={iconVariant}
        title={title}
        description={description}
        warning={warning || undefined}
        actionLabel={actionLabel}
        actionVariant={actionVariant}
        cancelLabel={cancelLabel}
        onAction={() => setOpen(false)}
      />
    </ScopedDialogFrame>
  );
}

function DialogTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.description, props.width]);
  return (
    <ScopedDialogFrame width={560} height={340} isOpen={open} onReopen={() => setOpen(true)}>
      <DialogReal
        open={open}
        onOpenChange={setOpen}
        title={props.title}
        description={props.description}
        width={props.width}
        footer={
          <>
            <ButtonReal variant="ghost" label="Annuler" onClick={() => setOpen(false)} />
            <ButtonReal label="Confirmer" onClick={() => setOpen(false)} />
          </>
        }
      >
        {props.children}
      </DialogReal>
    </ScopedDialogFrame>
  );
}

function SheetTrigger(props) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => { setOpen(true); }, [props.title, props.side, props.width]);
  return (
    <ScopedDialogFrame width={560} height={320} isOpen={open} onReopen={() => setOpen(true)}>
      <P.Sheet {...props} open={open} onClose={() => setOpen(false)}>
        <p style={{ margin: 0, fontSize: 14, color: '#78716c', lineHeight: '20px' }}>
          Slide-out panel for secondary content. Click the dim background or the close button to dismiss.
        </p>
      </P.Sheet>
    </ScopedDialogFrame>
  );
}

/**
 * Demo registry. Each entry is either:
 *   {
 *     description: string,
 *     controls: { [prop]: { type, default, options?, description? } },
 *     render: (values) => ReactNode,
 *     presets?: [{ label, values }]
 *   }
 * or a placeholder for components we haven't built yet:
 *   { placeholder: string, link?: string }
 *
 * Control types: 'boolean' | 'text' | 'select' | 'icon'
 */
export const componentDemos = {
  // ========================================================================
  // Real Plato components (existing files)
  // ========================================================================
  AlertDialog: {
    description: 'Confirmation dialog. Click the button to open.',
    controls: {
      title:         { type: 'text',    default: 'Confirm action',                                    description: 'Headline.' },
      description:   { type: 'text',    default: 'You are about to apply these changes to the dossier.', description: 'Body text under title.' },
      warning:       { type: 'text',    default: '',                                                   description: 'Optional amber warning block.' },
      iconVariant:   { type: 'select',  default: 'default',  options: ['default', 'destructive', 'warning', 'success', 'info'], description: 'Icon color.' },
      actionLabel:   { type: 'text',    default: 'Confirm',                                            description: 'Primary action button label.' },
      actionVariant: { type: 'select',  default: 'primary',  options: ['primary', 'destructive'],     description: 'Primary action color + matching cancel tone.' },
      cancelLabel:   { type: 'text',    default: 'Cancel',                                             description: 'Cancel button label.' },
    },
    render: v => <AlertDialogTrigger {...v} />,
    presets: [
      { label: 'Primary',     values: { iconVariant: 'default',     actionVariant: 'primary',     title: 'Confirm action',           description: 'You are about to apply these changes to the dossier.', actionLabel: 'Confirm' } },
      { label: 'Destructive', values: { iconVariant: 'destructive', actionVariant: 'destructive', title: 'Delete this dossier?',     description: 'This will permanently delete the dossier and all its pieces.', actionLabel: 'Delete' } },
    ],
  },

  EmptyState: {
    description: 'Centered empty state with icon, title, description, and optional primary/secondary actions.',
    controls: {
      icon:                 { type: 'icon',    default: 'Inbox',                                                description: 'Icon shown in the cream circle.' },
      title:                { type: 'text',    default: 'Aucun dossier',                                        description: 'Headline (serif).' },
      description:          { type: 'text',    default: 'Crée ton premier dossier pour commencer.',             description: 'Supporting copy under title.' },
      primaryActionLabel:   { type: 'text',    default: '',                                                     description: 'Primary action label. Leave empty to hide.' },
      secondaryActionLabel: { type: 'text',    default: '',                                                     description: 'Secondary action label. Leave empty to hide.' },
    },
    render: v => (
      <EmptyState
        icon={ICON_OPTIONS[v.icon]}
        title={v.title}
        description={v.description || undefined}
        primaryAction={v.primaryActionLabel ? { label: v.primaryActionLabel, icon: Plus, onClick: noop } : undefined}
        secondaryAction={v.secondaryActionLabel ? { label: v.secondaryActionLabel, onClick: noop } : undefined}
      />
    ),
    presets: [
      { label: 'No actions',   values: { icon: 'Inbox',     title: 'Aucun dossier',  description: 'Crée ton premier dossier pour commencer.', primaryActionLabel: '',          secondaryActionLabel: '' } },
      { label: 'With actions', values: { icon: 'FileText',  title: 'Aucune pièce',   description: "Importe une pièce pour démarrer l'analyse.", primaryActionLabel: 'Importer', secondaryActionLabel: 'En savoir plus' } },
    ],
  },

  PromptSuggestionCard: {
    description: 'Cold-start prompt card used in the chat sidebar empty state.',
    controls: {
      icon:     { type: 'icon',    default: 'Sparkles',              description: 'Icon shown in the 36px square.' },
      label:    { type: 'text',    default: 'Résume ce dossier',     description: 'Suggestion text.' },
      pinHover: { type: 'boolean', default: false,                   description: 'Force the hover visuals (specimens only).' },
      disabled: { type: 'boolean', default: false,                   description: 'Disabled state.' },
    },
    render: v => (
      <PromptSuggestionCard
        icon={ICON_OPTIONS[v.icon]}
        label={v.label}
        pinHover={v.pinHover}
        disabled={v.disabled}
        onClick={noop}
      />
    ),
    presets: [
      { label: 'Default',        values: { icon: 'Sparkles',   label: 'Résume ce dossier',  pinHover: false, disabled: false } },
      { label: 'Hover (pinned)', values: { icon: 'Calculator', label: 'Calcule la PGPF',     pinHover: true,  disabled: false } },
      { label: 'Disabled',       values: { icon: 'BookOpen',   label: 'Cherche une décision', pinHover: false, disabled: true  } },
    ],
  },

  SuggestionsMenu: {
    description: "Compact popover menu — header bar + icon+label rows.",
    controls: {
      header:       { type: 'text',    default: "Suggestions d'actions", description: 'Mono uppercase header.' },
      itemCount:    { type: 'select',  default: '4', options: ['1', '2', '3', '4', '5'], description: 'Number of items to show.' },
      disabled:     { type: 'boolean', default: false,                   description: 'Disable all rows.' },
    },
    render: v => {
      const allItems = [
        { icon: Sparkles,   label: 'Résume ce dossier' },
        { icon: Calculator, label: 'Calcule la PGPF' },
        { icon: BookOpen,   label: 'Cherche une décision' },
        { icon: Search,     label: "Rechercher dans l'expertise" },
        { icon: FileText,   label: 'Génère une note de synthèse' },
      ];
      return (
        <div style={{ width: 280 }}>
          <SuggestionsMenu
            header={v.header}
            disabled={v.disabled}
            items={allItems.slice(0, parseInt(v.itemCount, 10))}
          />
        </div>
      );
    },
  },

  JPPill: {
    description: 'Inline JP citation. Four variants share the same height + baseline so they flow inside running prose. **`ref`** = `[saved?] n° ↗` (bare reference identifier — pair with textual citation in prose: "Cass. 2e civ., 12 décembre 2019, n° [pill]"). **`xs`** = `[saved?] jurisdiction · n°` (standalone inline citation). **`sm`** = `[saved?] jurisdiction · date · n° · poste · quantum` (dense result lists). **`quantum`** = `[saved?] n° · poste · quantum` (focus on the saved JP value). Chamber is always hidden — it lives on the JPRow card. Bookmark icon (in `#b9703f`) appears when the JP is `saved`. Hover = orange ring (`#b9703f`). Selected = orange tint + ring (drawer-open).',
    controls: {
      variant:      { type: 'select',  default: 'ref',         options: ['ref', 'quantum', 'acte', 'xs', 'sm'], description: 'Context + density. **Chat**: `ref` (n° + icon), `quantum` (n° + poste·value + icon). **Acte**: `acte` (juridiction · date · n°, no icon). Legacy: `xs`, `sm`.' },
      jurisdiction: { type: 'text',    default: 'CA Paris',    description: 'Court / jurisdiction (e.g. "CA Paris", "Cass. 2e civ.", "TJ Versailles"). Hidden in `ref` and `quantum`.' },
      date:         { type: 'text',    default: '2024-09-12',  description: 'ISO date — rendered short (dd/mm/yy) in `sm` only.' },
      numero:       { type: 'text',    default: '22/01234',    description: 'N° pourvoi / RG — the citable identifier (always shown).' },
      poste:        { type: 'text',    default: 'PGPF',        description: 'Poste tag shown in `sm` and `quantum`.' },
      amount:       { type: 'text',    default: '12 450 €',    description: 'Quantum value shown in `sm` and `quantum` (accent color `#b9703f`).' },
      saved:        { type: 'boolean', default: false,         description: 'Prepend the bookmark icon — signals the JP is saved at poste or org scope.' },
      isSelected:   { type: 'boolean', default: false,         description: 'Selected state — orange tint + ring (drawer-open).' },
    },
    render: v => (
      <JPPill
        variant={v.variant}
        decision={{
          ...sampleDecision,
          jurisdiction: v.jurisdiction,
          date: v.date,
          numero: v.numero,
          amounts: [{ poste: v.poste, displayValue: v.amount }],
        }}
        saved={v.saved}
        isSelected={v.isSelected}
      />
    ),
    presets: [
      // Two real contexts. Use the variant select to add quantum (`quantum`)
      // and toggle `saved` / `isSelected` directly. Override values via the
      // text inputs.
      { label: 'Chat',  values: { variant: 'ref',  jurisdiction: 'Cass. 2e civ.', date: '2019-12-12', numero: '18-22.727', poste: 'PGPF', amount: '12 450 €', saved: false } },
      { label: 'Acte',  values: { variant: 'acte', jurisdiction: 'CA Paris',      date: '2024-09-12', numero: '22/01234',  poste: 'PGPF', amount: '12 450 €', saved: false } },
    ],
  },

  JPRow: {
    description: 'Unit row primitive. Wrap inside JPListingChat (mini-table) or use directly with `asCard` inside JPListingPosteDetail (floating cards). Two save states: ⭐ favorited (firm canon) + 🔖 bookmarked (this poste).',
    controls: {
      jurisdiction: { type: 'text',    default: 'CA Paris',          description: 'Court / jurisdiction.' },
      chambre:      { type: 'text',    default: '2e ch. civile',     description: 'Chamber.' },
      numero:       { type: 'text',    default: '22/01234',          description: 'N° pourvoi / RG.' },
      poste:        { type: 'text',    default: 'PGPF',              description: 'Poste tag.' },
      amount:       { type: 'text',    default: '12 450 €',          description: 'Quantum value.' },
      showAmount:   { type: 'boolean', default: true,                description: 'Show the date + amount right columns.' },
      favorited:    { type: 'boolean', default: false,               description: '⭐ In firm JP de référence (workspace scope).' },
      bookmarked:   { type: 'boolean', default: false,               description: '🔖 Attached to this poste on this matter.' },
      isSelected:   { type: 'boolean', default: false,               description: 'Selected (drawer-open) state.' },
      asCard:       { type: 'boolean', default: false,               description: 'Standalone card chrome (border + radius + shadow).' },
    },
    render: v => (
      <JPRow
        decision={{
          ...sampleDecision,
          jurisdiction: v.jurisdiction,
          chambre: v.chambre,
          numero: v.numero,
          amounts: [{ poste: v.poste, displayValue: v.amount }],
        }}
        showAmount={v.showAmount}
        favorited={v.favorited}
        bookmarked={v.bookmarked}
        isSelected={v.isSelected}
        asCard={v.asCard}
      />
    ),
    presets: [
      { label: 'Default',         values: { favorited: false, bookmarked: false } },
      { label: 'Favorited',       values: { favorited: true,  bookmarked: false } },
      { label: 'Bookmarked',      values: { favorited: false, bookmarked: true  } },
      { label: 'Both',            values: { favorited: true,  bookmarked: true  } },
      { label: 'No amount',       values: { showAmount: false } },
      { label: 'As card',         values: { asCard: true } },
    ],
  },

  ReasoningStepper: {
    description: "Rendu des étapes d'outils du backend : streaming (liste live) ou terminé (en-tête repliable, rangées groupées et colorées par type). Câblé sur des steps d'exemple.",
    controls: {
      status:   { type: 'select',  default: 'done', options: ['streaming', 'done'], description: 'Live (streaming) vs terminé.' },
      expanded: { type: 'boolean', default: true, description: 'Déplié (mode terminé).' },
    },
    render: (v) => (
      <div style={{ width: 560 }}>
        <ReasoningStepperReal
          status={v.status}
          expanded={v.expanded}
          onToggle={noop}
          summary="Analyse de 8 documents et chiffrage de 3 postes"
          steps={sampleReasoningSteps}
        />
      </div>
    ),
    presets: [
      { label: 'Terminé (déplié)', values: { status: 'done', expanded: true } },
      { label: 'Terminé (replié)', values: { status: 'done', expanded: false } },
      { label: 'En streaming',     values: { status: 'streaming', expanded: true } },
    ],
  },

  // ========================================================================
  // Missing primitives — using inline preview implementations from previews.jsx
  // (Phase A sketches — to be promoted to real components in src/components/ui/
  // during Phase B once Figma references are validated.)
  // ========================================================================
  Button: {
    description: 'Le Button canonique (src/components/ui/Button.js), établi depuis le set Figma - 9 variants, 8 tailles (dont icon-only), état Loading.',
    controls: {
      // Apparence
      variant:      { group: 'Apparence', type: 'select',  default: 'primary', options: ['primary', 'secondary', 'ghost', 'outline', 'destructive', 'link', 'warning-link', 'success-link', 'neutral-link'], description: 'Type visuel (Figma Type).' },
      size:         { group: 'Apparence', type: 'select',  default: 'md',      options: ['xs', 'sm', 'md', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'], description: 'Taille (icon-* = carré icône seule).' },
      // Contenu
      label:        { group: 'Contenu',   type: 'text',    default: 'Action',  description: 'Libellé du bouton.' },
      icon:         { group: 'Contenu',   type: 'icon',    default: 'Plus',    description: 'Icône optionnelle.' },
      iconPosition: { group: 'Contenu',   type: 'select',  default: 'leading', options: ['leading', 'trailing', 'none'], description: 'Position de l’icône.' },
      // État
      loading:      { group: 'État',      type: 'boolean', default: false,     description: 'Chargement (spinner, clics coupés).' },
      disabled:     { group: 'État',      type: 'boolean', default: false,     description: 'Désactivé.' },
      fullWidth:    { group: 'État',      type: 'boolean', default: false,     description: 'Pleine largeur.' },
    },
    render: v => (
      <ButtonReal
        variant={v.variant}
        size={v.size}
        icon={v.iconPosition === 'none' ? undefined : ICON_OPTIONS[v.icon]}
        iconPosition={v.iconPosition === 'none' ? 'leading' : v.iconPosition}
        label={v.label}
        loading={v.loading}
        disabled={v.disabled}
        fullWidth={v.fullWidth}
      />
    ),
    presets: [
      { label: 'Primary',     values: { variant: 'primary',     label: 'Save',     iconPosition: 'none', size: 'md', loading: false } },
      { label: 'Secondary',   values: { variant: 'secondary',   label: 'Filter',   icon: 'Filter', iconPosition: 'leading' } },
      { label: 'Outline',     values: { variant: 'outline',     label: 'Cancel',   iconPosition: 'none' } },
      { label: 'Ghost',       values: { variant: 'ghost',       label: 'Skip',     iconPosition: 'none' } },
      { label: 'Destructive', values: { variant: 'destructive', label: 'Delete',   icon: 'Trash2', iconPosition: 'leading', size: 'md', loading: false } },
      { label: 'Link',        values: { variant: 'link',        label: 'Voir le détail', iconPosition: 'none', size: 'md', loading: false } },
      { label: 'Icon only',   values: { variant: 'outline',     icon: 'Plus', iconPosition: 'leading', size: 'icon', loading: false } },
      { label: 'Loading',     values: { variant: 'primary',     label: 'Enregistrement…', iconPosition: 'leading', size: 'md', loading: true } },
    ],
  },

  NavItem: {
    description: "La ligne du rail de navigation (src/components/shell/NavItem.js), Figma 37441:55015 - 4 variantes (destination / recent / create / see-all), états défaut/hover/actif. Actif = fond cream + bord + liseré orange + icône brand. Ré-exportée par AppSidebar.",
    controls: {
      variant:   { group: 'Apparence', type: 'select',  default: 'destination', options: ['destination', 'recent', 'create', 'see-all'], description: 'Variante (Figma Kind).' },
      label:     { group: 'Contenu',   type: 'text',    default: 'Mes dossiers', description: 'Libellé.' },
      icon:      { group: 'Contenu',   type: 'icon',    default: 'FileText', description: 'Icône de tête (destination / recent / create).' },
      trail:     { group: 'Contenu',   type: 'text',    default: '', description: 'Réf. dossier (variante recent → 2e ligne).' },
      active:    { group: 'État',      type: 'boolean', default: false, description: 'Actif (destination / recent).' },
    },
    render: v => <NavItemDemo {...v} />,
    presets: [
      { label: 'Destination active', values: { variant: 'destination', label: 'Mes dossiers', icon: 'FileText', active: true, trail: '' } },
      { label: 'Récent + trail',     values: { variant: 'recent', label: 'Préavis - fin de contrat', icon: 'Inbox', trail: 'Martel / AXA', active: false } },
      { label: 'Create',             values: { variant: 'create', label: 'Nouveau dossier', icon: 'Plus', active: false, trail: '' } },
      { label: 'See all',            values: { variant: 'see-all', label: 'Voir tout', active: false, trail: '' } },
    ],
  },

  NavSectionHeader: {
    description: "L'en-tête de section du rail (src/components/shell/NavSectionHeader.js), Figma 37457:4903 - mono 11 uppercase + point brand, action « + » optionnelle. Posé par SidebarGroup.",
    controls: {
      label:      { group: 'Contenu', type: 'text',    default: 'Dossiers récents', description: 'Titre (rendu mono uppercase).' },
      withAction: { group: 'Contenu', type: 'boolean', default: true, description: "Bouton « + » de création à droite." },
      actionLabel:{ group: 'Contenu', type: 'text',    default: 'Nouveau', description: "Libellé de l'action." },
    },
    render: v => (
      <div style={{ width: 250, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: 8 }}>
        <NavSectionHeader label={v.label} action={v.withAction ? { label: v.actionLabel, onClick: noop } : null} />
      </div>
    ),
    presets: [
      { label: 'Avec action', values: { label: 'Dossiers récents', withAction: true, actionLabel: 'Nouveau' } },
      { label: 'Titre seul',  values: { label: 'Conv. récentes', withAction: false, actionLabel: 'Nouveau' } },
    ],
  },

  TopBar: {
    description: "Le chrome de barre de tête canonique (src/components/ui/TopBar.js), Figma « Navigation / Top bar » 37443:5796 - bande h-48 fond background, filet bas, padding 12 (nav ouverte) / 16 (masquée), gap 10, hairlines border-strong. Nav masquée : la bande rend ELLE-MÊME NavExpandControl + hairline (prop navCollapsed). Onglets pleine hauteur, soulignement 2px sur le filet bas.",
    controls: {
      navCollapsed: { group: 'État',   type: 'boolean', default: false, description: 'Nav masquée → contrôle « Menu » + hairline rendus par la bande.' },
      dossier:      { group: 'Contenu', type: 'text',    default: 'Martin c/ Axa', description: 'Nom serif du dossier.' },
      withTools:    { group: 'Contenu', type: 'boolean', default: true, description: 'Cluster d\'outils à droite (Plato Assistant).' },
    },
    render: v => (
      <div style={{ width: 900, maxWidth: '100%', background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <TopBarReal
          navCollapsed={v.navCollapsed}
          onNavExpand={noop} onNavHome={noop} onNavPeekEnter={noop} onNavPeekLeave={noop}
          left={(
            <>
              <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
                <span className="flex items-center gap-1.5 pl-1.5 text-[12px] leading-4" style={{ color: colors.semantic.mutedForeground, letterSpacing: '0.12px' }}>
                  <FolderOpen style={{ width: 14, height: 14 }} strokeWidth={1.75} /> Dossiers
                </span>
                <TopBarHairline />
                <span style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 16, lineHeight: '20px', color: colors.semantic.foregroundStrong, letterSpacing: '-0.5px' }}>{v.dossier}</span>
              </div>
              <TopBarHairline />
              <div className="flex items-stretch gap-4 min-w-0">
                <DossierTab label="Informations" active onClick={noop} />
                <DossierTab label="Chiffrage" onClick={noop} />
                <DossierTab label="Pièces" count={12} onClick={noop} />
                <DossierTab label="Actes" onClick={noop} />
                <DossierTab label="JP" onClick={noop} />
              </div>
            </>
          )}
          right={v.withTools ? <PlatoAssistantButtonReal onClick={noop} /> : null}
        />
      </div>
    ),
    presets: [
      { label: 'Nav ouverte', values: { navCollapsed: false, dossier: 'Martin c/ Axa', withTools: true } },
      { label: 'Nav masquée', values: { navCollapsed: true,  dossier: 'Martin c/ Axa', withTools: true } },
    ],
  },

  NavExpandControl: {
    description: "Le contrôle « Menu » de réouverture du rail (src/components/shell/NavExpandControl.js), Figma 37443:5724 - visible quand la nav est masquée : logo + glyphe panel + peek au survol.",
    render: () => (
      <div style={{ background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: 12, display: 'inline-block' }}>
        <NavExpandControlReal onExpand={noop} onHome={noop} onPeekEnter={noop} onPeekLeave={noop} />
      </div>
    ),
  },

  NavPromoBanner: {
    description: "Le bandeau promo contextuel du rail (src/components/shell/NavPromoBanner.js), Figma 37471:1271 - dégradé info-blue, edge top (sous header) ou bottom (pied).",
    controls: {
      label: { group: 'Contenu', type: 'text',   default: 'Connectez votre boîte mail', description: 'Libellé.' },
      icon:  { group: 'Contenu', type: 'icon',   default: 'Mail', description: 'Icône de tête.' },
      edge:  { group: 'Apparence', type: 'select', default: 'top', options: ['top', 'bottom'], description: 'Filet bas (top) ou haut (bottom).' },
    },
    render: v => (
      <div style={{ width: 250, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <NavPromoBannerReal icon={ICON_OPTIONS[v.icon]} label={v.label} edge={v.edge} onClick={noop} />
      </div>
    ),
    presets: [
      { label: 'Mail (top)',      values: { label: 'Connectez votre boîte mail', icon: 'Mail', edge: 'top' } },
      { label: 'Parrainage (bottom)', values: { label: '-10% à chaque parrainage', icon: 'Heart', edge: 'bottom' } },
    ],
  },

  PlatoAssistantButton: {
    description: "Le CTA d'ouverture de l'assistant Plato (src/components/shell/PlatoAssistantButton.js), Figma 37444:5885 - pilule blanche, Sparkle IA, halo brand + anneau à comète.",
    render: () => (
      <div style={{ background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, padding: 24, display: 'inline-block' }}>
        <PlatoAssistantButtonReal onClick={noop} />
      </div>
    ),
  },

  Niveau3Strip: {
    description: "La barre de contexte niveau 3 (src/components/shell/Niveau3Strip.js), Figma « Navigation / Context bar » 37447:5922 - bande fond background, filet bas, padding 16. Cinq kinds par page/onglet : Poste (retour + badge + titre serif 20 | montant serif + action), Actes (titre | Nouvel acte), Acte (retour + titre | actions), Documents (recherche | actions), JP (titre | Rechercher). Composée des briques BreadcrumbReturn / StripTitle / StripAmount / CodeBadge / SiblingNav / StripDivider.",
    controls: {
      kind: { group: 'Contenu', type: 'select', default: 'poste', options: ['poste', 'actes', 'acte', 'jp'], description: 'Le kind du nœud Figma (anatomie par page/onglet).' },
    },
    render: v => {
      const frame = (children) => (
        <div style={{ width: 760, maxWidth: '100%', border: `1px solid ${colors.semantic.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {children}
        </div>
      );
      if (v.kind === 'poste') {
        return frame(
          <Niveau3StripReal justify="between" back={<BreadcrumbReturn label="Retour au chiffrage" onClick={noop} />}>
            <div className="flex items-center gap-2.5 min-w-0">
              <CodeBadge>DFP</CodeBadge>
              <StripTitle>Déficit fonctionnel permanent</StripTitle>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SiblingNav index={2} total={9} onPrev={noop} onNext={noop} />
              <StripAmount>38 900 €</StripAmount>
              <StripDivider tall />
              <ButtonReal variant="primary" size="sm" icon={Edit} label="Copier chiffrage" onClick={noop} />
            </div>
          </Niveau3StripReal>
        );
      }
      if (v.kind === 'actes') {
        return frame(
          <Niveau3StripReal justify="between">
            <StripTitle>3 actes</StripTitle>
            <ButtonReal variant="primary" size="sm" icon={PencilLine} label="Nouvel acte" onClick={noop} />
          </Niveau3StripReal>
        );
      }
      if (v.kind === 'acte') {
        return frame(
          <Niveau3StripReal justify="between" back={<BreadcrumbReturn label="Retour aux actes" onClick={noop} />}>
            <StripTitle>Assignation au fond</StripTitle>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SiblingNav index={0} total={3} onPrev={noop} onNext={noop} />
              <ButtonReal variant="primary" size="sm" label="Télécharger" onClick={noop} />
            </div>
          </Niveau3StripReal>
        );
      }
      return frame(
        <Niveau3StripReal justify="between">
          <StripTitle>Jurisprudences retenues</StripTitle>
          <ButtonReal variant="primary" size="sm" icon={Search} label="Rechercher" onClick={noop} />
        </Niveau3StripReal>
      );
    },
    presets: [
      { label: 'Poste',     values: { kind: 'poste' } },
      { label: 'Actes',     values: { kind: 'actes' } },
      { label: 'Acte',      values: { kind: 'acte' } },
      { label: 'JP',        values: { kind: 'jp' } },
    ],
  },

  SettingsSidebar: {
    description: "Le rail des Paramètres (src/components/shell/SettingsSidebar.js), Figma 36641:50716 - dans les réglages, ce sous-rail REMPLACE la nav org (il EST la nav). Groupes « Votre compte » / « Organisation ». Composé sur AppSidebar.",
    render: () => (
      <div style={{ height: 460, width: 264, border: `1px solid ${colors.semantic.borderStrong}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}>
        <SettingsSidebarReal />
      </div>
    ),
  },

  SidebarUserInfo: {
    description: "Le pied « profil » du rail (src/components/shell/SidebarUserInfo.js), Figma 36097:37493 - avatar + prénom + cabinet + chevrons ; collapsed = avatar + tooltip. Menu déroulant en slot.",
    controls: {
      name:      { group: 'Contenu', type: 'text',    default: 'Meghan', description: 'Prénom.' },
      org:       { group: 'Contenu', type: 'text',    default: 'Cabinet Hexa', description: 'Cabinet / organisation.' },
      collapsed: { group: 'État',    type: 'boolean', default: false, description: 'Réduit (avatar seul + tooltip).' },
    },
    render: v => {
      const avatar = (
        <span className="rounded-full flex-shrink-0 flex items-center justify-center" style={{ width: v.collapsed ? 32 : 24, height: v.collapsed ? 32 : 24, background: colors.avatar[0].bg, color: colors.avatar[0].fill, fontSize: 12, fontWeight: 600 }}>
          {(v.name || 'M').slice(0, 1).toUpperCase()}
        </span>
      );
      return (
        <div style={{ width: v.collapsed ? 76 : 250, background: colors.semantic.background, border: `1px solid ${colors.semantic.border}`, borderRadius: 10 }}>
          <SidebarUserInfoReal name={v.name} org={v.org} collapsed={v.collapsed} avatar={avatar} onClick={noop} />
        </div>
      );
    },
  },

  PageHeader: {
    description: "L'en-tête de page canonique (src/components/ui/PageHeader.js), Figma 37511:1436 - titre serif (display-sm) + action primaire + onglets à compteurs. Compose Button + Badge. Distinct de TopBar (chrome fixe) et Niveau3Strip (contexte niveau 3).",
    controls: {
      type:        { group: 'Apparence', type: 'select', default: 'Dossiers', options: ['Dossiers', 'Conversations'], description: 'Type Figma (Dossiers = onglets à compteurs, Conversations = sans onglets).' },
      title:       { group: 'Contenu',   type: 'text',   default: 'Mes dossiers', description: 'Titre serif (display-sm).' },
      actionLabel: { group: 'Contenu',   type: 'text',   default: 'Nouveau dossier', description: "Libellé de l'action primaire (Button)." },
    },
    render: v => <PageHeaderDemo {...v} />,
    presets: [
      { label: 'Dossiers',      values: { type: 'Dossiers',      title: 'Mes dossiers',      actionLabel: 'Nouveau dossier' } },
      { label: 'Conversations', values: { type: 'Conversations', title: 'Mes conversations', actionLabel: 'Nouvelle conversation' } },
    ],
  },

  SourceBadge: {
    description: 'Pill interactive de source (src/components/ui/SourceBadge.js) - 10 types, identité icône + teinte. JPPill est un SourceBadge type jp.',
    controls: {
      // Identité
      type:     { group: 'Identité', type: 'select',  default: 'piece', options: ['piece', 'jp', 'loi', 'code', 'modele', 'email', 'web', 'ligne', 'pass', 'assiette'], description: 'Type de source (icône + teinte).' },
      size:     { group: 'Identité', type: 'select',  default: 'sm', options: ['sm', 'md'], description: 'Taille.' },
      // Contenu
      label:    { group: 'Contenu',  type: 'text',    default: "Pièce n°12 - Rapport d'expertise", description: 'Libellé.' },
      showIcon: { group: 'Contenu',  type: 'boolean', default: true, description: "Afficher l'icône d'identité." },
      // État
      selected: { group: 'État',     type: 'boolean', default: false, description: 'Source ouverte (bord appuyé).' },
    },
    render: v => (
      <SourceBadgeReal type={v.type} size={v.size} selected={v.selected} showIcon={v.showIcon} label={v.label} onClick={() => {}} />
    ),
    presets: [
      { label: 'Pièce',  values: { type: 'piece', label: "Pièce n°12 - Rapport d'expertise", selected: false } },
      { label: 'JP',     values: { type: 'jp',    label: 'Cass. 2e civ. · n° 18-24.377', selected: false } },
      { label: 'Loi',    values: { type: 'loi',   label: 'Art. L242-1 CSS', selected: false } },
      { label: 'Email',  values: { type: 'email', label: 'RE: pièces manquantes', selected: false } },
      { label: 'Sélectionné', values: { type: 'piece', selected: true } },
    ],
  },

  AppSidebar: {
    description: "Le shell de nav canonique, monté sur l'EXEMPLE du proto Plato. Trois états (App Shell doctrine 4127:30731) : ouverte (rail en flux), masquée (rien ne subsiste - juste le contrôle « Menu »), peek (rail en overlay). PAS de rail d'icônes réduit (mode Reduced = legacy, abandonné).",
    controls: {
      // État du rail
      state:       { group: 'Rail',    type: 'select',  default: 'ouverte', options: ['ouverte', 'masquee', 'peek'], description: 'État du rail. Entrer dans un dossier bascule auto en masquée.' },
      active:      { group: 'Rail',    type: 'select',  default: 'dossiers', options: ['home', 'dossiers', 'conversations', 'settings'], description: 'Destination active (liseré orange).' },
      // Header
      chip:        { group: 'Header',  type: 'text',    default: '', description: 'Chip du header (vide = aucun, comme le proto).' },
      // Groupes
      withRecents: { group: 'Groupes', type: 'boolean', default: true, description: 'Sections récentes (Dossiers récents, Conv. récentes).' },
      withFooter:  { group: 'Groupes', type: 'boolean', default: true, description: 'Pied profil (SidebarUserInfo).' },
    },
    render: (v) => <ShellPreview {...v} />,
    presets: [
      { label: 'Ouverte',  values: { state: 'ouverte', withRecents: true, withFooter: true, chip: '', active: 'dossiers' } },
      { label: 'Masquée (auto en dossier)', values: { state: 'masquee', withRecents: true, withFooter: true, chip: '', active: 'dossiers' } },
      { label: 'Peek',     values: { state: 'peek', withRecents: true, withFooter: true, chip: '', active: 'dossiers' } },
    ],
  },

  Input: {
    description: 'Field component — label + helper + slot. The slot defaults to a text input but can hold any input shape (Select, Combobox, Textarea, custom). Source: src/components/ui/Input.js · Figma node 33541:69574.',
    controls: {
      label:          { type: 'text',    default: 'Label',                                                                       description: 'Field label.' },
      helperText:     { type: 'text',    default: 'Info. manquante pour calculer',                                              description: 'Helper / description text.' },
      layout:         { type: 'select',  default: 'vertical',  options: ['vertical', 'horizontal'],                              description: 'Field layout.' },
      helperPosition: { type: 'select',  default: 'below',     options: ['below', 'between'],                                    description: 'Helper position (vertical only). below = under the input. between = between label and input.' },
      placeholder:    { type: 'text',    default: 'Placeholder text',                                                            description: 'Placeholder for the default text input.' },
      value:          { type: 'text',    default: '',                                                                            description: 'Current value (default text input only).' },
      error:          { type: 'boolean', default: false,                                                                         description: 'Error state — colors the label.' },
      warning:        { type: 'boolean', default: false,                                                                         description: 'Warning state — colors the label and helper.' },
      aiGenerated:    { type: 'boolean', default: false,                                                                         description: 'Show the AI sparkle icon next to the label.' },
      disabled:       { type: 'boolean', default: false,                                                                         description: 'Disable the default text input.' },
    },
    render: v => (
      <div style={{ width: 320 }}>
        <P.Input
          label={v.label || undefined}
          helperText={v.helperText || undefined}
          layout={v.layout}
          helperPosition={v.helperPosition}
          error={v.error}
          warning={v.warning}
          aiGenerated={v.aiGenerated}
          placeholder={v.placeholder}
          value={v.value}
          onChange={() => {}}
          disabled={v.disabled}
        />
      </div>
    ),
    presets: [
      { label: 'Default · helper below',   values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Helper between',           values: { layout: 'vertical', helperPosition: 'between', error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Horizontal',               values: { layout: 'horizontal', error: false, warning: false, label: 'Label', helperText: 'Info. manquante pour…' } },
      { label: 'Error',                    values: { layout: 'vertical', helperPosition: 'below',   error: true,  warning: false, label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'Warning',                  values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: true,  label: 'Label', helperText: 'Info. manquante pour calculer' } },
      { label: 'AI generated',             values: { layout: 'vertical', helperPosition: 'below',   error: false, warning: false, aiGenerated: true, label: 'Montant suggéré', helperText: 'Inféré depuis l\'expertise' } },
    ],
  },

  Textarea: {
    description: 'Multi-line text input.',
    controls: {
      label:       { type: 'text',    default: 'Notes',                                  description: 'Label.' },
      placeholder: { type: 'text',    default: 'Add internal notes about this dossier…', description: 'Placeholder.' },
      value:       { type: 'text',    default: '',                                       description: 'Current value.' },
      rows:        { type: 'select',  default: '4', options: ['2', '4', '6', '8'],       description: 'Visible rows.' },
      error:       { type: 'boolean', default: false,                                    description: 'Error state.' },
      disabled:    { type: 'boolean', default: false,                                    description: 'Disabled.' },
    },
    render: v => (
      <P.Textarea
        label={v.label || undefined}
        placeholder={v.placeholder}
        value={v.value}
        rows={parseInt(v.rows, 10)}
        error={v.error}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Badge: {
    description: 'Inline status / tag badge. Three modes: label, number (pill), and icon-only (pill). Source: src/components/ui/Badge.js · Figma node 136:1178 (Plato---System).',
    controls: {
      mode:          { type: 'select',  default: 'label',   options: ['label', 'number', 'icon-only'],            description: 'Badge mode. label = text with optional icons. number = pill with count. icon-only = pill with one icon.' },
      label:         { type: 'text',    default: 'Label',                                                          description: 'Badge text (label mode).' },
      count:         { type: 'text',    default: '8',                                                              description: 'Count (number mode). > 99 renders as "99+".' },
      icon:          { type: 'icon',    default: 'Sparkles',                                                       description: 'Icon for label-mode left/right and icon-only mode.' },
      hasLeftIcon:   { type: 'boolean', default: false,                                                            description: 'Show the leading icon (label mode).' },
      hasRightIcon:  { type: 'boolean', default: false,                                                            description: 'Show the trailing icon (label mode).' },
      variant:       { type: 'select',  default: 'default', options: ['default', 'secondary', 'outline', 'destructive', 'ai', 'success', 'info', 'warning', 'accent'], description: 'Color variant.' },
      size:          { type: 'select',  default: 'sm',      options: ['sm', 'md'],                                 description: 'Size.' },
    },
    render: v => {
      const Icon = ICON_OPTIONS[v.icon];
      if (v.mode === 'icon-only') {
        return <P.Badge variant={v.variant} size={v.size} icon={Icon} iconOnly />;
      }
      if (v.mode === 'number') {
        const n = parseInt(v.count, 10);
        return <P.Badge variant={v.variant} size={v.size} count={Number.isFinite(n) ? n : v.count} />;
      }
      return (
        <P.Badge
          variant={v.variant}
          size={v.size}
          leftIcon={v.hasLeftIcon ? Icon : undefined}
          rightIcon={v.hasRightIcon ? Icon : undefined}
          label={v.label}
        />
      );
    },
    presets: [
      { label: 'Label · default',   values: { mode: 'label',     variant: 'default',     label: 'Label' } },
      { label: 'Label · success',   values: { mode: 'label',     variant: 'success',     label: 'Validated' } },
      { label: 'Label · warning',   values: { mode: 'label',     variant: 'warning',     label: 'À revoir' } },
      { label: 'Label + icon · AI', values: { mode: 'label',     variant: 'ai',          label: 'AI',  hasLeftIcon: true,  icon: 'Sparkles' } },
      { label: 'Label · outline',   values: { mode: 'label',     variant: 'outline',     label: 'Tag' } },
      { label: 'Number · default',  values: { mode: 'number',    variant: 'default',     count: '8' } },
      { label: 'Number · 99+',      values: { mode: 'number',    variant: 'destructive', count: '124' } },
      { label: 'Icon-only · AI',    values: { mode: 'icon-only', variant: 'ai',          icon: 'Sparkles' } },
    ],
  },

  Checkbox: {
    description: 'Single checkbox with optional label.',
    controls: {
      label:    { type: 'text',    default: 'I agree to the terms', description: 'Optional label.' },
      checked:  { type: 'boolean', default: false,                  description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Checkbox
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  Switch: {
    description: 'Boolean toggle switch with optional label.',
    controls: {
      label:    { type: 'text',    default: 'Enable notifications', description: 'Optional label.' },
      checked:  { type: 'boolean', default: true,                   description: 'Checked state.' },
      disabled: { type: 'boolean', default: false,                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Switch
        checked={v.checked}
        label={v.label || undefined}
        disabled={v.disabled}
        onChange={() => {}}
      />
    ),
  },

  RadioGroup: {
    description: 'Vertical stack of mutually exclusive radio options.',
    controls: {
      value: { type: 'select', default: 'monthly', options: ['monthly', 'yearly', 'enterprise'], description: 'Selected option value.' },
    },
    render: v => (
      <P.RadioGroup
        value={v.value}
        options={[
          { value: 'monthly',    label: 'Monthly billing' },
          { value: 'yearly',     label: 'Yearly billing (save 20%)' },
          { value: 'enterprise', label: 'Enterprise' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Tooltip: {
    description: 'Tooltip — hover the trigger to reveal.',
    controls: {
      content: { type: 'text',    default: 'Apply changes to the dossier',          description: 'Tooltip text.' },
      side:    { type: 'select',  default: 'top', options: ['top', 'bottom', 'left', 'right'], description: 'Position relative to trigger.' },
    },
    render: v => (
      <P.Tooltip content={v.content} side={v.side}>
        <P.Button variant="outline" label="Hover me" />
      </P.Tooltip>
    ),
  },

  Avatar: {
    description: 'Initials-only or image-backed circular/square avatar.',
    controls: {
      initials: { type: 'text',    default: 'MR',                                                description: 'Initials shown when no image.' },
      size:     { type: 'select',  default: 'md',  options: ['sm', 'md', 'lg', 'xl'],            description: 'Size.' },
      color:    { type: 'select',  default: 'cream', options: ['green', 'blue', 'plum', 'orange', 'rose', 'cream'], description: 'Background color from VI palette.' },
      shape:    { type: 'select',  default: 'circle', options: ['circle', 'rounded'],            description: 'Shape.' },
    },
    render: v => <P.Avatar initials={v.initials} size={v.size} color={v.color} shape={v.shape} />,
  },

  Separator: {
    description: 'Visual divider — horizontal, vertical, or labelled.',
    controls: {
      orientation: { type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'], description: 'Direction.' },
      label:       { type: 'text',   default: '',                                                description: 'Optional centre label (horizontal only).' },
    },
    render: v => (
      <div style={{ width: v.orientation === 'horizontal' ? 280 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: v.orientation === 'vertical' ? 60 : 'auto' }}>
        <P.Separator orientation={v.orientation} label={v.orientation === 'horizontal' ? (v.label || undefined) : undefined} />
      </div>
    ),
  },

  Skeleton: {
    description: 'Shimmering placeholder for loading states.',
    controls: {
      width:  { type: 'text',    default: '240px',         description: 'Bar width (CSS length).' },
      height: { type: 'text',    default: '14',            description: 'Bar height in px.' },
      count:  { type: 'select',  default: '3', options: ['1', '2', '3', '4'], description: 'Number of bars.' },
    },
    render: v => (
      <P.Skeleton width={v.width} height={parseInt(v.height, 10)} count={parseInt(v.count, 10)} />
    ),
  },

  Tabs: {
    description: 'Tabbed navigation. Underline (default) or pill style.',
    controls: {
      value:   { type: 'select', default: 'overview', options: ['overview', 'pieces', 'chronologie'], description: 'Active tab.' },
      variant: { type: 'select', default: 'underline', options: ['underline', 'pills'],               description: 'Visual variant.' },
    },
    render: v => (
      <P.Tabs
        value={v.value}
        variant={v.variant}
        options={[
          { value: 'overview',    label: 'Overview' },
          { value: 'pieces',      label: 'Pièces' },
          { value: 'chronologie', label: 'Chronologie' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Select: {
    description: 'Custom dropdown selector. Click to open the option list.',
    controls: {
      value:       { type: 'select', default: 'paris', options: ['paris', 'lyon', 'bordeaux', 'lille'], description: 'Selected value.' },
      placeholder: { type: 'text',   default: 'Select a court…',                                       description: 'Placeholder when nothing is selected.' },
      disabled:    { type: 'boolean', default: false,                                                  description: 'Disabled state.' },
    },
    render: v => (
      <P.Select
        value={v.value}
        placeholder={v.placeholder}
        disabled={v.disabled}
        options={[
          { value: 'paris',    label: 'CA Paris' },
          { value: 'lyon',     label: 'CA Lyon' },
          { value: 'bordeaux', label: 'CA Bordeaux' },
          { value: 'lille',    label: 'CA Lille' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Combobox: {
    description: 'Searchable selector — type to filter options.',
    controls: {
      placeholder: { type: 'text', default: 'Search a poste…', description: 'Placeholder text.' },
    },
    render: v => (
      <P.Combobox
        placeholder={v.placeholder}
        options={[
          { value: 'pgpf',  label: 'PGPF — Pertes de gains professionnels futurs' },
          { value: 'dfpa',  label: 'DFPA — Déficit fonctionnel permanent' },
          { value: 'sff',   label: 'SFF — Souffrances endurées' },
          { value: 'prej_e',label: 'Préjudice esthétique permanent' },
          { value: 'pgpa',  label: 'PGPA — Pertes de gains professionnels actuels' },
        ]}
        onChange={() => {}}
      />
    ),
  },

  Dropdown: {
    description: 'Context menu / action dropdown. Click the trigger to open.',
    controls: {
      triggerLabel: { type: 'text', default: 'Actions', description: 'Trigger button label.' },
    },
    render: v => (
      <P.Popover
        anchor={<P.Button variant="outline" label={v.triggerLabel} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
          {[
            { icon: Edit,   label: 'Renommer' },
            { icon: Eye,    label: 'Voir détails' },
            { icon: Trash2, label: 'Supprimer' },
          ].map((it, i) => (
            <button
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                fontSize: 14, color: '#292524',
                background: 'transparent', border: 'none', textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <it.icon style={{ width: 14, height: 14, color: '#44403c' }} strokeWidth={1.75} />
              {it.label}
            </button>
          ))}
        </div>
      </P.Popover>
    ),
  },

  Popover: {
    description: 'Anchored popover — click the trigger to open.',
    controls: {
      side:  { type: 'select', default: 'bottom', options: ['top', 'bottom'],          description: 'Side relative to trigger.' },
      align: { type: 'select', default: 'start',  options: ['start', 'center', 'end'], description: 'Alignment along the side.' },
    },
    render: v => (
      <P.Popover
        side={v.side}
        align={v.align}
        anchor={<P.Button variant="outline" label="Open popover" />}
      >
        <div style={{ fontSize: 13, color: '#292524', maxWidth: 220 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Quick actions</strong>
          <p style={{ margin: 0, color: '#78716c' }}>Anchored to the trigger. Click outside to dismiss.</p>
        </div>
      </P.Popover>
    ),
  },

  Dialog: {
    description: "Modale de CONTENU (formulaire, liste, texte) : scrim token overlay, surface surface-raised, ombre 4xl, header serif + description, body défilant, footer d'actions. Figma 2759:16962 · fiche Dialog.md. Confirmation destructive -> AlertDialog ; panneau latéral -> Drawer (a-dessiner).",
    controls: {
      title:       { type: 'text',   default: 'Nouveau dossier',   description: 'Titre serif du header.' },
      description: { type: 'text',   default: 'Renseignez les informations du dossier.', description: 'Description sous le titre.' },
      width:       { type: 'select', default: '480', options: ['380', '480', '640'], description: 'Largeur du panneau.' },
    },
    render: v => (
      <DialogTrigger title={v.title} description={v.description} width={parseInt(v.width, 10)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <P.Input label="Nom" placeholder="Martel / AXA" />
          <P.Input label="Référence" placeholder="00001" />
        </div>
      </DialogTrigger>
    ),
  },

  Drawer: {
    description: 'Generic side-mounted drawer. Same primitive as Sheet — semantic alias.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left'], description: 'Side.' },
      title: { type: 'text',   default: 'Drawer',                            description: 'Header.' },
      width: { type: 'select', default: '360', options: ['280', '360', '480'], description: 'Width.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} width={parseInt(v.width, 10)} />,
  },

  Sheet: {
    description: 'Side / bottom sheet for secondary content.',
    controls: {
      side:  { type: 'select', default: 'right', options: ['right', 'left', 'bottom', 'top'], description: 'Side.' },
      title: { type: 'text',   default: 'Sheet',                                              description: 'Header.' },
    },
    render: v => <SheetTrigger side={v.side} title={v.title} />,
  },

  Sidebar: {
    description: 'Vertical navigation list with active state and optional badge counts.',
    controls: {
      active: { type: 'select', default: 'dossiers', options: ['dossiers', 'jurisprudence', 'redaction', 'settings'], description: 'Active item.' },
      header: { type: 'text',   default: 'Workspace',                                                                  description: 'Optional header.' },
    },
    render: v => (
      <P.Sidebar
        header={v.header}
        active={v.active}
        items={[
          { id: 'dossiers',     label: 'Dossiers',      icon: FileText, badge: 12 },
          { id: 'jurisprudence',label: 'Jurisprudence', icon: BookOpen },
          { id: 'redaction',    label: 'Rédaction',     icon: Edit },
          { id: 'settings',     label: 'Paramètres',    icon: Settings },
        ]}
        onChange={() => {}}
      />
    ),
  },

  ScrollArea: {
    description: 'Bordered scrollable area.',
    controls: {
      height: { type: 'select', default: '160', options: ['120', '160', '240', '320'], description: 'Height in px.' },
    },
    render: v => (
      <P.ScrollArea height={parseInt(v.height, 10)} width={320}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ fontSize: 13, color: '#292524', padding: '6px 8px', borderRadius: 6, background: i % 2 ? '#fafaf9' : 'transparent' }}>
              Row {i + 1} — sample content for scroll area
            </div>
          ))}
        </div>
      </P.ScrollArea>
    ),
  },

  DropZone: {
    description: "Drop Doc (Figma 35747:41445) — contexte panel / inline / empty × état default / hover / drop / extraction. Survol et drag natifs ; l'état forcé sert au screenshot.",
    controls: {
      context: { type: 'select', default: 'panel', options: ['panel', 'inline', 'empty'], description: 'Contexte Figma (empty = tables-empty).' },
      state:   { type: 'select', default: 'auto',  options: ['auto', 'default', 'hover', 'drop', 'extraction'], description: 'État forcé (auto = survol/drag réels ; extraction : contexte empty).' },
    },
    render: v => (
      <DropZoneReal
        context={v.context}
        state={v.state === 'auto' ? undefined : v.state}
        description={v.context === 'empty' ? 'Phrase descriptive si besoin' : undefined}
        suggestions={v.context === 'empty' ? ['Bulletins de salaire', "Relevés d'indemnités journalières", 'Autre document ?'] : undefined}
        action={v.context === 'empty' ? { icon: PencilLine, label: 'Saisir manuellement' } : undefined}
        progress={40}
        progressLabel="5/10 documents - Extraction en cours"
        onFiles={() => {}}
        onClick={() => {}}
      />
    ),
  },

  // NB : les tables shadcn (Table / TableHeader / TableRow / TableCell) ont été
  // retirées du DS. Les tables de Plato sont CUSTOM (système DataTableCell +
  // DataTableHeader + rangées métier, Figma « ComponentTable » 36554:7670) et
  // ne dérivent pas du <table> de shadcn. Cf. docs/table-system.md.
  // DataTableCell (la fondation) est construite ; DataTableHeader + rangées
  // métier restent à faire.

  DataTableCell: {
    description: 'Cellule typée atomique — la SEULE brique de toute rangée de table Plato (div-based, pas <table> shadcn). Une prop `type` sélectionne un des ~30 rôles métier (texte, montant, entité, opérateur de calcul, bande de section). Compose IVAvatar / Badge / SourceBadge. Figma 36554:5657 · fiche DataTableCell.md.',
    controls: {
      type:        { type: 'select', default: 'AmountRegular', options: DATA_TABLE_CELL_TYPES, description: 'Rôle métier de la cellule.' },
      text:        { type: 'text',    default: '',  description: 'Contenu principal (montant, libellé, nom, valeur de badge). Vide = exemple du type.' },
      subtext:     { type: 'text',    default: '',  description: 'Ligne secondaire (email, fichier, lien, montant barré, raison).' },
      title:       { type: 'text',    default: '',  description: 'SectionBandeau : titre (ce que la section produit).' },
      description: { type: 'text',    default: '',  description: 'SectionBandeau : description grise (sans chiffre).' },
      ruleName:    { type: 'text',    default: '',  description: 'Rule / TextComposed : nom rédigé de la règle.' },
      ruleState:   { type: 'text',    default: '',  description: 'Rule / TextComposed : état en mots (sans chiffre).' },
      sourceLabel: { type: 'text',    default: '',  description: 'Rule / TextComposed : un renvoi (SourceBadge).' },
    },
    render: v => <DataTableCellDemo {...v} />,
    presets: [
      { label: 'Montant',    values: { type: 'AmountRegular',  text: '24,12 €',  subtext: '', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Négatif',    values: { type: 'NegativeAmount', text: '-100 €',   subtext: '', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Résultat',   values: { type: 'AmountResult',   text: '14 769 €', subtext: '', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Qualificatif', values: { type: 'AmountQualificatif', text: 'Non soumise', subtext: '1 878 €', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Calcul (=)', values: { type: 'OperatorEqualResult', text: '', subtext: '', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'IV',         values: { type: 'IV',    text: 'Nom victime indirecte', subtext: '(Lien)', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'User',       values: { type: 'User',  text: 'Username', subtext: 'email@emailplato.com', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Text + doc', values: { type: 'Text',  text: 'Analyse biologiques', subtext: 'Factures_Analyses-biologiques_Labo.pdf', title: '', description: '', ruleName: '', ruleState: '', sourceLabel: '' } },
      { label: 'Composé',    values: { type: 'TextComposed', text: 'Réduction sur heures supplémentaires', subtext: '', title: '', description: '', ruleName: 'Réduction salariale sur heures supplémentaires', ruleState: 'appliquée au taux maximum', sourceLabel: 'Art. L. 241-17 CSS' } },
      { label: 'Règle',      values: { type: 'Rule',  text: '', subtext: '', title: '', description: '', ruleName: 'Plafond commun des indemnités de rupture', ruleState: 'plafond déjà entamé', sourceLabel: 'BOSS 2025' } },
      { label: 'Section',    values: { type: 'SectionBandeau', text: '', subtext: '', title: 'Base soumise à cotisations', description: 'Les montants demandés, et le sort de chacun', ruleName: '', ruleState: '', sourceLabel: '' } },
    ],
  },

  ChatComposerNotice: {
    description: "Bandeau d'état au-dessus du composer : analyzing (Plato réfléchit) · quota-warning (jauge d'usage hebdo) · quota-full. Code-first (pas de nœud Figma) - fiche ChatComposerNotice.md.",
    controls: {
      variant: { type: 'select', default: 'analyzing', options: ['analyzing', 'quota-warning', 'quota-full'], description: 'État affiché.' },
      pct:     { type: 'select', default: '82', options: ['60', '82', '95', '100'], description: "Pourcentage d'usage (variants quota)." },
    },
    render: v => (
      <div style={{ width: 560 }}>
        <ChatComposerNoticeReal variant={v.variant} pct={parseInt(v.pct, 10)} onOpenUsage={noop} onRequestUpgrade={noop} />
      </div>
    ),
    presets: [
      { label: 'Analyzing',     values: { variant: 'analyzing',     pct: '82' } },
      { label: 'Quota warning', values: { variant: 'quota-warning', pct: '82' } },
      { label: 'Quota full',    values: { variant: 'quota-full',    pct: '100' } },
    ],
  },

  ParallelTasks: {
    description: "Pile groupée de sous-agents simultanés : ligne compacte (N tâches en cours) qui s'ouvre en panneau ou inline, chaque tâche enveloppant un ReasoningStepper. Code-first - fiche ParallelTasks.md.",
    controls: {
      variant:     { type: 'select',  default: 'inline', options: ['inline', 'panel'], description: 'Dépliage inline sous la ligne, ou panneau flottant.' },
      defaultOpen: { type: 'boolean', default: true,     description: 'Ouvert au rendu.' },
      withError:   { type: 'boolean', default: false,    description: 'Une tâche en erreur.' },
    },
    render: v => (
      <div style={{ width: 480 }}>
        <ParallelTasksReal
          variant={v.variant}
          defaultOpen={v.defaultOpen}
          tasks={[
            { id: 't1', label: 'Analyse du rapport d\'expertise', status: 'done',    steps: [], summary: 'AIPP 8 %, consolidation 15/01/2024' },
            { id: 't2', label: 'Recherche de jurisprudences',     status: 'loading', steps: [] },
            { id: 't3', label: 'Chiffrage DFT',                   status: v.withError ? 'error' : 'loading', steps: [], summary: v.withError ? 'Taux journalier manquant' : undefined },
          ]}
          onClear={noop}
        />
      </div>
    ),
    presets: [
      { label: 'Inline ouvert', values: { variant: 'inline', defaultOpen: true,  withError: false } },
      { label: 'Ligne fermée',  values: { variant: 'inline', defaultOpen: false, withError: false } },
      { label: 'Avec erreur',   values: { variant: 'inline', defaultOpen: true,  withError: true } },
    ],
  },

  BordereauTable: {
    description: "Table métier « bordereau de pièces » - instance réelle du système de tables custom (Figma Row Bordereau, ComponentTable 36554:7670). Arborescence dossiers/pièces, tri, sélection multiple (barre d'actions inversée), menus contextuels. Démo interactive sur données locales. Migrera vers les familles ui/tables/. Fiche BordereauTable.md.",
    controls: {},
    render: () => <BordereauTableDemo />,
  },

  DomainTableRows: {
    description: "Les familles de rangées métier du système de tables Plato (Figma « ComponentTable » 36554:7670 - tout y est), portées pixel-perfect : un fichier par famille dans src/components/ui/tables/, composées UNIQUEMENT d'instances DataTableCell / DataTableHeader. Chaque famille est montrée en assemblage complet (header + rangées + états). Serif RL Para sur les montants de titres, Inter sur les lignes. Fiche DomainTableRows.md.",
    controls: {
      famille: {
        type: 'select', default: 'documents',
        options: ['documents', 'dossiers', 'extraction', 'bordereau', 'dsa-act-dft', 'iv-tp', 'chiffrage', 'pgp', 'totaux', 'heures', 'cotisations'],
        description: 'Famille de rangées (assemblage complet).',
      },
    },
    render: v => <DomainTableRowsDemo famille={v.famille} />,
    presets: [
      { label: 'Documents',    values: { famille: 'documents' } },
      { label: 'Bordereau',    values: { famille: 'bordereau' } },
      { label: 'Chiffrage',    values: { famille: 'chiffrage' } },
      { label: 'PGP',          values: { famille: 'pgp' } },
      { label: 'Totaux',       values: { famille: 'totaux' } },
      { label: 'Heures',       values: { famille: 'heures' } },
      { label: 'Cotisations',  values: { famille: 'cotisations' } },
    ],
  },

  Kbd: {
    description: "Touche clavier (h20, Inter medium 12, radius 6) + KbdGroup (suite de touches, séparateur « + » optionnel). Variants default / reversed (sur fond sombre). Figma 29794:42330 · fiche Kbd.md.",
    controls: {
      mode:      { type: 'select',  default: 'single', options: ['single', 'group', 'group-separated'], description: 'Touche seule ou groupe.' },
      label:     { type: 'text',    default: '⌘',      description: 'Libellé (mode single).' },
      variant:   { type: 'select',  default: 'default', options: ['default', 'reversed'], description: 'reversed = sur fond sombre.' },
    },
    render: v => {
      const inner = v.mode === 'single'
        ? <KbdReal variant={v.variant} label={v.label} />
        : <KbdGroup variant={v.variant} keys={v.mode === 'group-separated' ? ['Ctrl', 'Opt', 'F'] : ['⌘', 'K']} separated={v.mode === 'group-separated'} />;
      if (v.variant !== 'reversed') return inner;
      return <div style={{ background: colors.semantic.foreground, padding: 12, borderRadius: 8 }}>{inner}</div>;
    },
    presets: [
      { label: 'Touche',      values: { mode: 'single', label: '⌘', variant: 'default' } },
      { label: '⌘K',          values: { mode: 'group', label: '', variant: 'default' } },
      { label: 'Ctrl+Opt+F',  values: { mode: 'group-separated', label: '', variant: 'default' } },
      { label: 'Reversed',    values: { mode: 'single', label: 'Entrée', variant: 'reversed' } },
    ],
  },

  Spinner: {
    description: "Indicateur de chargement (Loader2 animé, 5 tailles 12-32, couleur par token, role=status). Même mécanique que Button loading. Figma 33609:22857 · fiche Spinner.md.",
    controls: {
      size:  { type: 'select', default: 'sm', options: ['xs', 'sm', 'md', 'lg', 'xl'], description: 'Taille (12 / 16 / 20 / 24 / 32).' },
      tone:  { type: 'select', default: 'foreground', options: ['foreground', 'muted', 'info', 'ai', 'success'], description: 'Teinte (tokens).' },
      label: { type: 'text',   default: '', description: 'Libellé aria (invisible).' },
    },
    render: v => {
      const tones = { foreground: colors.semantic.foreground, muted: colors.semantic.mutedForeground, info: colors.feedback.info.base, ai: colors.feedback.ai.base, success: colors.feedback.success.base };
      return <SpinnerReal size={v.size} color={tones[v.tone]} label={v.label || undefined} />;
    },
    presets: [
      { label: 'Défaut', values: { size: 'sm', tone: 'foreground', label: '' } },
      { label: 'XL',     values: { size: 'xl', tone: 'foreground', label: '' } },
      { label: 'Info',   values: { size: 'md', tone: 'info', label: 'Analyse en cours' } },
    ],
  },

  Progress: {
    description: "Barre de progression déterminée (piste h8 secondary radius full, remplissage primary, transition base). Figma 2819:29134 · fiche Progress.md.",
    controls: {
      value: { type: 'select',  default: '40', options: ['0', '25', '40', '70', '100'], description: 'Valeur (0-100).' },
      fluid: { type: 'boolean', default: false, description: "Largeur 100 % (sinon 400px Figma)." },
      label: { type: 'text',    default: '',   description: 'Libellé aria.' },
    },
    render: v => (
      <div style={{ width: v.fluid ? 420 : 'auto' }}>
        <ProgressReal value={parseInt(v.value, 10)} width={v.fluid ? '100%' : 400} label={v.label || undefined} />
      </div>
    ),
    presets: [
      { label: '40 %',  values: { value: '40',  fluid: false, label: '' } },
      { label: '70 %',  values: { value: '70',  fluid: true,  label: 'Import des pièces' } },
      { label: '100 %', values: { value: '100', fluid: false, label: '' } },
    ],
  },

  Stepper: {
    description: "Stepper horizontal canonique des parcours en étapes (header de modale multi-étapes, wizards) : cercle 24 numéroté mono, connecteur 40px, états done/active/upcoming. Figma 4226:63220 · fiche Stepper.md.",
    controls: {
      current:   { type: 'select',  default: '1', options: ['0', '1', '2'], description: 'Étape active (index).' },
      clickable: { type: 'boolean', default: false, description: 'Retour arrière cliquable (onStepClick).' },
    },
    render: v => (
      <StepperReal
        steps={[{ label: 'Nom du dossier' }, { label: 'Pièces client' }, { label: 'Pièces adverses' }]}
        current={parseInt(v.current, 10)}
        onStepClick={v.clickable ? () => {} : undefined}
      />
    ),
    presets: [
      { label: 'Début',    values: { current: '0', clickable: false } },
      { label: 'En cours', values: { current: '1', clickable: true } },
      { label: 'Fin',      values: { current: '2', clickable: true } },
    ],
  },

  ButtonGroup: {
    description: "Groupe de boutons accolés (compose Button : radius externes 8, filets internes 1px, orientations horizontal/vertical). Variants primary / outline / secondary. Figma 28685:126219 · fiche ButtonGroup.md.",
    controls: {
      variant:     { type: 'select', default: 'outline', options: ['primary', 'outline', 'secondary'], description: 'Variant imposé aux boutons.' },
      orientation: { type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'], description: 'Sens du groupe.' },
      shape:       { type: 'select', default: 'segmented', options: ['segmented', 'split'], description: 'segmented = 3 libellés · split = action + chevron.' },
    },
    render: v => (
      <ButtonGroupReal variant={v.variant} orientation={v.orientation} ariaLabel="Démo">
        {v.shape === 'split'
          ? [<ButtonReal key="a" label="Enregistrer" />, <ButtonReal key="b" size="icon" icon={ChevronDown} title="Options" />]
          : [<ButtonReal key="j" label="Jour" />, <ButtonReal key="s" label="Semaine" />, <ButtonReal key="m" label="Mois" />]}
      </ButtonGroupReal>
    ),
    presets: [
      { label: 'Segmenté outline', values: { variant: 'outline',   orientation: 'horizontal', shape: 'segmented' } },
      { label: 'Split primary',    values: { variant: 'primary',   orientation: 'horizontal', shape: 'split' } },
      { label: 'Vertical',         values: { variant: 'secondary', orientation: 'vertical',   shape: 'segmented' } },
    ],
  },

  Item: {
    description: "Rangée générique de liste (slots icon/media/title/description/actions, variants default/outline, tailles md/sm, cliquable) + ItemGroup. Figma 32847:5869 · fiche Item.md.",
    controls: {
      variant:     { type: 'select',  default: 'default', options: ['default', 'outline'], description: 'Bord visible ou non.' },
      size:        { type: 'select',  default: 'md', options: ['md', 'sm'], description: 'Densité.' },
      title:       { type: 'text',    default: 'Boîte connectée', description: 'Titre.' },
      description: { type: 'text',    default: 'Synchronisation active', description: 'Description.' },
      withIcon:    { type: 'boolean', default: true,  description: 'Slot icône (boîte cadrée 16px).' },
      withActions: { type: 'boolean', default: true,  description: 'Slot actions (Button outline).' },
      clickable:   { type: 'boolean', default: false, description: 'onClick (hover accent).' },
    },
    render: v => (
      <div style={{ width: 480 }}>
        <ItemReal
          variant={v.variant}
          size={v.size}
          title={v.title}
          description={v.description}
          icon={v.withIcon ? BadgeCheck : undefined}
          actions={v.withActions ? <ButtonReal variant="outline" size="sm" label="Gérer" onClick={noop} /> : undefined}
          onClick={v.clickable ? noop : undefined}
        />
      </div>
    ),
    presets: [
      { label: 'Avec actions',  values: { variant: 'default', size: 'md', title: 'Boîte connectée', description: 'Synchronisation active', withIcon: true, withActions: true, clickable: false } },
      { label: 'Outline clic',  values: { variant: 'outline', size: 'md', title: 'Dossier Martin c/ SARL Dupont', description: '12 pièces importées', withIcon: false, withActions: false, clickable: true } },
      { label: 'Small',         values: { variant: 'default', size: 'sm', title: 'Camille Aubry', description: 'Vu il y a 2 h', withIcon: true, withActions: false, clickable: false } },
    ],
  },

  // Card retiré du DS : « on crée du custom à chaque fois » (décision steward).

  Alert: {
    description: "Alerte en flux (p16, icône 16 + titre + description + action-lien optionnelle, role=alert). Variants default / destructive / info / warning, teintes des familles feedback. Figma 2813:9373 · fiche Alert.md.",
    controls: {
      variant:     { type: 'select',  default: 'default', options: ['default', 'destructive', 'info', 'warning'], description: 'Teinte sémantique.' },
      title:       { type: 'text',    default: 'Titre', description: 'Titre.' },
      description: { type: 'text',    default: "Ceci est la description de l'alerte.", description: 'Description (vide = titre seul).' },
      actionLabel: { type: 'text',    default: '', description: "Action-lien (vide = pas d'action)." },
      hideIcon:    { type: 'boolean', default: false, description: "Sans icône." },
    },
    render: v => (
      <div style={{ width: 391 }}>
        <AlertReal
          variant={v.variant}
          title={v.title}
          description={v.description || undefined}
          actionLabel={v.actionLabel || undefined}
          onAction={v.actionLabel ? noop : undefined}
          hideIcon={v.hideIcon}
        />
      </div>
    ),
    presets: [
      { label: 'Default',     values: { variant: 'default',     title: 'Titre', description: "Ceci est la description de l'alerte.", actionLabel: '', hideIcon: false } },
      { label: 'Warning CTA', values: { variant: 'warning',     title: 'Boîte non connectée', description: 'Les pièces reçues par email ne sont pas importées.', actionLabel: 'Connecter la boîte', hideIcon: false } },
      { label: 'Destructive', values: { variant: 'destructive', title: 'Import impossible', description: 'Le bordereau contient des pièces en double.', actionLabel: '', hideIcon: false } },
      { label: 'Info',        values: { variant: 'info',        title: 'Synchronisation en cours', description: 'Les nouveaux messages arrivent dans quelques minutes.', actionLabel: '', hideIcon: false } },
    ],
  },

  InputGroup: {
    description: "Champ avec addons accolés (leading/trailing : texte, Kbd composé, coche, icônes) et rangées block pour textarea. États focus / error / warning / disabled / calculated. Se glisse dans le slot children d'Input (Field). Figma 27510:119942 · fiche InputGroup.md.",
    controls: {
      shape:    { type: 'select',  default: 'search', options: ['search', 'url', 'textarea'], description: 'Composition d\'exemple.' },
      state:    { type: 'select',  default: 'default', options: ['default', 'error', 'warning', 'disabled', 'calculated'], description: 'État.' },
    },
    render: v => {
      const stateProps = { error: v.state === 'error', warning: v.state === 'warning', disabled: v.state === 'disabled', calculated: v.state === 'calculated' };
      if (v.shape === 'url') {
        return (
          <div style={{ width: 320 }}>
            <InputGroupReal placeholder="plato.legal" leading={<InputGroupText>https://</InputGroupText>} trailing={<InputGroupCheck />} {...stateProps} />
          </div>
        );
      }
      if (v.shape === 'textarea') {
        return (
          <div style={{ width: 320 }}>
            <InputGroupReal type="textarea" placeholder="Décrire la demande…" blockEnd={{ left: <InputGroupText>0/280 caractères</InputGroupText>, right: <ButtonReal size="icon-xs" icon={ArrowUp} title="Envoyer" onClick={noop} /> }} {...stateProps} />
          </div>
        );
      }
      return (
        <div style={{ width: 320 }}>
          <InputGroupReal placeholder="Rechercher…" leading={<Search style={{ width: 16, height: 16, color: colors.semantic.mutedForeground }} strokeWidth={1.75} />} trailing={<InputGroupKbd>⌘K</InputGroupKbd>} {...stateProps} />
        </div>
      );
    },
    presets: [
      { label: 'Recherche ⌘K', values: { shape: 'search',   state: 'default' } },
      { label: 'URL + coche',  values: { shape: 'url',      state: 'default' } },
      { label: 'Textarea',     values: { shape: 'textarea', state: 'default' } },
      { label: 'Erreur',       values: { shape: 'search',   state: 'error' } },
    ],
  },

  Slider: {
    description: "Curseur (rail h6 secondary, plage primary, poignée 16 bordée primary) : simple ou range 2 poignées, drag pointeur + clavier complet, contrôlé/non contrôlé, onChangeCommitted. Figma 2819:30565 · fiche Slider.md.",
    controls: {
      range:    { type: 'boolean', default: false, description: 'Deux poignées (plage).' },
      step:     { type: 'select',  default: '1', options: ['1', '5', '10'], description: 'Pas.' },
      disabled: { type: 'boolean', default: false, description: 'Désactivé.' },
    },
    render: v => (
      <div style={{ width: 280, padding: '12px 0' }}>
        <SliderReal
          key={`${v.range}-${v.step}`}
          range={v.range}
          defaultValue={v.range ? [25, 75] : 50}
          step={parseInt(v.step, 10)}
          disabled={v.disabled}
          ariaLabel="Valeur"
        />
      </div>
    ),
    presets: [
      { label: 'Simple',   values: { range: false, step: '1',  disabled: false } },
      { label: 'Plage',    values: { range: true,  step: '5',  disabled: false } },
      { label: 'Disabled', values: { range: false, step: '1',  disabled: true } },
    ],
  },

  Calendar: {
    description: "Calendrier de sélection de date (grille mensuelle FR lundi-premier, navigation mois, aujourd'hui marqué, jour sélectionné primary, jours hors-mois grisés, disabled(date)). Tailles 32 / 48 / custom-days 52 (sous-libellé par jour). SVG/Intl pur, zéro lib de dates. Figma 2819:19886 · fiche Calendar.md.",
    controls: {
      size:        { type: 'select',  default: 'default', options: ['default', 'large'], description: 'Taille des jours (32 / 48).' },
      weekendsOff: { type: 'boolean', default: false, description: 'disabled(date) sur les week-ends.' },
      withDetail:  { type: 'boolean', default: false, description: 'dayDetail : sous-libellé par jour (grille 52px).' },
    },
    render: v => <CalendarDemo size={v.size} weekendsOff={v.weekendsOff} withDetail={v.withDetail} />,
    presets: [
      { label: 'Simple',        values: { size: 'default', weekendsOff: false, withDetail: false } },
      { label: 'Week-ends off', values: { size: 'default', weekendsOff: true,  withDetail: false } },
      { label: 'Custom days',   values: { size: 'default', weekendsOff: false, withDetail: true } },
      { label: 'Large',         values: { size: 'large',   weekendsOff: false, withDetail: false } },
    ],
  },

  Chart: {
    description: "Graphes SVG pur maison sur la rampe colors.chart (5 bleus) : bar / bar-horizontal / bar-stacked / line / area / area-stacked / pie / donut, grille, légende, tooltip au survol, largeur fluide. Figma 2819:21571 · fiche Chart.md.",
    controls: {
      type:       { type: 'select',  default: 'bar', options: ['bar', 'bar-horizontal', 'bar-stacked', 'line', 'area', 'area-stacked', 'pie', 'donut'], description: 'Forme.' },
      showLegend: { type: 'boolean', default: false, description: 'Légende.' },
      showGrid:   { type: 'boolean', default: true,  description: 'Grille (5 filets).' },
      curved:     { type: 'boolean', default: true,  description: 'Courbes lissées (line / area).' },
    },
    render: v => {
      const multi = v.type === 'bar-stacked' || v.type === 'area-stacked';
      const parts = v.type === 'pie' || v.type === 'donut';
      return (
        <div style={{ width: 520 }}>
          <ChartReal
            type={v.type}
            data={parts ? CHART_DATA.parts : multi ? CHART_DATA.series : CHART_DATA.simple}
            series={multi ? ['Pièces', 'Conclusions'] : undefined}
            showLegend={v.showLegend || parts}
            showGrid={v.showGrid}
            curved={v.curved}
            unit={multi ? 'docs' : ''}
          />
        </div>
      );
    },
    presets: [
      { label: 'Barres',         values: { type: 'bar',          showLegend: false, showGrid: true,  curved: true } },
      { label: 'Aires empilées', values: { type: 'area-stacked', showLegend: true,  showGrid: true,  curved: true } },
      { label: 'Ligne',          values: { type: 'line',         showLegend: false, showGrid: true,  curved: true } },
      { label: 'Donut',          values: { type: 'donut',        showLegend: true,  showGrid: false, curved: true } },
    ],
  },

  DataTableHeader: {
    description: "Cellule d'en-tête de colonne des tables custom Plato (h40, mono 11 medium uppercase). Types : text · button (tri, arrow-up-down) · checkbox (tout sélectionner, largeur 36). Au repos : filet bas 1px ; au hover : filet masqué + fond crème éclaircie (voile blanc 50 % sur muted, rendu Figma exact). Figma 2768:27447 · fiche DataTableHeader.md.",
    controls: {
      type:       { type: 'select',  default: 'text', options: ['text', 'button', 'checkbox'], description: 'Type de cellule.' },
      label:      { type: 'text',    default: 'Dossier',                                       description: 'Libellé (text / button).' },
      rightAlign: { type: 'boolean', default: false,                                           description: 'Alignement droite (colonnes de montants).' },
      checked:    { type: 'boolean', default: false,                                           description: 'État de la checkbox.' },
      pinHover:   { type: 'boolean', default: false,                                           description: 'Force le visuel hover.' },
    },
    render: v => (
      <div style={{ background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, padding: '0 8px' }}>
        <DataTableHeaderReal type={v.type} label={v.label} rightAlign={v.rightAlign} checked={v.checked} pinHover={v.pinHover} onChange={noop} onClick={noop} />
      </div>
    ),
    presets: [
      { label: 'Text',            values: { type: 'text',     label: 'Dossier', rightAlign: false, checked: false, pinHover: false } },
      { label: 'Tri (button)',    values: { type: 'button',   label: 'Date',    rightAlign: false, checked: false, pinHover: false } },
      { label: 'Montant (droite)',values: { type: 'text',     label: 'Montant', rightAlign: true,  checked: false, pinHover: false } },
      { label: 'Checkbox cochée', values: { type: 'checkbox', label: '',        rightAlign: false, checked: true,  pinHover: false } },
      { label: 'Hover',           values: { type: 'text',     label: 'Dossier', rightAlign: false, checked: false, pinHover: true } },
    ],
  },

  IVAvatar: {
    description: "Avatar « pièce d'échecs » : conteneur teinté (radius 2), silhouette posée sur le bord bas. Set complet Figma 36533:7935 : 6 pièces × 6 palettes × tailles 16-40. Palettes mappées sur les familles feedback (success/info/ai/warning) + avatar plum + cream. Fiche IVAvatar.md.",
    controls: {
      type:  { type: 'select', default: 'knight', options: IV_PIECES,                    description: 'Pièce (identité de la personne).' },
      color: { type: 'select', default: 'green',  options: Object.keys(IV_PALETTES),     description: 'Palette (paires subtle/text des tokens).' },
      size:  { type: 'select', default: '32',     options: ['16', '20', '24', '28', '32', '40'], description: 'Taille px (échelle Figma).' },
    },
    render: v => <IVAvatarReal type={v.type} color={v.color} size={parseInt(v.size, 10)} />,
    presets: [
      { label: 'Knight green', values: { type: 'knight', color: 'green',  size: '32' } },
      { label: 'Queen blue',   values: { type: 'queen',  color: 'blue',   size: '32' } },
      { label: 'King purple',  values: { type: 'king',   color: 'purple', size: '40' } },
      { label: 'Pawn cream',   values: { type: 'pawn',   color: 'cream',  size: '24' } },
      { label: 'Rook orange',  values: { type: 'rook',   color: 'orange', size: '28' } },
    ],
  },

  RadioPricing: {
    description: "Carte-option radio (radio shadcn étendu) pour les choix de licence : toggle 16px + icône + libellé 14 medium + description 12 muted, carte bordée radius 12 padding 16. Sélectionnée : fond background + bord fort + ombre xs. Disabled : opacité 50 %. Figma 36915:6122 · fiche RadioPricing.md.",
    controls: {
      label:       { type: 'text',    default: 'Licence PRO',                    description: 'Libellé.' },
      description: { type: 'text',    default: 'Usage individuel - 1 poste',     description: 'Description (une ligne).' },
      selected:    { type: 'boolean', default: false,                            description: 'État sélectionné.' },
      disabled:    { type: 'boolean', default: false,                            description: 'État désactivé.' },
      pinHover:    { type: 'boolean', default: false,                            description: 'Force le visuel hover.' },
    },
    render: v => (
      <div style={{ width: 409 }}>
        <RadioPricingReal label={v.label} description={v.description} selected={v.selected} disabled={v.disabled} pinHover={v.pinHover} onSelect={noop} />
      </div>
    ),
    presets: [
      { label: 'Default',             values: { label: 'Licence PRO', description: 'Usage individuel - 1 poste',  selected: false, disabled: false, pinHover: false } },
      { label: 'Hover',               values: { label: 'Licence PRO', description: 'Usage individuel - 1 poste',  selected: false, disabled: false, pinHover: true } },
      { label: 'Sélectionnée',        values: { label: 'Licence MAX', description: 'Cabinet - postes illimités',  selected: true,  disabled: false, pinHover: false } },
      { label: 'Disabled sélection.', values: { label: 'Licence MAX', description: 'Cabinet - postes illimités',  selected: true,  disabled: true,  pinHover: false } },
    ],
  },

  JPListing: {
    description: "Carte JP canonique (Figma « JP Cards » 2219:19197, fichier Plato---Design) : en-tête juridiction/date/bookmark + profil + tags (Badge) + bloc « Apport de la décision » + pied n° + badges de postes. 4 contextes : detail (pied au survol) · dropdown (compacte + Ajouter) · added · tab (pied toujours visible). Fiche JPListing.md.",
    controls: {
      variant:  { type: 'select',  default: 'detail', options: ['detail', 'dropdown', 'added', 'tab'], description: 'Contexte produit.' },
      deceased: { type: 'boolean', default: false, description: 'Second tag en destructive (« Décédé »).' },
      withNote: { type: 'boolean', default: true,  description: "Bloc « Apport de la décision »." },
      saved:    { type: 'boolean', default: true,  description: 'Bookmark ochre d\'en-tête.' },
      pinHover: { type: 'boolean', default: false, description: 'Force le survol (montre le pied en detail/added).' },
    },
    render: v => (
      <div style={{ width: 620 }}>
        <JPListingReal
          variant={v.variant}
          saved={v.saved}
          pinHover={v.pinHover}
          tags={[{ label: 'Type fait générateur' }, v.deceased ? { label: 'Décédé', tone: 'destructive' } : { label: 'Survivant' }]}
          note={v.withNote ? "Au titre des dépenses de santé actuelles, la victime justifie des frais médicaux engagés suite à l'accident du 05/06/2022. Après déduction des remboursements, le reste à charge s'établit à 712,50 €." : undefined}
          onAdd={noop}
        />
      </div>
    ),
    presets: [
      { label: 'Détail poste',   values: { variant: 'detail',   deceased: false, withNote: true,  saved: true,  pinHover: false } },
      { label: 'Détail (hover)', values: { variant: 'detail',   deceased: false, withNote: true,  saved: true,  pinHover: true } },
      { label: 'Dropdown org',   values: { variant: 'dropdown', deceased: false, withNote: false, saved: false, pinHover: false } },
      { label: 'Onglet JP',      values: { variant: 'tab',      deceased: true,  withNote: true,  saved: true,  pinHover: false } },
    ],
  },

  StatusPillDS: {
    description: "Pill de statut du flux de validation du playground DS (pending / validated / needs-revision / missing). Code-first - pas de nœud Figma, le code et la fiche StatusPillDS.md font foi. Réservé à l'outillage DS : tout statut produit passe par Badge.",
    controls: {
      status: { type: 'select', default: 'pending', options: ['pending', 'validated', 'needs-revision', 'missing'], description: "Statut d'inventaire." },
    },
    render: v => <StatusPillReal status={v.status} />,
    presets: [
      { label: 'Pending',        values: { status: 'pending' } },
      { label: 'Validated',      values: { status: 'validated' } },
      { label: 'Needs revision', values: { status: 'needs-revision' } },
      { label: 'Missing',        values: { status: 'missing' } },
    ],
  },

  PreviewPanel: {
    description: "Panneau de préviz systématisé (V2 pixel-perfect Figma 37375:9358) : une coquille (header serif, corps, barre méta, rail citations) + corps/méta enfichés par kind. Un exemple JOUABLE par kind (piece / modele / jp / email / loi / ligne / web) ; l'état « Éditer la ligne » (sujet ligne de poste : doc = pièce attachée, rail d'édition à droite, Figma 37611:19401) est le kind « edit ». Le lab complet (drawer + grip) vit à /ui-kit/preview-panel. Fiche PreviewPanel.md.",
    controls: {
      kind: { type: 'select', default: 'piece', options: ['piece', 'modele', 'jp', 'email', 'loi', 'ligne', 'web', 'edit'], description: 'Kind de source ; « edit » = état d\'édition d\'une ligne de poste.' },
    },
    render: v => {
      // « edit » : sujet ligne de poste - le doc devient la pièce attachée et le
      // rail de droite édite les valeurs de la ligne (état « Éditer la ligne »).
      if (v.kind === 'edit') {
        const e = POSTE_LIGNES[0];
        return (
          <div style={{ width: '100%', maxWidth: 980 }}>
            <PreviewPanelReal kind="piece" source={e.piece} ligne={e.ligne} embedded onClose={noop} onOpenSource={noop} />
          </div>
        );
      }
      // `web` : pas de panneau interne - carte « lien externe » (comme le lab).
      if (v.kind === 'web') {
        return <div style={{ width: '100%', maxWidth: 980 }}><PreviewExternalCard source={PREVIEW_SAMPLES.web} /></div>;
      }
      // Pas de cadre ni de hauteur ici : le mode `embedded` porte déjà son
      // chrome (bord + arrondi) et ses hauteurs responsive (520-720px).
      return (
        <div style={{ width: '100%', maxWidth: 980 }}>
          <PreviewPanelReal kind={v.kind} source={PREVIEW_SAMPLES[v.kind]} embedded onClose={noop} onOpenSource={noop} />
        </div>
      );
    },
    presets: [
      { label: 'Pièce',  values: { kind: 'piece' } },
      { label: 'Modèle', values: { kind: 'modele' } },
      { label: 'Jurisprudence', values: { kind: 'jp' } },
      { label: 'Email', values: { kind: 'email' } },
      { label: 'Loi', values: { kind: 'loi' } },
      { label: 'Cotisation / relevé', values: { kind: 'ligne' } },
      { label: 'Lien web', values: { kind: 'web' } },
      { label: 'Éditer la ligne', values: { kind: 'edit' } },
    ],
  },

  KindIcon: {
    description: "La puce d'identité du Doc Preview (src/components/preview/PreviewAtoms.js), Figma 37375:9147 - icône 16 sur carré arrondi 6 (28px), accent par kind : piece / modele / email indigo · jp emerald · loi violet · ligne sand · web neutre.",
    controls: {
      kind: { type: 'select', default: 'piece', options: ['piece', 'jp', 'email', 'loi', 'modele', 'ligne', 'web'], description: 'Le kind (accent + fond subtle).' },
    },
    render: v => {
      const icons = { piece: FileText, jp: Scale, email: Mail, loi: BookOpen, modele: LayoutTemplate, ligne: Table, web: Globe };
      return <KindIconReal kind={v.kind} icon={icons[v.kind]} />;
    },
    presets: [
      { label: 'Pièce', values: { kind: 'piece' } },
      { label: 'JP',    values: { kind: 'jp' } },
      { label: 'Loi',   values: { kind: 'loi' } },
      { label: 'Ligne', values: { kind: 'ligne' } },
    ],
  },

  PanelHeader: {
    description: "La barre de titre du Doc Preview (PreviewAtoms.js), Figma 37375:8738 - h-56, puce KindIcon + titre serif 16 (-0.5) | nav ‹ i/N › · séparateur · actions (gap 7) · Fermer secondary. Variant small (kind PieceSmall 37613:19640) : icône nue + titre 14 medium + « Détail › ».",
    controls: {
      kind:  { type: 'select',  default: 'piece', options: ['piece', 'jp', 'email', 'loi', 'modele'], description: 'Kind (puce + accent).' },
      small: { type: 'boolean', default: false, description: 'Variant PieceSmall (sous-header de pièce).' },
      title: { type: 'text',    default: "Rapport d'expertise médicale Dr. Dubois", description: 'Titre.' },
    },
    render: v => {
      const icons = { piece: FileText, jp: Scale, email: Mail, loi: BookOpen, modele: LayoutTemplate };
      return (
        <div style={{ width: 760, maxWidth: '100%', border: `1px solid ${colors.semantic.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <PanelHeaderReal
            kind={v.kind}
            icon={icons[v.kind]}
            small={v.small}
            title={v.title}
            nav={{ index: 2, total: 17, onPrev: noop, onNext: noop }}
            onClose={noop}
            trailing={v.small ? <span className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground-secondary">Détail ›</span> : undefined}
            actions={(
              <>
                <button type="button" className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-foreground text-primary-foreground text-[14px] font-medium">
                  <Download style={{ width: 16, height: 16 }} strokeWidth={1.75} /> Télécharger
                </button>
                <button type="button" aria-label="Supprimer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-danger-subtle text-danger">
                  <Trash2 style={{ width: 16, height: 16 }} strokeWidth={1.75} />
                </button>
              </>
            )}
          />
        </div>
      );
    },
    presets: [
      { label: 'Pièce',      values: { kind: 'piece', small: false, title: "Rapport d'expertise médicale Dr. Dubois" } },
      { label: 'JP',         values: { kind: 'jp',    small: false, title: 'Cass. 2e civ., 12 sept. 2024, n° 22-14.532' } },
      { label: 'PieceSmall', values: { kind: 'piece', small: true,  title: 'Bulletin de paie juin 2022' } },
    ],
  },

  CiteRow: {
    description: "Une ligne du rail « Extraits cités » (PreviewAtoms.js), Figma 37375:8851 - pastille numéro + eyebrow PAGE mono 11 + extrait 2 lignes. États default / hover (réel) / active (dégradé cream→blanc, pastille foreground, liseré 2px).",
    controls: {
      active: { type: 'select', default: '1', options: ['1', '2', '3'], description: 'La citation active.' },
    },
    render: v => {
      const items = [
        { page: 2, text: 'La consolidation est fixée au 15 janvier 2024.' },
        { page: 4, text: 'AIPP retenue de 8 % au titre du déficit fonctionnel permanent.' },
        { page: 7, text: 'DFT total de 45 jours, DFT partiel classe II de 120 jours.' },
      ];
      const active = parseInt(v.active, 10) - 1;
      return (
        <div style={{ width: 450, background: colors.semantic.card, border: `1px solid ${colors.semantic.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {items.map((it, i) => (
            <div key={i} style={i > 0 ? { borderTop: `1px solid ${colors.semantic.borderSubtle}` } : undefined}>
              <CiteRowReal index={i} page={it.page} text={it.text} active={i === active} onClick={noop} />
            </div>
          ))}
        </div>
      );
    },
  },

  MetaChip: {
    description: "Chip de métadonnée du Doc Preview (PreviewAtoms.js), Figma 37375:9183 - h-28, icône 14 + label 12 muted + valeur 12 medium. 14 types canoniques (icône + libellé), variant strong (fond cream, chip d'identité), aside · ai ✦ · action lien.",
    controls: {
      type:   { type: 'select',  default: 'date', options: ['piece', 'date', 'type', 'decoupage', 'source', 'juridiction', 'numero', 'objet', 'messages', 'piecesJointes', 'code', 'enVigueur', 'periode', 'web'], description: 'Type canonique (icône + label).' },
      ai:     { type: 'boolean', default: false, description: 'Marqueur ✦ « généré par IA ».' },
      action: { type: 'boolean', default: false, description: "Lien d'action « Ajuster » à droite." },
    },
    render: v => {
      const samples = {
        piece: { value: 'I - MEDICAL · n° 2' }, date: { value: '15/03/2023' },
        type: { value: "Rapport d'expertise" }, decoupage: { aside: 'rapport_expertise.pdf' },
        source: { aside: 'Indemnisation dossier Martin' }, juridiction: { value: 'Cour de cassation, 2e civ.' },
        numero: { value: '18-21.234' }, objet: { value: 'Notification expertise' },
        messages: { value: '4' }, piecesJointes: { value: '3' }, code: { value: 'Code civil' },
        enVigueur: { value: '29/07/2026' }, periode: { value: 'Janv. - Mars 2024' }, web: { aside: 'legifrance.gouv.fr' },
      };
      const s = samples[v.type] || {};
      return (
        <MetaChipReal
          type={v.type}
          value={s.value}
          aside={s.aside}
          ai={v.ai}
          action={v.action ? { label: 'Ajuster', onClick: noop } : undefined}
        />
      );
    },
    presets: [
      { label: 'Date + IA',   values: { type: 'date', ai: true, action: false } },
      { label: 'Identité',    values: { type: 'piece', ai: false, action: false } },
      { label: 'Découpage',   values: { type: 'decoupage', ai: false, action: true } },
      { label: 'Juridiction', values: { type: 'juridiction', ai: false, action: false } },
    ],
  },

  AssistantComposer: {
    description: "Composer riche de l'assistant Plato (Figma « Chat Input » 1081:50926, fichier Plato---Design) : carte ring border-strong + shadows/xl, zone d'appel pb-32, toolbar 26px (Pièces / Modèles, ampoule), docs agrafés, bandeaux système. Pas de trombone : on lie des docs existants. Fiche AssistantComposer.md.",
    controls: {
      dossierLabel: { type: 'text',    default: 'Martin c/ AXA', description: 'Dossier rattaché (chip de scope). Vide = hors dossier.' },
      elevated:     { type: 'boolean', default: false,           description: 'Variante élevée (composer du rail dossier).' },
      placeholder:  { type: 'text',    default: 'Demander à Plato...', description: 'Placeholder.' },
    },
    render: v => (
      <div style={{ width: 640 }}>
        <AssistantComposerReal
          scope={v.dossierLabel ? 'dossier' : undefined}
          dossierLabel={v.dossierLabel || undefined}
          elevated={v.elevated}
          placeholder={v.placeholder}
          onSend={noop}
          suggestions={[
            { icon: Sparkles,   label: 'Résume ce dossier' },
            { icon: Calculator, label: 'Calcule la PGPF' },
            { icon: BookOpen,   label: 'Cherche une décision' },
          ]}
        />
      </div>
    ),
    presets: [
      { label: 'Dans un dossier', values: { dossierLabel: 'Martin c/ AXA', elevated: false, placeholder: 'Demander à Plato...' } },
      { label: 'Hors dossier',    values: { dossierLabel: '',              elevated: false, placeholder: 'Demander à Plato...' } },
      { label: 'Élevé (rail)',    values: { dossierLabel: 'Martin c/ AXA', elevated: true,  placeholder: 'Demander à Plato...' } },
    ],
  },

  PlanCard: {
    description: 'Pricing tier card. Featured variant inverts to dark.',
    controls: {
      name:        { type: 'text',    default: 'Studio',                                              description: 'Plan name.' },
      price:       { type: 'text',    default: '€39',                                                  description: 'Price.' },
      period:      { type: 'text',    default: '/mo',                                                  description: 'Period suffix.' },
      description: { type: 'text',    default: 'Unlimited dossiers + collaboration up to 5 members.', description: 'Tagline.' },
      featured:    { type: 'boolean', default: false,                                                  description: 'Featured (dark) variant.' },
    },
    render: v => (
      <P.PlanCard
        name={v.name}
        price={v.price}
        period={v.period}
        description={v.description}
        featured={v.featured}
        features={[
          'Unlimited dossiers',
          '5 team members',
          'AI assistance',
          'Priority support',
        ]}
        ctaLabel="Choose plan"
      />
    ),
  },

  ChatBubble: {
    description: 'Single chat message bubble — user (filled dark) or assistant (cream).',
    controls: {
      author:  { type: 'select', default: 'assistant', options: ['user', 'assistant'], description: 'Bubble author / alignment.' },
      content: { type: 'text',   default: "Voici un résumé du dossier en 3 points…",  description: 'Message text.' },
      timestamp: { type: 'text', default: '14:32',                                     description: 'Optional timestamp.' },
    },
    render: v => (
      <ChatBubbleWithAvatar author={v.author} content={v.content} timestamp={v.timestamp} />
    ),
  },

  ChatMessageList: {
    description: 'Scrollable list of ChatBubbles representing a conversation.',
    controls: {},
    render: () => (
      <P.ChatMessageList
        messages={[
          { author: 'user',      content: 'Résume ce dossier en 3 points.',                                              timestamp: '14:30' },
          { author: 'assistant', content: 'Voici les éléments saillants : (1) accident de la circulation — (2) hospitalisation 12 jours — (3) ITT 6 mois.', timestamp: '14:30' },
          { author: 'user',      content: 'Quelle est la PGPF probable ?',                                                timestamp: '14:32' },
          { author: 'assistant', content: 'Sous réserve de validation des justificatifs, je projette une PGPF de l\'ordre de 12 450 €.', timestamp: '14:33' },
        ]}
      />
    ),
  },

  // ChatComposer retiré du DS : le composer canonique est AssistantComposer.

  // ========================================================================
  // Domain components
  // ========================================================================
  JPListingChat: {
    description: 'Mini-table for chat results: card chrome + JURIDICTION · DATE · TAUX header + JPRow children. Use in chat ai-jp-cards rendering.',
    controls: {
      itemCount:  { type: 'select',  default: '4', options: ['1', '2', '4', '5'], description: 'Number of rows.' },
      showHeader: { type: 'boolean', default: true,                                description: 'Show the column header row.' },
    },
    render: v => {
      const samplePinned = ['jp-atpt-01', 'jp-atpt-03', 'jp-atpt-06', 'jp-atpt-02', 'jp-atpt-04'];
      const count = parseInt(v.itemCount, 10);
      return (
        <div style={{ width: 560 }}>
          <JPListingChat
            decisions={samplePinned.slice(0, count).map(getMockDecisionById).filter(Boolean)}
            showHeader={v.showHeader}
            getRowProps={() => ({ onClick: noop })}
          />
        </div>
      );
    },
    presets: [
      { label: '4 rows + header',  values: { itemCount: '4', showHeader: true } },
      { label: 'No header',        values: { itemCount: '4', showHeader: false } },
      { label: '1 row',            values: { itemCount: '1', showHeader: true } },
    ],
  },

  JPListingPosteDetail: {
    description: 'Section wrapper for PosteDetailView. Renders the "Jurisprudences retenues" section header + a stack of floating JPRow cards (each with its own border + shadow). No add button, no stats.',
    controls: {
      itemCount:     { type: 'select', default: '3', options: ['0', '1', '3', '5'], description: 'Number of pinned decisions. 0 shows the empty state.' },
      currentPosteId:{ type: 'text',   default: 'atpt',                              description: 'Poste used to pick the matching amount on each row.' },
    },
    render: v => {
      const samplePinned = [
        { decisionId: 'jp-atpt-01', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-03', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-06', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-02', posteIds: ['atpt'] },
        { decisionId: 'jp-atpt-04', posteIds: ['atpt'] },
      ];
      const count = parseInt(v.itemCount, 10);
      return (
        <div style={{ width: 560 }}>
          <JPListingPosteDetail
            pinnedJP={samplePinned.slice(0, count)}
            currentPosteId={v.currentPosteId}
            onOpenDrawer={noop}
            onSearchJP={noop}
          />
        </div>
      );
    },
    presets: [
      { label: 'Empty state',  values: { itemCount: '0', currentPosteId: 'atpt' } },
      { label: '3 cards',      values: { itemCount: '3', currentPosteId: 'atpt' } },
      { label: '5 cards',      values: { itemCount: '5', currentPosteId: 'atpt' } },
    ],
  },

  // ========================================================================
  // Domain components (JP / rédaction) — démos jouables sur données mock
  // ========================================================================
  JPPopoverCard: {
    description: "Fiche d'identité JP au survol d'un JPPill (popover). Rendu ici en statique (prop `inline`) pour le playground - en contexte, positionnée sous le JPPill.",
    render: () => (
      <div style={{ display: 'inline-block' }}>
        <JPPopoverCardReal inline decision={sampleDecision} onOpenDrawer={noop} />
      </div>
    ),
  },
  DecisionDrawer: {
    description: "Tiroir latéral pleine hauteur d'une décision JP. Rendu ici en `inline` pour le playground ; en contexte il s'ouvre à droite du chat avec fond assombri.",
    render: (v) => (
      <div style={{ width: 760, height: 560, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
        <DecisionDrawerReal
          inline
          decisionId={v.decisionId}
          resultSet={['jp-atpt-01', 'jp-dft-01', 'jp-pgpa-01']}
          resultIndex={0}
          isPinned={v.isPinned}
          posteOptions={samplePosteOptions}
          pinnedPosteIds={v.isPinned ? ['atpt'] : []}
          matterPinned={v.matterPinned}
          onClose={noop} onPrev={noop} onNext={noop}
          onPin={noop} onUnpin={noop} onAttachToPoste={noop}
          onToggleWorkspace={noop} onToggleMatter={noop} onSaveRationale={noop}
        />
      </div>
    ),
    controls: {
      decisionId: { type: 'select', options: ['jp-atpt-01', 'jp-dft-01', 'jp-pgpa-01'], default: 'jp-atpt-01' },
      isPinned: { type: 'boolean', default: false, description: 'Décision épinglée (poste ATPT).' },
      matterPinned: { type: 'boolean', default: false, description: 'Épinglée au dossier.' },
    },
    presets: [
      { label: 'ATPT', values: { decisionId: 'jp-atpt-01', isPinned: false, matterPinned: false } },
      { label: 'Épinglée', values: { decisionId: 'jp-atpt-01', isPinned: true, matterPinned: true } },
      { label: 'DFT', values: { decisionId: 'jp-dft-01', isPinned: false, matterPinned: false } },
    ],
  },
  JPAddStepper: {
    description: 'Modale multi-étapes pour ajouter une JP (recherche / lien / PDF) puis choisir les postes. Rendu inline dans le playground.',
    render: () => (
      <div style={{ width: 560 }}>
        <JPAddStepperReal
          posteOptions={samplePosteOptions}
          defaultPosteId="atpt"
          onClose={noop}
          onSubmit={noop}
        />
      </div>
    ),
  },
  SaveDestinationPopover: {
    description: "Popover « enregistrer vers » utilisé par DecisionDrawer (dossier / postes). Les toggles sont jouables.",
    render: () => <SaveDestinationPopoverDemo />,
  },
  SlashCommandPalette: {
    description: 'Palette de commandes déclenchée par « / » dans le composer. Tape dans le champ pour la filtrer.',
    render: () => <SlashCommandPaletteDemo />,
  },
  ActesList: {
    description: "Table des actes rédigés d'un dossier (acte / bordereau appariés). Câblée sur des actes d'exemple.",
    render: () => (
      <div style={{ width: 720 }}>
        <ActesListReal
          actes={sampleActes}
          onOpen={noop} onNewActe={noop} onNewBordereau={noop} onSendPrompt={noop}
        />
      </div>
    ),
  },
  ActCanvas: {
    description:
      "Canvas de rédaction markdown-aware d'un acte : titres L0-L4 dérivés de la grammaire de numérotation juridique (PLAISE AU TRIBUNAL, I., A/, 1°, Sur …), listes, badges pièces et pills JP citées inline. " +
      "À droite, le SOMMAIRE (table des matières) : une minimap façon Notion générée par parseActStructure - repliée en ticks dont la largeur encode la profondeur, dépliée en table des matières complète (libellés + montants compacts, scroll-spy sur la section courante). Le sommaire est masqué pendant le streaming. Sélectionner du texte remonte une zone. Câblé sur l'assignation mock (18 entrées).",
    render: (v) => (
      <div style={{ width: 900, height: 620, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
        <ActCanvasReal
          content={MOCK_ASSIGNATION_TEXT}
          streaming={v.streaming}
          outlinePinned={v.sommaire === 'déplié'}
          hasActiveZone={false}
          onZoneSelect={noop}
        />
      </div>
    ),
    controls: {
      sommaire:  { type: 'select',  default: 'déplié', options: ['replié', 'déplié'], description: 'Table des matières : repliée (ticks) ou dépliée (libellés + montants). Survol = déplie au vol.' },
      streaming: { type: 'boolean', default: false, description: 'Curseur de génération en cours (masque le sommaire).' },
    },
    presets: [
      { label: 'Sommaire déplié', values: { sommaire: 'déplié', streaming: false } },
      { label: 'Sommaire replié', values: { sommaire: 'replié', streaming: false } },
      { label: 'En génération',   values: { sommaire: 'déplié', streaming: true } },
    ],
  },
};

function ChatBubbleWithAvatar({ author, content, timestamp }) {
  return (
    <P.ChatBubble
      author={author}
      content={content}
      timestamp={timestamp}
    />
  );
}

export function getComponentDemo(id) {
  return componentDemos[id] || null;
}
