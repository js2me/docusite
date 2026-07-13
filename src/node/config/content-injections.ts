import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocusiteContentInjection } from '../../shared/types.js'

function readPackageJson(cwd: string): Record<string, unknown> | undefined {
  const path = resolve(cwd, 'package.json')
  if (!existsSync(path)) return undefined

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>
  } catch {
    console.warn(`[docusite] Failed to parse package.json at ${path}`)
    return undefined
  }
}

/**
 * Merge built-in content injections with user-defined ones.
 * Built-in: `packageJson` from the project's package.json.
 * User keys override built-ins with the same name.
 */
export function prepareContentInjections(
  userInjections: DocusiteContentInjection[] | undefined,
  cwd: string,
): DocusiteContentInjection[] | undefined {
  const builtIn: DocusiteContentInjection[] = []

  const packageJson = readPackageJson(cwd)
  if (packageJson) {
    builtIn.push({ key: 'packageJson', value: packageJson })
  }

  if (builtIn.length === 0) {
    return userInjections
  }

  const userKeys = new Set((userInjections ?? []).map((inj) => inj.key))
  const merged = [
    ...builtIn.filter((inj) => !userKeys.has(inj.key)),
    ...(userInjections ?? []),
  ]

  return merged.length > 0 ? merged : undefined
}
