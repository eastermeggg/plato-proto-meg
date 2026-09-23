---
name: ds-figma-releve
description: Relève le thème d'un fichier Figma (variables, styles, typo, radius, élévations, effets) avec le MCP Figma et le consigne dans un document versionné, avec un niveau de confiance par ligne et les anomalies signalées. À utiliser quand un utilisateur dit "relève les tokens du Figma", "extrais les variables", "fais le relevé du thème", "audite les variables Figma", "extract the tokens from this Figma file", ou au démarrage d'un DS (phase tokens de ds-figma-bootstrap). Lecture seule — ne modifie ni le Figma, ni ds-theme.json, ni globals.css : le relevé alimente une décision, il n'applique rien. Si le thème est déjà encodé et que la question est "le Figma a-t-il bougé ?", c'est ds-figma-update, pas cette skill.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-figma-releve — relever un thème Figma sans le déformer

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Un relevé est une photographie datée, pas un import. Il consigne ce que le
Figma dit — y compris ses incohérences — avec un niveau de confiance par
ligne. Les décisions (aliaser, créer, fusionner, ignorer) viennent après,
ailleurs, validées par un humain.

## Mode Figma — vérifier avant tout

Lire `figma.mode` dans `ds.manifest.json` :

| Mode | Cette skill |
|---|---|
| `none` | **Refuse de tourner.** Répondre : le projet est code-first sans Figma ; la demande passe par `ds-explore` / `ds-build`. |
| `intent` | Tourne normalement : le Figma est une intention datée, le code reste la vérité. |
| `mirror` | **Refuse de tourner** — mode non disponible dans ce set (à l'étude, set v2). |

## Quand cette skill a le droit de tourner

Doctrine (`docs/figma-reference.md`) : les tokens s'extraient **une fois**, au
démarrage. Trois cas légitimes :

1. **Bootstrap** d'un nouveau DS (phase tokens de `ds-figma-bootstrap`).
2. **Re-relevé explicitement demandé** par le steward du DS (ex. le dark
a été refait dans Figma) — versionné v2, v3… avec le diff en tête.
3. **Zone jamais relevée** : une famille de tokens ajoutée dans Figma depuis
le dernier relevé.

Si la question est « le Figma et le code ont-ils divergé ? » : c'est `ds-figma-update` (rapport de dérive, validation ligne à ligne par la steward), jamais un re-relevé.

## Pré-requis

- L'URL du fichier et, si possible, le **nœud de référence des tokens**
(`?node-id=` précis — souvent une table ou une page « Tokens » dans le
Figma). Ne jamais lancer `get_design_context` sur un fichier entier.
- Si les skills officielles Figma sont installées : charger
`figma-design-to-code` avant tout `get_design_context`.

## Étape 0 — audit express (15 min)

`get_variable_defs` sur le nœud principal :

- **Variables présentes** → relevé par variables, fiable.
- **Pas de Variables** (styles ou valeurs en dur) → relevé **visuel** via
`get_design_context` sur les écrans clés : c'est un relevé d'observation,
confiance « moyenne » au mieux, et ça se dit en tête du document.

## Étape 1 — croiser quatre sources, jamais une seule

| Source | Ce qu'elle donne | Ce qu'elle rate |
|---|---|---|
| `get_variable_defs` | valeurs résolues + alias | les styles non variabilisés |
| `get_metadata` | structure, sections, node-ids | les valeurs |
| `get_design_context` (par section) | fills réels des échantillons | coûteux — jamais sur le fichier entier |
| `get_screenshot` | structure visuelle, sections oubliées | tout le reste |

**Règle d'arbitrage** (apprise sur ce repo — cellules `ring` dark périmées) :
quand un texte affiché dans la maquette contredit la Variable résolue, **la
Variable fait foi**. Une cellule est un label écrit à la main, qui périme.
Noter la contradiction dans la colonne Notes et baisser la confiance à
« moyenne ».

Reporter les hex **explicites** (résolus), jamais un « →alias » seul : un
alias sans valeur n'est pas vérifiable à la réconciliation.

## Étape 2 — les deux modes, ligne à ligne

Light **et** dark pour chaque token couleur. Un dark manquant ou incohérent
(texte sombre sur fond sombre, blanc sur blanc) est une **anomalie signalée**
dans le relevé — elle ne se comble pas, ne s'invente pas, et ne se corrige
pas dans Figma.

## Étape 3 — le document

Écrire dans `docs/figma-theme-releve.md`, versionné en tête (v1, v2… + date +
méthode + diff avec la version précédente). Structure obligatoire :

1. **En-tête** : source (URL + node-id), date, méthode exacte, portée.
2. **Synthèse** : compte de tokens, points bloquants, confiance globale.
3. **Tables par famille sémantique** — colonnes : Nom source | équivalent
shadcn | Light (oklch + hex) | Dark (oklch + hex) | Alias | Notes |
Confiance.
4. **Valeurs partagées ou quasi identiques** — signalées, **jamais
fusionnées** : la fusion est une décision, pas un relevé.
5. **Absents** : ce que le set shadcn attend et que le Figma ne couvre pas.
6. **Tokens non-couleur** : typo (variables + compositions, avec la classe
Tailwind exacte par style), radius, élévation, tailles d'icône, effets.
7. **Annexe `cssVars`** au format `ds-theme.json` — correspondances de nom
exactes uniquement, `TODO` explicite pour tout mapping qui demande une
décision (jamais de valeur devinée à leur place).
8. **Décisions** : actées / en attente. Le relevé pose les questions, il ne
tranche pas.

## Interdits

- Inventer ou compléter une valeur manquante — la lister et s'arrêter sur
cette ligne.
- Fusionner deux tokens quasi identiques, ou arrondir une valeur sur une
échelle standard : c'est le travail de la réconciliation, pas du relevé.
- Corriger quoi que ce soit dans le Figma.
- Toucher `ds-theme.json`, `globals.css` ou `src/` — la seule écriture
autorisée est le document de relevé.

## Livrable

Le relevé, plus un message qui liste les décisions « en attente ». La suite
(tableau de réconciliation → validation humaine → application à
`ds-theme.json`) appartient à la phase tokens de `ds-figma-bootstrap`, ou à
le steward du DS.
