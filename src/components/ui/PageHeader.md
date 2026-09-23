---
name: PageHeader
type: layout
status: pending
usage: L'en-tête de page (titre serif + action + onglets optionnels) au-dessus du contenu
description: >
  En-tête de PAGE canonique : titre serif display-sm à gauche, cluster d'actions
  à droite (typiquement un Button primaire), et une rangée d'onglets optionnelle
  avec compteurs. Distinct de TopBar (chrome fixe du dossier) et de Niveau3Strip
  (barre de contexte niveau 3). Composé à partir des primitives (Button, Badge).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37511-1436
file: src/components/ui/PageHeader.js
inventoryId: PageHeader
variants: [Dossiers, Conversations, Dossier]
sizes: [display-sm]
tokens: [typography.fontFamily.serif, colors.semantic.foreground, colors.semantic.mutedForeground, colors.semantic.border]
composes: [Button, Badge]
---

# PageHeader

> **Type** Layout · **Status** Pending · **Usage** en-tête de page (listing dossiers / conversations)
> **Figma** [Page Header](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37511-1436) · **File** `src/components/ui/PageHeader.js`

L'en-tête POSÉ dans le contenu d'une page (pas le chrome fixe). Titre serif +
action primaire, et pour les listings, une rangée d'onglets à compteurs. On
compose CECI pour toute page listing - jamais un `<h1>` serif + boutons inline.

## Pattern / Variants / Examples

### When to use
- Le haut d'une page de listing (Mes dossiers, Mes conversations) : titre +
  création + éventuels onglets de filtre.

### When NOT to use
- Le **chrome fixe du dossier** (breadcrumb + onglets de vue + outils) → `TopBar`.
- La **barre de contexte niveau 3** (poste / acte / JP / documents) → `Niveau3Strip`.
- Un simple titre de section dans une carte → typographie brute, pas ce composant.

### Types Figma
| Type | Composition |
|---|---|
| `Dossiers` | titre + Button « Nouveau dossier » + onglets (Ouverts / Archivés à compteurs) |
| `Conversations` | titre + Button « Nouvelle conversation » (pas d'onglets) |
| `Dossier` | slim → compose `TopBar` (hors périmètre de ce composant) |

### Props
| Prop | Type | Rôle |
|---|---|---|
| `title` | string \| node | titre serif (display-sm, 20 / 28) |
| `action` | node | cluster d'actions à droite (ex. `<Button variant="primary" …/>`) |
| `tabs` | `[{ key, label, count?, icon? }]` | rangée d'onglets optionnelle |
| `activeTab` | string | clé de l'onglet actif |
| `onTabChange` | `(key) => void` | changement d'onglet |
| `className` / `style` | — | échappatoires (ex. réduire le padding haut si nav masquée) |

### Examples
```jsx
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

<PageHeader
  title="Mes dossiers"
  action={<Button variant="primary" icon={Plus} label="Nouveau dossier" onClick={createDossier} />}
  tabs={[
    { key: 'ouverts', label: 'Ouverts', count: 50 },
    { key: 'archives', label: 'Archivés', count: 8 },
  ]}
  activeTab={tab}
  onTabChange={setTab}
/>
```

### Gabarit de page (contrat de mise en page)
`PageHeader` porte SON PROPRE padding - ne pas l'envelopper d'un conteneur qui
en rajoute. Anatomie de la page qui l'accueille (identique sur toutes les pages
listing) :

```
<div className="h-screen flex flex-col">              {/* racine, jamais de scroll ici */}
  {trialBanner}                                       {/* optionnel, flex-shrink-0 */}
  <div className="flex-1 flex overflow-hidden">
    {navSlot /* AppSidebar */}
    <div className="flex-1 flex flex-col overflow-hidden"  style={{ background }}>
      {navHidden && <div className="px-8 pt-3 pb-1"> <NavExpandControl/> </div>}
      <PageHeader className={navHidden ? 'pt-3' : ''} title=… action=… tabs=… />
      <div className="flex-1 overflow-y-auto px-8 py-6"> {/* LE contenu */} </div>
    </div>
  </div>
</div>
```

**Valeurs à ne pas redécider :**
| Propriété | Valeur |
|---|---|
| Padding H (en-tête + contenu, alignés) | `px-8` (32px) |
| Padding haut en-tête | `pt-7` (28px) · `pt-3` si nav masquée (via `className`) |
| Padding bas en-tête | `pb-6` sans onglets ; `0` avec onglets (les onglets posent le filet) |
| Padding vertical du contenu | `py-6` (listing) · `pt-6 pb-8` (workspace dossier) |
| **Max-width de la page** | **aucune - pleine largeur** ; seule la prose de doc peut capper ~720px |
| Titre | serif `RL Para`, 20 / 28, `-0.6px`, weight 500 |

Contrat complet + variantes de shell : fiche block **`/ui-kit/b/shell`** (« Gabarit de page »).

### Tokens used
`typography.fontFamily.serif` (titre), `colors.semantic.foreground` /
`mutedForeground` (titre + onglets), `colors.semantic.border` (filet des onglets +
badge). Le reste vient des primitives composées (`Button`, `Badge`).

## Sprint / Explos

- Établi le 22/09 depuis Figma « Page Header » (37511:1436), cran B step 2 (après `TopBar`).
- Réconcilie une dérive proto : les listings rendaient un `<h1>` Georgia 28px + boutons inline ; le composant remet le titre serif display-sm (RL Para) et les onglets Figma. La bascule des call-sites (Mes dossiers, Mes conversations) se vérifie à l'écran.
- Voisins : `TopBar` (chrome fixe), `Niveau3Strip` (contexte niveau 3).

## Proto demo

Visible en contexte : le haut des pages « Mes dossiers » et « Mes conversations ».
