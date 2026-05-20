# Design System

Source of truth for all visual decisions. When writing any UI code, use tokens from this doc. Never use raw Tailwind color/spacing values that have a token equivalent.

Tokens are defined in `tailwind.config.ts` under `theme.extend`.

---

## Colors

### Primitives (css vars, avoid using directly)
| var | value | notes |
|-----|-------|-------|
| `--background` | `#fff` | page bg |
| `--foreground` | `#1f2937` | page text (gray-800) |
| `--columbiaYellow` | `#f0a044` | raw accent |

### Semantic tokens, use these

**Interactive / accent**
| class | use for |
|-------|---------|
| `text-accent` | links on hover, highlighted text, active states |
| `bg-accent` | CTA buttons, download buttons, slider thumb |
| `border-accent` | focused ring, selected state borders |
| `ring-accent` | focus ring on selected filter buttons |
| `outline-accent` | focus outline on inputs (`focus:outline-accent`) |

**Surfaces (backgrounds)**
| class | use for |
|-------|---------|
| `bg-surface` | page bg, dialog bg, loader card bg |
| `bg-surface-subtle` | table headers, card bg, inactive filter buttons |
| `bg-surface-hover` | row hover state |

**Text hierarchy**
| class | gray equiv | use for |
|-------|-----------|---------|
| `text-foreground` | black | headings, primary content |
| `text-secondary` | gray-600 | supporting text, file sizes, form labels |
| `text-muted` | gray-500 | metadata, dates, helper text, table headers |
| `text-subtle` | gray-400 | placeholders, disabled text |

**Feedback**
| class | use for |
|-------|---------|
| `text-danger` | error messages, validation |
| `bg-danger` | error backgrounds |
| `text-success` | positive states (would recommend) |
| `bg-success` | success backgrounds |

**Borders**
| class | gray equiv | use for |
|-------|-----------|---------|
| `border-line` | gray-200 | standard dividers, input borders, table rows |
| `border-line-subtle` | gray-100 | faint separators, subtle card borders |

### DO NOT use
- `text-gray-{n}`: use `text-secondary`, `text-muted`, or `text-subtle`
- `bg-gray-{n}`: use `bg-surface-subtle` or `bg-surface-hover`
- `border-gray-{n}`: use `border-line` or `border-line-subtle`
- `text-columbiaYellow` / `bg-columbiaYellow`: use `text-accent` / `bg-accent`
- `text-red-600` / `text-green-600`: use `text-danger` / `text-success`

### Exceptions (intentional, leave alone)
- Category badge colors in Reviews (`bg-blue-100 text-blue-800` etc.). These are data-driven categorical colors, not UI chrome
- `bg-white` on image display areas (background-remover). White is intentional to show transparent image previews
- Overlay backgrounds like `bg-black/60`. Raw black is correct for dark overlays

---

## Typography

### Fonts

Two serif families, loaded via `next/font/google` in `src/app/layout.tsx`. Tailwind exposes them as `font-display` and `font-serif`.

| token | font | use for |
|-------|------|---------|
| `font-display` | **Fraunces** | all headings (h1-h6), the "Suhas Kashyap" wordmark, any title-style text |
| `font-serif` | **Literata** | body text (default on `<body>`), paragraphs, lists, captions |
| `font-sans` | **Inter** | interface chrome: small labels, year headers, dates next to titles, tag badges, filter chips, table headers, form inputs, social handles. Use for anything UI-flavored vs editorial content. |

Headings get `font-display` automatically via a global rule in `globals.css`, you don't need to add it on every `<h1>`/`<h2>`. The wordmark and other non-heading display text needs `font-display` explicitly.

### Non-Latin script fallbacks

Both `font-serif` and `font-display` stack Noto Serif scripts after the primary font so browser auto-picks the right font per character:

- **Devanagari** (हिन्दी, संस्कृत) → Noto Serif Devanagari
- **Kannada** (ಕನ್ನಡ) → Noto Serif Kannada
- **Japanese** (日本語) → Noto Serif JP (preload disabled, only loads when used)

You don't need to do anything special, just write the script and the browser picks the right font.

### Named scale

| token | size | use for |
|-------|------|---------|
| `text-display` | 80px | home page wordmark only, reserved |
| `text-heading-xl` | 60px | rarely, reserved for hero variants only |
| `text-heading-lg` | 48px | page titles, blog post titles (desktop) |
| `text-heading-md` | 36px | page titles (mobile), section titles (desktop) |
| `text-heading-sm` | 30px | section titles (mobile), blog post titles (mobile), subheadings (desktop) |
| `text-body-lg` | 21px | list item titles (mobile), subheadings (mobile) |
| `text-label` | 14px | metadata, dates, tags |
| `text-label-sm` | 12px | badges, small caps, table headers |

### Responsive pairs
```
page title:      text-heading-md md:text-heading-lg   (36 → 48px)
section title:   text-heading-sm md:text-heading-md   (30 → 36px)
blog post title: text-heading-sm md:text-heading-lg   (30 → 48px)
list item title: text-xl         md:text-2xl          (20 → 24px)  used by blog listing, tools listing, contact links
subheading:      text-body-lg    md:text-heading-sm   (21 → 30px)
```

These were toned down from the old 80px-display defaults to match the cozy DEFAULT wrapper width. `text-display` (80px) is reserved for the home page wordmark, page titles inside `(withNav)` should not use it.

### Font weights
- `font-medium` (500): headings, labels, button text, dominant weight
- `font-semibold` (600): nav title, table headers, badge text
- `font-bold` (700): dialog titles only
- regular: body text

### DO NOT use
- Raw size classes for headings (`text-5xl`, `text-8xl` etc.), use the named scale
- `font-bold` outside dialog titles

---

## Spacing

### Section-level tokens
| token | size | use for |
|-------|------|---------|
| `mb-section-sm` | 48px | bottom margin for inner sections |
| `md:mb-section-md` | 80px | bottom margin at desktop |
| `mb-page-bottom` | 80px | fixed-size page bottom padding |

### Page bottom pattern
All pages use: `mb-section-sm md:mb-section-md` on the Wrapper component.

### Component spacing (use default Tailwind scale)
| gap | use for |
|----|---------|
| `gap-2` / `gap-3` | between inline elements, badges |
| `gap-4` | between related form fields, list items |
| `gap-6` | between sections within a component |
| `gap-8` | between major blocks |

---

## Border Radius

Three values only. Nothing else.

| class | size | use for |
|-------|------|---------|
| `rounded` | 4px | buttons, inputs, badges, file inputs, inline labels |
| `rounded-lg` | 8px | cards, panels, dialogs, modals, image containers, loader overlays |
| `rounded-full` | 9999px | circular elements (slider handle, range thumb, avatars) |

**Rule:** interactive controls → `rounded`. containers/panels → `rounded-lg`. circles → `rounded-full`.
`rounded-sm` and `rounded-xl` are not used.

---

## Shadows

| class | use for |
|-------|---------|
| `shadow-macos` | images, tool output containers (layered depth shadow) |
| `shadow-lg` | dialog, modal overlays |
| `shadow-md` | button hover state (`hover:shadow-md`) |
| `shadow-sm` | row hover state |

`shadow-macos` value: `0px 10px 30px rgba(0,0,0,0.2), 0px 4px 6px rgba(0,0,0,0.1)`

---

## Opacity

Four values only.

| class | use for |
|-------|---------|
| `opacity-0` | invisible (hint arrows before hover) |
| `opacity-50` | dimmed (disabled states, loading overlays) |
| `opacity-75` | subtle (close button default, secondary visual weight) |
| `opacity-100` | full |

---

## Transitions

| pattern | use for |
|---------|---------|
| `transition-colors duration-200` | color/text changes on hover |
| `transition-all duration-200` | multi-property changes (shadow + color) |
| `transition-opacity duration-200` | fade in/out |
| `duration-100` | fast press feedback (button active state) |

Default easing: `ease-in-out` (Tailwind default, no need to specify).

---

## Component Patterns

### Button (CTA / primary)
```tsx
className="rounded bg-accent px-4 py-2 font-medium text-black transition-all duration-100 ease-in-out hover:shadow-md"
```

### Button (ghost / secondary)
```tsx
className="rounded border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-subtle"
```

### Text input
```tsx
className="w-full rounded border border-line p-2 focus:outline-accent"
```

### Select
```tsx
className="rounded border border-line px-2 py-1"
```

### File input
```tsx
className="file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-black hover:file:bg-accent"
```

### Category badge
```tsx
className="inline-flex rounded px-2 py-2 text-xs font-semibold leading-5 {categoryColorClass}"
```

### Filter button (inactive / active)
```tsx
// inactive
className="rounded border border-transparent px-2 py-2 text-xs font-medium transition-colors bg-surface-subtle text-secondary hover:bg-line"
// active
className="rounded border border-transparent px-2 py-2 text-xs font-medium transition-colors {categoryColorClass} ring-2 ring-accent ring-offset-2"
```

### Loader overlay
```tsx
// full screen overlay
className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
// card inside
className="flex flex-col items-center gap-4 rounded-lg bg-surface p-8 shadow-lg"
// spinner
className="h-10 w-10 animate-spin text-accent"
```

### Error message
```tsx
className="text-danger"
```

### Image container (tool output)
```tsx
className="shadow-macos relative w-full overflow-hidden rounded-lg"
```

### Form label
```tsx
className="block text-lg font-medium text-muted"
```

---

## Layout

### Wrapper modes
The `Wrapper` component has three modes:
- `DEFAULT` (default): `max-w-2xl` (~672px / ~65ch at 18px). Cozy reading column. Used by most pages and the shared `(withNav)` header.
- `WIDE`: `max-w-4xl` (~896px). Use only when content needs the room: grids, galleries, interactive tool UIs.
- `BREAKOUT`: `w-screen` with no padding. Full-bleed escape for modals/overlays/hero.

### Page width mapping

| Route | Mode |
|---|---|
| `(withNav)` header | DEFAULT |
| `/blog` (listing) | DEFAULT |
| `/blog/[slug]` | DEFAULT |
| `/contact` | DEFAULT |
| `/tools` (listing) | DEFAULT |
| `/reviews` | DEFAULT |
| `/reviews/[slug]` | WIDE (hero card) + inner DEFAULT (text) |
| `/photos` | WIDE |
| `/tools/[tool]` (interactive) | WIDE (BREAKOUT inside modals) |

Pick DEFAULT unless the content visibly needs more horizontal space. Default-by-default keeps the site cohesive.

### Page structure
All (withNav) pages:
```tsx
<Wrapper className="mb-section-sm w-full md:mb-section-md">
  <h1 className="text-heading-md font-medium md:text-heading-xl">Page Title</h1>
  {/* content */}
</Wrapper>
```
Add `maxWidth="WIDE"` only when the page genuinely needs more room (see width mapping above).

---

## Z-index layers
| value | use for |
|-------|---------|
| `z-10` | base floating elements |
| `z-20` | mid-level overlays |
| `z-40` | high overlays (nav, sticky elements) |
| `z-50` | dialogs, modals, loaders |
