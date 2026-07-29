// Panier / composeur (spec §3, colonne droite) - un récapitulatif, pas un lieu
// de curation. Seule exception : la découpe (décision de FORME, pas de
// périmètre). Sections DOCUMENTS / DEPUIS LES EMAILS, items en cartes ;
// l'aperçu d'un dossier est en lecture seule - aucune case d'exclusion, la
// curation se fait à gauche.

import React, { useState } from 'react';
import { ChevronRight, FileText, Folder, FileArchive, Loader2, Mail, Plus, X, AlertTriangle } from 'lucide-react';
import Button from '../../ui/Button';
import DropZone from '../../ui/DropZone';
import { decoupableKeys, threadsOfFolder } from './labData';
import { DecoupeControl, Elbow, LabSwitch, monoLabel, usePhase2 } from './atoms';

const CARD = { border: '1px solid #e7e5e3', borderRadius: 12, backgroundColor: '#ffffff' };

function SectionHeader({ children }) {
  return <p className="pt-1 pb-2" style={monoLabel}>{children}</p>;
}

function RemoveBtn({ onClick, title = 'Retirer' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 rounded text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all flex-shrink-0"
      title={title}
    >
      <X className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
}

function DoublonMention() {
  return (
    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] leading-4 rounded-md px-2 py-1" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>
      <AlertTriangle className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
      Doublon possible - une pièce identique existe déjà dans le dossier, rien ne sera écrasé.
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

// Ligne PJ indentée (coude), avec son contrôle découpe. Hauteur fixe : le
// rythme vertical reste régulier quel que soit l'état du contrôle.
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
      {item.status === 'doublon' && <DoublonMention />}
    </div>
  );
}

function ThreadCard({ item, decoupe, onToggleDecoupe, suivre, onToggleSuivre }) {
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
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">{uploading ? 'Import en cours…' : t.meta}</span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Échange courriel</span>
        {!uploading && <RemoveBtn onClick={() => item.onRemoveId && item.onRemoveId()} />}
      </div>
      {t.pj.length > 0 && !uploading && (
        <div className="mt-2 pl-1 flex flex-col">
          {t.pj.map(pj => <PJLine key={pj.key} pj={pj} decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} />)}
        </div>
      )}
      {uploading && <UploadBar />}
      {item.status === 'doublon' && <DoublonMention />}
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
  // Aperçu INTÉGRAL : tout ce qui entrera est visible, rien de caché.
  const preview = open ? threadsOfFolder(f.folderId) : [];
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={() => setOpen(o => !o)} className="p-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0" title={open ? 'Replier l\'aperçu' : 'Aperçu du contenu (lecture seule)'}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} />
        </button>
        <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
        <span className="flex-1 min-w-0 ml-0.5">
          <span className="text-sm leading-5 font-medium text-foreground truncate block">{f.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">{f.path} · {f.stats.threads} échange{f.stats.threads > 1 ? 's' : ''} · ≈ {f.stats.pieces} pièces</span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Dossier Outlook</span>
        <RemoveBtn onClick={() => onRemove(item.id)} />
      </div>
      {open && (
        <div className="mt-3 rounded-lg border border-border-subtle overflow-hidden" style={{ backgroundColor: '#faf9f7' }}>
          <div className="divide-y divide-border-subtle" style={{ maxHeight: 420, overflowY: 'auto' }}>
            {preview.map(tv => (
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
          <div className="px-3.5 py-2 border-t border-border-subtle flex items-center justify-between gap-3">
            <span className="text-[11px] text-foreground-secondary flex-shrink-0">{preview.length} échange{preview.length > 1 ? 's' : ''} - tout entre avec le dossier</span>
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
  items, onRemove,
  decoupe, onToggleDecoupe, onToggleAllDecoupe,
  suivre, onToggleSuivre,
  onAddFiles,
  collapsed, onExpand, expandBadge = 0,
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
            <span className="relative inline-flex">
              <Button variant="outline" size="md" icon={Mail} label="Ajouter depuis mes emails" onClick={onExpand} />
              {expandBadge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full text-[10px] font-medium text-white tabular-nums" style={{ backgroundColor: '#292524' }}>
                  {expandBadge}
                </span>
              )}
            </span>
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
                          item={{ ...it, onRemoveId: () => onRemove(it.id) }}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe}
                          suivre={suivre} onToggleSuivre={onToggleSuivre}
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
