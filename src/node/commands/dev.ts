import { resolve } from 'node:path'
import { watch, existsSync } from 'node:fs'
import { loadConfig } from '../config/load.js'
import { resolveConfigTemplates } from '../config/resolve-templates.js'
import { transformConfig } from '../config/transform.js'
import { writeVitePressConfig } from '../vitepress/write-config.js'

const CONFIG_FILES = [
  'docusite.config.ts',
  'docusite.config.mts',
  'docusite.config.js',
  'docusite.config.mjs',
]

function findConfigFile(cwd: string): string | undefined {
  for (const file of CONFIG_FILES) {
    const fullPath = resolve(cwd, file)
    if (existsSync(fullPath)) return fullPath
  }
  return undefined
}

export async function dev(root?: string, port?: number) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const resolvedConfig = resolveConfigTemplates(config, cwd)
  const docsDir = resolve(cwd, resolvedConfig.docsDir ?? './docs')

  // Generate initial VitePress config
  const result = transformConfig(resolvedConfig, docsDir)
  writeVitePressConfig(docsDir, result.config, {
    versions: result.versions,
    versionsLatestLink: result.versionsLatestLink,
    changelogSrc: result.changelogSrc,
    contentInjections: result.contentInjections,
    runtimeScriptCode: result.runtimeScriptCode,
    hasPathKeyedNav: result.hasPathKeyedNav,
    hasI18n: result.hasI18n,
    frameworkMarks: result.frameworkMarks,
  })

  // Start VitePress dev server
  const { createServer } = await import('vitepress')
  const server = await createServer(docsDir, { port })
  await server.listen()
  server.printUrls()

  // Watch docusite.config.ts for changes → regenerate .vitepress/config.mts
  // VitePress auto-detects changes to config.mts and hot-reloads
  const configFile = findConfigFile(cwd)
  if (configFile) {
    let debounceTimer: ReturnType<typeof setTimeout> | undefined

    watch(configFile, () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        try {
          const newConfig = await loadConfig(cwd)
          const newResolvedConfig = resolveConfigTemplates(newConfig, cwd)
          const newDocsDir = resolve(cwd, newResolvedConfig.docsDir ?? './docs')
          const newResult = transformConfig(newResolvedConfig, newDocsDir)
          writeVitePressConfig(newDocsDir, newResult.config, {
            versions: newResult.versions,
            versionsLatestLink: newResult.versionsLatestLink,
            changelogSrc: newResult.changelogSrc,
            contentInjections: newResult.contentInjections,
            runtimeScriptCode: newResult.runtimeScriptCode,
            hasI18n: newResult.hasI18n,
            frameworkMarks: newResult.frameworkMarks,
          })
        } catch (e: any) {
          console.error(`[docusite] Config reload failed: ${e.message}`)
        }
      }, 300)
    })
  }
}
