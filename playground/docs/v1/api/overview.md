# API Overview (v1)

> ⚠️ You are viewing documentation for **v1**. [Switch to the latest version →](/introduction/getting-started)

## `defineConfig(config)`

```ts
import { defineConfig } from 'docusite'

export default defineConfig({
  title: 'My Project',
  description: 'Project docs',
})
```

## Configuration Options (v1)

| Option | Type | Default | Description |
|---|---|---|---|
| `docsDir` | `string` | `'./docs'` | Path to docs directory |
| `title` | `string` | — | Site title |
| `description` | `string` | — | Site description |
| `nav` | `NavItem[]` | — | Navigation items |
| `sidebar` | `Sidebar` | — | Sidebar config |
