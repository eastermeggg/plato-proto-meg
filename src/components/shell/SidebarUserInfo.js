import React from 'react';
import { ChevronsUpDown } from 'lucide-react';

// SidebarUserInfo — le pied « profil » du rail (Sidebar Custom Items / Region=
// UserInfo, Plato---System 36097:37493). Avatar + prénom + cabinet + chevrons,
// états Default/Hover ; mode `collapsed` = avatar seul + tooltip. Purement
// présentationnel : le menu déroulant (contenu app) est passé en `children` et
// affiché par le parent. L'avatar est fourni en noeud (`avatar`) pour rester
// agnostique du helper d'avatars du proto.
//
// Props :
//   avatar      node — l'avatar rendu (24px déplié / 32px replié, au choix de l'appelant)
//   name        string — libellé (prénom en général)
//   org         string — cabinet / organisation
//   collapsed   bool — mode réduit (avatar seul + tooltip)
//   onClick     () => void — ouvre/ferme le menu
//   tooltipLabel string — libellé du tooltip en mode réduit (défaut « Mon compte »)
//   showTooltip bool — afficher le tooltip (typiquement !menuOpen)
//   children    node — le panneau déroulant, rendu par le parent quand ouvert
export default function SidebarUserInfo({
  avatar,
  name,
  org,
  collapsed = false,
  onClick,
  tooltipLabel = 'Mon compte',
  showTooltip = true,
  children,
}) {
  return (
    <div className={`border-t border-border flex-shrink-0 ${collapsed ? 'p-2 flex justify-center' : 'p-2'}`}>
      <div className="relative group">
        <button
          onClick={onClick}
          className={
            collapsed
              ? 'flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity'
              : 'w-full flex items-center gap-3 px-2 py-2 hover:bg-background-subtle transition-colors text-left group'
          }
          style={collapsed ? undefined : { borderRadius: 6 }}
        >
          {collapsed ? avatar : (
            <>
              {avatar}
              <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                <span className="text-[14px] font-medium text-foreground truncate leading-[20px]">{name}</span>
                <span className="text-[12px] text-foreground-secondary truncate leading-[16px]" style={{ letterSpacing: '0.12px' }}>{org}</span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-foreground-secondary flex-shrink-0" strokeWidth={1.75} />
            </>
          )}
        </button>
        {collapsed && showTooltip && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[12px] font-medium text-primary-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 z-50"
          >
            {tooltipLabel}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
