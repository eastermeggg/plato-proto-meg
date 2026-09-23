# Registre des sources de vérité - design

> Référencé par `ds.manifest.json` (`figma.note`) et `AGENTS.md`. C'est LE
> document à consulter avant d'arbitrer un écart entre le Figma
> `Plato---Design` (`0eKtlRkT1Hbjh8Nqd47Woy`) et le code. La vérité est
> **mixte, décidée par surface** - jamais globale. En cas de doute sur une
> ligne : question pour la steward, pas de correction automatique.

Dernière mise à jour : 22/09/2026.

## Légende

- **Figma → code** : la frame Figma fait foi ; le code est un port qui doit lui rester conforme.
- **code → Figma** : le code fait foi ; ce qui existe dans Figma est un export du code (il peut être périmé sans que ce soit un bug).
- **code** : surface née code-first, sans contrepartie Figma significative.

## Thème (tokens)

| Élément | Vérité | Référence |
|---|---|---|
| Couleurs, typescale, radius, etc. | Figma → code (régime `ds-figma-update` : rapport de dérive, validation ligne à ligne, jamais automatique) | Figma « Plato - System » : couleurs 37373:4712, typescale 35720:35541, non-color 37383:2 → `src/design-system/tokens.js` (+ miroir `tailwind.config.js`) |

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
