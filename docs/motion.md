# Motion & delight - les règles

> Référencé par `AGENTS.md` (règle 12). Le delight Plato ne passe jamais par
> des émojis : il passe par la typo, les icônes et le MOUVEMENT. Ce document
> dit comment on bouge - tout est extrait du code réel, rien n'est aspiration.

Dernière mise à jour : 25/09/2026.

## Sources de vérité

| Quoi | Où |
|---|---|
| Durées, easings, animations nommées | `src/design-system/tokens.js` → `motion` (catalogue généré : `docs/tokens.md`) |
| Keyframes | `src/index.css` (protégé - steward) |
| Motion de la nav (spec au pixel) | `src/components/shell/NAV-BEHAVIOR.md` |

## L'échelle

**Durées** (`motion.duration`) : `instant` 100 · `fast` 150 · `base` 250 ·
`slow` 350, puis les ambiances (`pulse` 2s, `spinSlow` 2.5s, `gradient` 3s).

**Courbes** (`motion.easing`) : `standard` / `out` / `inOut` / `linear` ·
`bounce` (moments de succès uniquement) · `navSignature`
`cubic-bezier(0.22, 1, 0.36, 1)` (LA courbe du produit : slot nav 300ms,
glyphe PanelToggle) · `navPeek` `cubic-bezier(0.32, 0.72, 0, 1)` (arrivée
douce, départ vif : le peek 240ms).

## Les 6 règles

1. **Durées et courbes viennent des tokens.** Jamais de `cubic-bezier` libre
   ni de durée hors échelle - le doctor signale toute courbe inconnue
   (`motion-curve`, warn). Hover et press : `fast` (150ms). Entrées d'overlay
   (scrim, panneau, menu) : `fadeIn` / `slideInRight` (200-250ms, `out`).
   Au-delà de 350ms : uniquement les ambiances nommées.
2. **On anime `opacity` et `transform`, pas le layout.** Une seule exception,
   assumée et spécifiée : le slot de la nav (largeur 264→0, 300ms
   `navSignature`, contenu clippé - NAV-BEHAVIOR §2).
3. **Un seul élément vivant par surface.** Le glow du composer OU la comète du
   CTA assistant, jamais deux ambiances en même temps dans le même écran. Le
   delight est un accent, pas un fond sonore.
4. **Tout état interactif répond en 150ms ou moins** (hover, press, focus -
   le focus a ses tokens `shadows.focusRing`). Une entrée animée n'excuse
   jamais l'absence des 5 états de données.
5. **`prefers-reduced-motion` respecté** pour toute ambiance (au-delà de 1s) -
   le pattern existe sur le glow du composer hero.
6. **Une nouvelle animation = trois écritures** : keyframe nommée dans
   `index.css` (protégé → steward), entrée dans `tokens.motion.animation`,
   ligne dans le catalogue ci-dessous. Jamais de `@keyframes` inline dans un
   composant, jamais d'animation anonyme.

## Le catalogue des micro-interactions canoniques

À réutiliser avant d'inventer - chacune vit dans le code cité.

| Micro-interaction | Recette | Où |
|---|---|---|
| Glyphe nav (aperçu du repli) | barre du rect 18×18 glisse de 9.27px, `transform` 300ms `navSignature`, au survol du parent `group` | `shell/PanelToggleIcon` |
| Peek de la nav | `nav-peek-slide` : translateX(-24px)+opacity 0.4 → 0/1, 240ms `navPeek` ; fermeture sèche | `App.js` / NAV-BEHAVIOR §2-4 |
| Item de nav au survol | fond `cream` plein + chevron-right 14px en fade-in 150ms ; « see-all » : le chevron glisse de 2px | `shell/NavItem` |
| « + » de création | rotation 90°, 200ms `out`, au survol du bouton | `shell/NavSectionHeader` |
| Ouverture d'un panneau | scrim `fadeIn` 200ms + panneau `slideInRight` 200-250ms `out` | `ui/Sheet`, `ui/Dialog` |
| Chargement de contenu | `shimmer` 1.5s `inOut` sur barres `cream` | `ui/Skeleton` |
| Action en cours | `Spinner` (jamais un shimmer pour une action, jamais un spinner pour du contenu) | `ui/Spinner` |
| Succès ponctuel | `bounceIn` 400ms `bounce` - réservé aux moments de réussite (ajout, validation) | `index.css` |
| Diff accepté / rejeté | `diffAccepted` / `diffRejected` 600ms `out` (flash teal / fondu) | chiffrage, `index.css` |
| Attention portée à une zone | `highlightFade` 3s `out` - une fois, jamais en boucle | `index.css` |
| Ambiance IA | `glowPulse` 2s `inOut` sur le composer ; `thinking-dots` pendant le raisonnement | composer, `ReasoningStepper` |

## Don'ts

- Pas de bounce hors succès, pas de shake, pas de parallax, pas de
  scroll-jacking.
- Pas de `transition: all` - on cible la propriété qu'on anime.
- Pas d'animation sur les montants et données juridiques : ils apparaissent,
  ils ne « comptent » pas.
- Pas d'animation qui retarde une action : le clic répond d'abord, l'ornement
  suit.

Un besoin qui ne rentre pas : `SIGNALEMENTS.md`, comme pour un token manquant.
