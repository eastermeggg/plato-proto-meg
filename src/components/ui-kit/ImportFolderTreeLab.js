import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Folder, Inbox, Mail, FileText, Check, Minus, Scissors } from 'lucide-react';
import {
  CLIENT_FOLDERS, buildFolderTree,
  nodeThreadCount, nodeCounts, nodeState, includedThreadCount,
} from './import/folderTreeData';

// Lab : import d'un dossier Outlook avec sélection sur CHAQUE nœud.
// Gauche = arborescence Outlook (dossiers d'affaire). Droite = aperçu du dossier
// sélectionné, arbre récursif à cases, replié au-delà du 1er niveau, actions au
// survol. Tout dossier est importable - aucun état bloquant.

const INK = '#1c1917', SEC = '#57534e', MUT = '#78716c', FAINT = '#a8a29e';
const BORDER = '#e7e5e3', CREAM = '#f8f7f5';

// ── Case à cocher tri-état ──────────────────────────────────────────────────
function TriCheck({ state, onToggle }) {
  const on = state !== 'none';
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      role="checkbox"
      aria-checked={state === 'some' ? 'mixed' : state === 'all'}
      className="flex-shrink-0"
      title={state === 'all' ? 'Tout décocher' : 'Tout cocher'}
    >
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-colors"
        style={on
          ? { backgroundColor: INK, borderColor: INK }
          : { backgroundColor: '#fff', borderColor: '#cfcac3', boxShadow: '0 1px 1px rgba(26,26,26,0.05)' }}
      >
        {state === 'some' ? <Minus className="w-3 h-3 text-white" strokeWidth={3} />
          : state === 'all' ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

const iconFor = (kind) => (kind === 'folder' ? Folder : kind === 'thread' ? Mail : kind === 'message' ? Mail : kind === 'body' ? Mail : FileText);
const iconColor = (kind) => (kind === 'pj' ? '#b4483c' : kind === 'folder' ? '#78716c' : '#1e3a8a');

// ── Ligne d'un nœud (récursive) ─────────────────────────────────────────────
function TreeNode({ node, depth, excluded, expanded, onToggleNode, onToggleExpand, decoupe, onToggleDecoupe }) {
  const hasChildren = !!node.children;
  const isOpen = expanded.has(node.key);
  const state = nodeState(node, excluded);
  const { total, included } = nodeCounts(node, excluded);
  const Icon = iconFor(node.kind);
  const isLeaf = !hasChildren;
  const isPj = node.kind === 'pj';
  const dim = state === 'none';
  const threads = node.kind !== 'thread' && node.kind !== 'message' && hasChildren ? nodeThreadCount(node) : 0;
  const nIncThreads = threads ? includedThreadCount(node, excluded) : 0;

  return (
    <>
      <div
        className="group flex items-center gap-2 rounded-lg transition-colors hover:bg-cream/60"
        style={{ paddingLeft: 8 + depth * 18, paddingRight: 8, height: 34 }}
      >
        {/* Chevron (ou espace) */}
        {hasChildren ? (
          <button type="button" onClick={() => onToggleExpand(node.key)} className="p-0.5 -ml-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0" title={isOpen ? 'Replier' : 'Déplier'}>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2} />
          </button>
        ) : <span className="w-3.5 flex-shrink-0" />}
        <TriCheck state={state} onToggle={() => onToggleNode(node)} />
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: iconColor(node.kind), opacity: dim ? 0.5 : 1 }} />
        <span className="flex-1 min-w-0 flex items-center gap-2" style={dim ? { opacity: 0.5 } : undefined}>
          <span className={`min-w-0 truncate ${isLeaf ? 'text-[12.5px]' : 'text-[13px]'} ${node.kind === 'folder' ? 'font-medium' : ''}`} style={{ color: INK }}>{node.name}</span>
          {node.sub && <span className="text-[11px] truncate flex-shrink-0" style={{ color: FAINT }}>{node.sub}</span>}
        </span>
        {/* Action au survol : découper un PDF (coexiste avec la case) */}
        {isPj && node.decoupable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleDecoupe(node.key); }}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            style={decoupe.has(node.key)
              ? { backgroundColor: INK, color: '#f5f4f1', opacity: 1 }
              : { color: SEC }}
            title={decoupe.has(node.key) ? 'Annuler la découpe' : 'Découper ce document'}
          >
            <Scissors className="w-3 h-3" strokeWidth={1.75} /> {decoupe.has(node.key) ? 'Sera découpé' : 'Découper'}
          </button>
        )}
        {/* Compteur par ligne : reflète la sélection */}
        {hasChildren && (
          <span className="flex-shrink-0 tabular-nums text-[11px]" style={{ color: MUT }}>
            {threads ? `${nIncThreads}/${nodeThreadCount(node)} échanges · ` : ''}{included}/{total} pièces
          </span>
        )}
      </div>
      {hasChildren && isOpen && node.children.map(c => (
        <TreeNode
          key={c.key} node={c} depth={depth + 1}
          excluded={excluded} expanded={expanded}
          onToggleNode={onToggleNode} onToggleExpand={onToggleExpand}
          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe}
        />
      ))}
    </>
  );
}

export default function ImportFolderTreeLab() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(CLIENT_FOLDERS[0]);
  const tree = useMemo(() => buildFolderTree(selected), [selected]);
  // Résumés de l'arborescence gauche - calculés une fois (pas à chaque coche).
  const summaries = useMemo(() => CLIENT_FOLDERS.map(name => {
    const t = buildFolderTree(name);
    return { name, subs: t.children.length, threads: nodeThreadCount(t) };
  }), []);

  // Sélection = ensemble des feuilles EXCLUES (défaut : tout coché → vide).
  const [excluded, setExcluded] = useState(() => new Set());
  const [expanded, setExpanded] = useState(() => new Set());
  const [decoupe, setDecoupe] = useState(() => new Set());

  // Réinitialise à chaque changement de dossier. Replié au-delà du 1er niveau :
  // les sous-dossiers s'affichent, leur contenu (échanges) reste replié.
  const [lastKey, setLastKey] = useState(null);
  if (tree.key !== lastKey) {
    setLastKey(tree.key);
    setExcluded(new Set());
    setDecoupe(new Set());
    setExpanded(new Set());
  }

  const leavesOf = (node) => (node.children ? node.children.flatMap(leavesOf) : [node]);
  const toggleNode = (node) => {
    const leaves = leavesOf(node).map(l => l.key);
    const st = nodeState(node, excluded);
    setExcluded(prev => {
      const n = new Set(prev);
      if (st === 'all') leaves.forEach(k => n.add(k)); // tout décocher
      else leaves.forEach(k => n.delete(k));           // tout cocher
      return n;
    });
  };
  const toggleExpand = (key) => setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleDecoupe = (key) => setDecoupe(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const rootState = nodeState(tree, excluded);
  const rootCounts = nodeCounts(tree, excluded);
  const incThreads = includedThreadCount(tree, excluded);
  const totThreads = nodeThreadCount(tree);
  const toggleAll = () => toggleNode(tree);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#fff' }}>
      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '24px 32px 12px' }}>
        <button onClick={() => navigate('/ui-kit')} className="flex items-center gap-1.5 text-foreground-secondary hover:text-foreground transition-colors" style={{ fontSize: 13, marginBottom: 14 }}>
          <ArrowLeft className="w-4 h-4" /> UI Kit
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Import de dossier - sélection par nœud</h1>
        <p style={{ fontSize: 13.5, color: SEC, margin: 0, maxWidth: 760, lineHeight: '20px' }}>
          Gauche : l'arborescence Outlook. Droite : le dossier sélectionné avant import - une case à cocher sur chaque nœud (dossier, sous-dossier, échange, message, pièce jointe), replié au-delà du 1er niveau. Tout dossier est importable.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex" style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '8px 32px 24px' }}>
        {/* Panneau gauche : arborescence Outlook */}
        <div className="flex flex-col rounded-l-xl border overflow-hidden" style={{ width: 320, borderColor: BORDER, backgroundColor: CREAM }}>
          <div className="flex items-center gap-2 px-4 h-12 border-b flex-shrink-0" style={{ borderColor: BORDER }}>
            <Inbox className="w-4 h-4" strokeWidth={1.75} style={{ color: SEC }} />
            <span className="text-sm font-medium" style={{ color: INK }}>Dossiers Outlook</span>
            <span className="ml-auto text-[11px] tabular-nums" style={{ color: MUT }}>{CLIENT_FOLDERS.length}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto py-1.5">
            {summaries.map(({ name, subs, threads }) => {
              const active = name === selected;
              return (
                <button
                  key={name} type="button" onClick={() => setSelected(name)}
                  className="w-full flex items-center gap-2.5 px-4 h-11 text-left transition-colors"
                  style={{ backgroundColor: active ? '#fff' : 'transparent', boxShadow: active ? `inset 3px 0 0 ${INK}` : 'none' }}
                >
                  <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: active ? '#1e3a8a' : MUT }} />
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] truncate block" style={{ color: INK, fontWeight: active ? 500 : 400 }}>{name}</span>
                    <span className="text-[11px] truncate block tabular-nums" style={{ color: MUT }}>{subs} sous-dossiers · {threads} échanges</span>
                  </span>
                  {active && <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2} style={{ color: FAINT }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bloc droit : aperçu du dossier sélectionné */}
        <div className="flex-1 min-w-0 flex flex-col rounded-r-xl border border-l-0 overflow-hidden" style={{ borderColor: BORDER }}>
          {/* Barre d'action (remplace tout bandeau bloquant) */}
          <div className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0" style={{ borderColor: BORDER, backgroundColor: CREAM }}>
            <button type="button" onClick={toggleAll} className="inline-flex items-center gap-2 flex-shrink-0" title={rootState === 'all' ? 'Tout décocher' : 'Tout sélectionner'}>
              <TriCheck state={rootState} onToggle={toggleAll} />
              <span className="text-[13px] font-medium" style={{ color: INK }}>Tout sélectionner</span>
            </button>
            <span className="w-px h-5 flex-shrink-0" style={{ backgroundColor: BORDER }} />
            <span className="text-[13px] tabular-nums" style={{ color: SEC }}>
              <span className="font-medium" style={{ color: INK }}>{incThreads}</span> / {totThreads} échanges · <span className="font-medium" style={{ color: INK }}>{rootCounts.included}</span> / {rootCounts.total} pièces sélectionnés
            </span>
            <div className="ml-auto flex items-center gap-2.5 flex-shrink-0">
              {decoupe.size > 0 && <span className="text-[11px] tabular-nums" style={{ color: MUT }}>{decoupe.size} à découper</span>}
              <button
                type="button" disabled={rootCounts.included === 0}
                className="h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: INK, opacity: rootCounts.included === 0 ? 0.4 : 1, cursor: rootCounts.included === 0 ? 'not-allowed' : 'pointer' }}
              >
                Importer {rootCounts.included > 0 ? `${rootCounts.included} pièce${rootCounts.included > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>

          {/* En-tête du dossier */}
          <div className="flex items-center gap-2.5 px-4 pt-3 pb-1 flex-shrink-0">
            <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
            <span className="text-[15px] font-semibold" style={{ color: INK }}>{tree.name}</span>
            <span className="text-[11px] tabular-nums" style={{ color: MUT }}>{tree.children.length} sous-dossiers · {totThreads} échanges · {rootCounts.total} pièces</span>
          </div>

          {/* Arbre récursif */}
          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
            {tree.children.map(c => (
              <TreeNode
                key={c.key} node={c} depth={0}
                excluded={excluded} expanded={expanded}
                onToggleNode={toggleNode} onToggleExpand={toggleExpand}
                decoupe={decoupe} onToggleDecoupe={toggleDecoupe}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
