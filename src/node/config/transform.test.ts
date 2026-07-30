import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, it, expect } from 'vitest'
import { transformConfig } from './transform.js'
import type { DocusiteConfig } from '../../shared/types.js'

/**
 * Helpers to extract plugin markers from the transformed VitePress config.
 * The transform produces marker objects like `{ __docusite_llms: true }`
 * which are later replaced by real plugin code in write-config.ts.
 */
function getPlugins(result: ReturnType<typeof transformConfig>) {
  return (result.config.vite?.plugins ?? []) as any[]
}

function findPluginMarker(plugins: any[], key: string): any {
  return plugins.find((p: any) => p[key] === true)
}

function pluginIndex(plugins: any[], key: string): number {
  return plugins.findIndex((p: any) => p[key] === true)
}

// ---------------------------------------------------------------------------
// Plugin order
// ---------------------------------------------------------------------------

describe('transformConfig: plugin order', () => {
  it('content-injections plugin comes before llms plugin', () => {
    const config: DocusiteConfig = {
      title: 'Test',
      contentInjections: [{ key: 'testVar', value: 'hello' }],
      llms: true,
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)

    const ciIdx = pluginIndex(plugins, '__docusite_content_injections')
    const llmsIdx = pluginIndex(plugins, '__docusite_llms')

    expect(ciIdx).toBeGreaterThanOrEqual(0)
    expect(llmsIdx).toBeGreaterThanOrEqual(0)
    expect(ciIdx).toBeLessThan(llmsIdx)
  })

  it('content-injections plugin is present even without llms', () => {
    const config: DocusiteConfig = {
      title: 'Test',
      contentInjections: [{ key: 'testVar', value: 'hello' }],
      llms: false,
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)

    expect(pluginIndex(plugins, '__docusite_content_injections')).toBeGreaterThanOrEqual(0)
    expect(pluginIndex(plugins, '__docusite_llms')).toBe(-1)
  })

  it('llms plugin is present without explicit contentInjections', () => {
    const config: DocusiteConfig = {
      title: 'Test',
      llms: true,
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)

    // packageJson is auto-injected as a content injection, so content-injections
    // plugin is always present when packageJsonPath resolves
    expect(pluginIndex(plugins, '__docusite_llms')).toBeGreaterThanOrEqual(0)
  })
})

// ---------------------------------------------------------------------------
// Title passed to llms options
// ---------------------------------------------------------------------------

describe('transformConfig: llms title option', () => {
  it('passes resolved config.title to llms options', () => {
    const config: DocusiteConfig = {
      title: 'mobx-location-history',
      llms: true,
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)
    const llms = findPluginMarker(plugins, '__docusite_llms')

    expect(llms).toBeDefined()
    expect(llms.__docusite_llms_options).toBeDefined()
    expect(llms.__docusite_llms_options.title).toBe('mobx-location-history')
  })

  it('does not override user-provided llms title', () => {
    const config: DocusiteConfig = {
      title: 'site-title',
      llms: { title: 'custom-llms-title' },
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)
    const llms = findPluginMarker(plugins, '__docusite_llms')

    expect(llms.__docusite_llms_options.title).toBe('custom-llms-title')
  })

  it('does not set title when config.title is undefined', () => {
    const config: DocusiteConfig = {
      llms: true,
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)
    const llms = findPluginMarker(plugins, '__docusite_llms')

    // No title in options, no title in config
    expect(llms.__docusite_llms_options?.title).toBeUndefined()
  })

  it('preserves other llms options alongside title', () => {
    const config: DocusiteConfig = {
      title: 'my-project',
      llms: { description: 'Custom description', ignoreFiles: ['blog/*'] },
    }
    const result = transformConfig(config, '/docs')
    const plugins = getPlugins(result)
    const llms = findPluginMarker(plugins, '__docusite_llms')

    expect(llms.__docusite_llms_options.title).toBe('my-project')
    expect(llms.__docusite_llms_options.description).toBe('Custom description')
    expect(llms.__docusite_llms_options.ignoreFiles).toEqual(['blog/*'])
  })
})

// ---------------------------------------------------------------------------
// llms-full.txt dev middleware bug
// ---------------------------------------------------------------------------

describe('write-config: llms dev plugin', () => {
  it('isLlmsFull checks llms-full.txt not llms.txt', () => {
    // Read the source to verify the fix — the LLMS_DEV_PLUGIN_CODE string
    // should contain 'llms-full.txt' for isLlmsFull
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(
      resolve(__dirname, '../vitepress/write-config.ts'),
      'utf-8',
    )

    // Extract the LLMS_DEV_PLUGIN_CODE block
    const match = source.match(/const LLMS_DEV_PLUGIN_CODE\s*=\s*`([\s\S]*?)`/)
    expect(match).not.toBeNull()

    const pluginCode = match![1]

    // isLlmsFull should check 'llms-full.txt'
    expect(pluginCode).toContain("matchLlmsPath(pathname, 'llms-full.txt')")
    // isLlms should still check 'llms.txt'
    expect(pluginCode).toContain("matchLlmsPath(pathname, 'llms.txt')")

    // Ensure there's no double 'llms.txt' for isLlmsFull
    const isLlmsFullLine = pluginCode.split('\n').find(l => l.includes('isLlmsFull'))
    expect(isLlmsFullLine).not.toContain("'llms.txt')")
  })
})
