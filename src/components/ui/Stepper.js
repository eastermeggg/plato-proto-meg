import React from 'react';
import { Check } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Plato Stepper — stepper horizontal canonique des parcours en étapes (header
// de modale multi-étapes, wizards). Source of truth : Figma « Horizontal
// Stepper » (Plato---Design 4226:63220, modale « Nouveau dossier »).
//
// Anatomie (relevée sur les 5 frames de la modale) :
//   • cercle 24px (rounded-full) numéroté en IBM Plex Mono Medium 11
//   • libellé Inter Medium 14/20
//   • connecteur 40px × 1px (bg border) entre les étapes, gap 12 autour,
//     gap 8 cercle↔libellé
// États :
//   done      cercle plein success-text (#064e3b) + check blanc 12px,
//             libellé mutedForeground
//   active    cercle plein primary + numéro primaryForeground,
//             libellé foreground (aria-current="step")
//   upcoming  cercle bordé border + numéro mutedForeground,
//             libellé mutedForeground
//
// API : <Stepper steps={[{ label }]} current={index} />. `onStepClick`
// (optionnel) ne rend cliquables que les étapes déjà accomplies (retour en
// arrière) - jamais les étapes à venir. Voir Stepper.md.

const CIRCLE = 24;
const CONNECTOR_W = 40;

function StepCircle({ state, index }) {
  const base = {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  };
  if (state === 'done') {
    return (
      <span style={{ ...base, backgroundColor: colors.feedback.success.text }} aria-hidden>
        <Check style={{ width: 12, height: 12, color: colors.semantic.white }} strokeWidth={2.5} />
      </span>
    );
  }
  const active = state === 'active';
  return (
    <span
      style={{
        ...base,
        backgroundColor: active ? colors.semantic.primary : 'transparent',
        border: active ? 'none' : `1px solid ${colors.semantic.border}`,
      }}
      aria-hidden
    >
      <span
        style={{
          fontFamily: typography.fontFamily.mono,
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 'normal',
          textTransform: 'uppercase',
          color: active ? colors.semantic.primaryForeground : colors.semantic.mutedForeground,
        }}
      >
        {index + 1}
      </span>
    </span>
  );
}

export default function Stepper({ steps = [], current = 0, onStepClick, className = '', style }) {
  return (
    <ol
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 12, listStyle: 'none', margin: 0, padding: 0, ...style }}
      aria-label="Étapes"
    >
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
        const clickable = !!onStepClick && state === 'done';
        const content = (
          <>
            <StepCircle state={state} index={i} />
            <span
              style={{
                fontSize: 14,
                lineHeight: '20px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                color: state === 'active' ? colors.semantic.foreground : colors.semantic.mutedForeground,
              }}
            >
              {s.label}
            </span>
          </>
        );
        return (
          <React.Fragment key={s.label || i}>
            {i > 0 && (
              <span
                style={{ width: CONNECTOR_W, height: 1, backgroundColor: colors.semantic.border, flexShrink: 0 }}
                aria-hidden
              />
            )}
            <li
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, background: 'none',
                    border: 'none', padding: 0, cursor: 'pointer', font: 'inherit',
                  }}
                  title={`Revenir à « ${s.label} »`}
                >
                  {content}
                </button>
              ) : content}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}
