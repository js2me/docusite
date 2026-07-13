import { resolve } from 'node:path'
import { loadConfig } from '../config/load.js'
import { transformConfig } from '../config/transform.js'
import { writeVitePressConfig } from '../vitepress/write-config.js'

export async function build(root?: string) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const docsDir = resolve(cwd, config.docsDir ?? './docs')

  const { config: vpConfig, versions, changelogSrc, contentInjections, runtimeScriptCode } = transformConfig(config, docsDir)
  writeVitePressConfig(docsDir, vpConfig, { versions, changelogSrc, contentInjections, runtimeScriptCode })

  const { build } = await import('vitepress')
  await build(docsDir)
}
