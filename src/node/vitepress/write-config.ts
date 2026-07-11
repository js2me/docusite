import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserConfig, DefaultTheme } from 'vitepress'
import type { DocusiteLlmsOptions } from '../../shared/types.js'

// Resolve the real path to vitepress-plugin-llms from within docusite's installation
// This ensures it works even when pnpm doesn't hoist the package to the user's node_modules
const llmsPluginDir = dirname(
  fileURLToPath(import.meta.resolve('vitepress-plugin-llms')),
)

// ---------------------------------------------------------------------------
// Write .vitepress/config.mts
// ---------------------------------------------------------------------------

/**
 * Write the transformed VitePress config to disk as a valid `.vitepress/config.mts`.
 * Also ensures `.vitepress/` is in the docs directory's `.gitignore`.
 */
export function writeVitePressConfig(
  docsDir: string,
  config: UserConfig<DefaultTheme.Config>,
): void {
  const vpxDir = resolve(docsDir, '.vitepress')
  mkdirSync(vpxDir, { recursive: true })

  const configPath = resolve(vpxDir, 'config.mts')
  const content = serializeConfig(config)

  writeFileSync(configPath, content, 'utf-8')

  // Ensure .vitepress/ is gitignored
  ensureGitignore(docsDir)
}

// ---------------------------------------------------------------------------
// Serialize config to a valid .mts file
// ---------------------------------------------------------------------------

function serializeConfig(config: UserConfig<DefaultTheme.Config>): string {
  // Check if llms marker exists anywhere in the config
  const hasLlms = checkHasLlmsMarker(config)

  // Build imports
  const imports: string[] = []
  if (hasLlms) {
    // Use the resolved absolute path so pnpm strict mode can find it
    imports.push(`import llmstxt from '${llmsPluginDir.replace(/'/g, "\\'")}'`)
  }

  // Serialize the config object recursively
  const configStr = serializeValue(config, 0)

  // Build final file
  const parts: string[] = []

  if (imports.length > 0) {
    parts.push(imports.join('\n'))
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
      // Skip — custom CSS files are not Vite plugins, handled elsewhere
      return null
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
  const entry = '.vitepress/'

  let content = ''
  if (existsSync(gitignorePath)) {
    content = readFileSync(gitignorePath, 'utf-8')
    if (content.split('\n').some(line => line.trim() === entry)) {
      return // already present
    }
    // Ensure trailing newline
    if (!content.endsWith('\n')) content += '\n'
  }

  writeFileSync(gitignorePath, content + entry + '\n', 'utf-8')
}
