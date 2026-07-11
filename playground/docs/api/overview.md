# API Overview

This page demonstrates the API reference section of docusite.

## Configuration API

### `defineConfig(config)`

Type-safe config helper.

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Project docs',
  // ...
})
```

### `DocusiteConfig`

Full configuration interface:

| Option | Type | Default | Description |
|---|---|---|---|
| `docsDir` | `string` | `'./docs'` | Path to docs directory |
| `title` | `string` | — | Site title |
| `description` | `string` | — | Site description |
| `logo` | `string` | — | Logo path |
| `colors` | `{ light?, dark? }` | — | Brand colors |
| `nav` | `NavItem[]` | — | Navigation items |
| `sidebar` | `Sidebar` | — | Sidebar config |
| `locales` | `Record<string, Locale>` | — | i18n locales |
| `search` | `'local' \| Algolia` | `'local'` | Search provider |
| `llms` | `boolean \| LlmsOptions` | `true` | llms.txt generation |
