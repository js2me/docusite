import { resolve } from 'node:path'
import { loadConfig } from '../config/load.js'
import { transformConfig } from '../config/transform.js'
import { writeVitePressConfig } from '../vitepress/write-config.js'

export async function preview(root?: string, port?: number) {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const docsDir = resolve(cwd, config.docsDir ?? './docs')

  const vpConfig = transformConfig(config, docsDir)
  writeVitePressConfig(docsDir, vpConfig)

  const { serve } = await import('vitepress')
  await serve({ root: docsDir, port })
}
