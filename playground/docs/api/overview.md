# API Overview

This page demonstrates the API reference section of docusite.
Current version: **@{version.full}** (v@{version.major}.@{version.minor}).  
API base URL: @{api.baseUrl}  
Full version object: @{version}

## `defineConfig(config)`

Type-safe config helper.

```ts
import { defineConfig } from "docusite";

export default defineConfig({
  title: "My Project",
  description: "Project docs",
});
```

## Configuration Options

| Option        | Type                     | Default    | Description             |
| ------------- | ------------------------ | ---------- | ----------------------- |
| `docsDir`     | `string`                 | `'./docs'` | Path to docs directory  |
| `title`       | `string`                 | —          | Site title              |
| `description` | `string`                 | —          | Site description        |
| `logos`       | `{ main?: string; hero?: string; favicon?: string }` | — | Logos: `main` (navbar), `hero` (home→main), `favicon` (tab→main) |
| `colors`      | `{ light?, dark? }`      | —          | Brand colors            |
| `versions`    | `{ latest, older? }`     | —          | Version selector config |
| `search`      | `'local' \| Algolia`     | `'local'`  | Search provider         |
| `llms`        | `boolean \| LlmsOptions` | `true`     | llms.txt generation     |
