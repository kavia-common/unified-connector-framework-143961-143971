# Ocean Professional UI Components

Reusable React components styled to match the Ocean Professional theme used in this project.

Palette and tokens:
- Primary: #2563EB
- Secondary/Accent: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

Rounded and shadows:
- Rounded: md: 0.375rem, lg: 0.5rem+, xl: 0.75rem when appropriate
- Shadows: sm for interactive elements, md for cards, lg for overlays/modals

Components:
- Button: variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading, disabled, icons
- Spinner: sizes, colors (primary, secondary, neutral)
- ErrorBanner: message with optional retry and dismiss controls
- Card: header, subtitle, actions, footer, gradient option, loading state
- Modal: overlay, ESC close, focus management, sizes (sm, md, lg), close button, footer slot

Import:
```tsx
import { Button, Spinner, Card, Modal, ErrorBanner } from '@/components/ui';
```

Demo:
- Visit the home page to interact with live examples integrated into src/app/page.tsx.
