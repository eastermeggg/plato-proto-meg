import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Landmark, BookOpen, HelpCircle, Scale} from 'lucide-react';
// VRAIS composants du produit, importés depuis src/ de l'app.
import ConversationsIndexPage from '../../src/components/shell/ConversationsIndexPage';
import AssistantComposer from '../../src/components/assistant/AssistantComposer';
import SuggestionPill from '../../src/components/assistant/SuggestionPill';
import {colors} from '../../src/design-system/tokens';
import {RealFonts} from './RealFonts';

// Données mock au format attendu (threads + dossiers).
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const threads = [
  {
    id: 'th-new',
    title: 'Un salarié peut-il contester son licenciement 13 mois après ?',
    isUntitled: false,
    scope: {dossierId: null, vertical: null},
    createdAt: iso(60_000),
    lastActivity: iso(60_000),
    messages: [],
  },
  {
    id: 'th-1',
    title: 'Prescription biennale sur les cotisations',
    scope: {dossierId: 'd1', vertical: 'Droit social'},
    createdAt: iso(2 * 3600_000),
    lastActivity: iso(2 * 3600_000),
    messages: [],
  },
  {
    id: 'th-2',
    title: "Barème Macron pour 8 ans d'ancienneté",
    scope: {dossierId: 'd2', vertical: 'Droit social'},
    createdAt: iso(26 * 3600_000),
    lastActivity: iso(26 * 3600_000),
    messages: [],
  },
];

const dossiers = [
  {id: 'd1', reference: 'Sociale · URSSAF c/ Martel', statut: 'ouvert', lastActivity: iso(2 * 3600_000)},
  {id: 'd2', reference: 'Sociale · Leblanc c/ Novapar', statut: 'ouvert', lastActivity: iso(26 * 3600_000)},
];

export const Poc: React.FC = () => (
  <AbsoluteFill style={{background: '#f8f7f5'}}>
    <RealFonts />
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column'}}>
      <ConversationsIndexPage
        threads={threads}
        dossiers={dossiers}
        onNewConversation={() => {}}
        onOpenThread={() => {}}
      />
    </div>
  </AbsoluteFill>
);

const FREE_SUGGESTIONS = [
  {icon: Landmark, label: 'Chercher une jurisprudence'},
  {icon: BookOpen, label: 'Vérifier un délai de prescription'},
  {icon: HelpCircle, label: 'Poser une question de droit'},
  {icon: Scale, label: 'Expliquer une règle applicable'},
];

// Accueil réel : wrapper de la home + VRAI AssistantComposer hero + vrais pills.
export const PocHome: React.FC = () => (
  <AbsoluteFill style={{background: colors.semantic.background, fontFamily: "'Inter', system-ui, sans-serif"}}>
    <RealFonts />
    <div className="min-h-full flex flex-col items-center justify-start px-6 pt-[10vh]">
      <div className="w-full flex flex-col items-center" style={{maxWidth: 690, gap: 32}}>
        <div className="flex flex-col items-center" style={{gap: 14}}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: colors.brand.darker.DEFAULT,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Bonjour Meghan
          </span>
          <h1
            style={{
              fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif",
              fontSize: 30,
              fontWeight: 400,
              color: colors.semantic.foreground,
              letterSpacing: '-0.6px',
              lineHeight: '34px',
              textAlign: 'center',
            }}
          >
            Que puis-je faire pour vous aujourd'hui ?
          </h1>
          <p
            className="text-center"
            style={{fontSize: 14, lineHeight: '20px', color: colors.semantic.mutedForeground, maxWidth: 440}}
          >
            Une question de droit, une jurisprudence, l'état d'un dossier - je réponds avant même
            d'ouvrir un dossier.
          </p>
        </div>
        <div className="w-full">
          <AssistantComposer
            variant="hero"
            scope={{dossierId: null, vertical: null}}
            catalog={{objects: [], intentions: []}}
            placeholder="Posez une question de droit…"
            onSend={() => {}}
            onDropFiles={() => {}}
            autoFocus={false}
          />
          <div className="flex flex-wrap justify-start gap-2 mt-3 px-2.5">
            {FREE_SUGGESTIONS.map((s) => (
              <SuggestionPill key={s.label} icon={s.icon} label={s.label} onClick={() => {}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
