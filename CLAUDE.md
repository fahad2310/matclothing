# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAT Clothing — a 3D e-commerce showcase website for a clothing, watches, and shoes brand. Built with a dark luxury aesthetic, interactive 3D product viewers, and WhatsApp-based ordering.

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npx playwright test              # Run all E2E tests
npx playwright test tests/cart   # Run specific test suite
```

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **React Three Fiber + Drei** — 3D product viewers and hero scene
- **GSAP + ScrollTrigger** — scroll-triggered animations, text reveals, parallax
- **Framer Motion** — page transitions, layout animations, AnimatePresence
- **Tailwind CSS v4** — CSS-first config, dark-only theme
- **Zustand** — cart state with localStorage persistence
- **Lenis** — smooth scrolling

## Architecture

### Data Flow
Products are stored in `src/data/products.json`. The `src/services/productService.ts` abstraction layer reads from this file — all components use the service, never import JSON directly. The admin dashboard writes to this same JSON via API routes (`/api/products`).

### 3D Components (`src/components/three/`)
All R3F components are **client-only** — dynamically imported via `CanvasWrapper` which uses `next/dynamic` with `ssr: false`. `CanvasWrapper` also handles device capability detection (WebGL support, GPU tier) and renders fallback content on weak devices.

### Animation Components (`src/components/animations/`)
GSAP handles scroll-triggered and timeline animations. Framer Motion handles layout animations and presence transitions. They are never used on the same element.

### Admin Dashboard (`/admin`)
Password-protected via middleware (`src/middleware.ts`). Session stored in httpOnly cookie. Default password is `mat-admin-2026` (set via `ADMIN_PASSWORD` env var). Product CRUD through API routes that read/write `products.json`.

### Cart & Ordering
Zustand store with `persist` middleware → localStorage. WhatsApp ordering generates pre-filled `wa.me` links with product details and URLs. Shareable product links encode variant/size in URL query params.

## Theme
Dark-only: background `#0a0a0a`, foreground `#f5f5f5`, accent gold `#c9a84c`, surfaces `#1a1a1a`/`#2a2a2a`. Theme variables defined in `src/app/globals.css` under `@theme inline`.

## Key Conventions
- `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- Product types in `src/types/product.ts`, cart types in `src/types/cart.ts`
- Constants (WhatsApp number, site URL) in `src/lib/constants.ts`
