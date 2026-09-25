import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, Terminal, Map, Wrench, Eye, Package, Download } from 'lucide-react';
import { colors } from '../../design-system/tokens';
import Tabs from '../ui/Tabs';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// ─────────────────────────────────────────────────────────────────────────────
// Handoff. Le passage de témoin : la steward (Meghan) quitte Hexa, le repo
// passe dans les mains de la team. Deux parcours : Dev (Alex, Anaïs) et
// Product (Vadim, Ben), plus le bloc « Jour 1 » qui transfère le rôle de
// steward. HANDOVER.md à la racine reste la version longue.
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
      <Step num={1} title="Lis AGENTS.md, 10 minutes" icon={BookOpen}>
        <P>
          Toutes les règles du repo tiennent dans <Code>AGENTS.md</Code> : 12 règles dures et une
          carte des fichiers. <Code>CLAUDE.md</Code> n'est qu'un renvoi. Tout ce que je raconte
          sur cette page en découle.
        </P>
        <P last>
          En complément : <Code>HANDOVER.md</Code> pour l'historique et les décisions en attente,
          <Code>llms.txt</Code> pour la carte top-level, <Code>docs/architecture-plato.md</Code>{' '}
          pour l'architecture produit (nav, shell, objets métier).
        </P>
      </Step>

      <Step num={2} title="Lance, et vérifie que tout est vert" icon={Terminal}>
        <div style={{ marginBottom: 10 }}>
          <Row left="npm install && npm start" right="le dev server. La plateforme est sur /, le proto sur /app" />
          <Row left="npm run ds:doctor" right="le garde-fou : hex en dur, fiches, frontières, éléments HTML bruts, courbes de motion. Doit sortir 0 bloquant avant de rendre la main, la CI le vérifie aussi" />
          <Row left="npm run build" right="le build de prod, l'autre moitié du contrat" />
          <Row left="npm run ds:docs" right="à relancer après chaque édition d'une fiche ui/*.md" />
          <Row left="npm run ds:tokens" right="régénère le catalogue tokens dans docs/tokens.md" />
          <Row left="npm run ds:visual" right="diffs visuels Playwright. Les baselines se génèrent en CI avec le label ds-baselines, jamais en local" />
        </div>
        <P last>
          Pour un état des lieux : <Code>node scripts/ds-audit.mjs</Code> (avec{' '}
          <Code>--harvest</Code>, il transforme SIGNALEMENTS.md en issues). Le changelog par
          composant : <Code>node scripts/ds-changelog.mjs</Code>.
        </P>
      </Step>

      <Step num={3} title="On obéit à /ui-kit, jamais à App.js" icon={Map}>
        <P>
          C'est la règle qui t'évitera le plus d'ennuis, et ce n'est pas de l'inspiration : le
          block fait loi. Pour un nouvel écran, tu pars d'un block du playground et tu ne t'en
          écartes pas, en premier l'Écran-gabarit : shell, PageHeader, table, Dialog de
          création, Sheet de modification, AlertDialog et les 5 états (vide, chargement, erreur,
          partiel, idéal). <Code>App.js</Code> n'est plus un danger : chaque site restant est
          fléché vers sa cible DS, et le ratchet interdit tout retour comme tout élément brut
          dans un fichier neuf. Mais il reste l'existant, pas la référence : ce qui naît part
          d'un block.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Block Écran-gabarit" onClick={() => navigate('/ui-kit/b/ecran-gabarit')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Tous les blocks" onClick={() => navigate('/ui-kit/blocks')} />
        </div>
      </Step>

      <Step num={4} title="Un composant qui n'est pas dans l'inventaire n'existe pas" icon={Eye}>
        <P>
          Avant d'écrire quoi que ce soit, regarde <Code>src/data/designSystemInventory.json</Code>.
          Chaque composant a sa fiche <Code>src/components/ui/&lt;Nom&gt;.md</Code> (c'est elle qui
          fait foi), sa démo jouable et son entrée d'inventaire. Si ton besoin ne mappe sur rien,
          la skill <Code>ds-decide</Code> tranche, et son biais par défaut est de ne pas créer.
        </P>
        <P>
          Côté couleurs : uniquement les tokens de <Code>src/design-system/tokens.js</Code>, zéro
          hex en dur, le doctor le bloque de toute façon. S'il te manque un token, tu le notes
          dans <Code>SIGNALEMENTS.md</Code>, tu ne l'inventes pas. <Code>tokens.js</Code> et{' '}
          <Code>index.css</Code> sont protégés : on ne les touche pas sans passer par le steward.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Inventaire" onClick={() => navigate('/ui-kit/inventory')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Tokens" onClick={() => navigate('/ui-kit/tokens')} />
        </div>
      </Step>

      <Step num={5} title="Les skills ds-*, ou comment parler aux agents" icon={Wrench}>
        <P>
          Les skills vivent dans <Code>.claude/skills/</Code>, configurées par{' '}
          <Code>ds.manifest.json</Code> qui fait foi sur les chemins et la vérité Figma. Elles se
          déclenchent seules quand la demande est claire. Les connaître sert surtout à formuler
          la bonne demande.
        </P>
        <div>
          <Row left="ds-build" right="construire un écran ou un proto avec le DS seul. La skill par défaut de « fais-moi cet écran »" />
          <Row left="ds-decide" right="avant toute création de composant. Existant, composition, variant ou création : elle tranche" />
          <Row left="ds-variant" right="ajouter une déclinaison (taille, intent) à un composant existant sans changer son rôle" />
          <Row left="ds-promote" right="faire entrer au DS ce qu'une feature a inventé hors DS, ou le refuser" />
          <Row left="ds-review" right="relire une production (souvent d'agent) contre le DS, preuves fichier:ligne à l'appui" />
          <Row left="ds-audit" right="l'état des lieux complet, avec création d'issues. À lancer avant une release ou quand SIGNALEMENTS.md n'est pas vide" />
          <Row left="ds-figma-build" right="implémenter un écran depuis un nœud Figma, rendu via tokens et inventaire" />
          <Row left="ds-figma-sync" right="comparer les Variables Figma au code, appliquer ligne à ligne après validation" />
        </div>
      </Step>

      <Step num={6} title="L'état à la passation, 25/09/2026" icon={Package}>
        <div>
          <Row width={260} left="catalogue" right="complet et tout vert : 73 composants validated, 10 blocks validated. Les 5 primitives manquantes ont été promues, Sheet a absorbé Drawer. Restent 3 missing produit à construire un jour : PlanCard, ChatBubble, ChatMessageList" />
          <Row width={260} left="validation" right="la passe est faite. Le board /ui-kit/validation sert maintenant à GARDER l'inventaire vert au fil des créations - le badge de la nav te dit s'il y a du pending" />
          <Row width={260} left="App.js" right="plus de legacy sauvage : zéro élément brut non justifié, 106 sites déjà convertis vers le DS, 422 fléchés vers leur cible (grep ds-raw-ok src/App.js). Conversion par lots, catégorie par catégorie ; le ratchet interdit tout retour" />
          <Row width={260} left="arbitrages légués" right="deux dossiers pour le prochain steward : 28 ombres inline à mapper sur l'échelle shadows (débloqué par l'arbitrage du 24/09) et 20 courbes de motion improvisées, à bénir en easing spring ou à faire converger (docs/motion.md)" />
        </div>
      </Step>
    </div>
  );
}

// ── Parcours Product : Vadim, Ben ───────────────────────────────────────────

function ProductTrack({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Step num={1} title="L'état du système se lit en deux minutes" icon={Eye}>
        <P>
          L'inventaire te donne l'état réel : validé, en cours, manquant. Chaque ligne ouvre la
          page du composant avec sa fiche, sa démo jouable et son lien Figma quand il existe.
        </P>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Inventaire" onClick={() => navigate('/ui-kit/inventory')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Blocks (écrans types)" onClick={() => navigate('/ui-kit/blocks')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Proto produit" onClick={() => navigate('/app')} />
        </div>
      </Step>

      <Step num={2} title="Trois choses ne partent jamais chez un agent" icon={BookOpen}>
        <ul style={{ margin: '0 0 10px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>
            <strong>Le passage « en cours » vers « validé »</strong> d'un composant. C'est la
            passe du steward, elle se fait sur la page du composant ou en lot sur
            /ui-kit/validation. Le JSON n'est jamais édité à la main.
          </li>
          <li>
            <strong>Les fichiers protégés</strong> (<Code>tokens.js</Code>, <Code>index.css</Code>).
            Un agent le signale, il n'y touche pas.
          </li>
          <li>
            <strong>Les écarts Figma</strong>. La vérité dépend de la surface, le registre est
            dans <Code>docs/design-truth.md</Code>. Dans le doute, l'agent pose la question. Il
            ne corrige jamais tout seul.
          </li>
        </ul>
        <P last>
          Les dettes vivent dans deux fichiers : <Code>ECARTS.md</Code> pour ce qu'on assume
          (steward seul), <Code>SIGNALEMENTS.md</Code> pour les constats d'agents, que ds-audit
          moissonne ensuite.
        </P>
      </Step>

      <Step num={3} title="Demander un écran à un agent" icon={Wrench}>
        <P>
          La phrase qui marche : « construis &lt;l'écran&gt; en suivant le block Écran-gabarit à la lettre,
          avec les 5 états et une seule action primaire ». Le reste suit tout seul.
        </P>
        <DoDont
          doList={[
            'Le gabarit : shell canonique + PageHeader, jamais une barre refaite à la main',
            'Les 5 états si l\'écran montre des données : vide, chargement, erreur, partiel, idéal',
            'Une seule action primaire par écran, le reste en secondaire',
            'Le motion du catalogue (docs/motion.md) : durées et courbes de tokens.motion, micro-interactions existantes avant d\'en inventer',
            'À la fin : ds:doctor 0 bloquant + build OK, annoncés dans la réponse',
          ]}
          dontList={[
            'Un écran « inspiré de App.js » : c\'est l\'existant, pas la référence',
            'Des couleurs en dur ou un composant absent de l\'inventaire',
            'Une nav, une barre ou un en-tête réinventés localement',
            'Un « fix » silencieux d\'un écart avec le Figma',
          ]}
        />
      </Step>

      <Step num={4} title="Les packages : aujourd'hui et la suite" icon={Package}>
        <P>
          <strong>Aujourd'hui on est mono-package.</strong> Tout le DS vit dans ce repo,
          composants et tokens. C'est voulu : on stabilise avant de découper.
        </P>
        <P>
          <strong>Étape 1, extraire ui-product.</strong> Le package produit part de son côté
          quand trois conditions sont vertes : doctor à 0, SIGNALEMENTS.md vidé, inventaire
          stable.
        </P>
        <P>
          <strong>Étape 2, dériver ui-marketing.</strong> Les assets landing, motion et extraits
          produit, construits sur ui-product. La dépendance est à sens unique : ui-marketing
          importe ui-product, jamais l'inverse.
        </P>
        <Alert
          variant="warning"
          title="Dans cet ordre, pas autrement"
          description="On ne lance pas ui-marketing tant qu'ui-product n'est pas propre. Sinon on fige les défauts du produit dans le marketing."
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
        Je pars, ce repo est à vous maintenant. Cette page est mon passage de témoin : tout ce
        qu'il faut pour le reprendre sans moi. Le principe du projet : tout part du design system.
        Cette plateforme (<Code>/</Code>) est votre outil de travail ; le proto vit sur{' '}
        <Code>/app</Code> et se reconstruit petit à petit sur le système. Stack : CRA, React 18,
        JavaScript, Tailwind v3.
      </p>
      <p style={{ fontSize: 13, color: colors.semantic.mutedForeground, lineHeight: '19px', marginTop: 0, marginBottom: 20 }}>
        L'historique complet et les décisions en attente sont dans <Code>HANDOVER.md</Code> à la
        racine. Rien ne dépend de ma mémoire : si un truc n'est écrit nulle part, c'est qu'il
        n'existe pas. Meghan.
      </p>

      <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 12, background: colors.semantic.card, padding: '14px 18px', marginBottom: 24 }}>
        <Kicker>Le package, à emporter</Kicker>
        <p style={{ fontSize: 13, color: colors.semantic.secondaryForeground, lineHeight: '19px', margin: '8px 0 10px' }}>
          Tout tient dans le repo : le design system (<Code>src/components/ui</Code> +{' '}
          <Code>tokens.js</Code>), la plateforme, le proto, les garde-fous et les docs.
          Téléchargez, puis <Code>npm install && npm start</Code> : vous avez tout. Le zip donne
          le code et les docs ; pour l'historique git, la CI et la protection de branche,
          clonez plutôt le repo. Le split en vrai package npm « ui-product » viendra plus tard
          (conditions : volet Product, étape Packages).
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" icon={Download} label="Télécharger le repo (.zip, main)" onClick={() => window.open('https://github.com/eastermeggg/plato-proto-meg/archive/refs/heads/main.zip', '_blank')} />
          <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="trailing" label="Le repo sur GitHub" onClick={() => window.open('https://github.com/eastermeggg/plato-proto-meg', '_blank')} />
        </div>
      </div>

      <div style={{ border: `1px solid ${colors.semantic.border}`, borderRadius: 12, background: colors.semantic.card, padding: '14px 18px', marginBottom: 24 }}>
        <Kicker>Jour 1 : reprendre le rôle de steward</Kicker>
        <p style={{ fontSize: 13, color: colors.semantic.secondaryForeground, lineHeight: '19px', margin: '8px 0 6px' }}>
          Le steward, c'est la personne qui valide les composants, arbitre les écarts Figma et
          garde les fichiers protégés. Ce rôle était le mien, il lui faut un nouveau propriétaire.
          Trois gestes, dans l'ordre :
        </p>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, lineHeight: '19px', color: colors.semantic.secondaryForeground }}>
          <li><strong>Désignez le steward</strong> - le rôle peut tourner, l'important est qu'il soit incarné. Il n'arbitre que le coeur (tokens, validation, écarts Figma) ; pour tout le reste, les règles font de chacun un owner.</li>
          <li><strong>Remplacez <Code>@eastermeggg</Code></strong> par son handle GitHub dans <Code>.github/CODEOWNERS</Code>, sinon la protection de main attendra la revue d'un compte parti.</li>
          <li><strong>Mettez à jour <Code>owner</Code></strong> dans <Code>ds.manifest.json</Code> (rôle + contact).</li>
        </ol>
        <p style={{ fontSize: 13, color: colors.semantic.mutedForeground, lineHeight: '19px', margin: '8px 0 0' }}>
          La passe de validation, elle, est déjà faite (73 composants et 10 blocks validated) :
          le board /ui-kit/validation sert à garder ça vert au fil de vos créations.
        </p>
      </div>

      <div style={{ border: `1px solid ${colors.semantic.foreground}`, borderRadius: 12, background: colors.semantic.card, padding: '14px 18px', marginBottom: 24 }}>
        <Kicker>La règle commune, tous rôles confondus</Kicker>
        <p style={{ fontSize: 14, color: colors.semantic.foreground, lineHeight: '21px', margin: '8px 0 0' }}>
          <strong>On obéit au design system : ses composants, ses patterns, ses blocks.</strong>{' '}
          Ça vaut pour tout le monde, dev, product, designer, et pour les agents qu'on missionne.
          Un écran, un proto, une demande : tout part d'un block de /ui-kit et on ne s'en écarte
          pas ; App.js, désormais aligné et sous garde-fous, reste l'existant - pas la
          référence. Ce qui manque au système ne s'improvise pas,
          ça passe par les guichets : ds-decide, ds-variant, ds-promote, SIGNALEMENTS.md.
        </p>
      </div>

      <Kicker>Choisis ton parcours</Kicker>
      <div style={{ marginTop: 4, marginBottom: 24 }}>
        <Tabs
          value={persona}
          onChange={setPersona}
          options={[
            { value: 'dev', label: 'Dev · Alex · Anaïs' },
            { value: 'product', label: 'Product · Vadim · Ben' },
          ]}
        />
      </div>

      {persona === 'dev' ? <DevTrack navigate={navigate} /> : <ProductTrack navigate={navigate} />}
    </div>
  );
}
