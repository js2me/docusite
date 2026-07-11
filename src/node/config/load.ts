import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocusiteConfig } from '../../shared/types.js'

// ---------------------------------------------------------------------------
// Config file search
// ---------------------------------------------------------------------------

const CONFIG_FILES = [
  'docusite.config.ts',
  'docusite.config.mts',
  'docusite.config.js',
  'docusite.config.mjs',
] as const

/**
 * Resolve the path to the user's docusite config file.
 * Returns `undefined` if no config file is found.
 */
export function resolveConfigFile(cwd: string): string | undefined {
  for (const file of CONFIG_FILES) {
    const fullPath = resolve(cwd, file)
    if (existsSync(fullPath)) return fullPath
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Config loading
// ---------------------------------------------------------------------------

/**
 * Load and evaluate the user's docusite.config.ts using jiti.
 * Falls back to an empty config when no config file is found.
 */
export async function loadConfig(cwd: string): Promise<DocusiteConfig> {
  const configPath = resolveConfigFile(cwd)

  if (!configPath) {
    return {}
  }

  const { createJiti } = await import('jiti')
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    esmResolve: true,
  })

  const raw = await jiti.import(configPath) as DocusiteConfig | { default: DocusiteConfig }

  // Handle both `export default {}` and `export {}`
  if (raw && typeof raw === 'object' && 'default' in raw) {
    return (raw as { default: DocusiteConfig }).default
  }

  return raw ?? {}
}
