// Shared primitives of the Import/Sync email lab. Badges keep the SAME colors
// and seats everywhere (spec Annexe) : Suivi (vert) · Non suivi · Déjà suivi ·
// Nouveau (bleu) · échecs (rouge/ambre).

import React, { createContext, useContext, useState } from 'react';
import { ArrowDown, Check, Minus, Plus, Scissors, AlertTriangle, X } from 'lucide-react';
import { ConnectorPromoPanel } from '../../connectors/ConnectorPromo';

// ── Phase (le calque sync se lève d'un flag - rien ne change de place) ──────
export const PhaseContext = createContext(2);
export const usePhase2 = () => useContext(PhaseContext) === 2;

// ── Typo utilitaire ─────────────────────────────────────────────────────────
export const monoLabel = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, color: '#78716c' };

export function SectionLabel({ children, right, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-2 ${className}`}>
      <span style={monoLabel}>{children}</span>
      {right}
    </div>
  );
}

// ── Contrôles ───────────────────────────────────────────────────────────────

export function LabSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onChange?.(!checked); }}
      className="relative flex-shrink-0"
      style={{ width: 36, height: 20, borderRadius: 999, border: 'none', padding: 0, cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: checked ? '#292524' : '#e0ddd5', opacity: disabled ? 0.5 : 1, transition: 'background-color 150ms' }}
    >
      <span className="absolute" style={{ top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: 999, backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.18)', transition: 'left 150ms' }} />
    </button>
  );
}

export function LabSeg({ options, value, onChange }) {
  const seg = (active) => ({
    height: '100%', padding: '0 10px', display: 'flex', alignItems: 'center',
    borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 150ms',
    background: active ? '#ffffff' : 'transparent',
    boxShadow: active ? '0 1px 4px 0 rgba(26,26,26,0.05), 0 1px 2px 0 rgba(26,26,26,0.05)' : 'none',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500,
    color: active ? '#292524' : '#78716c', textTransform: 'uppercase', whiteSpace: 'nowrap',
  });
  return (
    <div className="flex items-center h-7 rounded-lg p-0.5 flex-shrink-0" style={{ backgroundColor: '#eeece6' }}>
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} style={seg(value === o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

// Une seule sémantique de coche, partout : cocher = prendre le contenu.
// `partial` : état partiel (thread partiellement pris) - barre + aria mixed.
export function Checkbox({ checked, partial = false, disabled = false, onToggle, title, className = '' }) {
  if (disabled) {
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border border-border flex-shrink-0 ${className}`}
        style={{ backgroundColor: '#f5f4f1' }}
        title={title}
        aria-hidden
      />
    );
  }
  const on = checked || partial;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      className={`flex-shrink-0 ${className}`}
      title={title}
      aria-label={title}
      aria-checked={partial ? 'mixed' : checked}
      role="checkbox"
    >
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-colors ${on ? 'bg-foreground border-foreground' : 'bg-white border-border-strong'}`} style={on ? undefined : { boxShadow: '0px 1px 1px rgba(26,26,26,0.05)' }}>
        {partial ? <Minus className="w-3 h-3 text-white" strokeWidth={3} /> : checked ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

// Badge « Ajouté » - GRIS neutre (le vert est réservé à « Suivi »). Cliquable
// pour retirer : il vire au rouge au survol pour annoncer le retrait. Sert
// d'affordance sur toute ligne entièrement prise (colonne mail).
export function AjouteBadge({ onRemove, title = 'Retirer', label = 'Ajouté' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0 transition-colors"
      style={hover
        ? { backgroundColor: '#fbe9e7', color: '#b4483c' }
        : { backgroundColor: '#eeece6', color: '#78716c' }}
      title={title}
    >
      {hover ? <X className="w-2.5 h-2.5" strokeWidth={2.5} /> : <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}
      {hover ? 'Retirer' : label}
    </button>
  );
}

// LE contrôle de prise de la colonne mail (il n'y a pas de case à gauche : la
// gauche prend des objets entiers, une case qui ne se coche jamais serait un
// mensonge de contrôle). Il ne réserve PAS d'espace : il flotte en absolu au
// bord droit et n'apparaît qu'au survol / focus, POSÉ sur le contenu (fond
// plein + ombre) - la ligne garde toute sa largeur pour son contenu.
export function AjouterChip({ onAdd, label = 'Ajouter', title }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto transition-opacity"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d6d3d1', color: '#292524', boxShadow: '0 2px 6px -1px rgba(28,25,23,0.16), 0 1px 2px rgba(28,25,23,0.10)' }}
      title={title}
      aria-label={title || label}
    >
      <Plus className="w-3 h-3" strokeWidth={2.5} />
      {label}
    </button>
  );
}

// ── Badges d'état (mêmes couleurs, mêmes emplacements partout) ──────────────

export function SuiviBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium flex-shrink-0" style={{ color: '#4a9168' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4a9168' }} aria-hidden /> Suivi
    </span>
  );
}

export function NonSuiviBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: '#a8a29e' }} aria-hidden /> Non suivi
    </span>
  );
}

// « Déjà importé » : le fil a déjà été pioché une fois (snapshot). GRIS neutre
// (pas de vert : ce n'est pas un suivi). Constat, non cliquable.
export function DejaImporteBadge() {
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#eeece6', color: '#78716c', opacity: 1 }}>
      Déjà importé
    </span>
  );
}

// Sur ligne inerte : la ligne est estompée, le badge reste à pleine opacité.
export function DejaSuiviBadge() {
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#e4efe8', color: '#3d7a57', opacity: 1 }}>
      Déjà suivi
    </span>
  );
}

// « Nouveau » : pièce arrivée par sync - BLEU (spec §2).
export function NouveauBadge() {
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: '#dfe8f5', color: '#1e3a8a' }}>
      Nouveau
    </span>
  );
}

export function CountBadge({ n }) {
  if (!n) return null;
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded-full text-[10px] font-medium tabular-nums flex-shrink-0" style={{ backgroundColor: '#dfe8f5', color: '#1e3a8a' }}>
      +{n}
    </span>
  );
}

export function WarnBadge({ n, title }) {
  if (!n) return null;
  return (
    <span className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded-full text-[10px] font-medium tabular-nums flex-shrink-0" style={{ backgroundColor: '#fbe9e7', color: '#b4483c' }} title={title}>
      <AlertTriangle className="w-2.5 h-2.5" strokeWidth={2} /> {n}
    </span>
  );
}

export function TypeChip({ children }) {
  return (
    <span className="inline-flex items-center h-5 px-1.5 rounded bg-cream text-[10px] font-medium text-foreground-tertiary flex-shrink-0">{children}</span>
  );
}

// ── Découpe (spec §6) ───────────────────────────────────────────────────────
// off : « Découper » (sobre, avec libellé) · on : juste une petite icône ciseaux
// sombre (l'état « sera découpé » se lit d'un coup d'œil, sans texte) - re-clic
// annule. Le VERT est réservé à « Suivi ». Jamais sur images ni emails.
export function DecoupeControl({ on, onToggle }) {
  if (on) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="inline-flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-colors"
        style={{ backgroundColor: '#292524', color: '#f5f4f1' }}
        title="Sera découpé - cliquer pour annuler"
      >
        <Scissors className="w-3 h-3" strokeWidth={2} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-cream transition-colors flex-shrink-0"
      title="Scinder ce document en pièces"
    >
      <Scissors className="w-3 h-3" strokeWidth={1.75} />
      Découper
    </button>
  );
}

// ── Overlays ────────────────────────────────────────────────────────────────

// Near-full-viewport : 16px de marge, pas de cap de largeur.
export function ModalOverlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function DropOverlay() {
  return (
    <div className="absolute inset-2 z-30 rounded-xl flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ backgroundColor: 'rgba(238,236,230,0.94)', border: '2px dashed #a8a29e' }}>
      <div className="bg-white border shadow-sm rounded-full p-4" style={{ borderColor: '#d6d3d1' }}>
        <ArrowDown className="w-6 h-6 text-stone-600" strokeWidth={1.75} />
      </div>
      <p className="text-base font-medium text-stone-800">Déposer pour ajouter au dossier</p>
      <p className="text-sm text-stone-500">PDF, images, .eml, .msg, zip d'export Outlook</p>
    </div>
  );
}

// La surface entière est déposable : overlay dès le dragenter.
export function Droppable({ onFiles, className, style, children, ...rest }) {
  const [drag, setDrag] = useState(false);
  return (
    <div
      {...rest}
      className={className}
      style={{ position: 'relative', ...style }}
      onDragEnter={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setDrag(true); } }}
      onDragOver={(e) => { if (drag) e.preventDefault(); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles?.(); }}
    >
      {children}
      {drag && <DropOverlay />}
    </div>
  );
}

// Dialog d'action centré, sur son propre voile (au-dessus des panneaux).
export function ConfirmDialog({ title, children, onClose }) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(28,25,23,0.32)' }} onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl border border-border flex flex-col" style={{ width: 420, boxShadow: '0 24px 60px -12px rgba(28,25,23,0.28)' }}>
        <p className="px-5 pt-4 pb-1 text-[15px] font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </div>
  );
}

// ── État vide « email non connecté » (une seule vérité, trois surfaces) ─────
// Le visuel vit dans connectors/ConnectorPromo - même promesse, mêmes
// garanties que la modale connecteur et le bandeau d'engagement.
export function ConnectScreen({ onConnect, compact = false }) {
  return <ConnectorPromoPanel provider="outlook" compact={compact} onConnect={onConnect} />;
}

// ── Coude d'indentation des PJ ──────────────────────────────────────────────
export function Elbow() {
  return (
    <span className="flex-shrink-0" aria-hidden style={{ width: 18, height: 18 }}>
      <span className="block" style={{ width: 15, height: 18, marginLeft: 3, borderLeft: '1.11px solid #d6d3d1', borderBottom: '1.11px solid #d6d3d1', borderBottomLeftRadius: 5 }} />
    </span>
  );
}
