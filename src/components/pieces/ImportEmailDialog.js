import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, Search, Paperclip, X, Check, Minus, Inbox, Folder, History } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// « Importer depuis Outlook » - pick email threads (échanges) to import into
// the dossier. Each imported échange yields one pièce for the thread body
// (type Correspondance) plus - optionally - one pièce per attachment.
//
// Three avocat profiles drive the layout:
// - Folder-filer: the left rail lists the mailbox folders (Nylas Folders API
//   shape, Outlook hierarchy via parentId). Pick the dossier's folder →
//   « Tout sélectionner » → the whole folder imports in two clicks.
// - Search-first: « Récents » shows the latest échanges of the whole mailbox;
//   the search matches expéditeur, destinataire and objet within the scope.
// - Docs-already-dropped: « Inclure les pièces jointes » (footer) unchecked
//   imports only the email bodies - the correspondence - without re-extracting
//   attachments the avocat already dropped from the Finder (no doublons).
//
// Selection persists across folders, so a bulk import can mix scopes.

const normalize = (s) => (s == null ? '' : String(s)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const RECENT_SCOPE = '__recent__';
// System folders the picker hides (an avocat imports received pièces).
const HIDDEN_ATTRIBUTES = ['\\Sent', '\\Drafts', '\\Trash', '\\Junk'];

// `initialScope` (folderId) / `initialQuery` pre-focus the picker when another
// surface already knows what to look for (agent suggestion, complétude check).
// `onReview` (optional) turns on a « Vérifier les pièces jointes » secondary
// action: instead of a direct bulk import, the selected threads are handed off
// to a per-PJ validation step. When it's not passed, the dialog behaves exactly
// as before (existing call sites are unaffected).
export default function ImportEmailDialog({ open, onClose, threads, folders = [], onImport, onReview = null, initialScope = null, initialQuery = '' }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(RECENT_SCOPE); // RECENT_SCOPE | folderId
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery || '');
      setScope(initialScope || RECENT_SCOPE);
      setSelectedIds(new Set());
      setIncludeAttachments(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialScope, initialQuery]);

  const sorted = useMemo(
    () => [...(threads || [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [threads]
  );

  const folderById = useMemo(() => {
    const m = new Map();
    (folders || []).forEach(f => m.set(f.id, f));
    return m;
  }, [folders]);

  // Rail rows: visible folders in hierarchy order (parents before children),
  // with per-folder thread counts.
  const railFolders = useMemo(() => {
    const visible = (folders || []).filter(f => !(f.attributes || []).some(a => HIDDEN_ATTRIBUTES.includes(a)));
    const counts = new Map();
    sorted.forEach(t => counts.set(t.folderId, (counts.get(t.folderId) || 0) + 1));
    const roots = visible.filter(f => !f.parentId || !visible.some(v => v.id === f.parentId));
    const rows = [];
    const push = (f, depth) => {
      rows.push({ folder: f, depth, count: counts.get(f.id) || 0 });
      visible.filter(c => c.parentId === f.id).forEach(c => push(c, depth + 1));
    };
    roots.forEach(f => push(f, 0));
    return rows;
  }, [folders, sorted]);

  const scoped = useMemo(
    () => (scope === RECENT_SCOPE ? sorted : sorted.filter(t => t.folderId === scope)),
    [sorted, scope]
  );

  const q = normalize(query.trim());
  const visible = useMemo(() => {
    if (!q) return scoped;
    return scoped.filter(t =>
      [t.subject, t.from, t.to, t.snippet].some(f => normalize(f).includes(q))
    );
  }, [scoped, q]);

  if (!open) return null;

  const scopeFolder = scope === RECENT_SCOPE ? null : folderById.get(scope);

  const toggle = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const visibleSelectedCount = visible.filter(t => selectedIds.has(t.id)).length;
  const allVisibleSelected = visible.length > 0 && visibleSelectedCount === visible.length;
  const selectAllState = allVisibleSelected ? 'checked' : visibleSelectedCount > 0 ? 'indeterminate' : 'unchecked';
  const toggleAllVisible = () => setSelectedIds(prev => {
    const next = new Set(prev);
    if (allVisibleSelected) visible.forEach(t => next.delete(t.id));
    else visible.forEach(t => next.add(t.id));
    return next;
  });

  const selectedCount = selectedIds.size;
  const selectedAttachmentCount = sorted
    .filter(t => selectedIds.has(t.id))
    .reduce((n, t) => n + (t.attachments?.length || 0), 0);

  const confirm = () => {
    if (selectedCount === 0) return;
    const picked = sorted.filter(t => selectedIds.has(t.id));
    onImport?.(picked, { includeAttachments: includeAttachments && selectedAttachmentCount > 0 });
    onClose?.();
  };

  const railItem = (active) => `w-full text-left flex items-center gap-2 h-8 px-2.5 rounded-md text-sm transition-colors ${
    active ? 'bg-cream text-foreground font-medium' : 'text-foreground-secondary hover:bg-cream hover:text-foreground'
  }`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[780px] mx-4 flex flex-col overflow-hidden"
        style={{ height: 'min(640px, 85vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md" style={{ backgroundColor: '#dfe8f5' }}>
              <Mail className="w-4 h-4" style={{ color: '#1e3a8a' }} strokeWidth={1.75} />
            </span>
            <h2 className="text-heading-sm font-semibold text-foreground">Importer depuis Outlook</h2>
          </div>
          <button onClick={onClose} className="p-1 text-foreground-muted hover:text-foreground-secondary hover:bg-cream rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: folder rail + thread list */}
        <div className="flex-1 min-h-0 flex" style={{ borderTop: `1px solid ${colors.semantic.border}` }}>
          {/* Folder rail */}
          <div className="w-[212px] flex-shrink-0 overflow-y-auto px-2 py-3 flex flex-col gap-0.5" style={{ backgroundColor: colors.semantic.backgroundCanvas, borderRight: `1px solid ${colors.semantic.border}` }}>
            <button type="button" onClick={() => setScope(RECENT_SCOPE)} className={railItem(scope === RECENT_SCOPE)}>
              <History className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <span className="flex-1 truncate">Récents</span>
            </button>
            <span className="mt-2 mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wide text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Dossiers Outlook
            </span>
            {railFolders.map(({ folder, depth, count }) => {
              const isInbox = (folder.attributes || []).includes('\\Inbox');
              const Icon = isInbox ? Inbox : Folder;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setScope(folder.id)}
                  className={railItem(scope === folder.id)}
                  style={{ paddingLeft: 10 + depth * 14 }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span className="flex-1 truncate">{folder.name}</span>
                  {count > 0 && <span className="text-xs text-foreground-muted flex-shrink-0">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Thread panel */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Search */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 h-9 bg-white border border-border rounded-lg focus-within:border-foreground-secondary transition-colors shadow-sm">
                <Search className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirm(); }}
                  placeholder={scopeFolder ? `Rechercher dans « ${scopeFolder.name} »…` : 'Rechercher par expéditeur, destinataire ou objet…'}
                  className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-foreground-muted focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-0.5 text-foreground-muted hover:text-foreground-secondary rounded transition-colors">
                    <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
              {/* Scope + select-all row */}
              <div className="flex items-center justify-between mt-2 min-h-[20px]">
                <span className="text-xs text-foreground-secondary truncate">
                  {q
                    ? `${visible.length} échange${visible.length > 1 ? 's' : ''} trouvé${visible.length > 1 ? 's' : ''}`
                    : scopeFolder
                      ? `${visible.length} échange${visible.length > 1 ? 's' : ''} dans « ${scopeFolder.name} »`
                      : 'Derniers échanges reçus'}
                </span>
                {visible.length > 1 && (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selectAllState === 'indeterminate' ? 'mixed' : selectAllState === 'checked'}
                    onClick={toggleAllVisible}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <span className={`inline-flex items-center justify-center w-[15px] h-[15px] rounded-[4px] border transition-colors ${
                      selectAllState !== 'unchecked' ? 'bg-foreground border-foreground text-white' : 'bg-white border-border-strong'
                    }`}>
                      {selectAllState === 'checked' && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                      {selectAllState === 'indeterminate' && <Minus className="w-2.5 h-2.5" strokeWidth={3} />}
                    </span>
                    {scopeFolder && !q ? 'Tout le dossier' : 'Tout sélectionner'}
                  </button>
                )}
              </div>
            </div>

            {/* Thread list */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-1">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <Mail className="w-6 h-6 text-foreground-muted" strokeWidth={1.5} />
                  <p className="text-sm text-foreground-secondary">
                    {q
                      ? <>Aucun échange ne correspond à « {query.trim()} »</>
                      : 'Aucun échange dans ce dossier'}
                  </p>
                </div>
              ) : visible.map(t => {
                const selected = selectedIds.has(t.id);
                const tFolder = folderById.get(t.folderId);
                const showFolderHint = scope === RECENT_SCOPE && tFolder && !(tFolder.attributes || []).includes('\\Inbox');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg transition-colors ${selected ? 'bg-background-canvas' : 'hover:bg-background-canvas'}`}
                  >
                    <span className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-[4px] border flex-shrink-0 transition-colors ${
                      selected ? 'bg-foreground border-foreground' : 'bg-white border-border-strong'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-foreground truncate">{t.subject}</span>
                        <span className="text-xs text-foreground-muted flex-shrink-0">{t.dateLabel}</span>
                      </span>
                      <span className="text-xs text-foreground-secondary truncate">
                        De : {t.from} · {t.messages} message{t.messages > 1 ? 's' : ''}
                        {showFolderHint && <> · {tFolder.name}</>}
                      </span>
                      <span className="text-xs text-foreground-muted truncate">{t.snippet}</span>
                      {t.attachments?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-foreground-secondary mt-0.5">
                          <Paperclip className="w-3 h-3 flex-shrink-0" strokeWidth={1.75} />
                          {t.attachments.length} pièce{t.attachments.length > 1 ? 's' : ''} jointe{t.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${colors.semantic.border}`, fontFamily: typography.fontFamily.sans }}
        >
          {/* Attachments choice - unchecked imports only the bodies (the
              correspondence), for avocats who already dropped the documents. */}
          <div className="min-w-0">
            {selectedAttachmentCount > 0 && (
              <button
                type="button"
                role="checkbox"
                aria-checked={includeAttachments}
                onClick={() => setIncludeAttachments(v => !v)}
                className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
              >
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-colors flex-shrink-0 ${
                  includeAttachments ? 'bg-foreground border-foreground' : 'bg-white border-border-strong'
                }`}>
                  {includeAttachments && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="truncate">
                  Inclure les {selectedAttachmentCount} pièce{selectedAttachmentCount > 1 ? 's' : ''} jointe{selectedAttachmentCount > 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="h-9 px-4 text-sm font-medium text-foreground-tertiary bg-white border border-border rounded-lg hover:bg-background-canvas transition-colors shadow-sm"
            >
              Annuler
            </button>
            {onReview && (
              <button
                onClick={() => { if (selectedCount === 0) return; onReview(sorted.filter(t => selectedIds.has(t.id)), { includeAttachments: includeAttachments && selectedAttachmentCount > 0 }); }}
                disabled={selectedCount === 0}
                className={`h-9 px-4 text-sm font-medium bg-white border border-border rounded-lg transition-colors shadow-sm ${
                  selectedCount > 0 ? 'text-foreground hover:bg-background-canvas' : 'text-foreground-muted opacity-50 cursor-not-allowed'
                }`}
              >
                Vérifier les pièces jointes
              </button>
            )}
            <button
              onClick={confirm}
              disabled={selectedCount === 0}
              className={`h-9 px-5 text-sm font-medium text-white bg-foreground rounded-lg transition-opacity shadow-sm ${
                selectedCount > 0 ? 'hover:bg-foreground-strong' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {selectedCount > 0 ? `Importer (${selectedCount})` : 'Importer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
