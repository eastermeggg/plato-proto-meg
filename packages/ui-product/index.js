// @plato/ui-product — surface publique du design system produit.
//
// STATUT (25/09) : package LOGIQUE. Le repo reste mono-package (règle AGENTS.md 8) :
// on ne déplace pas encore les fichiers, on DÉCLARE ici la surface consommable.
// Quand ui-product sera clean (ds:doctor 0, SIGNALEMENTS vidé, inventaire stable),
// on activera le split physique (workspaces) et on inversera : l'app importera
// depuis ce package plutôt que l'inverse.
//
// RÈGLE DURE : ce package ne dépend d'AUCUNE extension. Aucun import depuis
// @plato/ui-marketing (ds-check-boundaries).

// Tokens (source de vérité, theme-aware via var()).
export {colors, shadows, typography} from '../../src/design-system/tokens';

// Composants canoniques (échantillon de la surface - à compléter à l'activation).
export {default as Button} from '../../src/components/ui/Button';
export {default as PageHeader} from '../../src/components/ui/PageHeader';
export {default as AppSidebar} from '../../src/components/ui/AppSidebar';
export {default as AssistantComposer} from '../../src/components/assistant/AssistantComposer';
export {default as SuggestionPill} from '../../src/components/assistant/SuggestionPill';
export {default as ConversationsIndexPage} from '../../src/components/shell/ConversationsIndexPage';
