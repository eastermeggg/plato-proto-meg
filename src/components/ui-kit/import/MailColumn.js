// Colonne mail (gauche) - TRANSVASEMENT : un clic prend et transvase
// immédiatement à droite ; aucun tray, aucune étape « Ajouter à la liste ».
//
// Règle unique à tous les niveaux : « + Ajouter » (au survol) = il reste
// quelque chose à prendre ; estompé + badge « Ajouté » = plus rien à prendre
// ici. Pas de case à gauche : la gauche ne manipule que des OBJETS ENTIERS
// (échange, dossier) et un état pris s'exprime en badge, pas en coche - la
// curation pièce par pièce (corps du mail, chaque PJ) vit à droite, dans la
// carte du panier. L'état de chaque ligne est DÉRIVÉ des items du panier
// (source de vérité unique).

import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, FolderOpen, Inbox, ListCollapse, Mail, Paperclip, Search, X, CheckCheck } from 'lucide-react';
import {
  normalize, relDate, LAB_THREADS, LAB_FOLDERS,
  folderById, folderBreadcrumb, childFolders, rootFolders, statsForDeep, threadsOfFolder,
  threadView, folderOfThread, ancestorFolderIds, DEJA_LIE, threadPreview,
} from './labData';
import { AjouteBadge, AjouterChip, DejaSuiviBadge, DejaImporteBadge, ConnectScreen, monoLabel, usePhase2 } from './atoms';
import { MetaDot, V2 } from '../import-v2/pieceRow';
import outlookLogo from '../../../assets/outlook.svg';

// Compteurs de la ligne méta (« 2 » de PJ, « 3 msg ») : mono 11 uppercase,
// comme le caption/header-cols de la planche Threads.
const metaMono = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 };

// Carte au survol : comprendre un échange sans l'ouvrir. Flotte à droite de la
// ligne survolée (position fixe → échappe au clip de la colonne).
function ThreadPreviewCard({ tid, rect }) {
  const p = threadPreview(tid);
  if (!p) return null;
  const CARD_W = 340;
  // Toujours à DROITE de la ligne (jamais de bascule à gauche qui recouvrirait
  // la colonne mail) - clampé au bord droit de la fenêtre si besoin.
  const left = Math.min(rect.right + 8, window.innerWidth - CARD_W - 12);
  const top = Math.min(Math.max(12, rect.top - 4), window.innerHeight - 380);
  return (
    <div
      className="fixed z-[80] rounded-xl border border-border bg-white overflow-hidden flex flex-col pointer-events-none"
      style={{ left, top, width: CARD_W, maxHeight: 380, boxShadow: '0 20px 45px -12px rgba(28,25,23,0.30)' }}
    >
      <div className="px-3.5 pt-3 pb-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-foreground-secondary" strokeWidth={2} />
          <div className="min-w-0">
            <p className={`text-[13px] leading-4 ${p.illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{p.subject}</p>
            <p className="text-[11px] text-foreground-muted mt-0.5 truncate">{p.sender} · {p.date}</p>
          </div>
        </div>
        {p.summary && <p className="text-[12px] text-foreground-secondary leading-[17px] mt-2">{p.summary}</p>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-2.5">
        <p className="mb-1.5" style={monoLabel}>Pièces · {p.pieces.length}</p>
        <div className="flex flex-col gap-1.5">
          {p.pieces.map((pc, i) => {
            const Icon = pc.kind === 'body' ? Mail : Paperclip;
            return (
              <div key={i} className="flex items-start gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-px" strokeWidth={2} style={{ color: pc.kind === 'body' ? V2.muted : V2.pjMini }} />
                <div className="min-w-0">
                  <p className="text-[12px] text-foreground truncate">
                    {pc.name}
                    {pc.detail && <span className="text-foreground-muted"> · {pc.detail}</span>}
                    {pc.type && <span className="ml-1.5 inline-flex items-center h-4 px-1 rounded bg-cream text-[9px] font-medium text-foreground-tertiary align-middle">{pc.type}</span>}
                  </p>
                  {pc.summary && <p className="text-[11px] text-foreground-muted leading-4 truncate">{pc.summary}</p>}
                </div>
              </div>
            );
          })}
        </div>
        {p.info && (
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex flex-wrap gap-1">
            {Object.entries(p.info).slice(0, 4).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1 h-5 px-1.5 rounded bg-background-canvas text-[10px] text-foreground-secondary">
                <span className="text-foreground-muted">{k}</span> <span className="font-medium text-foreground truncate" style={{ maxWidth: 130 }}>{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CAP_THREADS = 30;
const CAP_FOLDERS = 8;

function MonoHeader({ children, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
      <span style={monoLabel}>{children}</span>
      {right}
    </div>
  );
}

function CapLine({ n, hint = 'affinez la recherche' }) {
  if (n <= 0) return null;
  return <p className="px-4 py-1.5 text-[11px] text-foreground-muted">+ {n} autre{n > 1 ? 's' : ''} - {hint}</p>;
}

// « Tout sélectionner · N échanges » (spec §9) : prend d'un coup TOUS les
// threads preneurs de la vue courante (y compris au-delà du cap d'affichage -
// le panier montre tout ce qui a été pris). Jamais récursif, jamais une ligne
// inerte, jamais à la racine.
function SelectAll({ takeableTids, onTake }) {
  if (takeableTids.length === 0) return null;
  const n = takeableTids.length;
  return (
    <button
      type="button"
      onClick={() => onTake(takeableTids)}
      className="inline-flex items-center gap-1.5 h-[26px] px-2 text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream rounded transition-colors"
      title="Ajouter tous les échanges de cette vue"
    >
      <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
      Tout sélectionner · {n} échange{n > 1 ? 's' : ''}
    </button>
  );
}

export default function MailColumn({
  width = 440,
  threadStateMap, stagedFolderIds = new Set(),
  takeThread, takeThreadDelta, takeManyThreads, takeFolder, removeFolder, removeThread,
  dejaSuiviFolderIds = new Set(), dejaSuiviThreadIds = new Set(),
  importInfo = new Map(),
  connected = true, onConnect,
  onCollapse,
}) {
  const phase2 = usePhase2();
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]); // folderIds, racine = []
  const listRef = useRef(null);
  const q = normalize(query.trim());

  // Carte au survol : ouverte après un court délai (anti-flicker), fermée au
  // départ ou au scroll (le rect deviendrait obsolète).
  const [preview, setPreview] = useState(null); // { tid, rect }
  const previewTimer = useRef(null);
  const openPreview = (tid, el) => {
    clearTimeout(previewTimer.current);
    const rect = el.getBoundingClientRect();
    previewTimer.current = setTimeout(() => setPreview({ tid, rect }), 340);
  };
  const closePreview = () => { clearTimeout(previewTimer.current); setPreview(null); };

  const currentFolderId = path.length ? path[path.length - 1] : null;
  const currentFolder = currentFolderId ? folderById(currentFolderId) : null;

  // Un bloc pris couvre son contenu ET celui de ses sous-dossiers. On renvoie
  // le dossier couvrant : l'estompage s'explique en nommant qui inclut quoi.
  const coveringFolderOf = (fid) => {
    if (fid == null) return null;
    const staged = [fid, ...ancestorFolderIds(fid)].find(id => stagedFolderIds.has(id));
    return staged ? folderById(staged) : null;
  };
  const threadCoveredBy = (tid) => coveringFolderOf(folderOfThread(tid));
  const threadCovered = (tid) => threadCoveredBy(tid) != null;

  // État dérivé d'un thread. Fil déjà importé : la base de comparaison n'est
  // plus « toutes les pièces » mais le DELTA (ce qui n'est pas encore au
  // dossier) - on ne repropose jamais ce qui est déjà pris.
  const threadState = (tv) => {
    const imp = importInfo.get(tv.id);
    const s = threadStateMap.get(tv.id);
    if (imp) {
      const deltaN = imp.delta.length;
      if (deltaN === 0) return { kind: 'imported-done', total: 0, taken: 0, importedOn: imp.importedOn };
      const taken = s ? s.taken.size : 0;
      if (taken >= deltaN) return { kind: 'full', total: deltaN, taken };
      if (taken > 0) return { kind: 'partial', total: deltaN, taken };
      return { kind: 'imported-delta', total: deltaN, taken: 0, deltaN, importedOn: imp.importedOn };
    }
    const total = 1 + tv.pj; // corps + PJ
    if (!s) return { kind: 'available', total, taken: 0 };
    const taken = s.taken.size;
    if (taken >= total) return { kind: 'full', total, taken };
    return { kind: 'partial', total, taken };
  };

  // ── Données des vues ──
  const recentThreads = useMemo(() => [...LAB_THREADS].sort((a, b) => (a.date < b.date ? 1 : -1)).map(threadView), []);

  const searchResults = useMemo(() => {
    if (!q) return null;
    const folders = LAB_FOLDERS
      .filter(f => !(f.attributes || []).includes('\\Sent'))
      .filter(f => normalize(f.name).includes(q) || normalize(folderBreadcrumb(f)).includes(q));
    const threads = LAB_THREADS
      .filter(t => [t.subject, t.summary, t.snippet, ...(t.senders || []).flatMap(s => [s.name, s.email, s.role])].some(x => x && normalize(x).includes(q)))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(threadView);
    return { folders, threads };
  }, [q]);

  const folderChildren = useMemo(() => (currentFolderId ? childFolders(currentFolderId) : []), [currentFolderId]);
  const folderThreads = useMemo(() => (currentFolderId ? threadsOfFolder(currentFolderId) : []), [currentFolderId]);

  const enter = (fid) => { setPath(p => [...p, fid]); setQuery(''); listRef.current?.scrollTo?.({ top: 0 }); };

  // tids preneurs (available ou partiel, ni inertes ni couverts ni déjà
  // importés) parmi une liste. « Tout sélectionner » ne touche jamais un fil
  // déjà importé : son complément passe par le geste « nouvelles » dédié.
  const takeableOf = (tvs) => tvs
    .filter(tv => !(phase2 && dejaSuiviThreadIds.has(tv.id)) && !threadCovered(tv.id) && !importInfo.has(tv.id) && threadState(tv).kind !== 'full')
    .map(tv => tv.id);

  // Les threads couverts par un bloc pris ne se rendent PAS ligne par ligne
  // (N lignes inertes identiques = bruit sans action) : ils se replient en une
  // ligne de résumé par dossier couvrant. Le contenu reste visible dans
  // l'aperçu du panier ; retirer le bloc les fait tous réapparaître.
  const splitCovered = (tvs) => {
    const visible = [];
    const covered = new Map(); // nom du dossier couvrant → nombre d'échanges
    tvs.forEach(tv => {
      const cb = threadCoveredBy(tv.id);
      if (cb) covered.set(cb.name, (covered.get(cb.name) || 0) + 1);
      else visible.push(tv);
    });
    return { visible, covered: [...covered.entries()] };
  };

  const coveredLines = (covered) => covered.map(([name, n]) => (
    <p key={name} className="px-4 py-1.5 text-[11px] text-foreground-muted">
      {n} échange{n > 1 ? 's' : ''} inclus via « {name} » - aperçu dans le panier
    </p>
  ));

  // ── Ligne dossier (planche « Import / Inbox / Folder » 3315:64853) ──
  // p-12, gap-8, chevron 12 · folder-open 16 VERT · nom 14 medium, border-b ;
  // Ajouté / inerte = contenu à 50 %, badge à pleine opacité ; survol = fond
  // accent + bouton primaire « + Ajouter » sur voile dégradé.
  const folderRow = (f, { showPath = false } = {}) => {
    const fid = f.id;
    const dejaSuivi = phase2 && dejaSuiviFolderIds.has(fid);
    const dejaLie = phase2 && DEJA_LIE[fid];
    const taken = stagedFolderIds.has(fid);
    // Couvert par un dossier parent déjà pris : inerte, la raison est nommée.
    const coveredBy = !taken ? coveringFolderOf(f.parentId) : null;
    const inert = dejaSuivi || !!dejaLie || !!coveredBy;
    const dimmed = inert || taken;
    const st = statsForDeep(fid);
    const isInbox = (f.attributes || []).includes('\\Inbox');
    const Icon = isInbox ? Inbox : FolderOpen;
    return (
      <div
        key={fid}
        className={`group relative flex items-center gap-2 p-3 bg-surface border-b border-border transition-colors ${dimmed ? '' : 'hover:bg-background'}`}
      >
        <button
          type="button"
          onClick={() => { if (!dejaSuivi && !coveredBy && !taken) enter(fid); }}
          className={`flex-1 min-w-0 flex items-center gap-2 text-left ${dimmed ? 'cursor-default' : ''}`}
          style={dimmed ? { pointerEvents: 'none' } : undefined}
          title={dimmed ? undefined : `${st.threads} échange${st.threads > 1 ? 's' : ''} · ${st.pieces} pièces`}
        >
          <ChevronRight className={`w-3 h-3 text-foreground-secondary flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`} strokeWidth={2} />
          <Icon className={`w-4 h-4 flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`} strokeWidth={2} style={{ color: V2.folder }} />
          <span className={`flex-1 min-w-0 ${dimmed ? 'opacity-50' : ''}`}>
            <span className="text-[14px] leading-5 font-medium text-foreground truncate block">{f.name}</span>
            {coveredBy ? (
              <span className="text-xs leading-4 text-foreground-secondary truncate block">Déjà couvert par « {folderBreadcrumb(coveredBy)} »</span>
            ) : showPath ? (
              <span className="text-xs leading-4 text-foreground-muted truncate block">{folderBreadcrumb(f)}</span>
            ) : null}
          </span>
          {!taken && !coveredBy && (dejaSuivi ? <DejaSuiviBadge />
            : dejaLie ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-warning-subtle text-warning-text text-[12px] leading-4 font-medium flex-shrink-0 whitespace-nowrap">
                Déjà lié à {dejaLie}
              </span>
            ) : null)}
        </button>
        {taken && <AjouteBadge onRemove={() => removeFolder(fid)} title="Retirer le dossier" />}
        {!inert && !taken && <AjouterChip onAdd={() => takeFolder(fid)} title="Ajouter tout le dossier (sous-dossiers compris)" />}
      </div>
    );
  };

  // ── Ligne thread (planche « Import / Inbox / Threads » 3330:32733) ──
  // p-14, gap-8, chevron 12 · titre 14 medium · méta 12 (date medium · exp ·
  // trombone 12 + compteur mono 11) · aperçu 12 derrière un filet violet
  // (border-l-2 ai-text) ; ajouté/inclus/inerte = contenu à 50 %, badge plein ;
  // survol = fond accent + bouton primaire « + Ajouter » sur voile dégradé.
  const threadRow = (tv) => {
    const tid = tv.id;
    const dejaSuivi = phase2 && dejaSuiviThreadIds.has(tid);
    const coveredBy = threadCoveredBy(tid);
    const covered = coveredBy != null;
    const baseInert = dejaSuivi || covered;
    const state = baseInert ? { kind: 'inert' } : threadState(tv);
    const importedDone = state.kind === 'imported-done';
    const importedDelta = state.kind === 'imported-delta';
    const inert = baseInert || importedDone; // rien de neuf → inerte
    const dimmed = inert || state.kind === 'full'; // Figma : added / included / inertes
    return (
      <React.Fragment key={tid}>
        <div
          className={`group relative flex items-start gap-2 p-3.5 bg-surface border-b border-border transition-colors ${dimmed ? '' : 'hover:bg-background'}`}
          onMouseEnter={(e) => openPreview(tid, e.currentTarget)}
          onMouseLeave={closePreview}
        >
          <span className={`flex items-center py-1 flex-shrink-0 ${dimmed ? 'opacity-50' : ''}`}>
            <ChevronRight className="w-3 h-3 text-foreground-secondary" strokeWidth={2} />
          </span>
          {/* Corps de ligne : clic = prendre l'échange. Le badge « Ajouté »
              porte le seul retrait ; le contenu n'est alors pas cliquable. */}
          <button
            type="button"
            onClick={dimmed ? undefined : () => (importedDelta ? takeThreadDelta(tid) : takeThread(tid))}
            className={`flex-1 min-w-0 flex flex-col gap-2 text-left ${dimmed ? 'opacity-50 cursor-default' : ''}`}
            style={dimmed ? { pointerEvents: 'none' } : undefined}
            title={dimmed ? undefined : importedDelta ? 'Ajouter les nouvelles pièces' : state.kind === 'partial' ? 'Ajouter le reste' : 'Ajouter cet échange'}
          >
            <span className="flex flex-col gap-0.5 min-w-0 w-full">
              <span className={`text-[14px] leading-5 truncate ${tv.illegible ? 'italic text-foreground-secondary font-normal' : 'font-medium text-foreground'}`}>{tv.subject}</span>
              <span className="flex items-center gap-1 min-w-0">
                <span className="text-xs leading-4 font-medium text-foreground-secondary flex-shrink-0 tabular-nums">{relDate(tv.date)}</span>
                <MetaDot />
                <span className="text-xs leading-4 text-foreground-secondary truncate" style={{ letterSpacing: 0.12 }}>
                  {covered ? `Inclus via « ${coveredBy.name} »` : tv.sender}
                </span>
                {tv.illegible && <span className="text-[10px] italic text-foreground-muted flex-shrink-0">objet illisible</span>}
                {tv.msg > 1 && !covered && (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1 flex-shrink-0">
                      <Mail className="w-3 h-3 text-foreground-secondary" strokeWidth={2} />
                      <span className="font-medium uppercase text-foreground-secondary" style={metaMono}>{tv.msg} msg</span>
                    </span>
                  </>
                )}
                {tv.pj > 0 && !covered && (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1 flex-shrink-0">
                      <Paperclip className="w-3 h-3 text-info-text" strokeWidth={2} />
                      <span className="font-medium uppercase text-foreground-secondary" style={metaMono}>{tv.pj}</span>
                    </span>
                  </>
                )}
              </span>
            </span>
            {/* Ligne 3 : aperçu du fil derrière le filet violet - OU, pour un
                fil déjà importé, l'état de complétude (delta ou « à jour »). */}
            {importedDelta ? (
              <span className="w-full border-l-2 border-warning pl-2 text-xs leading-4 font-medium text-warning-text">
                {state.deltaN} nouvelle{state.deltaN > 1 ? 's' : ''} pièce{state.deltaN > 1 ? 's' : ''} depuis l'import du {state.importedOn}
              </span>
            ) : importedDone ? (
              <span className="w-full border-l-2 border-border pl-2 text-xs leading-4 text-foreground-muted truncate">Importé le {state.importedOn} · à jour</span>
            ) : tv.summary && !covered ? (
              <span className="w-full border-l-2 border-ai-text pl-2 text-xs leading-4 text-foreground-secondary line-clamp-2" style={{ letterSpacing: 0.12 }}>
                {tv.summary}
              </span>
            ) : null}
          </button>
          {/* Badges à droite, toujours à pleine opacité. */}
          {state.kind === 'partial' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[12px] leading-4 font-medium flex-shrink-0 tabular-nums whitespace-nowrap">
              {state.taken}/{state.total} ajouté
            </span>
          )}
          {(importedDone || importedDelta) && <DejaImporteBadge />}
          {dejaSuivi && <DejaSuiviBadge />}
          {state.kind === 'full' && <AjouteBadge onRemove={() => removeThread(tid)} title="Retirer l'échange" />}
          {/* Pas de dépliage sur un échange : la gauche prend des objets
              entiers, la curation corps/PJ vit dans la carte du panier. */}
          {!inert && state.kind !== 'full' && (
            <AjouterChip
              onAdd={() => (importedDelta ? takeThreadDelta(tid) : takeThread(tid))}
              label={importedDelta ? `${state.deltaN} nouvelle${state.deltaN > 1 ? 's' : ''}` : state.kind === 'partial' ? 'Ajouter le reste' : 'Ajouter'}
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  // Tête de dossier ouvert (frame MailColumn 3377:47379, vue dossier) : la
  // barre secondaire pleine largeur « Ajouter tout le dossier → ». Les stats
  // PROFONDES (sous-dossiers compris) restent portées par le title. Les états
  // pris / inertes gardent une carte d'état avec leur badge.
  const enEntierCard = () => {
    const fid = currentFolderId;
    const f = currentFolder;
    if (!f) return null;
    const dejaSuivi = phase2 && dejaSuiviFolderIds.has(fid);
    const dejaLie = phase2 && DEJA_LIE[fid];
    const taken = stagedFolderIds.has(fid);
    const coveredBy = !taken ? coveringFolderOf(f.parentId) : null;
    const inert = !!(dejaSuivi || dejaLie || coveredBy);
    const st = statsForDeep(fid);
    const hasSub = folderChildren.length > 0;
    if (!inert && !taken) {
      return (
        <div className="px-4 pt-2 pb-1">
          <button
            type="button"
            onClick={() => takeFolder(fid)}
            className="w-full h-9 rounded-lg bg-secondary text-secondary-foreground text-[14px] leading-5 font-medium inline-flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
            title={`${st.threads} échange${st.threads > 1 ? 's' : ''} · ≈ ${st.pieces} pièces${hasSub ? ' · sous-dossiers compris' : ''}${phase2 ? ' · suivable' : ''}`}
          >
            Ajouter tout le dossier
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      );
    }
    return (
      <div className="group relative mx-4 mt-1 rounded-lg border border-border p-3 flex items-center gap-2.5 bg-surface" style={{ opacity: taken ? 1 : 0.55 }}>
        <span className="flex-1 min-w-0">
          <span className="text-[14px] leading-5 font-medium text-foreground truncate block">Ajouter « {f.name} » en entier</span>
          <span className="text-xs leading-4 text-foreground-muted truncate block">
            {coveredBy
              ? `Déjà couvert par « ${folderBreadcrumb(coveredBy)} »`
              : <>{st.threads} échange{st.threads > 1 ? 's' : ''} · ≈ {st.pieces} pièces{hasSub ? ' · sous-dossiers compris' : ''}</>}
          </span>
        </span>
        {taken ? <AjouteBadge onRemove={() => removeFolder(fid)} title="Retirer le dossier" />
          : dejaSuivi ? <DejaSuiviBadge /> : dejaLie ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-warning-subtle text-warning-text text-[12px] leading-4 font-medium flex-shrink-0 whitespace-nowrap">
              Déjà lié à {dejaLie}
            </span>
          ) : null}
      </div>
    );
  };

  // ── Vues ──
  // Pas de « Tout sélectionner » à la racine (spec §9) : la vue mêle dossiers
  // et échanges récents, « tout » n'y a pas de sens défendable.
  const rootView = () => {
    // Deux catégories, point : les dossiers (affaires) puis les échanges
    // récents. Chacune est plafonnée pour rester lisible - le reste se
    // retrouve par la recherche ; jamais un mur de 26 dossiers qui enterre
    // les échanges.
    const roots = rootFolders();
    const fShown = roots.slice(0, CAP_FOLDERS);
    const { visible, covered } = splitCovered(recentThreads);
    const shown = visible.slice(0, 12);
    return (
      <>
        <MonoHeader>Dossiers</MonoHeader>
        {fShown.map(f => folderRow(f))}
        <CapLine n={roots.length - fShown.length} hint="recherchez un dossier" />
        <MonoHeader>Échanges récents</MonoHeader>
        {shown.map(tv => threadRow(tv))}
        {coveredLines(covered)}
        <CapLine n={visible.length - shown.length} />
      </>
    );
  };

  const searchView = () => {
    const { folders, threads } = searchResults;
    const fShown = folders.slice(0, CAP_FOLDERS);
    const { visible, covered } = splitCovered(threads);
    const tShown = visible.slice(0, CAP_THREADS);
    // « Tout » = tous les résultats, pas la tranche affichée.
    const takeable = takeableOf(threads);
    if (folders.length === 0 && threads.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Mail className="w-5 h-5 text-foreground-muted" strokeWidth={1.5} />
          <p className="text-xs text-foreground-secondary px-6">Aucun dossier ni échange ne correspond à « {query.trim()} »</p>
        </div>
      );
    }
    return (
      <>
        {fShown.length > 0 && (
          <>
            <MonoHeader>Dossiers Outlook · {folders.length}</MonoHeader>
            {fShown.map(f => folderRow(f, { showPath: true }))}
            <CapLine n={folders.length - fShown.length} />
          </>
        )}
        {(tShown.length > 0 || covered.length > 0) && (
          <>
            <MonoHeader right={<SelectAll takeableTids={takeable} onTake={takeManyThreads} />}>Échanges · {threads.length}</MonoHeader>
            {tShown.map(tv => threadRow(tv))}
            {coveredLines(covered)}
            <CapLine n={visible.length - tShown.length} />
          </>
        )}
      </>
    );
  };

  const drillView = () => {
    // Couvert = ce dossier OU un de ses parents est pris en bloc. Dans ce cas
    // la carte « en entier » porte déjà l'état (badge « Ajouté » = le seul
    // inverseur) : on ne répète pas N lignes inertes en dessous, une seule
    // ligne renvoie à l'aperçu du panier.
    const covering = coveringFolderOf(currentFolderId);
    const shownThreads = folderThreads.slice(0, CAP_THREADS);
    const hidden = folderThreads.length - shownThreads.length;
    // « Tout » = tous les échanges du dossier, pas la tranche affichée.
    const takeable = takeableOf(folderThreads);
    return (
      <>
        {enEntierCard()}
        {covering ? (
          <p className="px-4 py-2.5 text-[11px] text-foreground-muted leading-4">
            Tout le contenu est inclus - aperçu en lecture seule dans le panier.
          </p>
        ) : (
          <>
            <MonoHeader right={<SelectAll takeableTids={takeable} onTake={takeManyThreads} />}>Contenu du dossier</MonoHeader>
            {folderChildren.map(f => folderRow(f))}
            {shownThreads.map(tv => threadRow(tv))}
            <CapLine n={hidden} hint="utilisez la recherche pour les atteindre" />
          </>
        )}
      </>
    );
  };

  // ── Rendu ──
  return (
    <div className="flex flex-col h-full border-r border-border" style={{ width, backgroundColor: '#f8f7f5' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img src={outlookLogo} alt="Outlook" className="w-8 h-8 flex-shrink-0" />
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground leading-5">
              {phase2 ? 'Ajouter ou suivre depuis votre boîte mail' : 'Ajouter depuis votre boîte mail'}
            </p>
            <p className="text-xs text-foreground-muted truncate leading-4">cabinet@durand-avocats.fr</p>
          </div>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="inline-flex items-center gap-1.5 h-[26px] px-2 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-cream rounded transition-colors flex-shrink-0"
            title="Réduire le panneau - la sélection est conservée"
          >
            <ListCollapse className="w-3.5 h-3.5" strokeWidth={1.75} /> Réduire
          </button>
        )}
      </div>

      {!connected ? (
        <ConnectScreen onConnect={onConnect} compact />
      ) : (
        <>
          <div className="px-4 pb-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 px-[11px] h-9 bg-white border border-border rounded-lg focus-within:border-foreground-secondary transition-colors" style={{ boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}>
              <Search className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un dossier ou un échange…"
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-foreground-muted focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="p-0.5 text-foreground-muted hover:text-foreground-secondary rounded"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </div>

          {!q && path.length > 0 && (
            <div className="px-4 pb-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
              <button type="button" onClick={() => setPath([])} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-secondary hover:text-foreground transition-colors">
                <Mail className="w-3 h-3" strokeWidth={1.75} /> Boîte mail
              </button>
              {path.map((fid, i) => (
                <React.Fragment key={fid}>
                  <ChevronRight className="w-3 h-3 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
                  <button
                    type="button"
                    onClick={() => setPath(p => p.slice(0, i + 1))}
                    className={`text-[11px] font-medium transition-colors truncate ${i === path.length - 1 ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
                    style={{ maxWidth: 150 }}
                  >
                    {folderById(fid)?.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          <div ref={listRef} onScroll={closePreview} className="flex-1 min-h-0 overflow-y-auto pb-2">
            {q ? searchView() : path.length > 0 ? drillView() : rootView()}
          </div>
        </>
      )}
      {preview && <ThreadPreviewCard tid={preview.tid} rect={preview.rect} />}
    </div>
  );
}
