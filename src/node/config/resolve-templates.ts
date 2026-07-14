import type { DocusiteConfig, DocusiteContentInjection } from '../../shared/types.js'
import { readPackageJson, prepareContentInjections } from './content-injections.js'

// ---------------------------------------------------------------------------
// Template resolution for config values
// ---------------------------------------------------------------------------

/**
 * Regex matching `@{key.path}` template placeholders.
 * Same pattern used by the content-injections Vite plugin for .md files.
 */
const TEMPLATE_RE = /@\{([a-zA-Z_$][a-zA-Z0-9_$.]*)\}/g

/**
 * Resolve a `@{key.path}` placeholder against a map of injection values.
 * Walks the dot-separated path into the object tree.
 * Returns `undefined` when the path cannot be resolved.
 */
function resolvePlaceholder(path: string, injectionsMap: Record<string, unknown>): string | undefined {
  const parts = path.split('.')
  let val = injectionsMap[parts[0]]
  for (let i = 1; i < parts.length && val != null; i++) {
    val = (val as Record<string, unknown>)[parts[i]]
  }
  if (val == null) return undefined
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

/**
 * Recursively walk a value and replace `@{key.path}` placeholders in strings.
 * Preserves object/array structure; only string leaves are interpolated.
 */
function resolveValue(value: unknown, injectionsMap: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    if (!TEMPLATE_RE.test(value)) return value
    // Reset lastIndex after the test above
    TEMPLATE_RE.lastIndex = 0
    return value.replace(TEMPLATE_RE, (_, path: string) => {
      const resolved = resolvePlaceholder(path, injectionsMap)
      if (resolved === undefined) {
        console.warn(`[docusite] Config template @{${path}} could not be resolved — leaving as-is`)
        return `@{${path}}`
      }
      return resolved
    })
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, injectionsMap))
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = resolveValue(val, injectionsMap)
    }
    return result
  }

  return value
}

/**
 * Resolve `@{key.path}` template placeholders in a `DocusiteConfig`.
 *
 * Uses the same injection data (built-in `packageJson` + user-defined
 * `contentInjections`) that powers the `@{…}` syntax in `.md` files,
 * but applies resolution at config-load time so fields like `title`,
 * `description`, and `base` can reference package.json values.
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   base: `/@{packageJson.description}/`,
 *   title: '@{packageJson.name}',
 *   description: '@{packageJson.description}',
 * })
 * ```
 */
export function resolveConfigTemplates(config: DocusiteConfig, cwd: string): DocusiteConfig {
  const injections = prepareContentInjections(config.contentInjections, cwd, config.packageJsonPath)
  if (!injections?.length) return config

  const injectionsMap: Record<string, unknown> = {}
  for (const inj of injections) {
    injectionsMap[inj.key] = inj.value
  }

  const resolved = resolveValue(config, injectionsMap) as DocusiteConfig

  // Preserve the original contentInjections array — it is still needed
  // by the Vite plugin for .md file interpolation at build/dev time.
  resolved.contentInjections = config.contentInjections

  return resolved
}
