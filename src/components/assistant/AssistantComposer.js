import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Focus, Paperclip, X } from 'lucide-react';
import DropZone from '../ui/DropZone';
import RichInput from './RichInput';
import ComposerMenu from './ComposerMenu';
import ComposerSystemHeader from './ComposerSystemHeader';
import ComposerToolbar from './ComposerToolbar';
import ComposerUserAsk from './ComposerUserAsk';
import { segmentsToBody, segmentsTokens } from './InlineToken';
import { colors, shadows } from '../../design-system/tokens';

// ── AssistantComposer ────────────────────────────────────────────────
// The one composer: rich input with inline typed tokens, two cursor-
// anchored menus (`@` objects, `/` intentions), a system-state banner
// and the scope toolbar. Scope filters the catalogue only — it never
// changes the anatomy.
//
// États couverts (Figma « Chat Input », node 1081:50926) :
//   Default / Active (ring info au focus) / Paused (running + stop) /
//   UserAsk (carte question) / Processing docs / Limit reached / Quota
//   reach (bandeau système teinté qui enveloppe la carte) + drop zone.
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
//   contextItems? [{id,label,icon?}]  — bandeau CONTEXT (portée de travail)
//   running?, onStop?                — agent en cours : toolbar gelée + stop
//   userAsk? {question,proposals,step,total,answered?} + onUserAskSubmit,
//   onUserAskSkip, onUserAskClose, onUserAskPrev, onUserAskNext

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
  // Bandeau CONTEXT (Figma) : portée de travail affichée en tête de carte -
  // ex. l'acte en cours d'édition. Jamais interactif ici, retiré par le caller.
  contextItems,
  // Agent en cours de génération : toolbar gelée, l'envoi devient stop.
  running = false,
  onStop,
  // Demande de l'agent (une question à la fois) : remplace la carte entière.
  userAsk = null,
  onUserAskSubmit,
  onUserAskSkip,
  onUserAskClose,
  onUserAskPrev,
  onUserAskNext,
  // [{ icon, label, text?, onPick? }] - menu de l'ampoule ; sans onPick, le
  // libellé est inséré dans l'input.
  suggestions,
  // Conservé pour compat (ancienne variante « élevée » du rail dossier) - la
  // carte porte désormais l'unique élévation du Figma (shadows/xl), Default
  // comme elevated.
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
  const [focused, setFocused] = useState(false);
  // menu: null | { trigger:'@'|'/', form:'palette'|'inline', query, anchorRect,
  //               path:[], sectionKey? } — sectionKey = menu @ filtré (Pièces/Modèles)
  const [menu, setMenu] = useState(null);

  // `disables: true` permet à un état non bloquant visuellement (ex. analyse en
  // cours) de désactiver quand même l'input, comme l'ancien composer du rail.
  const blocked = !!(systemState && (systemState.kind === 'blocked' || systemState.disables));
  const isRunning = running || !!(systemState && systemState.kind === 'inProgress' && systemState.disables);
  const canSend = !isEmpty && !blocked && !isRunning;
  // Hors dossier : trombone (upload direct) + « Lier à un dossier » au toolbar.
  const horsDossier = !(scope && scope.dossierId);

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

  const activeMenuData = useMemo(() => {
    if (!menu) return null;
    if (menu.trigger === '/') return intentionMenu;
    if (!menu.sectionKey) return objectMenu;
    // Menu @ filtré (boutons « Pièces » / « Modèles » du toolbar) : seule la
    // section demandée ; si elle est verrouillée, la ligne de conversion reste.
    const sections = objectMenu.sections.filter((s) => s.key === menu.sectionKey);
    return {
      sections,
      lockedRow: sections.length === 0 ? objectMenu.lockedRow : null,
    };
  }, [menu, objectMenu, intentionMenu]);

  // Sections présentes au catalogue (même verrouillées) → boutons du toolbar.
  const hasObjectSection = useCallback(
    (key) => ((catalog && catalog.objects) || []).some((s) => s.key === key),
    [catalog]
  );

  const openObjectsSection = (sectionKey) => {
    if (blocked || isRunning) return;
    setMenu((prev) =>
      prev && prev.sectionKey === sectionKey
        ? null
        : { trigger: '@', form: 'palette', query: '', anchorRect: null, path: [], sectionKey }
    );
    inputRef.current && inputRef.current.focus();
  };

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

  // ── Variant metrics (Figma « Chat Input », node 1081:50926) ───────
  // Hero : halo crème dégradé (p-10 rounded-10) autour d'une carte blanche
  // rounded-6 portée par une grande ombre douce + ring 1px border-strong.
  // Standard : même carte, ombre 2xs, sans halo. Active : ring 2px info.
  // UserAsk : carte détachée (ombre franche 7/16) façon mini-modale.

  const isHero = variant === 'hero';
  const isUserAsk = !!userAsk;
  // Bordure animée réservée au composer d'accueil/central (surface d'accueil).
  const showGlow = isHero && !blocked && !isUserAsk;
  // Ring : 1px border-strong au repos, 2px info-border quand l'input a le focus
  // (état « Active » du Figma). Le hero garde son glow, pas de ring focus.
  const activeRing = focused && !blocked && !isHero
    ? `0px 0px 0px 2px ${colors.feedback.info.border}`
    : `0px 0px 0px 1px ${colors.semantic.borderStrong}`;
  const cardShadow = isUserAsk
    ? `0px 0px 0px 1px ${colors.semantic.border}, 0px 7px 16px 0px rgba(0,0,0,0.2), 0px 115px 46px 0px rgba(0,0,0,0.03)`
    : isHero
      ? '0px 24px 84px -20px rgba(0,0,0,0.25), 0px 4px 6px -4px rgba(26,26,26,0.05), 0px 8px 10px -1px rgba(26,26,26,0.05)'
      // Standard (elevated compris) : ring + shadows/xl - LA carte du Figma
      // « Chat Input » (1081:50926), Default comme Active.
      : `${activeRing}, ${shadows.xl}`;
  // Sans glow (hero), garder le ring statique 1px ; avec glow, le dégradé fait la bordure.
  const heroStaticRing = isHero && !showGlow ? `, 0px 0px 0px 1px ${colors.semantic.borderStrong}` : '';

  // Bandeau système : fond teinté qui ENVELOPPE la carte (Figma Processing
  // docs / Limit reached / Quota reach) - l'en-tête vit sur le teinté.
  const bannerBg = systemState
    ? systemState.kind === 'blocked'
      ? colors.composer.blockedBg
      : systemState.kind === 'warning'
        ? colors.composer.warningBg
        : colors.composer.processingBg
    : null;

  const card = (
    <div
      ref={frameRef}
      className="relative overflow-visible rounded-[6px] transition-shadow"
      style={{
        // Surface theme-aware (« white » → carte sombre en dark, cf. tokens.js).
        backgroundColor: colors.semantic.white,
        boxShadow: `${cardShadow}${heroStaticRing}`,
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!frameRef.current || !frameRef.current.contains(e.relatedTarget)) setFocused(false);
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
      {!isUserAsk && menu && activeMenuData && (
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
        {isUserAsk ? (
          <ComposerUserAsk
            ask={userAsk}
            onSubmit={onUserAskSubmit}
            onSkip={onUserAskSkip}
            onClose={onUserAskClose}
            onPrev={onUserAskPrev}
            onNext={onUserAskNext}
          />
        ) : (
          <>
            {/* CONTEXT — portée de travail (badge mono uppercase), Figma node 1081:50936 */}
            {contextItems && contextItems.length > 0 && (
              <div className="flex flex-wrap items-start gap-y-[7px] gap-x-1 p-1.5 border-b border-border">
                {contextItems.map((item) => {
                  const Icon = item.icon || Focus;
                  return (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 max-w-[180px] px-2 py-1.5 rounded-[6px] border border-border"
                      title={item.label}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0 text-foreground-secondary" strokeWidth={1.75} />
                      <span
                        className="min-w-0 truncate text-foreground-secondary uppercase"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500 }}
                      >
                        {item.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Drop zone (DropZone context panel, état drop) : bande pointillée
                qui apparaît pendant le survol d'un drag de fichiers. */}
            {dragOver && (
              <div className="px-3 pt-3">
                <DropZone context="panel" state="drop" />
              </div>
            )}

            {/* Staged docs (work documents / drops) — badges secondary (Figma Docs) */}
            {stagedDocs && stagedDocs.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
                {stagedDocs.map((doc) => (
                  <span
                    key={doc.id}
                    className="inline-flex items-center gap-1 max-w-[220px] pl-2 pr-1.5 py-1 rounded-[6px] bg-secondary text-[12px] font-medium text-secondary-foreground"
                  >
                    <Paperclip className="w-3 h-3 flex-shrink-0 text-foreground-secondary" strokeWidth={1.75} />
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

            {/* Rich input — Figma « Instruction text » : pb-32 au repos (grande
                zone d'appel), pb-12 dès qu'il y a du contenu (bloc Active). */}
            <div className={isHero ? 'px-3 pt-3 pb-3' : `px-3 pt-3 ${isEmpty ? 'pb-8' : 'pb-3'}`}>
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

            {/* Toolbar - Pièces · Modèles · ampoule · (trombone hors dossier) |
                (lier hors dossier) · dictée · envoi/stop.
                Les menus @ et / s'ouvrent aussi en tapant @ ou / dans l'input. */}
            <ComposerToolbar
              onAttach={onAttach}
              attachDossiers={attachDossiers}
              onAttachToDossier={onAttachToDossier}
              onCreateDossier={onCreateDossier}
              onDropClick={() => fileInputRef.current && fileInputRef.current.click()}
              onOpenPieces={hasObjectSection('pieces') ? () => openObjectsSection('pieces') : undefined}
              onOpenModeles={hasObjectSection('modeles') ? () => openObjectsSection('modeles') : undefined}
              horsDossier={horsDossier}
              suggestions={(suggestions || []).map(s => ({
                ...s,
                onPick: () => {
                  if (s.onPick) { s.onPick(); return; }
                  if (inputRef.current) { inputRef.current.insertText(s.label); inputRef.current.focus(); }
                },
              }))}
              disabled={blocked || isRunning}
              canSend={canSend}
              onSend={handleSend}
              running={isRunning}
              onStop={onStop}
            />
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />
    </div>
  );

  return (
    <div
      className={isHero ? 'w-full max-w-[690px] mx-auto rounded-[10px] p-[10px]' : 'w-full'}
      style={isHero ? { background: `linear-gradient(to bottom, ${colors.semantic.muted} 0%, rgba(238,236,230,0) 66.5%)` } : undefined}
    >
      {showGlow && (
        <style>{`
          @property --plato-glow-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
          @keyframes plato-glow-spin { to { --plato-glow-angle: 360deg; } }
          /* « Bordure à glow mobile · Vif atténué » (BrandOrangeLab MovingBorderGlow) :
             une COMÈTE orange (arc unique sur transparent) qui tourne sur le bord,
             sur un anneau de base borderStrong, doublée d'un jumeau flou (bloom).
             Jamais un aplat - doctrine « détail ». */
          .plato-glow-ring, .plato-glow-bloom {
            position: absolute;
            border-radius: 7px;
            pointer-events: none;
            background: conic-gradient(from var(--plato-glow-angle),
              transparent 0deg, ${colors.brand.DEFAULT} 46deg, transparent 92deg);
            animation: plato-glow-spin 3.4s linear infinite;
          }
          /* anneau net 1px : comète PAR-DESSUS un anneau de base, masqués au seul liseré */
          .plato-glow-ring {
            inset: -1px;
            padding: 1px;
            z-index: 1;
            background:
              conic-gradient(from var(--plato-glow-angle), transparent 0deg, ${colors.brand.DEFAULT} 46deg, transparent 92deg),
              linear-gradient(${colors.semantic.borderStrong}, ${colors.semantic.borderStrong});
            -webkit-mask: linear-gradient(black 0 0) content-box, linear-gradient(black 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(black 0 0) content-box, linear-gradient(black 0 0);
            mask-composite: exclude;
          }
          /* jumeau flou (bloom) : même comète, anneau plus épais et flouté, autour du bord */
          .plato-glow-bloom {
            inset: -3px;
            padding: 4px;
            z-index: 0;
            filter: blur(7px);
            opacity: 0.75;
            -webkit-mask: linear-gradient(black 0 0) content-box, linear-gradient(black 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(black 0 0) content-box, linear-gradient(black 0 0);
            mask-composite: exclude;
          }
          @supports not (background: conic-gradient(from 0deg, red, blue)) {
            .plato-glow-ring { background: ${colors.semantic.borderStrong}; }
            .plato-glow-bloom { display: none; }
          }
          @media (prefers-reduced-motion: reduce) {
            .plato-glow-ring { animation: none; background: ${colors.semantic.borderStrong}; }
            .plato-glow-bloom { display: none; }
          }
        `}</style>
      )}
      {systemState && !isUserAsk ? (
        // Bandeau système : le fond teinté enveloppe la carte (px/pb 1px), avec
        // l'en-tête (icône + libellé + Voir) posé sur le teinté.
        <div className="rounded-[8px] px-px pb-px" style={{ backgroundColor: bannerBg }}>
          <ComposerSystemHeader state={systemState} />
          {card}
        </div>
      ) : (
        card
      )}
    </div>
  );
}
