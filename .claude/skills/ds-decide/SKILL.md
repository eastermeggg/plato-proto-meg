---
name: ds-decide
description: Décide s'il faut créer un composant ou si le besoin est couvert par un existant, une composition ou un variant. À utiliser SYSTÉMATIQUEMENT avant toute création de composant — "j'ai besoin d'un composant pour…", "il manque un…", "je crée un…", "est-ce qu'on a déjà…", ou quand ds-build rencontre un élément qui ne mappe pas sur l'inventaire. Biais par défaut : ne pas créer.
---

# ds-decide

Référence : conventions §4 (packages), §7 (fiche).

## Lire
L'inventaire, `docs/components/` (la section « quand l'éviter » répond souvent
à la question), `docs/design-system.md` → Compositions. En extension : ceux du
source d'abord. Ne pas se fier à la mémoire.

## Formuler le besoin en rôle
Qui, fait quoi, dans quel contexte, avec quelle importance. « Une carte verte
avec icône » n'est pas un rôle. Rôle flou : demander, ne pas décider.

## S'arrêter au premier palier qui tient
1. **Réutiliser** : l'existant, avec ce contenu, dans ce contexte, fonctionne.
2. **Composer** : 2-3 primitives, écrivable en JSX sans nouveau fichier. Si la
   recette va se répéter : la documenter dans Compositions.
3. **Variant** : même rôle, même API, une valeur de prop en plus → `ds-variant`.
4. **Créer**, seulement si tout est vrai :
   - aucun composant ni composition ne couvre le rôle ;
   - la composition dépasserait 3 primitives ou demande un état propre ;
   - ≥ 2 usages prévus, ou une règle métier à centraliser ;
   - constructible avec shadcn/Radix et les tokens existants.

## Signaux de doublon
Nom qui contient un existant (`PrimaryButton`, `HeroButton`) · besoin décrit par
l'apparence · « celui de shadcn ne ressemble pas au Figma » · un seul usage ·
nouveau token requis (la décision de token passe d'abord).

## Livrable
`templates/decision.md`, même pour « réutiliser ». Si « créer » : le bloc en
en-tête du fichier, une fiche depuis `templates/component.md` en
`status: draft`, l'entrée d'inventaire. Si la décision touche un fichier
protégé : `SIGNALEMENTS.md`.

Ne construit rien : la suite est `ds-build` ou `ds-variant`.
