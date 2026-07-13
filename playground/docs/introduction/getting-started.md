# Getting Started

Welcome to **Docusite v2** — the simplest way to create documentation for your project.

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

5. It has by default package json source @\{packageJson.name} - @{packageJson.name}

