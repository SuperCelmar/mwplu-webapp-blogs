# MWPLU Web App Style Guide

A practical reference for developers and designers to ensure a consistent, accessible, and performant UI across the MWPLU application. This guide reflects the current implementation and design tokens in the codebase.

---

## 1. Introduction & Purpose

- **What it is**: A human-readable guide describing how the app should look and feel, mapping directly to the CSS tokens and components in `src/styles`.
- **Audience**: Front-end developers, designers, contributors.
- **Principles**: Accessibility (WCAG AA), Consistency (token-driven), Scalability (component-first), Performance (lean CSS, reuse), and Theming (light/dark parity).

---

## 2. Brand Foundations

### 2.1 Color System

Defined as CSS custom properties in `src/styles/variables.css`. All components must use tokens, not hardcoded colors.

- **Core**
  - `--color-black`: `#000000` (Light text) → Dark mode remaps to light gray
  - `--color-white`: `#FFFFFF` (Light background) → Dark mode remaps to dark surface
  - `--color-blue` (Primary): `#0284c7`
  - `--color-blue-hover`: `#0052A3`
  - `--color-blue-dark`: `#0052A3`

- **Status**
  - `--color-success`: `#10B981`
  - `--color-success-bg`: `#d4edda` (Dark: `#064e3b`)
  - `--color-error`: `#EF4444`
  - `--color-error-bg`: `#FEF2F2` (Dark: `#7f1d1d`)
  - `--color-error-border`: `#FECACA` (Dark: `#991b1b`)
  - `--color-info`: `#3B82F6`
  - `--color-info-bg`: `#f5f5f5` (Dark: `#1e3a8a`)

- **Neutrals**
  - `--color-gray-50`: `#F9FAFB`
  - `--color-gray-100`: `#F3F4F6`
  - `--color-gray-200`: `#E5E7EB`
  - `--color-gray-300`: `#D1D5DB`
  - `--color-gray-400`: `#9CA3AF`
  - `--color-gray-500`: `#6B7280`
  - `--color-gray-600`: `#4B5563`
  - `--color-gray-700`: `#374151`
  - `--color-gray-800`: `#1F2937`
  - `--color-gray-900`: `#111827`

- **Accents & Surfaces**
  - `--accent-gray`: `#e0e0e0` (Dark: `#2a2f36`)
  - `--border-gray`: `#d3d3d3` (Dark: `#2f3a46`)
  - Header surfaces: `--header-bg`, `--header-bg-scrolled`, `--header-border`, `--mobile-nav-bg`, `--dropdown-bg`
  - Footer surfaces: `--footer-bg`, `--footer-text`, `--footer-muted`, `--footer-border`

- **Dark Mode**
  - Activated via `<html data-theme="dark">`.
  - Remaps semantics: text uses `--color-black` (light gray), surfaces use `--color-white` (dark background). Always use tokens so components auto-invert.

### 2.2 Typography

- **Font family**: `--font-family`: Lato, system fallbacks.
- **Scale** (rooted in small, compact UI):
  - `--font-size-xxs`: 0.525rem
  - `--font-size-xs`: 0.6rem
  - `--font-size-sm`: 0.675rem
  - `--font-size-base`: 0.75rem
  - `--font-size-lg`: 0.825rem
  - `--font-size-xl`: 0.9rem
  - `--font-size-2xl`: 1rem
  - `--font-size-3xl`: 1.125rem
- **Weights**: thin(100), light(300), normal(400), medium(500), semibold(600), bold(700), extrabold(800)
- **Line heights**: tight(1.25), normal(1.5), relaxed(1.75)
- **Headings** (base.css):
  - h1: `--font-size-3xl`, bold
  - h2: `--font-size-2xl`, bold
  - h3: `--font-size-xl`, bold
  - h4: `--font-size-lg`, bold
  - h5: `--font-size-base`, bold
  - h6: `--font-size-sm`, bold
- **Code**: monospace with light gray background in light mode.

### 2.3 Spacing System

- 4px scale using tokens:
  - `--space-1`: 0.25rem (4px)
  - `--space-2`: 0.5rem (8px)
  - `--space-3`: 0.75rem (12px)
  - `--space-4`: 1rem (16px)
  - `--space-5`: 1.25rem (20px)
  - `--space-6`: 1.5rem (24px)
  - `--space-8`: 2rem (32px)
  - `--space-10`: 2.5rem (40px)
  - `--space-12`: 3rem (48px)
  - `--space-16`: 4rem (64px)

### 2.4 Breakpoints & Responsiveness

- Mobile-first CSS.
- Common breakpoints in current code:
  - `@media (max-width: 768px)`: mobile adjustments (header nav, layout paddings, grids, forms, buttons)
  - `@media (max-width: 480px)`: compact spacing adjustments
- Container: `.container` max-width 1200px with horizontal padding.

### 2.5 Elevation, Borders, Radii

- **Radii**: `--radius-button` (2px), `--radius-form` (4px), `--radius-card` (8px)
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Z-index**: `--z-dropdown`, `--z-dropdown-menu`, `--z-modal`, `--z-popover`, `--z-tooltip`
- **Transitions**: `--transition-fast` (150ms), `--transition-base` (250ms), `--transition-slow` (350ms)

---

## 3. Layout

### 3.1 Grid & Containers

- `.container`: centered, max-width 1200px, horizontal padding.
- `.grid`: 2 equal columns with `gap: 10px` (utility for simple layouts).
- `.grid-col-4`: 33.33% width helper for simple three-up columns; collapses to full width under 768px.

### 3.2 Page Structure

- **Header**: Fixed top, blurred background, border bottom. Uses `--header-bg` tokens and adapts on scroll.
- **Main Content**: In `AppLayout`, paddings and optional container. Supports full-height, padded, and breadcrumb-aware states.
- **Footer**: Uses footer surface tokens; consistent spacing.

### 3.3 Navigation

- Menu items (`.nav-link`) use token-based text colors and subtle hover background.
- Mobile nav slides from the right at `max-width: 768px` and inherits `--mobile-nav-bg`.
- User menu dropdown uses `--dropdown-bg`, borders, tokens for hover states.

---

## 4. Components

This section describes the reusable elements present today and how to extend them.

### 4.1 Buttons

- Classes: `.btn` (primary), `.btn-secondary`, `.to-plu-btn` (alias of primary styling).
- Visual spec: inline-flex, 14px text, medium weight, `--radius-button`, token-based colors, transitions.
- States: hover raises (`transform: translateY(-2px)`), active resets elevation, disabled lowers opacity.
- Usage: Prefer `.btn` for primary actions, `.btn-secondary` for secondary/neutral. Avoid inline styles.

Example:
```html
<button class="btn">Primary</button>
<button class="btn-secondary">Secondary</button>
```

### 4.2 Forms

- Structure: `.form-group` + `.form-label` + `.form-input` or `.form-select`.
- Inputs: underline style (border-bottom with `--border-gray`), focus elevates and darkens border.
- Select: bordered, token chevron icon, hover/focus elevate.
- Checkbox: `accent-color: var(--color-black)`; disabled reduces opacity.
- Messages: `.error-message`, `.status-message` for inline feedback.

Example:
```html
<div class="form-group">
  <label class="form-label" for="email">Email</label>
  <div class="input-wrapper">
    <input id="email" class="form-input" type="email" placeholder="you@example.com" />
  </div>
  <div class="error-message">Adresse email invalide</div>
</div>
```

### 4.3 Cards / Panels

- Pattern (no single class today): Use tokens
  - Background: `var(--color-white)`
  - Text: `var(--color-black)`
  - Border: `1px solid var(--border-gray)`
  - Radius: `var(--radius-card)`
  - Shadow: `var(--shadow-sm|md)`
  - Spacing: `--space-*`

Example:
```html
<section class="card">
  <h3 class="card__title">Titre</h3>
  <p class="card__body">Contenu…</p>
</section>
```
Suggested CSS:
```css
.card { background: var(--color-white); color: var(--color-black); border: 1px solid var(--border-gray); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); padding: var(--space-4); }
.card__title { font-size: var(--font-size-xl); }
.card__body { color: var(--color-gray-600); }
```

### 4.4 Modals & Overlays

- `PolicyModal` and `PrivacyPrompt` define overlay/backdrop patterns with token surfaces.
- Backdrop: semi-transparent black; content uses `--color-white` and border/shadow tokens.
- Close buttons: subtle hover background using neutral tokens.

### 4.5 Alerts & Notifications

- `messages.css`: `.alert`, `.alert-success`, `.alert-info`, `.alert-warning`, `.alert-danger`.
- `BaseNotification`: toast-like notification with icon and actions.

Example:
```html
<div class="alert alert-success">Opération réussie</div>
```

### 4.6 Tables & Lists

- Not explicitly styled today. Use tokens:
  - Header text: `--color-black`
  - Row hover: `var(--color-gray-100)`
  - Borders: `--border-gray`
  - Spacing: `--space-3`/`--space-4`

### 4.7 Navigation Aids

- Breadcrumbs supported in `AppLayout` via a named slot; match content container width and spacing.

---

## 5. Interactions & Motion

- Hover: subtle elevation for buttons and selects; nav items get light background.
- Focus: use `:focus-visible` outlines/shadows driven by tokens.
  - Note: focus color should derive from `--color-black` for theme parity.
- Animations: spinner (`.loading`) uses a keyframe rotate.
- Transitions: buttons, header, and mobile nav rely on 200–300ms ease transitions.

---

## 6. Accessibility Guidelines

- Contrast: ensure text/background and interactive elements meet WCAG AA. Tokens chosen to keep adequate contrast in both themes.
- Keyboard Navigation: `:focus-visible` outlines must remain visible and consistent across components.
- Screen Readers: use `.sr-only` and semantics; modals should trap focus and use proper headings and close labels.
- ARIA: apply descriptive labels on toggles, close buttons, and icons.

---

## 7. Theming & Extensibility

- **Theme Application**: Set via Pinia UI store; `<html data-theme="light|dark">`. `auto` follows `prefers-color-scheme`.
- **Tokens**: All components must consume CSS variables from `variables.css`.
- **Dark Mode**: Avoid hardcoded colors. If you need custom surfaces, define new tokens and override inside `[data-theme="dark"]`.
- **High Contrast**: Prefer system `color-scheme` support; ensure outlines and borders remain visible.
- **Utilities**: `.container`, `.text-center`, `.sr-only`, `.grid`, `.grid-col-4`, `.loading`.

---

## 8. Examples & Code Snippets

### Buttons
```html
<a class="btn" href="#">Call to Action</a>
<button class="btn-secondary" type="button">Secondary</button>
```

### Forms
```html
<div class="form-group">
  <label for="name" class="form-label">Nom</label>
  <div class="input-wrapper">
    <input id="name" class="form-input" type="text" />
  </div>
  <small class="status-message">En cours…</small>
</div>
<select class="form-select"><option>Option</option></select>
```

### Card / Panel
```html
<section class="card">
  <h3 class="card__title">Titre de section</h3>
  <p class="card__body">Texte descriptif ici…</p>
  <button class="btn">Action</button>
</section>
```

### Alerts
```html
<div class="alert alert-danger">Erreur critique</div>
```

---

## Dos and Don’ts

- Do use tokens (`var(--color-*)`, `--space-*`, `--radius-*`) for all styling.
- Do rely on existing classes (`.btn`, `.form-*`, `.container`) before creating new ones.
- Do design for both themes; verify contrast and hover/focus visibility.
- Don’t use inline styles for brand colors or spacing; add tokens if something is missing.
- Don’t bypass focus outlines; ensure keyboard users see focus clearly.

---

## References

- Tokens and global styles: `src/styles/variables.css`, `base.css`, `reset.css`
- Components and layout: `src/components/layout/*`, `src/components/common/*`
- Theme control: `src/stores/ui.js`, `src/main.js`
