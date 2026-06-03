import React, { useEffect, useRef } from 'react';

const LABEL_STYLE = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#a8a29e',
  lineHeight: '14px',
  marginBottom: 10,
};

const PROSE_STYLE = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 13,
  lineHeight: 1.65,
  color: '#292524',
  resize: 'none',
  outline: 'none',
  background: 'transparent',
  border: 'none',
  width: '100%',
  padding: 0,
  display: 'block',
  overflow: 'hidden',
};

function PreferenceSlot({ label, value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <div className="px-5 py-4">
      <div style={LABEL_STYLE}>{label}</div>
      <textarea
        ref={ref}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className="placeholder:text-[#a8a29e]"
        style={PROSE_STYLE}
      />
    </div>
  );
}

export const PREFERENCE_SLOT_IDS = ['structure', 'quantum', 'referentiels', 'style', 'consignes'];

export const PREFERENCE_SLOT_LABELS = {
  structure: 'Structure de mes actes',
  quantum: 'Préférences de quantum',
  referentiels: 'Référentiels favoris',
  style: 'Style et ton',
  consignes: 'Consignes',
};

const PLACEHOLDERS = {
  structure: 'Plan en trois parties, numérotation décimale (I, A, 1°), citations en bas de page, récapitulatif chiffré en fin de discussion…',
  quantum: 'DFT ≈ 1 800 €/mois, DFP entre 5 et 25 % selon Mornet 2024, SE 4/7 ≈ 8 000 €…',
  referentiels: "Mornet 2024 pour l'indemnisation corporelle, Gazette du Palais pour la capitalisation, ONIAM pour l'aléa thérapeutique…",
  style: "Sobre et argumentatif, pas d'emphase, vouvoiement systématique…",
  consignes: "Jamais d'abréviations dans les actes, toujours vérifier la date de consolidation…",
};

export const StructureActesSlot = ({ value, onChange }) => (
  <PreferenceSlot
    label={PREFERENCE_SLOT_LABELS.structure}
    placeholder={PLACEHOLDERS.structure}
    value={value}
    onChange={onChange}
  />
);

export const QuantumSlot = ({ value, onChange }) => (
  <PreferenceSlot
    label={PREFERENCE_SLOT_LABELS.quantum}
    placeholder={PLACEHOLDERS.quantum}
    value={value}
    onChange={onChange}
  />
);

export const ReferentielsSlot = ({ value, onChange }) => (
  <PreferenceSlot
    label={PREFERENCE_SLOT_LABELS.referentiels}
    placeholder={PLACEHOLDERS.referentiels}
    value={value}
    onChange={onChange}
  />
);

export const StyleTonSlot = ({ value, onChange }) => (
  <PreferenceSlot
    label={PREFERENCE_SLOT_LABELS.style}
    placeholder={PLACEHOLDERS.style}
    value={value}
    onChange={onChange}
  />
);

export const ConsignesSlot = ({ value, onChange }) => (
  <PreferenceSlot
    label={PREFERENCE_SLOT_LABELS.consignes}
    placeholder={PLACEHOLDERS.consignes}
    value={value}
    onChange={onChange}
  />
);
