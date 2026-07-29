import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, ChevronLeft, ChevronRight, X, Calendar,
  Download, Trash2, Scissors, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronDown, ChevronUp, Pencil, Columns2, PanelTop, Sparkles, Hash, Check,
} from 'lucide-react';
import Input from '../ui/Input';

// ─────────────────────────────────────────────────────────────────────────────
// Preview doc - lab
//
// Objectif : afficher le document plus grand et de façon plus confortable.
// Deux pistes explorées côte à côte :
//   1. Un viewer confortable : zoom, plein écran, navigation fluide multi-pages.
//   2. Une variante où les métadonnées passent du side panel à un HEADER, ce qui
//      libère toute la largeur pour le document.
//
// Le prototype rend les documents en « skeleton » (pas de vrai moteur PDF). La
// mécanique zoom / plein écran / défilement est donc implémentée nativement :
// en production elle serait portée par une lib de preview (react-pdf / pdf.js),
// mais l'UX validée ici reste identique.
// ─────────────────────────────────────────────────────────────────────────────

// A single skeleton page - paper-shaped, deterministic grey text lines. Width is
// driven by the zoom level so the whole doc scales together.
function DocPage({ title, date, pageNo, totalPages, width, showHeader }) {
  const seed = (title || '').length + pageNo * 13 + 7;
  const rows = Array.from({ length: 34 }, (_, i) => 0.5 + ((seed + i * 17) % 45) / 100);
  return (
    <div
      className="relative bg-white rounded-md shadow-md border border-border shrink-0 overflow-hidden"
      style={{ width, aspectRatio: '1 / 1.414', containerType: 'inline-size' }}
      data-page={pageNo}
    >
      {showHeader && pageNo === 1 && (
        <div style={{ padding: '7cqw 8cqw 3cqw' }}>
          <div className="font-semibold text-foreground-tertiary leading-snug" style={{ fontSize: '3cqw' }}>
            {title}
          </div>
          {date && <div className="text-foreground-muted mt-1 tabular-nums" style={{ fontSize: '2.2cqw' }}>{date}</div>}
        </div>
      )}
      <div style={{ padding: `${pageNo === 1 && showHeader ? 0 : '9cqw'} 8cqw 0`, display: 'flex', flexDirection: 'column', gap: '1.5cqw' }}>
        {rows.map((w, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{ height: '1.1cqw', width: `${Math.round(w * 100)}%`, background: i % 7 === 6 ? 'transparent' : '#f1f0ee' }}
          />
        ))}
      </div>
      <div className="absolute left-0 right-0 text-center text-foreground-muted tabular-nums" style={{ bottom: '3cqw', fontSize: '2cqw' }}>
        {pageNo} / {totalPages}
      </div>
    </div>
  );
}

const ZOOM_STEPS = [50, 67, 80, 100, 125, 150, 200];

// The confortable viewer. `metaLayout` is 'header' (variant proposée) or 'side'
// (layout actuel, pour comparaison). Both share the same big document canvas +
// zoom / fullscreen / navigation.
function DocViewer({ doc, metaLayout }) {
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const scrollRef = useRef(null);

  const canFit = fitWidth;
  const baseWidth = 640; // width at 100% when not fitting
  const [fitPx, setFitPx] = useState(640);

  // Recompute fit-to-width whenever the canvas resizes or fit mode toggles.
  useEffect(() => {
    if (!canFit) return;
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const avail = el.clientWidth - 64; // padding
      setFitPx(Math.max(320, Math.min(avail, 900)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canFit, fullscreen]);

  const pageWidth = canFit ? fitPx : Math.round(baseWidth * (zoom / 100));

  const stepZoom = (dir) => {
    setFitWidth(false);
    setZoom((z) => {
      const idx = ZOOM_STEPS.reduce((best, v, i) => (Math.abs(v - z) < Math.abs(ZOOM_STEPS[best] - z) ? i : best), 0);
      const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir));
      return ZOOM_STEPS[next];
    });
  };

  // Track the page centred in the viewport as the user scrolls.
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    const pages = el.querySelectorAll('[data-page]');
    let cur = 1;
    for (const p of pages) {
      if (p.offsetTop <= mid) cur = Number(p.dataset.page);
    }
    setCurrentPage(cur);
  }, []);

  const goToPage = (n) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.querySelector(`[data-page="${n}"]`);
    if (target) el.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  };

  const zoomLabel = canFit ? 'Ajusté' : `${zoom}%`;

  const headerMeta = metaLayout === 'header';

  return (
    <div
      className={`bg-background-canvas flex flex-col overflow-hidden ${
        fullscreen
          ? 'fixed inset-0 z-50'
          : 'relative rounded-xl border border-border shadow-sm h-[720px]'
      }`}
      style={{ animation: fullscreen ? 'fadeIn 0.15s ease-out' : undefined }}
    >
      {/* ── Title bar : name + provenance (left) · nav + close (right) ── */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-cream text-foreground-tertiary flex-shrink-0">
            <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
          </span>
          <span className="text-body-medium text-foreground-strong truncate">{doc.name}</span>
        </div>
        {/* Right cluster - grouped by intent, separated by dividers :
            [ navigation ] | [ actions document ] | [ fermer ] */}
        <div className="flex items-center flex-shrink-0">
          {/* Navigation entre pièces */}
          <div className="flex items-center gap-1 pr-2">
            <button className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Pièce précédente">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-caption text-foreground-muted min-w-[38px] text-center tabular-nums">{doc.pieceIndex} / {doc.pieceTotal}</span>
            <button className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Pièce suivante">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="w-px h-5 bg-border" />
          {/* Actions document : édition (secondaire) · télécharger (primaire) ·
              supprimer (destructif, discret). Une seule CTA pleine = Télécharger. */}
          <div className="flex items-center gap-1.5 px-2">
            {headerMeta && (
              <button
                onClick={() => setEditing((v) => !v)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  editing ? 'bg-cream text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-cream'
                }`}
              >
                {editing ? <><Check className="w-3.5 h-3.5" strokeWidth={2} /> Terminé</> : <><Pencil className="w-3.5 h-3.5" strokeWidth={1.75} /> Modifier</>}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setDownloadOpen((o) => !o)}
                className="h-8 px-3 rounded-lg bg-foreground text-white hover:bg-foreground-tertiary transition-colors flex items-center gap-1.5 text-[13px] font-medium"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                Télécharger
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
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground-muted hover:text-[#7f1d1d] hover:bg-[#fee2e2] transition-colors"
              aria-label="Supprimer le document"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <span className="w-px h-5 bg-border" />
          <button className="ml-2 p-1 text-foreground-muted hover:text-foreground-secondary hover:bg-cream rounded-md transition-colors" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Metadata HEADER (variant proposée) ──────────────────────────────
          Doit contenir TOUTES les infos du side panel. Deux modes :
          · lecture   → chips compactes (header discret, document grand)
          · édition   → vrais composants Input (design system), au clic sur ✎ */}
      {headerMeta && (editing ? (
        <div className="px-4 py-3.5 border-b border-border bg-white flex-shrink-0 flex flex-col gap-3.5" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <FieldLabel>Informations du document</FieldLabel>
          <Input label="Nom du document" aiGenerated defaultValue={doc.name} />
          <div className="flex gap-3">
            <Input label="Type" className="flex-1">
              <div className="relative">
                <select
                  defaultValue={doc.type}
                  className="w-full h-9 pl-3 pr-8 bg-white border border-border rounded-lg shadow-xs text-[14px] text-foreground outline-none appearance-none focus:border-stone-400"
                >
                  {['Rapport', 'Correspondance', 'Facture', 'Certificat médical', 'Autre'].map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-foreground-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </Input>
            <Input label="Date du document" aiGenerated className="flex-1">
              <div className="flex items-center gap-2 h-9 px-3 bg-white border border-border rounded-lg shadow-xs focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-200">
                <Calendar className="w-4 h-4 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
                <input defaultValue={doc.date} placeholder="jj/mm/aaaa" className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground" />
              </div>
            </Input>
          </div>
          {doc.split && (
            <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
                <Scissors className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] leading-5 font-medium text-foreground">Document découpé</div>
                <div className="text-[12px] text-foreground-secondary truncate" title={doc.split.source}>{doc.split.source}</div>
              </div>
              <button className="text-[13px] font-medium hover:underline flex-shrink-0" style={{ color: '#1e3a8a' }}>Ajuster</button>
            </div>
          )}
          <div className="h-px bg-border -mx-4" />
          <FieldLabel>Numérotation de la pièce</FieldLabel>
          <div className="flex gap-3">
            <Input label="Section" className="flex-1" defaultValue={doc.section} />
            <Input label="Numéro" className="flex-1" defaultValue={doc.numero} />
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 border-b border-border bg-white flex-shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Numérotation de la pièce - section + n° */}
            <span className="inline-flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-md bg-cream border border-border text-[13px] text-foreground-secondary">
              <Hash className="w-3.5 h-3.5 text-foreground-muted" strokeWidth={1.75} />
              <span className="text-foreground-muted">Pièce</span>
              <span className="font-medium text-foreground">{doc.section}</span>
              <span className="text-foreground-muted">·</span>
              <span className="font-medium text-foreground tabular-nums">n° {doc.numero}</span>
            </span>
            <MetaChip icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />} label="Date" value={doc.date} ai />
            <MetaChip label="Type" value={doc.type} />
            {doc.split && (
              <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background-canvas border border-border text-[13px] text-foreground-secondary min-w-0">
                <Scissors className="w-3.5 h-3.5 text-foreground-muted flex-shrink-0" strokeWidth={1.75} />
                Document découpé
                {doc.split.source && <span className="text-foreground-muted truncate max-w-[160px]" title={doc.split.source}>· {doc.split.source}</span>}
                <button className="ml-0.5 font-medium hover:underline underline-offset-2 flex-shrink-0" style={{ color: '#1e3a8a' }}>Ajuster</button>
              </span>
            )}
          </div>
          {doc.summary && (
            <div className="flex items-start gap-1.5">
              <p
                className="text-[13px] leading-5 text-foreground-secondary min-w-0 flex-1"
                style={metaExpanded ? undefined : { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                title={doc.summary}
              >
                {doc.summary}
              </p>
              <button
                onClick={() => setMetaExpanded((v) => !v)}
                className="flex-shrink-0 inline-flex items-center gap-0.5 text-[12px] text-foreground-muted hover:text-foreground-secondary transition-colors mt-0.5"
              >
                {metaExpanded ? <>Réduire <ChevronUp className="w-3 h-3" /></> : <>Détails <ChevronDown className="w-3 h-3" /></>}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* ── Body : big canvas (+ optional side panel for the current layout) ── */}
      <div className="flex flex-1 min-h-0">
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-auto min-w-0">
          <div className="flex flex-col items-center gap-5 py-8 px-8">
            {Array.from({ length: doc.pages }, (_, i) => (
              <DocPage
                key={i}
                title={doc.name}
                date={doc.date}
                pageNo={i + 1}
                totalPages={doc.pages}
                width={pageWidth}
                showHeader
              />
            ))}
          </div>
        </div>

        {/* Side panel - only the current layout keeps metadata here. */}
        {!headerMeta && (
          <div className="w-[320px] border-l border-border bg-white flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="p-5 flex flex-col gap-4">
              <FieldLabel>Informations du document</FieldLabel>
              <Field label={<>Nom du document<AiMark /></>} value={doc.name} />
              {doc.split && (
                <div className="rounded-lg border border-border bg-background-canvas p-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white border border-border flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-3.5 h-3.5 text-foreground-tertiary" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] leading-5 font-medium text-foreground">Document découpé</div>
                    <div className="text-[12px] text-foreground-secondary truncate" title={doc.split.source}>{doc.split.source}</div>
                  </div>
                  <button className="text-[13px] font-medium hover:underline flex-shrink-0" style={{ color: '#1e3a8a' }}>Ajuster</button>
                </div>
              )}
              {doc.summary && (
                <p className="px-0.5 text-[12px] leading-5 text-foreground-secondary">{doc.summary}</p>
              )}
              <Field label="Type" value={doc.type} />
              <Field label={<>Date du document<AiMark /></>} value={doc.date} icon={<Calendar className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />} />
            </div>
            <div className="h-px bg-border mx-5" />
            <div className="p-5 flex flex-col gap-4">
              <FieldLabel>Numérotation de la pièce</FieldLabel>
              <div className="flex gap-4">
                <div className="flex-1"><Field label="Section" value={doc.section} /></div>
                <div className="flex-1"><Field label="Numéro" value={doc.numero} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar : zoom · plein écran (left) · pages · actions (right) ── */}
      <div className="px-3 py-2 border-t border-border bg-white flex-shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => stepZoom(-1)} className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Dézoomer">
            <ZoomOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setFitWidth((f) => !f)}
            className="px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors min-w-[62px] text-center tabular-nums"
          >
            {zoomLabel}
          </button>
          <button onClick={() => stepZoom(1)} className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Zoomer">
            <ZoomIn className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <span className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-caption text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors"
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
            {fullscreen ? 'Réduire' : 'Plein écran'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => goToPage(Math.max(1, currentPage - 1))} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Page précédente">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-caption text-foreground-muted tabular-nums min-w-[54px] text-center">page {currentPage} / {doc.pages}</span>
          <button onClick={() => goToPage(Math.min(doc.pages, currentPage + 1))} className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors" aria-label="Page suivante">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small building blocks ────────────────────────────────────────────────────

function MetaChip({ icon, label, value, ai }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-background-canvas border border-border text-[13px] text-foreground-secondary">
      <span className="text-foreground-muted">{icon}</span>
      <span className="text-foreground-muted">{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
      {ai && <Sparkles className="w-3 h-3" strokeWidth={2} style={{ color: '#9333ea' }} />}
    </span>
  );
}

// Small AI-generated marker (matches the ✦ next to AI fields in the app).
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

// ── The lab page ─────────────────────────────────────────────────────────────

const SAMPLE_DOC = {
  name: "Rapport d'expertise médicale Dr. Dubois - Annexes médicales",
  type: 'Rapport',
  date: '15/03/2023',
  pages: 6,
  pieceIndex: 2,
  pieceTotal: 17,
  section: 'I - MEDICAL',
  numero: '2',
  split: { part: 2, total: 5, source: 'rapport_expertise.fr' },
  summary: "Rapport d'expertise médicale définitif du Dr. Dubois, consolidation fixée au 15/01/2024, AIPP 8%, DFT total 45 jours, DFT partiel classe II 120 jours.",
};

export default function PreviewDocLab() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState('header'); // 'header' | 'side'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-8 py-10">
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au UI Kit
        </button>

        <div className="mb-6">
          <h1 className="text-[22px] font-semibold text-foreground-strong mb-1.5">Preview document - plus grand & confortable</h1>
          <p className="text-[14px] text-foreground-secondary max-w-[720px] leading-relaxed">
            Objectif : afficher le document plus grand. Le viewer offre zoom, plein écran et
            navigation fluide multi-pages. On explore aussi une variante où les métadonnées
            passent du side panel à un <span className="font-medium text-foreground">header</span>,
            libérant toute la largeur pour le document. Le header porte
            <span className="font-medium text-foreground"> toutes les infos</span> du panneau
            actuel - numérotation (section + n°), type, date (IA), provenance du découpage et
            résumé IA dépliable - rien n'est perdu.
          </p>
          <p className="text-[12px] text-foreground-muted max-w-[720px] mt-2 leading-relaxed">
            Le rendu reste un « skeleton » (le proto n'embarque pas de moteur PDF). En production,
            une lib de preview (react-pdf / pdf.js) porterait le rendu ; l'UX zoom / plein écran /
            défilement validée ici resterait identique.
          </p>
        </div>

        {/* Variant switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-cream border border-border mb-5">
          <SegBtn active={layout === 'header'} onClick={() => setLayout('header')} icon={<PanelTop className="w-3.5 h-3.5" />}>
            Métadonnées en header
          </SegBtn>
          <SegBtn active={layout === 'side'} onClick={() => setLayout('side')} icon={<Columns2 className="w-3.5 h-3.5" />}>
            Métadonnées en side panel (actuel)
          </SegBtn>
        </div>

        <DocViewer doc={SAMPLE_DOC} metaLayout={layout} />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Note title="Zoom">
            Boutons - / + par paliers (50 → 200 %) et un mode « Ajusté » qui cale le document
            sur la largeur disponible. Le clic sur le pourcentage bascule vers l'ajustement.
          </Note>
          <Note title="Plein écran">
            Le viewer passe en <span className="font-medium text-foreground">inset-0</span> par-dessus
            l'app pour une lecture immersive, puis revient à sa taille.
          </Note>
          <Note title="Navigation fluide">
            Défilement continu de toutes les pages ; l'indicateur « page x / n » suit le scroll,
            les flèches sautent d'une page à l'autre en douceur.
          </Note>
          <Note title="Lecture / édition">
            En header, les métadonnées sont en <span className="font-medium text-foreground">lecture</span> par
            défaut (chips compactes). Le crayon « Modifier » bascule en <span className="font-medium text-foreground">édition</span> :
            les chips laissent place aux vrais composants <span className="font-medium text-foreground">Input</span> du
            design system (Nom, Type, Date IA, Section, Numéro).
          </Note>
        </div>
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-medium transition-colors ${
        active ? 'bg-white text-foreground shadow-sm border border-border' : 'text-foreground-secondary hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Note({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="text-[13px] font-semibold text-foreground mb-1">{title}</div>
      <p className="text-[12.5px] text-foreground-secondary leading-relaxed">{children}</p>
    </div>
  );
}
