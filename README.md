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
  logo: '/logo.svg',
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

### `logo`

Path to the logo image (relative to the docs public directory).

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
