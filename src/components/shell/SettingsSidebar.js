import React, { useState } from 'react';
import { UserRound, BarChart3, Stamp, Plug2, Building2, UsersRound, ReceiptEuro, Scale, BookOpen, Brain } from 'lucide-react';
import { AppSidebar, SidebarBrand, NavItem, NavSectionHeader } from '../ui/AppSidebar';

// SettingsSidebar — le rail des Paramètres (Context=Settings de la nav Plato,
// Plato---System 36641:50716). Dans les réglages, CE sous-rail EST la nav : il
// REMPLACE la nav org (doctrine App Shell 4127:30731 « le sous-rail est la nav »).
// Composé sur AppSidebar (on ne re-roule pas un rail) : header marque + collapse,
// puis deux groupes - « Votre compte » et « Organisation ».
export const SETTINGS_NAV = [
  {
    group: 'Votre compte',
    items: [
      { id: 'general', label: 'Général', icon: UserRound },
      { id: 'usage', label: 'Mon usage', icon: BarChart3 },
      { id: 'tamponnage', label: 'Tamponnage', icon: Stamp },
      { id: 'connecteurs', label: 'Connecteurs', icon: Plug2 },
    ],
  },
  {
    group: 'Organisation',
    items: [
      { id: 'organisation', label: 'Organisation', icon: Building2 },
      { id: 'collaborateurs', label: 'Collaborateurs', icon: UsersRound },
      { id: 'facturation', label: 'Plan et facturation', icon: ReceiptEuro },
      { id: 'referentiels', label: 'Référentiels', icon: Scale },
      { id: 'modeles', label: "Modèles d'actes", icon: BookOpen },
      { id: 'memoire', label: 'Mémoire et préférences', icon: Brain },
    ],
  },
];

// `active` contrôlé (facultatif) ; sinon état interne (défaut « general »).
export default function SettingsSidebar({ active: controlled, onSelect, onCollapse, onHome }) {
  const [internal, setInternal] = useState('general');
  const active = controlled != null ? controlled : internal;
  const select = (id) => { setInternal(id); if (onSelect) onSelect(id); };
  return (
    <AppSidebar
      header={<SidebarBrand onClick={onHome} />}
      onCollapse={onCollapse}
    >
      {SETTINGS_NAV.map((grp, i) => (
        <div key={grp.group} className={i === 0 ? 'px-2 pt-3' : 'px-2 pt-5 pb-2'}>
          <NavSectionHeader label={grp.group} />
          <div className="flex flex-col gap-0.5">
            {grp.items.map((it) => (
              <NavItem key={it.id} icon={it.icon} label={it.label} active={active === it.id} onClick={() => select(it.id)} />
            ))}
          </div>
        </div>
      ))}
    </AppSidebar>
  );
}
