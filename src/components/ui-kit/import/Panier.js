// Panier / composeur (spec §3, colonne droite) - un récapitulatif, pas un lieu
// de curation. Seule exception : la découpe (décision de FORME, pas de
// périmètre). Sections DOCUMENTS / DEPUIS LES EMAILS, items en cartes ;
// l'aperçu d'un dossier est en lecture seule - aucune case d'exclusion, la
// curation se fait à gauche.

import React, { useState } from 'react';
import { ChevronRight, FileText, Folder, FileArchive, Loader2, Lock, Mail, Plus, X, AlertTriangle } from 'lucide-react';
import Button from '../../ui/Button';
import DropZone from '../../ui/DropZone';
import {
  decoupableKeys, threadCardSubtitle,
  folderComposition, folderSpan, threadSampleDeep, folderBreadcrumb, folderIncludedCounts,
} from './labData';
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

// Un échange est un objet IMPORTÉ (instantané), jamais une source : pas de
// suivi au niveau thread - seul le dossier est un concept de source.
function ThreadCard({ item, decoupe, onToggleDecoupe, onTogglePiece, onRemove }) {
  const t = item.thread;
  const uploading = item.status === 'uploading';
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
    </div>
  );
}

const SAMPLE_LIMIT = 6;
const COMPO_LIMIT = 5;

// Ligne de composition : un sous-dossier immédiat, double compte profond. C'est
// de l'INVENTAIRE, jamais une ligne suivable - mais elle porte la redirection
// corrective « Suivre à la place » (désigner l'affaire, pas le conteneur).
function CompositionLine({ folder, stats, redirectLabel, onRedirect }) {
  return (
    <div className="group/compo flex items-center gap-2 min-w-0 h-8 px-3.5">
      <Folder className="w-3.5 h-3.5 flex-shrink-0 text-foreground-muted" strokeWidth={1.75} />
      <span className="flex-1 min-w-0 text-[12.5px] text-foreground truncate">{folder.name}</span>
      <span className="flex-shrink-0 text-[11px] text-foreground-muted tabular-nums">
        {stats.threads} échange{stats.threads > 1 ? 's' : ''} · {stats.pieces} pièces
      </span>
      {onRedirect && (
        <button
          type="button"
          onClick={onRedirect}
          className="flex-shrink-0 text-[11px] font-medium text-foreground-secondary opacity-0 group-hover/compo:opacity-100 focus-visible:opacity-100 hover:text-foreground transition-all"
          title={`${redirectLabel} « ${folder.name} » seul`}
        >
          {redirectLabel} à la place
        </button>
      )}
    </div>
  );
}

// Avertissement de sur-import : au-dessus du suivi, jamais bloquant, DÉNOMBRÉ EN
// PIÈCES (ce que le pipeline traite réellement). Se termine par le chemin de
// correction, pas par un refus.
function OverImportWarning({ nAffaires, pieces }) {
  return (
    <div className="mt-3 rounded-lg px-3 py-2.5 flex items-start gap-2" style={{ backgroundColor: '#fdf6ea', border: '1px solid #f0e2c8' }}>
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" strokeWidth={2} style={{ color: '#855b31' }} />
      <span className="text-[11px] leading-4" style={{ color: '#855b31' }}>
        <span className="font-medium">{nAffaires} affaires différentes</span> - ≈ {pieces} pièces entreraient dans un seul dossier, découpage compris.
        Désignez plutôt le dossier de l'affaire concernée (« à la place » ci-dessus).
      </span>
    </div>
  );
}

function FolderCard({ item, decoupe, onToggleDecoupe, suivre, onToggleSuivre, onRemove, onRedirect, onToggleFolderThread, onToggleFolderPiece }) {
  const phase2 = usePhase2();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const toggleExpand = (tid) => setExpanded(prev => { const n = new Set(prev); n.has(tid) ? n.delete(tid) : n.add(tid); return n; });
  const f = item.folder;
  const pickable = !!f.groups;
  const inc = folderIncludedCounts(f);
  const compo = folderComposition(f.folderId);
  const hasSub = compo.length > 0;
  const multiGroup = pickable && f.groups.length > 1;
  const span = folderSpan(f.folderId);
  const sample = open && !pickable ? threadSampleDeep(f.folderId, SAMPLE_LIMIT) : [];
  const shownCompo = compo.slice(0, COMPO_LIMIT);
  const redirectLabel = phase2 ? 'Suivre' : 'Ajouter';
  const curated = inc.threads !== inc.total;
  return (
    <div className="group p-3.5" style={CARD}>
      <div className="flex items-center gap-2 min-w-0">
        <button type="button" onClick={() => setOpen(o => !o)} className="p-0.5 rounded text-foreground-muted hover:text-foreground-secondary flex-shrink-0" title={open ? 'Replier' : (pickable ? 'Choisir les échanges' : 'Aperçu du contenu')}>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} />
        </button>
        <Folder className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
        <span className="flex-1 min-w-0 ml-0.5">
          <span className="text-sm leading-5 font-medium text-foreground truncate block">{f.name}</span>
          <span className="text-[11px] leading-4 text-foreground-muted truncate block mt-0.5">
            {curated ? `${inc.threads} sur ${inc.total}` : inc.total} échange{inc.total > 1 ? 's' : ''} · ≈ {inc.pieces} pièces{f.stats.folders > 0 ? ` · ${f.stats.folders} sous-dossier${f.stats.folders > 1 ? 's' : ''}` : ''}
          </span>
        </span>
        <span className="text-[11px] leading-4 flex-shrink-0" style={{ color: '#a8a29e' }}>Dossier Outlook</span>
        <RemoveBtn onClick={() => onRemove(item.id)} />
      </div>
      {open && (
        <div className="mt-3 rounded-lg border border-border-subtle overflow-hidden" style={{ backgroundColor: '#faf9f7' }}>
          {pickable ? (
            // ── Picker : décochez ce que vous ne voulez pas importer ──
            <>
              <div className="px-3.5 py-2 border-b border-border-subtle" style={{ backgroundColor: '#f2f0ec' }}>
                <span className="text-[11px] leading-4 text-foreground-secondary">Décochez ce que vous ne voulez pas importer - échange entier ou pièce par pièce.</span>
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {f.groups.map(g => (
                  <div key={g.folderId}>
                    {multiGroup && (
                      <div className="px-3.5 pt-2.5 pb-0.5 flex items-center gap-1.5 border-b border-border-subtle">
                        <Folder className="w-3 h-3 flex-shrink-0 text-foreground-muted" strokeWidth={1.75} />
                        <span className="truncate" style={monoLabel}>{g.folderName}</span>
                      </div>
                    )}
                    {g.threads.map(t => {
                      const incCount = t.pieces.filter(p => p.included).length;
                      const total = t.pieces.length;
                      const allIn = incCount === total;
                      const isOpen = expanded.has(t.threadId);
                      return (
                        <div key={t.threadId} className="border-b border-border-subtle last:border-0">
                          <div className="flex items-center gap-2.5 min-w-0 px-3.5 py-2">
                            <Checkbox
                              checked={allIn}
                              partial={incCount > 0 && !allIn}
                              onToggle={() => onToggleFolderThread(item.id, t.threadId, !allIn)}
                              title={allIn ? 'Ne pas importer cet échange' : 'Importer cet échange'}
                            />
                            <button type="button" onClick={() => toggleExpand(t.threadId)} className="flex-1 min-w-0 flex items-center gap-2 text-left" title={isOpen ? 'Replier' : 'Voir corps et PJ'}>
                              <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a', opacity: 0.8 }} />
                              <span className={`flex-1 min-w-0 text-[13px] truncate ${incCount === 0 ? 'text-foreground-muted line-through' : t.illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{t.subject}</span>
                              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 text-foreground-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} strokeWidth={2} />
                            </button>
                          </div>
                          {isOpen && (
                            <div className="pl-6 pr-3.5 pb-1.5 flex flex-col">
                              {t.pieces.map(p => (
                                <PieceLine
                                  key={p.key}
                                  piece={p}
                                  included={p.included}
                                  onToggle={() => onToggleFolderPiece(item.id, t.threadId, p.key, !p.included)}
                                  decoupe={decoupe}
                                  onToggleDecoupe={onToggleDecoupe}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="px-3.5 py-2 border-t border-border-subtle">
                <span className="text-[11px] text-foreground-secondary">
                  {inc.threads} échange{inc.threads > 1 ? 's' : ''} · ≈ {inc.pieces} pièces retenus{curated ? ` sur ${inc.total}` : ''}
                </span>
              </div>
            </>
          ) : (
            // ── Conteneur large : bloc lecture seule + recentrage « à la place » ──
            <>
              <div className="px-3.5 py-2 border-b border-border-subtle flex items-start gap-2" style={{ backgroundColor: '#f2f0ec' }}>
                <Lock className="w-3 h-3 flex-shrink-0 mt-0.5 text-foreground-muted" strokeWidth={2} />
                <span className="text-[11px] leading-4 text-foreground-secondary">
                  Trop d'affaires pour trier ici. Recentrez sur un dossier avec « {redirectLabel} à la place », ou importez le conteneur en bloc.
                </span>
              </div>
              {hasSub && (
                <div className="py-1.5 border-b border-border-subtle">
                  <p className="px-3.5 pt-1 pb-1" style={monoLabel}>Sous-dossiers</p>
                  {shownCompo.map(c => (
                    <CompositionLine
                      key={c.folder.id}
                      folder={c.folder}
                      stats={c.stats}
                      redirectLabel={redirectLabel}
                      onRedirect={onRedirect ? () => onRedirect(item.id, c.folder.id) : null}
                    />
                  ))}
                  {compo.length > COMPO_LIMIT && (
                    <p className="px-3.5 pt-1 text-[11px] text-foreground-muted">et {compo.length - COMPO_LIMIT} autre{compo.length - COMPO_LIMIT > 1 ? 's' : ''}</p>
                  )}
                </div>
              )}
              <p className="px-3.5 pt-2 pb-0.5" style={monoLabel}>Aperçu des échanges</p>
              <div className="divide-y divide-border-subtle">
                {sample.map(({ tv, origin }) => (
                  <div key={tv.id} className="px-3.5 py-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 min-w-0 h-6">
                      <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a', opacity: 0.8 }} />
                      <span className={`flex-1 min-w-0 text-[13px] truncate ${tv.illegible ? 'italic text-foreground-secondary' : 'font-medium text-foreground'}`}>{tv.subject}</span>
                      {origin.id !== f.folderId && (
                        <span className="flex-shrink-0 truncate text-right" style={{ ...monoLabel, maxWidth: 150 }} title={folderBreadcrumb(origin.id)}>{origin.name}</span>
                      )}
                    </div>
                    <div className="pl-1.5 flex flex-col">
                      <BodyLine msg={tv.msg} dim />
                      {tv.attachments.map((a, i) => (
                        <PJLine
                          key={`${tv.id}-${i}`}
                          pj={{ key: `${tv.id}::${a.name}`, name: a.name, decoupable: a.decoupable }}
                          decoupe={decoupe} onToggleDecoupe={onToggleDecoupe} dim
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3.5 py-2 border-t border-border-subtle">
                <span className="text-[11px] text-foreground-secondary">{f.stats.threads} échanges, sous-dossiers compris - tout entre avec le dossier</span>
              </div>
            </>
          )}
        </div>
      )}
      {span.multi && <OverImportWarning nAffaires={span.nAffaires} pieces={span.pieces} />}
      {/* DÉCISION : l'import est un instantané (curable), le suivi est un flux
          (toujours ENTIER). Décocher ne troue jamais un suivi - la sélection ne
          vaut que pour cet import. */}
      {phase2 && (
        <SuivreFoot
          on={suivre.has(item.id)}
          onToggle={() => onToggleSuivre(item.id)}
          label="Suivre ce dossier"
          hint={curated
            ? 'le suivi porte sur tout le dossier - la sélection ci-dessus ne vaut que pour cet import'
            : 'échanges et pièces, y compris les futurs sous-dossiers'}
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
  items, onRemove, onTogglePiece, onRedirectFolder, onToggleFolderThread, onToggleFolderPiece,
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
                          onRedirect={onRedirectFolder}
                          onToggleFolderThread={onToggleFolderThread}
                          onToggleFolderPiece={onToggleFolderPiece}
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
