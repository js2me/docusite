# Getting Started (v1)

> ⚠️ You are viewing documentation for **v1**. [Switch to the latest version →](/introduction/getting-started)

Welcome to **Docusite v1** documentation.

## Installation (v1)

```bash
pnpm add -D docusite@1
```

## Configuration (v1)

Create `docusite.config.ts`:

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
})
```

The v1 config has fewer options — no brand color auto-generation, versioning, or llms.txt support.
