# Principes DS — construire de l'UI on-brand dans ce repo

> Ce qu'un agent doit respecter pour produire une UI conforme au design system
> Plato. **Les règles canoniques vivent dans `AGENTS.md`** ; ce document en est
> la synthèse rationalisée (principe + pourquoi + où ça se voit), pour trancher
> vite sans re-parcourir specs, fiches et historique.
>
> Périmètre : **design system, langage visuel, composants, gouvernance.** Les
> principes *produit* (workflows email, JP, actes, chiffrage, tarification,
> pièces adverses…) vivent dans les `SPEC_*.md`, pas ici.
>
> En cas de conflit : le plus spécifique / le plus récent gagne, et
> `ds.manifest.json` fait foi sur les chemins du DS.

---

## 0. La posture (le principe qui gouverne tous les autres)

- **Tokens, jamais de valeur en dur.** Valeur absente → créer un token d'abord.
  *(→ §1, §3)*
- **Réutiliser avant de créer.** On part des primitives de `src/components/ui/` ;
  lancer `ds-decide` avant toute création, biais par défaut : ne pas créer.
  *(→ §2)*
- **UI sobre et professionnelle.** Public : des avocats souvent tech-phobes. Pas
  d'emojis, pas de cadratins, pas de sur-branding. La délice passe par l'icône,
  la typo, la couleur, le motion — jamais par le décor.
- **Le steward tranche.** `tokens.js` est protégé (main-only) ; la vérité Figma
  est mixte par surface. En cas de doute → question, jamais de correction
  automatique. *(→ §3)*

---

## 1. Langage visuel

- **Palette neutre = stone + cream chaud, jamais zinc froid.**
- **Couleur d'emphase = bleu, jamais l'or/sable chaud.** `#1e3a8a` (chiffres,
  totaux, liens) / `#2563eb` (points, icônes) sur surfaces bleu clair.
- **Orange (marque `#f47a2c`) = détails et accents seulement** (liseré d'item
  actif, glow du composer, eyebrows), jamais des surfaces.
- **Rôles typographiques figés :** Inter (sans), RL Para Trial Central (serif —
  titres de page/objet, montants), IBM Plex Mono (labels capitales). Fallback
  montants : Georgia/Times 400. *(RL Para est Trial : valider la licence avant
  prod, sinon fallback Albra/Georgia — ECARTS #1.)*
- **Pas d'emojis dans l'UI. Tirets simples, pas de cadratins** (le `—` seul comme
  placeholder de valeur vide reste toléré). Doctor les remonte en warnings.
- **Copy produit en français** (les specs peuvent la décrire en anglais).

---

## 2. Composants & primitives

- **Réutiliser les primitives de `src/components/ui/` ; ne jamais re-rouler un
  contrôle inline.** Chaque primitive a une fiche `.md` sœur = **source de sa
  doc** — la lire avant usage ; après édition, `npm run ds:docs` (régénère
  `componentDocs.json`). Règles détaillées : `src/components/ui/CLAUDE.md`.
- **Le DS est un kit shadcn/ui thémé Plato en 3 couches :** shadcn vanilla,
  extensions Plato (marquées), customs Plato. Carte : `docs/figma-components-map.md`.
- **Deux familles de pills, règle de routage :** STATUS / SEVERITY / CATEGORY /
  compteurs → `Badge` générique ; SOURCE TYPE → `SourceBadge` interactif (cliquable,
  ouvre le doc référencé). Un badge de source ne porte jamais de montant, est
  toujours cliquable, jamais tronqué.
- **Ne JAMAIS re-rouler le shell / la nav / une barre.** Rail, barre de tête,
  en-tête de page, barre de contexte = composants canoniques (`AppSidebar`,
  `TopBar`, `PageHeader`, `Niveau3Strip`, `NavExpandControl`). Un nouvel onglet /
  une nouvelle page = du **contenu** passé à ces composants, jamais une barre
  inline. Détail : `AGENTS.md` § « Shell, nav & barres » · vitrine `/ui-kit/shell`.

### Principes de nav & panneaux (portés par ces primitives)

- **Nav = deux plans maximum, jamais une pile de bandeaux :** chrome fixe
  (breadcrumb + onglets toujours visibles + outils) + en-tête de page sticky dans
  le contenu. Onglets jamais repliés en menu ; CTA de page toujours à droite.
- **Deux « retours » ne s'empilent jamais** (sortir du dossier vs remonter d'un
  niveau vivent sur deux plans distincts).
- **Vues profondes = drill-down, pas accordéon.** Règle : >2 niveaux / contenu
  riche → drill (la ligne entière navigue, pas de chevron) ; 1 niveau uniforme à
  comparer → accordéon local.
- **Repli de la nav : ouvert ↔ caché** (pas de rail d'icônes), peek 80vh.
- **Les drawers de contenu s'ouvrent au ras à GAUCHE du chat**, qui reste visible
  et interactif (`--chat-offset`). Les petites boîtes d'action = modales centrées
  sur backdrop atténué.
- **L'adaptativité d'un panneau se mesure sur sa largeur réelle, pas le viewport**
  (le chat ampute l'espace) — rails clampés puis cachés sous un seuil.

### Preview des sources

- **Un seul PreviewPanel** pour toutes les sources citables (piece / modele / jp /
  loi / email / ligne / web) : une coquille, corps/méta enfichables par type,
  contrat `passages` partagé (scroll-to + highlight). Sources internes ouvrent en
  interne ; le web ouvre un onglet externe.

---

## 3. Socle technique (gouvernance)

### Tokens & garde-fou

- **Cible zéro hex en dur** — couleurs/espacements/radius/ombres via `tokens.js`
  (miroir `tailwind.config.js`). CI verrouillée : `.github/workflows/ds.yml`.
- **`npm run ds:doctor` est le garde-fou ; il doit sortir 0. `lyse audit` est
  mort** (package + fichiers supprimés) — ne jamais l'utiliser (cf. `ECARTS.md`).
  Sévérité : hex en dur + validation manifest = **bloquants** ; emojis et
  cadratins = warnings.
- **Échelle de migration hex :** exact→token ; ΔE<3→snap ; ΔE>10 & <5 occ →
  « dérive délibérée » ; classes Tailwind brutes → utilitaires sémantiques ;
  couleurs de marque tierces → whitelist `ds-hex-ok`. Pas de noir pur dans un
  thème stone (`#000000` → `semantic.foreground` #292524). Les dégradés d'identité
  décoratifs (avatars) ne sont **pas** de l'hex UI — non snappés. Détail :
  `DECISIONS-HEX.md`.
- **Seul le steward édite `tokens.js`** (protégé, main-only). Deux registres de
  dette : `ECARTS.md` (dettes assumées, committé) vs `SIGNALEMENTS.md` (constats
  qu'un agent ne peut pas auto-corriger, gitignored). Passe visuelle before/after
  obligatoire avant tout commit de couleur.

### Dark mode

- **`colors.X` renvoie `var(--token, #fallbackLight)`, pas un hex** — inline styles
  et Tailwind basculent ensemble quand `.dark` est sur `<html>`, sans toucher un
  fichier consommateur. Les fallback garantissent zéro régression light.
- **Le dark est DÉRIVÉ du light** (`darkOverrides` deep-merge), pas extrait de
  Figma. On n'édite le dark que via `darkOverrides` ; jamais d'hex dark en CSS.
  Détail : `docs/dark-mode.md`.

### Vérité Figma (mixte, par surface)

- **La vérité Figma est MIXTE, décidée par surface — jamais globale.**
  `docs/design-truth.md` est le registre à consulter avant d'arbitrer tout écart.
  - *Figma → code (Figma fait foi) :* PreviewPanel V2, Nav dossier V2 (frame 4046),
    panneau document/pièce.
  - *code → Figma (code fait foi ; un Figma périmé n'est pas un bug) :* relevé
    d'heures, cotisations, import email V2, connecteurs, port Assistant/Plato-Nav,
    onboarding, hero motion, tous les labs `/ui-kit/*`.
- **Tokens de thème = régime `ds-figma-sync` :** rapport de dérive → validation
  ligne à ligne du steward → application à `tokens.js` uniquement. Jamais
  automatique. Toute surface absente du registre → question, jamais de correction
  automatique.

### Périmètre du repo

- **`/ui-kit` est le cœur du repo** ; le proto vit à côté. Les labs sont des
  explorations non promues, exclues du doctor, mais leurs démos utilisent les
  **vrais** composants de l'app pour que les décisions soient fiables.

---

## Provenance

Synthèse DS depuis : `AGENTS.md`, `docs/design-truth.md`, `docs/dark-mode.md`,
`docs/figma-components-map.md`, `ECARTS.md`, `SIGNALEMENTS.md`, `DECISIONS-HEX.md`,
et les fiches `src/components/ui/*.md`. Les principes produit sont dans les
`SPEC_*.md`. Quand une règle évolue, mettre à jour la source canonique ET cette
synthèse.
