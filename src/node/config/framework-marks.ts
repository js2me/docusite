import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const FRAMEWORK_MARKS = ['ReactMark', 'SolidMark', 'VueMark'] as const

export type FrameworkMarkName = (typeof FRAMEWORK_MARKS)[number]

const MARK_RE = /<(ReactMark|SolidMark|VueMark)\b/g

/** Strip fenced/inline code so example snippets don't force-register unused marks. */
function stripCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
}

function walkMarkdownFiles(dir: string, onFile: (text: string) => void): void {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, onFile)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        onFile(readFileSync(fullPath, 'utf-8'))
      } catch {
        /* skip unreadable files */
      }
    }
  }
}

/**
 * Detect which framework mark Vue components are used live in markdown.
 * Nav/sidebar placeholders are transformed to inline SVG and do not need
 * these components in the client theme bundle.
 */
export function detectFrameworkMarksInMarkdown(docsDir: string): FrameworkMarkName[] {
  const found = new Set<FrameworkMarkName>()

  walkMarkdownFiles(docsDir, (text) => {
    const scanText = stripCode(text)
    MARK_RE.lastIndex = 0
    let match
    while ((match = MARK_RE.exec(scanText))) {
      found.add(match[1] as FrameworkMarkName)
    }
  })

  return FRAMEWORK_MARKS.filter((name) => found.has(name))
}
