// Contrôleur de transvasement partagé (gestes B et C). Les items du panier sont
// l'unique source de vérité : cocher à gauche crée / complète un item, décocher
// à droite le vide - la colonne mail dérive son état des items. Aucune étape de
// validation, aucun tray : le mouvement est immédiat et bidirectionnel.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  mkThreadItem, mkFolderItem, localFileToItem, MOCK_LOCAL_FILES, decoupableKeys,
  ancestorFolderIds, descendantFolders, folderOfThread,
} from './labData';

export function useComposer() {
  const [items, setItems] = useState([]);
  const [decoupe, setDecoupe] = useState(() => new Set());
  const [suivre, setSuivre] = useState(() => new Set());
  const fileCursor = useRef(0);
  const timers = useRef([]);
  // Guards synchrones (setState est asynchrone) : on lit l'état courant ici.
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const findThread = (tid) => itemsRef.current.find(i => i.kind === 'thread' && i.thread.threadId === tid);
  const findFolder = (fid) => itemsRef.current.find(i => i.kind === 'folder' && i.folder.folderId === fid);

  const settle = (ids) => {
    const t = setTimeout(() => setItems(prev => prev.map(i => (ids.includes(i.id) && i.status === 'uploading' ? { ...i, status: 'ready' } : i))), 1400);
    timers.current.push(t);
  };

  const addLocalFiles = (n = 1) => {
    const added = Array.from({ length: n }, () => localFileToItem(MOCK_LOCAL_FILES[fileCursor.current++ % MOCK_LOCAL_FILES.length]));
    setItems(prev => [...prev, ...added]);
    settle(added.map(i => i.id));
  };

  // ── Transvasement gauche → droite ──
  // Prend un thread entier : le crée (toutes pièces) ou complète les manquantes.
  const takeThread = (tid) => {
    const ex = findThread(tid);
    if (ex) {
      setItems(prev => prev.map(i => (i.id === ex.id
        ? { ...i, thread: { ...i.thread, pieces: i.thread.pieces.map(p => ({ ...p, included: true })) } }
        : i)));
      return ex;
    }
    const it = mkThreadItem(tid);
    if (it) setItems(prev => [...prev, it]);
    return it;
  };

  // « Tout sélectionner » : prend d'un coup tous les threads visibles (création
  // ou complétion), en une seule passe pour éviter les doublons.
  const takeManyThreads = (tids) => setItems(prev => {
    const present = new Set(prev.filter(i => i.kind === 'thread' && i.thread.threadId).map(i => i.thread.threadId));
    const completed = prev.map(i => (i.kind === 'thread' && tids.includes(i.thread.threadId)
      ? { ...i, thread: { ...i.thread, pieces: i.thread.pieces.map(p => ({ ...p, included: true })) } }
      : i));
    const added = tids.filter(t => !present.has(t)).map(t => mkThreadItem(t)).filter(Boolean);
    return [...completed, ...added];
  });

  // (Dé)coche une pièce (corps ou PJ) dans la carte du panier - la curation
  // pièce par pièce vit à DROITE uniquement, la gauche prend des objets entiers.
  // La ligne reste visible ; si plus rien n'est retenu, la carte quitte le panier.
  const setPieceIncluded = (itemId, key, included) => setItems(prev => prev.flatMap(i => {
    if (i.id !== itemId) return [i];
    const pieces = i.thread.pieces.map(p => (p.key === key ? { ...p, included } : p));
    if (!pieces.some(p => p.included)) return [];
    return [{ ...i, thread: { ...i.thread, pieces } }];
  }));
  const togglePieceById = (itemId, key, included) => setPieceIncluded(itemId, key, included);

  // Prend un dossier EN BLOC (sous-dossiers compris). Les threads et
  // sous-dossiers déjà pris individuellement sont ABSORBÉS par le bloc :
  // jamais deux fois la même pièce au commit, jamais de carte orpheline.
  const takeFolder = (fid) => {
    if (findFolder(fid)) return null;
    if (ancestorFolderIds(fid).some(a => findFolder(a))) return null; // déjà couvert par un parent pris
    const it = mkFolderItem(fid);
    if (!it) return null;
    const covered = new Set([fid, ...descendantFolders(fid).map(f => f.id)]);
    setItems(prev => [
      ...prev.filter(i => {
        if (i.kind === 'folder' && covered.has(i.folder.folderId)) return false;
        if (i.kind === 'thread' && i.thread.threadId && covered.has(folderOfThread(i.thread.threadId))) return false;
        return true;
      }),
      it,
    ]);
    return it;
  };
  const removeThread = (tid) => setItems(prev => prev.filter(i => !(i.kind === 'thread' && i.thread.threadId === tid)));
  const removeFolder = (fid) => setItems(prev => prev.filter(i => !(i.kind === 'folder' && i.folder.folderId === fid)));

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  // ── Découpe / suivi ──
  const toggleDecoupe = (key) => setDecoupe(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const allKeys = useMemo(() => items.flatMap(decoupableKeys).map(k => k.key), [items]);
  const toggleAllDecoupe = () => setDecoupe(prev => {
    const allOn = allKeys.length > 0 && allKeys.every(k => prev.has(k));
    return allOn ? new Set() : new Set(allKeys);
  });
  // Une pièce décochée ne doit pas rester dans l'ensemble découpe.
  useEffect(() => {
    setDecoupe(prev => {
      const live = new Set(allKeys);
      let changed = false;
      const next = new Set();
      prev.forEach(k => { if (live.has(k)) next.add(k); else changed = true; });
      return changed ? next : prev;
    });
  }, [allKeys]);
  const toggleSuivre = (id) => setSuivre(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  // Un item qui quitte le panier (retrait, absorption par un bloc, carte vidée)
  // ne doit jamais laisser un suivi fantôme : le CTA dit toujours la vérité.
  useEffect(() => {
    setSuivre(prev => {
      const live = new Set(items.map(i => i.id));
      let changed = false;
      const next = new Set();
      prev.forEach(id => { if (live.has(id)) next.add(id); else changed = true; });
      return changed ? next : prev;
    });
  }, [items]);

  // Vues dérivées pour la colonne mail.
  const stagedFolderIds = useMemo(() => new Set(items.filter(i => i.kind === 'folder').map(i => i.folder.folderId)), [items]);
  const threadStateMap = useMemo(() => {
    const m = new Map();
    items.forEach(i => {
      if (i.kind === 'thread' && i.thread.threadId) {
        const taken = new Set(i.thread.pieces.filter(p => p.included).map(p => p.key));
        m.set(i.thread.threadId, { itemId: i.id, taken, total: i.thread.pieces.length });
      }
    });
    return m;
  }, [items]);

  return {
    items, setItems, decoupe, suivre,
    addLocalFiles,
    takeThread, takeManyThreads, togglePieceById,
    takeFolder, removeThread, removeFolder, removeItem,
    toggleDecoupe, toggleAllDecoupe, toggleSuivre, setSuivre,
    stagedFolderIds, threadStateMap,
  };
}
