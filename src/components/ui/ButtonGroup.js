import React from 'react';
import { colors, radius } from '../../design-system/tokens';
import Button from './Button';

/**
 * ButtonGroup — Plato design system. Source of truth: Figma node 28685:126219
 * (page « Button Group » : set 28685:127189, Type × Orientation).
 *
 * Groupe segmenté : des Button accolés, coins internes carrés, séparés par un
 * filet 1px. COMPOSE le Button canonique (jamais de bouton re-roulé) : le
 * groupe clone ses enfants et neutralise les radius/bords internes.
 *
 * Types Figma → variants Button : Default→primary · Outline→outline ·
 * Secondary→secondary. Orientations : Horizontal · Vertical.
 * Séparateur (ButtonGroupSeparator Figma) : primary sur type Default
 * (fondu dans la masse), input sur Outline / Secondary.
 *
 * Rayon externe Figma : 8 (radius.lg), boutons h36 (Button size md).
 */

// Couleur du filet séparateur, par variant (relevé Figma).
const SEPARATOR = {
  primary: colors.semantic.primary,
  outline: colors.semantic.input,
  secondary: colors.semantic.input,
};

export default function ButtonGroup({
  variant = 'primary', // Figma Type=Default
  orientation = 'horizontal',
  size = 'md',
  separators = true, // filet 1px entre segments (retirer pour un split serré)
  children,
  ariaLabel,
  // Escape hatches (mêmes props que Badge)
  className,
  style,
}) {
  const vertical = orientation === 'vertical';
  const sepColor = SEPARATOR[variant] || SEPARATOR.primary;
  const items = React.Children.toArray(children).filter(Boolean);
  const last = items.length - 1;

  // Coins : seuls les coins externes du groupe gardent radius.lg (Figma 8).
  const cornerStyle = (i) => {
    const first = i === 0;
    const end = i === last;
    if (vertical) {
      return {
        borderTopLeftRadius: first ? radius.lg : 0,
        borderTopRightRadius: first ? radius.lg : 0,
        borderBottomLeftRadius: end ? radius.lg : 0,
        borderBottomRightRadius: end ? radius.lg : 0,
        // Bords internes neutralisés (le filet fait la séparation, 1px total)
        ...(first ? {} : { borderTop: 'none' }),
        ...(end ? {} : { borderBottom: 'none' }),
        width: '100%',
      };
    }
    return {
      borderTopLeftRadius: first ? radius.lg : 0,
      borderBottomLeftRadius: first ? radius.lg : 0,
      borderTopRightRadius: end ? radius.lg : 0,
      borderBottomRightRadius: end ? radius.lg : 0,
      ...(first ? {} : { borderLeft: 'none' }),
      ...(end ? {} : { borderRight: 'none' }),
    };
  };

  const separator = (
    <span
      aria-hidden
      style={{
        flex: '0 0 auto',
        alignSelf: 'stretch',
        width: vertical ? '100%' : 1,
        height: vertical ? 1 : 'auto',
        backgroundColor: sepColor,
      }}
    />
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'stretch',
        ...style,
      }}
    >
      {items.map((child, i) => {
        const el = React.isValidElement(child) ? child : <span>{child}</span>;
        const isButton = el.type === Button;
        const cloned = React.cloneElement(el, {
          // Le groupe impose variant/size par défaut (sets Figma uniformes),
          // un enfant peut les surcharger explicitement.
          ...(isButton ? {
            variant: el.props.variant || variant,
            size: el.props.size || size,
          } : {}),
          style: { ...cornerStyle(i), ...el.props.style },
        });
        return (
          <React.Fragment key={el.key || i}>
            {separators && i > 0 && separator}
            {cloned}
          </React.Fragment>
        );
      })}
    </div>
  );
}
