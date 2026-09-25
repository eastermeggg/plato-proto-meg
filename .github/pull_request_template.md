<!-- Toute PR qui touche une surface UI remplit les 2 sections. PR outillage/docs : supprimer le gabarit. -->

## Quoi / pourquoi

<!-- 2-3 phrases. Si c'est un proto de feature : le besoin produit, pas la technique. -->

## Contrat DS

- [ ] Construit en imitant un **block** du playground (lequel : ______ ) - jamais App.js
- [ ] **5 états** couverts si écran de données : vide, chargement, erreur, partiel, idéal
- [ ] **Une seule action primaire** par écran
- [ ] Composants **de l'inventaire** uniquement ; tokens sémantiques, zéro valeur en dur
- [ ] `npm run ds:doctor` : 0 constat bloquant · `npm run build` : OK
- [ ] Nouveau composant / variant : fiche `.md` + démo jouable + entrée d'inventaire `pending` + rendu light/dark joint

## Hors DS (obligatoire - « aucun » si vide)

<!-- La liste sortie par ds-build : tout ce qui a dû être introduit hors DS,
     et le guichet pris pour chaque item (ds-decide / ds-variant / ds-promote /
     SIGNALEMENTS.md). Une PR qui introduit du hors-DS non listé sera refusée. -->

- aucun
