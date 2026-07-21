# docusite

Dead-simple documentation tool powered by VitePress.

## Quick Start

```bash
pnpm add -D docusite
```

Create `docusite.config.ts` in your project root:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Awesome project docs',
  logos: {
    main: '/public/logo.svg',
    hero: '/public/logo.svg',
  },
  colors: {
    light: '#646cff',
    dark: '#535bf2',
  },
  nav: [
    { text: 'Guide', link: '/guide/' },
  ],
  sidebar: {
    '/guide/': [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
    ],
  },
  search: 'local',
  llms: true,
  socialLinks: [
    { icon: 'github', link: 'https://github.com/user/repo' },
  ],
})
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build",
    "docs:preview": "docusite preview"
  }
}
```

Create your docs:

```bash
mkdir -p docs/guide
echo '# Getting Started\n\nWelcome to the docs!' > docs/guide/getting-started.md
echo '---\nlayout: home\n---' > docs/index.md
```

Run the dev server:

```bash
pnpm docs:dev
```

## Configuration

### `docsDir`

Path to the docs directory (default: `'./docs'`).

### `title` / `description`

Site title and description. Used in HTML `<head>` and the default theme.

### `logos`

Site logos — paths relative to the docs directory, including `public/`
(file `docs/public/logo.svg` → `'/public/logo.svg'`):

```ts
logos: {
  main: '/public/logo.svg', // navbar, next to the site title
  hero: '/public/logo.svg', // home page hero image
  favicon: '/public/logo.svg', // browser tab icon (optional; defaults to main)
  banner: '/public/banner.png', // Open Graph / Twitter card image
}
```

- `main` — logo in the navbar next to the site title  
- `hero` — hero image on pages with `layout: home` (injected into frontmatter; falls back to `main` if omitted)
- `favicon` — favicon for the browser tab (falls back to `main` if omitted)
- `banner` — image for Open Graph / Twitter Cards (`og:image`, `twitter:image`); not set unless provided

### Open Graph / Twitter Cards

When a site hostname is known (`github` or `sitemap.hostname`), docusite injects canonical, Open Graph, and Twitter Card meta tags into `<head>`. Image tags are added only when `logos.banner` is set.

### `colors`

Brand colors for automatic CSS variable generation. Provide a `light` and/or `dark` hex color:

```ts
colors: {
  light: '#646cff',  // Used for :root (light theme)
  dark: '#535bf2',   // Used for .dark (dark theme)
}
```

Docusite auto-generates all VitePress brand CSS variables (`--vp-c-brand-1`, `--vp-c-brand-2`, `--vp-c-brand-3`, `--vp-c-brand-soft`, `--vp-c-brand-dark`, `--vp-c-brand-dimm`).

### `nav` / `sidebar`

Standard VitePress navigation and sidebar configuration. See [VitePress Default Theme Config](https://vitepress.dev/reference/default-theme-config).

### `locales`

Multi-language support via VitePress i18n:

```ts
locales: {
  root: { label: 'English', lang: 'en' },
  ru: { label: 'Русский', lang: 'ru', link: '/ru/' },
}
```

Each locale can have its own `nav` and `sidebar`.

### `search`

Search provider. Default is `'local'` (MiniSearch). For Algolia:

```ts
search: {
  provider: 'algolia',
  options: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
  },
}
```

### `llms`

Enable `llms.txt` and `llms-full.txt` generation (default: `true`). Disable with `llms: false`, or pass options:

```ts
llms: {
  ignoreFiles: ['private/**'],
  description: 'Custom description for llms.txt',
}
```

### `socialLinks`

Social links displayed in the navigation bar.

### `head`

Additional `<head>` tags (same format as VitePress).

### `customCss`

Custom CSS file paths to inject.

### `themeConfigOverrides` / `siteConfigOverrides`

Raw VitePress theme/site config overrides, merged last. Use these for any VitePress option not covered by docusite's config.

## CLI

```bash
docusite dev [root]     # Start dev server
docusite build [root]   # Build for production
docusite preview [root] # Preview production build
```

Options:
- `--port <port>` — Specify dev/preview server port

## How It Works

Docusite reads your `docusite.config.ts`, transforms it into a VitePress configuration, writes it to `.vitepress/config.mts` inside your docs directory, and runs VitePress's programmatic API. The `.vitepress/` directory is automatically added to your docs' `.gitignore`.

## Requirements

- Node.js >= 20
- pnpm (recommended) or npm/yarn

## License

MIT
