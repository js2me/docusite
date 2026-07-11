# Getting Started

## Setup

Create a `docs/` directory in your project root and add markdown files:

```
my-project/
├── docusite.config.ts
├── docs/
│   ├── index.md
│   └── guide/
│       └── intro.md
└── package.json
```

## Brand Colors

Docusite auto-generates all VitePress CSS variables from a single brand color:

```ts
colors: {
  light: '#646cff',  // light theme brand color
  dark: '#535bf2',   // dark theme brand color
}
```

The following CSS variables are generated automatically:

| Variable | Description |
|---|---|
| `--vp-c-brand-1` | Primary brand color |
| `--vp-c-brand-2` | Lighter variant (+10%) |
| `--vp-c-brand-3` | Lighter variant (+20%) |
| `--vp-c-brand-soft` | Low-opacity background |
| `--vp-c-brand-dark` | Darker variant (-10%) |
| `--vp-c-brand-dimm` | Very low-opacity background |

## Search

Local search is enabled by default. No configuration needed!
