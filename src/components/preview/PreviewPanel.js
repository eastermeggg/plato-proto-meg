import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText, LayoutTemplate, Scale, Mail, BookText, Calculator, Globe,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Calendar, Hash,
  Sparkles, Scissors, Download, Trash2, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ExternalLink, Search, ArrowDownToLine, Paperclip, User, Pencil, Check,
} from 'lucide-react';
import Input from '../ui/Input';

// ─────────────────────────────────────────────────────────────────────────────
// PreviewPanel - le panneau de preview systématisé (fusion preview-doc + panel)
//
// Un seul « shell » (barre de titre · métadonnées · corps · pied) dont TROIS
// zones sont pluggables selon le type de source citée. Il réunit :
//   · du lab preview-doc  → le viewer confortable (zoom, plein écran, nav fluide),
//     les métadonnées en HEADER vs SIDE, le mode lecture/édition, le résumé IA.
//   · du lab preview-panel → la déclinaison par type (piece, modele, jp, email,
//     loi, ligne, web) et le contrat « aller à la citation ».
//
// Contrat commun : `source.passages` (ou `passage`) décrit le/les endroit(s) que
// la citation vise. À l'ouverture, le panneau surligne tous les passages, défile
// jusqu'au chunk actif, et un stepper « Citation i / N » les enchaîne.
//
// Types :
//   piece  · document client paginé   modele · modèle paginé
//   jp     · décision de justice        email  · fil d'emails importé
//   loi    · article de loi (court)     ligne  · ligne structurée (cotisation…)
//   web    · lien externe (pas de panneau)
//
// Rendu documentaire = « skeleton » (pas de moteur PDF) ; en prod une lib
// (react-pdf / pdf.js) porterait le rendu, l'UX zoom / scroll / surlignage identique.
// ─────────────────────────────────────────────────────────────────────────────

const HL = '#fde68a'; // surlignage citation (cohérent avec DecisionDrawer)

// ── Petits blocs partagés ────────────────────────────────────────────────────

function MetaChip({ icon, label, value, ai }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background-canvas border border-border text-[13px] text-foreground-secondary">
      {icon && <span className="text-foreground-muted">{icon}</span>}
      {label && <span className="text-foreground-muted">{label}</span>}
      <span className="text-foreground">{value}</span>
      {ai && <Sparkles className="w-3 h-3" strokeWidth={2} style={{ color: '#9333ea' }} />}
    </span>
  );
}

function AiMark() {
  return <Sparkles className="inline w-3 h-3 ml-1 align-[-1px]" strokeWidth={2} style={{ color: '#9333ea' }} />;
}

function FieldLabel({ children }) {
  return (
    <p
      className="text-foreground-secondary"
      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}
    >
      {children}
    </p>
  );
}

// Champ lecture seule (side panel).
function Field({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2 h-9 px-3 bg-white border border-border rounded-lg shadow-xs text-[14px] text-foreground">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

// Bandeau surligné réutilisable : contient l'extrait cité, ancré pour le scroll.
function Citation({ children }) {
  return (
    <div
      data-cite="1"
      className="rounded-md px-3 py-2 my-1 text-[13px] leading-6 text-foreground scroll-mt-6"
      style={{ background: HL, boxShadow: `inset 3px 0 0 #d97706` }}
    >
      {children}
    </div>
  );
}

// Badge autorité juridique (cotisations) - 5 teintes + neutre, aligné mémoire.
const AUTHORITY = {
  urssaf: { label: 'URSSAF', bg: '#eff6ff', fg: '#1e40af' },
  boss: { label: 'BOSS', bg: '#f5f3ff', fg: '#6d28d9' },
  impots: { label: 'Impôts', bg: '#ecfdf5', fg: '#047857' },
  code: { label: 'Code du travail', bg: '#fff7ed', fg: '#c2410c' },
  conv: { label: 'Convention collective', bg: '#fdf2f8', fg: '#be185d' },
  none: { label: '-', bg: '#f5f5f4', fg: '#78716c' },
};
function AuthorityBadge({ authority }) {
  const a = AUTHORITY[authority] || AUTHORITY.none;
  return (
    <span className="inline-flex items-center h-7 px-2.5 rounded-md text-[13px] font-medium" style={{ background: a.bg, color: a.fg }}>
      {a.label}
    </span>
  );
}

// Callout « document découpé » réutilisé en header (édition) et side panel.
function SplitCallout({ split }) {
  return (
    <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
        <Scissors className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] leading-5 font-medium text-foreground">Document découpé</div>
        <div className="text-[12px] text-foreground-secondary truncate" title={split.source}>{split.source}</div>
      </div>
      <button className="text-[13px] font-medium hover:underline flex-shrink-0" style={{ color: '#1e3a8a' }}>Ajuster</button>
    </div>
  );
}

// Callout « issu d'un email » - provenance d'une pièce importée depuis un fil.
// `prov.open` = target { kind, source } passé à onOpenSource pour ouvrir l'email.
function ProvenanceCallout({ prov, onOpen }) {
  return (
    <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
        <Mail className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] leading-5 font-medium text-foreground">Issu d'un email</div>
        <div className="text-[12px] text-foreground-secondary truncate" title={prov.subject}>
          {prov.subject}{prov.from ? ` · ${prov.from}` : ''}{prov.date ? ` · ${prov.date}` : ''}
        </div>
      </div>
      {prov.open && (
        <button onClick={() => onOpen(prov.open)} className="text-[13px] font-medium hover:underline flex-shrink-0" style={{ color: '#1e3a8a' }}>Voir l'email</button>
      )}
    </div>
  );
}

// ── Corps « document » (piece + modele) : pages skeleton + surlignage passage ─

// `quotes` = extraits cités présents SUR cette page (un doc peut en porter
// plusieurs, sur des pages différentes ou la même). Chacun est ancré data-cite.
function DocPage({ title, date, pageNo, totalPages, width, quotes = [] }) {
  const seed = (title || '').length + pageNo * 13 + 7;
  const rows = Array.from({ length: 34 }, (_, i) => 0.5 + ((seed + i * 17) % 45) / 100);
  const insert = {};
  quotes.forEach((q, k) => { insert[8 + k * 9] = q; });
  return (
    <div
      className="relative bg-white rounded-md shadow-md border border-border shrink-0 overflow-hidden"
      style={{ width, aspectRatio: '1 / 1.414', containerType: 'inline-size' }}
      data-page={pageNo}
    >
      {pageNo === 1 && (
        <div style={{ padding: '7cqw 8cqw 3cqw' }}>
          <div className="font-semibold text-foreground-tertiary leading-snug" style={{ fontSize: '3cqw' }}>{title}</div>
          {date && <div className="text-foreground-muted mt-1 tabular-nums" style={{ fontSize: '2.2cqw' }}>{date}</div>}
        </div>
      )}
      <div style={{ padding: `${pageNo === 1 ? 0 : '9cqw'} 8cqw 0`, display: 'flex', flexDirection: 'column', gap: '1.5cqw' }}>
        {rows.map((w, i) =>
          insert[i] ? (
            <div
              key={`c${i}`}
              data-cite="1"
              className="rounded-sm text-foreground scroll-mt-6"
              style={{ background: HL, boxShadow: `inset 3px 0 0 #d97706`, padding: '2cqw 2.5cqw', margin: '1cqw 0', fontSize: '2.4cqw', lineHeight: 1.5 }}
            >
              {insert[i]}
            </div>
          ) : (
            <div key={i} className="rounded-full" style={{ height: '1.1cqw', width: `${Math.round(w * 100)}%`, background: i % 7 === 6 ? 'transparent' : '#f1f0ee' }} />
          )
        )}
      </div>
      <div className="absolute left-0 right-0 text-center text-foreground-muted tabular-nums" style={{ bottom: '3cqw', fontSize: '2cqw' }}>
        {pageNo} / {totalPages}
      </div>
    </div>
  );
}

function DocBody({ source, pageWidth, scrollRef, onScroll }) {
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const byPage = {};
  passages.forEach((p) => { (byPage[p.page] || (byPage[p.page] = [])).push(p.quote); });
  return (
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto min-w-0">
      <div className="flex flex-col items-center gap-5 py-8 px-8">
        {Array.from({ length: source.pages }, (_, i) => (
          <DocPage
            key={i}
            title={source.name}
            date={source.date}
            pageNo={i + 1}
            totalPages={source.pages}
            width={pageWidth}
            quotes={byPage[i + 1] || []}
          />
        ))}
      </div>
    </div>
  );
}

// ── Corps « décision de justice » ────────────────────────────────────────────

function JpBody({ source, scrollRef }) {
  const s = source.jp || {};
  const Section = ({ title, children }) => (
    <div className="mb-5">
      <FieldLabel>{title}</FieldLabel>
      <div className="mt-2 space-y-2 text-[13.5px] leading-6 text-foreground-secondary">{children}</div>
    </div>
  );
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0">
      <div className="max-w-[720px] mx-auto py-8 px-8">
        <div className="text-center mb-6">
          <div className="text-[15px] font-semibold text-foreground-strong">{s.juridiction}</div>
          <div className="text-[13px] text-foreground-muted mt-0.5 tabular-nums">{s.date} · n° {s.numero}</div>
        </div>
        <Section title="Faits et procédure"><p>{s.faits}</p></Section>
        <Section title="Moyens"><p>{s.moyens}</p></Section>
        <Section title="Motifs">
          {(s.motifs || []).map((m, i) => (m.cite ? <Citation key={i}>{m.text}</Citation> : <p key={i}>{m.text}</p>))}
        </Section>
        <Section title="Dispositif"><p>{s.dispositif}</p></Section>
      </div>
    </div>
  );
}

// ── Corps « fil d'emails » ───────────────────────────────────────────────────

// Normalise une pièce jointe : string → { name } ; objet → tel quel. Une PJ avec
// `.source` est prévisualisable (clic → onOpen({ kind:'piece', source })).
function normAtt(a) {
  return typeof a === 'string' ? { name: a } : a;
}

function EmailBody({ source, scrollRef, onOpen }) {
  const msgs = source.email?.messages || [];
  // Toutes les PJ du fil, à plat, pour la liste consolidée en tête.
  const allAtts = msgs.flatMap((m) => (m.attachments || []).map((a) => ({ ...normAtt(a), from: m.from, date: m.date })));

  const AttButton = ({ att, className }) => (
    <button
      onClick={() => att.source && onOpen({ kind: 'piece', source: att.source })}
      disabled={!att.source}
      className={className}
      title={att.source ? 'Prévisualiser' : att.name}
    >
      <Paperclip className="w-3 h-3 text-foreground-muted flex-shrink-0" strokeWidth={1.75} /> {att.name}
    </button>
  );

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0 bg-background-canvas">
      <div className="max-w-[720px] mx-auto py-6 px-6 space-y-3">
        {/* Liste consolidée des pièces jointes du fil - prévisualisables */}
        {allAtts.length > 0 && (
          <div className="rounded-xl border border-border bg-white p-4">
            <FieldLabel>Pièces jointes du fil ({allAtts.length})</FieldLabel>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {allAtts.map((a, i) => (
                <button
                  key={i}
                  onClick={() => a.source && onOpen({ kind: 'piece', source: a.source })}
                  disabled={!a.source}
                  className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-cream disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-cream text-foreground-tertiary flex-shrink-0">
                    <FileText className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-foreground truncate">{a.name}</div>
                    <div className="text-[11.5px] text-foreground-muted truncate">{a.from} · {a.date}</div>
                  </div>
                  {a.source && <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => {
          const inner = (
            <div className={`rounded-xl border bg-white p-4 ${m.cite ? 'border-transparent' : 'border-border'}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream text-foreground-tertiary flex-shrink-0">
                  <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground truncate">{m.from}</div>
                  <div className="text-[11.5px] text-foreground-muted truncate">à {m.to}</div>
                </div>
                <div className="text-[11.5px] text-foreground-muted tabular-nums flex-shrink-0">{m.date}</div>
              </div>
              <p className="text-[13.5px] leading-6 text-foreground-secondary whitespace-pre-line">{m.body}</p>
              {m.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.attachments.map((a, j) => (
                    <AttButton
                      key={j}
                      att={normAtt(a)}
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background border border-border text-[12px] text-foreground-secondary transition-colors hover:bg-cream hover:text-foreground disabled:hover:bg-background disabled:hover:text-foreground-secondary"
                    />
                  ))}
                </div>
              )}
            </div>
          );
          return m.cite
            ? <div key={i} data-cite="1" className="rounded-xl scroll-mt-6" style={{ boxShadow: `0 0 0 2px ${HL}` }}>{inner}</div>
            : <div key={i}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

// ── Corps « article de loi » (court, non paginé) ─────────────────────────────

function LoiBody({ source, scrollRef }) {
  const l = source.loi || {};
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0">
      <div className="max-w-[680px] mx-auto py-8 px-8">
        <div className="text-[15px] font-semibold text-foreground-strong">{l.article}</div>
        <div className="text-[12.5px] text-foreground-muted mt-1">{l.code} · Version en vigueur au {l.enVigueur}</div>
        <div className="h-px bg-border my-5" />
        <div className="space-y-3 text-[13.5px] leading-6 text-foreground-secondary">
          {(l.alineas || []).map((a, i) => (a.cite ? <Citation key={i}>{a.text}</Citation> : <p key={i}>{a.text}</p>))}
        </div>
      </div>
    </div>
  );
}

// ── Corps « ligne structurée » (cotisation / relevé) ─────────────────────────

function LigneBody({ source, scrollRef }) {
  const g = source.ligne || {};
  return (
    <div ref={scrollRef} className="flex-1 overflow-auto min-w-0 bg-background-canvas">
      <div className="max-w-[760px] mx-auto py-8 px-8">
        {g.regle && (
          <div className="rounded-xl border border-border bg-white p-4 mb-5">
            <FieldLabel>Règle appliquée</FieldLabel>
            <p className="mt-2 text-[13.5px] leading-6 text-foreground-secondary">{g.regle}</p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] text-[11px] font-medium uppercase tracking-wide text-foreground-muted bg-cream border-b border-border" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <div className="px-4 py-2">Libellé</div>
            <div className="px-4 py-2 text-right">Base</div>
            <div className="px-4 py-2 text-right">Montant</div>
          </div>
          {(g.rows || []).map((r, i) => (
            <div
              key={i}
              {...(r.cite ? { 'data-cite': '1' } : {})}
              className={`grid grid-cols-[1fr_auto_auto] text-[13px] border-b border-border last:border-0 scroll-mt-6 ${r.cite ? '' : 'text-foreground-secondary'}`}
              style={r.cite ? { background: HL, boxShadow: 'inset 3px 0 0 #d97706' } : undefined}
            >
              <div className={`px-4 py-2.5 ${r.cite ? 'text-foreground font-medium' : ''}`}>{r.label}</div>
              <div className="px-4 py-2.5 text-right tabular-nums">{r.base}</div>
              <div className={`px-4 py-2.5 text-right tabular-nums ${r.cite ? 'text-foreground font-medium' : ''}`}>{r.montant}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Registre des types ───────────────────────────────────────────────────────

export const PREVIEW_KINDS = {
  piece: { label: 'Pièce', icon: FileText, accent: { bg: '#f5f3ef', fg: '#57534e' }, footer: 'doc', opens: 'Previewer interne (drawer à gauche du chat)', body: 'doc' },
  modele: { label: 'Modèle', icon: LayoutTemplate, accent: { bg: '#eef2ff', fg: '#4338ca' }, footer: 'doc', opens: 'Previewer interne (modèle)', body: 'doc' },
  jp: { label: 'Jurisprudence', icon: Scale, accent: { bg: '#eff6ff', fg: '#1e3a8a' }, footer: 'passage', opens: 'DecisionDrawer interne + lien Légifrance/Judilibre', body: 'jp', link: 'Légifrance' },
  email: { label: 'Email', icon: Mail, accent: { bg: '#fffbeb', fg: '#b45309' }, footer: 'passage', opens: 'Panneau fil (drawer import), ancré sur le message', body: 'email' },
  loi: { label: 'Article de loi', icon: BookText, accent: { bg: '#f5f3ff', fg: '#6d28d9' }, footer: 'none', opens: 'Panneau léger interne (version à la date)', body: 'loi', link: 'Légifrance' },
  ligne: { label: 'Cotisation / relevé', icon: Calculator, accent: { bg: '#ecfeff', fg: '#0e7490' }, footer: 'none', opens: 'Vue structurée interne, ligne surlignée', body: 'ligne', link: 'BOSS' },
  web: { label: 'Lien web', icon: Globe, accent: { bg: '#f5f5f4', fg: '#57534e' }, footer: 'none', opens: 'Lien externe (nouvel onglet) - pas de panneau', body: 'external' },
};

// Enchaîne les passages cités d'un même document. 1 chunk → bouton simple ;
// plusieurs → stepper « Citation i / N » avec flèches.
function CiteNav({ count, active, onGo, onStep }) {
  if (count <= 0) return null;
  if (count === 1) {
    return (
      <button onClick={() => onGo(0)} className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
        <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={1.75} /> Aller à la citation
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-0.5">
      <button onClick={() => onStep(-1)} disabled={active <= 0} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Citation précédente">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-caption text-foreground-secondary tabular-nums px-1 whitespace-nowrap">Citation {active + 1} / {count}</span>
      <button onClick={() => onStep(1)} disabled={active >= count - 1} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none" aria-label="Citation suivante">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

const ZOOM_STEPS = [50, 67, 80, 100, 125, 150, 200];

// ── Le shell systématisé ─────────────────────────────────────────────────────

export default function PreviewPanel({
  kind,
  source,
  onClose,
  onPrev,
  onNext,
  navIndex,
  navTotal,
  embedded = false,
  metaLayout = 'header', // 'header' | 'side' (docs uniquement)
  onOpenSource,          // (target { kind, source }) => void - navigation croisée
}) {
  const cfg = PREVIEW_KINDS[kind] || PREVIEW_KINDS.piece;
  const Icon = cfg.icon;
  const isDoc = cfg.body === 'doc';
  const openSource = (t) => { if (t && onOpenSource) onOpenSource(t); };

  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const scrollRef = useRef(null);

  // Layout des métadonnées : header (défaut) ou side panel. Réservé aux docs ;
  // les autres types restent en header (chips).
  const layout = isDoc ? metaLayout : 'header';
  const showHeader = layout === 'header';
  const showSide = isDoc && layout === 'side';

  const [fitPx, setFitPx] = useState(640);
  useEffect(() => {
    if (!fitWidth || !isDoc) return;
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setFitPx(Math.max(320, Math.min(el.clientWidth - 64, 900)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitWidth, fullscreen, isDoc, showSide]);

  const pageWidth = fitWidth ? fitPx : Math.round(640 * (zoom / 100));

  // ── Contrat « citation » ── Un doc peut porter plusieurs passages (chunks) :
  // tous surlignés, un stepper les enchaîne, le chunk actif reçoit un liseré.
  // Ordre = ordre du DOM (page, puis position).
  const passages = source.passages || (source.passage ? [source.passage] : []);
  const [activeCite, setActiveCite] = useState(0);
  const [citeCount, setCiteCount] = useState(passages.length);

  const goToCite = useCallback((idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const cites = el.querySelectorAll('[data-cite]');
    if (!cites.length) return;
    const i = Math.max(0, Math.min(cites.length - 1, idx));
    setActiveCite(i);
    cites.forEach((n, k) => {
      n.style.outline = k === i ? '2px solid #d97706' : 'none';
      n.style.outlineOffset = '1px';
    });
    cites[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (!passages.length) return;
    const t = setTimeout(() => {
      const el = scrollRef.current;
      const cites = el ? el.querySelectorAll('[data-cite]') : [];
      setCiteCount(cites.length);
      goToCite(source.activePassage || 0);
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, goToCite]);

  const stepZoom = (dir) => {
    setFitWidth(false);
    setZoom((z) => {
      const idx = ZOOM_STEPS.reduce((best, v, i) => (Math.abs(v - z) < Math.abs(ZOOM_STEPS[best] - z) ? i : best), 0);
      return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir))];
    });
  };
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    let cur = 1;
    el.querySelectorAll('[data-page]').forEach((p) => { if (p.offsetTop <= mid) cur = Number(p.dataset.page); });
    setCurrentPage(cur);
  }, []);
  const goToPage = (n) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-page="${n}"]`);
    if (target) el.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  };

  // ── Métadonnées documents : lecture (chips) / édition (Inputs) ──
  const docReadChips = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {kind === 'piece' ? (
          <>
            <span className="inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-md bg-cream border border-border text-[13px] text-foreground-secondary">
              <Hash className="w-3.5 h-3.5 text-foreground-muted" strokeWidth={1.75} />
              <span className="text-foreground-muted">Pièce</span>
              <span className="font-medium text-foreground">{source.section}</span>
              <span className="text-foreground-muted">·</span>
              <span className="font-medium text-foreground tabular-nums">n° {source.numero}</span>
            </span>
            <MetaChip icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />} label="Date" value={source.date} ai />
            <MetaChip label="Type" value={source.type} />
          </>
        ) : (
          <>
            {source.category && <MetaChip label="Catégorie" value={source.category} />}
            <MetaChip icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />} label="Mise à jour" value={source.date} />
            {source.variables != null && <MetaChip label="Variables" value={source.variables} />}
          </>
        )}
        {source.split && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background-canvas border border-border text-[13px] text-foreground-secondary min-w-0">
            <Scissors className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            Document découpé
            {source.split.source && <span className="text-foreground-muted truncate max-w-[160px]" title={source.split.source}>· {source.split.source}</span>}
            <button className="ml-0.5 font-medium hover:underline underline-offset-2 flex-shrink-0" style={{ color: '#1e3a8a' }}>Ajuster</button>
          </span>
        )}
        {source.provenance && (
          <button
            onClick={() => openSource(source.provenance.open)}
            disabled={!source.provenance.open}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background-canvas border border-border text-[13px] text-foreground-secondary min-w-0 transition-colors hover:text-foreground hover:border-stone-300 disabled:hover:text-foreground-secondary disabled:hover:border-border"
          >
            <Mail className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            Issu de l'email
            {source.provenance.subject && <span className="text-foreground-muted truncate max-w-[180px]" title={source.provenance.subject}>· {source.provenance.subject}</span>}
          </button>
        )}
      </div>
      {source.summary && (
        <div className="flex items-start gap-1.5">
          <p
            className="text-[13px] leading-5 text-foreground-secondary min-w-0 flex-1"
            style={metaExpanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            title={source.summary}
          >
            {source.summary}
          </p>
          <button onClick={() => setMetaExpanded((v) => !v)} className="flex-shrink-0 inline-flex items-center gap-0.5 text-[12px] text-foreground-muted hover:text-foreground-secondary transition-colors mt-0.5">
            {metaExpanded ? <>Réduire <ChevronUp className="w-3 h-3" /></> : <>Détails <ChevronDown className="w-3 h-3" /></>}
          </button>
        </div>
      )}
    </div>
  );

  const docEditInputs = () => (
    <div className="flex flex-col gap-3.5" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <FieldLabel>Informations du document</FieldLabel>
      <Input label="Nom du document" aiGenerated defaultValue={source.name} />
      <div className="flex gap-3">
        {kind === 'piece' ? (
          <Input label="Type" className="flex-1">
            <div className="relative">
              <select defaultValue={source.type} className="w-full h-9 pl-3 pr-8 bg-white border border-border rounded-lg shadow-xs text-[14px] text-foreground outline-none appearance-none focus:border-stone-400">
                {['Rapport', 'Correspondance', 'Facture', 'Certificat médical', 'Autre'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </Input>
        ) : (
          <Input label="Catégorie" className="flex-1" defaultValue={source.category} />
        )}
        <Input label={kind === 'piece' ? 'Date du document' : 'Mise à jour'} aiGenerated={kind === 'piece'} className="flex-1">
          <div className="flex items-center gap-2 h-9 px-3 bg-white border border-border rounded-lg shadow-xs focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-200">
            <Calendar className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
            <input defaultValue={source.date} placeholder="jj/mm/aaaa" className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground" />
          </div>
        </Input>
      </div>
      {source.split && <SplitCallout split={source.split} />}
      {source.provenance && <ProvenanceCallout prov={source.provenance} onOpen={openSource} />}
      {kind === 'piece' && (
        <>
          <div className="h-px bg-border -mx-4" />
          <FieldLabel>Numérotation de la pièce</FieldLabel>
          <div className="flex gap-3">
            <Input label="Section" className="flex-1" defaultValue={source.section} />
            <Input label="Numéro" className="flex-1" defaultValue={source.numero} />
          </div>
        </>
      )}
    </div>
  );

  const docSidePanel = () => (
    <div className="w-[320px] border-l border-border bg-white flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-5 flex flex-col gap-4">
        <FieldLabel>Informations du document</FieldLabel>
        <Field label={<>Nom du document<AiMark /></>} value={source.name} />
        {source.split && <SplitCallout split={source.split} />}
        {source.provenance && <ProvenanceCallout prov={source.provenance} onOpen={openSource} />}
        {source.summary && <p className="px-0.5 text-[12px] leading-5 text-foreground-secondary">{source.summary}</p>}
        {kind === 'piece' ? (
          <>
            <Field label="Type" value={source.type} />
            <Field label={<>Date du document<AiMark /></>} value={source.date} icon={<Calendar className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />} />
          </>
        ) : (
          <>
            {source.category && <Field label="Catégorie" value={source.category} />}
            <Field label="Mise à jour" value={source.date} icon={<Calendar className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />} />
          </>
        )}
      </div>
      {kind === 'piece' && (
        <>
          <div className="h-px bg-border mx-5" />
          <div className="p-5 flex flex-col gap-4">
            <FieldLabel>Numérotation de la pièce</FieldLabel>
            <div className="flex gap-4">
              <div className="flex-1"><Field label="Section" value={source.section} /></div>
              <div className="flex-1"><Field label="Numéro" value={source.numero} /></div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ── Métadonnées non-doc (jp / email / loi / ligne) : chips par type ──
  const otherMeta = () => {
    if (kind === 'jp') {
      const s = source.jp || {};
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Juridiction" value={s.juridiction} />
          <MetaChip icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />} label="Date" value={s.date} />
          <MetaChip icon={<Hash className="w-3.5 h-3.5" strokeWidth={1.75} />} value={`n° ${s.numero}`} />
          {s.quantum && <span className="inline-flex items-center h-7 px-2.5 rounded-md text-[13px] font-medium" style={{ background: '#eff6ff', color: '#1e3a8a' }}>{s.quantum}</span>}
        </div>
      );
    }
    if (kind === 'email') {
      const e = source.email || {};
      const attCount = (e.messages || []).reduce((n, m) => n + (m.attachments?.length || 0), 0);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Objet" value={e.subject} />
          <MetaChip label="Messages" value={e.messages?.length} />
          {attCount > 0 && <MetaChip icon={<Paperclip className="w-3.5 h-3.5" strokeWidth={1.75} />} label="Pièces jointes" value={attCount} />}
        </div>
      );
    }
    if (kind === 'loi') {
      const l = source.loi || {};
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <MetaChip label="Code" value={l.code} />
          <MetaChip icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />} label="En vigueur au" value={l.enVigueur} />
        </div>
      );
    }
    if (kind === 'ligne') {
      const g = source.ligne || {};
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <AuthorityBadge authority={g.authority} />
          {g.periode && <MetaChip label="Période" value={g.periode} />}
        </div>
      );
    }
    return null;
  };

  const renderBody = () => {
    if (cfg.body === 'doc') {
      return (
        <>
          <DocBody source={source} pageWidth={pageWidth} scrollRef={scrollRef} onScroll={onScroll} />
          {showSide && docSidePanel()}
        </>
      );
    }
    if (cfg.body === 'jp') return <JpBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'email') return <EmailBody source={source} scrollRef={scrollRef} onOpen={openSource} />;
    if (cfg.body === 'loi') return <LoiBody source={source} scrollRef={scrollRef} />;
    if (cfg.body === 'ligne') return <LigneBody source={source} scrollRef={scrollRef} />;
    return null;
  };

  return (
    <div
      className={`bg-background-canvas flex flex-col overflow-hidden ${
        fullscreen ? 'fixed inset-0 z-50' : embedded ? 'relative rounded-xl border border-border shadow-sm h-[720px]' : 'relative h-full w-full'
      }`}
      style={{ animation: fullscreen ? 'fadeIn 0.15s ease-out' : undefined }}
    >
      {/* ── Barre de titre ── */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0" style={{ background: cfg.accent.bg, color: cfg.accent.fg }}>
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", color: cfg.accent.fg }}>{cfg.label}</span>
          <span className="text-body-medium text-foreground-strong truncate">{source.name}</span>
        </div>
        <div className="flex items-center flex-shrink-0">
          {navTotal > 1 && (
            <>
              <div className="flex items-center gap-1 pr-2">
                <button onClick={onPrev} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Précédent">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-caption text-foreground-muted min-w-[38px] text-center tabular-nums">{navIndex} / {navTotal}</span>
                <button onClick={onNext} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Suivant">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="w-px h-5 bg-border" />
            </>
          )}
          <div className="flex items-center gap-1.5 px-2">
            {cfg.link && (
              <button type="button" className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} /> {cfg.link}
              </button>
            )}
            {isDoc && showHeader && (
              <button
                onClick={() => setEditing((v) => !v)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium transition-colors ${editing ? 'bg-cream text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-cream'}`}
              >
                {editing ? <><Check className="w-3.5 h-3.5" strokeWidth={2} /> Terminé</> : <><Pencil className="w-3.5 h-3.5" strokeWidth={1.75} /> Modifier</>}
              </button>
            )}
            {isDoc && (
              <>
                <div className="relative">
                  <button onClick={() => setDownloadOpen((o) => !o)} className="h-8 px-3 rounded-lg bg-foreground text-white hover:bg-foreground-tertiary transition-colors flex items-center gap-1.5 text-[13px] font-medium">
                    <Download className="w-3.5 h-3.5" strokeWidth={1.75} /> Télécharger
                    <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${downloadOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {downloadOpen && (
                    <div className="absolute right-0 top-full mt-1.5 min-w-[210px] bg-white border border-border rounded-lg shadow-lg py-1 z-20">
                      <button onClick={() => setDownloadOpen(false)} className="w-full text-left px-3 py-1.5 text-body text-foreground-tertiary hover:bg-background transition-colors flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-foreground-muted" strokeWidth={1.75} /> Document original
                      </button>
                    </div>
                  )}
                </div>
                <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground-muted hover:text-[#7f1d1d] hover:bg-[#fee2e2] transition-colors" aria-label="Supprimer" title="Supprimer">
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>
          <span className="w-px h-5 bg-border" />
          <button onClick={onClose} className="ml-2 p-1 text-foreground-muted hover:text-foreground-secondary hover:bg-cream rounded-md transition-colors" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Header métadonnées (docs: header layout ; autres types: toujours) ── */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-border bg-white flex-shrink-0">
          {isDoc ? (editing ? docEditInputs() : docReadChips()) : otherMeta()}
        </div>
      )}

      {/* ── Corps (+ side panel métadonnées pour la variante side des docs) ── */}
      <div className="flex flex-1 min-h-0">{renderBody()}</div>

      {/* ── Pied ── */}
      {cfg.footer === 'doc' && (
        <div className="px-3 py-2 border-t border-border bg-white flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => stepZoom(-1)} className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Dézoomer">
              <ZoomOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button onClick={() => setFitWidth((f) => !f)} className="px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors min-w-[62px] text-center tabular-nums">
              {fitWidth ? 'Ajusté' : `${zoom}%`}
            </button>
            <button onClick={() => stepZoom(1)} className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Zoomer">
              <ZoomIn className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <span className="w-px h-4 bg-border mx-1" />
            <button onClick={() => setFullscreen((f) => !f)} className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors">
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {fullscreen ? 'Réduire' : 'Plein écran'}
            </button>
            {citeCount > 0 && (
              <>
                <span className="w-px h-4 bg-border mx-1" />
                <CiteNav count={citeCount} active={activeCite} onGo={goToCite} onStep={(d) => goToCite(activeCite + d)} />
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(Math.max(1, currentPage - 1))} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Page précédente">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-caption text-foreground-muted tabular-nums min-w-[54px] text-center">page {currentPage} / {source.pages}</span>
            <button onClick={() => goToPage(Math.min(source.pages, currentPage + 1))} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Page suivante">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {cfg.footer === 'passage' && (
        <div className="px-3 py-2 border-t border-border bg-white flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[320px] h-8 px-2.5 rounded-lg border border-border bg-background-canvas text-foreground-muted">
            <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] truncate">Rechercher dans le texte</span>
          </div>
          {citeCount > 0 && (
            <CiteNav count={citeCount} active={activeCite} onGo={goToCite} onStep={(d) => goToCite(activeCite + d)} />
          )}
        </div>
      )}
    </div>
  );
}
