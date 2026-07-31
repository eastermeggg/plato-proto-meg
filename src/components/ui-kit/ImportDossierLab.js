import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { PhaseContext, LabSeg, LabSwitch, monoLabel } from './import/atoms';
import GesteCModal from './import/GesteCModal';
import GesteBModal from './import/GesteBModal';
import PiecesPage from './import/PiecesPage';
import {
  seedPieces, seedSources, seedSuggestions, PENDING_ARRIVALS, mkPiece,
  detectionFor, folderPath, folderById, statsFor,
  LAB_SENDERS, threadById, displaySubject, cleanSubject, approxPieces,
  DOSSIER_IMPORTED_THREADS, threadImportInfo,
} from './import/labData';

// « Import & synchronisation email → Pièces du dossier » - lab de la spec du
// 28/07/2026. Trois gestes, un seul système : C ajouter des pièces (modale
// deux colonnes), B créer un dossier (fiche puis contenu), A le dossier vivant
// (pièces + sources + sync). Le calque sync (phase 2) se lève d'un flag sans
// que rien ne change de place ; « Nouveau » est bleu, les échecs sont des
// lignes, les défauts sont conservateurs.

let liveSeq = 0;
const liveId = (p) => `${p}-${++liveSeq}`;

// Calque « sync » (suivi phase 2) masqué pour l'instant : basculer à true pour
// le réactiver d'un coup (toggles Suivre, badges Déjà suivi / Nouveau, panneau
// Sources, geste A, film, sections d'explication du suivi).
const SYNC_ENABLED = false;

export default function ImportDossierLab() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(SYNC_ENABLED ? 2 : 1);
  const [connected, setConnected] = useState(true);
  const [modal, setModal] = useState(null); // 'c' | 'cbis' | 'b' | 'a' | null
  const [labOpen, setLabOpen] = useState(false);

  // ── Store du dossier Leblanc c/ AXA (partagé entre les gestes) ──
  const [pieces, setPieces] = useState(seedPieces);
  const [sources, setSources] = useState(seedSources);
  const [suggestions, setSuggestions] = useState(seedSuggestions);
  const pendingRef = useRef(null);
  if (pendingRef.current === null) {
    pendingRef.current = Object.fromEntries(Object.entries(PENDING_ARRIVALS).map(([k, v]) => [k, [...v]]));
  }
  const sourcesRef = useRef(sources);
  useEffect(() => { sourcesRef.current = sources; }, [sources]);
  const piecesRef = useRef(pieces);
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);

  // ── Toast (la confirmation d'un geste est toujours un toast, jamais un écran) ──
  const [toast, setToast] = useState(null); // { text, action? }
  const toastTimer = useRef(null);
  const showToast = (t) => {
    setToast(typeof t === 'string' ? { text: t } : t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5200);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Deep-link : ?open=c|b|a&phase=1|2&demo=1 (captures Figma, démos).
  const [demoSeed, setDemoSeed] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get('open');
    if (open === 'c' || open === 'cbis' || open === 'b' || (open === 'a' && SYNC_ENABLED)) setModal(open);
    const ph = params.get('phase');
    if (SYNC_ENABLED && (ph === '1' || ph === '2')) setPhase(Number(ph));
    if (params.get('demo') === '1') setDemoSeed(true);
  }, []);

  const reset = () => {
    setPieces(seedPieces());
    setSources(seedSources());
    setSuggestions(seedSuggestions());
    pendingRef.current = Object.fromEntries(Object.entries(PENDING_ARRIVALS).map(([k, v]) => [k, [...v]]));
    setConnected(true);
    setModal(null);
    showToast('Lab réinitialisé');
  };

  // ── API sources / pièces (passée à la page Pièces et au panneau Sources) ──
  const api = useMemo(() => {
    const self = {
      toggleSource: (id) => setSources(prev => prev.map(s => (s.id === id ? { ...s, followed: !s.followed } : s))),

      setDestination: (id, nodeId) => setSources(prev => prev.map(s => (s.id === id ? { ...s, destinationId: nodeId } : s))),
      setDecoupeAuto: (id, v) => setSources(prev => prev.map(s => (s.id === id ? { ...s, decoupeAuto: v } : s))),

      piecesCountFor: (id) => piecesRef.current.filter(p => p.provenance?.sourceId === id).length,

      // Consomme le prochain lot d'arrivées d'une source : pièces « Nouveau »
      // dans sa Destination, historique enrichi (y compris doublons ignorés).
      applySync: (id) => {
        const src = sourcesRef.current.find(s => s.id === id);
        if (!src) return null;
        const batches = pendingRef.current[id];
        if (!batches || batches.length === 0) return { added: 0, label: src.pathLabel };
        const batch = batches.shift();
        const newPieces = batch.pieces.map(p => mkPiece({
          ...p, nodeId: src.destinationId, isNew: true,
          provenance: { kind: 'source', sourceId: id, label: src.pathLabel },
        }));
        setPieces(prev => [...prev, ...newPieces]);
        const hist = batch.history.map(h => ({ id: liveId('h-live'), date: '28 juil.', ...h }));
        setSources(prev => prev.map(s => (s.id === id
          ? { ...s, newCount: (s.newCount || 0) + batch.pieces.length, history: [...hist, ...s.history] }
          : s)));
        return { added: batch.pieces.length, label: src.pathLabel };
      },

      applySyncAll: () => {
        let added = 0;
        sourcesRef.current.forEach(s => {
          if (!s.followed || s.error) return;
          const batches = pendingRef.current[s.id];
          if (batches && batches.length > 0) {
            const res = self.applySync(s.id);
            added += res?.added || 0;
          }
        });
        return { added };
      },

      // Un échec résolu devient une arrivée : la pièce entre, marquée « Nouveau ».
      retryFailure: (srcId, histId) => {
        const src = sourcesRef.current.find(s => s.id === srcId);
        const entry = src?.history.find(h => h.id === histId);
        if (!src || !entry || entry.kind !== 'failure' || entry.resolved) return false;
        setPieces(prev => [...prev, mkPiece({
          name: entry.name, type: entry.pieceType || 'Administratif', nodeId: src.destinationId,
          pagesLabel: '', dateLabel: '28/07/2026', isNew: true,
          provenance: { kind: 'source', sourceId: srcId, label: src.pathLabel },
        })]);
        setSources(prev => prev.map(s => (s.id === srcId
          ? {
              ...s,
              newCount: (s.newCount || 0) + 1,
              history: [
                { id: liveId('h-live'), date: '28 juil.', kind: 'arrival', name: entry.name, tag: entry.pieceType || 'Administratif' },
                ...s.history.map(h => (h.id === histId ? { ...h, resolved: true } : h)),
              ],
            }
          : s)));
        return true;
      },

      removeSource: (id, keepPieces) => {
        const src = sourcesRef.current.find(s => s.id === id);
        setSources(prev => prev.filter(s => s.id !== id));
        if (keepPieces) {
          setPieces(prev => prev.map(p => (p.provenance?.sourceId === id
            ? { ...p, isNew: false, provenance: { kind: 'import', sourceId: null, label: `${src?.pathLabel || 'source'} · source retirée` } }
            : p)));
        } else {
          setPieces(prev => prev.filter(p => p.provenance?.sourceId !== id));
        }
      },

      acceptSuggestion: (sugId) => {
        setSuggestions(prev => {
          const sug = prev.find(s => s.id === sugId);
          if (sug) {
            setSources(cur => [...cur, {
              id: liveId('src-live'), kind: 'sender', refId: sug.email,
              pathLabel: sug.email,
              subtitleBits: sug.isShared ? ['adresse partagée', 'suivi filtré : adresse + référence dossier'] : ['correspondant dédié'],
              followed: true, since: '28 juil. 2026', destinationId: 'correspondance', decoupeAuto: false,
              newCount: 0, error: null, history: [],
            }]);
          }
          return prev.filter(s => s.id !== sugId);
        });
      },
      rejectSuggestion: (sugId) => setSuggestions(prev => prev.filter(s => s.id !== sugId)),

      // « Rattacher (N) » - un seul modèle d'engagement : tout se coche puis se
      // rattache, vers une Destination.
      addSources: ({ folderIds = [], threadIds = [], senderEmails = [], destinationId }) => {
        const created = [];
        const cur = sourcesRef.current;
        folderIds.forEach(fid => {
          if (cur.some(s => s.kind === 'folder' && s.refId === fid)) return;
          const f = folderById(fid);
          const st = statsFor(fid);
          created.push({
            id: liveId('src-live'), kind: 'folder', refId: fid,
            pathLabel: folderPath(f), subtitleBits: [`${st.threads} échange${st.threads > 1 ? 's' : ''}`],
            followed: true, since: '28 juil. 2026', destinationId, decoupeAuto: false,
            newCount: 0, error: null,
            history: [{ id: liveId('h-live'), date: '28 juil.', kind: 'initial', count: st.pieces }],
          });
        });
        threadIds.forEach(tid => {
          if (cur.some(s => s.kind === 'thread' && s.refId === tid)) return;
          const t = threadById(tid);
          if (!t) return;
          created.push({
            id: liveId('src-live'), kind: 'thread', refId: tid,
            pathLabel: displaySubject(t).text,
            subtitleBits: [t.senders?.[0]?.email || t.from],
            followed: true, since: '28 juil. 2026', destinationId, decoupeAuto: false,
            newCount: 0, error: null,
            history: [{ id: liveId('h-live'), date: '28 juil.', kind: 'initial', count: 1 + (t.attachmentCount || 0) }],
          });
        });
        senderEmails.forEach(email => {
          if (cur.some(s => s.kind === 'sender' && s.refId === email)) return;
          const a = LAB_SENDERS.find(x => x.email === email);
          created.push({
            id: liveId('src-live'), kind: 'sender', refId: email,
            pathLabel: email,
            subtitleBits: a?.isShared
              ? ['adresse partagée', 'suivi filtré : adresse + référence dossier']
              : ['correspondant dédié', `${a?.exchanges || 0} échange${(a?.exchanges || 0) > 1 ? 's' : ''}`],
            followed: true, since: '28 juil. 2026', destinationId, decoupeAuto: false,
            newCount: 0, error: null, history: [],
          });
        });
        if (created.length) setSources(prev => [...prev, ...created]);
        return { n: created.length };
      },

      // Drop Finder sur la page Pièces : l'import manuel et la sync coexistent.
      addDropPieces: (nodeId) => {
        const names = ['note_honoraires_scan.pdf', 'attestation_temoin.pdf'];
        setPieces(prev => [...prev, ...names.map(name => mkPiece({
          name, type: 'Administratif', nodeId, pagesLabel: '', dateLabel: '28/07/2026',
          provenance: { kind: 'drop', sourceId: null, label: 'Déposé à l\'instant' },
        }))]);
        return names.length;
      },

      // Revisiter éteint les marqueurs « Nouveau » - la provenance reste.
      clearNew: () => {
        setPieces(prev => prev.map(p => (p.isNew ? { ...p, isNew: false } : p)));
        setSources(prev => prev.map(s => (s.newCount ? { ...s, newCount: 0 } : s)));
      },
    };
    return self;
  }, []);

  // ── Commit du geste C : pièces (+ découpes appliquées) + sources suivies ──
  const commitGesteC = ({ items, decoupe, suivre, destinationId }) => {
    const newPieces = [];
    const newSources = [];
    const stamp = { dateLabel: '28/07/2026' };

    const pushFilePieces = (name, provenance, decoupeOn) => {
      const det = detectionFor(name);
      if (decoupeOn && det) {
        det.pieces.forEach(dp => newPieces.push(mkPiece({ name: dp.name, type: 'Document', nodeId: destinationId, pagesLabel: `p. ${dp.pages}`, split: true, ...stamp, provenance })));
      } else {
        newPieces.push(mkPiece({ name, type: 'Document', nodeId: destinationId, pagesLabel: '', ...stamp, provenance }));
      }
    };

    items.forEach(item => {
      // Seul un DOSSIER est un concept de source (le suivi vit sur l'arbre). Un
      // échange est un objet importé, un instantané - jamais une source.
      const followed = suivre.has(item.id);
      let sourceId = null;
      if (followed && item.kind === 'folder') {
        sourceId = liveId('src-live');
      }
      const provenance = sourceId
        ? { kind: 'source', sourceId, label: item.folder.path }
        : item.origin === 'ordinateur'
          ? { kind: 'drop', sourceId: null, label: 'Déposé à l\'instant' }
          : { kind: 'import', sourceId: null, label: 'Import du 28 juil.' };

      let count = 0;
      if (item.kind === 'file') {
        pushFilePieces(item.file.name, provenance, decoupe.has(item.id));
        count = 1;
      } else if (item.kind === 'thread') {
        // Seules les pièces RETENUES entrent : le corps est une pièce, chaque PJ
        // une pièce - selon les cases cochées à droite.
        const pieces = item.thread.pieces.filter(p => p.included);
        if (pieces.some(p => p.kind === 'body')) {
          newPieces.push(mkPiece({ name: item.thread.subject, type: 'Correspondance', kind: 'email', nodeId: destinationId, pagesLabel: '', ...stamp, provenance }));
        }
        pieces.filter(p => p.kind === 'pj').forEach(pj => pushFilePieces(pj.name, provenance, decoupe.has(pj.key)));
        count = pieces.length;
      } else if (item.kind === 'folder') {
        // Seuls les nœuds RETENUS de l'arbre entrent (les cases font foi). On
        // parcourt les threads : corps retenu → une pièce email, PJ retenue →
        // pièce fichier (découpe si active).
        const before = newPieces.length;
        const walkTree = (node) => {
          if (node.kind === 'thread') {
            const leaves = (node.children || []).filter(l => l.included);
            if (!leaves.length) return;
            if (leaves.some(l => l.kind === 'body')) {
              newPieces.push(mkPiece({ name: node.name, type: 'Correspondance', kind: 'email', nodeId: destinationId, pagesLabel: '', ...stamp, provenance }));
            }
            leaves.filter(l => l.kind === 'pj').forEach(pj => pushFilePieces(pj.name, provenance, decoupe.has(pj.key)));
            return;
          }
          (node.children || []).forEach(walkTree);
        };
        walkTree(item.folder.tree);
        count = newPieces.length - before;
      } else if (item.kind === 'zip') {
        item.zip.children.forEach(c => {
          newPieces.push(mkPiece({ name: cleanSubject(c.subject) || c.subject, type: 'Correspondance', kind: 'email', nodeId: destinationId, pagesLabel: '', ...stamp, provenance }));
          c.pj.forEach(pj => pushFilePieces(pj.name, provenance, decoupe.has(pj.key)));
        });
        count = item.zip.children.reduce((n, c) => n + 1 + c.pj.length, 0);
      }

      if (sourceId) {
        // sourceId n'est posé que sur un dossier (cf. plus haut) : source = arbre.
        newSources.push({
          id: sourceId,
          kind: 'folder',
          refId: item.folder.folderId,
          pathLabel: item.folder.path,
          subtitleBits: [`${item.folder.stats.threads} échange${item.folder.stats.threads > 1 ? 's' : ''}`],
          followed: true, since: '28 juil. 2026', destinationId, decoupeAuto: false,
          newCount: 0, error: null,
          history: [{ id: liveId('h-live'), date: '28 juil.', kind: 'initial', count }],
        });
      }
    });

    setPieces(prev => [...prev, ...newPieces]);
    if (newSources.length) setSources(prev => [...prev, ...newSources]);
    setModal(null);

    const nDec = decoupe.size;
    showToast({
      text: [
        `${newPieces.length} pièce${newPieces.length > 1 ? 's' : ''} ajoutée${newPieces.length > 1 ? 's' : ''} au dossier`,
        nDec ? `${nDec} découpe${nDec > 1 ? 's' : ''}` : null,
        newSources.length ? `${newSources.length} source${newSources.length > 1 ? 's' : ''} suivie${newSources.length > 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(' · '),
      action: { label: 'Voir les pièces', onClick: () => setModal('a') },
    });
  };

  // ── Commit du geste C bis : premier import d'un AUTRE dossier (Petit c/
  // MAIF, jamais synchronisé) - hors du store Leblanc, toast seulement. ──
  const commitGesteCBis = ({ items, decoupe, suivre }) => {
    setModal(null);
    const n = approxPieces(items, decoupe);
    const nS = suivre.size;
    showToast([
      `${n} pièce${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''} à « Petit c/ MAIF » - premier import email`,
      nS ? `${nS} source${nS > 1 ? 's' : ''} suivie${nS > 1 ? 's' : ''}` : null,
    ].filter(Boolean).join(' · '));
  };

  // ── Commit du geste B : le dossier créé vit hors du store Leblanc - toast. ──
  const commitGesteB = ({ nom, items, decoupe, suivre }) => {
    setModal(null);
    if (items.length === 0) {
      showToast(`Dossier « ${nom} » créé sans contenu - branchez-le quand vous voulez`);
      return;
    }
    const n = approxPieces(items, decoupe);
    const nS = suivre.size;
    showToast([
      `Dossier « ${nom} » créé - ≈ ${n} pièce${n > 1 ? 's' : ''}`,
      nS ? `${nS} source${nS > 1 ? 's' : ''} suivie${nS > 1 ? 's' : ''}` : null,
    ].filter(Boolean).join(' · '));
  };

  const dejaSuiviFolderIds = useMemo(() => new Set(sources.filter(s => s.kind === 'folder' && s.followed && s.refId).map(s => s.refId)), [sources]);
  const dejaSuiviThreadIds = useMemo(() => new Set(sources.filter(s => s.kind === 'thread' && s.followed && s.refId).map(s => s.refId)), [sources]);
  // Fils déjà importés une fois dans Leblanc (snapshot) - certains ont grossi
  // depuis : la colonne mail y propose le complément du delta.
  const importInfo = useMemo(() => {
    const m = new Map();
    Object.keys(DOSSIER_IMPORTED_THREADS).forEach(tid => { const info = threadImportInfo(tid); if (info) m.set(tid, info); });
    return m;
  }, []);

  return (
    <PhaseContext.Provider value={phase}>
      <div className="h-screen overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1560, margin: '0 auto', padding: '28px 40px 120px' }}>
          <button
            onClick={() => navigate('/ui-kit')}
            className="flex items-center gap-1.5 text-foreground-secondary hover:text-foreground transition-colors"
            style={{ fontSize: 13, marginBottom: 18 }}
          >
            <ArrowLeft className="w-4 h-4" /> UI Kit
          </button>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
            {SYNC_ENABLED ? 'Import & synchronisation email' : 'Import email → pièces du dossier'}
          </h1>
          <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 8px', maxWidth: 920, lineHeight: '21px' }}>
            {SYNC_ENABLED ? (
              <>Deux natures de geste, un seul système : piocher (Ajouter - ponctuel, figé) et lier
              (Suivre - source vivante, synchronisée). À gauche on choisit, à droite on vérifie ; la
              sync ne détruit jamais et ne verse jamais silencieusement ; les échecs sont des lignes,
              pas des silences ; la détection propose, l'utilisateur dispose. Le calque sync (phase 2)
              se lève d'un flag - rien ne change de place.</>
            ) : (
              <>Alimenter un dossier depuis la boîte mail : on pioche des échanges, des PJ, des
              fichiers. À gauche on choisit (objets entiers), à droite on vérifie (corps du mail et
              chaque PJ, curables) ; rien ne s'écrase silencieusement ; la détection propose,
              l'utilisateur dispose.</>
            )}
          </p>

          <div style={{ height: 1, background: '#f0eee9', margin: '20px 0 24px' }} />

          {/* ── Film de présentation - le parcours en 5 gestes clés ── */}
          {SYNC_ENABLED && <FilmSection />}

          <div className="flex gap-4">
            <LauncherCard
              badge="Geste C bis · premier import"
              title="Premier import email"
              desc="Le même geste sur un dossier qui n'a JAMAIS importé depuis la boîte mail (Petit c/ MAIF) : pas de « Vos habituels » (la frecency n'existe pas encore), aucun « Déjà suivi » - la colonne s'ouvre sur la boîte nue. Les habituels naîtront de ce premier import."
              onOpen={() => setModal('cbis')}
            />
            <LauncherCard
              badge="Geste C · ajouter"
              title="Ajouter des pièces"
              desc="Le geste le plus fréquent : compléter un dossier avec quelques mails, PJ, fichiers. Colonne mail à gauche (recherche globale, drill-down, carte « en entier »), panier en cartes à droite - un clic à gauche (« + Ajouter ») transvase l'objet entier, la curation corps / PJ se fait à droite. CTA « Ajouter au dossier / Ajouter et suivre »."
              onOpen={() => setModal('c')}
            />
            <LauncherCard
              badge="Geste B · créer"
              title="Nouveau dossier"
              desc="B = C + fiche, en deux étapes : la fiche (nom, client, « Créer sans contenu »), puis le contenu initial - même colonne mail, même panier. Nom prérempli par le premier dossier Outlook ajouté ; un dossier ajouté ici est suivi par défaut (création = miroir). Un échange, lui, est un objet importé - jamais une source."
              onOpen={() => setModal('b')}
            />
            {SYNC_ENABLED && (
              <LauncherCard
                badge="Geste A · vivre"
                title="Dossier vivant - pièces & sources"
                desc="La page Pièces : arborescence, vue « Nouveautés » transverse (bleu), provenance en méta avec filtre par source, drop Finder. Le panneau Sources (master–détail–ajout) : toggle Suivi inline, sync manuelle par source, historique avec échecs en rouge, destination obligatoire, retrait avec choix conserver / retirer."
                onOpen={() => setModal('a')}
              />
            )}
          </div>

          {/* ── Explication de l'epic (pour l'équipe et les parcours user) ── */}
          {SYNC_ENABLED && (
            <ExplainSection kicker="Le modèle mental" title="Deux natures de geste, un seul système">
              <p className="text-[14px] text-foreground-secondary leading-relaxed mb-5" style={{ maxWidth: 840 }}>
                Alimenter un dossier depuis la boîte mail, ce n'est pas une action mais deux intentions.
                On ne demande jamais à l'avocat de choisir un paradigme en amont :{' '}
                <span className="font-medium text-foreground">chaque point d'entrée porte déjà son intention</span>.
              </p>
              <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 840 }}>
                <GestureCard
                  accent="#78716c"
                  tag="Piocher"
                  verb="Ajouter"
                  lead="Prélèvement ponctuel, figé."
                  body="Je prends ces pièces-là, maintenant. Une curation fine et légitime. Rien ne bouge après : c'est un instantané."
                />
                <GestureCard
                  accent="#1e3a8a"
                  tag="Lier"
                  verb="Suivre"
                  lead="Source vivante, synchronisée."
                  body="Je branche un flux - dossier Outlook, thread ou expéditeur. Les prochains messages arriveront tout seuls, marqués « Nouveau »."
                />
              </div>
            </ExplainSection>
          )}

          <ExplainSection kicker="Le vocabulaire" title={SYNC_ENABLED ? 'Quatre verbes, jamais de synonyme sur un contrôle' : 'Le vocabulaire, jamais de synonyme sur un contrôle'}>
            <div className="flex flex-wrap gap-2.5" style={{ maxWidth: 840 }}>
              <VerbChip verb="Ajouter" gloss="prendre une fois (figé)" />
              {SYNC_ENABLED && <VerbChip verb="Suivre" gloss="activer le flux (vivant)" />}
              <VerbChip verb="Retirer" gloss={SYNC_ENABLED ? 'couper le lien, jamais les pièces' : 'retirer du panier avant import'} />
              <VerbChip verb="Découper" gloss="scinder un document en pièces" />
            </div>
            {SYNC_ENABLED && (
              <p className="text-[13px] text-foreground-muted leading-relaxed mt-3.5" style={{ maxWidth: 840 }}>
                Et quatre états, mêmes couleurs partout :
                <StateTag c="#4a9168" bg="#e4efe8">Suivi</StateTag>·
                <StateTag c="#78716c">Non suivi</StateTag>·
                <StateTag c="#3d7a57" bg="#e4efe8">Déjà suivi</StateTag>·
                <StateTag c="#1e3a8a" bg="#dfe8f5">Nouveau</StateTag>
                (pièce arrivée par sync).
              </p>
            )}
          </ExplainSection>

          <ExplainSection kicker="Les parcours" title="Quatre portes, dans l'ordre de la vie d'un dossier">
            <div className="flex flex-col gap-3" style={{ maxWidth: 940 }}>
              <GestureDetail
                gest="C bis" title="Premier import" when="le dossier n'a jamais touché la boîte mail"
                lead="Le même écran que le geste C, mais sur un dossier vierge de tout import email."
                steps={[
                  "La colonne mail s'ouvre sur la boîte nue : « Dossiers Outlook » puis « Échanges récents », aucune ligne « Déjà suivi ».",
                  "On navigue : recherche globale, drill-down dans un dossier (avec fil d'Ariane), ou carte « Ajouter en entier ».",
                  "Un clic (« + Ajouter ») transvase immédiatement à droite - pas d'étape « Ajouter à la liste ». La gauche prend des objets entiers (échange, dossier).",
                  "Le panier vérifie à droite : corps du mail et chaque PJ y sont des pièces cochables - on décoche une pièce de trop, on découpe si besoin, puis « Ajouter au dossier ».",
                ]}
                rule="Ce premier import fait naître la frecency - dès la fois suivante, ce sera le geste C, habituels en tête."
                onOpen={() => setModal('cbis')}
              />
              <GestureDetail
                gest="C" title="Ajouter des pièces" when="le quotidien, compléter un dossier qui vit déjà"
                lead="Le geste le plus fréquent. Tout est là : navigation à l'échelle, transvasement pièce par pièce, découpe, suivi."
                steps={[
                  "Recherche globale à l'échelle (134 dossiers), drill-down, carte « en entier » qui neutralise les enfants (jamais dossier + enfants).",
                  "Un clic transvase l'échange entier ; « Tout sélectionner » prend les échanges d'une vue. À droite, la carte décompose : corps du mail + PJ, chacun décochable.",
                  "Les sources déjà suivies sont inertes, badge « Déjà suivi » - on ne re-prend pas ce qui arrive tout seul.",
                  "À droite, panier en cartes : on décoche une pièce de trop (la ligne reste, jamais barrée), « ✕ » retire une carte entière ; découpe par pièce ou « Tout découper ».",
                  "On choisit la destination (« Ajouter dans : … »), puis « Ajouter au dossier » (ou « Ajouter et suivre »).",
                ]}
                rule="Transvasement, pas miroir : gauche = disponible, droite = retenu. « + Ajouter » = il reste à prendre ; estompé + badge « Ajouté » = plus rien à prendre ici."
                onOpen={() => setModal('c')}
              />
              <GestureDetail
                gest="B" title="Nouveau dossier" when="une nouvelle affaire arrive"
                lead="B = C + une fiche. Créer l'affaire et composer son contenu initial d'un seul geste."
                steps={[
                  "Étape 1 - la fiche : nom du dossier, client. « Continuer », ou « Créer sans contenu » pour un dossier-coquille.",
                  "Étape 2 - le contenu initial : même colonne mail, même panier. Le nom se pré-remplit du premier dossier Outlook ajouté (éditable).",
                  "Ni « habituels » ni « Déjà suivi » (le dossier n'existe pas encore) ; « Déjà lié à … » signale un dossier Outlook déjà miroir d'une autre affaire.",
                  "« ← Retour » préserve la composition ; « Créer le dossier » (ou « Créer et suivre »).",
                ]}
                rule="Un dossier Outlook ajouté ici est suivi par défaut - création = déclaration de miroir, le seul opt-out du système. Un échange n'est jamais une source : il est importé, un instantané - seul le dossier se suit."
                onOpen={() => setModal('b')}
              />
              {SYNC_ENABLED && (
                <GestureDetail
                  gest="A" title="Dossier vivant" when="le dossier est alimenté et se met à jour seul"
                  lead="Deux surfaces : les pièces (ce que l'avocat lit) et les sources (les tuyaux qui alimentent)."
                  steps={[
                    "Onglet Pièces : tableau-arbre par catégorie (Correspondance, adverses, médicales…), recherche, pagination - l'anatomie réelle de l'app.",
                    "Vue « Nouveautés » en tête d'arbre (bleu, transverse) : une sync bascule dessus ; la revisiter éteint les points, la provenance reste.",
                    "Chaque pièce porte sa provenance (« via [source] ») ; un clic filtre les pièces de cette source.",
                    "Panneau Sources : connexion + « Vérifier maintenant », sources suivies avec toggle Suivi inline et « Synchroniser » par source, suggestions.",
                    "Fiche d'une source : Suivi / Découpe automatique / Destination (obligatoire) + historique daté ; « Retirer » demande conserver ou retirer les pièces.",
                  ]}
                  rule="La sync ajoute (marqué « Nouveau »), ne verse jamais silencieusement, ne supprime jamais ; retirer coupe le flux, pas les pièces."
                  onOpen={() => setModal('a')}
                />
              )}
            </div>
          </ExplainSection>

          {SYNC_ENABLED && (
            <ExplainSection kicker="Le phasage" title="Un flag lève un calque - rien ne change de place">
              <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 840 }}>
                <PhaseCard n="Phase 1" title="Les imports ponctuels"
                  body="Seul le monde « piocher ». On ajoute des mails et des fichiers, une fois. Aucun objet suivi n'est visible : ni toggle, ni panneau Sources, ni « Nouveautés »." />
                <PhaseCard n="Phase 2" title="Le calque sync" accent
                  body="Les mêmes écrans + le suivi : toggles « Suivre », badges « Déjà suivi », panneau Sources, vue « Nouveautés », synchronisation. Rien ne bouge de place, un calque se pose." />
              </div>
              <p className="text-[13px] text-foreground-muted leading-relaxed mt-3.5" style={{ maxWidth: 840 }}>
                Le sélecteur <span className="font-medium text-foreground">Lab</span> en bas à gauche bascule entre les deux en direct - la meilleure preuve de modularité : on retire la sync devant témoins.
              </p>
            </ExplainSection>
          )}

          <ExplainSection kicker="Les principes" title="Ce qui ne se négocie pas">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5" style={{ maxWidth: 940 }}>
              <Principle>À gauche on choisit, à droite on vérifie.</Principle>
              {SYNC_ENABLED
                ? <Principle>La sync ne détruit jamais, ne verse jamais silencieusement.</Principle>
                : <Principle>Rien ne s'écrase silencieusement ; un doublon est signalé.</Principle>}
              <Principle>Les échecs sont des lignes, pas des silences.</Principle>
              <Principle>La détection propose, l'utilisateur dispose.</Principle>
              <Principle>Défauts conservateurs : pas de découpe par défaut, rien d'irréversible sans geste.</Principle>
              <Principle>La provenance est une métadonnée, pas un rangement.</Principle>
            </div>
          </ExplainSection>
        </div>

        {modal === 'c' && (
          <GesteCModal
            onClose={() => setModal(null)}
            onCommit={commitGesteC}
            connected={connected}
            onConnect={() => setConnected(true)}
            dejaSuiviFolderIds={dejaSuiviFolderIds}
            dejaSuiviThreadIds={dejaSuiviThreadIds}
            importInfo={importInfo}
            demoSeed={demoSeed}
          />
        )}
        {modal === 'cbis' && (
          <GesteCModal
            onClose={() => setModal(null)}
            onCommit={commitGesteCBis}
            connected={connected}
            onConnect={() => setConnected(true)}
            dejaSuiviFolderIds={new Set()}
            dejaSuiviThreadIds={new Set()}
            dossierLabel="Petit c/ MAIF"
          />
        )}
        {modal === 'b' && (
          <GesteBModal
            onClose={() => setModal(null)}
            onCommit={commitGesteB}
            connected={connected}
            onConnect={() => setConnected(true)}
          />
        )}
        {modal === 'a' && (
          <PiecesPage
            onClose={() => setModal(null)}
            onToast={showToast}
            onOpenGesteC={() => setModal('c')}
            pieces={pieces}
            sources={sources}
            suggestions={suggestions}
            api={api}
            connected={connected}
            onConnect={() => setConnected(true)}
          />
        )}

        {/* Contrôles lab flottants - hors UI produit : phase + connexion.
            Repliés par défaut pour ne jamais recouvrir les footers des modales. */}
        <div className="fixed bottom-4 left-4 z-[70]">
          {labOpen ? (
            <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 shadow-lg" style={{ backgroundColor: '#fcfbfa' }}>
              <button onClick={() => setLabOpen(false)} style={monoLabel} className="hover:opacity-70 transition-opacity" title="Replier">Lab</button>
              {SYNC_ENABLED && (
                <LabSeg
                  value={phase}
                  onChange={setPhase}
                  options={[{ value: 1, label: 'Phase 1 · imports' }, { value: 2, label: 'Phase 2 · + sync' }]}
                />
              )}
              <span className="flex items-center gap-1.5">
                <LabSwitch checked={connected} onChange={setConnected} />
                <span className="text-[11px] font-medium text-foreground-secondary">Email connecté</span>
              </span>
              <button onClick={reset} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-muted hover:text-foreground transition-colors" title="Restaurer les données de démonstration">
                <RotateCcw className="w-3 h-3" strokeWidth={2} /> Réinitialiser
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLabOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border px-3 h-8 shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#fcfbfa' }}
              title="Contrôles du lab : phase, connexion email, réinitialisation"
            >
              <span style={monoLabel}>Lab</span>
              <span className="text-[10px] font-medium tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace", color: phase === 2 ? '#1e3a8a' : '#78716c' }}>
                P{phase}
              </span>
              {!connected && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#b45309' }} aria-hidden />}
            </button>
          )}
        </div>

        {toast && (
          <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] min-h-10 py-2 pl-4 pr-2 rounded-lg text-white text-sm flex items-center gap-3 shadow-lg" style={{ maxWidth: 760, backgroundColor: '#292524' }}>
            <span className="leading-5">{toast.text}</span>
            {toast.action ? (
              <button
                onClick={() => { toast.action.onClick(); setToast(null); }}
                className="h-7 px-2.5 rounded-md text-xs font-medium flex-shrink-0 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
              >
                {toast.action.label}
              </button>
            ) : <span className="w-1" />}
          </div>
        )}
      </div>
    </PhaseContext.Provider>
  );
}

// ── Film de présentation ────────────────────────────────────────────────────
// Le parcours en 5 gestes clés, en deux étapes (ajout simple, puis sync). Les
// chapitres pointent aux frames réelles du montage Remotion (30 fps).
const FILM_CHAPTERS = [
  { t: 5.0, step: 'Étape 1', label: 'L\'ajout simple', act: true },
  { t: 8.7, step: 'Geste 1', label: 'Piocher dans la boîte' },
  { t: 19.3, step: 'Geste 2', label: 'Vérifier, puis ajouter' },
  { t: 30.0, step: 'Étape 2', label: 'Avec la synchronisation', act: true },
  { t: 33.7, step: 'Geste 3', label: 'Suivre : activer le flux' },
  { t: 43.0, step: 'Geste 4', label: 'Laisser faire' },
  { t: 53.0, step: 'Geste 5', label: 'Garder la main' },
];

function FilmSection() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(0);

  const seek = (i) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = FILM_CHAPTERS[i].t;
    v.play?.();
    setActive(i);
  };

  const onTime = () => {
    const t = videoRef.current?.currentTime ?? 0;
    let i = 0;
    for (let k = 0; k < FILM_CHAPTERS.length; k++) if (t >= FILM_CHAPTERS[k].t - 0.15) i = k;
    setActive(i);
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wider text-foreground-muted mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Le film
      </div>
      <h2 className="text-[19px] font-semibold text-foreground mb-1">Le parcours en 5 gestes clés</h2>
      <p className="text-[13px] text-foreground-secondary leading-5 mb-4" style={{ maxWidth: 840 }}>
        De la boîte mail aux pièces, filmé comme une suite de gestes : piocher, vérifier, ajouter -
        puis suivre, laisser faire, garder la main. Cliquez un chapitre pour y sauter.
      </p>

      <div className="rounded-2xl border border-border overflow-hidden bg-white shadow-sm" style={{ maxWidth: 1120 }}>
        <video
          ref={videoRef}
          src="/norma-emails.mp4"
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={onTime}
          className="block w-full"
          style={{ backgroundColor: '#eeece6', aspectRatio: '16 / 9' }}
        />
        <div className="flex flex-wrap gap-1.5 p-3 border-t border-border" style={{ backgroundColor: '#fcfbfa' }}>
          {FILM_CHAPTERS.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.t}
                onClick={() => seek(i)}
                className="inline-flex items-baseline gap-1.5 h-7 px-2.5 rounded-lg transition-colors"
                style={{
                  border: `1px solid ${on ? '#292524' : '#e7e5e3'}`,
                  backgroundColor: on ? '#292524' : c.act ? '#f5f4f1' : '#ffffff',
                }}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace", color: on ? '#d6d3d1' : '#a8a29e' }}>{c.step}</span>
                <span className="text-[12px] font-medium" style={{ color: on ? '#ffffff' : c.act ? '#292524' : '#57534e' }}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LauncherCard({ badge, title, desc, onOpen }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-border bg-white p-5 flex flex-col gap-3 shadow-sm">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{badge}</span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-foreground-secondary leading-5 flex-1">{desc}</p>
      <button onClick={onOpen} className="h-9 px-4 text-sm font-medium text-white bg-foreground rounded-lg shadow-sm hover:bg-foreground-tertiary transition-colors self-start">
        Ouvrir en taille réelle
      </button>
    </div>
  );
}

// ── Atomes de l'explication (équipe + parcours) ─────────────────────────────
const EXPLAIN_MONO = { fontFamily: "'IBM Plex Mono', monospace" };

function ExplainSection({ kicker, title, children }) {
  return (
    <section style={{ marginTop: 46 }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wider text-foreground-muted mb-1" style={EXPLAIN_MONO}>{kicker}</div>
      <h2 className="text-[17px] font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function GestureCard({ accent, tag, verb, lead, body }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ ...EXPLAIN_MONO, color: accent }}>{tag}</span>
        <span className="text-[12px] text-foreground-muted">= « {verb} »</span>
      </div>
      <p className="text-[15px] font-semibold text-foreground">{lead}</p>
      <p className="text-[13.5px] text-foreground-secondary leading-relaxed">{body}</p>
    </div>
  );
}

function VerbChip({ verb, gloss }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
      <span className="text-[13px] font-semibold text-foreground">{verb}</span>
      <span className="text-[12px] text-foreground-muted">{gloss}</span>
    </span>
  );
}

function StateTag({ children, c, bg }) {
  return (
    <span className="inline-flex items-center h-[18px] px-1.5 rounded text-[11px] font-medium align-middle mx-1" style={{ color: c, backgroundColor: bg || 'transparent' }}>{children}</span>
  );
}

function GestureDetail({ gest, title, when, lead, steps, rule, onOpen }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 inline-flex items-center justify-center h-6 min-w-[46px] px-2 rounded-md text-[11px] font-semibold text-white mt-0.5" style={{ backgroundColor: '#292524', ...EXPLAIN_MONO }}>{gest}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className="text-[15px] font-semibold text-foreground">{title}</span>
              <span className="text-[12px] text-foreground-muted">- {when}</span>
            </div>
            <button onClick={onOpen} className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-foreground-secondary hover:text-foreground transition-colors">
              Ouvrir <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="text-[13.5px] text-foreground-secondary leading-relaxed mt-1">{lead}</p>
          <ol className="mt-3 flex flex-col gap-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] font-medium tabular-nums mt-px" style={{ ...EXPLAIN_MONO, backgroundColor: '#f2f0ec', color: '#78716c' }}>{i + 1}</span>
                <span className="text-[13px] text-foreground-secondary leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          {rule && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg px-3 py-2" style={{ backgroundColor: '#faf9f7' }}>
              <span className="text-[10px] font-medium uppercase tracking-wider flex-shrink-0 mt-0.5" style={{ ...EXPLAIN_MONO, color: '#a8a29e' }}>Règle</span>
              <span className="text-[12.5px] text-foreground-secondary leading-relaxed">{rule}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ n, title, body, accent }) {
  return (
    <div className="rounded-xl border p-4" style={accent ? { borderColor: '#dfe8f5', backgroundColor: '#f8fafd' } : { borderColor: '#e7e5e3', backgroundColor: '#ffffff' }}>
      <div className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ ...EXPLAIN_MONO, color: accent ? '#1e3a8a' : '#a8a29e' }}>{n}</div>
      <div className="text-[14px] font-semibold text-foreground mb-1">{title}</div>
      <p className="text-[13px] text-foreground-secondary leading-relaxed">{body}</p>
    </div>
  );
}

function Principle({ children }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-1" strokeWidth={2.5} style={{ color: '#4a9168' }} />
      <span className="text-[13.5px] text-foreground-secondary leading-relaxed">{children}</span>
    </div>
  );
}
