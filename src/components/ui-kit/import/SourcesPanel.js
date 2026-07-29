// Panneau « Sources email » (spec §5.2) - master–detail–ajout, au bord droit
// de la page Pièces. La vue des TUYAUX, pas du contenu : statut de connexion,
// sources suivies (toggle inline - l'état est le contrôle), sync manuelle par
// source, historique daté où les échecs sont des LIGNES ROUGES (jamais des
// silences), retrait avec choix conserver/retirer.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, AlertTriangle, ArrowLeft, AtSign, ChevronDown, ChevronRight, Copy,
  FileText, Folder, Mail, Plus, RefreshCw, RotateCcw, Scissors, Search, Trash2, X,
} from 'lucide-react';
import Button from '../../ui/Button';
import {
  Checkbox, ConfirmDialog, ConnectScreen, CountBadge, DejaSuiviBadge, LabSwitch,
  SectionLabel, TypeChip, WarnBadge, monoLabel,
} from './atoms';
import {
  normalize, LAB_FOLDERS, LAB_THREADS, LAB_SENDERS, folderPath, statsFor,
  displaySubject, senderLine, PIECES_NODES, nodeLabel,
} from './labData';

const PANEL_W = 440;
const KIND_ICON = { folder: Folder, thread: Mail, sender: AtSign };
const KIND_LABEL = { folder: 'Dossier Outlook', thread: 'Échange suivi', sender: 'Expéditeur suivi' };

const unresolvedFails = (s) => s.history.filter(h => h.kind === 'failure' && !h.resolved).length;

// Sélecteur de destination (obligatoire : une sync nocturne doit savoir où déposer).
function DestinationSelect({ value, onChange, up = false }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-foreground bg-white border border-border hover:bg-background-canvas transition-colors"
      >
        <Folder className="w-3 h-3 text-foreground-muted" strokeWidth={1.75} />
        {nodeLabel(value)}
        <ChevronDown className="w-3 h-3 text-foreground-muted" strokeWidth={2} />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className={`absolute z-50 ${up ? 'bottom-8' : 'top-8'} left-0 bg-white border border-border rounded-lg shadow-xl overflow-hidden py-1 flex flex-col`} style={{ minWidth: 180 }}>
            {PIECES_NODES.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => { onChange(n.id); setOpen(false); }}
                className={`text-left px-3 h-8 text-[13px] transition-colors ${n.id === value ? 'bg-cream text-foreground font-medium' : 'text-foreground-secondary hover:bg-background-canvas'}`}
              >
                {n.label}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

function PanelShell({ onBack, title, subtitle, icon, onClose, children, footer }) {
  return (
    <div className="absolute top-0 bottom-0 right-0 z-[45] bg-white border-l border-border flex flex-col" style={{ width: PANEL_W, boxShadow: '-20px 0 28px -16px rgba(28,25,23,0.16)' }}>
      {onBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0 self-start">
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} /> Sources email
        </button>
      )}
      {/* Niveau 2 (retour présent) : le retour est la seule sortie visible -
          pas de X concurrent ; Échap et le backdrop restent disponibles. */}
      <div className={`flex items-center justify-between px-4 ${onBack ? 'pt-1 pb-3' : 'py-3.5'} border-b border-border flex-shrink-0`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            {subtitle && <p className="text-[11px] text-foreground-muted truncate">{subtitle}</p>}
          </div>
        </div>
        {!onBack && (
          <button type="button" onClick={onClose} className="p-1 text-foreground-muted hover:text-foreground-secondary hover:bg-cream rounded-md transition-colors flex-shrink-0" title="Fermer"><X className="w-4 h-4" /></button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-5">{children}</div>
      {footer}
    </div>
  );
}

// ── Liste ───────────────────────────────────────────────────────────────────

function SourceRow({ source, syncing, onToggle, onSync, onOpen }) {
  const Icon = KIND_ICON[source.kind];
  const fails = unresolvedFails(source);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-background-canvas/70 transition-colors text-left cursor-pointer"
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: source.kind === 'sender' ? '#78716c' : '#1e3a8a' }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground truncate">{source.pathLabel}</p>
        <p className="text-[11px] truncate" style={{ color: source.error ? '#b4483c' : '#a8a29e' }}>
          {source.error ? source.error.message : [...source.subtitleBits, source.followed ? null : 'flux coupé - lien conservé'].filter(Boolean).join(' · ')}
        </p>
      </div>
      <CountBadge n={source.newCount} />
      <WarnBadge n={fails} title="Échecs non résolus - voir l'historique" />
      <span className="inline-flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className={`text-[11px] font-medium ${source.followed ? 'text-foreground-secondary' : 'text-foreground-muted'}`}>{source.followed ? 'Suivi' : 'Non suivi'}</span>
        <LabSwitch checked={source.followed} onChange={() => onToggle(source.id)} disabled={!!source.error} />
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSync(source.id); }}
        disabled={!source.followed || !!source.error || syncing}
        className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium bg-white border border-border text-foreground hover:bg-background-canvas transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Synchroniser cette source maintenant"
      >
        <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        Synchroniser
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
    </div>
  );
}

// ── Historique ──────────────────────────────────────────────────────────────

function HistoryRow({ entry, onResolve }) {
  if (entry.kind === 'initial') {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border/60 last:border-b-0">
        <span className="text-[11px] text-foreground-muted tabular-nums flex-shrink-0" style={{ width: 46 }}>{entry.date}</span>
        <span className="text-[12px] text-foreground-secondary">{entry.count} pièces versées à l'import initial</span>
      </div>
    );
  }
  if (entry.kind === 'failure' && !entry.resolved) {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2 border-b border-border/60 last:border-b-0" style={{ backgroundColor: '#fdf3f2' }}>
        <span className="text-[11px] tabular-nums flex-shrink-0 pt-0.5" style={{ width: 46, color: '#b4483c' }}>{entry.date}</span>
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#b4483c' }} strokeWidth={1.75} />
        <span className="flex-1 min-w-0">
          <span className="text-[12px] font-medium block truncate" style={{ color: '#b4483c' }}>{entry.name}</span>
          <span className="text-[11px] block" style={{ color: '#9c4a40' }}>{entry.reason}</span>
        </span>
        <button
          type="button"
          onClick={() => onResolve(entry.id)}
          className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium bg-white border text-foreground hover:bg-background-canvas transition-colors flex-shrink-0"
          style={{ borderColor: '#ecc9c4' }}
        >
          <RotateCcw className="w-3 h-3" strokeWidth={2} />
          {entry.action === 'retry' ? 'Réessayer' : 'Récupérée manuellement'}
        </button>
      </div>
    );
  }
  const icon = entry.kind === 'doublon' ? <Copy className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
    : entry.kind === 'decoupe' ? <Scissors className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
    : <FileText className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />;
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border/60 last:border-b-0">
      <span className="text-[11px] text-foreground-muted tabular-nums flex-shrink-0" style={{ width: 46 }}>{entry.date}</span>
      {icon}
      <span className="flex-1 min-w-0">
        <span className="text-[12px] text-foreground truncate block">{entry.name}</span>
        {entry.note && <span className="text-[10px] text-foreground-muted truncate block">{entry.note}</span>}
        {entry.kind === 'failure' && entry.resolved && <span className="text-[10px] truncate block" style={{ color: '#4a9168' }}>échec résolu</span>}
      </span>
      {entry.tag && <TypeChip>{entry.tag}</TypeChip>}
    </div>
  );
}

// ── Ajout de source ─────────────────────────────────────────────────────────

function AddSourcePanel({ sources, api, onBack, onClose, onToast, connected, onConnect }) {
  const [q, setQ] = useState('');
  const [selFolders, setSelFolders] = useState(() => new Set());
  const [selThreads, setSelThreads] = useState(() => new Set());
  const [selSenders, setSelSenders] = useState(() => new Set());
  const [destination, setDestination] = useState('correspondance');
  const nq = normalize(q.trim());

  const followedFolderIds = useMemo(() => new Set(sources.filter(s => s.kind === 'folder' && s.followed).map(s => s.refId)), [sources]);
  const followedThreadIds = useMemo(() => new Set(sources.filter(s => s.kind === 'thread' && s.followed).map(s => s.refId)), [sources]);
  const followedSenders = useMemo(() => new Set(sources.filter(s => s.kind === 'sender').map(s => s.refId)), [sources]);

  const folderRows = LAB_FOLDERS
    .filter(f => !(f.attributes || []).includes('\\Sent') && !(f.attributes || []).includes('\\Inbox'))
    .filter(f => !nq || normalize(f.name).includes(nq) || normalize(folderPath(f)).includes(nq))
    .slice(0, nq ? 6 : 3);
  const threadRows = LAB_THREADS
    .filter(t => !nq || [t.subject, t.summary, ...(t.senders || []).flatMap(s => [s.name, s.email, s.role])].some(x => x && normalize(x).includes(nq)))
    .slice(0, nq ? 6 : 4);
  const senderRows = LAB_SENDERS.filter(a => !nq || [a.email, a.name, a.role].some(x => x && normalize(x).includes(nq)));

  const toggle = (setter) => (id) => setter(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const nSel = selFolders.size + selThreads.size + selSenders.size;

  const groupLabel = (label, n) => (
    <p className="px-1 pt-3 pb-1.5 flex items-center justify-between" style={monoLabel}>
      <span>{label}</span><span>{n}</span>
    </p>
  );

  const commit = () => {
    if (!nSel) return;
    const { n } = api.addSources({
      folderIds: [...selFolders], threadIds: [...selThreads], senderEmails: [...selSenders],
      destinationId: destination,
    });
    onToast(`${n} source${n > 1 ? 's' : ''} rattachée${n > 1 ? 's' : ''} - vers ${nodeLabel(destination)}`);
    onBack();
  };

  const body = (
    <>
      {/* Recherche = geste principal. */}
      <div className="-mt-1">
        <div className="flex items-center gap-2 px-2.5 h-9 bg-white rounded-lg transition-colors shadow-sm" style={{ border: '1.5px solid #44403c' }}>
          <Search className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Dossier, thread, expéditeur…" className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder-foreground-muted focus:outline-none" />
          {q && <button type="button" onClick={() => setQ('')} className="p-0.5 text-foreground-muted hover:text-foreground-secondary rounded"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      <div className="-mt-2">
        {folderRows.length > 0 && (
          <>
            {groupLabel('Dossiers Outlook', folderRows.length)}
            {folderRows.map(f => {
              const already = followedFolderIds.has(f.id);
              const on = selFolders.has(f.id);
              const st = statsFor(f.id);
              return (
                <div key={f.id} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${on ? 'bg-cream' : already ? '' : 'hover:bg-cream/60'}`} style={already ? { opacity: 0.55 } : undefined}>
                  <Checkbox checked={on} disabled={already} onToggle={() => toggle(setSelFolders)(f.id)} />
                  <Folder className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] text-foreground truncate block">{folderPath(f)}</span>
                    <span className="text-[11px] text-foreground-muted truncate block">
                      {already ? 'Déjà suivi - les nouveaux messages arrivent automatiquement' : `${st.threads} échange${st.threads > 1 ? 's' : ''} · y compris les futurs sous-dossiers`}
                    </span>
                  </span>
                  {already && <DejaSuiviBadge />}
                </div>
              );
            })}
          </>
        )}
        {threadRows.length > 0 && (
          <>
            {groupLabel('Threads', threadRows.length)}
            {threadRows.map(t => {
              const already = followedThreadIds.has(t.id);
              const on = selThreads.has(t.id);
              const ds = displaySubject(t);
              return (
                <div key={t.id} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${on ? 'bg-cream' : already ? '' : 'hover:bg-cream/60'}`} style={already ? { opacity: 0.55 } : undefined}>
                  <Checkbox checked={on} disabled={already} onToggle={() => toggle(setSelThreads)(t.id)} />
                  <Mail className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
                  <span className="flex-1 min-w-0">
                    <span className={`text-[13px] truncate block ${ds.illegible ? 'italic text-foreground-secondary' : 'text-foreground'}`}>{ds.text}</span>
                    <span className="text-[11px] text-foreground-muted truncate block">{already ? 'Déjà suivi' : senderLine(t)}</span>
                  </span>
                  {already && <DejaSuiviBadge />}
                </div>
              );
            })}
          </>
        )}
        {senderRows.length > 0 && (
          <>
            {groupLabel('Expéditeurs', senderRows.length)}
            {senderRows.map(a => {
              const already = followedSenders.has(a.email);
              const on = selSenders.has(a.email);
              return (
                <div key={a.email}>
                  <div className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${on ? 'bg-cream' : already ? '' : 'hover:bg-cream/60'}`} style={already ? { opacity: 0.55 } : undefined}>
                    <Checkbox checked={on} disabled={already} onToggle={() => toggle(setSelSenders)(a.email)} />
                    <AtSign className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                    <span className="flex-1 min-w-0">
                      <span className="text-[13px] text-foreground truncate block">{a.role ? `${a.role} · ${a.name || a.email}` : (a.name || a.email)}</span>
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] text-foreground-muted truncate">{a.email} · {a.exchanges} échange{a.exchanges > 1 ? 's' : ''}</span>
                        {a.isShared && !already && (
                          <span className="inline-flex items-center gap-0.5 h-4 px-1 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#f9ecd6', color: '#855b31' }}>
                            <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2} /> Adresse partagée
                          </span>
                        )}
                      </span>
                    </span>
                    {already && <DejaSuiviBadge />}
                  </div>
                  {/* Garde-fou : jamais de suivi brut d'une adresse partagée. */}
                  {on && a.isShared && (
                    <p className="mx-2 mb-1.5 px-2.5 py-1.5 rounded-md text-[11px] leading-4" style={{ backgroundColor: '#fdf6ea', color: '#855b31' }}>
                      Adresse utilisée dans {a.sharedWith} - elle sera suivie en mode filtré : adresse + référence du dossier.
                    </p>
                  )}
                </div>
              );
            })}
          </>
        )}
        {folderRows.length === 0 && threadRows.length === 0 && senderRows.length === 0 && (
          <p className="px-1 py-8 text-center text-xs text-foreground-muted">Aucun dossier, thread ni expéditeur ne correspond à « {q.trim()} »</p>
        )}
      </div>
    </>
  );

  return (
    <PanelShell
      onBack={onBack}
      onClose={onClose}
      title="Ajouter une source"
      subtitle="Un dossier, un thread ou un expéditeur - email uniquement, un fichier ne se suit pas"
      icon={
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ backgroundColor: '#dfe8f5' }}>
          <Plus className="w-4 h-4" style={{ color: '#1e3a8a' }} strokeWidth={2} />
        </span>
      }
      footer={
        connected ? (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-foreground-secondary min-w-0">
              Vers
              <DestinationSelect value={destination} onChange={setDestination} up />
            </span>
            <Button variant="primary" size="sm" label={`Rattacher${nSel ? ` (${nSel})` : ''}`} onClick={commit} disabled={!nSel} />
          </div>
        ) : null
      }
    >
      {!connected ? <ConnectScreen onConnect={onConnect} compact /> : body}
    </PanelShell>
  );
}

// ── Panneau ─────────────────────────────────────────────────────────────────

export default function SourcesPanel({ panel, setPanel, sources, suggestions, api, onToast, afterSync, connected, onConnect }) {
  const [syncing, setSyncing] = useState(() => new Set()); // sourceIds, ou 'all'
  const [lastCheck, setLastCheck] = useState('il y a 5 min');
  const [removing, setRemoving] = useState(null); // sourceId → dialog
  const timers = useRef([]);
  useEffect(() => { const t = timers.current; return () => t.forEach(clearTimeout); }, []);

  const close = () => setPanel(null);
  const detailSource = panel.view === 'detail' ? sources.find(s => s.id === panel.id) : null;

  const runSync = (id) => {
    setSyncing(prev => new Set(prev).add(id));
    const t = setTimeout(() => {
      setSyncing(prev => { const n = new Set(prev); n.delete(id); return n; });
      setLastCheck('à l\'instant');
      const res = api.applySync(id);
      if (res && res.added > 0) {
        onToast(`${res.added} pièce${res.added > 1 ? 's' : ''} arrivée${res.added > 1 ? 's' : ''} via ${res.label} - marquée${res.added > 1 ? 's' : ''} « Nouveau »`);
        afterSync(res.added);
      } else {
        onToast('Aucune nouveauté - la source est à jour');
      }
    }, 1200);
    timers.current.push(t);
  };

  const runVerifyAll = () => {
    setSyncing(prev => new Set(prev).add('all'));
    const t = setTimeout(() => {
      setSyncing(prev => { const n = new Set(prev); n.delete('all'); return n; });
      setLastCheck('à l\'instant');
      const { added } = api.applySyncAll();
      if (added > 0) {
        onToast(`Vérification terminée - ${added} pièce${added > 1 ? 's' : ''} nouvelle${added > 1 ? 's' : ''}`);
        afterSync(added);
      } else {
        onToast('Vérification terminée - tout est à jour');
      }
    }, 1400);
    timers.current.push(t);
  };

  const checking = syncing.has('all');

  const removeDialog = removing && (() => {
    const src = sources.find(s => s.id === removing);
    if (!src) return null;
    const n = api.piecesCountFor(removing);
    return (
      <ConfirmDialog title="Retirer la source ?" onClose={() => setRemoving(null)}>
        <div className="px-5 pb-4 pt-1 flex flex-col gap-3">
          <p className="text-[13px] text-foreground-secondary leading-5">
            « {src.pathLabel} » n'alimentera plus le dossier. Que faire des {n} pièce{n > 1 ? 's' : ''} déjà importée{n > 1 ? 's' : ''} ?
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { api.removeSource(removing, true); setRemoving(null); setPanel({ view: 'list' }); onToast('Source retirée - les pièces importées restent au dossier'); }}
              className="w-full text-left rounded-lg border border-border p-3 hover:bg-background-canvas transition-colors"
            >
              <span className="text-sm font-medium text-foreground block">Conserver les pièces <span className="text-[11px] font-normal text-foreground-muted">(recommandé)</span></span>
              <span className="text-[11px] text-foreground-muted">Le cas d'une fin d'affaire : le flux s'arrête, le dossier reste complet.</span>
            </button>
            <button
              type="button"
              onClick={() => { api.removeSource(removing, false); setRemoving(null); setPanel({ view: 'list' }); onToast(`Source retirée - ${n} pièce${n > 1 ? 's' : ''} retirée${n > 1 ? 's' : ''} du dossier`); }}
              className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-red-50"
              style={{ borderColor: '#ecc9c4' }}
            >
              <span className="text-sm font-medium block" style={{ color: '#b4483c' }}>Retirer aussi les pièces</span>
              <span className="text-[11px] text-foreground-muted">Les {n} pièce{n > 1 ? 's' : ''} issue{n > 1 ? 's' : ''} de cette source quittent le dossier.</span>
            </button>
          </div>
          <button type="button" onClick={() => setRemoving(null)} className="self-end text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors">Annuler</button>
        </div>
      </ConfirmDialog>
    );
  })();

  return (
    <>
      <div className="absolute inset-0 z-40" style={{ backgroundColor: 'rgba(28,25,23,0.24)' }} onClick={close} />

      {panel.view === 'list' && (
        <PanelShell
          onClose={close}
          title="Sources email"
          subtitle="cabinet@durand-avocats.fr"
          icon={
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ backgroundColor: '#dfe8f5' }}>
              <Mail className="w-4 h-4" style={{ color: '#1e3a8a' }} strokeWidth={1.75} />
            </span>
          }
        >
          {!connected ? (
            <ConnectScreen onConnect={onConnect} compact />
          ) : (
            <>
              {/* Connexion (niveau compte) */}
              <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-start gap-2.5">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${checking ? 'animate-pulse' : ''}`} style={{ backgroundColor: '#4a9168' }} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{checking ? 'Vérification en cours…' : 'Connexion active'}</p>
                    <p className="text-[11px] text-foreground-muted">Dernière vérification {lastCheck} · batch chaque nuit</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={runVerifyAll}
                  disabled={checking}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-white border border-border text-foreground hover:bg-background-canvas transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} strokeWidth={1.75} /> Vérifier maintenant
                </button>
              </div>

              {/* Sources suivies */}
              <div>
                <SectionLabel
                  right={
                    <button type="button" onClick={() => setPanel({ view: 'add' })} className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-xs font-medium bg-white border border-border text-foreground hover:bg-background-canvas transition-colors shadow-sm">
                      <Plus className="w-3 h-3" strokeWidth={2.5} /> Ajouter une source
                    </button>
                  }
                >
                  Sources suivies · {sources.length}
                </SectionLabel>
                {sources.length === 0 ? (
                  <div className="border border-border rounded-lg p-4 text-center">
                    <p className="text-[13px] text-foreground-secondary leading-5">
                      Rattachez un dossier, un thread ou un expéditeur - le dossier s'alimentera tout seul.
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden bg-white">
                    {sources.map(s => (
                      <SourceRow
                        key={s.id}
                        source={s}
                        syncing={syncing.has(s.id)}
                        onToggle={api.toggleSource}
                        onSync={runSync}
                        onOpen={() => setPanel({ view: 'detail', id: s.id })}
                      />
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-foreground-muted px-0.5">
                  La sync ajoute des pièces marquées « Nouveau » dans la destination de chaque source - elle ne supprime jamais rien. Retirer une source coupe le flux, pas les pièces.
                </p>
              </div>

              {/* Suggestions - jamais comptées dans les suivies. */}
              {suggestions.length > 0 && (
                <div>
                  <SectionLabel>Suggestions · {suggestions.length}</SectionLabel>
                  <div className="border border-border rounded-lg overflow-hidden bg-white">
                    {suggestions.map(sug => (
                      <div key={sug.id} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/60 last:border-b-0">
                        <AtSign className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                        <span className="flex-1 min-w-0">
                          <span className="text-[13px] text-foreground truncate block">{sug.label}</span>
                          <span className="text-[11px] text-foreground-muted truncate block">{sug.detail}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => { api.acceptSuggestion(sug.id); onToast(`${sug.email} est désormais suivie`); }}
                          className="inline-flex items-center h-7 px-2.5 rounded-md text-xs font-medium bg-white border border-border-strong text-foreground hover:bg-background-canvas transition-colors flex-shrink-0"
                        >
                          Suivre
                        </button>
                        <button type="button" onClick={() => api.rejectSuggestion(sug.id)} className="p-1 rounded text-foreground-muted hover:text-foreground-secondary transition-colors flex-shrink-0" title="Écarter la suggestion">
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </PanelShell>
      )}

      {panel.view === 'detail' && detailSource && (
        <PanelShell
          onBack={() => setPanel({ view: 'list' })}
          onClose={close}
          title={detailSource.pathLabel}
          subtitle={`${KIND_LABEL[detailSource.kind]} · depuis le ${detailSource.since}`}
          icon={
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-cream flex-shrink-0">
              {React.createElement(KIND_ICON[detailSource.kind], { className: 'w-3.5 h-3.5 text-foreground-tertiary', strokeWidth: 1.75 })}
            </span>
          }
          footer={
            <div className="px-4 py-3 border-t border-border flex-shrink-0">
              <button type="button" onClick={() => setRemoving(detailSource.id)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-colors hover:bg-red-50" style={{ color: '#b4483c' }}>
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> Retirer la source
              </button>
            </div>
          }
        >
          {detailSource.error && (
            <div className="rounded-lg p-3 flex items-start gap-2.5" style={{ backgroundColor: '#fdf3f2', border: '1px solid #ecc9c4' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#b4483c' }} strokeWidth={1.75} />
              <p className="text-xs leading-5" style={{ color: '#9c4a40' }}>
                {detailSource.error.message}. Les pièces déjà importées sont conservées ; le lien suit l'identifiant du dossier, pas son chemin - si le dossier réapparaît, la synchro reprend.
              </p>
            </div>
          )}

          {/* Propriétés */}
          <div className="flex flex-col gap-2.5">
            <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Suivi</p>
                <p className="text-[11px] text-foreground-muted leading-4">
                  {detailSource.followed
                    ? 'Les nouveaux messages arrivent dans les pièces, marqués « Nouveau »'
                    : 'Le flux est coupé - le lien est conservé, réactivable à tout moment'}
                </p>
              </div>
              <LabSwitch checked={detailSource.followed} onChange={() => api.toggleSource(detailSource.id)} disabled={!!detailSource.error} />
            </div>
            <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Découpe automatique</p>
                <p className="text-[11px] text-foreground-muted leading-4">
                  {detailSource.decoupeAuto
                    ? 'Les documents multi-pièces arrivent découpés - chaque application est journalisée'
                    : 'Les documents arrivent entiers - la découpe reste possible après coup'}
                </p>
              </div>
              <LabSwitch checked={detailSource.decoupeAuto} onChange={() => api.setDecoupeAuto(detailSource.id, !detailSource.decoupeAuto)} />
            </div>
            <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Destination</p>
                <p className="text-[11px] text-foreground-muted leading-4">Le dossier de l'arborescence où déposent les arrivées</p>
              </div>
              <DestinationSelect value={detailSource.destinationId} onChange={(nodeId) => api.setDestination(detailSource.id, nodeId)} />
            </div>
          </div>

          {/* Historique - tout ce qui concerne la source, échecs en rouge. */}
          <div>
            <SectionLabel>Historique</SectionLabel>
            {detailSource.history.length === 0 ? (
              <p className="text-xs text-foreground-muted px-0.5">Aucune activité pour l'instant - les prochaines arrivées apparaîtront ici.</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                {detailSource.history.map(h => (
                  <HistoryRow
                    key={h.id}
                    entry={h}
                    onResolve={(histId) => {
                      const ok = api.retryFailure(detailSource.id, histId);
                      if (ok) { onToast('Pièce récupérée - marquée « Nouveau » dans les pièces'); afterSync(1); }
                    }}
                  />
                ))}
              </div>
            )}
            <p className="mt-1.5 text-[11px] text-foreground-muted px-0.5">Les échecs restent listés tant qu'ils ne sont pas résolus - une pièce manquante signalée vaut mieux qu'un silence.</p>
          </div>
        </PanelShell>
      )}

      {panel.view === 'add' && (
        <AddSourcePanel
          sources={sources}
          api={api}
          onBack={() => setPanel({ view: 'list' })}
          onClose={close}
          onToast={onToast}
          connected={connected}
          onConnect={onConnect}
        />
      )}

      {removeDialog}
    </>
  );
}
