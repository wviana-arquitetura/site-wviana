# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js)
npm run build     # Production build
npm run lint      # ESLint
npm run format    # Prettier
```

There are no automated tests in this project.

## Architecture

**Next.js 16 App Router** project for the W.VIANA architecture office public website (institutional: home, projects, process, about, contact).

### Data Layer
Projects are stored as static JSON in `src/data/projects.json`. The data flows:
- `src/services/projects.service.ts` — raw access functions (getAllProjects, getProjectBySlug, getRelatedProjects, getNextProject)
- `src/lib/projects.ts` — re-exports for use in components
- `src/hooks/use-projects.ts` — React Query wrapper for client-side fetching
- `src/types/project.ts` — Project type definition

### Animations
GSAP with ScrollTrigger is the primary animation library. Always import from `src/lib/gsap.ts` (not directly from `gsap`) — this file handles plugin registration. Lenis is used for smooth scrolling via `src/components/providers/SmoothScrollProvider.tsx`.

### Providers (in layout.tsx)
1. `GlobalIntroLoader` — site-wide intro/loader animation
2. `QueryProvider` — TanStack React Query
3. `SmoothScrollProvider` — Lenis smooth scroll

Page transitions are handled by `src/components/providers/PageTransition.tsx` via `src/app/template.tsx`.

### State Management
Zustand (`src/store/use-ui-store.ts`) manages UI state (mobile menu open/close).

### Styling
- Tailwind CSS + SCSS (`sass`)
- Tipografia (manual de marca): `next/font/local` em `src/app/layout.tsx` — **Aeonik** (`src/fonts/AeonikTRIAL-*.otf`) → `--font-body` / `font-sans`; **Agrandir Narrow** (`src/fonts/Agrandir-Narrow.otf`) → `--font-display` / headings em `globals.css`
- Brand colors: `#000000`, `#BAAEA4` (warm taupe), `#F2F2F2` (off-white)
- shadcn/ui-style components in `src/components/ui/`

### Key Routes
- `/` — Home page with multiple animated sections
- `/projetos` — Projects listing
- `/projetos/[slug]` — Project detail
- `/processo`, `/sobre`, `/contato` — Static pages
