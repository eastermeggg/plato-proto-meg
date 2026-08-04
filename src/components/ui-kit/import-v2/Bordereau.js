// Le BORDEREAU de la V2, calé AU PIXEL sur les planches Figma 3278-36997 :
// - « Import / Bordereau / Body PJs » : rangée 44px, case · icône (mail muet /
//   PJ bleue / ciseaux violets quand découpée) · nom 14 ; états hover /
//   Sera découpé (ai) / Annuler le découpage / Loading / Erreur / Doublon.
// - « Import / Bordereau / Folders » : arbre à cases tri-state, dossiers VERTS,
//   « Découper » en bouton blanc au survol du rang.
// - blocs cartes (chapeau icône + titre + « ✕ Retirer » 26px, barre « Tout
//   sélectionner »), bande de dépôt, portes d'entrée + « Tout découper » global.

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronDown, ChevronRight, FileText, FolderOpen, Loader2, Mail, Paperclip, Plus, Scissors, Upload, X } from 'lucide-react';
import { Checkbox, LabSwitch } from '../import/atoms';
import { treeCounts, treeState, treeThreadTotals } from '../import/labData';
import { treeDecoupableKeys } from './useBordereau';
import { V2, Badge, SmallBtn, HoverReveal, kindColor } from './pieceRow';

// LE chapeau de bloc : icône 16 teintée par nature · titre 14 medium, UNE
// ligne · pastille « ✕ Retirer » (26px secondaire). `tag` : chip d'état inline.
export function GroupChapeau({ kind = 'body', title, illegible = false, tag = null, divided = true, onRemove, removeTitle = 'Retirer' }) {
  const Icon = kind === 'folder' ? FolderOpen : kind === 'file' ? FileText : Mail;
  return (
    <div className={`bg-white pl-4 pr-2.5 py-3 flex items-center justify-between gap-3 ${divided ? 'border-b border-border' : ''}`}>
      <div className={`flex items-center min-w-0 ${kind === 'folder' ? 'gap-2.5' : 'gap-3'}`}>
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: kindColor(kind) }} />
        <p className={`text-[14px] leading-5 font-medium truncate ${illegible ? 'italic' : ''}`} style={{ color: V2.foreground }}>{title}</p>
        {tag}
      </div>
      {onRemove && <SmallBtn variant="secondary" icon={X} onClick={onRemove} title={removeTitle}>Retirer</SmallBtn>}
    </div>
  );
}

// Compteur de la barre de sélection : les NOMBRES en encre, le reste en muet.
function BarCounter({ pairs }) {
  return (
    <p className="text-[12px] leading-4 whitespace-nowrap flex-shrink-0" style={{ color: V2.muted, letterSpacing: 0.12 }}>
      {pairs.map(([a, b, unit], i) => (
        <React.Fragment key={unit}>
          {i > 0 && ' · '}
          <span style={{ color: V2.foreground }}>{a}</span>/{b} {unit}
        </React.Fragment>
      ))}
    </p>
  );
}

// Bouton fantôme des barres (« Tout découper » du bloc) : 26px, texte 12 muet.
function GhostBtn({ icon: Icon, children, onClick, title, active = false }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="inline-flex items-center gap-1.5 h-[26px] px-2 rounded text-[12px] leading-4 font-medium transition-colors flex-shrink-0 hover:bg-cream"
      style={active ? { backgroundColor: V2.aiSubtle, color: V2.ai } : { color: V2.muted }}
      title={title}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
      {children}
    </button>
  );
}

// La barre « Tout sélectionner » qui ouvre le corps de chaque bloc.
function SelectionBar({ state, onToggle, pairs, decoupe }) {
  return (
    <div className="w-full rounded-lg pl-4 pr-2 flex items-center justify-between gap-3 flex-shrink-0" style={{ backgroundColor: V2.accent, height: 50 }}>
      <div className="flex items-center gap-2">
        <Checkbox checked={state === 'all'} partial={state === 'some'} onToggle={onToggle} title={state === 'all' ? 'Tout écarter' : 'Tout sélectionner'} />
        <span className="text-[14px] leading-5 font-medium" style={{ color: V2.foreground }}>Tout sélectionner</span>
      </div>
      <div className="flex items-center gap-3">
        <BarCounter pairs={pairs} />
        {decoupe}
      </div>
    </div>
  );
}

// ── Rangée de pièce (planche « Import / Bordereau / Body PJs », 12 états) ──
export function Line({ line, api }) {
  const isUploading = line.status === 'uploading';
  const isError = line.status === 'error';
  const isDoublon = !!line.doublon && line.doublonStatus === 'pending';
  const cut = line.decoupe && line.included;
  const canCut = (line.detection || line.decoupable) && line.included && !isError && !isUploading;
  const excluded = !line.included;

  // Téléversement (État=Loading) : la case tient sa place invisible, spinner,
  // nom en italique estompé - rien n'est cochable tant que le fichier arrive.
  if (isUploading) {
    return (
      <div className="flex items-center gap-2 h-11 px-4 bg-white">
        <span className="w-4 flex-shrink-0" aria-hidden />
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" strokeWidth={1.33} style={{ color: V2.muted }} />
        <p className="flex-1 min-w-0 text-[14px] leading-5 italic truncate opacity-40" style={{ color: V2.foreground }}>{line.title}</p>
      </div>
    );
  }

  // Échec (État=error) : icône alerte + nom rouge + badge « Erreur », actions
  // toujours visibles - un échec n'est jamais silencieux, rien n'est entré.
  if (isError) {
    return (
      <div className="flex items-center justify-between gap-3 h-11 px-4 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.destructiveText }} />
          <Paperclip className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.destructiveText }} />
          <p className="min-w-0 text-[14px] leading-5 font-medium truncate" style={{ color: V2.destructiveText }}>{line.title}</p>
          <Badge tone="destructive">Erreur</Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SmallBtn variant="secondary" onClick={() => api.retryLine(line.id)} title="Relancer le téléversement">Réessayer</SmallBtn>
          <SmallBtn variant="secondary" onClick={() => api.toggleIncluded(line.id)} title="Écarter cette pièce du versement">Ignorer</SmallBtn>
        </div>
      </div>
    );
  }

  // Doublon à trancher (État=doublon) : alerte ambre + badge « Doublon
  // identifié », trois actions - le versement attend la décision.
  if (isDoublon) {
    return (
      <div className="flex items-center justify-between gap-3 h-11 px-4 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.warning }} />
          <Paperclip className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.warning }} />
          <p className="min-w-0 text-[14px] leading-5 font-medium truncate" style={{ color: V2.foreground }} title={line.doublon.note}>{line.title}</p>
          <Badge tone="warning" title={line.doublon.note}>Doublon identifié</Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SmallBtn variant="secondary" onClick={() => api.resolveDoublon(line.id, 'keep')} title="Verser quand même - la pièce du dossier reste">Garder les deux</SmallBtn>
          <SmallBtn variant="secondary" onClick={() => api.resolveDoublon(line.id, 'ignore')} title="Ne pas verser cette pièce">Supprimer</SmallBtn>
          <SmallBtn variant="secondary" onClick={() => {}} title={line.doublon.note}>Voir</SmallBtn>
        </div>
      </div>
    );
  }

  // Découpe armée (État=added-cut) : les ciseaux VIOLETS remplacent le
  // trombone, « Sera découpé » en chip ai ; au survol, « Annuler le découpage ».
  if (cut) {
    return (
      <div>
        <div
          className="group relative flex items-center justify-between gap-3 h-11 px-4 bg-white transition-colors"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Checkbox checked onToggle={() => api.toggleIncluded(line.id)} title="Ne pas ajouter ces pièces" />
            <Scissors className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.aiIcon }} />
            <p className="min-w-0 text-[14px] leading-5 font-medium truncate" style={{ color: V2.foreground }}>{line.title}</p>
            {line.tag && <Badge tone="warning">{line.tag}</Badge>}
          </div>
          <SmallBtn variant="ai-subtle" icon={Scissors} onClick={() => api.toggleDecoupe(line.id)} title="Sera découpée à l'aperçu - cliquer pour annuler">
            Sera découpé
          </SmallBtn>
          <HoverReveal>
            <SmallBtn variant="outline" icon={Scissors} onClick={() => api.toggleDecoupe(line.id)} title="Annuler la découpe">Annuler le découpage</SmallBtn>
          </HoverReveal>
        </div>
        {/* Les pièces PRODUITES restent de vraies lignes, indentées. */}
        {line.detection && (
          <div className="flex flex-col">
            {line.detection.pieces.map((p) => (
              <div key={p.name} className="flex items-center gap-2 h-9 pl-10 pr-4 bg-white">
                <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={1.33} style={{ color: V2.pj }} />
                <p className="flex-1 min-w-0 text-[13px] leading-5 truncate" style={{ color: V2.foreground }}>{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Rangée nominale (Def / added / hover) : case · icône · nom (medium quand
  // retenue) ; « ✂ Découper » se révèle au survol d'une pièce découpable.
  const resolvedNote = line.doublonStatus === 'kept' ? 'Conservée' : line.doublonStatus === 'ignored' ? 'Ignorée' : null;
  return (
    <div
      className="group relative flex items-center gap-2 h-11 px-4 bg-white transition-colors"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
    >
      <Checkbox
        checked={line.included}
        onToggle={() => api.toggleIncluded(line.id)}
        title={line.included ? 'Ne pas ajouter cette pièce' : 'Ajouter cette pièce'}
      />
      {line.kind === 'body' ? (
        <Mail className={`w-4 h-4 flex-shrink-0 ${excluded ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.muted }} />
      ) : line.kind === 'pj' ? (
        <Paperclip className={`w-4 h-4 flex-shrink-0 ${excluded ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.pj }} />
      ) : (
        <FileText className={`w-4 h-4 flex-shrink-0 ${excluded ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: V2.pj }} />
      )}
      <p className={`flex-1 min-w-0 text-[14px] leading-5 truncate ${line.included ? 'font-medium' : 'opacity-50'}`} style={{ color: V2.foreground }}>{line.title}</p>
      {line.tag && line.included && <Badge tone="warning">{line.tag}</Badge>}
      {resolvedNote && <Badge tone="secondary" title={line.doublon?.note}>{resolvedNote}</Badge>}
      {canCut && !line.decoupe && (
        <HoverReveal>
          <SmallBtn variant="outline" icon={Scissors} onClick={() => api.toggleDecoupe(line.id)} title="Scinder ce document en pièces">Découper</SmallBtn>
        </HoverReveal>
      )}
    </div>
  );
}

// ── Bloc dossier : l'arbre à cases (planche « Bordereau / Folders ») ────────
function TreePjDecoupe({ leafKey, name, decoupe, api, detectionFor }) {
  const on = decoupe.has(leafKey);
  const det = detectionFor ? detectionFor(name) : null;
  if (on) {
    return (
      <SmallBtn variant="ai-subtle" icon={Scissors} onClick={() => api.toggleFolderDecoupe(leafKey)} title="Sera découpée - cliquer pour annuler">
        Sera découpé
      </SmallBtn>
    );
  }
  return (
    <HoverReveal>
      <SmallBtn variant="outline" icon={Scissors} onClick={() => api.toggleFolderDecoupe(leafKey)} title="Découper cette PJ en pièces">Découper</SmallBtn>
    </HoverReveal>
  );
}

// « Tout découper » d'un nœud (dossier / échange), au survol du rang.
function TreeNodeDecoupe({ node, decoupe, api }) {
  const keys = treeDecoupableKeys(node);
  if (keys.length === 0) return null;
  const allOn = keys.every(k => decoupe.has(k));
  if (allOn) {
    return (
      <SmallBtn variant="ai-subtle" icon={Scissors} onClick={() => api.setFolderDecoupeMany(keys, false)} title="Annuler la découpe de ces PJ">Sera découpé</SmallBtn>
    );
  }
  return (
    <HoverReveal>
      <SmallBtn variant="outline" icon={Scissors} onClick={() => api.setFolderDecoupeMany(keys, true)} title={`Découper les ${keys.length} PJ de ce niveau`}>Découper</SmallBtn>
    </HoverReveal>
  );
}

function TreeNode({ node, depth, fid, decoupe, api, detectionFor }) {
  const [open, setOpen] = useState(depth < 1);
  const leaf = !node.children;
  const st = leaf ? (node.included ? 'all' : 'none') : treeState(node);
  const toggle = () => api.toggleFolderNode(fid, node.key, st !== 'all');
  const isFolder = node.kind === 'folder';
  const decoupablePj = node.kind === 'pj' && node.decoupable && node.included;
  // Réf. Figma : nœud à 16 + 20 par niveau ; une feuille s'aligne sous l'icône
  // de son échange (padding du parent + 50).
  const padLeft = leaf ? 16 + 20 * (depth - 1) + 50 : 16 + 20 * depth;
  const Icon = isFolder ? FolderOpen : node.kind === 'pj' ? FileText : Mail;
  const iconColor = isFolder ? V2.folder : node.kind === 'pj' ? V2.pj : V2.muted;

  return (
    <div>
      <div
        className={`group relative flex items-center gap-2.5 pr-2 transition-colors ${leaf ? 'py-3' : 'py-2'} ${st === 'none' ? '' : ''}`}
        style={{ paddingLeft: padLeft }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = V2.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
      >
        {!leaf ? (
          <button type="button" onClick={() => setOpen(o => !o)} className="flex-shrink-0" style={{ color: V2.muted }} aria-label={open ? 'Replier' : 'Déplier'}>
            {open ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} /> : <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />}
          </button>
        ) : null}
        <Checkbox checked={st === 'all'} partial={st === 'some'} onToggle={toggle} title={st === 'all' ? 'Écarter' : 'Reprendre'} />
        <Icon className={`w-4 h-4 flex-shrink-0 ${st === 'none' ? 'opacity-50' : ''}`} strokeWidth={1.33} style={{ color: iconColor }} />
        <span className={`flex-1 min-w-0 truncate text-[14px] leading-5 ${isFolder || node.kind === 'thread' ? 'font-medium' : ''} ${st === 'none' ? 'opacity-50' : ''} ${node.illegible ? 'italic' : ''}`} style={{ color: V2.foreground }}>{node.name}</span>
        {decoupablePj && <TreePjDecoupe leafKey={node.key} name={node.name} decoupe={decoupe} api={api} detectionFor={detectionFor} />}
        {!leaf && <TreeNodeDecoupe node={node} decoupe={decoupe} api={api} />}
      </div>
      {!leaf && open && node.children.map(c => <TreeNode key={c.key} node={c} depth={depth + 1} fid={fid} decoupe={decoupe} api={api} detectionFor={detectionFor} />)}
    </div>
  );
}

// Enveloppe carte d'un bloc (rounded-6, bord, ombre 2xs).
function BlocCard({ children }) {
  return (
    <section className="rounded-md border border-border bg-white overflow-hidden" style={{ boxShadow: '0 1px 1px rgba(26,26,26,0.05)' }}>
      {children}
    </section>
  );
}

export function FolderBloc({ folder, api, detectionFor }) {
  const decoupe = api.folderDecoupe;
  const t = treeThreadTotals(folder.tree);
  const c = treeCounts(folder.tree);
  const st = treeState(folder.tree);
  const keys = treeDecoupableKeys(folder.tree);
  const allOn = keys.length > 0 && keys.every(k => decoupe.has(k));
  const kids = folder.tree.children || [];
  return (
    <BlocCard>
      <GroupChapeau kind="folder" title={`Dossier ${folder.name}`} onRemove={() => api.removeFolder(folder.fid)} removeTitle="Retirer le dossier du bordereau" />
      <div className="p-2.5">
        <SelectionBar
          state={st}
          onToggle={() => api.toggleFolderNode(folder.fid, folder.tree.key, st !== 'all')}
          pairs={[[t.included, t.threads, 'échanges'], [c.included, c.total, 'pièces retenues']]}
          decoupe={keys.length > 0 && (
            <GhostBtn icon={Scissors} active={allOn} onClick={() => api.setFolderDecoupeMany(keys, !allOn)} title={allOn ? 'Annuler toutes les découpes du dossier' : `Découper les ${keys.length} PJ du dossier`}>
              {allOn ? 'Sera découpé' : 'Tout découper'}
            </GhostBtn>
          )}
        />
        {kids.map((n, i) => (
          <div key={n.key} className={i < kids.length - 1 ? 'border-b border-border' : ''}>
            <TreeNode node={n} depth={0} fid={folder.fid} decoupe={decoupe} api={api} detectionFor={detectionFor} />
          </div>
        ))}
      </div>
    </BlocCard>
  );
}

// Barre de sélection d'un groupe de LIGNES (échange ou fichiers).
function LinesSelectionBar({ ls, api }) {
  const usable = ls.filter(l => l.status !== 'error');
  const included = usable.filter(l => l.included);
  const state = included.length === 0 ? 'none' : included.length === usable.length ? 'all' : 'some';
  const setAll = (on) => usable.forEach(l => { if (l.included !== on) api.toggleIncluded(l.id); });
  const decoupables = ls.filter(l => (l.detection || l.decoupable) && l.included && l.status !== 'error');
  const allOn = decoupables.length > 0 && decoupables.every(l => l.decoupe);
  return (
    <SelectionBar
      state={state}
      onToggle={() => setAll(state !== 'all')}
      pairs={[[included.length, usable.length, 'pièces retenues']]}
      decoupe={decoupables.length > 0 && (
        <GhostBtn icon={Scissors} active={allOn} onClick={() => decoupables.forEach(l => { if (l.decoupe !== !allOn) api.toggleDecoupe(l.id); })} title={allOn ? 'Annuler les découpes de ce bloc' : `Découper les ${decoupables.length} documents de ce bloc`}>
          {allOn ? 'Sera découpé' : 'Tout découper'}
        </GhostBtn>
      )}
    />
  );
}

// Bande de dépôt : strip 40px quand le bordereau a du contenu, grande zone
// quand il est vide (écrans « Empty » de la planche).
function DropStrip({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-10 rounded-lg border border-dashed flex items-center justify-center gap-2 text-[12px] transition-colors hover:bg-cream flex-shrink-0"
      style={{ borderColor: '#d6d3d1', color: V2.muted }}
    >
      <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
      Déposez des fichiers ici - PDF, images, .eml, .msg, zip d'export Outlook
    </button>
  );
}

function DropZoneLarge({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex-1 min-h-0 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 transition-colors hover:bg-cream/40"
      style={{ borderColor: '#d6d3d1', background: 'linear-gradient(180deg, rgba(238,236,230,0.35) 0%, rgba(238,236,230,0) 30%)' }}
    >
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border" style={{ borderColor: '#d6d3d1', boxShadow: '0 1px 2px rgba(26,26,26,0.05)' }}>
        <Upload className="w-5 h-5" strokeWidth={1.75} style={{ color: V2.foreground }} />
      </span>
      <span className="text-[14px] font-medium" style={{ color: V2.foreground }}>Déposez vos fichiers ici</span>
      <span className="text-[12px]" style={{ color: V2.muted }}>PDF, images, .eml, .msg, zip d'export Outlook - ou ajoutez depuis vos emails</span>
    </button>
  );
}

export default function Bordereau({ api, mailOpen, onToggleMail, detectionFor }) {
  const { lines, folders } = api;
  const empty = lines.length === 0 && folders.length === 0;

  // Structuré PAR OBJET : bloc dossier, puis chaque échange sous son chapeau,
  // puis les fichiers - ce qui arrive ensemble reste lié.
  const threadGroups = [];
  const fileLines = [];
  const byTid = new Map();
  lines.forEach(l => {
    if (!l.threadId) { fileLines.push(l); return; }
    if (!byTid.has(l.threadId)) {
      const g = { threadId: l.threadId, subject: l.threadSubject, illegible: l.threadIllegible, lead: l.threadLead, mailbox: l.threadMailbox, topUp: l.topUp, ls: [] };
      byTid.set(l.threadId, g);
      threadGroups.push(g);
    }
    byTid.get(l.threadId).ls.push(l);
  });

  // Provenance multi-boîtes sur le chapeau (spec « Connexion boîtes mail ») :
  // - personal : signal d'exposition - la boîte est privée, le DOSSIER est le
  //   lieu du partage ; le chip le dit une fois, sans dramatiser.
  // - both : reçu dans deux boîtes, dédoublonné - une seule pièce versée.
  const mailboxTag = (g) => {
    if (g.mailbox === 'personal') {
      return <Badge tone="secondary" title="Versé depuis votre boîte - visible par le cabinet une fois dans le dossier.">Depuis votre boîte</Badge>;
    }
    if (g.mailbox === 'both') {
      return <Badge tone="secondary" title="Reçu par la boîte cabinet et dans votre boîte - dédoublonné : une seule pièce.">Aussi dans votre boîte</Badge>;
    }
    return null;
  };

  return (
    <div className="flex-1 min-w-0 border-l border-border flex flex-col min-h-0" style={{ backgroundColor: V2.accent }}>
      {/* Tête : phrase-contrat, portes d'entrée à gauche + « Tout découper »
          global à droite, bande de dépôt. */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0 flex flex-col gap-4">
        <div>
          <p className="text-[14px] leading-5 font-medium" style={{ color: V2.foreground }}>Bordereau d'ajout</p>
          <p className="text-[14px] leading-5 mt-0.5" style={{ color: V2.muted }}>
            Les pièces ajoutées rejoindront le dossier. Vous pourrez les découper et les ranger ensuite.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Écran « Empty » de la planche : les DEUX portes côte à côte tant
                que le bordereau est vide ; ensuite la porte email ne revient
                que panneau replié (la colonne de gauche EST la porte). */}
            {(!mailOpen || empty) && (
              <button
                type="button"
                onClick={onToggleMail}
                className="inline-flex items-center gap-1.5 h-9 px-[15px] rounded-lg border border-border bg-white text-[14px] leading-5 font-medium hover:bg-cream transition-colors"
                style={{ color: V2.foreground }}
                title="Parcourir vos emails et la récolte proposée"
              >
                <Mail className="w-4 h-4" strokeWidth={1.75} />
                Ajouter depuis mes emails
              </button>
            )}
            <button
              type="button"
              onClick={api.addLocalFile}
              className="inline-flex items-center gap-1.5 h-9 px-[15px] rounded-lg border border-border bg-white text-[14px] leading-5 font-medium hover:bg-cream transition-colors"
              style={{ color: V2.foreground }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Ajouter depuis l'ordinateur
            </button>
          </div>
          <label className={`flex items-center gap-2 flex-shrink-0 ${api.anyDecoupable ? 'cursor-pointer' : 'opacity-50'}`} title={api.anyDecoupable ? 'Armer la découpe de tous les documents découpables' : 'Rien à découper pour l\'instant'}>
            <span className="text-[14px] leading-[14px] font-medium" style={{ color: V2.foreground }}>Tout découper</span>
            <LabSwitch checked={api.allDecoupe} disabled={!api.anyDecoupable} onChange={api.setAllDecoupe} />
          </label>
        </div>
        {!empty && <DropStrip onClick={api.addLocalFile} />}
      </div>

      <div className={`flex-1 min-h-0 px-6 pb-5 ${empty ? 'flex flex-col' : 'overflow-y-auto'}`}>
        {empty ? (
          <DropZoneLarge onClick={api.addLocalFile} />
        ) : (
          <div className="flex flex-col gap-4">
            {folders.map(f => <FolderBloc key={f.fid} folder={f} api={api} detectionFor={detectionFor} />)}
            {threadGroups.map(g => (
              <BlocCard key={g.threadId}>
                <GroupChapeau
                  title={g.subject}
                  illegible={g.illegible}
                  tag={<>
                    {mailboxTag(g)}
                    {g.topUp && <Badge tone="warning">Complément de l'import du {g.topUp}</Badge>}
                  </>}
                  onRemove={() => api.removeThread(g.threadId)}
                  removeTitle="Retirer cet échange du bordereau"
                />
                <div className="p-2.5">
                  <LinesSelectionBar ls={g.ls} api={api} />
                  {g.ls.map(l => <Line key={l.id} line={l} api={api} />)}
                </div>
              </BlocCard>
            ))}
            {fileLines.length > 0 && (
              <BlocCard>
                <GroupChapeau kind="file" title="Depuis l'ordinateur" />
                <div className="p-2.5">
                  <LinesSelectionBar ls={fileLines} api={api} />
                  {fileLines.map(l => <Line key={l.id} line={l} api={api} />)}
                </div>
              </BlocCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
