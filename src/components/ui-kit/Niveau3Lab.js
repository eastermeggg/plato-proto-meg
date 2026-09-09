import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Calculator, MoreHorizontal } from 'lucide-react';

// ── Lab /ui-kit/nav-niveau3 · fil d'Ariane ───────────────────────────
// Idée : un fil d'Ariane RÉSERVÉ au dossier (nulle part ailleurs). Contraintes
// gardées : onglets conservés, rien sur le côté, pas de panneau, pas d'accordéon
// (le poste remplace la zone de contenu). Deux traitements :
//   FA1 · Fil en tête    - le fil EST l'en-tête du dossier (nom › vue › objet),
//                          onglets en dessous ; le fil grandit au niveau 3.
//   FA2 · Fil au niveau 3 - en-tête + onglets inchangés ; le fil « Chiffrage /
//                          DSA » n'apparaît QUE dans le contenu, en niveau 3.

const POSTES = [
  { id: 'dsa', code: 'DSA', label: 'Dépenses de santé actuelles', montant: '12 400 €' },
  { id: 'fda', code: 'FDA', label: 'Frais divers actuels', montant: '5 650 €' },
  { id: 'pgpa', code: 'PGPA', label: 'Pertes de gains professionnels actuels', montant: '38 200 €' },
  { id: 'dft', code: 'DFT', label: 'Déficit fonctionnel temporaire', montant: '9 240 €' },
];
const LIGNES = [
  { label: 'Hospitalisation CHU Bordeaux', date: '15/03/2023', montant: '4 500 €' },
  { label: 'Kinésithérapie (32 séances)', date: '2023-2024', montant: '1 280 €' },
  { label: 'Frais pharmaceutiques', date: '20/07/2023', montant: '320 €' },
  { label: 'Consultations spécialistes', date: '2023-2024', montant: '860 €' },
];
const VARIANTS = [
  { id: 'fa3', label: 'FA3 · Fil à icônes', hint: 'style Notion : icône par segment, repli …' },
  { id: 'fa1', label: 'FA1 · Fil en tête', hint: 'le fil est l’en-tête du dossier' },
  { id: 'fa2', label: 'FA2 · Fil au niveau 3', hint: 'le fil n’apparaît que dans un poste' },
];

export default function Niveau3Lab() {
  const [variant, setVariant] = useState('fa3');
  const [posteId, setPosteId] = useState(null);
  const poste = POSTES.find(p => p.id === posteId) || null;
  const back = () => setPosteId(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setPosteId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const codeBadge = (code) => (<span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border border-border bg-white text-foreground rounded-[6px] flex-shrink-0">{code}</span>);
  const montantSerif = (m) => (<span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500 }} className="text-foreground">{m}</span>);
  const primaryCta = (<button className="h-8 flex items-center px-4 text-[14px] font-medium text-white bg-foreground rounded-lg hover:bg-foreground-tertiary transition-colors">Copier chiffrage</button>);

  const crumbSep = <span className="text-foreground-quaternary mx-1.5" style={{ fontSize: 13 }}>/</span>;

  // ── Fil d'Ariane (FA1 : en tête, taille en-tête) ─────────────────
  const headBreadcrumb = (
    <div className="px-8 pt-5 pb-1 flex items-center justify-between gap-3">
      <div className="flex items-center min-w-0">
        <button className="group flex items-center gap-1.5 min-w-0" onClick={back}>
          <span className="text-foreground truncate" style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 500 }}>Martel / AXA</span>
          <ChevronDown className="w-4 h-4 text-foreground-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" strokeWidth={1.75} />
        </button>
        {poste && (
          <>
            {crumbSep}
            <button onClick={back} className="text-[15px] text-foreground-secondary hover:text-foreground transition-colors flex-shrink-0">Chiffrage</button>
            {crumbSep}
            {codeBadge(poste.code)}
            <span className="text-[15px] font-medium text-foreground truncate ml-2">{poste.label}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {poste ? (<>{montantSerif(poste.montant)}{primaryCta}</>) : <span className="badge badge-sm badge-success">En cours</span>}
      </div>
    </div>
  );

  // ── Fil d'Ariane à icônes (FA3, style Notion / référence) ────────
  // Icône par segment · séparateurs / discrets · repli … quand ça s'allonge.
  const crumbBtn = (icon, label, { current, onClick, badge } = {}) => {
    const Icon = icon;
    return (
      <button onClick={onClick} disabled={!onClick}
        className={`inline-flex items-center gap-1.5 h-7 px-1.5 rounded-md transition-colors min-w-0 ${current ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground hover:bg-cream/60'}`}>
        {badge
          ? <span className="inline-flex items-center px-1.5 py-0.5 text-[10.5px] font-semibold border border-border bg-white text-foreground rounded-[5px] flex-shrink-0">{badge}</span>
          : Icon && <Icon className="w-4 h-4 flex-shrink-0 text-foreground-tertiary" strokeWidth={1.75} />}
        <span className={`truncate ${current ? 'text-[14px] font-medium' : 'text-[13.5px]'}`}>{label}</span>
      </button>
    );
  };
  const sep = <span className="text-foreground-quaternary flex-shrink-0" style={{ fontSize: 13 }}>/</span>;
  const headBreadcrumbIcons = (
    <div className="px-8 pt-5 pb-1 flex items-center justify-between gap-3">
      <div className="flex items-center gap-0.5 min-w-0">
        {crumbBtn(Folder, 'Martel / AXA', { onClick: back })}
        {poste && (<>
          {sep}
          {/* repli … : symbolise les crans intermédiaires quand le chemin serait long */}
          {crumbBtn(MoreHorizontal, '', { onClick: back })}
          {sep}
          {crumbBtn(Calculator, 'Chiffrage', { onClick: back })}
          {sep}
          {crumbBtn(null, poste.label, { current: true, badge: poste.code })}
        </>)}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {poste ? (<>{montantSerif(poste.montant)}{primaryCta}</>) : <span className="badge badge-sm badge-success">En cours</span>}
      </div>
    </div>
  );

  // ── En-tête normal (FA2) ─────────────────────────────────────────
  const normalHeader = (
    <div className="px-8 pt-5 pb-1 flex items-center gap-3">
      <span className="text-foreground" style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 500 }}>Martel / AXA</span>
      <span className="badge badge-sm badge-success">En cours</span>
    </div>
  );

  const tabs = ['Informations', 'Chiffrage', 'Pièces', 'Actes', 'JP'];
  const tabRow = (
    <div className="px-8 mt-1 border-b border-border">
      <div className="flex items-end gap-6">
        {tabs.map(t => (
          <button key={t} onClick={() => { if (t === 'Chiffrage') back(); }}
            className={`relative pb-2.5 pt-1 flex items-center gap-1.5 text-[14px] transition-colors ${t === 'Chiffrage' ? 'text-foreground font-medium' : 'text-foreground-secondary hover:text-foreground'}`}>
            {t}
            {t === 'Pièces' && <span className="text-foreground-muted" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>9</span>}
            {t === 'Chiffrage' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );

  const table = (
    <div className="px-8 py-4">
      <div className="bg-white rounded-lg border border-border/60 overflow-hidden">
        {POSTES.map((p, i) => (
          <button key={p.id} onClick={() => setPosteId(p.id)}
            className={`w-full flex items-center gap-3 px-4 h-12 text-left hover:bg-background transition-colors ${i > 0 ? 'border-t border-border-subtle' : ''}`}>
            {codeBadge(p.code)}
            <span className="flex-1 text-[13.5px] text-foreground">{p.label}</span>
            <span className="text-[13.5px] text-foreground tabular-nums">{p.montant}</span>
            <ChevronRight className="w-4 h-4 text-foreground-muted" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  );

  const detailLines = (
    <div className="bg-white rounded-lg border border-border/60 overflow-hidden">
      {LIGNES.map((l, i) => (
        <div key={i} className={`flex items-center px-4 h-11 ${i > 0 ? 'border-t border-border-subtle' : ''}`}>
          <span className="flex-1 text-[13.5px] text-foreground">{l.label}</span>
          <span className="w-28 text-[12.5px] text-foreground-secondary tabular-nums">{l.date}</span>
          <span className="w-24 text-right text-[13.5px] text-foreground tabular-nums">{l.montant}</span>
        </div>
      ))}
    </div>
  );

  // corps objet FA2 : fil dans le contenu, puis titre + détail
  const fa2Object = (
    <div className="px-8 py-4">
      <div className="flex items-center mb-3">
        <button onClick={back} className="text-[13px] text-foreground-secondary hover:text-foreground transition-colors">Chiffrage</button>
        {crumbSep}
        <span className="text-[13px] font-medium text-foreground">{poste?.code}</span>
      </div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">{codeBadge(poste?.code)}<span className="text-[15px] font-medium text-foreground truncate">{poste?.label}</span></div>
        <div className="flex items-center gap-3">{montantSerif(poste?.montant)}{primaryCta}</div>
      </div>
      {detailLines}
    </div>
  );

  // corps objet FA1 : le titre vit dans le fil (en-tête), donc juste le détail
  const fa1Object = (<div className="px-8 py-4">{detailLines}</div>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F5', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-4 flex-wrap">
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#78716c' }}>Lab · Fil d'Ariane dossier</span>
        <div className="flex items-center gap-1">
          {VARIANTS.map(v => (
            <button key={v.id} onClick={() => setVariant(v.id)} title={v.hint}
              className={`h-7 px-3 rounded-md text-[12.5px] font-medium transition-colors ${variant === v.id ? 'bg-foreground text-white' : 'bg-cream text-foreground-secondary hover:bg-border'}`}>
              {v.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-foreground-muted">Onglets gardés · Escape revient · cliquez un poste</span>
      </div>

      <div className="max-w-[1100px] mx-auto mt-6">
        {variant === 'fa3' ? headBreadcrumbIcons : variant === 'fa1' ? headBreadcrumb : normalHeader}
        {tabRow}
        {poste ? ((variant === 'fa1' || variant === 'fa3') ? fa1Object : fa2Object) : table}
      </div>
    </div>
  );
}
