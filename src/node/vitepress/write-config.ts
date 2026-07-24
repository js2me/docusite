import { mkdirSync, existsSync, readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteLlmsOptions, DocusiteContentInjection, DocusiteSourceLinks, DocusiteVersions } from '../../shared/types.js'
import { FRAMEWORK_MARKS, type FrameworkMarkName } from '../config/framework-marks.js'

// Resolve the real path to vitepress-plugin-llms from within docusite's installation
const llmsPluginDir = dirname(
  fileURLToPath(import.meta.resolve('vitepress-plugin-llms')),
)

// Resolve UnoCSS paths from docusite's installation (for iconify icons in feature cards)
const unocssVitePath = fileURLToPath(import.meta.resolve('unocss/vite'))
const unocssMainPath = fileURLToPath(import.meta.resolve('unocss'))
const iconifyLogosPath = fileURLToPath(import.meta.resolve('@iconify-json/logos/icons.json'))

/**
 * Find docusite's dist directory by resolving from the CLI bundle.
 * Since tsup bundles everything into dist/node/cli.js,
 * import.meta.url here points to dist/node/cli.js.
 * So dist dir = dirname(import.meta.url) -> dist/node -> dist
 */
function findDocusiteDistDir(): string {
  const thisFile = fileURLToPath(import.meta.url)
  // thisFile = .../dist/node/cli.js (or .../dist/node/vitepress/write-config.js if not bundled)
  // We need to find the "dist" directory
  const dir = dirname(thisFile)
  // If bundled into cli.js: dir = dist/node → dist = dirname(dir)
  // If separate file: dir = dist/node/vitepress → dist = dirname(dirname(dir))
  // Check which case by looking for dist/node structure
  if (existsSync(resolve(dir, 'cli.js')) || dir.endsWith('/node') || dir.endsWith('\\node')) {
    // We're in dist/node/ (bundled into cli.js)
    return dirname(dir)
  }
  // We're in dist/node/vitepress/ (separate file)
  return dirname(dirname(dir))
}

const docusiteDistDir = findDocusiteDistDir()

// ---------------------------------------------------------------------------
// Inline llms dev plugin (served in generated config.mts)
// ---------------------------------------------------------------------------

const LLMS_DEV_PLUGIN_CODE = `import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

function __docusite_llms_dev_plugin(docsDir, base = '/') {
  const basePrefix = (base || '/').replace(/\\/$/, '')
  return {
    name: 'docusite:llms-dev',
    configureServer(server) {
      function parseFrontmatter(raw) {
        const data = {}
        let content = raw
        if (raw.startsWith('---')) {
          const end = raw.indexOf('---', 3)
          if (end !== -1) {
            const yaml = raw.slice(3, end)
            content = raw.slice(end + 3).trim()
            for (const line of yaml.split('\\n')) {
              const m = line.match(/^(\\w[\\w-]*)\\s*:\\s*(.+)/)
              if (m) data[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
            }
          }
        }
        return { data, content }
      }

      function collectMdFiles(dir, baseDir) {
        const files = []
        let entries
        try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return files }
        for (const entry of entries) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
          const fullPath = join(dir, entry.name)
          if (entry.isDirectory()) {
            files.push(...collectMdFiles(fullPath, baseDir))
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            try {
              const raw = readFileSync(fullPath, 'utf-8')
              const { data: fm, content } = parseFrontmatter(raw)
              files.push({
                relativePath: '/' + relative(baseDir, fullPath).replace(/\\\\/g, '/'),
                content: content.trim(),
                title: fm.title || '',
                description: fm.description || '',
              })
            } catch { /* skip */ }
          }
        }
        return files
      }

      function matchLlmsPath(pathname, file) {
        return pathname === '/' + file || pathname === basePrefix + '/' + file
      }

      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        const isLlmsFull = matchLlmsPath(pathname, 'llms.txt')
        const isLlms = matchLlmsPath(pathname, 'llms.txt')
        if (isLlmsFull || isLlms) {
          try {
            const files = collectMdFiles(docsDir, docsDir)
            let result
            if (isLlmsFull) {
              result = files.map(f => '# ' + f.relativePath + '\\n\\n' + f.content).join('\\n\\n---\\n\\n') + '\\n'
            } else {
              const lines = files.map(f => {
                const name = f.title || f.relativePath.replace(/\\.md$/, '').replace(/^\\//, '')
                const desc = f.description ? ': ' + f.description : ''
                return '- [' + name + '](' + f.relativePath + ')' + desc
              })
              result = '# Documentation\\n\\n' + lines.join('\\n') + '\\n'
            }
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(result)
            return
          } catch { /* fall through */ }
        }
        next()
      })
    },
  }
}`

// ---------------------------------------------------------------------------
// Inline content injections plugin (served in generated config.mts)
// ---------------------------------------------------------------------------

const SOURCE_LINKS_PLUGIN_CODE = `function __docusite_source_links_plugin(options) {
  const from = options.from || '/src'
  const target = options.target.replace(/\\/$/, '')
  const escapedFrom = from.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&')
  const re = new RegExp('(\\\\(' + escapedFrom + '\\\\/)', 'g')
  return {
    name: 'docusite:source-links',
    enforce: 'pre',
    transform(content, id) {
      if (!id.endsWith('.md')) return null
      return content.replace(re, '(' + target + '/')
    },
  }
}`

const CONTENT_INJECTIONS_PLUGIN_CODE = `function __docusite_content_injections_plugin(injections) {
  const map = {}
  for (const inj of injections) map[inj.key] = inj.value
  return {
    name: 'docusite:content-injections',
    enforce: 'pre',
    transform(content, id) {
      if (!id.endsWith('.md')) return null
      return content.replace(/@\\{([a-zA-Z_$][a-zA-Z0-9_$.]*)\\}/g, (_, path) => {
        const parts = path.split('.')
        let val = map[parts[0]]
        for (let i = 1; i < parts.length && val != null; i++) {
          val = val[parts[i]]
        }
        if (val == null) return ''
        if (typeof val === 'object') return JSON.stringify(val).replace(/\\{/g, '&#123;').replace(/\\}/g, '&#125;')
        return String(val)
      })
    },
  }
}`

const LOGOS_HERO_PLUGIN_CODE = `function __docusite_logos_hero_plugin(src) {
  return {
    name: 'docusite:logos-hero',
    enforce: 'pre',
    transform(content, id) {
      if (!id.endsWith('.md')) return null
      const match = content.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/)
      if (!match) return null
      const fm = match[1]
      if (!/^layout:\\s*home\\s*$/m.test(fm)) return null
      if (!/^hero:\\s*$/m.test(fm)) return null

      let newFm = fm
      if (/^(\\s*)image:\\s*\\n\\1\\s+src:\\s*.+$/m.test(newFm)) {
        newFm = newFm.replace(/^(\\s*image:\\s*\\n\\s+src:\\s*).+$/m, '$1' + src)
      } else if (/^(\\s*)image:\\s+\\S+/m.test(newFm)) {
        newFm = newFm.replace(/^(\\s*image:\\s+)\\S+/m, '$1' + src)
      } else {
        newFm = newFm.replace(/^(hero:\\s*)$/m, '$1\\n  image:\\n    src: ' + src)
      }

      return content.slice(0, match.index) + '---\\n' + newFm + '\\n---' + content.slice(match.index + match[0].length)
    },
  }
}`

const UNOCSS_ICON_SCAN_CODE = `function __docusite_scan_icon_classes(docsDir) {
  const icons = new Set()
  const re = /\\bi-([a-z0-9-]+:[a-z0-9-]+)\\b/gi

  function walk(dir) {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const text = readFileSync(fullPath, 'utf-8')
          let match
          while ((match = re.exec(text))) icons.add('i-' + match[1])
        } catch { /* skip */ }
      }
    }
  }

  walk(docsDir)
  return [...icons]
}`

// ---------------------------------------------------------------------------
// Write .vitepress/config.mts + theme files
// ---------------------------------------------------------------------------

export interface WriteOptions {
  versions?: DocusiteVersions
  versionsLatestLink?: string
  changelogSrc?: string
  contentInjections?: DocusiteContentInjection[]
  runtimeScriptCode?: string
  hasPathKeyedNav?: boolean
  /** Real i18n locales configured — enables version-aware language switcher. */
  hasI18n?: boolean
  /** Framework mark Vue components to register (detected from live markdown usage). */
  frameworkMarks?: FrameworkMarkName[]
}

/**
 * Write the transformed VitePress config to disk as a valid `.vitepress/config.mts`.
 * Also writes custom theme files (always) and copies changelog source if configured.
 * Ensures `.vitepress/` is in the docs directory's `.gitignore`.
 */
export function writeVitePressConfig(
  docsDir: string,
  config: UserConfig<DefaultTheme.Config>,
  options: WriteOptions = {},
): void {
  const vpxDir = resolve(docsDir, '.vitepress')
  mkdirSync(vpxDir, { recursive: true })

  // Write config
  const configPath = resolve(vpxDir, 'config.mts')
  const content = serializeConfig(config)
  writeFileSync(configPath, content, 'utf-8')

  // Write theme files (on-demand framework marks + optional NavVersionsFlyout)
  writeThemeFiles(
    vpxDir,
    options.versions,
    options.versionsLatestLink,
    options.runtimeScriptCode,
    options.frameworkMarks ?? [],
    options.hasI18n ?? false,
  )

  // Copy changelog source file into docs dir
  if (options.changelogSrc) {
    const srcPath = resolve(process.cwd(), options.changelogSrc)
    const dstPath = resolve(docsDir, 'changelog.md')
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, dstPath)
    } else {
      console.warn(`[docusite] Changelog source not found: ${srcPath}`)
    }
  }

  // Ensure .vitepress/ is gitignored
  ensureGitignore(docsDir)
}

// ---------------------------------------------------------------------------
// Theme files (on-demand framework marks + optional NavVersionsFlyout)
// ---------------------------------------------------------------------------

function writeThemeFiles(
  vpxDir: string,
  versions?: DocusiteVersions,
  versionsLatestLink?: string,
  runtimeScriptCode?: string,
  frameworkMarks: FrameworkMarkName[] = [],
  hasI18n = false,
): void {
  const themeDir = resolve(vpxDir, 'theme')
  const componentsDir = resolve(themeDir, 'components')
  mkdirSync(componentsDir, { recursive: true })

  // Copy only framework mark components that are used live in markdown
  const usedMarks = new Set(frameworkMarks)
  for (const name of FRAMEWORK_MARKS) {
    const dst = resolve(componentsDir, `${name}.vue`)
    if (usedMarks.has(name)) {
      const src = resolve(docusiteDistDir, `node/theme/components/${name}.vue`)
      if (existsSync(src)) {
        copyFileSync(src, dst)
      } else {
        console.warn(`[docusite] ${name}.vue not found at ${src}`)
      }
    } else if (existsSync(dst)) {
      unlinkSync(dst)
    }
  }

  // Client helpers: scroll TOC / sidebar panes + version/i18n path utils
  const themeHelpers = [
    'outline-active-scroll',
    'sidebar-active-scroll',
    ...(versions || hasI18n ? ['version-locale', 'docusite-langs'] as const : []),
  ]
  for (const name of themeHelpers) {
    const src = resolve(docusiteDistDir, `node/theme/${name}.js`)
    const dst = resolve(themeDir, `${name}.js`)
    if (existsSync(src)) {
      copyFileSync(src, dst)
    } else {
      console.warn(`[docusite] ${name}.js not found at ${src}`)
    }
  }

  // Copy NavVersionsFlyout.vue + OldVersionBanner.vue when versioning is enabled
  if (versions) {
    for (const name of ['NavVersionsFlyout', 'OldVersionBanner'] as const) {
      const src = resolve(docusiteDistDir, `node/theme/components/${name}.vue`)
      const dst = resolve(componentsDir, `${name}.vue`)
      if (existsSync(src)) {
        copyFileSync(src, dst)
      } else {
        console.warn(`[docusite] ${name}.vue not found at ${src}`)
      }
    }
  }

  // Version-aware language switcher (replaces stock VitePress translations UI)
  if (hasI18n) {
    for (const name of ['NavBarTranslations', 'NavScreenTranslations'] as const) {
      const src = resolve(docusiteDistDir, `node/theme/components/${name}.vue`)
      const dst = resolve(componentsDir, `${name}.vue`)
      if (existsSync(src)) {
        copyFileSync(src, dst)
      } else {
        console.warn(`[docusite] ${name}.vue not found at ${src}`)
      }
    }
  }

  // Write theme/index.ts with the required component registrations
  const themeIndex = resolve(themeDir, 'index.ts')
  writeFileSync(
    themeIndex,
    buildThemeIndexContent(versions, versionsLatestLink, runtimeScriptCode, frameworkMarks, hasI18n),
    'utf-8',
  )
}

function buildThemeIndexContent(
  versions?: DocusiteVersions,
  versionsLatestLink?: string,
  runtimeScriptCode?: string,
  frameworkMarks: FrameworkMarkName[] = [],
  hasI18n = false,
): string {
  const imports: string[] = [
    `import DefaultTheme from 'vitepress/theme'`,
    ...frameworkMarks.map((name) => `import ${name} from './components/${name}.vue'`),
    `import { setupOutlineActiveScroll } from './outline-active-scroll.js'`,
    `import { setupSidebarActiveScroll } from './sidebar-active-scroll.js'`,
    `import 'uno.css'`,
  ]
  const components: string[] = frameworkMarks.map(
    (name) => `app.component('${name}', ${name})`,
  )

  if (versions) {
    imports.push(`import NavVersionsFlyout from './components/NavVersionsFlyout.vue'`)
    imports.push(`import OldVersionBanner from './components/OldVersionBanner.vue'`)
    components.push(`app.component('NavVersionsFlyout', NavVersionsFlyout)`)
    components.push(`app.component('OldVersionBanner', OldVersionBanner)`)
  }

  if (hasI18n) {
    imports.push(`import NavBarTranslations from './components/NavBarTranslations.vue'`)
    imports.push(`import NavScreenTranslations from './components/NavScreenTranslations.vue'`)
  }

  imports.push(`import type { Theme } from 'vitepress'`)

  // Extract function body from the serialized arrow function
  // e.g. "() => { void import(...).then(...) }" → "void import(...).then(...)"
  let runtimeBody = ''
  if (runtimeScriptCode) {
    const bodyMatch = runtimeScriptCode.match(/^\s*\(?[^=>]*\)?\s*=>\s*\{([\s\S]*)\}\s*$/)
    if (bodyMatch) {
      runtimeBody = bodyMatch[1]!.trim()
    } else {
      // Expression-body arrow: () => expr
      const exprMatch = runtimeScriptCode.match(/^\s*\(?[^=>]*\)?\s*=>\s*(.+)\s*$/)
      if (exprMatch) {
        runtimeBody = exprMatch[1]!.trim()
      }
    }
  }

  const enhanceAppBody = components.join('\n    ')
  // VitePress binds Ctrl/Cmd+K via event.key === 'k', which fails on non-Latin
  // layouts (e.g. Ctrl+Л on Russian). Open search via physical KeyK instead.
  const searchHotkeyFix = `window.addEventListener('keydown', (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.code !== 'KeyK') return
      if (e.key.toLowerCase() === 'k') return
      const btn = document.querySelector<HTMLButtonElement>('.VPNavBarSearch .DocSearch-Button')
      if (!btn) return
      e.preventDefault()
      btn.click()
    })`
  const outlineActiveScroll = `setupOutlineActiveScroll(router)`
  const sidebarActiveScroll = `setupSidebarActiveScroll(router)`
  const clientBody = [searchHotkeyFix, outlineActiveScroll, sidebarActiveScroll, runtimeBody].filter(Boolean).join('\n\n    ')
  const runtimeBlock = `\n\n    if (!import.meta.env.SSR) {\n      ${clientBody}\n    }`

  const needsLayout = !!(versions || hasI18n)
  const layoutSlots: string[] = []
  if (versions) {
    layoutSlots.push(`      'doc-before': () => h(OldVersionBanner, {
        latestLabel: ${JSON.stringify(versions.latest.startsWith('v') ? versions.latest : `v${versions.latest}`)},
        latestLink: ${JSON.stringify(versionsLatestLink || '/')},
        olderVersions: ${JSON.stringify(versions.older ?? [])},
        message: ${JSON.stringify(versions.oldVersionBanner?.message || '')},
      })`)
  }
  if (hasI18n) {
    // After stock translations (CSS-hidden) / social — right side of the navbar
    layoutSlots.push(`      'nav-bar-content-after': () => h(NavBarTranslations)`)
    layoutSlots.push(`      'nav-screen-content-after': () => h(NavScreenTranslations)`)
  }

  const layoutBlock = needsLayout
    ? `
  Layout() {
    return h(DefaultTheme.Layout, null, {
${layoutSlots.join(',\n')},
    })
  },`
    : ''

  return `${imports.join('\n')}
${needsLayout ? `import { h } from 'vue'` : ''}

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    ${enhanceAppBody}${runtimeBlock}
  },${layoutBlock}
} satisfies Theme
`
}

// ---------------------------------------------------------------------------
// Serialize config to a valid .mts file
// ---------------------------------------------------------------------------

function serializeConfig(config: UserConfig<DefaultTheme.Config>): string {
  // Check if llms markers exist anywhere in the config
  const hasLlms = checkHasLlmsMarker(config)
  const hasLlmsDev = checkHasLlmsDevMarker(config)
  const hasUnocss = checkHasUnocssMarker(config)
  const hasContentInjections = checkHasContentInjectionsMarker(config)
  const hasSourceLinks = checkHasSourceLinksMarker(config)
  const hasLogosHero = checkHasLogosHeroMarker(config)

  // Build imports
  const imports: string[] = []
  if (hasLlms) {
    imports.push(`import llmstxt from '${llmsPluginDir.replace(/'/g, "\\'")}'`)
  }
  if (hasUnocss) {
    imports.push(`import Unocss from '${unocssVitePath.replace(/'/g, "\\'")}'`)
    imports.push(`import { presetUno, presetIcons } from '${unocssMainPath.replace(/'/g, "\\'")}'`)
    imports.push(`import logos from '${iconifyLogosPath.replace(/'/g, "\\'")}' with { type: 'json' }`)
    if (!hasLlmsDev) {
      imports.push(`import { readFileSync, readdirSync } from 'node:fs'`)
      imports.push(`import { join } from 'node:path'`)
    }
  }

  // Serialize the config object recursively
  const configStr = serializeValue(config, 0)

  // Build final file
  const parts: string[] = []

  if (imports.length > 0) {
    parts.push(imports.join('\n'))
    parts.push('')
  }

  // Inline the llms dev plugin helper
  if (hasLlmsDev) {
    parts.push(LLMS_DEV_PLUGIN_CODE)
    parts.push('')
  }

  // Inline the content injections plugin helper
  if (hasContentInjections) {
    parts.push(CONTENT_INJECTIONS_PLUGIN_CODE)
    parts.push('')
  }

  // Inline the source links plugin helper
  if (hasSourceLinks) {
    parts.push(SOURCE_LINKS_PLUGIN_CODE)
    parts.push('')
  }

  // Inline the logos.hero plugin helper
  if (hasLogosHero) {
    parts.push(LOGOS_HERO_PLUGIN_CODE)
    parts.push('')
  }

  // Inline the UnoCSS icon scanner helper
  if (hasUnocss) {
    parts.push(UNOCSS_ICON_SCAN_CODE)
    parts.push('')
  }

  parts.push('export default ' + configStr)
  parts.push('')

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Marker detection
// ---------------------------------------------------------------------------

/** Recursively check if any plugin array contains our llms marker */
function checkHasLlmsMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_llms || checkHasLlmsMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_llms) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasLlmsMarker)
  }
  return false
}

/** Recursively check if any plugin array contains our llms dev marker */
function checkHasLlmsDevMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_llms_dev || checkHasLlmsDevMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_llms_dev) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasLlmsDevMarker)
  }
  return false
}

/** Recursively check if any plugin array contains our UnoCSS marker */
function checkHasUnocssMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_unocss || checkHasUnocssMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_unocss) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasUnocssMarker)
  }
  return false
}

/** Recursively check if any plugin array contains our content injections marker */
function checkHasContentInjectionsMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_content_injections || checkHasContentInjectionsMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_content_injections) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasContentInjectionsMarker)
  }
  return false
}

/** Recursively check if any plugin array contains our source links marker */
function checkHasSourceLinksMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_source_links || checkHasSourceLinksMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_source_links) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasSourceLinksMarker)
  }
  return false
}

/** Recursively check if any plugin array contains our logos.hero marker */
function checkHasLogosHeroMarker(obj: unknown): boolean {
  if (Array.isArray(obj)) {
    return obj.some(item =>
      (item as any)?.__docusite_logos_hero || checkHasLogosHeroMarker(item),
    )
  }
  if (obj && typeof obj === 'object') {
    if ((obj as any).__docusite_logos_hero) return true
    return Object.values(obj as Record<string, unknown>).some(checkHasLogosHeroMarker)
  }
  return false
}

// ---------------------------------------------------------------------------
// Recursive serializer
// ---------------------------------------------------------------------------

const INDENT = '  '

/** Check if a string is a valid JS identifier (safe to use unquoted as object key) */
function isValidIdentifier(key: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
}

/** Serialize any value to a JS literal string */
function serializeValue(value: unknown, indent: number): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return serializeArray(value, indent)
  if (typeof value === 'object') return serializeObject(value as Record<string, unknown>, indent)
  return JSON.stringify(value)
}

function serializeArray(arr: unknown[], indent: number): string {
  if (arr.length === 0) return '[]'

  const items = arr.map(item => {
    // Handle llms plugin marker
    if (item && typeof item === 'object' && (item as any).__docusite_llms) {
      const options = (item as any).__docusite_llms_options as DocusiteLlmsOptions | undefined
      return `${INDENT.repeat(indent + 1)}${options ? `llmstxt(${serializeValue(options, indent + 2)})` : 'llmstxt()'}`
    }
    // Handle custom CSS marker
    if (item && typeof item === 'object' && (item as any).__docusite_custom_css) {
      return null
    }
    // Handle llms dev plugin marker
    if (item && typeof item === 'object' && (item as any).__docusite_llms_dev) {
      const docsDir = (item as any).__docusite_llms_dev_docsDir as string
      const base = (item as any).__docusite_llms_dev_base as string | undefined
      return `${INDENT.repeat(indent + 1)}__docusite_llms_dev_plugin(${JSON.stringify(docsDir)}, ${JSON.stringify(base ?? '/')})`
    }
    // Handle UnoCSS icons plugin marker
    if (item && typeof item === 'object' && (item as any).__docusite_unocss) {
      const docsDir = (item as any).__docusite_unocss_docsDir as string
      return `${INDENT.repeat(indent + 1)}Unocss({ presets: [presetUno(), presetIcons({ scale: 1.2, collections: { logos: async () => logos } })], safelist: __docusite_scan_icon_classes(${JSON.stringify(docsDir)}) })`
    }
    // Handle content injections marker
    if (item && typeof item === 'object' && (item as any).__docusite_content_injections) {
      const data = (item as any).__docusite_content_injections_data as DocusiteContentInjection[]
      return `${INDENT.repeat(indent + 1)}__docusite_content_injections_plugin(${serializeValue(data, indent + 2)})`
    }
    // Handle source links marker
    if (item && typeof item === 'object' && (item as any).__docusite_source_links) {
      const options = (item as any).__docusite_source_links_options as DocusiteSourceLinks
      return `${INDENT.repeat(indent + 1)}__docusite_source_links_plugin(${serializeValue(options, indent + 2)})`
    }
    // Handle logos.hero marker
    if (item && typeof item === 'object' && (item as any).__docusite_logos_hero) {
      const src = (item as any).__docusite_logos_hero_src as string
      return `${INDENT.repeat(indent + 1)}__docusite_logos_hero_plugin(${JSON.stringify(src)})`
    }
    const val = serializeValue(item, indent + 1)
    return `${INDENT.repeat(indent + 1)}${val}`
  }).filter(Boolean)

  if (items.length === 0) return '[]'

  return `[\n${items.join(',\n')}\n${INDENT.repeat(indent)}]`
}

function serializeObject(obj: Record<string, unknown>, indent: number): string {
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'

  const lines: string[] = []

  for (const [key, value] of entries) {
    const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
    const val = serializeValue(value, indent + 1)
    lines.push(`${INDENT.repeat(indent + 1)}${keyStr}: ${val}`)
  }

  return `{\n${lines.join(',\n')}\n${INDENT.repeat(indent)}}`
}

// ---------------------------------------------------------------------------
// .gitignore management
// ---------------------------------------------------------------------------

function ensureGitignore(docsDir: string): void {
  const gitignorePath = resolve(docsDir, '.gitignore')
  const entries = ['.vitepress/', 'changelog.md']

  let content = ''
  if (existsSync(gitignorePath)) {
    content = readFileSync(gitignorePath, 'utf-8')
    const existing = new Set(content.split('\n').map(line => line.trim()))
    const missing = entries.filter(entry => !existing.has(entry))
    if (missing.length === 0) return
    if (!content.endsWith('\n')) content += '\n'
    writeFileSync(gitignorePath, content + missing.join('\n') + '\n', 'utf-8')
    return
  }

  writeFileSync(gitignorePath, entries.join('\n') + '\n', 'utf-8')
}
