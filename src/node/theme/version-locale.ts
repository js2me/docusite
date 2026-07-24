/**
 * Helpers for combining i18n locales with version path prefixes (`/ru/v1/...`).
 * Copied into docs/.vitepress/theme/ at generate time.
 */

const VERSION_SEGMENT_RE = /^v\d+$/

/** Locale key that includes a version segment (`v1`, `ru/v1`). */
export function isVersionLocaleKey(key: string): boolean {
  if (key === 'root') return false
  return key.split('/').some((segment) => VERSION_SEGMENT_RE.test(segment))
}

/** Extract `vN` from an older-version link or relative path. */
export function extractVersionSegment(path: string): string | undefined {
  const normalized = path.replace(/\\/g, '/')
  const match = normalized.match(/(?:^|\/)(v\d+)(?:\/|$)/)
  return match?.[1]
}

export interface ParsedDocPath {
  /** Locale prefix without slashes, or '' for root */
  localePrefix: string
  /** Version segment like `v1`, or undefined for latest */
  version?: string
  /** Remaining path, e.g. `introduction/getting-started.md` */
  rest: string
}

/**
 * Split a VitePress `relativePath` into locale / version / rest.
 * Locale prefixes are primary i18n keys (no version segments).
 */
export function parseDocPath(
  relativePath: string,
  localeKeys: string[] = [],
): ParsedDocPath {
  const rel = relativePath.replace(/\\/g, '/').replace(/^\//, '')
  const primaryPrefixes = localeKeys
    .filter((key) => key !== 'root' && !isVersionLocaleKey(key))
    .map((key) => key.replace(/^\/|\/$/g, ''))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  let localePrefix = ''
  let rest = rel
  for (const prefix of primaryPrefixes) {
    if (rel === prefix || rel.startsWith(`${prefix}/`)) {
      localePrefix = prefix
      rest = rel === prefix ? '' : rel.slice(prefix.length + 1)
      break
    }
  }

  // Heuristic: first segment is a locale if it is not a version and there is more path
  if (!localePrefix && !primaryPrefixes.length) {
    const first = rest.split('/')[0] ?? ''
    if (first && !VERSION_SEGMENT_RE.test(first) && rest.includes('/')) {
      // Only treat as locale when a later version segment exists (ru/v1/...)
      // or when caller passed locale keys. Without keys, detect version-only paths.
      const maybeVersion = extractVersionSegment(rest)
      if (maybeVersion && rest.startsWith(`${first}/${maybeVersion}`)) {
        localePrefix = first
        rest = rest.slice(first.length + 1)
      }
    }
  }

  const version = extractVersionSegment(rest)
  if (version) {
    if (rest === version) {
      rest = ''
    } else if (rest.startsWith(`${version}/`)) {
      rest = rest.slice(version.length + 1)
    } else {
      // version appears later — strip first occurrence as prefix only when at start
      const idx = rest.indexOf(`${version}/`)
      if (idx === 0) rest = rest.slice(version.length + 1)
    }
  }

  return { localePrefix, version, rest }
}

/** Prefix a root-locale link with the current locale (`/v1/x` → `/ru/v1/x`). */
export function withLocalePrefix(link: string, localePrefix: string): string {
  if (!localePrefix) return link
  if (!link.startsWith('/')) return link
  if (link === '/') return `/${localePrefix}/`
  if (link.startsWith(`/${localePrefix}/`) || link === `/${localePrefix}`) return link
  return `/${localePrefix}${link}`
}

/** Whether `relativePath` belongs to one of the configured older versions. */
export function isOldVersionPath(
  relativePath: string,
  olderVersions?: Array<{ link: string }>,
): boolean {
  const currentVersion = extractVersionSegment(relativePath)
  if (!currentVersion) return false
  for (const v of olderVersions ?? []) {
    const version = extractVersionSegment(v.link)
    if (version && version === currentVersion) return true
  }
  return false
}

/** Label for the version flyout button on the current page. */
export function currentVersionLabel(
  relativePath: string,
  latestLabel: string,
  olderVersions?: Array<{ label: string; link: string }>,
): string {
  const currentVersion = extractVersionSegment(relativePath)
  if (!currentVersion) return latestLabel
  for (const v of olderVersions ?? []) {
    const version = extractVersionSegment(v.link)
    if (version && version === currentVersion) return v.label
  }
  return latestLabel
}

/**
 * Build a same-page link in another primary locale, preserving version.
 * `rest` should still include the `.md` extension from relativePath.
 */
export function buildLocaleLink(
  relativePath: string,
  targetLocaleKey: string,
  localeKeys: string[],
  cleanUrls: boolean,
): string {
  const { version, rest } = parseDocPath(relativePath, localeKeys)
  const parts: string[] = []
  if (targetLocaleKey !== 'root') {
    parts.push(targetLocaleKey.replace(/^\/|\/$/g, ''))
  }
  if (version) parts.push(version)

  let pathRest = rest
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, cleanUrls ? '' : '.html')
  pathRest = pathRest.replace(/\/$/, '')

  if (pathRest) parts.push(pathRest)

  return parts.length ? `/${parts.join('/')}` : '/'
}
