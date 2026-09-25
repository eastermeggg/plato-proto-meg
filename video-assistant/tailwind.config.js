// Réutilise la config Tailwind de l'app (couleurs = var(--token, #fallbackLight),
// donc le light exact sans injection de thème). On élargit juste le scan de
// contenu aux vrais composants importés depuis ../src.
const app = require('../tailwind.config.js');

module.exports = {
  ...app,
  content: ['./src/**/*.{ts,tsx,js,jsx}', '../src/**/*.{js,jsx,ts,tsx}'],
};
