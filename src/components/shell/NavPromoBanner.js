import React from 'react';
import { ChevronRight } from 'lucide-react';

// Bandeau promo de la nav (frames Plato-Design 3757:24847 / 24878) - dégradé
// bleu horizontal (#e3e7f2 → transparent 59.5%), texte + icône info-blue
// #1e3a8a, chevron de fin. Deux emplacements :
//   edge="top"     sous le header de la nav (filet BAS) - ex. « Connectez
//                  votre boîte mail » tant qu'aucune boîte n'est connectée
//   edge="bottom"  pied de nav (filet HAUT) - ex. parrainage « -10% à
//                  chaque parrainage »
// Hover : léger assombrissement du dégradé (brightness .98).
export default function NavPromoBanner({ icon: Icon, label, onClick, edge = 'top', title }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full ${edge === 'top' ? 'border-b' : 'border-t'} border-border px-4 py-3 flex-shrink-0 text-left hover:brightness-[0.98] transition-[filter]`}
      style={{ background: 'linear-gradient(90deg, #e3e7f2 0%, rgba(223,232,245,0) 59.5%)' }}
      title={title ?? label}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />}
      <span className="flex-1 min-w-0 text-[14px] font-medium truncate" style={{ color: '#1e3a8a' }}>{label}</span>
      <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} style={{ color: '#1e3a8a' }} />
    </button>
  );
}
