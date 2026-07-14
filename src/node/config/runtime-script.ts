import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { resolveConfigFile } from './load.js'

/**
 * Resolve client `runtimeScript` source for the generated VitePress theme.
 *
 * Must NOT use `Function#toString()` after jiti evaluation: jiti rewrites
 * dynamic `import()` to `jitiImport()`, which then breaks in the browser.
 */
export function resolveRuntimeScriptCode(
  runtimeScript: (() => void) | undefined,
  cwd: string,
  docsDir: string,
): string | undefined {
  if (!runtimeScript) return undefined

  const configPath = resolveConfigFile(cwd)
  if (configPath) {
    const extracted = extractRuntimeScriptFromSource(readFileSync(configPath, 'utf-8'))
    if (extracted) {
      const themeDir = resolve(docsDir, '.vitepress/theme')
      return rewriteRelativeImports(extracted, dirname(configPath), themeDir)
    }
  }

  return sanitizeJitiArtifacts(runtimeScript.toString())
}

/**
 * Extract the original `runtimeScript: () => …` arrow function from config source.
 */
export function extractRuntimeScriptFromSource(source: string): string | undefined {
  const keyMatch = source.match(/\bruntimeScript\s*:/)
  if (!keyMatch || keyMatch.index === undefined) return undefined

  let i = keyMatch.index + keyMatch[0].length
  while (i < source.length && /\s/.test(source[i]!)) i++

  // Only arrow functions are supported: () => { … } / () => expr
  if (source[i] !== '(') return undefined

  const start = i
  const paramsEnd = skipBalanced(source, i, '(', ')')
  if (paramsEnd < 0) return undefined
  i = paramsEnd + 1

  while (i < source.length && /\s/.test(source[i]!)) i++
  if (source.slice(i, i + 2) !== '=>') return undefined
  i += 2
  while (i < source.length && /\s/.test(source[i]!)) i++

  if (source[i] === '{') {
    const bodyEnd = skipBalanced(source, i, '{', '}')
    if (bodyEnd < 0) return undefined
    return source.slice(start, bodyEnd + 1)
  }

  // Expression body — stop at top-level comma or parent object close
  const exprStart = i
  let depth = 0
  let inString: '"' | "'" | '`' | null = null
  let escaped = false

  for (; i < source.length; i++) {
    const c = source[i]!

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (c === '\\') {
        escaped = true
        continue
      }
      if (c === inString) inString = null
      continue
    }

    if (c === '"' || c === "'" || c === '`') {
      inString = c
      continue
    }

    if (c === '(' || c === '{' || c === '[') {
      depth++
      continue
    }
    if (c === ')' || c === '}' || c === ']') {
      if (depth === 0) return source.slice(start, i).trimEnd()
      depth--
      continue
    }
    if (c === ',' && depth === 0) {
      return source.slice(start, i).trimEnd()
    }
  }

  return source.slice(start, exprStart).length > 0
    ? source.slice(start).trimEnd()
    : undefined
}

/**
 * Relative imports in `runtimeScript` are authored relative to the config file.
 * Rewrite them so they resolve from `docs/.vitepress/theme/`.
 */
export function rewriteRelativeImports(
  code: string,
  configDir: string,
  themeDir: string,
): string {
  return code.replace(
    /\bimport\s*\(\s*(['"])(\.[^'"]+)\1\s*\)/g,
    (_match, quote: string, spec: string) => {
      const absolute = resolve(configDir, spec)
      let rel = relative(themeDir, absolute).replace(/\\/g, '/')
      if (!rel.startsWith('.')) rel = `./${rel}`
      return `import(${quote}${rel}${quote})`
    },
  )
}

/** Best-effort undo of jiti transform artifacts in Function#toString() output. */
export function sanitizeJitiArtifacts(code: string): string {
  return code
    .replace(
      /Promise\.resolve\(\)\.then\(\(\)\s*=>\s*jitiImport\(([^)]+)\)\.then\(\((\w+)\)\s*=>\s*_interopRequireWildcard\(\2\)\)\)/g,
      'import($1)',
    )
    .replace(/\bjitiImport\b/g, 'import')
    .replace(/\b_interopRequireWildcard\((\w+)\)/g, '$1')
    .replace(/\b_interopRequireDefault\((\w+)\)/g, '$1')
}

function skipBalanced(
  source: string,
  start: number,
  open: string,
  close: string,
): number {
  if (source[start] !== open) return -1

  let depth = 0
  let inString: '"' | "'" | '`' | null = null
  let escaped = false

  for (let i = start; i < source.length; i++) {
    const c = source[i]!

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (c === '\\') {
        escaped = true
        continue
      }
      if (c === inString) inString = null
      continue
    }

    if (c === '"' || c === "'" || c === '`') {
      inString = c
      continue
    }

    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return i
    }
  }

  return -1
}
