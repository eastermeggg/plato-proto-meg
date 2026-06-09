import React from 'react';
import { Calculator, Pencil, Type, Scissors, IterationCcw } from 'lucide-react';

export const PREFERENCE_SLOT_IDS = ['chiffrage', 'redaction', 'nommage', 'decoupage'];

export const PREFERENCE_SLOT_LABELS = {
  chiffrage: 'Préférences de chiffrage',
  redaction: 'Préférences structure actes et rédaction',
  nommage: 'Préférences de nommage',
  decoupage: 'Préférences découpage documents',
};

export const PREFERENCE_SLOT_DESCRIPTIONS = {
  chiffrage: "Référentiels, barèmes et méthode que Plato suit pour évaluer chaque poste de préjudice.",
  redaction: "Plan, ton, style et consignes que Plato respecte pour rédiger vos actes.",
  nommage: "Format de nommage que Plato applique à vos pièces lors d'un import ou d'une réorganisation de dossier.",
  decoupage: "Règles que Plato suit pour découper un PDF entrant en pièces distinctes.",
};

export const PREFERENCE_SLOT_DEFAULTS = {
  chiffrage:
    "Chaque poste de préjudice est évalué selon le référentiel Mornet 2024 (DFP, souffrances endurées, préjudice esthétique). Pour la capitalisation des rentes et postes futurs, j'utilise la Gazette du Palais. ONIAM est réservé à l'aléa thérapeutique. DFT autour de 1 800 €/mois (à ajuster selon le coût de la vie locale). Pour les postes patrimoniaux (PGPA, PGPF, IP, FLA), toujours inclure un calcul détaillé en annexe avec hypothèses explicites. Penser aux intérêts au taux légal majoré et bien distinguer moratoires et compensatoires.",
  redaction:
    "Plan en trois parties : Faits et procédure / Discussion / Dispositif. Numérotation décimale (I, A, 1°), titres en gras sans soulignement. Citations de jurisprudence en notes de bas de page, jamais dans le corps. Toujours un récapitulatif chiffré en fin de discussion. Style : phrases courtes, voix active, ton sobre. Désigner « la concluante » plutôt que « ma cliente ». Préférer « il convient » à « il faut ». Toujours rappeler les fondements textuels (art. 1240 c. civ., loi Badinter, etc.) en début de discussion. Dispositif concis : une demande = une ligne.",
  nommage:
    "Format : « N° pièce — Nature — Auteur [JJ-MM-AAAA] ». Exemples : « 12 — Certificat médical — Dr. Martin [04-03-2024] », « 03 — Rapport d'expertise — Cabinet Lefèvre [22-11-2023] ». Conserver l'extension d'origine. Si l'auteur est inconnu, omettre le segment correspondant. Garder les accents et la casse usuelle des noms propres.",
  decoupage:
    "Découper un PDF dès qu'un changement d'auteur, de date ou de nature de document est détecté. Les rapports d'expertise médicale restent en un seul fichier, même longs. Les certificats successifs d'un même médecin sur une même journée sont fusionnés. Une page de garde isolée est rattachée au document suivant. Les annexes d'un rapport restent groupées avec le rapport principal.",
};

const SLOT_META = {
  chiffrage: { icon: Calculator, gradientFrom: '#dbeafe', iconColor: '#1d4ed8' },
  redaction: { icon: Pencil,     gradientFrom: '#f3e8ff', iconColor: '#7c3aed' },
  nommage:   { icon: Type,       gradientFrom: '#ecfdf5', iconColor: '#059669' },
  decoupage: { icon: Scissors,   gradientFrom: '#fffbeb', iconColor: '#d97706' },
};

function PreferenceSlot({ id, value, onChange }) {
  const meta = SLOT_META[id];
  const Icon = meta.icon;
  const label = PREFERENCE_SLOT_LABELS[id];
  const description = PREFERENCE_SLOT_DESCRIPTIONS[id];
  const defaultValue = PREFERENCE_SLOT_DEFAULTS[id];
  const isDirty = (value ?? '') !== defaultValue;

  return (
    <div
      className="bg-white rounded-lg border border-[#e7e5e3] p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 4px -2px rgba(26,26,26,0.05), 0 4px 6px -1px rgba(26,26,26,0.05)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md border border-[#e7e5e3] flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(180deg, ${meta.gradientFrom} 0%, #ffffff 100%)`,
            boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} style={{ color: meta.iconColor }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h4
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14, fontWeight: 500,
              color: '#292524', lineHeight: '20px', margin: 0,
            }}
          >
            {label}
          </h4>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12, fontWeight: 400,
              color: '#78716c', lineHeight: '16px',
              letterSpacing: '0.12px',
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          disabled={!isDirty}
          className="flex-shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[14px] font-medium text-[#292524] hover:bg-[#f8f7f5] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
          title="Restaurer le prompt par défaut"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <IterationCcw className="w-4 h-4" strokeWidth={1.75} />
          Réinitialiser
        </button>
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-[#f8f7f5] border border-[#e7e5e3] focus:outline-none focus:border-[#a8a29e] transition-colors"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          lineHeight: '20px',
          color: '#292524',
          padding: '10px 12px',
          minHeight: 176,
          maxHeight: 208,
          resize: 'vertical',
          overflowY: 'auto',
          boxShadow: '0 1px 2px rgba(26,26,26,0.05)',
        }}
      />
    </div>
  );
}

export const ChiffrageSlot = ({ value, onChange }) => (
  <PreferenceSlot id="chiffrage" value={value} onChange={onChange} />
);

export const RedactionSlot = ({ value, onChange }) => (
  <PreferenceSlot id="redaction" value={value} onChange={onChange} />
);

export const NommageSlot = ({ value, onChange }) => (
  <PreferenceSlot id="nommage" value={value} onChange={onChange} />
);

export const DecoupageSlot = ({ value, onChange }) => (
  <PreferenceSlot id="decoupage" value={value} onChange={onChange} />
);
