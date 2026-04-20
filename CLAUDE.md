# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Entwicklung
pnpm run dev          # Dev-Server (localhost:4321)
pnpm run dev:cms      # Keystatic CMS Interface

# Build
pnpm run build:site   # Produktions-Build (statisch) + Pagefind-Indexierung
pnpm run build:cms    # CMS-Build (SSR via Node)
pnpm run preview      # Produktions-Build lokal vorschauen

# Qualität
pnpm run lint         # ESLint
pnpm run format       # Prettier (schreibend)
pnpm run format:check # Prettier (nur prüfen)
pnpm run sync         # TypeScript-Typen für Astro generieren
```

## Architektur

### Duales Build-System
Das Projekt hat zwei Build-Modi, gesteuert durch `BUILD_TARGET`:
- `BUILD_TARGET=site` → statische Site (Standard), deployt via nginx (Docker)
- `BUILD_TARGET=cms`  → SSR-Server mit Keystatic CMS Interface

`astro.config.ts` liest diese Variable und schaltet `output`, `adapter` und die Keystatic-Integration entsprechend um.

### Content-Pipeline
Blog-Posts liegen als Markdown in `src/data/blog/*.md` mit Zod-validiertem Frontmatter (Schema in `src/content.config.ts`). Die Astro Content Layer API (Glob-Loader) liest sie ein.

Wichtige Frontmatter-Felder: `title`, `pubDatetime`, `description` (Pflicht), `featured`, `draft`, `tags`, `slug` (überschreibt Dateiname), `modDatetime`.

### Utility-Funktionen (`src/utils/`)
- `getSortedPosts.ts` – filtert Drafts, sortiert nach `modDatetime` → `pubDatetime`
- `postFilter.ts` – berücksichtigt `scheduledPostMargin` (15 min) für geplante Posts
- `getPath.ts` – URL-Pfad-Auflösung mit optionalem Slug-Override
- `generateOgImages.ts` – dynamische OG-Bilder via Satori + Resvg (SVG → PNG)
- `slugify.ts` – URL-Slug-Generierung

### Keystatic CMS (`keystatic.config.ts`)
Headless CMS mit zwei Storage-Optionen:
- GitHub-Integration (via `KEYSTATIC_GITHUB_CLIENT_ID/SECRET` + `KEYSTATIC_SECRET`)
- Lokaler Fallback (ohne Credentials)

Bilder landen in `src/assets/images/posts/`.

### Site-Konfiguration
Zentrale Konfiguration in `src/config.ts` (SITE-Objekt): URL, Autor, Sprache (de), Timezone (Europe/Berlin), Pagination, OG-Image-Einstellungen.

### Deployment
Multi-Stage Dockerfile: Node (Build) → nginx:alpine (Runtime, Port 80).
GitHub Actions CI (`.github/workflows/`) prüft bei PRs: Lint, Format, Build.

### Suche
Pagefind wird nach `build:site` automatisch über das Dist-Verzeichnis indexiert. Keine Server-seitige Suche nötig.

### Shiki Code-Highlighting
Custom Transformer in `src/utils/transformers/fileName.ts` zeigt Dateinamen über Code-Blöcken an. Themes: `min-light` / `night-owl`.
