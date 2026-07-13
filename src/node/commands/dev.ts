import { resolve } from 'node:path'
import { loadConfig } from '../config/load.js'
import { transformConfig } from '../config/transform.js'
import { writeVitePressConfig } from '../vitepress/write-config.js'

export async function dev(root?: string, port?: number) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const docsDir = resolve(cwd, config.docsDir ?? './docs')

  const { config: vpConfig, versions, changelogSrc, contentInjections, runtimeScriptCode } = transformConfig(config, docsDir)
  writeVitePressConfig(docsDir, vpConfig, { versions, changelogSrc, contentInjections, runtimeScriptCode })

  const { createServer } = await import('vitepress')
  const server = await createServer(docsDir, {
    port,
  })

  await server.listen()
  server.printUrls()
}
