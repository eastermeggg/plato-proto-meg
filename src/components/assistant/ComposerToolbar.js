import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUp,
  FileText,
  Folder,
  FolderOpen,
  LayoutTemplate,
  Lightbulb,
  Mic,
  Paperclip,
  Plus,
  Square,
} from 'lucide-react';
import SuggestionsMenu from '../SuggestionsMenu';
import { colors, shadows } from '../../design-system/tokens';

// ── ComposerToolbar ──────────────────────────────────────────────────
// Rangée basse du composer — alignée sur le Figma « Chat Input »
// (node 1081:50926) :
//   gauche  - « Pièces » · « Modèles » (boutons libellés, ouvrent le menu @
//             filtré) · ampoule à suggestions · trombone (HORS dossier
//             seulement - en dossier, pas d'upload dans le chat)
//   droite  - « Lier à un dossier » (pointillé, hors dossier seulement) ·
//             dictée (présente, inerte) · envoi / stop
// Les menus @ et / restent accessibles en tapant @ ou / dans l'input.

const iconBtnClass = (disabled) =>
  `inline-flex items-center justify-center w-[26px] h-[26px] rounded-[4px] transition-colors ${
    disabled
      ? 'text-foreground-muted cursor-not-allowed'
      : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground active:bg-stone-subtle'
  }`;

const labelBtnClass = (disabled) =>
  `inline-flex items-center gap-1.5 h-[26px] px-2 rounded-[4px] text-[12px] font-medium transition-colors ${
    disabled
      ? 'text-foreground-muted cursor-not-allowed'
      : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground active:bg-stone-subtle'
  }`;

export default function ComposerToolbar({
  onAttach,
  // Rattachement en POPOVER (ancré au bouton) : liste des dossiers ouverts +
  // création. Si absents, on retombe sur onAttach() (modale).
  attachDossiers = [],
  onAttachToDossier,
  onCreateDossier,
  onDropClick,
  // Boutons libellés « Pièces » / « Modèles » : ouvrent le menu @ filtré.
  onOpenPieces,
  onOpenModeles,
  // Hors dossier : trombone (upload direct) + « Lier à un dossier ».
  horsDossier = true,
  suggestions = [],
  disabled = false,
  canSend = false,
  onSend,
  // Agent en cours : l'envoi devient un bouton stop (carré sur fond secondary).
  running = false,
  onStop,
}) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null); // { left, bottom } en coords viewport
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Popover de rattachement (ancré au bouton « Lier à un dossier »).
  const usePopover = !!onAttachToDossier;
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachRect, setAttachRect] = useState(null);
  const attachBtnRef = useRef(null);
  const attachMenuRef = useRef(null);

  const placeAttach = useCallback(() => {
    const el = attachBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 300;
    // Aligné à DROITE du bouton (le bouton est à droite du composer), ouvre vers le haut.
    const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8);
    setAttachRect({ left, bottom: window.innerHeight - r.top + 6, width });
  }, []);

  useEffect(() => {
    if (!attachOpen) return undefined;
    placeAttach();
    const onDown = (e) => {
      if (attachMenuRef.current?.contains(e.target) || attachBtnRef.current?.contains(e.target)) return;
      setAttachOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setAttachOpen(false); };
    const onScroll = (e) => { if (!attachMenuRef.current?.contains(e.target)) setAttachOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', placeAttach);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', placeAttach);
    };
  }, [attachOpen, placeAttach]);

  // Le popover sort en OVERLAY (portal + position fixed) pour échapper à
  // l'overflow-hidden du composer : il flotte toujours au-dessus, jamais coupé.
  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 320;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    setMenuRect({ left, bottom: window.innerHeight - r.top + 6, width });
  }, []);

  useEffect(() => {
    if (!suggestionsOpen) return undefined;
    place();
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setSuggestionsOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setSuggestionsOpen(false); };
    const onScroll = (e) => { if (!menuRef.current?.contains(e.target)) setSuggestionsOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [suggestionsOpen, place]);

  // Bouton envoi / stop : trois états (Figma Default / Active / Paused).
  const sendBtn = running ? (
    <button
      type="button"
      title="Arrêter"
      aria-label="Arrêter"
      onClick={onStop}
      className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[4px] flex-shrink-0 transition-colors"
      style={{
        backgroundColor: colors.semantic.secondary,
        boxShadow: shadows['2xs'],
      }}
    >
      <Square
        className="w-3.5 h-3.5 opacity-50"
        strokeWidth={2}
        style={{ color: colors.semantic.foreground }}
        fill={colors.semantic.foreground}
      />
    </button>
  ) : (
    <button
      type="button"
      title="Envoyer (Entrée)"
      aria-label="Envoyer"
      onClick={canSend ? onSend : undefined}
      disabled={!canSend}
      className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[4px] flex-shrink-0"
      style={{
        backgroundColor: canSend ? colors.semantic.primary : colors.semantic.background,
        boxShadow: canSend ? shadows['xs'] : 'none',
        cursor: canSend ? 'pointer' : 'default',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => { if (canSend) e.currentTarget.style.backgroundColor = colors.semantic.foregroundTertiary; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = canSend ? colors.semantic.primary : colors.semantic.background; }}
    >
      <ArrowUp
        className={canSend ? 'w-3.5 h-3.5' : 'w-3 h-3 opacity-50'}
        strokeWidth={2.25}
        style={{ color: canSend ? colors.semantic.primaryForeground : colors.semantic.mutedForeground }}
      />
    </button>
  );

  return (
    <div className="flex items-center justify-between gap-2 p-3">
      {/* Figma « Icon buttons » : boutons adjacents (gap 0), le groupe entier
          passe à 30% quand désactivé. */}
      <div className={`flex items-center min-w-0 ${disabled ? 'opacity-30' : ''}`}>
        {onOpenPieces && (
          <button
            type="button"
            title="Pièces du dossier"
            className={labelBtnClass(disabled)}
            disabled={disabled}
            onClick={onOpenPieces}
          >
            <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
            Pièces
          </button>
        )}
        {onOpenModeles && (
          <button
            type="button"
            title="Modèles"
            className={labelBtnClass(disabled)}
            disabled={disabled}
            onClick={onOpenModeles}
          >
            <LayoutTemplate className="w-3.5 h-3.5" strokeWidth={1.75} />
            Modèles
          </button>
        )}
        {suggestions.length > 0 && (
          <>
            <button
              ref={btnRef}
              type="button"
              title="Suggestions"
              aria-label="Suggestions"
              className={`${iconBtnClass(disabled)} ${suggestionsOpen ? 'bg-background-subtle text-foreground' : ''}`}
              disabled={disabled}
              onClick={() => { if (!disabled) setSuggestionsOpen(o => !o); }}
            >
              <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            {suggestionsOpen && menuRect && createPortal(
              <div
                ref={menuRef}
                className="fixed z-[100]"
                style={{ left: menuRect.left, bottom: menuRect.bottom, width: menuRect.width }}
              >
                <SuggestionsMenu
                  items={suggestions.map(s => ({
                    icon: s.icon,
                    label: s.label,
                    onClick: () => { setSuggestionsOpen(false); s.onPick && s.onPick(); },
                  }))}
                />
              </div>,
              document.body
            )}
          </>
        )}
        {/* Trombone HORS dossier seulement : en dossier, les documents entrent
            par le circuit pièces, jamais par le chat (décision attach split). */}
        {horsDossier && onDropClick && (
          <button
            type="button"
            title="Joindre des fichiers"
            aria-label="Joindre des fichiers"
            className={iconBtnClass(disabled)}
            disabled={disabled}
            onClick={onDropClick}
          >
            <Paperclip className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      {/* Figma « Action buttons » : gap 2px. */}
      <div className="flex items-center gap-[2px] flex-shrink-0">
        {/* Conversion : lier le fil - pointillé, à gauche de la dictée. Ouvre un
            popover ancré (liste des dossiers) ; sinon retombe sur la modale
            onAttach(). Hors dossier seulement : en dossier le fil est déjà lié. */}
        {horsDossier && (onAttach || usePopover) && (
          <>
            <button
              ref={attachBtnRef}
              type="button"
              onClick={() => { if (disabled) return; if (usePopover) setAttachOpen(o => !o); else onAttach(); }}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[6px] text-[12.5px] font-medium transition-colors ${disabled ? 'opacity-30 cursor-not-allowed text-foreground-secondary' : attachOpen ? 'text-foreground bg-background' : 'text-foreground-secondary hover:text-foreground hover:bg-background'}`}
              style={{ border: `1px dashed ${colors.semantic.borderStrong}` }}
            >
              <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
              Lier à un dossier
            </button>
            {attachOpen && attachRect && createPortal(
              <div
                ref={attachMenuRef}
                className="fixed z-[100] border border-border rounded-[8px] overflow-hidden"
                style={{ left: attachRect.left, bottom: attachRect.bottom, width: attachRect.width, backgroundColor: colors.semantic.popover, boxShadow: shadows['2xl'] }}
              >
                <div
                  className="flex items-center px-[10px]"
                  style={{ height: 32, backgroundColor: colors.semantic.background, borderBottom: `1px solid ${colors.semantic.border}` }}
                >
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.mutedForeground, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lier à un dossier
                  </span>
                </div>
                <div className="p-1.5 max-h-[280px] overflow-y-auto">
                  {attachDossiers.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => { setAttachOpen(false); onAttachToDossier(d); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] hover:bg-background transition-colors"
                    >
                      <Folder className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                      <span className="flex-1 min-w-0 text-[13px] text-foreground truncate">{d.reference}</span>
                      {d.domaine && <span className="text-[11px] text-foreground-tertiary flex-shrink-0">{d.domaine}</span>}
                    </button>
                  ))}
                  {attachDossiers.length === 0 && (
                    <div className="px-2 py-2 text-[13px] text-foreground-tertiary">Aucun dossier ouvert.</div>
                  )}
                  {onCreateDossier && (
                    <div className="mt-1 pt-1 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={() => { setAttachOpen(false); onCreateDossier(); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-[6px] hover:bg-background transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-foreground-tertiary flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[13px] text-foreground">Nouveau dossier</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )}
          </>
        )}
        {/* Dictation: present, inert — it must not pretend to work. */}
        <span
          title="Dictée (à venir)"
          aria-label="Dictée (à venir)"
          aria-disabled="true"
          className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-[4px] text-foreground-muted cursor-default ${disabled ? 'opacity-30' : ''}`}
        >
          <Mic className="w-3.5 h-3.5" strokeWidth={1.75} />
        </span>
        {sendBtn}
      </div>
    </div>
  );
}
