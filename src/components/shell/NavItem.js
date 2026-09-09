import React from 'react';
import { Plus, ChevronRight, CornerDownRight } from 'lucide-react';

// ── NavItem ──────────────────────────────────────────────────────────
// LA ligne de la nav org (sidebar Plato). Quatre variantes :
//
//   destination  item de 1er niveau (Accueil, Mes dossiers…) - icône de tête,
//                liseré orange + fond crème + bord quand actif ; en mode
//                `collapsed` : carré 32px icône seule + tooltip à droite.
//   recent       ligne de récent (dossier ou conversation) - mêmes états
//                actif/hover que destination ; `trail` (réf. du dossier de
//                rattachement) ajoute une 2e ligne CornerDownRight → h-11.
//   create       bouton de création en TÊTE de liste - vraie apparence de
//                bouton (bord + fond blanc + ombre), « + » brand qui pivote
//                au survol, libellé medium. Jamais d'état actif.
//   see-all      rangée « Voir tout » de pied de section - texte muted 13px,
//                chevron qui glisse de 2px au survol. Sans icône de tête.
//
// États partagés (destination / recent) - alignés sur la nav FINALE
// (Plato---System 37416:1376, relevé 09/09 soir) :
//   défaut   texte foreground #292524 (14 Regular), icône foreground-secondary,
//            fond nu
//   hover    fond cream/60 (texte inchangé - il est déjà foreground)
//   actif    fond cream, bord border-strong, texte foreground medium,
//            icône brand strokeWidth 2, liseré orange 3×15 (glow 38%)
export default function NavItem({
  variant = 'destination',
  icon: Icon,
  label,
  trail = null,
  active = false,
  collapsed = false,
  onClick,
  title,
}) {
  // Liseré de marque sur l'item actif - fin trait orange Plato à gauche
  // (nav finale : 2×15, ancré sur le bord, coins droits r-2).
  const activeAccent = (
    <span
      aria-hidden
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: -1, width: 2, height: 15, borderRadius: '0 2px 2px 0', backgroundColor: '#f47a2c', boxShadow: '0 0 6px rgba(244,122,44,0.38)' }}
    />
  );
  // Chevron de fin - apparaît au survol des items destination / recent
  // (nav finale : chevron-right 14px, même teinte que l'icône de tête).
  const hoverChevron = (groupCls) => (
    <ChevronRight
      className={`w-3.5 h-3.5 flex-shrink-0 text-foreground-secondary opacity-0 ${groupCls} transition-opacity duration-150`}
      strokeWidth={1.75}
    />
  );

  if (variant === 'create') {
    // Icône paramétrable (nav finale : folder-plus / message-circle-plus en
    // brand) ; la rotation au survol est réservée au « + » générique.
    const CreateIcon = Icon || Plus;
    return (
      <button
        onClick={onClick}
        title={title ?? label}
        className="group/new relative h-8 flex items-center gap-2 w-full px-2.5 mb-1 text-left border border-border-strong bg-white text-foreground hover:bg-[linear-gradient(90deg,#eeece6_0%,white_52.5%)] transition-all duration-150 ease-out shadow-[0px_1px_0.5px_0px_rgba(26,26,26,0.03)]"
        style={{ borderRadius: 6, fontSize: 14 }}
      >
        <CreateIcon
          className={`w-4 h-4 flex-shrink-0 text-brand ${Icon ? '' : 'transition-transform duration-200 ease-out group-hover/new:rotate-90'}`}
          strokeWidth={Icon ? 1.75 : 2.25}
        />
        <span className="truncate flex-1 min-w-0 font-medium">{label}</span>
      </button>
    );
  }

  if (variant === 'see-all') {
    return (
      <button
        onClick={onClick}
        title={title}
        className="group/all h-8 flex items-center gap-1 w-full px-2.5 text-left text-foreground-secondary hover:text-foreground hover:bg-cream transition-all duration-150 ease-out"
        style={{ borderRadius: 6, fontSize: 14 }}
      >
        <span className="min-w-0 font-medium">{label ?? 'Voir tout'}</span>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ease-out group-hover/all:translate-x-0.5" strokeWidth={1.75} />
      </button>
    );
  }

  if (variant === 'recent') {
    return (
      <button
        onClick={onClick}
        className={`group/row relative flex items-center gap-2 w-full px-2.5 text-left transition-all duration-150 ease-out border ${
          trail ? 'h-11' : 'h-8'
        } ${
          active
            ? 'bg-cream text-foreground font-medium border-border-strong'
            : 'text-foreground hover:bg-cream border-transparent'
        }`}
        style={{ borderRadius: 6, fontSize: 14 }}
        title={title ?? label}
        aria-current={active ? 'true' : undefined}
      >
        {active && activeAccent}
        {Icon && (
          <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-brand' : 'text-foreground-secondary'}`} strokeWidth={active ? 2 : 1.75} />
        )}
        {/* Titre + (marqueur dossier en sous-titre). Fil libre = une seule ligne. */}
        <span className="flex-1 min-w-0 flex flex-col justify-center">
          <span className="truncate" style={{ lineHeight: '18px' }}>{label}</span>
          {trail && (
            <span className="flex items-center gap-1 min-w-0 opacity-70">
              <CornerDownRight className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={1.75} style={{ color: '#78716c' }} />
              <span className="truncate text-[12px] text-foreground-secondary" style={{ lineHeight: '15px', letterSpacing: '0.12px' }}>{trail}</span>
            </span>
          )}
        </span>
        {!active && hoverChevron('group-hover/row:opacity-100')}
      </button>
    );
  }

  // destination (défaut)
  const btn = (
    <button
      onClick={onClick}
      className={`group/nav relative h-8 flex items-center transition-all duration-200 ease-out text-left ${
        collapsed ? 'w-8 justify-center px-0' : 'gap-2 w-full px-2.5'
      } ${
        active
          ? 'bg-cream text-foreground font-medium border border-border-strong'
          : 'text-foreground hover:bg-cream/60 border border-transparent'
      }`}
      style={{ borderRadius: 6, fontSize: 14 }}
      title={collapsed ? undefined : (title ?? label)}
    >
      {active && !collapsed && activeAccent}
      {Icon && (
        <Icon
          className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-brand' : 'text-foreground-secondary'}`}
          strokeWidth={active ? 2 : 1.75}
        />
      )}
      {!collapsed && <span className="truncate flex-1 min-w-0">{label}</span>}
      {!collapsed && !active && hoverChevron('group-hover/nav:opacity-100')}
    </button>
  );
  if (!collapsed) return <div>{btn}</div>;
  return (
    <div className="relative group">
      {btn}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[12px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 z-50"
      >
        {label}
      </span>
    </div>
  );
}
