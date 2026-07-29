import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, ListTree, Percent } from 'lucide-react';
import CotisationsSection, {
  CotRow, OperateurCell, BadgePill, MontantCell, RegleTag, LinePanel,
  PrelevementPage, ResultatsBloc, cardChrome, ValuePill, PieceHolder,
  PiecePlaceholder, ProseText,
} from '../social/CotisationsSection';
import {
  COTISATIONS_VALEURS, COTISATIONS_REGLES, COTISATIONS_SOURCES, COTISATIONS_PAGES,
  CHIFFRAGE_PRELEVEMENTS, resolveCotLigne, fmtCot, pageLignes, pageSections,
} from '../../data/cotisationsSocial';

// ─────────────────────────────────────────────────────────────────────────────
// Cotisations et impôts (Social) - lab (spec v3) ET doc d'équipe de l'US.
//
// La section 00 raconte le produit (les trois écrans, le vocabulaire, la
// lecture d'une ligne) ; la suite détaille la spec. Le fil rouge : d'où
// viennent ces 2 245 € - de manière défendable face à un contradicteur.
// Récap de la spec + composants
// isolés : la ligne à huit emplacements (familles × états), la règle
// (composant, pas une note), les badges (cinq teintes par poids d'autorité),
// le panneau en prose, et les data sources agent-friendly.
// L'intégration réelle vit dans le Chiffrage d'un dossier « droit social »
// (?demo=social).
// ─────────────────────────────────────────────────────────────────────────────

const MONO = { fontFamily: "'IBM Plex Mono', monospace" };

function LabSection({ num, title, desc, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-2.5 mb-1.5">
        <span className="text-[12px] text-foreground-muted tabular-nums" style={MONO}>{num}</span>
        <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
      </div>
      {desc && <p className="text-[14px] text-foreground-secondary max-w-[760px] leading-relaxed mb-4">{desc}</p>}
      {children}
    </section>
  );
}

function SubHead({ children }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-2" style={MONO}>{children}</div>
  );
}

function ZoneDot({ n }) {
  return (
    <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full border border-border bg-background-canvas text-[10px] text-foreground-muted flex items-center justify-center tabular-nums" style={MONO}>{n}</span>
  );
}

function SegBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-medium transition-colors ${active ? 'bg-white text-foreground shadow-sm border border-border' : 'text-foreground-secondary hover:text-foreground'}`}
    >
      {children}
    </button>
  );
}

function SpecCard({ title, items }) {
  return (
    <div style={cardChrome}>
      <div className="px-4 py-2.5 border-b border-border bg-background-canvas">
        <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary" style={MONO}>{title}</span>
      </div>
      <ul className="px-4 py-3 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[14px] text-foreground-secondary leading-relaxed flex gap-2">
            <span className="text-foreground-muted flex-shrink-0">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DsTable({ columns, rows }) {
  return (
    <div style={{ ...cardChrome, overflowX: 'auto' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr className="bg-background-canvas border-b border-border">
            {columns.map(c => (
              <th key={c} className="text-left px-3 py-2 text-[10.5px] font-medium uppercase tracking-wider text-foreground-secondary whitespace-nowrap" style={MONO}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i < rows.length - 1 ? 'border-b border-border' : ''}>
              {r.map((cell, j) => (
                <td key={j} className={`px-3 py-2 text-[12px] align-top ${j === 0 ? 'text-foreground font-medium whitespace-nowrap' : 'text-foreground-secondary'}`} style={j === 0 ? MONO : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Une ligne par cas, tirée des vraies pages.
const findLine = (pk, id) => pageLignes(COTISATIONS_PAGES[pk]).find(l => l.id === id);
const SAMPLE = {
  poste: findLine('cot-sal', 's-hs'),
  ecartee: findLine('cot-sal', 's-il'),
  ecarteeEntamee: findLine('cot-sal', 's-di'),
  partielPoste: findLine('cot-ir', 'i-hs'),
  partielSortie: findLine('cot-ir', 'i-hs-exo'),
  taux: findLine('cot-sal', 's-taux'),
  intermediaire: findLine('cot-sal', 's-brut'),
  deduction: findLine('cot-sal', 's-reduc'),
  report: findLine('cot-pat', 'p-report'),
  attenteSaisie: findLine('cot-ir', 'i-taux'),
  resultatSection: findLine('cot-sal', 's-base'),
  resultatTableau: findLine('cot-sal', 's-total'),
};
// Fabriquée pour la démo : l'état « en cours de calcul » (la ligne existe,
// sa valeur pas encore).
const SAMPLE_EN_COURS = { id: 'demo-en-cours', famille: 'operation', etat: 'en_cours', operateur: '=', valueKey: 'cot.salBrut', panel: false };

// Sources fabriquées pour l'inventaire des badges (familles absentes du
// dossier de démo).
const DEMO_SOURCES = {
  convention: { id: 'demo-cc', type: 'CONVENTION', citation: 'CCN Transport routier, art. 12', extrait: 'Clause conventionnelle invoquée pour ce qu’elle prescrit.' },
  referentiel: { id: 'demo-ref', type: 'REFERENTIEL', citation: 'Référentiel Mornet', millesime: '2024', extrait: 'Le millésime est obligatoire : l’auditabilité exige la table et son édition.' },
  web: { id: 'demo-web', type: 'WEB', citation: 'service-public.fr', extrait: 'Aucune valeur probante - d’où l’absence de teinte.' },
};

export default function CotisationsLab() {
  const navigate = useNavigate();
  const [pageKey, setPageKey] = useState('cot-sal');
  const [panelLine, setPanelLine] = useState(null);
  const allLignes = Object.values(COTISATIONS_PAGES).flatMap(pageLignes);
  const demoRow = (ligne, key) => (
    <CotRow key={key || ligne.id} resolved={resolveCotLigne(ligne)} isLast onOpenPanel={setPanelLine} />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1100px] mx-auto px-8 py-10">
        <button
          onClick={() => navigate('/ui-kit')}
          className="flex items-center gap-1.5 text-[13px] text-foreground-secondary hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au UI Kit
        </button>

        <div className="mb-10">
          <h1 className="text-[22px] font-semibold text-foreground mb-1.5">Cotisations et impôts (Social)</h1>
          <p className="text-[14px] text-foreground-secondary max-w-[780px] leading-relaxed">
            Le doc de l'US pour l'équipe, adossé aux vrais composants : le problème qu'on résout,
            ce qu'on affiche écran par écran, et comment se lit une ligne. Il se lit sans rien connaître au droit.
            Le fil rouge tient en une question :
            <span className="font-medium text-foreground"> d'où viennent ces 2 245 €</span> - chaque chiffre doit
            pouvoir être défendu face à la partie adverse. Intégré au Chiffrage social
            (<span style={MONO} className="text-[12.5px]">?demo=social</span>), démos branchées sur le dossier fictif
            Camille Aubert.
          </p>
        </div>

        {/* 00 — l'US en bref : le problème, le produit, le vocabulaire */}
        <LabSection num="00" title="L'US en bref">
          <SubHead>Le problème - pourquoi ce calcul est un casse-tête</SubHead>
          <p className="text-[14px] text-foreground-secondary max-w-[780px] leading-relaxed mb-4">
            Quand un salarié attaque son employeur (licenciement contesté, heures supplémentaires impayées…),
            son avocat chiffre ce qu'il réclame. Ces montants sont en <span className="font-medium text-foreground">brut</span>,
            c'est-à-dire avant cotisations sociales et impôt. Or la première question du client est toujours la
            même : <span className="font-medium text-foreground">« combien vais-je vraiment toucher ? »</span> Y répondre
            est étonnamment difficile, pour quatre raisons.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              {
                t: "Ce n'est pas le métier de l'avocat",
                x: "Passer du brut au net est un calcul de paie et de fiscalité. L'avocat n'est ni gestionnaire de paie ni expert-comptable : faute d'outil, la réponse au client est « environ », ou « on verra ».",
              },
              {
                t: 'Chaque somme suit son propre régime',
                x: "Un rappel de salaire est cotisé et imposé. Une indemnité de licenciement peut échapper aux cotisations, en tout ou partie, sous plafond. Les heures supplémentaires ont leurs propres exonérations. Confondre ces régimes fausse tout le résultat.",
              },
              {
                t: 'Le chiffre doit tenir face à la partie adverse',
                x: "Un montant avancé en négociation ou à l'audience sera contesté. Il faut pouvoir montrer d'où il vient, ligne par ligne, textes à l'appui - et savoir lesquels sont solides (la loi) et lesquels sont discutables (la doctrine de l'administration).",
              },
              {
                t: 'Tout bouge en cours de dossier',
                x: "Un poste s'ajoute, un montant est revu à la baisse, une donnée n'arrive qu'en cours de route (le taux d'imposition dépend de la situation fiscale du client). À la main, tout le calcul serait à refaire à chaque fois.",
              },
            ].map((c) => (
              <div key={c.t} style={cardChrome} className="p-4">
                <div className="text-[13px] font-semibold text-foreground mb-1.5 leading-snug">{c.t}</div>
                <p className="text-[14px] text-foreground-secondary leading-relaxed">{c.x}</p>
              </div>
            ))}
          </div>

          <SubHead>Ce qu'on construit</SubHead>
          <p className="text-[14px] text-foreground-secondary max-w-[780px] leading-relaxed mb-8">
            La partie « Cotisations et impôts » du Chiffrage fait ce passage du brut au net, automatiquement,
            à partir des montants déjà établis dans le dossier. Elle estime les quatre
            <span className="font-medium text-foreground"> prélèvements</span> (cotisations salariales, CSG-CRDS,
            impôt sur le revenu, cotisations patronales) et en tire les deux chiffres de la négociation :
            le <span className="font-medium text-foreground">net pour le salarié</span> et
            le <span className="font-medium text-foreground">coût total pour l'employeur</span>. Et comme le chiffre
            doit tenir face à la partie adverse, chaque montant se vérifie : il s'ouvre, s'explique, et remonte
            jusqu'à ses textes et ses documents.
          </p>

          <SubHead>Le parcours - trois écrans, jamais plus</SubHead>
          <div className="grid grid-cols-3 gap-4 mb-3">
            {[
              {
                n: '1', titre: 'La page Chiffrage',
                texte: 'La section « Cotisations et impôts » : quatre lignes, une par prélèvement, et en dessous les deux chiffres de la négociation. Cliquer une ligne ouvre sa page de détail.',
              },
              {
                n: '2', titre: "La page d'un prélèvement",
                texte: "Le calcul complet, en deux temps : d'abord quels montants comptent (la base), puis le calcul lui-même (taux, réductions). Chaque partie se termine par son total, et la colonne s'additionne de tête. Cliquer une ligne ouvre son explication.",
              },
              {
                n: '3', titre: "L'explication d'une ligne",
                texte: "Un panneau en trois éléments : le titre, le montant, l'explication en français courant. C'est là que vivent les formules, chiffres à l'appui. Un montant cité mène à la ligne qui le produit ; une source s'ouvre pour lire le texte.",
              },
            ].map((s) => (
              <div key={s.n} style={cardChrome} className="p-4">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[12px] text-foreground-muted tabular-nums" style={MONO}>{s.n}</span>
                  <span className="text-[13px] font-semibold text-foreground leading-snug">{s.titre}</span>
                </div>
                <p className="text-[14px] text-foreground-secondary leading-relaxed">{s.texte}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-foreground-muted mb-8 max-w-[760px] leading-relaxed">
            Aucun champ à remplir, nulle part : pour changer une valeur, on le demande dans la conversation.
            Quand une donnée manque, la ligne affiche un tiret et l'explication dit comment la fournir.
          </p>

          <div className="mb-8">
            <SubHead>Le vocabulaire</SubHead>
            <DsTable
              columns={['terme', 'ce que c’est']}
              rows={[
                ['brut / net', 'Le brut est ce qu’on réclame, avant tout prélèvement. Le net est ce qui arrive réellement sur le compte du client.'],
                ['prélèvement', 'Ce qui est retiré entre le brut et le net. Quatre ici : cotisations salariales, CSG-CRDS, impôt sur le revenu - et les cotisations patronales, payées par l’employeur en plus du brut.'],
                ['poste', 'Un des montants réclamés : rappel d’heures supplémentaires, indemnité de licenciement… Chaque poste est candidat à entrer dans une base.'],
                ['base', 'La somme des postes sur lesquels un prélèvement se calcule vraiment. Certains postes y entrent, d’autres en sont exonérés (« écartés »).'],
                ['opération', 'Une étape du calcul : appliquer un taux (×), poser un sous-total (=), retirer une réduction (−).'],
                ['résultat', 'La dernière ligne d’une partie du tableau : les montants visibles au-dessus s’additionnent pour le donner - on peut vérifier de tête.'],
                ['règle', 'Ce qui justifie le sort d’une ligne, écrit en toutes lettres (« Plafond commun des indemnités de rupture »), avec ses propres sources. Jamais de chiffre dedans.'],
                ['renvois', 'Les textes qui fondent le droit de réclamer un montant : article de loi, décision de justice.'],
                ['pièce', 'Le document du dossier d’où le chiffre est tiré : relevé d’heures, bulletins de paie, contrat.'],
              ]}
            />
          </div>

          <div>
            <SubHead>Lire une ligne en dix secondes</SubHead>
            <div style={cardChrome}>
              <CotRow resolved={resolveCotLigne(SAMPLE.poste)} showPieceCell onOpenPanel={setPanelLine} />
              <CotRow resolved={resolveCotLigne(SAMPLE.ecartee)} isLast showPieceCell onOpenPanel={setPanelLine} />
            </div>
            <div className="mt-2.5 max-w-[760px] space-y-1.5">
              <p className="text-[13px] text-foreground-muted leading-relaxed">
                <span className="font-medium text-foreground">Ligne 1, un poste retenu.</span> La vignette de gauche
                montre le document d'où sort le chiffre. Le + dit qu'il entre dans la base. Les badges citent les
                textes qui fondent la réclamation. Le montant en chiffres alignés (8 874 €) compte dans la somme.
                Le chevron ouvre l'explication.
              </p>
              <p className="text-[13px] text-foreground-muted leading-relaxed">
                <span className="font-medium text-foreground">Ligne 2, un poste écarté.</span> « non soumise » en
                gris : ce montant ne compte pas dans la somme - il reste affiché en dessous, barré. La règle qui
                l'écarte est nommée, avec ses propres textes : c'est elle que la partie adverse attaquera.
                L'anatomie complète est au 03, tous les cas au 05.
              </p>
            </div>
          </div>
        </LabSection>

        {/* 01 — les trois règles du jeu */}
        <LabSection num="01" title="Les trois règles du jeu">
          <div className="grid grid-cols-3 gap-4">
            <SpecCard title="Tout se vérifie" items={[
              'Chaque ligne s’ouvre sur un panneau qui explique son chiffre, avec ses sources.',
              'Un chevron qui n’ouvre rien, un badge qui n’ouvre rien : des mensonges visuels. Aucun ici.',
            ]} />
            <SpecCard title="La colonne s'additionne" items={[
              '8 874 + 887 + 5 008 = 14 769 : les montants visibles d’une section donnent son résultat.',
              'Si un nombre est dans la colonne, il compte. Sinon il n’y est pas (qualificatif en texte gris).',
            ]} />
            <SpecCard title="Aucun montant n'est négatif" items={[
              '2 245 € est une quantité positive ; sa direction est portée par l’opérateur ou le titre de colonne.',
              'Aligné sur la page Chiffrage : la colonne s’intitule « Montant prélevé », les signes ont disparu.',
            ]} />
          </div>
        </LabSection>

        {/* 02 — niveau 1 : la page Chiffrage */}
        <LabSection
          num="02"
          title="Niveau 1 - sur la page Chiffrage : la section « Cotisations et impôts »"
          desc="Tout part de la page Chiffrage du dossier, celle qui liste les montants demandés (le brut). En dessous des postes, la section « Cotisations et impôts » affiche quatre lignes, une par prélèvement, sous le titre de colonne « Montant prélevé » : la direction est portée par le titre, aucun signe collé aux nombres. L'impôt, en attente du taux, affiche un tiret et son motif - pas un zéro. Cliquer une ligne remplace l'écran par la page du prélèvement."
        >
          <div className="max-w-[760px]">
            <CotisationsSection onOpenPage={(k) => setPageKey(k)} />
            <p className="text-[13px] text-foreground-muted mt-2">Le clic sélectionne la page correspondante dans la section 06.</p>
          </div>
          <div className="mt-8 max-w-[760px]">
            <SubHead>Juste en dessous : le bloc de résultats</SubHead>
            <p className="text-[14px] text-foreground-secondary max-w-[760px] leading-relaxed mb-4">
              La section débouche sur les deux chiffres de la négociation, côte à côte parce qu'ils forment un seul
              argument : ce que le salarié touchera, ce que l'employeur paiera. La mention « hors impôt sur le
              revenu » est dérivée, jamais écrite à la main : elle disparaît d'elle-même quand le taux arrive.
              Chaque chiffre s'ouvre et se vérifie comme n'importe quelle ligne.
            </p>
            <ResultatsBloc onOpenPanel={setPanelLine} />
          </div>
        </LabSection>

        {/* 03 — l'anatomie du tableau */}
        <LabSection
          num="03"
          title="L'anatomie du tableau - sections, groupes de postes, lignes"
          desc="De haut en bas : ce qui structure une page de prélèvement, puis la nature de chaque ligne, puis les huit emplacements à l'intérieur d'une ligne. La figure est schématique ; les vraies pages, interactives, sont au 06."
        >
          <SubHead>La structure - de haut en bas</SubHead>
          <div style={cardChrome} className="overflow-hidden max-w-[760px] mb-3">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
              <span className="text-[12px] text-foreground-muted">‹ Chiffrage</span>
              <span className="text-[13.5px] font-semibold text-foreground">Cotisations salariales</span>
              <span className="ml-auto text-[13.5px] font-semibold text-foreground" style={MONO}>2 245 €</span>
              <ZoneDot n="1" />
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-background-canvas border-b border-border">
              <span className="text-[13px] font-medium text-foreground">Base soumise à cotisations</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-foreground-secondary" style={MONO}>Montant demandé</span>
              <ZoneDot n="2" />
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border">
              <span className="text-[11.5px] font-medium text-foreground-secondary">Rappels de salaire</span>
              <span className="ml-auto" />
              <ZoneDot n="3" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="+" />
              <span className="text-[13px] text-foreground">Rappel d'heures supplémentaires</span>
              <span className="ml-auto text-[13px] font-medium text-foreground" style={MONO}>8 874 €</span>
              <ZoneDot n="4" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="+" />
              <span className="text-[13px] text-foreground">Congés payés sur heures supplémentaires</span>
              <span className="ml-auto text-[13px] font-medium text-foreground" style={MONO}>887 €</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border">
              <span className="text-[11.5px] font-medium text-foreground-secondary">Indemnités de rupture</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="+" />
              <span className="text-[13px] text-foreground">Indemnité compensatrice de préavis</span>
              <span className="ml-auto text-[13px] font-medium text-foreground" style={MONO}>5 008 €</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="+" />
              <span className="text-[13px] text-foreground-secondary">Indemnité légale de licenciement</span>
              <span className="ml-auto text-[13px] text-foreground-muted">non soumise</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background-canvas border-b border-border">
              <OperateurCell op="=" />
              <span className="text-[13px] font-semibold text-foreground">Base soumise à cotisations</span>
              <span className="ml-auto text-[13px] font-semibold text-foreground" style={MONO}>14 769 €</span>
              <ZoneDot n="5" />
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-background-canvas border-b border-border">
              <span className="text-[13px] font-medium text-foreground">Calcul de la cotisation</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-foreground-secondary" style={MONO}>Montant</span>
              <ZoneDot n="6" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="x" />
              <span className="text-[13px] text-foreground">Taux de cotisations salariales</span>
              <span className="ml-auto text-[13px] text-foreground-secondary" style={MONO}>22 %</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="=" />
              <span className="text-[13px] text-foreground">Cotisations avant déduction</span>
              <span className="ml-auto text-[13px] font-medium text-foreground" style={MONO}>3 249 €</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
              <OperateurCell op="-" />
              <span className="text-[13px] text-foreground">Réduction sur heures supplémentaires</span>
              <span className="ml-auto text-[13px] font-medium text-foreground" style={MONO}>1 004 €</span>
              <span className="flex-shrink-0 w-[18px]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2">
              <OperateurCell op="=" emphase />
              <span className="text-[13px] font-semibold text-foreground">Cotisations salariales</span>
              <span className="ml-auto text-[13px] font-semibold text-foreground" style={MONO}>2 245 €</span>
              <ZoneDot n="7" />
            </div>
          </div>
          <div className="mb-8 max-w-[760px]">
            <DsTable
              columns={['#', 'zone', 'son rôle']}
              rows={[
                ['1', 'en-tête de page', 'Collant : le retour, le titre et le total restent sous les yeux quand on descend. Le tableau n’a pas d’en-tête propre - le total n’apparaît jamais trois fois.'],
                ['2', 'bandeau de section', 'Nomme ce que la section produit (« Base soumise à cotisations ») et porte le libellé de la colonne des montants. C’est lui qui fait cohabiter deux natures de chiffres dans un seul tableau : « Montant demandé », puis « Montant ».'],
                ['3', 'groupe de postes', 'Optionnel : range les postes par famille juridique, les mêmes familles que sur la page Chiffrage. Détail ci-dessous.'],
                ['4', 'les lignes', 'Chacune est d’une des trois familles : un poste, une opération ou un résultat. Détail ci-dessous.'],
                ['5', 'résultat de section', 'Clôt la section et délivre ce que le bandeau annonce : 8 874 + 887 + 5 008 = 14 769. Les montants visibles s’additionnent, l’écarté ne compte pas.'],
                ['6', 'seconde section', 'Le calcul : le taux appliqué à la base, le sous-total, les réductions retirées.'],
                ['7', 'résultat du tableau', 'Le chiffre de l’en-tête, produit sous les yeux. C’est le montant repris sur la page Chiffrage.'],
              ]}
            />
          </div>

          <SubHead>Les groupes de postes (sous-sections)</SubHead>
          <p className="text-[14px] text-foreground-secondary max-w-[780px] leading-relaxed mb-4">
            Une section peut ranger ses lignes en groupes nommés - « Rappels de salaire », « Indemnités de
            rupture ». Ce sont <span className="font-medium text-foreground">les mêmes familles que sur la page
            Chiffrage</span> : un poste se retrouve rangé au même endroit sur les deux écrans. Un groupe se justifie
            quand les lignes sont de <span className="font-medium text-foreground">natures juridiques différentes</span>,
            jamais parce qu'elles sont nombreuses : sur la page cotisations, cinq lignes en trois groupes
            découperaient plus qu'ils n'aident ; sur la page impôt, huit lignes de trois natures, le groupe fait
            son travail. Les pages de démo (06) n'en ont pas encore.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { t: 'Tout ou rien', x: 'Une section range toutes ses lignes en groupes, ou aucune - jamais une ligne orpheline à côté de groupes nommés.' },
              { t: "Pas d'indentation", x: "Un groupe n'indente pas ses lignes : la colonne des opérateurs reste alignée sur toute la hauteur du tableau - c'est elle qui rend le calcul lisible." },
              { t: 'Pas de sous-total par défaut', x: "Un groupe n'affiche un sous-total que si ce chiffre est cité ailleurs. Sinon c'est une ligne « = » qui ne sert à rien." },
            ].map((c) => (
              <div key={c.t} style={cardChrome} className="p-4">
                <div className="text-[13px] font-semibold text-foreground mb-1.5 leading-snug">{c.t}</div>
                <p className="text-[14px] text-foreground-secondary leading-relaxed">{c.x}</p>
              </div>
            ))}
          </div>

          <SubHead>La nature d'une ligne - trois familles, quatre états, deux réglages</SubHead>
          <div className="max-w-[760px] mb-4">
            <DsTable
              columns={['famille', 'ce que c’est']}
              rows={[
                ['poste', 'Un montant réclamé, candidat à entrer dans la base. La seule famille qui peut être « écartée ».'],
                ['opération', 'Une étape du calcul : un taux (×), un sous-total (=), une déduction (−), une part qui sort de la base (− sur une ligne indentée).'],
                ['résultat', 'La dernière ligne d’une section ou du tableau : les montants visibles au-dessus s’additionnent pour le donner. C’est lui que le bandeau annonce.'],
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <SpecCard title="Quatre états" items={[
              'Normale - le cas par défaut.',
              'Écartée (postes seulement) - la valeur devient un mot (« non soumise »), le montant passe en dessous, barré ; la ligne recule d’un cran de gris mais reste entièrement cliquable.',
              'En attente - un tiret et son motif : « à renseigner » (une saisie manque, elle se demande dans la conversation) ou « à calculer » (transitoire, le temps qu’un calcul en amont se termine).',
              'En cours de calcul - la ligne existe, sa valeur pas encore.',
            ]} />
            <SpecCard title="Deux réglages, deux interdits" items={[
              'Indentée - réservée à ce qui SORT d’une base (une part exonérée). Une déduction n’est jamais indentée : elle agit après le calcul, pas sur la base.',
              'Mise en avant - le résultat : fond léger et gras pour une section, = foncé pour le tableau.',
              'Interdit : une opération ou un résultat ne s’écartent jamais - si la condition n’est pas remplie, la ligne n’existe pas (jamais de ligne à zéro).',
              'Interdit : aucun montant négatif - la direction (entre / sort) est portée par l’opérateur, jamais par un signe collé au nombre.',
            ]} />
          </div>

          <SubHead>Les huit emplacements d'une ligne - une rangée de cellules</SubHead>
          <p className="text-[14px] text-foreground-secondary max-w-[760px] leading-relaxed mb-4">
            La ligne n'est pas un assemblage libre : c'est une rangée de cellules autonomes, la structure des
            tables Plato (DataTableContent). Chaque cellule porte sa largeur et son padding ; la rangée (52 px min)
            ne fait qu'aligner. Les vingt-six cas de la spec sont des combinaisons des familles, états et réglages
            ci-dessus - aucun n'ajoute de composant ni de cellule.
          </p>
          <DsTable
            columns={['#', 'emplacement', 'cellule', 'ce qu’il contient']}
            rows={[
              ['1', 'pièce', 'pièce · 50 px', 'Le porte-document + compteur du chiffrage, quand le montant vient d’un document du dossier. Sur un poste sans pièce : l’état vide en pointillé. Cliquable.'],
              ['2', 'opérateur', 'opérateur · 46 px', 'Une pastille circulaire de largeur fixe : + − × = ou rien. L’alignement vertical de cette colonne rend le calcul lisible sans lire les libellés. Le − est neutre : le rouge est réservé au destructif.'],
              ['3', 'libellé', 'texte · flexible', 'Le nom du poste ou de l’opération. Deux lignes maximum, jamais tronqué : un poste tronqué n’est pas identifiable.'],
              ['4', 'renvois', 'texte · flexible', 'Les sources DU POSTE - celles qui fondent la créance. Deux au maximum, le surplus compté (+2 ouvre le panneau).'],
              ['5', 'règle', 'texte · flexible', 'La règle appliquée : nom rédigé, état d’application en mots, SES sources. Filet 2 px, jamais atténué. Aucun chiffre.'],
              ['6', 'note', 'texte · flexible', 'Provenance, dénombrement, constat de fait. Ni source, ni paramètre, jamais une formule.'],
              ['7', 'valeur', 'valeur', 'Chasse fixe pour un nombre (euro demi-gras noir, pourcentage et heures gris), texte normal gris pour un qualificatif. Montant demandé barré en dessous sur un poste écarté. Tiret + motif dérivé quand la valeur manque.'],
              ['8', 'chevron', 'actions', 'Seulement si la ligne ouvre un panneau.'],
            ]}
          />
          <p className="text-[13px] text-foreground-muted mt-3 max-w-[760px] leading-relaxed">
            Le test de la formule : un chiffre qui <span className="font-medium text-foreground">participe au calcul</span> va
            dans le panneau ; un chiffre qui <span className="font-medium text-foreground">décrit une situation</span> peut rester
            en note (« employeur de 20 salariés ou plus »). Aucune formule dans le tableau : ni libellé, ni boîte, ni badge.
          </p>
        </LabSection>

        {/* 04 — les cellules et les badges */}
        <LabSection
          num="04"
          title="Les cellules, la règle, et les badges"
          desc="La couleur d'un badge dit ce qui se passe au clic et quel poids d'autorité on invoque ; le préfixe dit le type précis. Cinq teintes + un traitement sans teinte pour douze types de référence - aucune n'est orange (réservé : alerte) ni rouge (réservé : destructif)."
        >
          <div className="grid grid-cols-2 gap-4">
            <div style={cardChrome} className="p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-3" style={MONO}>L'opérateur - pastille neutre, largeur fixe</div>
              <div className="flex flex-col gap-1.5">
                {[
                  ['+', 'un montant qui entre dans un calcul'],
                  ['-', 'exclu de la base, ou déduit après le calcul - neutre : une réduction est une bonne nouvelle'],
                  ['x', 'un taux, porte sur la ligne du dessus'],
                  ['=', 'un résultat intermédiaire, sans emphase'],
                ].map(([sg, l]) => (
                  <div key={sg} className="flex items-center gap-2">
                    <OperateurCell op={sg} />
                    <span className="text-[12.5px] text-foreground-secondary">{l}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <OperateurCell op="=" emphase />
                  <span className="text-[12.5px] text-foreground-secondary">le résultat d'une section ou du tableau (encre pleine : il ressort)</span>
                </div>
              </div>
            </div>
            <div style={cardChrome} className="p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-3" style={MONO}>La valeur - la bascule typographique</div>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'euro', valeur: COTISATIONS_VALEURS['poste.hs'] },
                  { label: 'pourcentage', valeur: COTISATIONS_VALEURS['param.tauxSal'] },
                  { label: 'heures', valeur: COTISATIONS_VALEURS['base.heures'] },
                  { label: 'à renseigner', valeur: COTISATIONS_VALEURS['param.tauxMarginal'] },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between" style={{ minHeight: 28 }}>
                    <span className="text-[12.5px] text-foreground-muted" style={MONO}>{r.label}</span>
                    <MontantCell valeur={r.valeur} />
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ minHeight: 28 }}>
                  <span className="text-[12.5px] text-foreground-muted" style={MONO}>qualificatif</span>
                  <MontantCell valeur={COTISATIONS_VALEURS['poste.il']} qualificatif="non soumise" valeurSecondaire={1878} />
                </div>
              </div>
              <p className="text-[13px] text-foreground-muted mt-3 leading-relaxed">
                Chasse fixe = participe à la somme ; texte gris = n'y participe pas. Le tiret « à renseigner » signale
                une saisie qui manque - ici le taux d'imposition : seul le client le connaît, l'agent le demande dans
                la conversation. Son jumeau « à calculer » est transitoire (le temps qu'un calcul en amont se termine)
                et n'apparaît donc pas dans un dossier au repos.
              </p>
            </div>
            <div style={cardChrome} className="p-4 col-span-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-3" style={MONO}>Les badges - cinq teintes par poids d'autorité, un contour pointillé</div>
              <div className="flex flex-col gap-2.5">
                {[
                  ['Pièce du dossier · ouvre le document', <BadgePill source={COTISATIONS_SOURCES['piece-releve']} onOpen={() => {}} />],
                  ['Texte contraignant (§ : loi, règlement, convention, contrat) · ouvre l’extrait', <span className="inline-flex gap-2 flex-wrap"><BadgePill source={COTISATIONS_SOURCES['css-l242-1']} onOpen={() => {}} /><BadgePill source={DEMO_SOURCES.convention} onOpen={() => {}} /></span>],
                  ['Décision de justice (marteau) · ouvre l’extrait', <BadgePill source={COTISATIONS_SOURCES['jp-cass-hs']} onOpen={() => {}} />],
                  ['Référence non contraignante (tampon : BOSS, BOFIP, nomenclature, référentiel + millésime obligatoire) · ouvre l’extrait', <span className="inline-flex gap-2 flex-wrap"><BadgePill source={COTISATIONS_SOURCES['boss-rupture']} onOpen={() => {}} /><BadgePill source={DEMO_SOURCES.referentiel} onOpen={() => {}} /></span>],
                  ['Valeur dérivée (flèche sortante) · NAVIGUE vers la ligne qui la produit', <BadgePill valeur={{ label: 'Cotisations salariales', target: 'cot-sal' }} onNavigate={() => {}} />],
                  ['Variable de chiffrage (curseurs : rien ne la produit, un levier réglable dans le chat) · navigue', <BadgePill valeur={{ label: 'Salaire de référence', target: 'chiffrage', variable: true }} onNavigate={() => {}} />],
                  ['Source web · aucune valeur probante, donc aucune teinte', <BadgePill source={DEMO_SOURCES.web} onOpen={() => {}} />],
                ].map(([label, el], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-shrink-0" style={{ minWidth: 260 }}>{el}</span>
                    <span className="text-[13px] text-foreground-secondary">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-foreground-muted mt-3 leading-relaxed max-w-[820px]">
                Texte contraignant / référence non contraignante : la différence tient dans un mot, <span className="font-medium text-foreground">opposable</span>.
                Le BOSS est opposable à l'administration, pas au juge - c'est le terrain sur lequel on se bat, et ça se voit avant de lire
                le libellé. Un badge est toujours cliquable, jamais tronqué, ne porte <span className="font-medium text-foreground">jamais de montant </span>
                (PASS 2025, pas PASS 94 200 €), et garde sa pleine intensité sur une ligne écartée. Les familles sont nommées par fonction
                juridique, jamais d'après une source : elles voyagent d'une verticale à l'autre.
              </p>
            </div>
            <div style={cardChrome} className="p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-3" style={MONO}>La règle - un composant, pas une note</div>
              <div className="flex flex-col gap-3">
                <RegleTag regle={COTISATIONS_REGLES['regle.plafondRupture']} onOpenSource={() => {}} />
                <RegleTag regle={COTISATIONS_REGLES['regle.plafondRupture']} etatApplication="plafond déjà entamé" onOpenSource={() => {}} />
                <RegleTag regle={COTISATIONS_REGLES['regle.tepaSal']} onOpenSource={() => {}} />
              </div>
              <p className="text-[13px] text-foreground-muted mt-3 leading-relaxed">
                Nom rédigé, état d'application en mots (jamais un chiffre), et <span className="font-medium text-foreground">ses propres sources </span>
                - une source appartient à ce qu'elle justifie : Art. L. 242-1 CSS fonde le poste (renvois), le BOSS fonde la règle
                d'exclusion (ici). Le filet ne s'atténue jamais ; la règle n'ouvre pas son propre panneau.
              </p>
            </div>
            <div style={cardChrome} className="p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-foreground-secondary mb-3" style={MONO}>Pièces et variables - hors échelle d'autorité</div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2"><PieceHolder sources={[COTISATIONS_SOURCES['piece-releve']]} onClick={() => {}} /><span className="text-[12px] text-foreground-muted">une pièce</span></div>
                <div className="flex items-center gap-2"><PieceHolder sources={[COTISATIONS_SOURCES['piece-releve'], COTISATIONS_SOURCES['piece-bulletins'], COTISATIONS_SOURCES['piece-contrat']]} onClick={() => {}} /><span className="text-[12px] text-foreground-muted">plusieurs (compteur)</span></div>
                <div className="flex items-center gap-2"><PiecePlaceholder /><span className="text-[12px] text-foreground-muted">état vide (tient la colonne)</span></div>
                <ValuePill>2 504 € /mois</ValuePill>
              </div>
              <p className="text-[13px] text-foreground-muted leading-relaxed">
                La pièce est un fait du dossier, la valeur une donnée de l'application : elles ne fondent rien, elles alimentent.
                Le porte-document + compteur est réutilisé du chiffrage ; la pilule de valeur reprend le style du badge de
                variable (curseurs, teinte neutre) avec la valeur dedans - même langage visuel, du badge qui renvoie à la
                pilule qui affiche.
              </p>
            </div>
          </div>
        </LabSection>

        {/* 05 — la matrice des cas */}
        <LabSection
          num="05"
          title="La ligne : familles × états, cas par cas"
          desc="La taxonomie du 03 (familles × états × réglages), déclinée sur les vraies lignes du dossier de démo - chaque cas est une combinaison, aucun n'ajoute de composant. Un détail qui compte : sur un poste écarté, badges, filet et chevron gardent leur pleine intensité, car c'est souvent la ligne qu'on veut vérifier en premier."
        >
          <div className="flex flex-col gap-3">
            {[
              ['poste retenu - opérateur +, montant en euros, pièce + renvois (2 max puis compteur)', [SAMPLE.poste]],
              ['poste écarté - qualificatif, montant barré hors colonne, la règle qui l’écarte avec SES sources', [SAMPLE.ecartee]],
              ['même règle, seconde ligne du plafond partagé - l’état d’application distingue : « plafond déjà entamé »', [SAMPLE.ecarteeEntamee]],
              ['exclusion partielle - le poste entre en entier, la part exonérée sort par une ligne indentée (le montant retiré EST le plafond)', [SAMPLE.partielPoste, SAMPLE.partielSortie]],
              ['taux et résultat intermédiaire - opérateur ×, puis = sans emphase', [SAMPLE.taux, SAMPLE.intermediaire]],
              ['déduction - opérateur −, plein niveau, jamais indentée (elle agit après le calcul) ; la note constate, la règle justifie', [SAMPLE.deduction]],
              ['report d’un autre tableau - un badge de valeur qui navigue vers la ligne d’origine', [SAMPLE.report]],
              ['en attente d’une saisie - un tiret, son motif dérivé : la donnée se demande dans le chat', [SAMPLE.attenteSaisie]],
              ['en cours de calcul - la ligne existe, sa valeur pas encore', [SAMPLE_EN_COURS]],
              ['résultat de section (fond léger, gras) puis résultat du tableau (= foncé)', [SAMPLE.resultatSection, SAMPLE.resultatTableau]],
            ].map(([label, lignes], i) => {
              // Décision de tableau : la cellule pièce est présente pour
              // toutes les lignes du groupe dès qu'une seule en porte.
              const showPiece = lignes.filter(Boolean).some(l => l.pieceId);
              return (
                <div key={i}>
                  <div className="text-[11px] text-foreground-muted mb-1.5" style={MONO}>{label}</div>
                  <div style={cardChrome}>
                    {lignes.filter(Boolean).map((l, j) => (
                      <CotRow key={l.id} resolved={resolveCotLigne(l)} isLast={j === lignes.length - 1} showPieceCell={showPiece} onOpenPanel={setPanelLine} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </LabSection>

        {/* 06 — niveau 2 : la page d'un prélèvement */}
        <LabSection
          num="06"
          title="Niveau 2 - la page d'un prélèvement"
          desc="L'en-tête est une bande flush, bordée, COLLANTE (structure Plato) : le retour, le titre et le total à gauche→droite, et « Copier chiffrage » au bout. Le calcul est long, le titre et le total restent sous les yeux quand on descend. Le tableau, lui, n'a pas d'en-tête - ce serait le même chiffre une troisième fois. Deux sections : qu'est-ce qui compte, puis le calcul ; chacune nomme ce qu'elle produit et porte le libellé de sa colonne. Cliquer une ligne ouvre le panneau : trois blocs, titre, montant, explication en prose où montants (naviguent) et sources (ouvrent l'extrait) sont cliquables en ligne."
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-cream border border-border">
              {Object.values(COTISATIONS_PAGES).map(p => (
                <SegBtn key={p.key} active={pageKey === p.key} onClick={() => setPageKey(p.key)}>{p.title}</SegBtn>
              ))}
            </div>
          </div>
          {/* carte sans padding : l'en-tête flush se pose au ras du bord.
              Hauteur cappée + scroll interne pour montrer l'en-tête collant. */}
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div style={{ maxHeight: 620, overflowY: 'auto' }}>
              <PrelevementPage
                pageKey={pageKey}
                flush
                sticky
                onBack={() => {}}
                onNavigatePage={(t) => setPageKey(t || 'cot-sal')}
                onCopy={() => {}}
              />
            </div>
          </div>
          {pageKey === 'cot-sal' && (
            <p className="text-[13px] text-foreground-muted mt-3 max-w-[720px] leading-relaxed">
              Le cas de référence : deux postes écartés par un plafond partagé (une seule règle, deux lignes, l'état
              d'application « plafond déjà entamé » sur la seconde - l'ordre d'imputation est une propriété de la règle,
              jamais de l'affichage), et une déduction qui s'applique au montant calculé, pas à la base.
            </p>
          )}
          {pageKey === 'cot-ir' && (
            <p className="text-[13px] text-foreground-muted mt-3 max-w-[720px] leading-relaxed">
              Le cas le plus riche : une exclusion partielle (le poste entre en entier, 7 500 € sortent par la ligne
              indentée), des exonérations totales qui restent visibles (« ces montants ne sont pas imposés » est le
              meilleur argument fiscal de la demande), les déductibles repris des deux autres pages, et le tiret
              « à renseigner » sur le taux : il se demande dans le chat.
            </p>
          )}
          {pageKey === 'cot-pat' && (
            <p className="text-[13px] text-foreground-muted mt-3 max-w-[720px] leading-relaxed">
              Le cas conditionnel : la déduction forfaitaire dépend de l'effectif - la note constate la situation
              (« employeur de 20 salariés ou plus »), le panneau porte le calcul. En rupture conventionnelle une
              contribution spécifique s'ajouterait ; ici la condition n'est pas remplie : la ligne n'existe pas.
            </p>
          )}
        </LabSection>

        {/* 07 — niveau 3 : le panneau en prose */}
        <LabSection
          num="07"
          title="Niveau 3 - le panneau : une explication en prose"
          desc="Trois blocs seulement : le titre, le montant, l'explication. Le calcul, les montants utilisés et les sources ne sont pas des blocs séparés - ils sont racontés en phrases, parce que ce sont les relations entre les nombres (« ce plafond est commun aux deux », « elle s'applique au montant calculé, pas à la base ») que la découpe en blocs perdait. C'est ici que vivent les formules, valeurs substituées et arrondi visible. Deux natures de référence, deux traitements : un montant navigue, une source ouvre un extrait."
        >
          <div style={cardChrome} className="p-5 max-w-[560px]">
            <div className="text-[15px] font-semibold text-foreground mb-1">Réduction sur heures supplémentaires</div>
            <div className="mb-3" style={{ fontFamily: "'RL Para Trial Central', 'Albra', Georgia, serif", fontSize: 24, letterSpacing: '-0.5px' }}>1 004 €</div>
            <ProseText paragraphs={COTISATIONS_REGLES['regle.tepaSal'].prose} onNavigateValue={() => {}} />
          </div>
          <p className="text-[13px] text-foreground-muted mt-3 max-w-[720px] leading-relaxed">
            Tout montant cité est une référence <span style={MONO}>{'{montant:cle}'}</span>, jamais un nombre recopié - sinon le
            panneau peut se désynchroniser du tableau, et c'est le genre d'écart que la partie adverse trouve. Quand une valeur
            manque, la prose dit quoi, pourquoi, et comment la fournir : une phrase renvoyant à la conversation, jamais un bouton.
            Prose quand les entrées sont de natures différentes ; tableau de périodes en complément quand elles sont nombreuses
            et de même nature (douze bulletins).
          </p>
        </LabSection>

        {/* 08 — data sources */}
        <LabSection
          num="08"
          title="Data sources (agent-friendly)"
          desc="Le calcul est un graphe ; le rendu est une projection du graphe sur des surfaces. `expression` a disparu du modèle : la formule est racontée dans la prose, valeurs substituées. La famille d'un badge, le motif d'un tiret, le préfixe d'une valeur : dérivés, jamais stockés. L'ordre d'imputation d'un plafond partagé est une propriété de la règle."
        >
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-3.5 h-3.5 text-foreground-muted" />
                <span className="text-[12px] font-medium text-foreground-secondary" style={MONO}>DS Valeurs ({Object.keys(COTISATIONS_VALEURS).length})</span>
              </div>
              <DsTable
                columns={['value key', 'label', 'valeur', 'manque', 'domaine', 'sources']}
                rows={Object.values(COTISATIONS_VALEURS).map(v => [
                  v.key, v.label, v.value == null ? '—' : fmtCot(v.value, v.unit, { approx: v.approx }), v.manque ? `${v.manque}${v.manqueDetail ? ` · ${v.manqueDetail}` : ''}` : '-', v.domaine, String((v.sources || []).length),
                ])}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-3.5 h-3.5 text-foreground-muted" />
                <span className="text-[12px] font-medium text-foreground-secondary" style={MONO}>DS Règles ({Object.keys(COTISATIONS_REGLES).length})</span>
              </div>
              <DsTable
                columns={['rule key', 'nom (rédigé)', 'état d’application', 'entrées', 'sortie', 'ordre d’imputation']}
                rows={Object.values(COTISATIONS_REGLES).map(r => [
                  r.key, r.nom, r.etatApplication || '-', (r.entrees || []).join(', ') || '- (paramètre)', r.sortie, (r.ordreImputation || []).join(' → ') || '-',
                ])}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ListTree className="w-3.5 h-3.5 text-foreground-muted" />
                <span className="text-[12px] font-medium text-foreground-secondary" style={MONO}>DS Layout ({CHIFFRAGE_PRELEVEMENTS.length + allLignes.length} lignes sur 5 écrans)</span>
              </div>
              <DsTable
                columns={['id', 'écran', 'section', 'famille', 'état', 'op', 'liée à']}
                rows={[
                  ...CHIFFRAGE_PRELEVEMENTS.map(l => [l.id, 'chiffrage', 'Cotisations et impôts', 'prélèvement', 'active', '-', l.valueKey]),
                  ...Object.values(COTISATIONS_PAGES).flatMap(p => pageSections(p).flatMap(s => s.lignes.map(l => [
                    l.id, p.key, s.titre, l.famille, l.etat || 'active', l.operateur || '-', l.regleKey || l.valueKey || '-',
                  ]))),
                ]}
              />
            </div>
          </div>
        </LabSection>

        {/* 09 — décisions et questions ouvertes */}
        <LabSection num="09" title="Décisions de la revue, et ce qui reste ouvert">
          <div className="grid grid-cols-2 gap-4">
            <SpecCard title="Tranché dans cette itération" items={[
              'La formule quitte le tableau (boîte grise, suffixe de libellé, paramètre de règle, badge) : elle vit dans la prose du panneau, substituée et arrondie.',
              'Le panneau passe de quatre blocs à trois : titre, montant, explication en prose - les relations entre les nombres portent l’information.',
              'La règle devient un composant déclaré (filet 2 px, nom rédigé, état en mots, ses sources) - l’ancienne fente grise faisait trois métiers.',
              'Badges par fonction juridique : texte contraignant (violet, §), décision (vert, marteau), référence non contraignante (sépia, tampon - le BOSS quitte l’ambre), valeur (neutre, flèche/curseurs), web (pointillé). Deux max + compteur, jamais de montant.',
              'L’opérateur − passe en neutre ; page Chiffrage alignée : « Montant prélevé » sans signes.',
              'Un poste écarté garde badges, filet et chevron à pleine intensité.',
            ]} />
            <SpecCard title="Reste à trancher" items={[
              'L’ordre d’imputation d’un plafond partagé : porté par la règle (ordre_imputation), mais la décision juridique amont est à traiter avant le build (Vadim / Ben).',
              'Le − rouge du dommage corporel : décision de système, pas un choix local (Alex).',
              'Le vert de la décision de justice si Plato le réserve à un état de validation (Alex).',
              'Le seuil de repli des postes écartés (trois est arbitraire - à caler sur un dossier dense).',
              'Le survol d’une ligne écartée : même intensité que les actives, ou plus douce ?',
              'Où vivent la situation fiscale et l’effectif - deux informations de dossier (Vic).',
            ]} />
          </div>
        </LabSection>
      </div>

      {/* panneau latéral - partagé par les démos du lab */}
      {panelLine && (
        <LinePanel key={panelLine.id} resolved={panelLine} onClose={() => setPanelLine(null)} />
      )}
    </div>
  );
}
