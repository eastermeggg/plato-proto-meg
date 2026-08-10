// Contrôleur du bordereau V2. Une seule vérité : les LIGNES du bordereau
// (une ligne = une pièce) + les BLOCS dossier (un dossier Outlook pris en
// entier, curable par nœud). L'invariant de transvasement est conservé : un
// geste côté récolte = c'est au bordereau, sans étape intermédiaire.
// Décocher estompe (la ligne reste visible) ; retirer côté récolte enlève.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  mapTreeInclude, treeCounts, treeThreadTotals, treeLeaves, detectionFor,
} from '../import/labData';
import {
  threadLineSpecs, threadDeltaLineSpecs, localFileSpec,
  folderModel, buildFolderTree, folderBreadcrumbV2, folderStats, folderDelta,
} from './harvestData';

// Clés découpables d'un arbre de bloc : seules les PJ RETENUES se découpent
// (jamais un corps de mail, jamais une pièce écartée) - règle V1 conservée.
export const treeDecoupableKeys = (node) => treeLeaves(node)
  .filter(l => l.kind === 'pj' && l.decoupable && l.included)
  .map(l => l.key);

// « ≈ N pièces » d'un bloc : feuilles retenues + expansion des découpes
// détectées (une PJ découpée compte pour ses pièces produites).
export const folderApprox = (folder, decoupe) => treeCounts(folder.tree).included
  + treeLeaves(folder.tree).reduce((n, l) => {
    if (l.kind !== 'pj' || !l.included || !decoupe.has(l.key)) return n;
    const det = detectionFor(l.name);
    return n + (det ? det.count - 1 : 0);
  }, 0);

let lineSeq = 0;
const mkLine = (spec) => ({
  id: `l-${lineSeq++}`,
  included: true,
  nodeId: 'sans-categorie', // défaut conservateur : jamais rangé d'office
  decoupe: false,
  status: 'ready',
  doublonStatus: spec.doublon ? 'pending' : null, // pending | ignored | replace
  ...spec,
});

// Tous les ids d'échanges portés par l'arbre d'un bloc dossier.
const treeThreadIds = (node) => {
  if (node.kind === 'thread') return [node.key];
  return (node.children || []).flatMap(treeThreadIds);
};

export function useBordereau() {
  const [lines, setLines] = useState([]);
  const [folders, setFolders] = useState([]);
  const fileCursor = useRef(0);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Dédup par `key` : ajouter deux fois le même échange ne crée jamais deux
  // lignes - on recoche ce qui existe, on crée ce qui manque.
  const addSpecs = (specs) => setLines(prev => {
    const byKey = new Map(prev.map(l => [l.key, l]));
    const revived = prev.map(l => (specs.some(s => s.key === l.key) ? { ...l, included: l.doublonStatus === 'ignored' ? l.included : true } : l));
    const fresh = specs.filter(s => !byKey.has(s.key)).map(mkLine);
    return [...revived, ...fresh];
  });

  const addThread = (tid) => addSpecs(threadLineSpecs(tid));
  const addPiece = (tid, key) => addSpecs(threadLineSpecs(tid).filter(s => s.key === key));
  // Sélection pièce par pièce DEPUIS LA GAUCHE (aperçu déplié) : cocher crée la
  // ligne, décocher l'estompe - même vérité que le bordereau, dans les deux sens.
  const togglePieceIncluded = (tid, key) => setLines(prev => {
    const ex = prev.find(l => l.key === key);
    if (ex) return prev.map(l => (l.key === key ? { ...l, included: !l.included } : l));
    // Préférer la spec de COMPLÉMENT si elle existe (une PJ « nouvelle » / un
    // corps « actualisé » d'un fil déjà importé : tag ambre + rattachée au
    // chapeau « Complément de l'import »). Sur un fil normal, delta = [] et on
    // retombe sur la spec standard.
    const spec = threadDeltaLineSpecs(tid).find(s => s.key === key) || threadLineSpecs(tid).find(s => s.key === key);
    return spec ? [...prev, mkLine(spec)] : prev;
  });
  // Complète un fil déjà importé : QUE le delta (corps actualisé + PJ
  // nouvelles) - les pièces déjà au dossier n'entrent jamais deux fois.
  const addThreadDelta = (tid) => addSpecs(threadDeltaLineSpecs(tid));
  const removeThread = (tid) => setLines(prev => prev.filter(l => l.threadId !== tid));

  // Un dossier pris est un bloc RÉCURSIF ; il ABSORBE les lignes d'échanges
  // qu'il couvre déjà - jamais deux fois la même pièce au commit.
  const addFolder = (fid) => {
    if (folders.some(f => f.fid === fid)) return;
    const m = folderModel(fid);
    if (!m) return;
    const tree = buildFolderTree(fid);
    const covered = new Set(treeThreadIds(tree));
    setLines(prev => prev.filter(l => !(l.threadId && covered.has(l.threadId))));
    setFolders(prev => [...prev, {
      fid, name: m.name, path: folderBreadcrumbV2(fid), stats: folderStats(fid), tree,
    }]);
  };
  const removeFolder = (fid) => setFolders(prev => prev.filter(f => f.fid !== fid));
  // Compléter un dossier déjà versé au dossier : n'ajoute QUE le delta (nouvel
  // échange + nouvelle PJ), comme le complément d'un fil - via les lignes.
  const addFolderDelta = (fid) => {
    const d = folderDelta(fid);
    if (!d) return;
    d.newTids.forEach(t => addSpecs(threadLineSpecs(t)));
    d.newPjKeys.forEach(k => { const tid = k.split('::')[0]; addSpecs(threadLineSpecs(tid).filter(s => s.key === k)); });
  };
  // Curation par nœud (tri-state) : toutes les feuilles sous le nœud basculent.
  const toggleFolderNode = (fid, nodeKey, included) => setFolders(prev => prev.map(f => (
    f.fid === fid ? { ...f, tree: mapTreeInclude(f.tree, nodeKey, included) } : f)));

  // ── Découpe dans les blocs : par PJ, ou en lot par nœud (dossier / sous-
  // dossier / échange), comme en V1. Un Set de clés pjKey, la même grammaire
  // que le commit.
  const [folderDecoupe, setFolderDecoupe] = useState(() => new Set());
  const toggleFolderDecoupe = (key) => setFolderDecoupe(prev => {
    const n = new Set(prev);
    if (n.has(key)) n.delete(key); else n.add(key);
    return n;
  });
  const setFolderDecoupeMany = (keys, on) => setFolderDecoupe(prev => {
    const n = new Set(prev);
    keys.forEach(k => (on ? n.add(k) : n.delete(k)));
    return n;
  });
  // Une PJ écartée (ou un bloc retiré) ne laisse jamais une découpe fantôme.
  const liveDecoupableKeys = useMemo(() => folders.flatMap(f => treeDecoupableKeys(f.tree)), [folders]);

  // « Tout découper » GLOBAL (réintroduit sur la réf. Figma 3332-33637) : une
  // bascule en tête du bordereau qui arme/désarme la découpe de TOUT ce qui est
  // découpable - lignes à plat ET PJ des blocs dossier. La découpe contextuelle
  // par ligne/nœud reste, la bascule est le geste de masse.
  const decoupableLines = useMemo(
    () => lines.filter(l => (l.detection || l.decoupable) && l.included && l.status !== 'error'),
    [lines],
  );
  const anyDecoupable = decoupableLines.length + liveDecoupableKeys.length > 0;
  const allDecoupe = anyDecoupable
    && decoupableLines.every(l => l.decoupe)
    && liveDecoupableKeys.every(k => folderDecoupe.has(k));
  const setAllDecoupe = (on) => {
    setLines(prev => prev.map(l => ((l.detection || l.decoupable) && l.status !== 'error' ? { ...l, decoupe: on } : l)));
    setFolderDecoupe(on ? new Set(liveDecoupableKeys) : new Set());
  };
  useEffect(() => {
    setFolderDecoupe(prev => {
      const live = new Set(liveDecoupableKeys);
      let changed = false;
      const next = new Set();
      prev.forEach(k => { if (live.has(k)) next.add(k); else changed = true; });
      return changed ? next : prev;
    });
  }, [liveDecoupableKeys]);

  const addLocalFile = () => {
    const spec = localFileSpec(fileCursor.current++);
    const line = { ...mkLine(spec), status: 'uploading' };
    setLines(prev => [...prev, line]);
    // Un échec ne disparaît pas : la ligne passe en erreur, avec action.
    const t = setTimeout(() => setLines(prev => prev.map(l => (l.id === line.id ? { ...l, status: spec.fail ? 'error' : 'ready' } : l))), 1400);
    timers.current.push(t);
  };

  // Fichiers RÉELS déposés dans l'app (le lab garde addLocalFile et ses specs
  // simulées). Une ligne par fichier accepté, NOM D'ORIGINE conservé ; upload
  // simulé court. La détection de découpe ne joue que sur les noms connus du
  // pool démo - un fichier inconnu reste découpable manuellement (verrou V1).
  const addFiles = (fileList) => {
    const accepted = fileList ? Array.from(fileList).filter(f => /\.(pdf|png|jpe?g|docx?|eml|msg|zip)$/i.test(f.name)) : [];
    accepted.forEach((f) => {
      const decoupable = /\.(pdf|docx?)$/i.test(f.name);
      const spec = {
        key: `file-${fileCursor.current++}-${f.name}`, threadId: null, kind: 'file',
        title: f.name,
        provenance: 'Déposé depuis l\'ordinateur',
        suggestedNodeId: null,
        decoupable,
        detection: decoupable ? detectionFor(f.name) : null,
        doublon: null,
      };
      const line = { ...mkLine(spec), status: 'uploading' };
      setLines(prev => [...prev, line]);
      const t = setTimeout(() => setLines(prev => prev.map(l => (l.id === line.id ? { ...l, status: 'ready' } : l))), 900 + Math.random() * 700);
      timers.current.push(t);
    });
  };

  // Réessayer un échec : repasse en téléversement, aboutit (démo).
  const retryLine = (id) => {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, status: 'uploading', fail: false } : l)));
    const t = setTimeout(() => setLines(prev => prev.map(l => (l.id === id && l.status === 'uploading' ? { ...l, status: 'ready' } : l))), 1400);
    timers.current.push(t);
  };

  const patch = (id, fn) => setLines(prev => prev.map(l => (l.id === id ? fn(l) : l)));
  const toggleIncluded = (id) => patch(id, l => ({ ...l, included: !l.included }));
  const toggleDecoupe = (id) => patch(id, l => ({ ...l, decoupe: !l.decoupe }));
  // Accepter la suggestion range la ligne ; c'est le SEUL chemin vers une
  // catégorie : proposition, jamais rangement d'office.
  const acceptSuggestion = (id) => patch(id, l => ({ ...l, nodeId: l.suggestedNodeId || l.nodeId, suggestedNodeId: null }));
  const dismissSuggestion = (id) => patch(id, l => ({ ...l, suggestedNodeId: null }));
  // Doublon (planche « État=doublon ») : « Garder les deux » = verser quand
  // même (la pièce du dossier reste) · « Supprimer » = écarter cette pièce.
  const resolveDoublon = (id, action) => patch(id, l => (action === 'ignore'
    ? { ...l, doublonStatus: 'ignored', included: false }
    : action === 'keep'
      ? { ...l, doublonStatus: 'kept' }
      : { ...l, doublonStatus: 'replace' }));

  const reset = () => { setLines([]); setFolders([]); setFolderDecoupe(new Set()); fileCursor.current = 0; };

  // ── Vues dérivées ──
  // État par échange pour la colonne récolte : quelles pièces sont au bordereau.
  const threadState = useMemo(() => {
    const m = new Map();
    lines.forEach(l => {
      if (!l.threadId) return;
      if (!m.has(l.threadId)) m.set(l.threadId, new Set());
      if (l.included) m.get(l.threadId).add(l.key);
    });
    return m;
  }, [lines]);

  // Échanges couverts par un bloc dossier : la carte récolte dit « Inclus via
  // le dossier » - la curation fine vit dans le bloc, pas sur la carte.
  const coveredTids = useMemo(() => new Set(folders.flatMap(f => treeThreadIds(f.tree))), [folders]);
  const addedFolderIds = useMemo(() => new Set(folders.map(f => f.fid)), [folders]);
  // Clés de lignes présentes : la carte dossier-delta sait si son delta a été
  // complété (toutes ses nouvelles pièces sont au bordereau).
  const lineKeys = useMemo(() => new Set(lines.map(l => l.key)), [lines]);

  // Une ligne en erreur n'est PAS une pièce (rien n'est entré) : elle ne
  // compte pas dans le ≈, mais reste visible.
  const activeLines = useMemo(() => lines.filter(l => l.included && l.status !== 'error'), [lines]);
  const uploadingCount = useMemo(() => lines.filter(l => l.status === 'uploading').length, [lines]);
  const folderPieces = useMemo(() => folders.reduce((n, f) => n + folderApprox(f, folderDecoupe), 0), [folders, folderDecoupe]);
  const folderThreads = useMemo(() => folders.reduce((n, f) => n + treeThreadTotals(f.tree).included, 0), [folders]);
  // « ≈ N pièces » : une découpe active compte pour ses pièces détectées.
  const approx = useMemo(
    () => activeLines.reduce((n, l) => n + (l.decoupe && l.detection ? l.detection.count : 1), 0) + folderPieces,
    [activeLines, folderPieces],
  );
  const decoupeCount = useMemo(
    () => activeLines.filter(l => l.decoupe).length + folderDecoupe.size,
    [activeLines, folderDecoupe],
  );
  const pendingDoublons = useMemo(() => activeLines.filter(l => l.doublonStatus === 'pending').length, [activeLines]);

  return {
    lines, folders, addThread, addPiece, togglePieceIncluded, addThreadDelta, removeThread, addLocalFile, addFiles,
    addFolder, addFolderDelta, removeFolder, toggleFolderNode,
    folderDecoupe, toggleFolderDecoupe, setFolderDecoupeMany,
    anyDecoupable, allDecoupe, setAllDecoupe,
    toggleIncluded, toggleDecoupe, acceptSuggestion, dismissSuggestion, resolveDoublon, retryLine,
    reset, threadState, coveredTids, addedFolderIds, lineKeys,
    approx, decoupeCount, pendingDoublons, uploadingCount, folderPieces, folderThreads,
  };
}
