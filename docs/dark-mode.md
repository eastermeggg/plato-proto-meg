# Dark mode

Ajouté le 22/09/2026. Dark **dérivé** du thème light (warm stone) - le dark
n'est pas documenté dans les Variables Figma accessibles via MCP (le MCP ne
résout que le mode courant du nœud ; cf. `docs/figma-theme-releve.md` §2). Si un
vrai dark Figma existe un jour, il remplacera cette dérivation via un relevé
dédié.

## Architecture (une seule source, tout bascule)

Le point clé : `colors.X` de `tokens.js` ne renvoie plus un hex mais une
**référence CSS** `var(--token, #fallbackLight)`. Comme les styles inline (84
fichiers) **et** `tailwind.config.js` consomment ces mêmes variables, tout l'app
bascule quand `.dark` est posé sur `<html>` - sans toucher un seul fichier
consommateur.

```
tokens.js
 ├─ palette        (hex light)  ← source de vérité, lue par ds-doctor
 ├─ paletteDark    (hex dark = deepMerge(light, darkOverrides))
 ├─ cssVarsLight / cssVarsDark  (maps --token → hex, pour l'injection)
 └─ colors         = toVars(light) → { semantic:{ foreground:'var(--semantic-foreground, #292524)' }, … }

theme.js
 ├─ installThemeVars()  injecte <style> :root{…light…} .dark{…dark…}
 ├─ applyTheme(mode)    pose/retire .dark sur <html> + localStorage
 ├─ resolveTheme()      choix mémorisé, sinon prefers-color-scheme
 └─ initTheme()         appelé dans index.js avant le render (anti-FOUC)

tailwind.config.js  darkMode:'class' + couleurs = var(--token, #fallback)
                    (GÉNÉRÉ depuis tokens.js — regénérer, ne pas éditer les valeurs)

ThemeToggle.js      bouton flottant (bas-gauche), monté à côté de <App/>
```

Pourquoi des fallbacks : `var(--x, #hex)` garde le **light identique** même si
les variables ne sont pas injectées (SSR, test, injection ratée). Zéro
régression possible sur le light.

## Contraste (dark, vérifié CIEDE / WCAG)

| Paire | Ratio |
|---|---|
| foreground / background | 15.5:1 |
| muted-foreground / background | 7.0:1 |
| foreground / card | 14.5:1 |
| feedback text / subtle (destructive/success/warning/info/ai) | 9.2 - 11.5:1 |

Les bordures dark (~1.4:1) sont des dividers **volontairement discrets** (norme
dark type Linear/GitHub) ; `borderStrong`/`borderHover` donnent plus de contraste
là où c'est un contour de composant.

## Modifier le dark

Éditer `darkOverrides` dans `tokens.js` (seuls les tokens qui changent ; le
reste hérite du light). Puis régénérer `tailwind.config.js` si de nouveaux
tokens apparaissent. Ne jamais écrire de hex dark dans le CSS à la main : la
source est `tokens.js`.

## Limites connues

- Les rares hex encore en dur (logos tiers `ds-hex-ok`, échantillons des labs
  `/ui-kit`) ne basculent pas - normal (marques) ou hors périmètre (labs).
- Les valeurs `banner.*` (gradients marketing) gardent leurs teintes claires ;
  à retravailler si une surface banner doit passer en dark.
