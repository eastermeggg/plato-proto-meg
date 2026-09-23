import React from 'react';
import { colors, typography } from '../../design-system/tokens';
import Badge from './Badge';

// PageHeader — l'en-tête de PAGE canonique de Plato (au-dessus du contenu).
// Établi depuis Figma « Page Header » (Plato---System 37511:1436) : titre serif
// (display-sm) + action primaire optionnelle, et une rangée d'onglets optionnelle
// (compteurs + soulignement de l'actif). DISTINCT de :
//   - TopBar  (chrome fixe : breadcrumb + onglets de vue + outils du dossier)
//   - Niveau3Strip (barre de contexte niveau 3 : poste / acte / JP / documents)
//
// Types Figma : Dossiers (titre + onglets + création) · Conversations (titre +
// création) · Dossier (slim → compose TopBar, hors périmètre de ce composant).
//
// On COMPOSE les primitives : l'action est un noeud fourni (typiquement
// <Button variant="primary" …/>), les compteurs d'onglets sont des <Badge>.
//
// Props :
//   title        string | node — titre serif (display-sm)
//   action       node — cluster d'actions à droite (ex. <Button …/>)
//   tabs         [{ key, label, count?, icon? }] — rangée d'onglets optionnelle
//   activeTab    string — clé de l'onglet actif
//   onTabChange  (key) => void
//   className / style — échappatoires (ex. ajuster le padding haut si nav masquée)
export default function PageHeader({
  title,
  action,
  tabs,
  activeTab,
  onTabChange,
  className = '',
  style,
}) {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;
  return (
    <div
      className={`flex flex-col items-start w-full px-8 pt-7 ${hasTabs ? 'gap-3.5' : 'gap-6 pb-6'} ${className}`}
      style={style}
    >
      {/* Rangée de tête : titre serif (flex-1) + actions à droite. */}
      <div className="flex items-center gap-2.5 w-full">
        <h1
          className="flex-1 min-w-0 truncate text-foreground"
          style={{
            fontFamily: typography.fontFamily.serif,
            fontSize: 20,
            lineHeight: '28px',
            letterSpacing: '-0.6px',
            fontWeight: 500,
          }}
        >
          {title}
        </h1>
        {action != null && (
          <div className="flex items-center gap-3 flex-shrink-0">{action}</div>
        )}
      </div>

      {/* Onglets optionnels : label + compteur + soulignement 2px de l'actif,
          posés sur le filet du bas du conteneur. */}
      {hasTabs && (
        <div className="flex gap-6 items-start w-full border-b border-border">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.key)}
                className="flex flex-col items-center justify-center gap-2.5 flex-shrink-0"
              >
                <span className="flex items-center gap-1.5">
                  {Icon && (
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      strokeWidth={1.75}
                      style={{ color: isActive ? colors.semantic.foreground : colors.semantic.mutedForeground }}
                    />
                  )}
                  <span
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: isActive ? colors.semantic.foreground : colors.semantic.mutedForeground }}
                  >
                    {tab.label}
                  </span>
                  {typeof tab.count === 'number' && <Badge variant="outline" count={tab.count} />}
                </span>
                <span
                  className="h-[2px] w-full rounded-tl-[30px] rounded-tr-[30px]"
                  style={{ background: isActive ? colors.semantic.foreground : 'transparent' }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
