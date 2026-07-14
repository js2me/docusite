import { resolve } from 'node:path'
import { loadConfig } from '../config/load.js'
import { resolveConfigTemplates } from '../config/resolve-templates.js'
import { transformConfig } from '../config/transform.js'
import { writeVitePressConfig } from '../vitepress/write-config.js'

export async function build(root?: string) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const resolvedConfig = resolveConfigTemplates(config, cwd)
  const docsDir = resolve(cwd, resolvedConfig.docsDir ?? './docs')

  const { config: vpConfig, versions, versionsLatestLink, changelogSrc, contentInjections, runtimeScriptCode, hasPathKeyedNav } = transformConfig(resolvedConfig, docsDir)
  writeVitePressConfig(docsDir, vpConfig, { versions, versionsLatestLink, changelogSrc, contentInjections, runtimeScriptCode, hasPathKeyedNav })

  const { build } = await import('vitepress')
  await build(docsDir)
}
