// Panier / composeur (spec §3, colonne droite) - un récapitulatif, pas un lieu
// de curation. Seule exception : la découpe (décision de FORME, pas de
// périmètre). Sections DOCUMENTS / DEPUIS LES EMAILS, items en cartes ;
// l'aperçu d'un dossier est en lecture seule - aucune case d'exclusion, la
// curation se fait à gauche.

import React, { useState } from 'react';
import { ChevronRight, FileText, Folder, FileArchive, Loader2, Mail, Plus, X, AlertTriangle, Scissors } from 'lucide-react';
import Button from '../../ui/Button';
import DropZone from '../../ui/DropZone';
import {
  decoupableKeys, threadCardSubtitle,
  folderIncludedCounts, treeState, treeCounts, treeThreadTotals, treeLeaves,
} from './labData';
import { Checkbox, DecoupeControl, Elbow, LabSwitch, monoLabel } from './atoms';

const CARD = { border: '1px solid #e7e5e3', borderRadius: 12, backgroundColor: '#ffffff' };

function SectionHeader({ children }) {
  return <p className="pt-1 pb-2" style={monoLabel}>{children}</p>;
}

function RemoveBtn({ onClick, title = 'Retirer' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 rounded text-foreground-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-red-500 transition-all flex-shrink-0"
      title={title}
      aria-label={title}
    >
      <X className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
}

// Un échec ou un doute est une ligne avec sa raison ET une action (invariant) :
// ici, la sortie honnête est de ne pas ajouter le doublon - un geste réel.
function DoublonMention({ onSkip }) {
  return (
    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] leading-4 rounded-md px-2 py-1" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>
      <AlertTriangle className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
      Doublon possible - une pièce identique existe déjà dans le dossier, rien ne sera écrasé.
      {onSkip && (
        <button type="button" onClick={onSkip} className="font-medium underline underline-offset-2 hover:opacity-70 transition-opacity flex-shrink-0" title="Retirer cette carte du panier">
          Ne pas ajouter
        </button>
      )}
    </p>
  );
}

function UploadBar() {
  return (
    <span className="block h-0.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: '#eeece6' }}>
      <span className="block h-full rounded-full animate-pulse" style={{ width: '60%', backgroundColor: '#a8a29e' }} />
    </span>
  );
}

// Ligne « Corps du mail » indentée, lecture seule (aperçu dossier / zip). Le
// corps est une pièce comme les autres (invariant) : il DOIT apparaître sous
// chaque échange, au même titre que ses PJ, jamais implicite.
function BodyLine({ msg, dim = false }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 h-7" style={dim ? { opacity: 0.85 } : undefined}>
      <Elbow />
      <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
      <span className="flex-1 min-w-0 text-[13px] text-foreground truncate">Corps du mail</span>
      {msg > 1 && (
        <span className="inline-flex items-center h-4 px-1 rounded text-[9px] font-medium uppercase text-foreground-secondary flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#eeece6' }}>{msg} msg</span>
      )}
    </div>
  );
}

// Ligne PJ indentée (coude), lecture seule (aperçu dossier / zip), avec découpe.
function PJLine({ pj, decoupe, onToggleDecoupe, dim = false }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0 h-7" style={dim ? { opacity: 0.85 } : undefined}>
      <Elbow />
      <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#b4483c' }} />
      <span className="flex-1 min-w-0 text-[13px] text-foreground truncate">{pj.name}</span>
      {pj.decoupable && (
        <DecoupeControl on={decoupe.has(pj.key)} onToggle={() => onToggleDecoupe(pj.key)} />
      )}
    </div>
  );
}

// Pièce d'un thread dans le panier : case (inclusion), la ligne RESTE visible
// même décochée (estompée, jamais barrée) - recocher est le même geste. Le corps
// du mail est une pièce comme les autres ; seules les PJ portent la découpe.
function PieceLine({ piece, included, onToggle, decoupe, onToggleDecoupe }) {
  const isBody = piece.kind === 'body';
  const Icon = isBody ? Mail : FileText;
  return (
    <div className="flex items-center gap-2.5 min-w-0 h-8" style={included ? undefined : { opacity: 0.45 }}>
      <Elbow />
      <Checkbox checked={included} onToggle={onToggle} title={included ? 'Ne pas inclure cette pièce' : 'Inclure cette pièce'} />
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: isBody ? '#1e3a8a' : '#b4483c' }} />
      <span className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-[13px] text-foreground truncate">{isBody ? 'Corps du mail' : piece.name}</span>
        {isBody && piece.msg > 1 && !piece.reason && (
          <span className="inline-flex items-center h-4 px-1 rounded text-[9px] font-medium uppercase text-foreground-secondary flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#eeece6' }}>{piece.msg} msg</span>
        )}
        {/* Complément d'un fil déjà importé : d'où vient cette pièce. */}
        {piece.reason === 'nouvelle' && (
          <span className="inline-flex items-center h-4 px-1.5 rounded text-[9px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>nouvelle</span>
        )}
        {piece.reason === 'actualisé' && (
          <span className="inline-flex items-center h-4 px-1.5 rounded text-[9px] font-medium flex-shrink-0" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>+{piece.newMessages} message{piece.newMessages > 1 ? 's' : ''}</span>
        )}
      </span>
      {!isBody && piece.decoupable && included && (
        <DecoupeControl on={decoupe.has(piece.key)} onToggle={() => onToggleDecoupe(piece.key)} />
      )}
    </div>
  );
}

// Groupe « échange + ses pièces » dans un aperçu (zip déplié). Le corps du mail
// est une pièce : il figure sous l'échange, puis chaque PJ.
function PreviewThreadGroup({ subject, sender, illegible = false, msg, pjLines }) {
  return (
    <div className="px-3.5 py-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-2.5 min-w-0 h-6">
        <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a', opacity: 0.8 }} />
        <span className={`flex-1 min-w-0 text-[13px] truncate ${illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{subject}</span>
        <span className="text-[11px] text-foreground-muted truncate flex-shrink-0 text-right" style={{ maxWidth: 180 }}>{sender}</span>
      </div>
      <div className="pl-1.5 flex flex-col">
        <BodyLine msg={msg} />
        {pjLines}
      </div>
    </div>
  );
}

// Ligne condensée : nom + méta sur une seule ligne, contrôles à droite.
function FileCard({ item, decoupe, onToggleDecoupe, onRemove }) {
  const f = item.file;
  const uploading = item.status === 'uploading';
  return (
    <div className="group px-3.5 py-2" style={CARD}>
      <div className="flex items-center gap-2.5 min-w-0" style={{ minHeight: 28 }}>
        {uploading
          ? <Loader2 className="w-4 h-4 text-foreground-secondary animate-spin flex-shrink-0" />
          : <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#b4483c' }} />}
        <span className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className={`text-sm leading-5 truncate ${uploading ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{f.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate flex-shrink-0">{uploading ? 'Import en cours…' : f.meta}</span>
        </span>
        {!uploading && f.decoupable && (
          <DecoupeControl on={decoupe.has(item.id)} onToggle={() => onToggleDecoupe(item.id)} />
        )}
        {!uploading && <RemoveBtn onClick={() => onRemove(item.id)} />}
      </div>
      {uploading && <UploadBar />}
      {item.status === 'doublon' && <DoublonMention onSkip={() => onRemove(item.id)} />}
    </div>
  );
}

// Un échange est un objet IMPORTÉ (instantané), jamais une source : pas de
// suivi au niveau thread - seul le dossier est un concept de source.
function ThreadCard({ item, decoupe, onToggleDecoupe, onTogglePiece, onRemove }) {
  const t = item.thread;
  const uploading = item.status === 'uploading';
  const topUp = item.topUp;
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2.5 min-w-0">
        {uploading
          ? <Loader2 className="w-4 h-4 text-foreground-secondary animate-spin flex-shrink-0" />
          : <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />}
        <span className="flex-1 min-w-0">
          <span className={`text-sm leading-5 truncate block ${uploading || t.illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{t.subject}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">
            {uploading ? 'Import en cours…' : topUp ? `Complète l'import du ${topUp.importedOn} · nouvelles pièces seulement` : threadCardSubtitle(t)}
          </span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>{topUp ? 'Complément' : 'Échange courriel'}</span>
        {!uploading && <RemoveBtn onClick={() => onRemove(item.id)} title="Retirer l'échange" />}
      </div>
      {!uploading && (
        <div className="mt-2 pl-1 flex flex-col">
          {t.pieces.map(p => (
            <PieceLine
              key={p.key}
              piece={p}
              included={p.included}
              onToggle={() => onTogglePiece(item.id, p.key, !p.included)}
              decoupe={decoupe}
              onToggleDecoupe={onToggleDecoupe}
            />
          ))}
        </div>
      )}
      {uploading && <UploadBar />}
      {item.status === 'doublon' && <DoublonMention onSkip={() => onRemove(item.id)} />}
    </div>
  );
}

// « Tout découper » contextuel (dossier / sous-dossier / échange) : bascule la
// découpe de TOUTES les PJ découpables retenues sous le nœud. Tri-état, révélé
// au survol (visible dès qu'au moins une est découpée).
// Discret par principe : révélé au survol, JAMAIS de pastille de compteur
// persistante (trop bruyant sur chaque niveau). Le détail se lit sur les PJ
// elles-mêmes. Le libellé bascule « Tout découper » ⇄ « Tout recoller ».
function NodeDecoupeControl({ keys, decoupe, onToggleMany, revealOnHover = true }) {
  const on = keys.reduce((a, k) => a + (decoupe.has(k) ? 1 : 0), 0);
  const allOn = on === keys.length;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggleMany(keys, !allOn); }}
      className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium flex-shrink-0 text-foreground-secondary hover:text-foreground hover:bg-cream transition-all ${revealOnHover ? 'opacity-0 group-hover/node:opacity-100 focus-visible:opacity-100' : ''}`}
      title={allOn ? 'Recoller ces pièces' : 'Découper toutes les pièces découpables de ce niveau'}
    >
      <Scissors className="w-3 h-3" strokeWidth={1.75} />
      {allOn ? 'Tout recoller' : 'Tout découper'}
    </button>
  );
}

// ── Nœud récursif de l'arbre d'un dossier ───────────────────────────────────
// Case sur CHAQUE nœud (dossier / sous-dossier / thread / corps / PJ), tri-état,
// repliable, compteur par ligne, « Découper » sur les PJ + « Tout découper »
// contextuel sur les dossiers / échanges.
function FolderTreeNode({ node, depth, itemId, onToggleNode, expanded, onToggleExpand, decoupe, onToggleDecoupe, onToggleDecoupeMany }) {
  const hasChildren = !!node.children;
  const isOpen = expanded.has(node.key);
  const state = treeState(node);
  const { total, included } = treeCounts(node);
  const isPj = node.kind === 'pj';
  const isBody = node.kind === 'body';
  const Icon = node.kind === 'folder' ? Folder : (node.kind === 'thread' || isBody) ? Mail : FileText;
  const color = isPj ? '#b4483c' : node.kind === 'folder' ? '#78716c' : '#1e3a8a';
  const dim = state === 'none';
  const isFolder = node.kind === 'folder';
  const tt = isFolder ? treeThreadTotals(node) : null;
  // Un échange se présente comme une carte : titre + expéditeur en dessous.
  const twoLine = node.kind === 'thread' && !!node.sub;
  // PJ découpables retenues sous ce nœud → « Tout découper » contextuel.
  const decKeys = hasChildren ? treeLeaves(node).filter(l => l.kind === 'pj' && l.decoupable && l.included).map(l => l.key) : [];
  const nameCls = `min-w-0 truncate ${isFolder || node.kind === 'thread' ? 'text-[13px] font-medium' : 'text-[12.5px]'} ${node.illegible ? 'italic text-foreground-secondary' : 'text-foreground'} ${!hasChildren && !node.included ? 'line-through' : ''}`;
  return (
    <>
      {/* Indentation par palier fixe (20px/niveau) + tête à largeur fixe :
          chevron (nœud dépliable) ou COUDE (feuille) - harmonise les pièces avec
          les cartes échange, cases alignées à chaque profondeur. */}
      <div className="group/node flex gap-2 items-start rounded-lg hover:bg-cream/50 transition-colors" style={{ paddingLeft: 10 + depth * 20, paddingRight: 10, paddingTop: 6, paddingBottom: 6 }}>
          <span className="h-5 flex items-center justify-center flex-shrink-0" style={{ width: 18 }}>
            {hasChildren ? (
              <button type="button" onClick={() => onToggleExpand(node.key)} className="text-foreground-muted hover:text-foreground-secondary focus:outline-none" title={isOpen ? 'Replier' : 'Déplier'}>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2} />
              </button>
            ) : <Elbow />}
          </span>
          <span className="h-5 flex items-center flex-shrink-0">
            <Checkbox checked={state === 'all'} partial={state === 'some'} onToggle={() => onToggleNode(itemId, node.key, state !== 'all')} title={state === 'all' ? 'Ne pas importer' : 'Importer'} />
          </span>
          <span className="h-5 flex items-center flex-shrink-0">
            <Icon className="w-4 h-4" strokeWidth={1.75} style={{ color, opacity: dim ? 0.5 : 1 }} />
          </span>
          <div className="flex-1 min-w-0 flex flex-col justify-center" style={dim ? { opacity: 0.5 } : undefined}>
            <div className="flex items-center gap-2 min-w-0 h-5">
              <span className={nameCls}>{node.name}</span>
              {isBody && node.msg > 1 && (
                <span className="inline-flex items-center h-4 px-1 rounded text-[9px] font-medium uppercase text-foreground-secondary flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#eeece6' }}>{node.msg} msg</span>
              )}
              {!twoLine && node.sub && <span className="text-[11px] truncate flex-shrink-0" style={{ color: '#a8a29e' }}>{node.sub}</span>}
            </div>
            {twoLine && <span className="text-[11px] truncate leading-4" style={{ color: '#a8a29e' }}>{node.sub}</span>}
          </div>
          {/* Découper (PJ retenue) - aligné sur la 1re ligne, coexiste avec la case. */}
          {isPj && node.decoupable && node.included && (
            <span className="h-5 flex items-center flex-shrink-0"><DecoupeControl on={decoupe.has(node.key)} onToggle={() => onToggleDecoupe(node.key)} /></span>
          )}
          {/* « Tout découper » du dossier / sous-dossier / échange. */}
          {hasChildren && decKeys.length > 0 && (
            <span className="h-5 flex items-center flex-shrink-0"><NodeDecoupeControl keys={decKeys} decoupe={decoupe} onToggleMany={onToggleDecoupeMany} /></span>
          )}
          {/* Compteur (dossier / sous-dossier) - un échange montre ses pièces, pas de compteur. */}
          {isFolder && (
            <span className="h-5 flex items-center flex-shrink-0 tabular-nums text-[11px] text-foreground-muted">
              {tt ? `${tt.included}/${tt.threads} éch. · ` : ''}{included}/{total} pièces
            </span>
          )}
      </div>
      {hasChildren && isOpen && node.children.map(c => (
        <FolderTreeNode
          key={c.key} node={c} depth={depth + 1} itemId={itemId}
          onToggleNode={onToggleNode} expanded={expanded} onToggleExpand={onToggleExpand}
          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} onToggleDecoupeMany={onToggleDecoupeMany}
        />
      ))}
    </>
  );
}

// Carte dossier : arbre récursif à cases + barre d'action (Tout sélectionner +
// compteur live). L'import global reste le CTA du footer du modal.
function FolderCard({ item, decoupe, onToggleDecoupe, onToggleDecoupeMany, onRemove, onToggleNode }) {
  const [expanded, setExpanded] = useState(() => new Set());
  const toggleExpand = (key) => setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const f = item.folder;
  const inc = folderIncludedCounts(f);
  const rootState = treeState(f.tree);
  const curated = inc.threads !== inc.total || inc.pieces !== inc.piecesTotal;
  const decKeys = treeLeaves(f.tree).filter(l => l.kind === 'pj' && l.decoupable && l.included).map(l => l.key);
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
        <span className="flex-1 min-w-0">
          <span className="text-sm leading-5 font-medium text-foreground truncate block">{f.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">
            {f.stats.folders > 0 ? `${f.stats.folders} sous-dossier${f.stats.folders > 1 ? 's' : ''} · ` : ''}{inc.total} échange{inc.total > 1 ? 's' : ''} · {inc.piecesTotal} pièces
          </span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Dossier Outlook</span>
        <RemoveBtn onClick={() => onRemove(item.id)} title="Retirer le dossier" />
      </div>

      {/* Barre d'action : Tout sélectionner + compteur live */}
      <div className="mt-2.5 flex items-center gap-2.5 px-3 h-10 rounded-lg" style={{ backgroundColor: '#f5f4f1' }}>
        <button type="button" onClick={() => onToggleNode(item.id, f.tree.key, rootState !== 'all')} className="inline-flex items-center gap-2 flex-shrink-0" title={rootState === 'all' ? 'Tout décocher' : 'Tout sélectionner'}>
          <Checkbox checked={rootState === 'all'} partial={rootState === 'some'} onToggle={() => onToggleNode(item.id, f.tree.key, rootState !== 'all')} title="Tout sélectionner" />
          <span className="text-[12.5px] font-medium text-foreground">Tout sélectionner</span>
        </button>
        <span className="ml-auto text-[11px] tabular-nums text-foreground-secondary">
          <span className="font-medium text-foreground">{inc.threads}</span>/{inc.total} échanges · <span className="font-medium text-foreground">{inc.pieces}</span>/{inc.piecesTotal} pièces{curated ? ' retenus' : ''}
        </span>
        {decKeys.length > 0 && (
          <NodeDecoupeControl keys={decKeys} decoupe={decoupe} onToggleMany={onToggleDecoupeMany} revealOnHover={false} />
        )}
      </div>

      {/* Arbre - replié au-delà du 1er niveau */}
      <div className="mt-1.5 -mx-1" style={{ maxHeight: 440, overflowY: 'auto' }}>
        {f.tree.children.map(c => (
          <FolderTreeNode
            key={c.key} node={c} depth={0} itemId={item.id}
            onToggleNode={onToggleNode} expanded={expanded} onToggleExpand={toggleExpand}
            decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} onToggleDecoupeMany={onToggleDecoupeMany}
          />
        ))}
      </div>
    </div>
  );
}

function ZipCard({ item, decoupe, onToggleDecoupe, onRemove }) {
  const [open, setOpen] = useState(false);
  const z = item.zip;
  const uploading = item.status === 'uploading';
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={() => setOpen(o => !o)} className="p-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0" disabled={uploading}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} />
        </button>
        {uploading
          ? <Loader2 className="w-4 h-4 text-foreground-secondary animate-spin flex-shrink-0" />
          : <FileArchive className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />}
        <span className="flex-1 min-w-0 ml-0.5">
          <span className={`text-sm leading-5 truncate block ${uploading ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{z.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">{uploading ? 'Extraction de l\'export…' : `${z.meta} · ${z.children.reduce((n, c) => n + c.pj.length, 0)} PJ`}</span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Zip d'export Outlook</span>
        {!uploading && <RemoveBtn onClick={() => onRemove(item.id)} />}
      </div>
      {uploading && <UploadBar />}
      {open && !uploading && (
        <div className="mt-3 rounded-lg border border-border-subtle overflow-hidden" style={{ backgroundColor: '#faf9f7' }}>
          <div className="divide-y divide-border-subtle">
            {z.children.map((c, i) => (
              <PreviewThreadGroup
                key={i}
                subject={c.subject}
                sender={c.sender}
                pjLines={c.pj.map(pj => (
                  <PJLine key={pj.key} pj={pj} decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} />
                ))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Panier({
  items, onRemove, onTogglePiece, onToggleFolderNode,
  decoupe, onToggleDecoupe, onToggleDecoupeMany, onToggleAllDecoupe,
  onAddFiles,
  collapsed, onExpand,
  introCopy,
}) {
  const docs = items.filter(i => i.kind === 'file');
  const emails = items.filter(i => i.kind !== 'file');

  const allKeys = items.flatMap(decoupableKeys);
  const allOn = allKeys.length > 0 && allKeys.every(k => decoupe.has(k.key));

  return (
    <div className="flex-1 min-w-0 flex flex-col px-6 py-5 gap-4 overflow-hidden">
      {/* Intro */}
      <p className="text-sm text-foreground-secondary leading-5 flex-shrink-0" style={{ maxWidth: 640 }}>{introCopy}</p>

      {/* Toolbar : sources à gauche, « Tout découper » à droite. */}
      <div className="flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="md" icon={Plus} label="Ajouter depuis l'ordinateur" onClick={onAddFiles} />
          {collapsed && (
            <Button variant="outline" size="md" icon={Mail} label="Ajouter depuis mes emails" onClick={onExpand} />
          )}
        </div>
        {items.length > 0 && allKeys.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-foreground" style={{ lineHeight: 1 }}>Tout découper</span>
            <LabSwitch checked={allOn} onChange={onToggleAllDecoupe} />
          </div>
        )}
      </div>

      {items.length === 0 ? (
        // La dropzone occupe toute la hauteur restante ; on étire la primitive
        // DropZone et on recentre son contenu dans la boîte plus haute.
        <div className="flex-1 min-h-0 flex flex-col [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div]:justify-center">
          <DropZone
            variant="container"
            label="Déposez vos documents ici"
            sublabel="PDF, images, .eml, .msg, zip d'export Outlook - ou sélectionnez des échanges à gauche"
            onClick={onAddFiles}
          />
        </div>
      ) : (
        <>
          {/* Liste en sections - la zone de dépôt vit DANS le flux de la liste. */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1">
            {docs.length > 0 && (
              <>
                <SectionHeader>Documents</SectionHeader>
                <div className="flex flex-col gap-2 mb-4">
                  {docs.map(it => (
                    <FileCard key={it.id} item={it} decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} onRemove={onRemove} />
                  ))}
                </div>
              </>
            )}
            {emails.length > 0 && (
              <>
                <SectionHeader>Depuis les emails</SectionHeader>
                <div className="flex flex-col gap-2">
                  {emails.map(it => {
                    if (it.kind === 'thread') {
                      return (
                        <ThreadCard
                          key={it.id}
                          item={it}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe}
                          onTogglePiece={onTogglePiece}
                          onRemove={onRemove}
                        />
                      );
                    }
                    if (it.kind === 'folder') {
                      return (
                        <FolderCard
                          key={it.id}
                          item={it}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} onToggleDecoupeMany={onToggleDecoupeMany}
                          onRemove={onRemove}
                          onToggleFolderNode={onToggleFolderNode}
                        />
                      );
                    }
                    return <ZipCard key={it.id} item={it} decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} onRemove={onRemove} />;
                  })}
                </div>
              </>
            )}
            {/* Bande de dépôt en fin de liste : l'ajout continue dans le flux. */}
            <div className="mt-3 pb-1">
              <DropZone variant="inline" label="Déposez d'autres fichiers ici - PDF, images, .eml, .msg, zip d'export Outlook" onClick={onAddFiles} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
