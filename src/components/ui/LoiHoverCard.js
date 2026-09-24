import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';
import Badge from './Badge';
import { colors, shadows } from '../../design-system/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// LoiHoverCard - fiche d'identité d'un article de loi au survol d'une référence.
//
// Le survol donne l'aperçu (statut, extrait, repères de version) sans quitter
// la lecture ; le clic « Voir l'article » ouvre la source complète (PreviewPanel
// kind « loi »), Légifrance reste le lien externe de référence.
//
// Famille TEXTE du système de badges : violet + glyphe §.
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
const STATUT_BADGE = {
  vigueur: { variant: 'success', label: 'En vigueur' },
  modifie: { variant: 'warning', label: 'Modifié' },
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
.loi-card-open { color: ${TEXTE.text}; }
.loi-card-open:hover { text-decoration: underline; text-underline-offset: 3px; }
.loi-card-legifrance { color: ${colors.semantic.mutedForeground}; }
.loi-card-legifrance:hover { color: ${colors.semantic.foreground}; }
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

function Field({ label, value, full }) {
  if (!value) return null;
  return (
    <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.semantic.mutedForeground, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.secondaryForeground, lineHeight: '16px' }}>{value}</div>
    </div>
  );
}

// La carte seule - aussi exposée en statique (labs, galeries d'états).
export function LoiCard({ article, onOpen, style }) {
  injectStyles();
  const st = STATUT_BADGE[article.statut] || STATUT_BADGE.vigueur;
  return (
    <div
      style={{
        width: 380, maxWidth: 'calc(100vw - 24px)', background: colors.semantic.popover,
        border: `1px solid ${colors.semantic.border}`, borderRadius: 12,
        boxShadow: shadows['2xl'],
        overflow: 'hidden', textAlign: 'left', ...style,
      }}
    >
      {/* En-tête : glyphe §, intitulé serif, tampon de statut */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span aria-hidden style={{ width: 26, height: 26, borderRadius: 7, background: TEXTE.tileBg, border: `1px solid ${TEXTE.tileBorder}`, color: TEXTE.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>§</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, letterSpacing: '-0.3px', lineHeight: '22px', color: colors.semantic.foreground }}>{article.article}</div>
          <div style={{ fontSize: 12, color: colors.semantic.mutedForeground, marginTop: 1 }}>{article.code}</div>
        </div>
        <Badge variant={st.variant} label={st.label} style={{ flexShrink: 0, marginTop: 2 }} />
      </div>

      {/* Séparateur ticket */}
      <div style={{ borderTop: `1px dashed ${colors.semantic.border}`, margin: '0 16px' }} />

      {/* Extrait - 4 lignes max, puis ouverture de la source */}
      <div style={{ padding: '11px 16px 0' }}>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: '19px', color: colors.semantic.secondaryForeground, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' }}>
          {article.extrait}
        </p>
        {onOpen && (
          <button type="button" onClick={() => onOpen(article)} className="loi-card-open" style={{ background: 'none', border: 'none', padding: 0, marginTop: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            Voir l'article
          </button>
        )}
      </div>

      {/* Champs d'identité - grille façon pass card */}
      <div style={{ padding: '11px 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 12px' }}>
        <Field label="Créé le" value={article.creeLe} />
        <Field label="Version du" value={article.version} />
        <Field label="Modifié par" value={article.modifiePar} full />
        <Field label="Abrogé par" value={article.abrogePar} full />
      </div>

      {/* Pied : identifiant Légifrance + lien externe */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 16px', borderTop: `1px solid ${colors.semantic.border}`, background: colors.semantic.background }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: colors.semantic.foregroundMuted, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{article.legifranceId}</span>
        {article.url && (
          <a href={article.url} target="_blank" rel="noreferrer" className="loi-card-legifrance" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 500, textDecoration: 'none', flexShrink: 0, transition: 'color 0.12s ease' }}>
            <ExternalLink style={{ width: 11, height: 11 }} strokeWidth={1.75} /> Légifrance
          </a>
        )}
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
