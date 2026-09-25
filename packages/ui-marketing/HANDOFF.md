# Handoff GTM - Plato / l'assistant

Pour **founder (Ben), sales, marketing**. Ce qu'est le produit, l'histoire à
raconter, et les assets prêts à l'emploi - tous **rendus depuis le vrai design
system**, donc fidèles au produit au pixel près.

---

## En une phrase

**Plato, c'est l'assistant juridique qui répond dès l'accueil - avant même
d'ouvrir un dossier - et garde chaque échange au bon endroit.**

## L'histoire à montrer (le flow de démo)

1. **On pose une question de droit directement depuis l'accueil.** Pas de setup,
   pas de dossier à créer. *« Un salarié peut-il contester son licenciement 13
   mois après ? »*
2. **La réponse arrive, sourcée.** Pas un chatbot vague : une réponse qui cite le
   texte (*art. L1471-1 du Code du travail*) et pose les réserves à vérifier.
3. **Le fil est gardé.** L'échange se retrouve dans **Mes conversations** -
   rattaché à un dossier, ou libre. Rien ne se perd.

Le fil rouge : *de la question à la conversation, sans friction.*

---

## Les assets (prêts, dans `assets/`)

| Asset | Ce que c'est | Sert à |
|---|---|---|
| `extract-accueil.png` | L'accueil réel : composer hero, halo animé, serif de marque | Hero de landing, header de deck, post social |
| `extract-conversations.png` | La page Mes conversations (vraie table produit) | Feature « tout est gardé », slide produit |
| `accueil-live.mp4` (4 s) | Le halo du composer qui vit - motion réel du produit | Boucle de hero, story, pub courte |

Le **film complet** de l'assistant (accueil → réponse → Mes conversations) se
génère depuis `video-assistant/` (`npm run render`) - même pipeline fidèle.

> Tous ces visuels sont le **vrai produit** rendu, pas des maquettes : ce que voit
> le prospect est exactement ce qu'il aura.

---

## Les messages (piliers)

1. **« Ça répond avant le dossier. »** La valeur est immédiate - dès la première
   question, sans onboarding.
2. **« Chaque réponse est sourcée. »** Article de loi, jurisprudence cités inline.
   La confiance d'un professionnel, pas d'un chatbot.
3. **« Rien ne se perd. »** Les conversations sont rangées, rattachables à un
   dossier. Le travail se capitalise.

## Quoi utiliser où

- **Landing / site** : `extract-accueil.png` en hero + `accueil-live.mp4` en boucle ;
  les 3 piliers en sections ; `extract-conversations.png` pour la feature « gardé ».
- **Deck sales** : la séquence en 3 temps (accueil → réponse sourcée → Mes
  conversations) ; une slide par pilier.
- **Social / démo** : `accueil-live.mp4` (le halo accroche l'œil) + la question
  posée en légende.

---

## Prêt vs à venir

- **Prêt** : les 3 extraits fidèles ci-dessus, la recette de rendu, les messages.
- **À venir** : le film complet monté sur composants réels (pipeline validé, en
  cours) ; d'autres extraits (dossier, pièces) à la demande ; presets motion
  réutilisables.

## Régénérer / demander un asset

Les assets se produisent depuis le DS (aucune maquette à maintenir) :

```
cd video-assistant
npm run dev            # Studio : prévisualiser (compositions PocHome, Poc)
npm run still PocHome  # exporter un extrait en PNG
npm run render         # exporter le film complet en MP4
```

Besoin d'un écran produit précis en visuel ? Il suffit de le demander : on le rend
depuis `@plato/ui-product`, il sortira fidèle par construction.
