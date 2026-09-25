# Registre des sources de vérité - design

> Référencé par `ds.manifest.json` (`figma.note`) et `AGENTS.md`. C'est LE
> document à consulter avant d'arbitrer un écart entre le Figma
> `Plato---Design` (`0eKtlRkT1Hbjh8Nqd47Woy`) et le code. La vérité est
> **mixte, décidée par surface** - jamais globale. En cas de doute sur une
> ligne : question pour la steward, pas de correction automatique.

Dernière mise à jour : 25/09/2026.

## Régime de création (décision steward du 25/09/2026)

**Le Figma est le socle, pas le passage obligé.** Il reste la source du thème
(tokens, régime `ds-figma-sync` inchangé) et des surfaces héritées listées au
registre ci-dessous. Mais la création de **nouvelles** surfaces et de
**nouveaux** composants se fait **directement via les agents, en code** - une
page Figma n'est plus un prérequis. Le chemin « surface dérivée » inauguré par
Tooltip / Popover / Sheet / Skeleton (PR #91-93) devient la voie normale, pas
l'exception.

Ce qui remplace la maquette quand il n'y en a pas :

1. **Tokens sémantiques uniquement** - le thème (lui, Figma-synchronisé) borne
   le rendu ; rien n'est inventé en dehors.
2. **Systématisation sur l'existant** : la nouvelle surface se dérive des
   composants et blocks voisins (comme Popover dérivé de SaveDestinationPopover
   / JPPopoverCard), jamais du goût du jour de l'agent.
3. **Le trio fiche + démo jouable + entrée d'inventaire**, et un rendu
   light + dark joint à la PR (la revue visuelle remplace la frame).
4. **La validation steward inchangée** : la création entre en `pending` ; le
   passage `validated` reste un geste humain.

Une surface née sous ce régime entre au registre avec la vérité **code** dès sa
création. L'export vers Figma reste possible ensuite (régime « code → Figma »,
comme la page Labour) - jamais l'inverse par défaut. `ds-figma-build` reste
disponible quand une frame existe (héritage, portages pixel-perfect) ; les
4 règles d'arbitrage ci-dessous continuent de régir ces portages.

## Légende

- **Figma → code** : la frame Figma fait foi ; le code est un port qui doit lui rester conforme.
- **code → Figma** : le code fait foi ; ce qui existe dans Figma est un export du code (il peut être périmé sans que ce soit un bug).
- **code** : surface née code-first, sans contrepartie Figma significative.

## Thème (tokens)

| Élément | Vérité | Référence |
|---|---|---|
| Couleurs, typescale, radius, etc. | Figma → code (régime `ds-figma-sync` : rapport de dérive, validation ligne à ligne, jamais automatique) | Figma « Plato - System » : couleurs 37373:4712, typescale 35720:35541, non-color 37383:2 → `src/design-system/tokens.js` (+ miroir `tailwind.config.js`) |

## Surfaces

| Surface | Emplacement code | Vérité | Référence |
|---|---|---|---|
| PreviewPanel V2 (panneau de prévisualisation systématisé) | `src/components/preview/` | **Figma → code** (pixel-perfect : header serif 56px, rail citations stone, sans footer) | frames PreviewPanel V2 (voir PR #73) |
| Nav dossier V2 (chrome fixe + en-tête sticky, DossierNavV2) | shell / nav dossier | **Figma → code** (décision du 14/09) | frame 4046 |
| Panneau document / pièce (état par défaut + découpé) | panneau pièces | **Figma → code** | frames « panel doc » (défaut + split) |
| Relevé d'heures (droit social) | `src/components/social/ReleveHeuresLab.js` | **code → Figma** | export vers la page « Labour » (2668:24241) - l'export suit le code, pas l'inverse |
| Cotisations & impôts (Social) | `src/components/social/CotisationsSection.js` | **code** (spec v3 en md) | lab `/ui-kit/cotisations` |
| Import email V2 « Récolte & Bordereau » + touchpoints | flux d'import + labs | **code** (2 specs master = source of truth produit) | labs `/ui-kit/import-dossier`, `/ui-kit/import-v2` |
| Connecteurs boîtes mail (modale deux volets, illustrations in-code) | `src/components/connectors/` | **code** | lab `/ui-kit/connecteurs` |
| Assistant / port Plato Nav (shell 4 états, composer riche) | `src/components/assistant/`, shell | **code** (porté depuis muscat-v1) | `PORT-NOTES.md` |
| Onboarding `/welcome` | `src/components/OnboardingFlow.js` | **code** | - |
| Hero motion (3 key screens landing) | lab `/ui-kit/hero-motion` | **code** | - |
| Labs `/ui-kit/*` en général | `src/components/ui-kit/` | **code** (explorations ; exclues du doctor) | - |

Toute surface absente de ce tableau : **à qualifier par la steward avant
d'arbitrer un écart**. Ajouter la ligne ici au moment de la qualification.

## Arbitrage Figma - les 4 règles (portage « pixel-perfect » d'un nœud)

1. **Le NŒUD fait foi pour la géométrie et la typo** (dimensions, paddings, gaps,
   tailles/tracking). Les **descriptions de composants Figma** documentent
   l'intention et l'usage - JAMAIS les mesures : elles sont souvent rédigées
   depuis d'anciennes versions du code et dérivent (ex. vécu : description
   « h48 px32 » quand le nœud dessine px-12/16). Nœud > description, toujours.
2. **Les COULEURS et OMBRES viennent des tokens, jamais des hex du nœud.**
   Les variables Figma et `tokens.js` divergent délibérément (bordures
   assombries d'un demi-cran, cf. `DECISIONS-HEX.md`) : on mappe la variable
   Figma vers le token de même rôle (`--border` → `colors.semantic.border`),
   on ne transcrit pas la valeur. « Pixel-perfect » = géométrie du nœud +
   couleurs des tokens.
3. **Un composant du nœud = un composant du code.** Si le nœud est composé
   d'atomes (KindIcon, MetaChip…), le code les expose aussi - jamais un
   monolithe qui redessine les atomes inline.
4. **Le DS en code et en prod est LA source.** Les composants naissent et
   évoluent en code (vibecoding) ; le Figma sert de cible d'intention au moment
   du portage, puis le DS établi (composants + tokens tels qu'ils tournent en
   prod) fait foi. Un écart découvert APRÈS portage n'est pas un bug du code :
   question steward.
