import React, { useCallback, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import RichInput from './RichInput';
import ComposerMenu from './ComposerMenu';
import ComposerSystemHeader from './ComposerSystemHeader';
import ComposerToolbar from './ComposerToolbar';
import { segmentsToBody, segmentsTokens } from './InlineToken';

// ── AssistantComposer ────────────────────────────────────────────────
// The one composer: rich input with inline typed tokens, two cursor-
// anchored menus (`@` objects, `/` intentions), a system-state header
// and the scope toolbar. Scope filters the catalogue only — it never
// changes the anatomy.
//
// Props (frozen contract):
//   variant 'hero'|'standard'
//   scope {dossierId, vertical}, dossierLabel
//   systemState null | {kind:'inProgress'|'warning'|'blocked', label, detail?, onOpen?}
//   scopeFlash, onScopeFlashEnd
//   catalog {objects, intentions}    — already computed by the caller
//     objects: [{key,label,locked?,items?,folders?:[{key,label,items}]}]
//     intentions: [{id,label,description?,locked?,icon?}]
//   onSend({body, tokens, segments}), onAttach(), onCreateDossier(),
//   onRunIntention(intention), onDropFiles(files),
//   placeholder, autoFocus,
//   stagedDocs?, onRemoveStagedDoc?

export default function AssistantComposer({
  variant = 'standard',
  scope,
  dossierLabel,
  systemState = null,
  scopeFlash = false,
  onScopeFlashEnd,
  catalog,
  onSend,
  onAttach,
  // Popover de rattachement (ancré au bouton du toolbar).
  attachDossiers,
  onAttachToDossier,
  onCreateDossier,
  onRunIntention,
  onDropFiles,
  placeholder = 'Demander à Plato...',
  placeholderNode = null,
  autoFocus = false,
  stagedDocs,
  onRemoveStagedDoc,
  // [{ icon, label, text?, onPick? }] - menu de l'ampoule ; sans onPick, le
  // libellé est inséré dans l'input.
  suggestions,
  // Variante `standard` plus élevée (ombre portée marquée) - pour le composer du
  // rail dossier, plus petit, qui doit « flotter » au-dessus du fil.
  elevated = false,
  // ref exposant { insertText, focus } - pour piloter l'input depuis l'extérieur
  // (ex. pills de démarrage sous le composer d'accueil).
  composerApiRef,
}) {
  const frameRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const segmentsRef = useRef([]);

  if (composerApiRef) {
    composerApiRef.current = {
      insertText: (t) => inputRef.current && inputRef.current.insertText(t),
      focus: () => inputRef.current && inputRef.current.focus(),
    };
  }

  const [isEmpty, setIsEmpty] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  // menu: null | { trigger:'@'|'/', form:'palette'|'inline', query, anchorRect, path:[] }
  const [menu, setMenu] = useState(null);

  // `disables: true` permet à un état non bloquant visuellement (ex. analyse en
  // cours) de désactiver quand même l'input, comme l'ancien composer du rail.
  const blocked = !!(systemState && (systemState.kind === 'blocked' || systemState.disables));
  const canSend = !isEmpty && !blocked;

  // ── Catalog → menu sections ────────────────────────────────────────

  const lockedRowFrom = useCallback(
    (lockedLabels) => {
      if (!lockedLabels || lockedLabels.length === 0) return null;
      return {
        label: lockedLabels.join(', '),
        hint: 'dans un dossier',
        // « Rattacher » seulement quand un fil existe (onAttach fourni) - sur
        // la home, la seule conversion est la création de dossier.
        onAttach: onAttach
          ? () => {
              setMenu(null);
              onAttach();
            }
          : undefined,
        onCreate: onCreateDossier
          ? () => {
              setMenu(null);
              onCreateDossier();
            }
          : undefined,
      };
    },
    [onAttach, onCreateDossier]
  );

  const objectMenu = useMemo(() => {
    const all = (catalog && catalog.objects) || [];
    const sections = all.filter((s) => !s.locked);
    const lockedLabels = all.filter((s) => s.locked).map((s) => s.label);
    return { sections, lockedRow: lockedRowFrom(lockedLabels) };
  }, [catalog, lockedRowFrom]);

  const intentionMenu = useMemo(() => {
    const all = (catalog && catalog.intentions) || [];
    const open = all.filter((it) => !it.locked);
    const lockedLabels = all.filter((it) => it.locked).map((it) => it.label);
    const sections =
      open.length > 0
        ? [
            {
              key: 'intentions',
              label: 'Intentions',
              items: open.map((it) => ({ ...it, type: 'intention', family: 'intention' })),
            },
          ]
        : [];
    return { sections, lockedRow: lockedRowFrom(lockedLabels) };
  }, [catalog, lockedRowFrom]);

  const activeMenuData = menu
    ? menu.trigger === '@'
      ? objectMenu
      : intentionMenu
    : null;

  // ── RichInput wiring ───────────────────────────────────────────────

  const handleChange = (segments) => {
    segmentsRef.current = segments;
    const hasToken = segments.some((s) => s.kind === 'token');
    const body = segments
      .filter((s) => s.kind === 'text')
      .map((s) => s.text)
      .join('');
    setIsEmpty(!hasToken && body.trim() === '');
  };

  const handleTrigger = (t) => {
    if (!t) {
      setMenu(null);
      return;
    }
    setMenu((prev) => ({
      trigger: t.char,
      form: t.inputWasEmpty ? 'palette' : 'inline',
      query: t.query,
      anchorRect: t.caretRect,
      path: prev && prev.trigger === t.char ? prev.path : [],
    }));
  };

  const handlePick = (item) => {
    if (!menu) return;
    if (menu.trigger === '/' && item.type === 'intention') {
      if (menu.form === 'palette') {
        // Empty input: run the intention directly.
        inputRef.current && inputRef.current.clear();
        setMenu(null);
        onRunIntention && onRunIntention(item);
        return;
      }
      // Mid-sentence: the intention becomes an inline token.
      inputRef.current &&
        inputRef.current.insertToken({
          id: item.id,
          type: 'intention',
          label: item.label,
          family: 'intention',
        });
      setMenu(null);
      return;
    }
    inputRef.current &&
      inputRef.current.insertToken({
        id: item.id,
        type: item.type,
        label: item.label,
        family: item.family || item.type,
      });
    setMenu(null);
  };

  const handleSend = () => {
    if (!canSend) return;
    const segments = segmentsRef.current;
    const body = segmentsToBody(segments).trim();
    if (!body && segmentsTokens(segments).length === 0) return;
    onSend &&
      onSend({ body, tokens: segmentsTokens(segments), segments });
    inputRef.current && inputRef.current.clear();
    setMenu(null);
  };

  // ── Drops ──────────────────────────────────────────────────────────

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (blocked) return;
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
    if (files.length > 0 && onDropFiles) onDropFiles(files);
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onDropFiles) onDropFiles(files);
    e.target.value = '';
  };

  // ── Variant metrics (Figma « Chat Input », node 3736:32543) ───────
  // Hero : halo crème dégradé (p-10 rounded-10) autour d'une carte blanche
  // rounded-6 portée par une grande ombre douce + ring 1px border-strong.
  // Standard : même carte, ombre 2xs, sans halo.

  const isHero = variant === 'hero';
  // Bordure animée réservée au composer d'accueil/central (surface d'accueil).
  const showGlow = isHero && !blocked;
  const cardShadow = isHero
    ? '0px 24px 84px -20px rgba(0,0,0,0.25), 0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)'
    : elevated
      // Standard élevé (rail dossier) : la petite carte FLOTTE au-dessus du fil -
      // bord + ombre portée franche (14px/28px) pour la détacher.
      ? '0px 0px 0px 1px #cbc7c4, 0px 2px 4px -1px rgba(26,26,26,0.08), 0px 12px 24px -8px rgba(26,26,26,0.16)'
      // Standard : la carte est nettement élevée (bord + ombre douce à deux
      // couches) - elle flotte au-dessus du fil de la conversation centrale.
      : '0px 0px 0px 1px #cbc7c4, 0px 2px 4px -1px rgba(26,26,26,0.06), 0px 10px 22px -6px rgba(26,26,26,0.13)';
  // Sans glow (hero), garder le ring statique 1px ; avec glow, le dégradé fait la bordure.
  const heroStaticRing = showGlow ? '' : ', 0px 0px 0px 1px #cbc7c4';

  return (
    <div
      className={isHero ? 'w-full max-w-[690px] mx-auto rounded-[10px] p-[10px]' : 'w-full'}
      style={isHero ? { background: 'linear-gradient(to bottom, #eeece6 0%, rgba(238,236,230,0) 66.5%)' } : undefined}
    >
      {showGlow && (
        <style>{`
          @property --plato-glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
          @keyframes plato-glow-spin { to { --plato-glow-angle: 360deg; } }
          /* « Bordure à glow mobile · Vif atténué » (BrandOrangeLab MovingBorderGlow) :
             une COMÈTE orange (arc unique sur transparent) qui tourne sur le bord,
             sur un anneau de base #cbc7c4, doublée d'un jumeau flou (bloom).
             Jamais un aplat - doctrine « détail ». */
          .plato-glow-ring, .plato-glow-bloom {
            position: absolute;
            border-radius: 7px;
            pointer-events: none;
            background: conic-gradient(from var(--plato-glow-angle),
              transparent 0deg, #f47a2c 46deg, transparent 92deg);
            animation: plato-glow-spin 3.4s linear infinite;
          }
          /* anneau net 1px : comète PAR-DESSUS un anneau de base, masqués au seul liseré */
          .plato-glow-ring {
            inset: -1px;
            padding: 1px;
            z-index: 1;
            background:
              conic-gradient(from var(--plato-glow-angle), transparent 0deg, #f47a2c 46deg, transparent 92deg),
              linear-gradient(#cbc7c4, #cbc7c4);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask-composite: exclude;
          }
          /* jumeau flou (bloom) : même comète, anneau plus épais et flouté, autour du bord */
          .plato-glow-bloom {
            inset: -3px;
            padding: 4px;
            z-index: 0;
            filter: blur(7px);
            opacity: 0.75;
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask-composite: exclude;
          }
          @supports not (background: conic-gradient(from 0deg, red, blue)) {
            .plato-glow-ring { background: #cbc7c4; }
            .plato-glow-bloom { display: none; }
          }
          @media (prefers-reduced-motion: reduce) {
            .plato-glow-ring { animation: none; background: #cbc7c4; }
            .plato-glow-bloom { display: none; }
          }
        `}</style>
      )}
      <div
        ref={frameRef}
        className="relative bg-white overflow-visible rounded-[6px] transition-shadow"
        style={{
          boxShadow: dragOver
            ? `${cardShadow}, 0px 0px 0px 3px #eeece6`
            : `${cardShadow}${heroStaticRing}`,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!blocked) setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!frameRef.current || !frameRef.current.contains(e.relatedTarget)) setDragOver(false);
        }}
        onDrop={handleDrop}
      >
        {showGlow && !dragOver && (
          <>
            <span className="plato-glow-bloom" aria-hidden="true" />
            <span className="plato-glow-ring" aria-hidden="true" />
          </>
        )}
        {/* Menus — palette form is anchored to the frame itself. */}
        {menu && activeMenuData && (
          <ComposerMenu
            ref={menuRef}
            form={menu.form}
            anchorRect={menu.anchorRect}
            containerRef={frameRef}
            query={menu.query}
            sections={activeMenuData.sections}
            lockedRow={activeMenuData.lockedRow}
            path={menu.path}
            onEnterFolder={(folderKey) =>
              setMenu((m) => (m ? { ...m, path: [...m.path, folderKey] } : m))
            }
            onBack={() => setMenu((m) => (m ? { ...m, path: m.path.slice(0, -1) } : m))}
            onPick={handlePick}
            onDismiss={() => setMenu(null)}
          />
        )}

        <div className="overflow-hidden rounded-[6px]">
          <ComposerSystemHeader state={systemState} />

          {/* Staged docs (work documents / drops) */}
          {stagedDocs && stagedDocs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2.5">
              {stagedDocs.map((doc) => (
                <span
                  key={doc.id}
                  className="inline-flex items-center gap-1 max-w-[220px] h-6 pl-2 pr-1 rounded-md bg-background-subtle border border-border text-[12px] text-foreground"
                >
                  <span className="truncate">{doc.name}</span>
                  {onRemoveStagedDoc && (
                    <button
                      type="button"
                      aria-label={`Retirer ${doc.name}`}
                      className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-border transition-colors flex-shrink-0"
                      onClick={() => onRemoveStagedDoc(doc)}
                    >
                      <X className="w-3 h-3 text-foreground-secondary" strokeWidth={1.75} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Rich input */}
          <div className={isHero ? 'px-3 pt-3 pb-3' : 'px-3 pt-3 pb-1'}>
            <RichInput
              ref={inputRef}
              variant={variant}
              disabled={blocked}
              placeholder={placeholder}
              autoFocus={autoFocus}
              onChange={handleChange}
              onTrigger={handleTrigger}
              onSubmit={handleSend}
              placeholderNode={placeholderNode}
              menuOpen={!!menu}
              onMenuKey={(key) => (menuRef.current ? menuRef.current.handleKey(key) !== false : false)}
            />
          </div>

          {/* Toolbar - minimale (ampoule · trombone · rattacher · dictée · envoi).
              Les menus @ et / s'ouvrent en tapant @ ou / dans l'input. */}
          <ComposerToolbar
            onAttach={onAttach}
            attachDossiers={attachDossiers}
            onAttachToDossier={onAttachToDossier}
            onCreateDossier={onCreateDossier}
            onDropClick={() => fileInputRef.current && fileInputRef.current.click()}
            suggestions={(suggestions || []).map(s => ({
              ...s,
              onPick: () => {
                if (s.onPick) { s.onPick(); return; }
                if (inputRef.current) { inputRef.current.insertText(s.label); inputRef.current.focus(); }
              },
            }))}
            disabled={blocked}
            canSend={canSend}
            onSend={handleSend}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilePick}
        />
      </div>
    </div>
  );
}
