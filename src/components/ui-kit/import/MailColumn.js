// Colonne mail (gauche) - TRANSVASEMENT : cocher prend et transvase
// immédiatement à droite ; aucun tray, aucune étape « Ajouter à la liste ».
//
// Règle unique à tous les niveaux : une case = il reste quelque chose à prendre ;
// estompé + badge « Ajouté » = plus rien à prendre ici. Un thread est un
// composite dépliable : corps du mail + chaque PJ, cochables un par un. L'état
// de chaque ligne est DÉRIVÉ des items du panier (source de vérité unique).

import React, { useMemo, useRef, useState } from 'react';
import { ChevronRight, Folder, Inbox, ListCollapse, Mail, Paperclip, Search, X, FileText, CheckCheck } from 'lucide-react';
import {
  normalize, relDate, LAB_THREADS, LAB_FOLDERS,
  folderById, folderPath, childFolders, rootFolders, statsForDeep, threadsOfFolder,
  threadView, folderOfThread, ancestorFolderIds, DEJA_LIE, bodyKey, pjKey,
} from './labData';
import { Checkbox, AjouteBadge, AjouterChip, DejaSuiviBadge, ConnectScreen, monoLabel, usePhase2 } from './atoms';
import outlookLogo from '../../../assets/outlook.svg';

const CAP_THREADS = 30;
const CAP_FOLDERS = 8;

function MonoHeader({ children, right }) {
  return (
    <div className="flex items-center justify-between px-3 pt-2 pb-1">
      <span style={monoLabel}>{children}</span>
      {right}
    </div>
  );
}

function CapLine({ n, hint = 'affinez la recherche' }) {
  if (n <= 0) return null;
  return <p className="px-3 py-1.5 text-[11px] text-foreground-muted">+ {n} autre{n > 1 ? 's' : ''} - {hint}</p>;
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
  takeThread, takeManyThreads, takePiece, untakePiece, takeFolder, removeFolder, removeThread,
  dejaSuiviFolderIds = new Set(), dejaSuiviThreadIds = new Set(),
  connected = true, onConnect,
  onCollapse,
}) {
  const phase2 = usePhase2();
  const [query, setQuery] = useState('');
  const [path, setPath] = useState([]); // folderIds, racine = []
  const [expanded, setExpanded] = useState(() => new Set()); // threads dépliés
  const listRef = useRef(null);
  const q = normalize(query.trim());

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
  const toggleExpand = (tid) => setExpanded(prev => { const n = new Set(prev); n.has(tid) ? n.delete(tid) : n.add(tid); return n; });

  // État dérivé d'un thread : available | partial | full.
  const threadState = (tv) => {
    const s = threadStateMap.get(tv.id);
    const total = 1 + tv.pj; // corps + PJ
    if (!s) return { kind: 'available', total, taken: 0 };
    const taken = s.taken.size;
    if (taken >= total) return { kind: 'full', total, taken };
    return { kind: 'partial', total, taken };
  };
  const pieceIncluded = (tid, key) => threadStateMap.get(tid)?.taken.has(key) || false;

  // ── Données des vues ──
  const recentThreads = useMemo(() => [...LAB_THREADS].sort((a, b) => (a.date < b.date ? 1 : -1)).map(threadView), []);

  const searchResults = useMemo(() => {
    if (!q) return null;
    const folders = LAB_FOLDERS
      .filter(f => !(f.attributes || []).includes('\\Sent'))
      .filter(f => normalize(f.name).includes(q) || normalize(folderPath(f)).includes(q));
    const threads = LAB_THREADS
      .filter(t => [t.subject, t.summary, t.snippet, ...(t.senders || []).flatMap(s => [s.name, s.email, s.role])].some(x => x && normalize(x).includes(q)))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(threadView);
    return { folders, threads };
  }, [q]);

  const folderChildren = useMemo(() => (currentFolderId ? childFolders(currentFolderId) : []), [currentFolderId]);
  const folderThreads = useMemo(() => (currentFolderId ? threadsOfFolder(currentFolderId) : []), [currentFolderId]);

  const enter = (fid) => { setPath(p => [...p, fid]); setQuery(''); listRef.current?.scrollTo?.({ top: 0 }); };

  // tids preneurs (available ou partiel, ni inertes ni couverts) parmi une liste.
  const takeableOf = (tvs) => tvs
    .filter(tv => !(phase2 && dejaSuiviThreadIds.has(tv.id)) && !threadCovered(tv.id) && threadState(tv).kind !== 'full')
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
    <p key={name} className="px-3 py-1.5 text-[11px] text-foreground-muted">
      {n} échange{n > 1 ? 's' : ''} inclus via « {name} » - aperçu dans le panier
    </p>
  ));

  // ── Enfant d'un thread (corps ou PJ) ──
  const childRow = (tid, { key, icon: Icon, iconColor, label, sub, msgBadge }) => {
    const included = pieceIncluded(tid, key);
    return (
      <div
        key={key}
        className={`group flex items-center gap-2.5 pl-9 pr-3 py-1.5 rounded-lg transition-colors ${included ? '' : 'hover:bg-cream/50'}`}
      >
        {included ? (
          <span className="w-4 flex-shrink-0" aria-hidden />
        ) : (
          <Checkbox checked={false} onToggle={() => takePiece(tid, key)} title="Ajouter cette pièce" />
        )}
        {/* Estompage sur le CONTENU seul - jamais sur le badge (spec §3). */}
        <span className="flex-1 min-w-0 flex items-center gap-2" style={included ? { opacity: 0.5 } : undefined}>
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: iconColor }} />
          <span className="text-[12.5px] text-foreground truncate">{label}</span>
          {msgBadge}
        </span>
        {sub}
        {included
          ? <AjouteBadge onRemove={() => untakePiece(tid, key)} title="Retirer cette pièce" />
          : <AjouterChip onAdd={() => takePiece(tid, key)} />}
      </div>
    );
  };

  const threadChildren = (tv) => {
    const rows = [];
    rows.push(childRow(tv.id, {
      key: bodyKey(tv.id), icon: Mail, iconColor: '#1e3a8a', label: 'Corps du mail',
      msgBadge: tv.msg > 1 ? (
        <span className="inline-flex items-center h-4 px-1 rounded text-[9px] font-medium uppercase text-foreground-secondary flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#eeece6' }}>{tv.msg} msg</span>
      ) : null,
    }));
    tv.attachments.forEach(a => {
      rows.push(childRow(tv.id, {
        key: pjKey(tv.id, a.name), icon: FileText, iconColor: '#b4483c', label: a.name,
      }));
    });
    return rows;
  };

  // ── Ligne dossier ──
  const folderRow = (f, { showPath = false } = {}) => {
    const fid = f.id;
    const dejaSuivi = phase2 && dejaSuiviFolderIds.has(fid);
    const dejaLie = phase2 && DEJA_LIE[fid];
    const taken = stagedFolderIds.has(fid);
    // Couvert par un dossier parent déjà pris : inerte, la raison est nommée.
    const coveredBy = !taken ? coveringFolderOf(f.parentId) : null;
    const inert = dejaSuivi || !!dejaLie || !!coveredBy;
    const st = statsForDeep(fid);
    const isInbox = (f.attributes || []).includes('\\Inbox');
    const Icon = isInbox ? Inbox : Folder;
    return (
      <div
        key={fid}
        className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${inert || taken ? '' : 'hover:bg-cream/60'}`}
        style={inert ? { opacity: 0.55 } : undefined}
      >
        {inert || taken ? (
          <span className="w-4 flex-shrink-0" aria-hidden />
        ) : (
          <Checkbox checked={false} onToggle={() => takeFolder(fid)} title="Ajouter tout le dossier (sous-dossiers compris)" />
        )}
        <button
          type="button"
          onClick={() => { if (!dejaSuivi && !coveredBy) enter(fid); }}
          className={`flex-1 min-w-0 flex items-center gap-2.5 text-left ${dejaSuivi || coveredBy ? 'cursor-default' : ''}`}
          style={{ ...(dejaSuivi || coveredBy ? { pointerEvents: 'none' } : null), ...(taken ? { opacity: 0.5 } : null) }}
        >
          <Icon className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
          <span className="flex-1 min-w-0">
            <span className="text-[13px] text-foreground truncate block">{f.name}</span>
            {coveredBy ? (
              <span className="text-[11px] text-foreground-secondary truncate block">Inclus via « {coveredBy.name} »</span>
            ) : showPath ? (
              <span className="text-[11px] text-foreground-muted truncate block">{folderPath(f)}</span>
            ) : null}
          </span>
          {!taken && !coveredBy && (dejaSuivi ? <DejaSuiviBadge />
            : dejaLie ? (
              <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>
                Déjà lié à {dejaLie}
              </span>
            ) : (
              <span className="text-[11px] text-foreground-muted flex-shrink-0 tabular-nums">{st.threads} échange{st.threads > 1 ? 's' : ''}</span>
            ))}
          {!inert && !taken && <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />}
        </button>
        {taken && <AjouteBadge onRemove={() => removeFolder(fid)} title="Retirer le dossier" />}
        {!inert && !taken && <AjouterChip onAdd={() => takeFolder(fid)} />}
      </div>
    );
  };

  // ── Ligne thread (composite dépliable) ──
  const threadRow = (tv) => {
    const tid = tv.id;
    const dejaSuivi = phase2 && dejaSuiviThreadIds.has(tid);
    const coveredBy = threadCoveredBy(tid);
    const covered = coveredBy != null;
    const inert = dejaSuivi || covered;
    const state = inert ? { kind: 'inert' } : threadState(tv);
    const isOpen = expanded.has(tid);
    const composite = tv.pj > 0; // corps + au moins une PJ → dépliable
    return (
      <React.Fragment key={tid}>
        <div
          className={`group flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors ${inert || state.kind === 'full' ? '' : 'hover:bg-cream/50'}`}
          style={inert ? { opacity: 0.55 } : undefined}
        >
          {/* Contrôle de prise */}
          {inert || state.kind === 'full' ? (
            <span className="mt-0.5 w-4 flex-shrink-0" aria-hidden />
          ) : (
            <Checkbox
              checked={false}
              partial={state.kind === 'partial'}
              onToggle={() => takeThread(tid)}
              className="mt-0.5"
              title={state.kind === 'partial' ? 'Ajouter le reste' : 'Ajouter cet échange'}
            />
          )}
          {/* Corps de ligne : clic = prendre l'échange (le dépliage est réservé
              au chevron). Entièrement pris : le contenu s'estompe et devient
              inerte - le badge « Ajouté » est le SEUL inverseur (grammaire
              case / ✕ / badge, jamais de retrait au clic sur le contenu). */}
          <button
            type="button"
            onClick={inert || state.kind === 'full' ? undefined : () => takeThread(tid)}
            className={`flex-1 min-w-0 flex flex-col gap-0.5 text-left ${inert || state.kind === 'full' ? 'cursor-default' : ''}`}
            style={state.kind === 'full' ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            title={inert || state.kind === 'full' ? undefined : state.kind === 'partial' ? 'Ajouter le reste de l\'échange' : 'Ajouter cet échange'}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className={`flex-1 min-w-0 text-[13px] leading-5 truncate ${tv.illegible ? 'italic text-foreground-secondary font-normal' : 'font-medium text-foreground'}`}>{tv.subject}</span>
              {state.kind === 'partial' && (
                <span className="text-[10px] font-medium tabular-nums flex-shrink-0" style={{ color: '#855b31' }}>{state.taken} sur {state.total} ajoutées</span>
              )}
              {dejaSuivi ? <DejaSuiviBadge /> : (
                <span className="text-[11px] text-foreground-muted flex-shrink-0 tabular-nums">{relDate(tv.date)}</span>
              )}
            </span>
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] text-foreground-secondary truncate leading-4">
                {covered ? `Inclus via « ${coveredBy.name} »` : tv.sender}
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
          </button>
          {state.kind === 'full' && <AjouteBadge onRemove={() => removeThread(tid)} title="Retirer l'échange" />}
          {!inert && state.kind !== 'full' && (
            <AjouterChip
              onAdd={() => takeThread(tid)}
              label={state.kind === 'partial' ? 'Ajouter le reste' : 'Ajouter'}
              className="mt-0.5"
            />
          )}
          {/* Chevron de dépliage à DROITE - cohérent avec les lignes dossier. */}
          {composite && !inert && (
            <button
              type="button"
              onClick={() => toggleExpand(tid)}
              className="mt-0.5 p-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0"
              title={isOpen ? 'Replier les pièces' : 'Voir corps et PJ'}
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2} />
            </button>
          )}
        </div>
        {isOpen && composite && !inert && (
          <div className="flex flex-col pb-1">{threadChildren(tv)}</div>
        )}
      </React.Fragment>
    );
  };

  // Carte « Ajouter “X” en entier » en tête de dossier ouvert. Les stats sont
  // PROFONDES (sous-dossiers compris) : la carte annonce ce que le bloc engage.
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
    return (
      <div
        className="group mx-3 mt-1 rounded-lg border p-3 flex items-center gap-2.5 transition-colors bg-white"
        style={{ borderColor: '#e7e5e3', opacity: inert ? 0.55 : 1 }}
      >
        {inert || taken ? <span className="w-4 flex-shrink-0" aria-hidden /> : (
          <Checkbox checked={false} onToggle={() => takeFolder(fid)} title="Ajouter tout le dossier (sous-dossiers compris)" />
        )}
        <span className="flex-1 min-w-0" style={taken ? { opacity: 0.55 } : undefined}>
          <span className="text-[13px] font-medium text-foreground truncate block">Ajouter « {f.name} » en entier</span>
          <span className="text-[11px] text-foreground-muted truncate block">
            {coveredBy
              ? `Inclus via « ${coveredBy.name} »`
              : <>{st.threads} échange{st.threads > 1 ? 's' : ''}, ≈ {st.pieces} pièces{hasSub ? ' · sous-dossiers compris' : ''}{phase2 && !inert ? ' · suivable' : ''}</>}
          </span>
        </span>
        {taken ? <AjouteBadge onRemove={() => removeFolder(fid)} title="Retirer le dossier" />
          : dejaSuivi ? <DejaSuiviBadge /> : dejaLie ? (
            <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>
              Déjà lié à {dejaLie}
            </span>
          ) : !inert ? <AjouterChip onAdd={() => takeFolder(fid)} /> : null}
      </div>
    );
  };

  // ── Vues ──
  // Pas de « Tout sélectionner » à la racine (spec §9) : la vue mêle dossiers
  // et échanges récents, « tout » n'y a pas de sens défendable.
  const rootView = () => {
    const roots = rootFolders();
    const nThreadsShown = Math.max(0, CAP_THREADS - roots.length);
    const { visible, covered } = splitCovered(recentThreads);
    const shown = visible.slice(0, nThreadsShown);
    return (
      <>
        <MonoHeader>Dossiers Outlook</MonoHeader>
        {roots.map(f => folderRow(f))}
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

          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-1.5 pb-2">
            {q ? searchView() : path.length > 0 ? drillView() : rootView()}
          </div>
        </>
      )}
    </div>
  );
}
