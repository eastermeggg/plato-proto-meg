---
name: Switch
package: plato
status: stable
usage: Bascule on/off d'un réglage à effet immédiat
source: src/components/ui/Switch.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=2819-30732
---

# Switch

Bascule on/off. ON = piste foreground, OFF = piste cream, pouce white. Promu depuis `previews.jsx`, tokenisé. Remplace les toggles CSS inline `peer-checked`.


## When to use
- Activer/désactiver un réglage avec **effet immédiat** (pas de submit).

## When NOT to use
- **Sélection dans un formulaire à valider** → `Checkbox`.
- **Choix exclusif** → `RadioGroup`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `checked` | bool | `false` | état on |
| `label` | string | — | libellé cliquable |
| `disabled` | bool | `false` | désactivé |
| `onChange` | `(next: boolean) => void` | — | |

## Examples
```jsx
import Switch from 'src/components/ui/Switch';

<Switch checked={v} label="Jour chômé" onChange={setV} />
```
