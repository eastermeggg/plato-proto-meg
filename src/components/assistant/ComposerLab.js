import React, { useMemo, useState } from 'react';
import { BookOpen, Calculator, FileSignature, LayoutTemplate, Scale, Search } from 'lucide-react';
import AssistantComposer from './AssistantComposer';

// ── ComposerLab ──────────────────────────────────────────────────────
// Sandbox for the AssistantComposer: both variants, a fake catalog
// (scoped / unscoped), all the Figma « Chat Input » states (node
// 1081:50926) — système, running/stop, contexte, docs, UserAsk — and an
// event log. Standalone — the route is registered by the app shell.

const SYSTEM_STATES = [
  { key: 'aucun', state: null },
  {
    key: 'analyse',
    state: { kind: 'inProgress', label: 'Analyse des documents en cours...', disables: true },
  },
  {
    key: 'limite',
    state: {
      kind: 'warning',
      label: "92% de votre quota d'utilisation hebdo utilisé",
      onOpen: () => {},
    },
  },
  {
    key: 'quota',
    state: {
      kind: 'blocked',
      label: 'Quota hebdomadaire atteint - Upgrade',
      onOpen: () => {},
    },
  },
];

const USER_ASK_QUESTIONS = [
  {
    question: "Pour adapter l'acte à votre dossier, précisez-moi le tribunal compétent.",
    proposals: ['Tribunal judiciaire de Paris', 'Tribunal judiciaire de Nanterre', 'Conseil de prud’hommes de Paris'],
  },
  {
    question: 'Quelle est la date de signification retenue ?',
    proposals: ['12 mars 2026', '2 avril 2026'],
  },
  {
    question: 'Souhaitez-vous inclure une demande au titre de l’article 700 ?',
    proposals: ['Oui, 3 000 EUR', 'Oui, 5 000 EUR', 'Non'],
  },
];

const CONTEXT_ITEMS = [
  { id: 'acte', label: 'ACTE - Assignation en référé-expertise - Dupont c/ Martin' },
];

const STAGED_DOCS = [
  { id: 'sd1', name: 'Rapport expertise.pdf' },
  { id: 'sd2', name: 'Certificat médical.pdf' },
  { id: 'sd3', name: 'Avis imposition 2024.pdf' },
];

const PIECE_FOLDERS = [
  {
    key: 'medical',
    label: 'Médical',
    count: 2,
    items: [
      { id: 'p1', type: 'piece', label: "Rapport d'expertise Dr Lenoir" },
      { id: 'p2', type: 'piece', label: 'Certificat médical initial' },
    ],
  },
  {
    key: 'revenus',
    label: 'Revenus',
    count: 2,
    items: [
      { id: 'p3', type: 'piece', label: "Avis d'imposition 2024" },
      { id: 'p4', type: 'piece', label: 'Bulletins de salaire 2023' },
    ],
  },
];

const MODELES = [
  { id: 'm1', type: 'modele', label: 'Assignation au fond', icon: LayoutTemplate },
  { id: 'm2', type: 'modele', label: 'Conclusions récapitulatives', icon: LayoutTemplate },
  { id: 'm3', type: 'modele', label: 'Mise en demeure', icon: LayoutTemplate },
];

const REFERENTIELS = [
  { id: 'r1', type: 'referentiel', label: 'Barème de capitalisation 2025', icon: BookOpen },
  { id: 'r2', type: 'referentiel', label: 'Référentiel Mornet', icon: BookOpen },
];

function buildCatalog(scoped) {
  if (scoped) {
    return {
      objects: [
        { key: 'pieces', label: 'Pièces', folders: PIECE_FOLDERS },
        { key: 'modeles', label: 'Modèles', items: MODELES },
        { key: 'referentiels', label: 'Référentiels', items: REFERENTIELS },
      ],
      intentions: [
        { id: 'chiffrer', label: 'Chiffrer un poste', icon: Calculator },
        { id: 'rediger', label: 'Rédiger un acte', icon: FileSignature },
        { id: 'rechercher', label: 'Rechercher des JP', icon: Search },
      ],
    };
  }
  return {
    objects: [
      { key: 'modeles', label: 'Modèles', items: MODELES },
      { key: 'referentiels', label: 'Référentiels', items: REFERENTIELS },
      { key: 'pieces', label: 'Pièces, chiffrage, actes', locked: true },
    ],
    intentions: [
      { id: 'rechercher', label: 'Rechercher des JP', icon: Search },
      { id: 'chiffrer', label: 'Chiffrer', locked: true },
      { id: 'rediger', label: 'Rédiger un acte', locked: true },
    ],
  };
}

const toggleBtnClass = (active) =>
  `h-7 px-2.5 rounded-md border text-[12px] font-medium transition-colors ${
    active
      ? 'border-border-strong bg-secondary text-foreground'
      : 'border-border bg-surface text-foreground hover:bg-background-subtle'
  }`;

const MONO_LABEL = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10.5,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export default function ComposerLab() {
  const [scoped, setScoped] = useState(false);
  const [stateIdx, setStateIdx] = useState(0);
  const [scopeFlash, setScopeFlash] = useState(false);
  const [running, setRunning] = useState(false);
  const [withContext, setWithContext] = useState(false);
  const [withDocs, setWithDocs] = useState(false);
  const [stagedDocs, setStagedDocs] = useState(STAGED_DOCS);
  const [ask, setAsk] = useState(null); // { currentIdx, answers } | null
  const [log, setLog] = useState([]);

  const catalog = useMemo(() => buildCatalog(scoped), [scoped]);
  const scope = scoped
    ? { dossierId: 'd-martin', vertical: 'Dommages corporels' }
    : { dossierId: null, vertical: 'Dommages corporels' };

  const pushLog = (event, payload) => {
    setLog((prev) => [
      { at: new Date().toLocaleTimeString(), event, payload },
      ...prev.slice(0, 29),
    ]);
  };

  const attach = () => {
    pushLog('onAttach', null);
    setScoped(true);
    setScopeFlash(true);
  };

  // ── UserAsk demo wiring — one question at a time, answers tracked ──
  const userAsk = ask
    ? {
        ...USER_ASK_QUESTIONS[ask.currentIdx],
        step: ask.currentIdx + 1,
        total: USER_ASK_QUESTIONS.length,
        answered: ask.answers,
      }
    : null;

  const advanceAsk = (answers) => {
    if (ask.currentIdx < USER_ASK_QUESTIONS.length - 1) {
      setAsk({ currentIdx: ask.currentIdx + 1, answers });
    } else {
      pushLog('userAsk terminé', answers);
      setAsk(null);
    }
  };

  const composerProps = {
    scope,
    dossierLabel: scoped ? 'Martin c/ AXA' : undefined,
    systemState: SYSTEM_STATES[stateIdx].state,
    scopeFlash,
    onScopeFlashEnd: () => setScopeFlash(false),
    catalog,
    running,
    onStop: () => {
      pushLog('onStop', null);
      setRunning(false);
    },
    contextItems: withContext ? CONTEXT_ITEMS : undefined,
    stagedDocs: withDocs ? stagedDocs : undefined,
    onRemoveStagedDoc: (doc) => setStagedDocs((prev) => prev.filter((d) => d !== doc)),
    userAsk,
    onUserAskSubmit: (answer) => {
      pushLog('onUserAskSubmit', { question: userAsk?.question, answer });
      advanceAsk({ ...ask.answers, [ask.currentIdx]: true });
    },
    onUserAskSkip: () => {
      pushLog('onUserAskSkip', { question: userAsk?.question });
      advanceAsk(ask.answers);
    },
    onUserAskClose: () => setAsk(null),
    onUserAskPrev: () => setAsk((s) => ({ ...s, currentIdx: Math.max(0, s.currentIdx - 1) })),
    onUserAskNext: () =>
      setAsk((s) => ({ ...s, currentIdx: Math.min(USER_ASK_QUESTIONS.length - 1, s.currentIdx + 1) })),
    onSend: (payload) =>
      pushLog('onSend', { body: payload.body, tokens: payload.tokens }),
    onAttach: attach,
    onCreateDossier: () => pushLog('onCreateDossier', null),
    onRunIntention: (intention) =>
      pushLog('onRunIntention', { id: intention.id, label: intention.label }),
    onDropFiles: (files) =>
      pushLog('onDropFiles', files.map((f) => f.name)),
  };

  return (
    <div className="min-h-screen bg-background-canvas py-10 px-6">
      <div className="max-w-[880px] mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-[20px] font-semibold text-foreground" style={{ letterSpacing: '-0.6px' }}>
            Assistant - Composer
          </h1>
          <p className="text-[13px] text-foreground-secondary mt-1">
            Un composer, deux périmètres. Le périmètre filtre le catalogue, jamais l'anatomie.
            Tous les états du Figma « Chat Input » : système, running, contexte, docs, UserAsk.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-foreground-secondary" style={MONO_LABEL}>
              Périmètre
            </span>
            <button type="button" onClick={() => setScoped((s) => !s)} className={toggleBtnClass(scoped)}>
              {scoped ? 'Dossier Martin c/ AXA' : 'Hors dossier'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-foreground-secondary" style={MONO_LABEL}>
              État système
            </span>
            <button
              type="button"
              onClick={() => setStateIdx((i) => (i + 1) % SYSTEM_STATES.length)}
              className={toggleBtnClass(stateIdx !== 0)}
            >
              {SYSTEM_STATES[stateIdx].key}
            </button>
          </div>
          <button type="button" onClick={() => setRunning((r) => !r)} className={toggleBtnClass(running)}>
            {running ? 'Running (stop)' : 'Running'}
          </button>
          <button type="button" onClick={() => setWithContext((c) => !c)} className={toggleBtnClass(withContext)}>
            Contexte
          </button>
          <button
            type="button"
            onClick={() => { setWithDocs((d) => !d); setStagedDocs(STAGED_DOCS); }}
            className={toggleBtnClass(withDocs)}
          >
            Docs joints
          </button>
          <button
            type="button"
            onClick={() => setAsk(ask ? null : { currentIdx: 0, answers: {} })}
            className={toggleBtnClass(!!ask)}
          >
            UserAsk
          </button>
          <button type="button" onClick={() => setScopeFlash(true)} className={toggleBtnClass(false)}>
            Flash du chip
          </button>
        </div>

        {/* Hero variant */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-3.5 h-3.5 text-foreground-secondary" strokeWidth={1.75} />
            <span className="text-foreground-secondary" style={{ ...MONO_LABEL, fontWeight: 600 }}>
              Variante hero (home)
            </span>
          </div>
          <AssistantComposer
            variant="hero"
            placeholder="Posez une question, chiffrez, rédigez..."
            autoFocus
            {...composerProps}
          />
        </section>

        {/* Standard variant */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-3.5 h-3.5 text-foreground-secondary" strokeWidth={1.75} />
            <span className="text-foreground-secondary" style={{ ...MONO_LABEL, fontWeight: 600 }}>
              Variante standard (fil)
            </span>
          </div>
          <div className="max-w-[560px]">
            <AssistantComposer
              variant="standard"
              placeholder="Répondre..."
              {...composerProps}
            />
          </div>
        </section>

        {/* Event log */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-foreground-secondary" style={{ ...MONO_LABEL, fontWeight: 600 }}>
              Journal des événements
            </span>
            {log.length > 0 && (
              <button
                type="button"
                onClick={() => setLog([])}
                className="text-[12px] text-foreground-secondary hover:text-foreground transition-colors"
              >
                Vider
              </button>
            )}
          </div>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            {log.length === 0 ? (
              <div className="px-4 py-6 text-[13px] text-foreground-muted">
                Aucun événement - envoyez un message, exécutez une intention ou déposez un fichier.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle max-h-[320px] overflow-y-auto">
                {log.map((entry, i) => (
                  <div key={`${entry.at}-${i}`} className="px-4 py-2.5 flex items-start gap-3">
                    <span className="text-[11px] text-foreground-muted flex-shrink-0 pt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {entry.at}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[12px] font-medium text-foreground">{entry.event}</span>
                      {entry.payload != null && (
                        <pre className="mt-0.5 text-[11px] text-foreground-secondary whitespace-pre-wrap break-words" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {JSON.stringify(entry.payload, null, 1)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
