import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';
import Badge from './Badge';
import { colors, radius, shadows } from '../../design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// LoiHoverCard - fiche d'identité d'un article de loi au survol d'une référence.
//
// Le survol donne l'aperçu (statut, extrait, date de création) sans quitter
// la lecture ; le clic « Voir l'article » ouvre la source complète (PreviewPanel
// kind « loi »), « Voir sur Legifrance » reste le lien externe de référence.
//
// Carte : relevé Figma HoverCard/LawArticles 37663:55696 (steward 25/09/2026) -
// en-tête dégradé crème, tampon de statut PLEIN (Badge success-solid /
// warning-solid / destructive), séparateur ticket, un champ « Créé le ».
// La référence inline (LoiRef) garde la famille TEXTE : violet.
//   <LoiHoverCard article={...} onOpen={...}><LoiRef>L. 1221-6</LoiRef></LoiHoverCard>
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

// Famille TEXTE (violet) - alignée sur COT_BADGE_TOKENS.TEXTE + accents.violet.
const TEXTE = {
  tileBg: colors.accents.violet.subtle,
  tileBorder: colors.accents.violet.border,
  ink: colors.accents.violet.base,
  text: colors.accents.violet.text,
};

// Statut de version - rendu par le Badge du DS (pas de tampon maison).
// Tampons PLEINS depuis le relevé 37663:55696 (success-solid / warning-solid).
const STATUT_BADGE = {
  vigueur: { variant: 'success-solid', label: 'En vigueur' },
  modifie: { variant: 'warning-solid', label: 'Modifié' },
  abroge:  { variant: 'destructive', label: 'Abrogé' },
};

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const el = document.createElement('style');
  el.textContent = `
@keyframes loi-pop {
  from { opacity: 0; transform: translateY(var(--loi-rise, 4px)) scale(0.985); }
  to   { opacity: 1; transform: none; }
}
.loi-ref {
  font: inherit; color: ${TEXTE.text}; background: none; border: none; padding: 0 1px;
  margin: 0 -1px; cursor: pointer; border-radius: 3px;
  text-decoration: underline dotted; text-decoration-color: ${TEXTE.tileBorder};
  text-underline-offset: 3px; text-decoration-thickness: 1px;
  transition: background 0.12s ease, text-decoration-color 0.12s ease;
}
.loi-ref:hover { background: ${TEXTE.tileBg}; text-decoration-style: solid; text-decoration-color: ${TEXTE.ink}; }
.loi-ref:focus-visible { outline: 2px solid ${TEXTE.ink}; outline-offset: 2px; }
.loi-card-link { color: ${colors.feedback.info.text}; }
.loi-card-link:hover { text-decoration: underline; text-underline-offset: 3px; }
`;
  document.head.appendChild(el);
}

// Référence inline dans la prose d'un acte - le déclencheur canonique.
export function LoiRef({ children, ...props }) {
  injectStyles();
  return (
    <button type="button" className="loi-ref" {...props}>{children}</button>
  );
}

// Source « loi » pour le PreviewPanel (kind loi) à partir d'une fiche article.
export const loiSourceOf = (a) => ({
  name: `${a.article} - ${a.code}`,
  loi: {
    code: a.code, article: a.article, enVigueur: a.version || a.creeLe,
    alineas: a.alineas || [{ text: a.extrait, cite: true }],
  },
  passage: { anchor: true },
});

// Texte riche : string, ou tableau mêlant strings et { loi, label }. Chaque
// référence devient un LoiRef survolable (fiche au survol, onOpenArticle au clic
// « Voir l'article »). Permet de citer des articles dans n'importe quelle prose
// (motifs d'une décision, corps Word d'un acte, alinéas d'un autre article).
export function LoiText({ text, onOpenArticle }) {
  if (!Array.isArray(text)) return text ?? null;
  return text.map((p, i) => {
    if (typeof p === 'string') return <React.Fragment key={i}>{p}</React.Fragment>;
    if (!p || !p.loi) return null;
    return (
      <LoiHoverCard key={i} article={p.loi} onOpen={onOpenArticle}>
        <LoiRef>{p.label || p.loi.article}</LoiRef>
      </LoiHoverCard>
    );
  });
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: colors.semantic.mutedForeground, marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.secondaryForeground, lineHeight: '16px' }}>{value}</div>
    </div>
  );
}

// La carte seule - aussi exposée en statique (labs, galeries d'états).
// Relevé Figma 37663:55696 : 380 de large, radius lg, ombre xl, en-tête en
// dégradé background -> popover, tampon plein, extrait 14/20, champ « Créé le ».
export function LoiCard({ article, onOpen, style }) {
  injectStyles();
  const st = STATUT_BADGE[article.statut] || STATUT_BADGE.vigueur;
  return (
    <div
      style={{
        width: 380, maxWidth: 'calc(100vw - 24px)', background: colors.semantic.popover,
        border: `1px solid ${colors.semantic.border}`, borderRadius: radius.lg,
        boxShadow: shadows.xl,
        overflow: 'hidden', textAlign: 'left', ...style,
      }}
    >
      {/* En-tête : intitulé serif + code + tampon de statut plein */}
      <div style={{ padding: '16px 16px 14px', display: 'flex', alignItems: 'flex-start', gap: 12, background: `linear-gradient(to top, ${colors.semantic.popover}, ${colors.semantic.background} 75%)` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, letterSpacing: '-0.6px', lineHeight: '28px', color: colors.semantic.foreground }}>{article.article}</div>
          <div style={{ fontSize: 12, lineHeight: '16px', letterSpacing: '0.12px', color: colors.semantic.mutedForeground }}>{article.code}</div>
        </div>
        <Badge variant={st.variant} label={st.label} style={{ flexShrink: 0 }} />
      </div>

      {/* Séparateur ticket */}
      <div style={{ borderTop: `1px dashed ${colors.semantic.border}`, margin: '0 16px' }} />

      {/* Extrait - 4 lignes max - puis la rangée d'actions */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: colors.semantic.secondaryForeground, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}>
          {article.extrait}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onOpen && (
            <button type="button" onClick={() => onOpen(article)} className="loi-card-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 14, lineHeight: '20px', fontWeight: 500, cursor: 'pointer' }}>
              Voir l'article
            </button>
          )}
          {article.url && (
            <a href={article.url} target="_blank" rel="noreferrer" className="loi-card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, lineHeight: '20px', fontWeight: 500, textDecoration: 'none' }}>
              Voir sur Legifrance <ExternalLink style={{ width: 16, height: 16 }} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      {/* Champ d'identité */}
      <div style={{ padding: 16, display: 'flex', alignItems: 'flex-start' }}>
        <Field label="Créé le" value={article.creeLe} />
      </div>
    </div>
  );
}

const OPEN_DELAY = 300;   // survol franc, pas un effleurement
const CLOSE_DELAY = 160;  // grâce pour traverser vers la carte
const GAP = 8;            // écart visuel trigger → carte (pont survolable)

export default function LoiHoverCard({ article, onOpen, children, openDelay = OPEN_DELAY, closeDelay = CLOSE_DELAY }) {
  injectStyles();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { left, top, place } | null
  const triggerRef = useRef(null);
  const cardRef = useRef(null);
  const timers = useRef({});

  const clearTimers = useCallback(() => {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.close);
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimeout(timers.current.close);
    if (!open) timers.current.open = setTimeout(() => setOpen(true), openDelay);
  }, [open, openDelay]);

  const scheduleClose = useCallback(() => {
    clearTimeout(timers.current.open);
    timers.current.close = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  const cancelClose = useCallback(() => clearTimeout(timers.current.close), []);

  useEffect(() => clearTimers, [clearTimers]);

  // Position : sous la référence, centrée et bornée au viewport ; bascule
  // au-dessus si la place manque. Mesure après rendu (carte invisible tant
  // que pos est null).
  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const t = triggerRef.current;
    const c = cardRef.current;
    if (!t || !c) return;
    const r = t.getBoundingClientRect();
    const cw = c.offsetWidth;
    const ch = c.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), Math.max(12, vw - cw - 12));
    const below = r.bottom + GAP + ch <= vh - 12;
    setPos(below
      ? { left, top: r.bottom, place: 'bottom' }
      : { left, top: r.top - ch - GAP, place: 'top' });
  }, [open]);

  // Échap ferme ; le scroll ferme (la carte est en position fixe).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const place = pos?.place || 'bottom';

  return (
    <>
      <span
        ref={triggerRef}
        style={{ display: 'inline' }}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
      >
        {children}
      </span>
      {open && createPortal(
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed', zIndex: 90,
            left: pos?.left ?? 0, top: pos?.top ?? 0,
            visibility: pos ? 'visible' : 'hidden',
            paddingTop: place === 'bottom' ? GAP : 0,
            paddingBottom: place === 'top' ? GAP : 0,
          }}
        >
          <div
            ref={cardRef}
            style={pos ? { animation: 'loi-pop 0.16s ease-out', '--loi-rise': place === 'top' ? '-4px' : '4px' } : undefined}
          >
            <LoiCard article={article} onOpen={onOpen} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
