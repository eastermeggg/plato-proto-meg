import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Folder,
  Lock,
} from 'lucide-react';

// ── ComposerMenu ─────────────────────────────────────────────────────
// One generic cursor-anchored menu for both the `@` (objects) and `/`
// (intentions) triggers. Two forms:
//   palette — input was empty: anchored to the composer frame, full width
//   inline  — mid-sentence: fixed near the caret, 320px wide
//
// The menu owns its own selection state and exposes handleKey(key) via
// ref; the parent forwards keys captured by RichInput while it is open.
//
// Section shape: { key, label, items?: [item], folders?: [{key,label,items}] }
// Item shape:    { id, type, label, family?, meta?, icon? }
// lockedRow:     { label, hint?, onAttach, onCreate } — pinned last, never filtered.

const MONO_HEADER = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const NAVIGABLE = new Set(['back', 'folder', 'item', 'locked']);

function buildRows({ sections, query, path, lockedRow }) {
  const rows = [];
  const q = (query || '').trim().toLowerCase();

  if (q) {
    // Search flattens the hierarchy; folder navigation is disabled.
    sections.forEach((section) => {
      const matches = [];
      (section.items || []).forEach((it) => {
        if (it.label.toLowerCase().includes(q)) matches.push({ ...it });
      });
      (section.folders || []).forEach((folder) => {
        (folder.items || []).forEach((it) => {
          if (it.label.toLowerCase().includes(q)) matches.push({ ...it, meta: folder.label });
        });
      });
      if (matches.length > 0) {
        rows.push({ kind: 'header', key: `h-${section.key}`, label: section.label });
        matches.forEach((it) => rows.push({ kind: 'item', key: `i-${it.type}-${it.id}`, item: it }));
      }
    });
    if (!rows.some((r) => r.kind === 'item')) {
      rows.push({ kind: 'empty', key: 'empty' });
    }
  } else if (path && path.length > 0) {
    // Inside a folder: back row on top, then the folder's items.
    const folderKey = path[path.length - 1];
    let parent = null;
    let folder = null;
    sections.forEach((section) => {
      (section.folders || []).forEach((f) => {
        if (f.key === folderKey) {
          parent = section;
          folder = f;
        }
      });
    });
    rows.push({ kind: 'back', key: 'back', label: parent ? parent.label : 'Retour' });
    if (folder) {
      rows.push({ kind: 'header', key: `h-${folder.key}`, label: folder.label });
      (folder.items || []).forEach((it) =>
        rows.push({ kind: 'item', key: `i-${it.type}-${it.id}`, item: it })
      );
      if ((folder.items || []).length === 0) rows.push({ kind: 'empty', key: 'empty' });
    }
  } else {
    // Root level: folders first, then direct items, per section.
    sections.forEach((section) => {
      const folders = section.folders || [];
      const items = section.items || [];
      if (folders.length === 0 && items.length === 0) return;
      rows.push({ kind: 'header', key: `h-${section.key}`, label: section.label });
      folders.forEach((f) =>
        rows.push({ kind: 'folder', key: `f-${f.key}`, folder: f })
      );
      items.forEach((it) =>
        rows.push({ kind: 'item', key: `i-${it.type}-${it.id}`, item: it })
      );
    });
    if (!rows.some((r) => r.kind === 'item' || r.kind === 'folder')) {
      rows.push({ kind: 'empty', key: 'empty' });
    }
  }

  // The locked row is pinned last and never filtered out.
  if (lockedRow) rows.push({ kind: 'locked', key: 'locked' });
  return rows;
}

const ComposerMenu = forwardRef(function ComposerMenu(
  {
    form = 'palette',
    anchorRect,
    containerRef,
    query = '',
    sections = [],
    lockedRow = null,
    path = [],
    onEnterFolder,
    onBack,
    onPick,
    onDismiss,
  },
  ref
) {
  const menuRef = useRef(null);
  const listRef = useRef(null);
  const [selected, setSelected] = useState(0);
  const [, setResizeTick] = useState(0);

  const rows = useMemo(
    () => buildRows({ sections, query, path, lockedRow }),
    [sections, query, path, lockedRow]
  );
  const navigable = useMemo(
    () => rows.map((r, i) => ({ ...r, rowIndex: i })).filter((r) => NAVIGABLE.has(r.kind)),
    [rows]
  );

  // Reset selection when the list changes shape.
  const pathDepth = path.length;
  useEffect(() => {
    setSelected(0);
  }, [query, pathDepth, sections]);

  const activate = (row) => {
    if (!row) return;
    if (row.kind === 'back') onBack && onBack();
    else if (row.kind === 'folder') onEnterFolder && onEnterFolder(row.folder.key);
    else if (row.kind === 'item') onPick && onPick(row.item);
    else if (row.kind === 'locked') {
      // Enter sur la ligne verrouillée : rattacher si possible, sinon créer.
      if (lockedRow && lockedRow.onAttach) lockedRow.onAttach();
      else if (lockedRow && lockedRow.onCreate) lockedRow.onCreate();
    }
  };

  useImperativeHandle(ref, () => ({
    // Renvoie true si la touche a été consommée ; false quand il n'y a rien à
    // activer (le parent laisse alors Enter envoyer le texte tel quel).
    handleKey(key) {
      if (key === 'Escape') {
        onDismiss && onDismiss();
        return true;
      }
      if (key === 'ArrowDown') {
        setSelected((i) => Math.min(i + 1, navigable.length - 1));
        return true;
      }
      if (key === 'ArrowUp') {
        setSelected((i) => Math.max(i - 1, 0));
        return true;
      }
      if (key === 'Enter' || key === 'Tab') {
        if (!navigable[selected]) {
          onDismiss && onDismiss();
          return false;
        }
        activate(navigable[selected]);
        return true;
      }
      return false;
    },
  }));

  // Keep the selected row visible.
  useEffect(() => {
    const row = navigable[selected];
    if (!row || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-row-index="${row.rowIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selected, navigable]);

  // Dismiss on outside mousedown and on scroll (capture); track resizes.
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onDismiss && onDismiss();
    };
    const onScroll = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onDismiss && onDismiss();
    };
    const onResize = () => setResizeTick((t) => t + 1);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [onDismiss]);

  // ── Positioning ────────────────────────────────────────────────────

  let style;
  if (form === 'palette') {
    style = { position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8 };
  } else {
    const width = 320;
    const vh = window.innerHeight;
    let left = anchorRect ? anchorRect.left : 0;
    let bottom = anchorRect ? vh - anchorRect.top + 6 : 80;
    const bounds = containerRef && containerRef.current
      ? containerRef.current.getBoundingClientRect()
      : null;
    if (bounds) {
      left = Math.max(bounds.left, Math.min(left, bounds.right - width));
    } else {
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    }
    style = { position: 'fixed', left, bottom, width };
  }

  const selectedRowIndex = navigable[selected] ? navigable[selected].rowIndex : -1;

  return (
    <div
      ref={menuRef}
      className="z-50 rounded-xl border border-border bg-white shadow-lg overflow-hidden"
      style={style}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div ref={listRef} className="overflow-y-auto py-1" style={{ maxHeight: 320 }}>
        {rows.map((row, i) => {
          const isSelected = i === selectedRowIndex;
          const hoverProps = NAVIGABLE.has(row.kind)
            ? {
                onMouseDown: (e) => e.preventDefault(),
                onClick: () => activate(row),
                onMouseEnter: () => {
                  const navIdx = navigable.findIndex((n) => n.rowIndex === i);
                  if (navIdx >= 0) setSelected(navIdx);
                },
              }
            : {};

          if (row.kind === 'header') {
            return (
              <div key={row.key} className="px-3 pt-2 pb-1 text-foreground-secondary" style={MONO_HEADER}>
                {row.label}
              </div>
            );
          }

          if (row.kind === 'empty') {
            return (
              <div key={row.key} className="px-3 py-2 text-[13px] text-foreground-muted">
                Aucun résultat
              </div>
            );
          }

          if (row.kind === 'back') {
            return (
              <button
                key={row.key}
                type="button"
                data-row-index={i}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${isSelected ? 'bg-background-subtle' : 'hover:bg-background-subtle'}`}
                {...hoverProps}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                <span className="text-[13px] text-foreground-secondary">{row.label}</span>
              </button>
            );
          }

          if (row.kind === 'folder') {
            return (
              <button
                key={row.key}
                type="button"
                data-row-index={i}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${isSelected ? 'bg-background-subtle' : 'hover:bg-background-subtle'}`}
                {...hoverProps}
              >
                <Folder className="w-3.5 h-3.5 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 truncate text-[13px] text-foreground">{row.folder.label}</span>
                {typeof row.folder.count === 'number' && (
                  <span className="text-[11px] text-foreground-muted">{row.folder.count}</span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
              </button>
            );
          }

          if (row.kind === 'item') {
            const Icon = row.item.icon || FileText;
            return (
              <button
                key={row.key}
                type="button"
                data-row-index={i}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${isSelected ? 'bg-background-subtle' : 'hover:bg-background-subtle'}`}
                {...hoverProps}
              >
                <Icon className="w-3.5 h-3.5 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
                <span className="flex-1 min-w-0 truncate text-[13px] text-foreground">{row.item.label}</span>
                {row.item.meta && (
                  <span className="flex-shrink-0 max-w-[120px] truncate text-[11px] text-foreground-muted">
                    {row.item.meta}
                  </span>
                )}
              </button>
            );
          }

          // Locked row: one grouped conversion row, pinned last.
          return (
            <div
              key={row.key}
              data-row-index={i}
              className={`flex items-center gap-2 px-3 py-2 mt-1 border-t border-border-subtle cursor-default transition-colors ${isSelected ? 'bg-background-subtle' : 'hover:bg-background-subtle'}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => {
                const navIdx = navigable.findIndex((n) => n.rowIndex === i);
                if (navIdx >= 0) setSelected(navIdx);
              }}
            >
              <Lock className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[13px] text-foreground-secondary">{lockedRow.label}</span>
                <span className="block text-[11px] text-foreground-muted">{lockedRow.hint || 'dans un dossier'}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lockedRow.onAttach && (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-foreground underline-offset-2 hover:underline"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      lockedRow.onAttach();
                    }}
                  >
                    Rattacher
                  </button>
                )}
                {lockedRow.onCreate && (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-foreground underline-offset-2 hover:underline"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      lockedRow.onCreate();
                    }}
                  >
                    Créer un dossier
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ComposerMenu;
