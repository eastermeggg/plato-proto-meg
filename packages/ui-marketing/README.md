# @plato/ui-marketing

L'**extension marketing / GTM**. Assets landing, motion et **extraits produits
fidèles** - rendus depuis `@plato/ui-product`, jamais réimités.

## Le principe : fidèle parce que c'est le vrai produit

Un extract marketing n'est **pas une maquette qui ressemble** au produit : c'est le
**vrai composant `ui-product`** (mêmes tokens, même Tailwind, même serif de marque)
rendu sur données mock via Remotion, dans un Chromium - donc les animations réelles
(le halo du composer, les états) sont captées telles quelles. Zéro dérive possible
entre la comm et le produit.

Preuve : `video-assistant/` importe les vrais `AssistantComposer` /
`ConversationsIndexPage` de `src/`, avec la config Tailwind de l'app et la fonte
`RL Albra`. Recette dans `video-assistant/remotion.config.ts`.

## Règle de frontière (à sens unique)

`ui-marketing` **consomme** `@plato/ui-product`, **jamais l'inverse**
(`ds-check-boundaries`). Le marketing ne réinvente rien de produit : il met en scène.
Si une composition marketing devient réutilisable côté produit, elle **remonte** via
`ds-promote` - elle ne reste pas coincée ici, et le produit ne l'importe pas d'ici.

## Contenu

- `assets/` - extraits produits fidèles (rendus depuis le DS) :
  - `extract-accueil.png` - l'accueil (vrai composer hero, halo, serif de marque)
  - `extract-conversations.png` - Mes conversations (vraie table du produit)
  - `accueil-live.mp4` - clip motion : le halo animé réel du composer (4 s)
- `HANDOFF.md` - **le handoff GTM** (founder / sales / marketing) : quoi utiliser où.
- Le film complet de l'assistant vit dans `../../video-assistant/` (`npm run render`).

## Statut

Package **logique** (pas encore de split physique - cf. `@plato/ui-product`). On
prototype la surface ici ; l'activation en workspace suit une fois `ui-product` clean.
