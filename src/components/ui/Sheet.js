import React, { useEffect } from 'react';
import { X as XIcon } from 'lucide-react';
import { colors, shadows } from '../../design-system/tokens';

/**
 * Sheet — Plato design system. Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Surface dérivée (pas de page dans le kit Figma : figmaTodo « a-dessiner ») :
 * panneau générique glissé depuis un bord, scrim `overlay`, surface `card`,
 * élévation shadows.xl. Se ferme au clic sur le scrim et à Échap.
 *
 * Positionné en `absolute inset:0` : il remplit son ancêtre positionné (canvas
 * de la sandbox, conteneur d'écran) - overlay « piégé », pas fixé au viewport.
 * Pour le grand panneau latéral MASTER droite/gauche du produit (largeurs
 * canoniques, `--chat-offset`, DrawerSection) → `Drawer`. Toutes les valeurs
 * viennent de tokens.js.
 */

export default function Sheet({ open, side = 'right', onClose, title, children, width = 360, height = 320 }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sideStyles = {
    right: { right: 0, top: 0, bottom: 0, width },
    left: { left: 0, top: 0, bottom: 0, width },
    bottom: { left: 0, right: 0, bottom: 0, height },
    top: { left: 0, right: 0, top: 0, height },
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div
        role="button"
        tabIndex={-1}
        aria-label="Fermer"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: colors.semantic.overlay }}
      />
      <div
        role="dialog"
        aria-label={title}
        style={{
          position: 'absolute',
          ...sideStyles[side],
          background: colors.semantic.card,
          padding: 20,
          boxShadow: shadows.xl,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: colors.semantic.foreground }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
          >
            <XIcon style={{ width: 16, height: 16, color: colors.semantic.foregroundSecondary }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
