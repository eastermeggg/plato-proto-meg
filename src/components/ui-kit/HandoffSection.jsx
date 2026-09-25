import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, Terminal, Map, Wrench, Eye, Package } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import Tabs from '../ui/Tabs';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// ─────────────────────────────────────────────────────────────────────────────
// Handoff - la page de reprise du repo pour la team, par persona.
//
// Deux parcours : Dev (Alex, Anaïs) et Product (Vadim, Ben). Chaque parcours
// est une liste d'étapes ACTIONNABLES : quoi lire, quoi lancer, quoi exiger,
// quoi ne jamais faire. Le contenu double HANDOVER.md (le point d'entrée
// fichier) en version plateforme, orientée « je commence par quoi lundi matin ».
// ─────────────────────────────────────────────────────────────────────────────

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'RL Para Trial Central', 'Albra', Georgia, serif";

function Code({ children }) {
  return (
    <code style={{ fontFamily: MONO, fontSize: 12, background: colors.semantic.backgroundSubtle, border: `1px solid ${colors.semantic.border}`, borderRadius: 5, padding: '1px 6px', whiteSpace: 'nowrap' }}>
      {children}
    </code>
  );
}

function Kicker({ children }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.semantic.mutedForeground }}>
      {children}
    </div>
  );
}

function StepTitle({ icon: Icon, children }) {
  return (
    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SERIF, fontSize: 20, fontWeight: 500, letterSpacing: '-0.3px', color: colors.semantic.foreground, margin: '0 0 8px' }}>
      {Icon && <Icon style={{ width: 18, height: 18, color: colors.semantic.mutedForeground }} strokeWidth={1.75} />}
      {children}
    </h3>
  );
}

function Step({ num, title, icon, children }) {
  return (
    <section style={{ display: 'flex', gap: 16, paddingTop: 24, borderTop: `1px solid ${colors.semantic.border}` }}>
      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: colors.semantic.foregroundTertiary, width: 24, flexShrink: 0, paddingTop: 3 }}>
        {String(num).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <StepTitle icon={icon}>{title}</StepTitle>
        <div style={{ fontSize: 14, lineHeight: '21px', color: colors.semantic.secondaryForeground }}>{children}</div>
      </div>
    </section>
  );
}

function P({ children, last }) {
  return <p style={{ margin: last ? 0 : '0 0 10px' }}>{children}</p>;
}

// Ligne de tableau deux colonnes : libellé mono à gauche, explication à droite.
function Row({ left, right, width = 220 }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: `1px solid ${colors.semantic.borderSubtle}`, alignItems: 'baseline' }}>
      <div style={{ fontFamily: MONO, fontSize: 12, color: colors.semantic.foreground, width, flexShrink: 0 }}>{left}</div>
      <div style={{ fontSize: 13, lineHeight: '19px', color: colors.semantic.secondaryForeground }}>{right}</div>
    </div>
  );
}

function DoDont({ doList, dontList }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
      <div style={{ flex: 1, minWidth: 260, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, background: colors.semantic.card, padding: 14 }}>
        <Badge variant="success" label="Exiger" />
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, lineHeight: '19px', color: colors.semantic.secondaryForeground }}>
          {doList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 260, border: `1px solid ${colors.semantic.border}`, borderRadius: 8, background: colors.semantic.card, padding: 14 }}>
        <Badge variant="destructive" label="Refuser" />
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, lineHeight: '19px', color: colors.semantic.secondaryForeground }}>
          {dontList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ── Parcours Dev : Alex, Anaïs ──────────────────────────────────────────────

function DevTrack({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Step num={1} title="Lire AGENTS.md (10 minutes, pas plus)" icon={BookOpen}>
        <P>
          <Code>AGENTS.md</Code> est la source unique des règles du repo - 11 règles dures + une
          carte des fichiers. <Code>CLAUDE.md</Code> n'est qu'un renvoi vers lui. Tout le reste
          de cette page en découle.
        </P>
        <P last>
          Complément fichier : <Code>HANDOVER.md</Code> (historique de ce qui a été fait, décisions
          en attente) et <Code>llms.txt</Code> (carte top-level).
        </P>
      </Step>

      <Step num={2} title="Lancer, puis vérifier que tout est vert" icon={Terminal}>
        <div style={{ marginBottom: 10 }}>
          <Row left="npm install && npm start" right="dev server CRA - la plateforme est sur /, le proto produit sur /app" />
          <Row left="npm run ds:doctor" right="LE garde-fou (hex bruts, fiches, frontières, manifeste). Doit sortir 0 constat bloquant - avant chaque rendu de main" />
          <Row left="npm run build" right="build de prod - l'autre moitié du contrat « avant de rendre la main »" />
          <Row left="npm run ds:docs" right="régénère componentDocs.json - obligatoire après toute édition d'une fiche ui/*.md" />
          <Row left="npm run ds:tokens" right="régénère le catalogue tokens (docs/tokens.md)" />
          <Row left="npm run ds:visual" right="diffs visuels Playwright - baselines en CI seulement (label ds-baselines), jamais en local" />
        </div>
        <P last>
          Audit ponctuel : <Code>node scripts/ds-audit.mjs</Code> (état du DS, moissonne
          SIGNALEMENTS.md) et <Code>node scripts/ds-changelog.mjs</Code> (changelog par composant).
        </P>
      </Step>

      <Step num={3} title="La règle qui évite 90 % des erreurs" icon={Map}>
        <P>
          <strong>Imiter /ui-kit, jamais App.js.</strong> Pour un nouvel écran, la référence à
          copier est un block du playground - en premier le block Écran-gabarit : shell +
          PageHeader + table + Dialog création + Drawer modification + AlertDialog + les 5 états
          (vide, chargement, erreur, partiel, idéal). <Code>App.js</Code> porte des anti-patterns
          hérités en cours de résorption : le cloner, c'est les propager.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Block Écran-gabarit" onClick={() => navigate('/ui-kit/b/ecran-gabarit')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Tous les blocks" onClick={() => navigate('/ui-kit/blocks')} />
        </div>
      </Step>

      <Step num={4} title="Un composant n'existe que dans l'inventaire" icon={Eye}>
        <P>
          Avant d'écrire le moindre composant : il est dans{' '}
          <Code>src/data/designSystemInventory.json</Code> ou il n'existe pas. Chaque composant
          canonique a sa fiche <Code>src/components/ui/&lt;Nom&gt;.md</Code> (8 champs, anglais,
          source de vérité), sa démo jouable et son entrée d'inventaire. Le besoin ne mappe sur
          rien ? La skill <Code>ds-decide</Code> tranche (biais par défaut : ne pas créer).
        </P>
        <P>
          Tokens sémantiques uniquement : <Code>src/design-system/tokens.js</Code> - zéro hex brut,
          zéro couleur Tailwind brute. Token manquant : le signaler dans{' '}
          <Code>SIGNALEMENTS.md</Code>, jamais l'inventer. <Code>tokens.js</Code> et{' '}
          <Code>src/index.css</Code> sont protégés : on ne les édite pas sans validation steward.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Inventaire" onClick={() => navigate('/ui-kit/inventory')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Tokens" onClick={() => navigate('/ui-kit/tokens')} />
        </div>
      </Step>

      <Step num={5} title="Travailler avec les agents : les skills ds-*" icon={Wrench}>
        <P>
          Le repo embarque un set de skills Claude Code dans <Code>.claude/skills/</Code>,
          configuré par <Code>ds.manifest.json</Code> (qui fait foi sur les chemins et la vérité
          Figma). En session, elles se déclenchent seules sur la bonne demande ; les connaître
          permet de formuler la bonne demande.
        </P>
        <div>
          <Row left="ds-build" right="construire une page / un écran / un proto avec le DS seul - la skill par défaut de « fais-moi cet écran »" />
          <Row left="ds-decide" right="avant TOUTE création de composant : existant, composition, variant ou création" />
          <Row left="ds-variant" right="ajouter une déclinaison (taille, intent) à un composant existant sans changer son rôle" />
          <Row left="ds-promote" right="faire entrer au DS ce qu'une feature a inventé hors DS (ou le refuser)" />
          <Row left="ds-review" right="vérifier qu'une production (souvent IA) respecte le DS, preuves fichier:ligne" />
          <Row left="ds-audit" right="état des lieux du DS entier + création d'issues - avant release ou merge d'une branche à SIGNALEMENTS non vide" />
          <Row left="ds-figma-build" right="implémenter un écran depuis un nœud Figma, rendu via tokens + inventaire" />
          <Row left="ds-figma-sync" right="drift check Variables Figma vs code, application ligne à ligne validée" />
        </div>
      </Step>

      <Step num={6} title="Le chantier en cours (sept. 2026)" icon={Package}>
        <div>
          <Row width={260} left="primitives manquantes" right="5/5 promues (Tooltip, RadioGroup, Popover, Sheet, Skeleton - PR #91 à #93). Le trou d'inventaire est fermé" />
          <Row width={260} left="composants « pending »" right="une vingtaine existent et marchent mais attendent la validation steward (pastille jaune dans l'inventaire) - flux /ui-kit/c/<id>, pas une édition JSON" />
          <Row width={260} left="dette App.js" right="~340 <button>, ~150 <input>, ~27 <select> bruts à résorber par lots. Non bloquant tant que la règle « imiter /ui-kit » tient" />
          <Row width={260} left="ombres inline" right="91 occurrences à mapper sur l'échelle shadows - débloqué par l'arbitrage du 24/09 (élévation par surfaces, aucun fork dark)" />
        </div>
      </Step>
    </div>
  );
}

// ── Parcours Product : Vadim, Ben ───────────────────────────────────────────

function ProductTrack({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Step num={1} title="Lire l'état du système en deux minutes" icon={Eye}>
        <P>
          L'inventaire est le tableau de bord : chaque composant y est <strong>validé</strong>,{' '}
          <strong>en cours</strong> (existe mais pas encore validé) ou <strong>manquant</strong>.
          Depuis chaque ligne, la page composant donne la fiche, la démo jouable et le lien Figma.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Inventaire" onClick={() => navigate('/ui-kit/inventory')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Blocks (écrans types)" onClick={() => navigate('/ui-kit/blocks')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Proto produit" onClick={() => navigate('/app')} />
        </div>
      </Step>

      <Step num={2} title="Ce que vous seuls validez" icon={BookOpen}>
        <P>
          Trois décisions ne se délèguent jamais à un agent :
        </P>
        <ul style={{ margin: '0 0 10px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>
            <strong>Le passage « en cours » vers « validé »</strong> d'un composant : sur sa page
            (/ui-kit/c/&lt;id&gt;), après revue visuelle contre le Figma. C'est ce qui rend
            l'inventaire vert.
          </li>
          <li>
            <strong>Les fichiers protégés</strong> (<Code>tokens.js</Code>, <Code>index.css</Code>) :
            un agent les signale, ne les édite pas.
          </li>
          <li>
            <strong>Les écarts Figma</strong> : la vérité est mixte par surface
            (<Code>docs/design-truth.md</Code>). Surface absente du registre ou doute : l'agent
            pose la question, il ne « corrige » jamais seul.
          </li>
        </ul>
        <P last>
          Les dettes vivent dans deux fichiers : <Code>ECARTS.md</Code> (dettes assumées, steward
          seul) et <Code>SIGNALEMENTS.md</Code> (constats d'agents, moissonnés ensuite par la
          skill ds-audit).
        </P>
      </Step>

      <Step num={3} title="Demander un écran à un agent" icon={Wrench}>
        <P>
          Une demande bien formulée : « construis &lt;l'écran&gt; en imitant le block
          Écran-gabarit, avec les 5 états et une seule action primaire ». Le reste suit.
        </P>
        <DoDont
          doList={[
            'Le gabarit : shell canonique + PageHeader, jamais une barre re-roulée',
            'Les 5 états de données : vide, chargement, erreur, partiel, idéal',
            'Une seule action primaire par écran - le reste en secondaire',
            'À la fin : ds:doctor 0 bloquant + build OK, annoncés dans la réponse',
          ]}
          dontList={[
            'Un écran « inspiré de App.js » (anti-patterns hérités)',
            'Des couleurs en dur ou un composant qui n\'est pas à l\'inventaire',
            'Une nav, une barre, un en-tête réinventés localement',
            'Un « fix » silencieux d\'un écart avec le Figma',
          ]}
        />
      </Step>

      <Step num={4} title="Les packages : aujourd'hui et la suite" icon={Package}>
        <P>
          <strong>Aujourd'hui : mono-package.</strong> Tout le DS vit dans ce repo
          (<Code>src/components/ui/</Code> + tokens). C'est voulu : on stabilise avant de
          découper.
        </P>
        <P>
          <strong>Étape 1 - extraire « ui-product »</strong> : le package produit (composants +
          tokens + fiches) part dans son propre package quand trois conditions sont vertes :
          ds:doctor à 0, SIGNALEMENTS.md vidé, inventaire stable (plus de pastilles jaunes en
          masse).
        </P>
        <P>
          <strong>Étape 2 - dériver « ui-marketing »</strong> : les assets landing / motion /
          extraits produit fidèles, construits sur ui-product avec une dépendance à sens unique
          (ui-marketing importe ui-product, jamais l'inverse).
        </P>
        <Alert
          variant="warning"
          title="Ordre non négociable"
          description="Ne pas lancer ui-marketing tant que ui-product n'est pas propre - sinon on fige les défauts du produit dans le marketing."
          style={{ maxWidth: 560 }}
        />
      </Step>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function HandoffSection({ navigate }) {
  const [persona, setPersona] = useState('dev');

  return (
    <div style={{ maxWidth: 860 }}>
      <p style={{ fontSize: 14, color: colors.semantic.foregroundSecondary, lineHeight: '21px', marginTop: 0, marginBottom: 8 }}>
        La page de reprise du repo, par persona. Le principe du projet en une phrase :{' '}
        <strong>design-system-first</strong> - cette plateforme (<Code>/</Code>) est l'outil de
        travail de la team ; le proto produit vit sur <Code>/app</Code> et se reconstruit
        progressivement sur le système. Stack : CRA, React 18, JavaScript, Tailwind v3.
      </p>
      <p style={{ fontSize: 13, color: colors.semantic.mutedForeground, lineHeight: '19px', marginTop: 0, marginBottom: 20 }}>
        Version fichier (historique, décisions en attente) : <Code>HANDOVER.md</Code> à la racine.
      </p>

      <Kicker>Choisis ton parcours</Kicker>
      <div style={{ marginTop: 4, marginBottom: 24 }}>
        <Tabs
          value={persona}
          onChange={setPersona}
          options={[
            { value: 'dev', label: 'Dev - Alex · Anaïs' },
            { value: 'product', label: 'Product - Vadim · Ben' },
          ]}
        />
      </div>

      {persona === 'dev' ? <DevTrack navigate={navigate} /> : <ProductTrack navigate={navigate} />}
    </div>
  );
}
