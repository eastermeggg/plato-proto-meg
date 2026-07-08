# Button

Plato primary action component. Promoted from the validated inline preview in
`src/components/ui-kit/previews.jsx` (look-and-feel matched to Figma there).

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'destructive'` | `'primary'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `icon` | Lucide icon component | — | rendered at `iconSize` for the size |
| `iconPosition` | `'leading' \| 'trailing'` | `'leading'` | |
| `label` | string | — | button text (or use `children`) |
| `children` | node | — | alternative to `label` |
| `disabled` | bool | `false` | 50% opacity, `not-allowed` |
| `onClick` | fn | — | |
| `fullWidth` | bool | `false` | stretch to container width |
| `type` | string | `'button'` | |
| `title` | string | — | tooltip |

## Usage

```jsx
import Button from '../ui/Button';

<Button variant="primary" label="J'ai terminé" icon={Check} onClick={onDone} />
<Button variant="outline" label="Commencer moi-même" icon={Clock} onClick={onLog} />
<Button variant="primary" size="lg" label="Valider · mois suivant" icon={ArrowRight} iconPosition="trailing" />
```

Colors come from the Plato palette: primary `#292524`, secondary/cream `#eeece6`,
outline border `#e7e5e3`. Do not re-roll buttons inline — import this.
