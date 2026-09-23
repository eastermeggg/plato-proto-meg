---
name: Niveau3Strip
type: layout
status: pending
usage: La barre de contexte niveau 3 (poste / acte / JP / documents) sous les onglets
description: >
  La bande d'en-tête d'un objet niveau 3 (Figma « Navigation / Context bar »
  37447:5922) : fond background, filet bas, padding 16. Retour NOMMÉ 12 medium
  (unique retour du cran), code + titre serif 20 (-0.6) + montant serif 16 (-0.5),
  précédent/suivant parmi les frères. Cinq kinds par page/onglet (Poste / Actes /
  Acte / Documents / JP), tous composés des briques : BreadcrumbReturn,
  StripTitle, StripAmount, SiblingNav, CodeBadge, StripDivider.
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37447-5922
file: src/components/shell/Niveau3Strip.js
inventoryId: Niveau3Strip
variants: [Post, ActLevel, Act, Documents, JP]
tokens: [colors.semantic.background, colors.semantic.border, colors.semantic.muted, colors.semantic.secondaryForeground, colors.semantic.mutedForeground]
lastValidated: 2026-09-23
---

# Niveau3Strip

> **Type** Layout · **Status** Pending · **Usage** barre de contexte niveau 3
> **Figma** [Niveau 3 Strip](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37447-5922) · **File** `src/components/shell/Niveau3Strip.js`

La bande posée sous les onglets du dossier quand on entre dans un objet (poste,
acte, JP…). C'est `renderContentSubHeader` du proto qui la compose.

## Pattern / Variants / Examples

### When to use
- L'en-tête d'un objet niveau 3 : retour nommé + code + titre + valeur + frères.

### When NOT to use
- L'en-tête de PAGE (listing) → `PageHeader`.
- Le chrome fixe du dossier (breadcrumb + onglets de vue) → `TopBar`.

> **On compose CECI, jamais une bande de contexte `border-b` inline.** Un nouvel
> objet niveau 3 (poste, acte, autre) = du contenu passé à `Niveau3Strip` + ses
> briques, pas une nouvelle barre à la main. Cf. `AGENTS.md` § « Shell, nav & barres ».

### Kinds (nœud 37447:5922 - anatomie par page/onglet)
| Kind | Gauche | Droite |
|---|---|---|
| Poste | retour ↵ CodeBadge + StripTitle | SiblingNav · StripAmount · divider tall · action primaire |
| Actes | StripTitle (« X actes ») | action primaire « Nouvel acte » |
| Acte | retour ↵ StripTitle | tabs Acte/Bordereau + actions |
| Documents | recherche 14 muted | « Nouveau dossier » (outline) + « Ajouter des docs » (primaire) |
| JP | StripTitle | action primaire « Rechercher » |

### Briques (exports)
| Export | Rôle |
|---|---|
| `Niveau3Strip` | la bande - fond background, filet bas, p-16 ; `back` = retour sur 1re ligne (gap 10) ; `justify` between/start |
| `BreadcrumbReturn` | le retour nommé : flèche 12 + libellé 12 medium muted (hover foreground) |
| `StripTitle` | titre serif 20, tracking -0.6, leading 28 |
| `StripAmount` | montant serif 16, tracking -0.5 |
| `SiblingNav` | précédent/suivant + compteur « n / N » mono |
| `CodeBadge` | badge code fond muted, 12 medium secondary-foreground |
| `StripDivider` | filet vertical 1x16 / 1x18 (`tall`, avant l'action primaire) |

### Examples
```jsx
import Niveau3Strip, { BreadcrumbReturn, CodeBadge, StripTitle, StripAmount, StripDivider, SiblingNav } from '../ui/Niveau3Strip';

<Niveau3Strip justify="between" back={<BreadcrumbReturn label="Retour au chiffrage" onClick={back} />}>
  <div className="flex items-center gap-2.5">
    <CodeBadge>DFP</CodeBadge>
    <StripTitle>Déficit fonctionnel permanent</StripTitle>
  </div>
  <div className="flex items-center gap-3">
    <SiblingNav index={2} total={9} onPrev={prev} onNext={next} />
    <StripAmount>38 900 €</StripAmount>
    <StripDivider tall />
    <Button variant="primary" size="sm" label="Copier chiffrage" />
  </div>
</Niveau3Strip>
```

### Gabarit / dimensions
Bande de contexte **pleine largeur**, `flex-shrink-0`, posée SOUS `TopBar` (ou en tête
du contenu si pas de TopBar), au-dessus du corps scrollable :
| Propriété | Valeur |
|---|---|
| Padding | `p-4` (16px sur les 4 côtés) |
| Gap items | `gap-3` (12px) ; `mt-2.5` si retour + rangée titre empilés |
| Fond / filet | `bg-background` + `border-b border-border` |
| Alignement | `justify="between"` (titre ↔ actions) ou `"start"` |

Ne s'empile JAMAIS avec un autre retour (breadcrumb / retour de page) : un seul niveau
de retour visible à la fois. Aucun max-width. Contrat de page : fiche block **`/ui-kit/b/shell`**.

### Tokens used
`colors.semantic.background` (fond), `border` (filet), `muted` (CodeBadge),
`secondaryForeground` / `mutedForeground` (textes).

## Sprint / Explos

- Surfacé le 22/09. Comportement : behaviour map §1.4. Voisins : `TopBar`, `PageHeader`.

## Proto demo

Visible en contexte : l'en-tête d'un poste / acte / JP dans un dossier du proto.
