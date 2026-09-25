// @plato/ui-marketing — manifeste des assets GTM (extraits fidèles du produit).
// Consommable par une future page de handoff viewable ; source = @plato/ui-product.

export const assets = [
  {
    id: 'accueil',
    kind: 'image',
    file: 'assets/extract-accueil.png',
    title: "L'assistant dès l'accueil",
    caption: 'Composer hero, halo animé, serif de marque - le vrai écran.',
    use: ['hero-landing', 'deck', 'social'],
  },
  {
    id: 'conversations',
    kind: 'image',
    file: 'assets/extract-conversations.png',
    title: 'Mes conversations',
    caption: 'Chaque fil gardé, rattachable à un dossier - la vraie table produit.',
    use: ['feature', 'deck'],
  },
  {
    id: 'accueil-live',
    kind: 'video',
    file: 'assets/accueil-live.mp4',
    title: 'Le composer, vivant',
    caption: 'Le halo animé réel du produit (4 s, boucle).',
    use: ['hero-landing', 'social'],
  },
];

export const pillars = [
  {key: 'before-dossier', label: 'Ça répond avant le dossier'},
  {key: 'sourced', label: 'Chaque réponse est sourcée'},
  {key: 'nothing-lost', label: 'Rien ne se perd'},
];
