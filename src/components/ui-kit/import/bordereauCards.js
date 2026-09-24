// Cartes et rangées de bordereau « v2 » - atomes réutilisables des flux
// d'import (nouveau dossier, ajout de pièces). Sources Figma « Import — Local
// Components » (Plato---Design 3698:29236) :
//   - Collapsible Objects 2 (4181:21992) : carte repliable header 44px,
//     chevron 12 + folder-open 16 bleu + titre médium + « ✕ Retirer »
//   - Flat Objects 2 (4181:22036) : rangées plates 40px, poignée grip,
//     icônes corps de mail / PJ, chip « Sera découpé » (ai-subtle)
// Consommés par CreateMatterModal ; à réutiliser pour tout bordereau de
// composition (les rangées du bordereau LIVE restent ui/tables/RowBordereau).

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, FileText, FolderOpen, GripVertical, Loader2,
  Mail, Scissors, X,
} from 'lucide-react';
import { colors, shadows, typography } from '../../../design-system/tokens';

// Libellé de section mono 11 uppercase (Figma caption/header-cols).
export function SectionHeader({ children }) {
  return (
    <p
      className="uppercase truncate"
      style={{ fontFamily: typography.fontFamily.mono, fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground }}
    >
      {children}
    </p>
  );
}

// « ✕ Retirer » - action de retrait d'une carte (header 44px, à droite).
export function RetirerButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="inline-flex items-center gap-1.5 h-[26px] px-2 rounded text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors flex-shrink-0"
      title="Retirer du bordereau"
    >
      <X className="w-3.5 h-3.5" strokeWidth={1.75} />
      Retirer
    </button>
  );
}

// Carte conteneur du bordereau : bord, radius 8, shadow xs, header 44px
// repliable (chevron 12 + folder-open 16 + titre médium) + « Retirer ».
export function BordereauCard({ title, onRemove, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div
      className="w-full rounded-lg border border-border bg-surface overflow-hidden flex flex-col"
      style={{ boxShadow: shadows.xs }}
    >
      <div className={`flex items-center justify-between h-11 pr-2.5 bg-surface ${open && children ? 'border-b border-border' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 min-w-0 flex items-center gap-2 h-10 px-4 text-left"
          title={open ? 'Replier' : 'Déplier'}
        >
          <Chevron className="w-3 h-3 flex-shrink-0" strokeWidth={2} style={{ color: colors.semantic.mutedForeground }} />
          <FolderOpen className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.feedback.info.text }} />
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
        </button>
        {onRemove && <RetirerButton onClick={onRemove} />}
      </div>
      {open && children}
    </div>
  );
}

// Ligne plate 40px : icône(s) + libellé (corps du mail / PJ / fichier).
export function FlatRow({ icon, grip = false, indent = 16, children, trailing, className = '' }) {
  return (
    <div className={`flex items-center gap-2 h-10 pr-4 bg-surface ${className}`} style={{ paddingLeft: indent }}>
      {grip && (
        <GripVertical className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.semantic.foregroundMuted }} />
      )}
      {icon}
      <span className="flex-1 min-w-0 text-sm text-foreground truncate">{children}</span>
      {trailing}
    </div>
  );
}

export const MailIcon = () => (
  <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.feedback.info.text }} />
);
export const PjIcon = () => (
  <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.doc.pdf }} />
);

// Chip découpe : « Sera découpé » (ai-subtle / ai-text, ciseaux 14) quand la
// clé est dans l'ensemble découpe ; sinon action discrète « Découper ».
export function DecoupeChip({ on, onToggle }) {
  if (on) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="inline-flex items-center gap-1.5 h-[26px] px-2 rounded flex-shrink-0"
        style={{ backgroundColor: colors.feedback.ai.subtle }}
        title="Sera découpé - cliquer pour annuler"
      >
        <Scissors className="w-3.5 h-3.5" strokeWidth={1.75} style={{ color: colors.feedback.ai.text }} />
        <span className="text-xs font-medium" style={{ color: colors.feedback.ai.text }}>Sera découpé</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="inline-flex items-center gap-1.5 h-[26px] px-2 rounded text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors flex-shrink-0"
      title="Scinder ce document en pièces"
    >
      <Scissors className="w-3.5 h-3.5" strokeWidth={1.75} />
      Découper
    </button>
  );
}

// Carte d'un échange (item thread) : header = objet du mail, lignes = corps +
// PJ retenues.
export function ThreadCard({ item, onRemove }) {
  const pieces = item.thread.pieces.filter(p => p.included);
  return (
    <BordereauCard title={item.thread.subject} onRemove={onRemove}>
      <div className="flex flex-col divide-y divide-border-subtle">
        {pieces.map(p => (
          <FlatRow key={p.key} icon={p.kind === 'body' ? <MailIcon /> : <PjIcon />}>
            {p.name}
          </FlatRow>
        ))}
      </div>
    </BordereauCard>
  );
}

// Carte d'un export .zip Outlook : échanges enfants + leurs PJ.
export function ZipCard({ item, onRemove }) {
  return (
    <BordereauCard title={item.zip.name} onRemove={onRemove}>
      <div className="flex flex-col divide-y divide-border-subtle">
        {item.zip.children.map((c, i) => (
          <React.Fragment key={i}>
            <FlatRow icon={<MailIcon />}>{c.subject}</FlatRow>
            {c.pj.map(pj => (
              <FlatRow key={pj.key} icon={<PjIcon />} grip indent={38}>{pj.name}</FlatRow>
            ))}
          </React.Fragment>
        ))}
      </div>
    </BordereauCard>
  );
}

// Nœud de l'arbre d'un dossier pris en bloc. Indentation Figma : sous-dossier
// 32px, feuilles 54px (grip 12 + icône 16 + nom).
export function FolderTreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 2);
  const indent = 16 + depth * 16;
  if (node.kind === 'folder') {
    const Chevron = open ? ChevronDown : ChevronRight;
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 h-10 pr-4 bg-surface text-left border-b border-border-subtle"
          style={{ paddingLeft: indent }}
        >
          <Chevron className="w-3 h-3 flex-shrink-0" strokeWidth={2} style={{ color: colors.semantic.mutedForeground }} />
          <FolderOpen className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: colors.feedback.info.text }} />
          <span className="text-sm font-medium text-foreground truncate">{node.name}</span>
        </button>
        {open && (node.children || []).map(c => <FolderTreeNode key={c.key} node={c} depth={depth + 1} />)}
      </>
    );
  }
  if (node.kind === 'thread') {
    if (node.bodyOnly) {
      if (!node.included) return null;
      return (
        <FlatRow icon={<MailIcon />} grip indent={indent + 6} className="border-b border-border-subtle">
          {node.name}
        </FlatRow>
      );
    }
    const kept = (node.children || []).filter(c => c.included);
    if (kept.length === 0) return null;
    return kept.map(c => (
      <FlatRow
        key={c.key}
        icon={c.kind === 'body' ? <MailIcon /> : <PjIcon />}
        grip
        indent={indent + 6}
        className="border-b border-border-subtle"
      >
        {c.name}
      </FlatRow>
    ));
  }
  return null;
}

export function FolderCard({ item, onRemove }) {
  return (
    <BordereauCard title={item.folder.name} onRemove={onRemove}>
      <div className="flex flex-col">
        {(item.folder.tree.children || []).map(c => <FolderTreeNode key={c.key} node={c} depth={1} />)}
      </div>
    </BordereauCard>
  );
}

// Carte plate des fichiers locaux (« Third Partial State Container ») :
// lignes 44px - spinner + nom italique estompé pendant la réception, puis
// icône PJ + nom médium, chip découpe sur les découpables.
export function LocalFilesCard({ files, decoupe, onToggleDecoupe }) {
  return (
    <div
      className="w-full rounded-lg border border-border bg-surface overflow-hidden flex flex-col divide-y divide-border"
      style={{ boxShadow: shadows.xs }}
    >
      {files.map(item => {
        const uploading = item.status === 'uploading';
        return (
          <div key={item.id} className="flex items-center justify-between gap-2 h-11 px-4 bg-surface">
            <div className="flex items-center gap-2 min-w-0">
              {uploading ? (
                <Loader2
                  className="w-4 h-4 flex-shrink-0 animate-spin"
                  strokeWidth={1.75}
                  style={{ color: colors.semantic.mutedForeground }}
                />
              ) : <PjIcon />}
              <span
                className={`text-sm truncate ${uploading ? 'italic text-foreground opacity-40' : 'font-medium text-foreground'}`}
              >
                {item.file.name}
              </span>
            </div>
            {!uploading && item.file.decoupable && (
              <DecoupeChip on={decoupe.has(item.id)} onToggle={() => onToggleDecoupe(item.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
