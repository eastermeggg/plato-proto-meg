// Colonne mail navigable (spec §3) - le SEUL lieu de sélection : à gauche on
// choisit, à droite on vérifie. Recherche globale (chemin principal à
// l'échelle 100+ dossiers), « Vos habituels », drill-down au clic sur le NOM
// (la case, elle, prend le contenu), carte « en entier » qui neutralise les
// enfants - jamais dossier + enfants simultanément.

import React, { useMemo, useRef, useState } from 'react';
import { ChevronRight, Clock4, Folder, Inbox, ListCollapse, Mail, Paperclip, Search, X, Check } from 'lucide-react';
import {
  normalize, relDate, LAB_THREADS, LAB_FOLDERS, LAB_HABITUELS,
  folderById, folderPath, childFolders, rootFolders, statsFor, threadsOfFolder,
  threadView, threadViewById, folderOfThread, DEJA_LIE,
} from './labData';
import { Checkbox, DejaSuiviBadge, ConnectScreen, monoLabel, usePhase2 } from './atoms';
import outlookLogo from '../../../assets/outlook.svg';

const CAP_THREADS = 30;
const CAP_FOLDERS = 8;

// Séparateur de section fine (« ou choisir dedans » / « inclus ci-dessus »).
function ThinSeparator({ children }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2" aria-hidden>
      <span className="flex-1 h-px" style={{ backgroundColor: '#e7e5e3' }} />
      <span style={monoLabel}>{children}</span>
      <span className="flex-1 h-px" style={{ backgroundColor: '#e7e5e3' }} />
    </div>
  );
}

function MonoHeader({ children }) {
  return <p className="px-3 pt-2 pb-1" style={monoLabel}>{children}</p>;
}

function CapLine({ n }) {
  if (n <= 0) return null;
  return <p className="px-3 py-1.5 text-[11px] text-foreground-muted">+ {n} autres - affinez la recherche</p>;
}

export default function MailColumn({
  width = 440,
  dossierLabel,
  selection, onSelectionChange,
  includePJ, onIncludePJ,
  onAddToBasket,
  stagedFolderIds = new Set(), stagedThreadIds = new Set(),
  dejaSuiviFolderIds = new Set(), dejaSuiviThreadIds = new Set(),
  // Habituels = frecency PAR dossier Plato : un dossier en création n'en a pas.
  habituels = true,
  connected = true, onConnect,
  onCollapse,
}) {
  const phase2 = usePhase2();
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]); // folderIds, racine = []
  const listRef = useRef(null);
  const q = normalize(query.trim());

  const currentFolderId = path.length ? path[path.length - 1] : null;
  const currentFolder = currentFolderId ? folderById(currentFolderId) : null;

  // ── Sélection (hoistée) ──
  const selFolders = selection.folders;
  const selThreads = selection.threads;
  const threadCovered = (tid) => {
    const fid = folderOfThread(tid);
    return fid != null && (selFolders.has(fid) || stagedFolderIds.has(fid));
  };

  const toggleFolder = (fid) => {
    const folders = new Set(selFolders);
    const threads = new Set(selThreads);
    if (folders.has(fid)) folders.delete(fid);
    else {
      folders.add(fid);
      // Jamais dossier + enfants simultanément : les coches enfants tombent.
      threads.forEach(tid => { if (folderOfThread(tid) === fid) threads.delete(tid); });
    }
    onSelectionChange({ folders, threads });
  };
  const toggleThread = (tid) => {
    if (threadCovered(tid)) return;
    const threads = new Set(selThreads);
    threads.has(tid) ? threads.delete(tid) : threads.add(tid);
    onSelectionChange({ folders: new Set(selFolders), threads });
  };

  // ── Données des vues ──
  const recentThreads = useMemo(() => [...LAB_THREADS].sort((a, b) => (a.date < b.date ? 1 : -1)).map(threadView), []);

  const searchResults = useMemo(() => {
    if (!q) return null;
    const folders = LAB_FOLDERS
      .filter(f => !(f.attributes || []).includes('\\Sent'))
      .filter(f => normalize(f.name).includes(q) || normalize(folderPath(f)).includes(q));
    // L'index de recherche reste brut : les préfixes RE:/TR: comptent.
    const threads = LAB_THREADS
      .filter(t => [t.subject, t.summary, t.snippet, ...(t.senders || []).flatMap(s => [s.name, s.email, s.role])].some(x => x && normalize(x).includes(q)))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(threadView);
    return { folders, threads };
  }, [q]);

  const folderChildren = useMemo(() => (currentFolderId ? childFolders(currentFolderId) : []), [currentFolderId]);
  const folderThreads = useMemo(() => (currentFolderId ? threadsOfFolder(currentFolderId) : []), [currentFolderId]);

  // ── Tray (récap de sélection) ──
  const selFolderList = [...selFolders];
  const selThreadList = [...selThreads];
  const trayFolderPieces = selFolderList.reduce((n, fid) => n + statsFor(fid).pieces, 0);
  const trayPJ = selThreadList.reduce((n, tid) => n + (threadViewById(tid)?.pj || 0), 0);
  const hasSelection = selFolderList.length > 0 || selThreadList.length > 0;

  const addToList = () => {
    if (!hasSelection) return;
    onAddToBasket({ folders: selFolderList, threads: selThreadList, includePJ });
    onSelectionChange({ folders: new Set(), threads: new Set() });
  };

  const enter = (fid) => { setPath(p => [...p, fid]); setQuery(''); listRef.current?.scrollTo?.({ top: 0 }); };

  // ── Lignes ──

  const folderRow = (f, { showPath = false } = {}) => {
    const fid = f.id;
    const dejaSuivi = phase2 && dejaSuiviFolderIds.has(fid);
    const dejaLie = phase2 && DEJA_LIE[fid];
    const inert = dejaSuivi || !!dejaLie;
    const staged = stagedFolderIds.has(fid);
    const checked = selFolders.has(fid);
    const st = statsFor(fid);
    const isInbox = (f.attributes || []).includes('\\Inbox');
    const Icon = isInbox ? Inbox : Folder;
    return (
      <div
        key={fid}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${checked ? 'bg-cream' : inert ? '' : 'hover:bg-cream/60'}`}
        style={inert ? { opacity: 0.55, pointerEvents: 'auto' } : undefined}
      >
        {staged ? (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#e4efe8' }} title="Déjà dans la liste">
            <Check className="w-2.5 h-2.5" style={{ color: '#4a9168' }} strokeWidth={3} />
          </span>
        ) : (
          <Checkbox
            checked={checked}
            disabled={inert}
            onToggle={() => toggleFolder(fid)}
            title={inert ? undefined : checked ? 'Retirer le dossier de la sélection' : 'Prendre tout le dossier'}
          />
        )}
        <button
          type="button"
          onClick={() => { if (!inert) enter(fid); }}
          className={`flex-1 min-w-0 flex items-center gap-2.5 text-left ${inert ? 'cursor-default' : ''}`}
          style={inert ? { pointerEvents: dejaSuivi ? 'none' : 'auto' } : undefined}
        >
          <Icon className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
          <span className="flex-1 min-w-0">
            <span className="text-[13px] text-foreground truncate block">{f.name}</span>
            {showPath && <span className="text-[11px] text-foreground-muted truncate block">{folderPath(f)}</span>}
          </span>
          {dejaSuivi ? <DejaSuiviBadge />
            : dejaLie ? (
              <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31', opacity: 1 }}>
                Déjà lié à {dejaLie}
              </span>
            ) : (
              <span className="text-[11px] text-foreground-muted flex-shrink-0 tabular-nums">{st.threads} échange{st.threads > 1 ? 's' : ''}</span>
            )}
          {!inert && <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />}
        </button>
      </div>
    );
  };

  const threadRow = (tv, { neutralizable = true } = {}) => {
    const tid = tv.id;
    const dejaSuivi = phase2 && dejaSuiviThreadIds.has(tid);
    const staged = stagedThreadIds.has(tid);
    const covered = neutralizable && threadCovered(tid);
    const checked = selThreads.has(tid);
    const inert = dejaSuivi || covered || staged;
    return (
      <div
        key={tid}
        role={inert ? undefined : 'button'}
        onClick={inert ? undefined : () => toggleThread(tid)}
        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors ${checked ? '' : inert ? '' : 'hover:bg-cream/50 cursor-pointer'}`}
        style={{
          ...(checked ? { backgroundColor: '#eeece6', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' } : null),
          ...(dejaSuivi || covered ? { opacity: 0.55 } : null),
        }}
      >
        {staged && !dejaSuivi ? (
          <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#e4efe8' }} title="Déjà dans la liste">
            <Check className="w-2.5 h-2.5" style={{ color: '#4a9168' }} strokeWidth={3} />
          </span>
        ) : (
          <Checkbox checked={checked} disabled={inert} onToggle={() => toggleThread(tid)} className="mt-0.5" />
        )}
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="flex items-center gap-2.5 min-w-0">
            <span className={`flex-1 min-w-0 text-[13px] leading-5 truncate ${tv.illegible ? 'italic text-foreground-secondary font-normal' : 'font-medium text-foreground'}`}>{tv.subject}</span>
            {dejaSuivi ? <DejaSuiviBadge /> : (
              <span className="text-[11px] text-foreground-muted flex-shrink-0 tabular-nums">{relDate(tv.date)}</span>
            )}
          </span>
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] text-foreground-secondary truncate leading-4">
              {covered ? 'Inclus via le dossier coché' : staged && !dejaSuivi ? 'Déjà dans la liste' : tv.sender}
            </span>
            {tv.illegible && <span className="text-[10px] italic text-foreground-muted flex-shrink-0">objet illisible</span>}
            {tv.msg > 1 && !covered && (
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Mail className="w-3 h-3 opacity-60 text-foreground-secondary" strokeWidth={1.75} />
                <span className="text-[10px] font-medium uppercase text-foreground-secondary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tv.msg} msg</span>
              </span>
            )}
            {tv.pj > 0 && !covered && (
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Paperclip className="w-3 h-3 opacity-60 text-foreground-secondary" strokeWidth={1.75} />
                <span className="text-[10px] font-medium uppercase text-foreground-secondary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tv.pj} PJ</span>
              </span>
            )}
          </span>
        </span>
      </div>
    );
  };

  // Carte « Ajouter “X” en entier » en tête de dossier ouvert.
  const enEntierCard = () => {
    const fid = currentFolderId;
    const f = currentFolder;
    if (!f) return null;
    const dejaSuivi = phase2 && dejaSuiviFolderIds.has(fid);
    const dejaLie = phase2 && DEJA_LIE[fid];
    const checked = selFolders.has(fid);
    const staged = stagedFolderIds.has(fid);
    const st = statsFor(fid);
    return (
      <div
        className={`mx-3 mt-1 rounded-lg border p-3 flex items-center gap-2.5 transition-colors ${checked ? 'bg-cream' : 'bg-white'}`}
        style={{ borderColor: checked ? '#d6d3d1' : '#e7e5e3', opacity: dejaSuivi || dejaLie ? 0.55 : 1 }}
      >
        {staged ? (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#e4efe8' }} title="Déjà dans la liste">
            <Check className="w-2.5 h-2.5" style={{ color: '#4a9168' }} strokeWidth={3} />
          </span>
        ) : (
          <Checkbox checked={checked} disabled={!!(dejaSuivi || dejaLie)} onToggle={() => toggleFolder(fid)} title="Prendre tout le dossier" />
        )}
        <span className="flex-1 min-w-0">
          <span className="text-[13px] font-medium text-foreground truncate block">Ajouter « {f.name} » en entier</span>
          <span className="text-[11px] text-foreground-muted truncate block">
            {st.threads} échange{st.threads > 1 ? 's' : ''}, ≈ {st.pieces} pièces{phase2 && !dejaSuivi && !dejaLie ? ' · suivable' : ''}
          </span>
        </span>
        {dejaSuivi ? <DejaSuiviBadge /> : dejaLie ? (
          <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31', opacity: 1 }}>
            Déjà lié à {dejaLie}
          </span>
        ) : null}
      </div>
    );
  };

  // ── Vues ──

  const rootView = () => {
    const habitList = habituels ? LAB_HABITUELS.slice(0, 6) : [];
    const roots = rootFolders();
    const nThreadsShown = Math.max(0, CAP_THREADS - roots.length - habitList.length);
    const shown = recentThreads.slice(0, nThreadsShown);
    return (
      <>
        {habituels ? (
          <>
            <MonoHeader>Vos habituels</MonoHeader>
            {habitList.map(h => (h.kind === 'folder'
              ? folderRow(folderById(h.id), { showPath: true })
              : threadRow(threadView(LAB_THREADS.find(t => t.id === h.id)))))}
            <ThinSeparator>Toute la boîte</ThinSeparator>
          </>
        ) : (
          <MonoHeader>Dossiers Outlook</MonoHeader>
        )}
        {roots.map(f => folderRow(f))}
        <MonoHeader>Échanges récents</MonoHeader>
        {shown.map(tv => threadRow(tv))}
        <CapLine n={recentThreads.length - shown.length} />
      </>
    );
  };

  const searchView = () => {
    const { folders, threads } = searchResults;
    const fShown = folders.slice(0, CAP_FOLDERS);
    const tShown = threads.slice(0, CAP_THREADS);
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
        {tShown.length > 0 && (
          <>
            <MonoHeader>Échanges · {threads.length}</MonoHeader>
            {tShown.map(tv => threadRow(tv))}
            <CapLine n={threads.length - tShown.length} />
          </>
        )}
      </>
    );
  };

  const drillView = () => {
    const folderChecked = selFolders.has(currentFolderId) || stagedFolderIds.has(currentFolderId);
    const shownThreads = folderThreads.slice(0, CAP_THREADS);
    const hidden = statsFor(currentFolderId).threads - shownThreads.length;
    return (
      <>
        {enEntierCard()}
        <ThinSeparator>{folderChecked ? 'Inclus ci-dessus' : 'Ou choisir dedans'}</ThinSeparator>
        <div style={folderChecked ? { opacity: 0.45, pointerEvents: 'none' } : undefined} aria-hidden={folderChecked || undefined}>
          {folderChildren.map(f => folderRow(f))}
          {shownThreads.map(tv => threadRow(tv, { neutralizable: false }))}
          <CapLine n={hidden} />
        </div>
      </>
    );
  };

  // ── Rendu ──
  return (
    <div className="flex flex-col h-full border-r border-border" style={{ width, backgroundColor: '#f8f7f5' }}>
      {/* Header */}
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
          {/* Recherche globale : traverse tout l'arbre. */}
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

          {/* Fil d'Ariane (drill-down) */}
          {!q && path.length > 0 && (
            <div className="px-4 pb-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
              <button type="button" onClick={() => setPath([])} className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground-secondary hover:text-foreground transition-colors">
                <Clock4 className="w-3 h-3" strokeWidth={1.75} /> Boîte mail
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

          {/* Liste */}
          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-1.5 pb-2" style={hasSelection ? { paddingBottom: 118 } : undefined}>
            {q ? searchView() : path.length > 0 ? drillView() : rootView()}
          </div>

          {/* Tray flottant : récapitulatif + « Ajouter à la liste ». */}
          {hasSelection && (
            <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end px-2.5 pb-[11px] pt-6 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(248,247,245,0) 6%, #f8f7f5 60%)' }}>
              <div className="pointer-events-auto bg-white rounded-md overflow-hidden flex flex-col" style={{ border: '1px solid #d6d3d1', padding: 1, boxShadow: '0px 8px 17px rgba(0,0,0,0.03), 0px 30px 30px rgba(0,0,0,0.03), 0px 68px 41px rgba(0,0,0,0.02)' }}>
                <div className="relative flex flex-col gap-2 py-3" style={{ paddingLeft: 14, paddingRight: 12 }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-medium text-foreground truncate">
                      {[
                        selFolderList.length ? `${selFolderList.length} dossier${selFolderList.length > 1 ? 's' : ''} (≈ ${trayFolderPieces} pièces)` : null,
                        selThreadList.length ? `${selThreadList.length} échange${selThreadList.length > 1 ? 's' : ''}` : null,
                      ].filter(Boolean).join(' + ')}
                    </span>
                    <button
                      type="button"
                      onClick={addToList}
                      className="h-8 px-3 rounded-lg text-sm font-medium text-white flex-shrink-0 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#292524', boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}
                    >
                      Ajouter à la liste
                    </button>
                  </div>
                  {selThreadList.length > 0 && trayPJ > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox checked={includePJ} onToggle={() => onIncludePJ(!includePJ)} />
                      <span className="text-xs text-foreground">Inclure les {trayPJ} pièce{trayPJ > 1 ? 's' : ''} jointe{trayPJ > 1 ? 's' : ''}</span>
                    </label>
                  )}
                  <span aria-hidden className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ boxShadow: 'inset 4px 0px 0px 0px #292524' }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
