import React, { useState, useRef, useEffect, useCallback } from 'react';
import { colors, radius, shadows } from '../../design-system/tokens';

/**
 * Popover — Plato design system. Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Surface dérivée (pas de page dans le kit Figma : figmaTodo « a-dessiner »),
 * systématisée sur les popovers produit existants (SaveDestinationPopover,
 * JPPopoverCard) : surface `popover`, bord `border`, radius lg, élévation
 * shadows.lg. Contenu riche/interactif ancré à un déclencheur, fermé au clic
 * extérieur et à Échap. Pour un simple indice texte au survol → Tooltip.
 *
 * Contrôlé (`open` + `onOpenChange`) ou non contrôlé (`defaultOpen`). Toutes
 * les valeurs viennent de tokens.js.
 */

export default function Popover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  anchor,
  children,
  side = 'bottom',
  align = 'start',
  minWidth = 180,
  className,
  style,
}) {
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const wrapRef = useRef(null);

  const setOpen = useCallback(
    (next) => {
      if (!isControlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <span ref={wrapRef} className={className} style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <span
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {anchor}
      </span>
      {open && (
        <div
          role="dialog"
          style={{
            position: 'absolute',
            top: side === 'bottom' ? 'calc(100% + 6px)' : undefined,
            bottom: side === 'top' ? 'calc(100% + 6px)' : undefined,
            left: align === 'start' ? 0 : align === 'center' ? '50%' : undefined,
            right: align === 'end' ? 0 : undefined,
            transform: align === 'center' ? 'translateX(-50%)' : undefined,
            background: colors.semantic.popover,
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: radius.lg,
            boxShadow: shadows.lg,
            padding: 12,
            zIndex: 50,
            minWidth,
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}
