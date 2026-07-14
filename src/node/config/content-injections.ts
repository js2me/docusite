import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocusiteContentInjection } from '../../shared/types.js'

export function readPackageJson(cwd: string, packageJsonPath?: string): Record<string, unknown> | undefined {
  const resolvedPath = packageJsonPath
    ? resolve(cwd, packageJsonPath.endsWith('package.json') ? packageJsonPath : `${packageJsonPath}/package.json`)
    : resolve(cwd, 'package.json')
  if (!existsSync(resolvedPath)) return undefined

  try {
    return JSON.parse(readFileSync(resolvedPath, 'utf-8')) as Record<string, unknown>
  } catch {
    console.warn(`[docusite] Failed to parse package.json at ${resolvedPath}`)
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
  packageJsonPath?: string,
): DocusiteContentInjection[] | undefined {
  const builtIn: DocusiteContentInjection[] = []

  const packageJson = readPackageJson(cwd, packageJsonPath)
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
