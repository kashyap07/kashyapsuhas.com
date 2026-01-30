# CLAUDE.md - kashyapsuhas.com Architecture Guide

## Project Overview

**kashyapsuhas.com** is a personal portfolio and blog website built with modern web technologies. It's a Next.js 16 application with TinaCMS for content management, featuring a portfolio section, blog posts, photo galleries, tools, reviews, and more.

**Key Technologies:**

- **Framework:** Next.js 16 (App Router)
- **CMS:** TinaCMS v2.9.0 (Git-based content management)
- **UI:** React 19.1.0, Tailwind CSS 3.4.7
- **Content:** MDX for blog posts, JSON for reviews
- **Runtime:** Node.js with TypeScript
- **Testing:** Jest with React Testing Library
- **Code Quality:** ESLint, Prettier with import sorting and Tailwind class sorting

## Claude instructions

- I really like it when comments are in small case unless really required
- code comments must not be verbose - it is ok to have bad grammar
- code doesn't need to be "priduction ready". iterative approach is better

## Build and Development Commands

### Development

```bash
npm run dev
# Starts Next.js dev server with TinaCMS local mode
# Uses turbopack for faster rebuilds
# Environment: TINA_PUBLIC_IS_LOCAL=true
```

### Production Build

```bash
npm run build      # Build Next.js app + TinaCMS schema
npm start          # Run production server
npm run build:analyze  # Build with bundle analysis (ANALYZE=true)
```

### Code Quality

```bash
npm run lint       # Run ESLint on codebase
npm run format     # Format all code with Prettier + Tailwind sort
npm run format:check  # Check formatting without writing
npm run format:staged  # Format only staged git files
```

### Testing

```bash
npm test           # Run Jest tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Generate coverage report (HTML in /coverage)
```

## Project Structure

```
src/
├── app/                          # Next.js 16 App Router
│   ├── (withNav)/               # Route group - includes header navigation
│   │   ├── blog/                # Blog listing and individual posts
│   │   │   ├── page.tsx         # Blog index (lists all posts by year)
│   │   │   └── [slug]/page.tsx  # Individual blog post with dynamic routes
│   │   ├── tools/               # Interactive client-side tools
│   │   │   ├── image-compressor/  # Browser image compression
│   │   │   ├── background-remover/  # AI-powered background removal (ONNX Runtime)
│   │   │   ├── image-converter/  # Image format conversion
│   │   │   ├── beat-maker/      # Audio sequencer tool
│   │   │   └── text-diff/       # Text comparison tool
│   │   ├── reviews/             # Reviews listing and filtering
│   │   ├── photos/              # Photo gallery
│   │   ├── contact/             # Contact page
│   │   └── layout.tsx           # Shared layout with header (name + nav)
│   ├── api/                     # Server-side API routes (if any)
│   ├── page.tsx                 # Home page (root route, no nav)
│   ├── layout.tsx               # Root layout (metadata, fonts, globals)
│   ├── robots.ts                # SEO - robots.txt generation
│   ├── sitemap.ts               # SEO - sitemap.xml generation
│   ├── not-found.tsx            # 404 page
│   └── globals.css              # Global Tailwind styles
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Mdx.tsx              # MDX renderer with custom components
│   │   ├── Wrapper.tsx          # Max-width container
│   │   ├── ImageAutoHeight.tsx  # Responsive image component
│   │   ├── Dialog.tsx           # Modal/dialog component
│   │   ├── TouchMarquee.tsx     # Touch-enabled marquee animation
│   │   └── index.ts             # Component exports
│   └── icons/                   # SVG icon components
├── db/                          # Data access layer
│   ├── blog.ts                  # Blog post file reading and parsing
│   └── reviews.ts               # Review JSON file reading
├── hooks/                       # React custom hooks
│   └── useScreenBeingTouched.tsx # Touch event detection
├── types/                       # TypeScript type definitions
│   ├── onnxruntime-web.d.ts     # WASM ML model types
│   └── heic2any.d.ts            # HEIC image format types
├── utils/                       # Utility functions
│   ├── cn.ts                    # Class name merging (tailwind-merge)
│   ├── formatDate.ts            # Date formatting utility
│   └── __tests__/               # Unit tests
└── content/ (at root)           # Managed by TinaCMS
    ├── blog/                    # MDX blog post files
    └── reviews/                 # JSON review files
```

## Architectural Patterns

### 1. Content Management (TinaCMS Integration)

**TinaCMS Config:** `/tina/config.ts`

- **Blog Collection:** MDX format, stored in `content/blog/`
  - Fields: title, description, publishedDateTime, categories, heroImage, post (rich-text body)
  - Frontmatter format (YAML) parsed from MDX files
  - Auto-generated admin interface at `/admin`

- **Reviews Collection:** JSON format, stored in `content/reviews/`
  - Fields: name, category, rating, wouldRecommend, summary, pros/cons arrays, link, reviewDate
  - Manually editable JSON structure

**Development Mode:**

- Set `TINA_PUBLIC_IS_LOCAL=true` to use local Git-based CMS
- Edits are immediately saved to the file system
- `tinacms dev` runs the local editor alongside Next.js

### 2. Blog Post Lifecycle

**File Format:** MDX with frontmatter

```mdx
---
publishedDateTime: 2023-03-07T07:53:59.000Z
title: Tailwind Supremacy
description: Tailwind. Good. Use.
heroImage: ""
---

# MDX content here with React components
```

**Data Flow:**

1. `src/db/blog.ts` reads MDX files from `content/blog/`
2. Parses YAML frontmatter with regex
3. Extracts tweet IDs for potential embeds
4. Sorts by publishedDateTime (newest first)
5. Slugs generated from filename (lowercase)

**Rendering:**

- Blog listing (`/blog`) groups posts by year
- Individual post (`/blog/[slug]`) uses dynamic routes with `generateMetadata`
- Content rendered via `CustomMDX` component using `next-mdx-remote/rsc`
- Structured data (JSON-LD) added to each post for SEO

### 3. MDX Content Rendering

**CustomMDX Component** (`src/components/ui/Mdx.tsx`)

Custom component mappings for MDX:

- **Headings (h1-h6):** Auto-slugify for anchor links (`#heading-slug`)
- **Links:** Smart routing (internal `/` prefixes use `Next/Link`, external open in new tab)
- **Code:** Syntax highlighting via `sugar-high` library
- **Images:** Custom `ImageAutoHeight` component for responsive sizing

**Code Highlighting:**

- Uses `sugar-high` for lightweight syntax highlighting
- Applied to `<code>` blocks in MDX

### 4. Route Groups and Navigation

**(withNav) Route Group:**

- Nested layout includes header with "Suhas Kashyap" title and implicit navigation
- Applies to: blog, tools, reviews, photos, contact
- Root layout (`/`) is separate - no header navigation

**Navigation Pattern:**

```typescript
// src/app/(withNav)/layout.tsx
// Wraps all withNav routes with header
// Other routes (/) don't get this layout
```

### 5. Interactive Tools Architecture

All tools use `"use client"` directive for client-side rendering.

**Image Compressor:**

- Uses `browser-image-compression` library
- Debounced slider (350ms) for compression feedback
- Comparison slider showing before/after
- Download as JPEG

**Background Remover:**

- Uses ONNX Runtime Web for AI model inference
- Model path: `/public/models/u2netp.onnx` (U-2-Net model)
- WebAssembly-based processing
- Webpack configured to handle `.wasm` files and ONNX Runtime

**Beat Maker:**

- Sequencer with audio synthesis
- Client-side hooks: `useAudioEngine`, `useSequencer`, `useRecorder`, `useKeyboard`
- Full MIDI/audio control in browser

**Image Converter:**

- Format conversion (WebP, PNG, JPEG, etc.)
- HEIC support via `heic2any` library

### 6. SEO and Metadata

**Root Metadata:**

- Uses Next.js Metadata API throughout
- `robots.ts` - dynamically generates `/robots.txt`
- `sitemap.ts` - dynamically generates `/sitemap.xml` from blog posts + static routes

**Blog Post SEO:**

```typescript
// Automatic per-post metadata generation
export async function generateMetadata(props) {
  // Title, description, keywords, Open Graph, canonical URL
  // Structured data (JSON-LD) for BlogPosting schema
}
```

**Static Generation:**

- `export const dynamic = "force-static"` on blog post pages
- Pre-renders all blog slugs for optimal performance

### 7. Data Access Layer Pattern

Two database modules for file-based content:

**blog.ts:**

```typescript
// Synchronous file reading
// Regex-based frontmatter parsing
// Returns { metadata, slug, tweetIds, content }
export function getBlogPosts();
```

**reviews.ts:**

```typescript
// JSON file reading
// Typed Review interface
// Sorted by reviewDate descending
export function getReviews(): Review[];
```

Both use `fs` and `path` for file operations at the root `process.cwd()`.

### 8. Styling and Theme

**Tailwind Configuration:**

- Dark mode enabled (`darkMode: "selector"`)
- Custom colors via CSS variables:
  - `--background`, `--foreground`, `--columbiaYellow`
- Typography plugin for prose styling in blog posts
- Custom Tailwind plugins:
  - `children` and `children-iterative` for child element targeting
  - `hocus` for combined hover/focus states
  - `text-shadow` utility
  - `tailwindcss-motion` for animations

**Design System:**

- Gap spacing: gap-3 (small), gap-6 (standard), gap-14 (section)
- Primary accent color: Columbia Yellow (`--columbiaYellow`)
- Responsive typography scaling

### 9. TypeScript Paths and Imports

**Path aliases** (tsconfig.json):

```
@utils/*  -> src/utils/*
@components/*  -> src/components/*
@hooks/*  -> src/hooks/*
@db/*  -> src/db/*
```

Prettier configured to sort imports in order:

1. React/Next imports
2. Third-party modules
3. Aliased imports (@db, @components, @hooks, @utils)
4. Local relative imports

### 10. Testing Setup

**Jest Configuration:**

- Preset: `ts-jest`
- Environment: `jsdom` (browser simulation)
- Module name mapper matches tsconfig paths
- CSS mocked with `identity-obj-proxy`
- Coverage thresholds: 50% branches/functions/lines/statements
- Test patterns: `**/__tests__/**/*.[jt]s?(x)` or `*.test.tsx`

**Test Utilities:**

- React Testing Library with @testing-library/jest-dom
- User event simulation for interactions

## WebAssembly and Binary Assets

**Next.js Webpack Configuration** (`next.config.js`):

```javascript
// Enable async WebAssembly
config.experiments.asyncWebAssembly = true

// Handle .wasm files as assets
config.module.rules.push({
  test: /\.wasm$/,
  type: "asset/resource",
})

// ONNX Runtime handling
config.module.noParse.push(/ort[\\/]node\.min\.mjs$/)

// Client-side fallbacks
config.resolve.fallback = { fs: false, path: false, os: false, ... }
```

This allows the background-remover tool to use ONNX Runtime in the browser.

## Environment Variables

**Required for development:**

- `NEXT_PUBLIC_TINA_CLIENT_ID` - TinaCMS client ID
- `TINA_TOKEN` - TinaCMS authentication token
- `NEXT_PUBLIC_SITE_URL` - Site URL for metadata base (defaults to https://www.kashyapsuhas.com)

**Branch detection:**

- TinaCMS automatically detects branch via `GITHUB_BRANCH`, `VERCEL_GIT_COMMIT_REF`, or `HEAD`

## Important Patterns

### Frontmatter Parsing

Regex-based YAML frontmatter extraction (not a full YAML parser):

```typescript
const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
// Line-by-line parsing: "key: value" format
```

Limitations: Quoted values, complex YAML structures must be on single lines.

### Image Handling

- `ImageAutoHeight` component auto-calculates height based on width
- Uses Next.js Image optimization where appropriate
- Some tools use canvas/data URLs for client-side processing

### Touch Detection

- `useScreenBeingTouched` hook detects touch events
- Used for responsive UI adjustments (e.g., marquee interactions)

### Dynamic Routes with async params

```typescript
// Next.js 16 pattern for dynamic routes
async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  // Use params.slug
}
```

## Common Development Tasks

### Adding a Blog Post

1. Create `.mdx` file in `content/blog/`
2. Add frontmatter with title, description, publishedDateTime, categories, heroImage
3. Write MDX content with React components
4. Automatic indexing on next build/dev restart

### Adding a Review

1. Create `.json` file in `content/reviews/`
2. Match Review type structure with all required fields
3. Edit via TinaCMS admin panel or directly in JSON

### Adding a New Tool

1. Create directory in `src/app/(withNav)/tools/[tool-name]/`
2. Mark root component with `"use client"` directive
3. Add metadata export for page title/description
4. Use `Wrapper` component for consistent layout
5. Add to tools index page (`src/app/(withNav)/tools/page.tsx`)

### Styling

- Use Tailwind classes directly in JSX
- Custom colors available via CSS variables
- Typography prose for blog content (auto-applied)

## File Watch and Hot Reload

- **Next.js turbopack** enabled for faster rebuilds
- **TinaCMS** watches file changes and syncs with Git
- **Tailwind JIT** watches content for class generation

## Debugging Notes

- Node inspector available in dev: `NODE_OPTIONS='--inspect'` in dev script
- Use browser DevTools for client-side component debugging
- ONNX Runtime WASM path set to root: `/` (from `/public/models/`)
- Blog slug generation is case-insensitive (filenames lowercased)

## Known Limitations/TODOs

- TinaCMS preview feature not yet implemented (see tina/config.ts comment)
- Frontmatter parser is line-based, not full YAML (but adequate for current needs)
- Some HEIC image support depends on browser capabilities

## Performance Considerations

- Blog posts pre-rendered as static pages
- Sitemap and robots.txt auto-generated at build time
- Image compression is debounced (350ms) to reduce computation
- Next.js Image component used with quality optimization (100, 75)
- Bundle analyzer available with `npm run build:analyze`

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output CLAUDE.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
