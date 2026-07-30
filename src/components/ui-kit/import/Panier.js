// Panier / composeur (spec §3, colonne droite) - un récapitulatif, pas un lieu
// de curation. Seule exception : la découpe (décision de FORME, pas de
// périmètre). Sections DOCUMENTS / DEPUIS LES EMAILS, items en cartes ;
// l'aperçu d'un dossier est en lecture seule - aucune case d'exclusion, la
// curation se fait à gauche.

import React, { useState } from 'react';
import { ChevronRight, FileText, Folder, FileArchive, Loader2, Mail, Plus, X, AlertTriangle } from 'lucide-react';
import Button from '../../ui/Button';
import DropZone from '../../ui/DropZone';
import { decoupableKeys, threadGroupsOfFolderDeep, threadCardSubtitle } from './labData';
import { Checkbox, DecoupeControl, Elbow, LabSwitch, monoLabel, usePhase2 } from './atoms';

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
        {isBody && piece.msg > 1 && (
          <span className="inline-flex items-center h-4 px-1 rounded text-[9px] font-medium uppercase text-foreground-secondary flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: '#eeece6' }}>{piece.msg} msg</span>
        )}
      </span>
      {!isBody && piece.decoupable && included && (
        <DecoupeControl on={decoupe.has(piece.key)} onToggle={() => onToggleDecoupe(piece.key)} />
      )}
    </div>
  );
}

// Groupe « échange + ses PJ » dans un aperçu (dossier ouvert, zip déplié).
function PreviewThreadGroup({ subject, sender, illegible = false, pjLines }) {
  return (
    <div className="px-3.5 py-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-2.5 min-w-0 h-6">
        <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a', opacity: 0.8 }} />
        <span className={`flex-1 min-w-0 text-[13px] truncate ${illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{subject}</span>
        <span className="text-[11px] text-foreground-muted truncate flex-shrink-0 text-right" style={{ maxWidth: 180 }}>{sender}</span>
      </div>
      {pjLines.length > 0 && <div className="pl-1.5 flex flex-col">{pjLines}</div>}
    </div>
  );
}

// Pied « Suivre » (phase 2, sources email uniquement - un fichier ne se suit pas).
function SuivreFoot({ on, onToggle, label, hint }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/70 flex items-center gap-2.5">
      <LabSwitch checked={on} onChange={onToggle} />
      <span className="text-xs font-medium text-foreground flex-shrink-0">{label}</span>
      <span className="text-[11px] text-foreground-muted truncate">{hint}</span>
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

function ThreadCard({ item, decoupe, onToggleDecoupe, onTogglePiece, suivre, onToggleSuivre, onRemove }) {
  const phase2 = usePhase2();
  const t = item.thread;
  const uploading = item.status === 'uploading';
  const followable = phase2 && item.origin === 'emails';
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2.5 min-w-0">
        {uploading
          ? <Loader2 className="w-4 h-4 text-foreground-secondary animate-spin flex-shrink-0" />
          : <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />}
        <span className="flex-1 min-w-0">
          <span className={`text-sm leading-5 truncate block ${uploading || t.illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{t.subject}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">{uploading ? 'Import en cours…' : threadCardSubtitle(t)}</span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Échange courriel</span>
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
      {followable && (
        <SuivreFoot
          on={suivre.has(item.id)}
          onToggle={() => onToggleSuivre(item.id)}
          label="Suivre cet échange"
          hint="les prochains messages arriveront dans les pièces, marqués « Nouveau »"
        />
      )}
    </div>
  );
}

function FolderCard({ item, decoupe, onToggleDecoupe, suivre, onToggleSuivre, onRemove }) {
  const phase2 = usePhase2();
  const [open, setOpen] = useState(false);
  const f = item.folder;
  // Aperçu INTÉGRAL et RÉCURSIF : tout ce qui entrera est visible, sous-dossiers
  // compris, groupé par dossier - rien de caché, l'aperçu dit ce que le commit fait.
  const groups = open ? threadGroupsOfFolderDeep(f.folderId) : [];
  const nThreads = groups.reduce((n, g) => n + g.threads.length, 0);
  const hasSub = groups.length > 1;
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={() => setOpen(o => !o)} className="p-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0" title={open ? 'Replier l\'aperçu' : 'Aperçu du contenu (lecture seule)'}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} />
        </button>
        <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
        <span className="flex-1 min-w-0 ml-0.5">
          <span className="text-sm leading-5 font-medium text-foreground truncate block">{f.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">
            {f.path}{f.stats.folders > 0 ? ` · ${f.stats.folders} sous-dossier${f.stats.folders > 1 ? 's' : ''}` : ''} · {f.stats.threads} échange{f.stats.threads > 1 ? 's' : ''} · ≈ {f.stats.pieces} pièces
          </span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Dossier Outlook</span>
        <RemoveBtn onClick={() => onRemove(item.id)} />
      </div>
      {open && (
        <div className="mt-3 rounded-lg border border-border-subtle overflow-hidden" style={{ backgroundColor: '#faf9f7' }}>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {groups.map((g, gi) => (
              <div key={g.folder.id}>
                {hasSub && (
                  <div className={`px-3.5 pt-2.5 pb-0.5 flex items-center gap-1.5 ${gi > 0 ? 'border-t border-border-subtle' : ''}`}>
                    <Folder className="w-3 h-3 flex-shrink-0 text-foreground-muted" strokeWidth={1.75} />
                    <span style={monoLabel}>{g.folder.id === f.folderId ? f.name : g.folder.name}</span>
                  </div>
                )}
                <div className="divide-y divide-border-subtle">
                  {g.threads.map(tv => (
                    <PreviewThreadGroup
                      key={tv.id}
                      subject={tv.subject}
                      sender={tv.sender}
                      illegible={tv.illegible}
                      pjLines={tv.attachments.map((a, i) => (
                        <PJLine
                          key={`${tv.id}-${i}`}
                          pj={{ key: `${tv.id}::${a.name}`, name: a.name, decoupable: a.decoupable }}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} dim
                        />
                      ))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2 border-t border-border-subtle flex items-center justify-between gap-3">
            <span className="text-[11px] text-foreground-secondary flex-shrink-0">
              {nThreads} échange{nThreads > 1 ? 's' : ''}{hasSub ? ', sous-dossiers compris' : ''} - tout entre avec le dossier
            </span>
            <span className="text-[10px] text-foreground-muted truncate text-right">Aperçu en lecture seule - la curation se fait à gauche</span>
          </div>
        </div>
      )}
      {phase2 && (
        <SuivreFoot
          on={suivre.has(item.id)}
          onToggle={() => onToggleSuivre(item.id)}
          label="Suivre ce dossier"
          hint="tout son contenu, y compris les futurs sous-dossiers"
        />
      )}
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
  items, onRemove, onTogglePiece,
  decoupe, onToggleDecoupe, onToggleAllDecoupe,
  suivre, onToggleSuivre,
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
                          suivre={suivre} onToggleSuivre={onToggleSuivre}
                          onRemove={onRemove}
                        />
                      );
                    }
                    if (it.kind === 'folder') {
                      return (
                        <FolderCard
                          key={it.id}
                          item={it}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe}
                          suivre={suivre} onToggleSuivre={onToggleSuivre}
                          onRemove={onRemove}
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
