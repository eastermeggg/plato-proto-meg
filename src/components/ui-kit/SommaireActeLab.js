import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActCanvas from '../redaction/ActCanvas';
import { MOCK_CONCLUSIONS_TEXT } from '../../data/redactionScenarios';

// ── Sample actes ────────────────────────────────────────────────────────────

// Best case — short acte, clean structure. Few headings, the three tick widths
// are distinguishable at a glance, no scroll.
const BEST_CASE = `TRIBUNAL JUDICIAIRE DE LYON

PLAISE AU TRIBUNAL

I. EXPOSÉ DES FAITS

Le 14 septembre 2024, un accident de la circulation est survenu impliquant le véhicule de Monsieur DUPONT et celui de Madame MARTIN.

II. DISCUSSION

A. Sur la recevabilité de l'action

L'action a été introduite dans le délai de prescription. Elle est donc recevable.

B. Sur le fond du litige

La responsabilité de la défenderesse est pleinement engagée au regard des éléments versés aux débats.

PAR CES MOTIFS

Il est demandé au Tribunal de déclarer l'action recevable et bien fondée.`;

// Average case — conclusions Dintilhac, ~14 titres, 4 niveaux, montants par poste.
const AVERAGE_CASE = MOCK_CONCLUSIONS_TEXT;

// Worst case — assignation cumulative, ~50 titres, 5 niveaux. Generated so the
// sommaire reaches its max height: collapsed ticks compress, expanded scrolls,
// tick widths cap at 3, the active entry stays visible.
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
function buildWorstCase() {
  const parties = [
    'SUR LA RECEVABILITÉ DE L\'ACTION',
    'SUR LA RESPONSABILITÉ DE LA DÉFENDERESSE',
    'SUR LE LIEN DE CAUSALITÉ',
    'SUR LES PRÉJUDICES PATRIMONIAUX',
    'SUR LES PRÉJUDICES EXTRA-PATRIMONIAUX',
    'SUR LES DEMANDES ACCESSOIRES',
  ];
  const postesPatrimoniaux = [
    ['Dépenses de santé actuelles (DSA)', '12 847,50 €'],
    ['Frais divers restés à charge', '2 310,00 €'],
    ['Perte de gains professionnels actuels (PGPA)', '56 000,00 €'],
    ['Perte de gains professionnels futurs (PGPF)', '184 029,61 €'],
    ['Incidence professionnelle', 'RÉSERVE'],
    ['Frais de logement adapté', 'pour mémoire'],
  ];
  const postesExtra = [
    ['Déficit fonctionnel temporaire (DFT)', '12 045,00 €'],
    ['Souffrances endurées (SE)', '28 000,00 €'],
    ['Préjudice esthétique temporaire', '3 500,00 €'],
    ['Déficit fonctionnel permanent (DFP)', '96 200,00 €'],
    ['Préjudice d\'agrément', '15 000,00 €'],
    ['Préjudice sexuel', 'RÉSERVE'],
  ];
  const lines = [
    'TRIBUNAL JUDICIAIRE DE PARIS',
    '',
    'ASSIGNATION À JOUR FIXE',
    '',
    'PLAISE AU TRIBUNAL,',
    '',
  ];
  const body = (n) =>
    `Au regard des pièces versées aux débats et de la jurisprudence constante en la matière, la démonstration qui suit établit le bien-fondé de la demande (point ${n}).`;

  parties.forEach((p, pi) => {
    lines.push(`${ROMAN[pi]}. ${p}`, '', body(pi + 1), '');
    if (pi === 3 || pi === 4) {
      const postes = pi === 3 ? postesPatrimoniaux : postesExtra;
      const cats = pi === 3
        ? ['Préjudices patrimoniaux temporaires', 'Préjudices patrimoniaux permanents']
        : ['Préjudices extra-patrimoniaux temporaires', 'Préjudices extra-patrimoniaux permanents'];
      cats.forEach((cat, ci) => {
        lines.push(`${String.fromCharCode(65 + ci)}. ${cat}`, '');
        const slice = postes.slice(ci * 3, ci * 3 + 3);
        slice.forEach(([label, montant], ni) => {
          lines.push(`${ni + 1}°) ${label} : ${montant}`, '', body(`${pi}.${ci}.${ni}`), '');
          if (ni === 0) {
            lines.push('Sur la méthode de capitalisation', '', body('cap'), '');
          }
        });
      });
    } else {
      lines.push('A. Au regard des éléments de fait', '', body('a'), '');
      lines.push('B. Au regard des règles de droit applicables', '', body('b'), '');
    }
  });

  lines.push('PAR CES MOTIFS, et sous toutes réserves,', '');
  for (let i = 1; i <= 6; i++) {
    lines.push(`${i}° CONDAMNER la défenderesse au paiement des sommes ci-dessus détaillées ;`, '');
  }
  lines.push('SOUS TOUTES RÉSERVES');
  return lines.join('\n');
}
const WORST_CASE = buildWorstCase();

// ── Demo frame ──────────────────────────────────────────────────────────────

function CaseFrame({ index, title, caption, content }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#a8a29e',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {String(index).padStart(2, '0')}
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#292524', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: '#78716c', margin: '0 0 12px', maxWidth: 720, lineHeight: '19px' }}>
        {caption}
      </p>
      <div
        style={{
          height: 620,
          borderRadius: 14,
          border: '1px solid #e7e5e3',
          overflow: 'hidden',
          backgroundColor: '#f8f7f5',
        }}
      >
        <ActCanvas content={content} />
      </div>
    </section>
  );
}

export default function SommaireActeLab() {
  const navigate = useNavigate();
  return (
    <div className="h-screen overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 48px 80px' }}>
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[#78716c] hover:text-[#292524] transition-colors"
          style={{ fontSize: 13, marginBottom: 18 }}
        >
          <ArrowLeft className="w-4 h-4" /> UI Kit
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
          Sommaire d'acte
        </h1>
        <p style={{ fontSize: 14, color: '#78716c', margin: '0 0 8px', maxWidth: 760, lineHeight: '21px' }}>
          Minimap flottante ancrée à droite du canvas, centrée verticalement. Repliée : une colonne
          de ticks dont la largeur encode la profondeur de la structure. Au survol : déploiement du
          sommaire complet avec libellés et montants. Scroll-spy : la section courante passe en encre
          et le sommaire la suit. Survolez les ticks à droite de chaque acte, puis faites défiler.
        </p>

        <div style={{ height: 1, background: '#f0eee9', margin: '20px 0 28px' }} />

        <CaseFrame
          index={1}
          title="Meilleur cas - acte court, structure nette"
          caption="Peu de titres, pas de défilement. Les trois largeurs de ticks se distinguent au premier coup d'œil. Le sommaire reste aéré."
          content={BEST_CASE}
        />
        <CaseFrame
          index={2}
          title="Cas moyen - conclusions, ~14 titres, 4 niveaux"
          caption="Tient dans la hauteur. En déplié, les montants par poste aident à repérer les gros préjudices (PGPF, DFP). L'imbrication suit la structure réelle du document."
          content={AVERAGE_CASE}
        />
        <CaseFrame
          index={3}
          title="Pire cas - assignation cumulative, ~50 titres, 5 niveaux"
          caption="On atteint la hauteur max : en replié les ticks se compriment pour rester une carte d'un seul tenant et plafonnent à 3 largeurs ; au survol, retour à des lignes pleines avec défilement interne, l'élément actif reste visible."
          content={WORST_CASE}
        />
      </div>
    </div>
  );
}
