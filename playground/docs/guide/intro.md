# Introduction

Welcome to **Docusite** — the simplest way to create documentation for your project.

## Why Docusite?

Setting up VitePress from scratch requires creating config files, theme customization, and managing the build pipeline. Docusite wraps all of that into a single config file.

## Quick Start

1. Install docusite:

```bash
pnpm add -D docusite
```

2. Create `docusite.config.ts`:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  colors: { light: '#646cff', dark: '#535bf2' },
})
```

3. Add scripts to `package.json`:

```json
{
  "scripts": {
    "docs:dev": "docusite dev",
    "docs:build": "docusite build"
  }
}
```

4. Write markdown in `./docs/` and run `pnpm docs:dev`.
