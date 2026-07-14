import { cac } from 'cac'
import { dev } from './commands/dev.js'
import { build } from './commands/build.js'
import { preview } from './commands/preview.js'
import { init } from './commands/init.js'

const cli = cac('docusite')

cli
  .command('dev [root]', 'Start dev server')
  .option('--port <port>', 'Dev server port')
  .action(async (root?: string, options?: { port?: number }) => {
    try {
      await dev(root, options?.port)
    } catch (e: any) {
      console.error('Failed to start dev server:', e.message)
      process.exit(1)
    }
  })

cli
  .command('build [root]', 'Build for production')
  .action(async (root?: string) => {
    try {
      await build(root)
    } catch (e: any) {
      console.error('Build failed:', e.message)
      process.exit(1)
    }
  })

cli
  .command('preview [root]', 'Preview production build')
  .option('--port <port>', 'Preview server port')
  .action(async (root?: string, options?: { port?: number }) => {
    try {
      await preview(root, options?.port)
    } catch (e: any) {
      console.error('Preview failed:', e.message)
      process.exit(1)
    }
  })

cli
  .command('init', 'Create a starter docusite.config.ts')
  .action(async () => {
    try {
      await init()
    } catch (e: any) {
      console.error('Init failed:', e.message)
      process.exit(1)
    }
  })

cli.help()
cli.version('0.1.0')
cli.parse()
