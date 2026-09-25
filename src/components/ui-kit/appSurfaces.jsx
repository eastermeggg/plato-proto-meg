import React from 'react';
import {
  Landmark, BookOpen, HelpCircle, Scale, FolderOpen, MessageSquare,
  Folder, MoreHorizontal,
} from 'lucide-react';
import { colors } from '../../design-system/tokens';
import Button from '../ui/Button';
import AssistantComposer from '../assistant/AssistantComposer';
import SuggestionPill from '../assistant/SuggestionPill';
import WeeklyUsageCard from '../billing/WeeklyUsageCard';
import PlanFeatureList from '../billing/PlanFeatureList';
import { PLAN_BY_ID, PLAN_FEATURES } from '../../data/pricing';
import PreviewPanel from '../preview/PreviewPanel';
import { PREVIEW_SAMPLES } from '../preview/previewSamples';
import { MatterChatPanel } from './matterTabContents';

// ─────────────────────────────────────────────────────────────────────────────
// Contenus MOCK des pages produit NON-tabulaires, pour le playground Blocks.
// Compose UNIQUEMENT les composants canoniques sur des données locales - aucun
// state produit. Remplace les anciens Zone « (hors scope) » du block Shell et
// alimente les blocks Accueil (hero) + Pièce (panneau + chat).
//   - Accueil    → hero assistant « Hey John » (App.js renderAssistantSurface)
//   - Dossiers   → liste des dossiers (App.js renderDossierListPage)
//   - Paramètres → Mon usage (licence + quota hebdo) (App.js renderSettingsUsage)
//   - Pièce+chat → PreviewPanel ouvert à gauche du chat persistant (--chat-offset)
// ─────────────────────────────────────────────────────────────────────────────

const noop = () => {};

const serif = { fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif" };
const mono11 = { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' };

// ── Accueil : le hero assistant (front door) ────────────────────────────────
const HERO_SUGGESTIONS = [
  { icon: Landmark, label: 'Chercher une jurisprudence' },
  { icon: BookOpen, label: 'Vérifier un délai de prescription' },
  { icon: HelpCircle, label: 'Poser une question de droit' },
  { icon: Scale, label: 'Expliquer une règle applicable' },
];
const RECENT_DOSSIERS = ['Martel / AXA', 'Bonnet / MAIF', 'Duval / Groupama'];
const RECENT_CONVS = [
  { title: 'Préavis et indemnités - synthèse', dossier: 'Martel / AXA' },
  { title: 'Recherche JP - barème DFP', dossier: 'Bonnet / MAIF' },
  { title: 'Calcul PGPA - revenu de référence', dossier: null },
];

function RecentColumn({ label, children }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <span style={{ ...mono11, color: colors.semantic.mutedForeground }}>{label}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function RecentRow({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2 -mx-2 rounded-lg hover:bg-background-canvas cursor-pointer transition-colors" onClick={noop}>
      <Icon className="w-4 h-4 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
      <span className="text-body text-foreground truncate">{title}</span>
      {sub && <span className="text-caption text-foreground-muted truncate flex-shrink-0">{sub}</span>}
    </div>
  );
}

export function AccueilContent() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: colors.semantic.background }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ ...mono11, color: colors.brand.subtleForeground }}>Bonjour Meghan</span>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 400, letterSpacing: '-0.6px', lineHeight: '34px', color: colors.semantic.foreground, textAlign: 'center', margin: '10px 0 0' }}>
          Que puis-je faire pour vous aujourd'hui ?
        </h1>
        <p className="text-body text-foreground-muted" style={{ textAlign: 'center', maxWidth: 440, marginTop: 10 }}>
          Une question de droit, une jurisprudence, l'état d'un dossier - je réponds avant même d'ouvrir un dossier.
        </p>

        <div style={{ width: '100%', marginTop: 28 }}>
          <AssistantComposer variant="hero" placeholder="Posez une question de droit…" autoFocus={false} />
          <div className="flex flex-wrap gap-2" style={{ marginTop: 12, paddingLeft: 10 }}>
            {HERO_SUGGESTIONS.map((s) => (
              <SuggestionPill key={s.label} icon={s.icon} label={s.label} onClick={noop} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full" style={{ marginTop: 40 }}>
          <RecentColumn label="Dossiers récents">
            {RECENT_DOSSIERS.map((d) => <RecentRow key={d} icon={FolderOpen} title={d} />)}
          </RecentColumn>
          <RecentColumn label="Conversations récentes">
            {RECENT_CONVS.map((c) => <RecentRow key={c.title} icon={MessageSquare} title={c.title} sub={c.dossier} />)}
          </RecentColumn>
        </div>
      </div>
    </div>
  );
}

// ── Mes dossiers : la liste (table blanche) ─────────────────────────────────
const colHeaderStyle = { ...mono11, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' };
const DOSSIER_ROWS = [
  { reference: 'Martel / AXA', domaine: 'Dommage corporel', stade: 'En cours', activity: 'il y a 2 h', next: 'Valider DSA', closed: false },
  { reference: 'Durand / Technimat', domaine: 'Droit social', stade: 'En cours', activity: 'hier', next: 'Chiffrer le rappel d\'heures', closed: false },
  { reference: 'Bonnet / MAIF', domaine: 'Dommage corporel', stade: 'Expertise', activity: 'il y a 3 j', next: 'Relancer l\'expert', closed: false },
  { reference: 'Duval / Groupama', domaine: 'Dommage corporel', stade: 'Terminé', activity: 'il y a 45 j', next: null, closed: true },
];

export function DossiersListContent() {
  return (
    <div className="flex-1 overflow-y-auto px-8 pb-6" style={{ minHeight: 0 }}>
      <div className="rounded-lg border border-border overflow-hidden" style={{ backgroundColor: colors.semantic.card }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-background-subtle">
              {['Dossier', 'Domaine', 'Stade', 'Dernière activité', 'Prochaine action', ''].map((h, i) => (
                <th key={i} className="px-5 py-3 text-left" style={colHeaderStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DOSSIER_ROWS.map((d) => (
              <tr key={d.reference} className="hover:bg-background cursor-pointer transition-colors group" style={{ backgroundColor: colors.semantic.card }} onClick={noop}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                      <Folder className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />
                    </span>
                    <span className="text-body-medium text-foreground truncate">{d.reference}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-body text-foreground-secondary">{d.domaine}</td>
                <td className="px-5 py-4">
                  <span className={`badge badge-sm ${d.closed ? 'badge-secondary' : 'badge-success'}`}>{d.stade}</span>
                </td>
                <td className="px-5 py-4 text-body text-foreground-secondary">{d.activity}</td>
                <td className="px-5 py-4 text-body text-foreground-secondary">{d.next || '—'}</td>
                <td className="px-5 py-4">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex">
                    <Button variant="ghost" size="icon-sm" icon={MoreHorizontal} onClick={noop} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Paramètres : Mon usage (licence + quota hebdomadaire) ───────────────────
// La surface de réglages la plus visuelle (le modèle de prix per-user + jauge).
function SettingsSectionHeader({ label }) {
  return (
    <div className="flex items-baseline gap-3">
      <span style={{ ...mono11, color: colors.semantic.mutedForeground }}>{label}</span>
      <span className="flex-1" style={{ height: 1, background: colors.semantic.border }} />
    </div>
  );
}

export function ParametresUsageContent() {
  const plan = PLAN_BY_ID.MAX;
  return (
    <div className="flex-1 overflow-y-auto px-8 py-10" style={{ minHeight: 0 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }} className="flex flex-col gap-6">
        <div>
          <h1 style={{ ...serif, fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: colors.semantic.foreground, margin: 0 }}>Mon usage</h1>
          <p className="text-body text-foreground-secondary" style={{ marginTop: 4 }}>Votre licence et votre consommation hebdomadaire.</p>
        </div>

        <div className="flex flex-col gap-4">
          <SettingsSectionHeader label="Votre licence" />
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-cream border border-border flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 text-foreground-secondary" strokeWidth={1.5} />
            </span>
            <span style={{ ...serif, fontSize: 18, fontWeight: 500, color: colors.semantic.foreground }}>Licence {plan.name}</span>
          </div>
          <WeeklyUsageCard plan={plan} pct={63} variant="full" />
        </div>

        <div className="flex flex-col gap-3">
          <SettingsSectionHeader label="Inclus dans votre licence" />
          <p className="text-caption text-foreground-secondary">Dans la limite de vos quotas hebdomadaires.</p>
          <PlanFeatureList dense subtle features={PLAN_FEATURES} />
        </div>
      </div>
    </div>
  );
}

// ── Pièce ouverte à gauche du chat (le layout signature --chat-offset) ──────
// PreviewPanel (le panneau document, plein cadre) + le chat Plato TOUJOURS
// visible à droite : on regarde une pièce / une JP / une loi tout en continuant
// de parler à l'assistant. `kind` pilote le panneau (piece / jp / loi).
const PIECE_CHAT = {
  piece: [
    { role: 'user', text: 'Résume cette expertise et sors la date de consolidation' },
    { role: 'ai', text: "Rapport définitif du Dr. Dubois : consolidation au 15/01/2024, AIPP 8 %, DFT de 120 jours. J'ai surligné le passage sur la consolidation en page 2." },
  ],
  jp: [
    { role: 'user', text: 'Cette décision est-elle transposable à notre dossier ?' },
    { role: 'ai', text: "Oui : profil et poste (PGPA) comparables. Le différentiel salaire net / IJ y est revalorisé selon l'IPC, exactement notre situation. Je l'ai épinglée sur le poste." },
  ],
  loi: [
    { role: 'user', text: 'Quel délai de préavis prévoit ce texte ?' },
    { role: 'ai', text: "L'article vise un préavis fonction de l'ancienneté ; au-delà de 2 ans, il est de 2 mois. L'alinéa applicable est surligné." },
  ],
};
const PIECE_CHAT_TITLE = {
  piece: "Expertise médicale - synthèse",
  jp: 'Jurisprudence PGPA - transposabilité',
  loi: 'Délai de préavis - vérification',
};

export function PieceChatLayout({ kind = 'piece', menu = null }) {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {menu}
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <PreviewPanel kind={kind} source={PREVIEW_SAMPLES[kind]} embedded={false} onClose={noop} onOpenSource={noop} />
        </div>
      </div>
      <MatterChatPanel title={PIECE_CHAT_TITLE[kind]} messages={PIECE_CHAT[kind]} />
    </div>
  );
}
