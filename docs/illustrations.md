# Illustrations Plato — librairie & méthodo de prompting

> Playground : `/ui-kit/illustrations`. Assets : `public/illustrations/plato/`.
> Composant : `src/components/ui-kit/IllustrationsSection.jsx`.
> Source de vérité visuelle : Figma **« Plato — Brand — Website »**
> (nœuds `1408:2964` la planche d'échecs, `1345:2555` les icônes thématiques).

## Le style

Gravure monochrome façon **eau-forte / taille-douce du 19e** : trait d'encre
noir, hachures et contre-hachures pour l'ombre, pointillé pour les demi-teintes,
fond blanc. Aucune couleur, aucun aplat gris, aucun dégradé. Esthétique de
planche naturaliste / gravure de billet de banque ancien.

Deux familles :

- **Motif de marque — échecs.** La signature Plato (le coup d'avance). Deux
  mains « héro » (posant un pion, tenant un cavalier) pour les grandes surfaces ;
  des pièces isolées (roi, pions de face / renversés / vus de dessus) pour
  ponctuer.
- **Icônes thématiques — domaines.** Un domaine métier = un objet gravé :
  maillet (droit social), stéthoscope (dommages corporels), organigramme,
  immeuble (cabinet). Employées en spot (cartes, empty states, en-têtes).

## Inventaire des assets

| Fichier | Rôle |
|---|---|
| `hand-pawn.png` | Main posant un pion (héro) |
| `hand-knight.png` | Main tenant un cavalier (héro) |
| `roi.png` | Roi |
| `pion-debout.png` | Pion, de face |
| `pion-renverse.png` | Pion renversé |
| `pion-dessus-1..3.png` | Pion, vues de dessus |
| `social.png` | Droit social (maillet) |
| `dommages-corporels.png` | Dommages corporels (stéthoscope) |
| `organigramme.png` | Organigramme |
| `cabinet.png` | Cabinet (immeuble) |

Le Figma contient une planche complète d'une quarantaine de pièces d'échecs
(nœud `1408:2964`) : réexporter au besoin via le MCP Figma vers ce dossier.

## Méthodo — générer une nouvelle illustration (Nano Banana Pro)

Pipeline **image-to-image** : `image ou icône d'entrée` → `Nano Banana Pro + prompt`
→ `gravure Plato`. On part d'un visuel de référence (photo, picto, capture) et on
le transforme ; on ne génère pas « from scratch ».

### Prompt de base

Reconstitué depuis le calque source du Figma
(`transform_the_provided_image_into_a_highly_detailed_vintage_engraving_19th-century_etching_style_pr…`).
C'est le socle : on l'applique tel quel, on ajuste seulement les variantes.

```text
Transform the provided image into a highly detailed vintage engraving, 19th-century etching / copperplate print.
Render it as pure black ink line-work on a plain white background: fine parallel hatching and cross-hatching for shading, stippling for the mid-tones, crisp confident contours.
Monochrome only — no color, no flat gray fills, no gradients.
Keep the exact subject, pose and proportions of the input; do not add, remove or restyle any element.
Subject centered with generous white margin and a soft engraved cast shadow beneath it. Antique scientific-illustration aesthetic (old banknote / naturalist plate).
High resolution, clean edges, no text, no signature, no watermark, no frame or border.
```

### Variantes (une ligne à ajouter selon l'entrée)

| Entrée | Ligne à ajouter |
|---|---|
| Icône / picto | `Treat it as a single iconic object, one clear silhouette, lots of negative space — a spot illustration, not a scene.` |
| Photo | `Simplify to the essential forms of the engraving; drop the photographic background entirely, keep only the subject.` |
| Fond transparent (spot) | `Isolate the subject on a fully transparent background, keep the engraved cast shadow.` |
| Plus fin / plus dense | `Adjust hatch density: looser lines for a lighter feel, tighter cross-hatching for deeper contrast.` |

### Garde-fous

**À exiger** — trait d'encre noir + hachures ; monochrome strict, fond blanc (ou
transparent) ; sujet / pose / proportions préservés ; ombre gravée douce sous le
sujet.

**À bannir** — couleur, aplats gris, dégradés ; ombres photographiques, décor,
arrière-plan ; texte, signature, filigrane, cadre ; rendu 3D, cartoon ou flat.

### Recette pas-à-pas

1. Choisir une **référence** nette et cadrée (un seul sujet, silhouette lisible).
2. Coller le **prompt de base** + la **variante** correspondant à l'entrée.
3. Générer, puis itérer sur la **densité de hachures** et le **cadrage** si besoin.
4. Détourer sur fond transparent si l'usage est un spot (empty state, carte).
5. Vérifier contre les garde-fous, déposer le PNG dans
   `public/illustrations/plato/` et l'ajouter à `IllustrationsSection.jsx`.

## Usage dans l'app

- Référencer par chemin public : `<img src="/illustrations/plato/roi.png" … />`.
- Plaque de présentation = surface `card` (les gravures sont noir sur blanc :
  elles réclament un fond clair ; en dark mode, prévoir une inversion dédiée).
- Ne pas recolorer ni teinter : le style est monochrome par définition.
