// Connecteur email - contenu unique (une seule vérité pour la modale, les
// promos d'engagement et la page Réglages > Connecteurs).
//
// Cible : des avocats exigeants sur la donnée. Le parti pris produit-marketing
// tient en trois promesses répétées partout, mot pour mot :
//   1. Lecture seule - jamais d'envoi, de modification ni de suppression.
//   2. Rien n'entre dans un dossier sans votre geste.
//   3. Réversible à tout moment - hébergé en UE, couvert par le RGPD.
// Le périmètre est EXACTEMENT celui de l'épopée import : dossiers, emails,
// pièces jointes. La synchronisation automatique est annoncée « à venir ».

export const CONNECTOR_PROVIDERS = {
  // `pick` = libellé du bouton de choix, `hint` = le repère CONCRET qui règle la
  // confusion « quel bouton ? » : on choisit d'après son ADRESSE, pas d'après
  // l'appli qu'on ouvre. D'où « même si vous la lisez dans Outlook » sur cabinet.
  outlook: {
    id: 'outlook',
    name: 'Microsoft Outlook',
    vendor: 'Microsoft',
    short: 'Outlook',
    desc: 'Outlook, Microsoft 365, Exchange',
    pick: 'Outlook.com / Microsoft 365',
    hint: '@outlook.com, @hotmail, ou compte Microsoft 365.',
    folderWord: 'dossiers Outlook',
    authDomain: 'login.microsoftonline.com',
    tint: '#dfe8f5',
    fg: '#1e3a8a',
  },
  gmail: {
    id: 'gmail',
    name: 'Google Workspace',
    vendor: 'Google',
    short: 'Gmail',
    desc: 'Gmail, Google Workspace',
    pick: 'Gmail / Google Workspace',
    hint: '@gmail.com ou Google Workspace.',
    folderWord: 'libellés Gmail',
    authDomain: 'accounts.google.com',
    tint: '#fce8e6',
    fg: '#c5221f',
  },
  // Troisième voie : l'adresse de cabinet. On ne dit plus « IMAP » (jargon) ni
  // « Autre » (vague) - on nomme ce que l'avocat reconnaît (SON adresse), et la
  // détection tranche le protocole derrière (M365 hébergé -> OAuth ; OVH /
  // Infomaniak… -> IMAP pré-rempli). Le repère attrape pile la confusion : une
  // adresse @cabinet consultée dans Outlook n'est PAS le bouton Outlook.
  imap: {
    id: 'imap',
    name: 'Mon adresse de cabinet',
    vendor: 'votre fournisseur',
    short: 'Adresse de cabinet',
    desc: 'IMAP - @avocats.fr, OVH, Infomaniak…',
    pick: 'Mon adresse de cabinet',
    hint: '@votre-cabinet.fr — même si vous la lisez dans Outlook.',
    folderWord: 'dossiers IMAP',
    authDomain: 'votre serveur IMAP',
    tint: '#eeece6',
    fg: '#57534e',
  },
};

// Les deux « types de connexion » (même grammaire que les connecteurs Notion) :
// l'import manuel est disponible, la synchronisation est la suite annoncée.
// Titres et sous-titres tiennent sur UNE ligne dans le rail (224px utiles).
export const CONNECTION_TYPES = [
  {
    id: 'import',
    title: 'Import des échanges',
    sub: 'Dossiers, emails, PJ',
    available: true,
  },
  {
    id: 'sync',
    title: 'Synchronisation',
    sub: 'Dossiers suivis à jour',
    available: false,
  },
];

// Cas d'usage de l'import - la valeur AVANT la technique, chaque ligne est un
// geste que l'avocat reconnaît. Trois lignes maximum : chaque bloc de la
// modale ne dit qu'une chose, une fois.
export const importUseCases = (p) => [
  `Parcourez vos ${p.folderWord} sans quitter le dossier Plato`,
  'Versez un échange, un dossier entier ou une seule pièce jointe',
  'Chaque pièce est cotée au bordereau, sous son nom d\'origine',
];

export const syncUseCases = () => [
  'Chaque proposition arrive avec sa preuve - rien ne se verse tout seul',
  'Le dossier reste à jour, sans chasse dans votre boîte',
];

// Périmètre exact de l'autorisation - affiché tel quel dans la modale.
export const SCOPE_READS = ['Dossiers', 'Emails', 'Pièces jointes'];
export const SCOPE_NEVER = ['Envoyer', 'Modifier', 'Supprimer'];

// Prochains connecteurs - le réglage annonce la suite : le cabinet ne vit pas
// que dans l'email. « Me prévenir » nourrit la priorisation produit sans rien
// promettre de daté.
export const UPCOMING_CONNECTORS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    desc: 'Les échanges clients et leurs pièces, versés comme un email',
    tint: '#e2f4e8',
  },
  {
    id: 'ebarreau',
    name: 'e-Barreau · RPVA',
    desc: 'Actes et messages des juridictions, classés au dossier',
    tint: '#dfe8f5',
  },
  {
    id: 'cabinet',
    name: 'Logiciels de cabinet',
    desc: 'SECIB, Kleos, Polyact - vos dossiers synchronisés',
    tint: '#eeece6',
  },
];

// Garanties invariables - le rail gauche de la modale les porte en permanence.
// Une ligne par garantie, jamais deux.
export const GUARANTEES = [
  { icon: 'lock', label: 'Accès en lecture seule' },
  { icon: 'shield', label: 'Hébergement UE - RGPD' },
  { icon: 'scale', label: 'Secret professionnel' },
  { icon: 'ban', label: 'Jamais d\'entraînement de modèles' },
];
