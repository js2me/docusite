/**
 * Keep the active "On this page" outline link visible inside `.aside-container`.
 * VitePress owns which link is `.active`; we only scroll the TOC pane.
 *
 * Also replaces the CSS `padding-bottom: 70vh` fallback with the minimum pad
 * so earlier headings can reach the scroll-spy line (VitePress `isBottom`
 * otherwise steals focus). Cap stays 70vh; many pages need far less.
 */
export function setupOutlineActiveScroll(router?: {
  onAfterRouteChanged?: (to: string) => void | Promise<void>
}): void {
  const PADDING = 12
  const MAX_PAD_VH = 0.7

  const getContainer = (): HTMLElement | null => {
    const el = document.querySelector('.aside-container')
    return el instanceof HTMLElement ? el : null
  }

  const getContentContainer = (): HTMLElement | null => {
    const el = document.querySelector('.VPDoc .content-container')
    return el instanceof HTMLElement ? el : null
  }

  const getSpyLine = (): number => {
    const nav = document.querySelector('.VPNav')
    return nav?.getBoundingClientRect().bottom ?? 64
  }

  /** Visible top of the TOC (below the fixed nav). */
  const getVisibleTop = (container: HTMLElement): number => {
    const nav = document.querySelector('.VPNav')
    const navBottom = nav?.getBoundingClientRect().bottom ?? 0
    return Math.max(navBottom, container.getBoundingClientRect().top) + PADDING
  }

  /**
   * Minimum bottom padding so every outline heading except the last can sit on
   * the spy line. The last heading is covered by VitePress `isBottom`.
   */
  const syncDocBottomPadding = () => {
    const content = getContentContainer()
    if (!content) return

    const headers = [
      ...content.querySelectorAll<HTMLElement>('.vp-doc :where(h1,h2,h3,h4,h5,h6)'),
    ].filter((el) => el.id)

    // Clear CSS fallback / previous inline pad before measuring.
    content.style.paddingBottom = '0px'

    if (headers.length < 2) return

    const spy = getSpyLine()
    const maxPad = window.innerHeight * MAX_PAD_VH
    const contentBottom =
      content.getBoundingClientRect().bottom + window.scrollY

    let needed = 0
    // Skip the last heading — isBottom already activates it at the page end.
    for (const h of headers.slice(0, -1)) {
      const top = h.getBoundingClientRect().top + window.scrollY
      const after = contentBottom - top
      needed = Math.max(needed, window.innerHeight - spy - after)
    }

    const pad = Math.min(maxPad, Math.max(0, Math.ceil(needed)))
    // Always set inline so the 70vh CSS fallback does not linger.
    content.style.paddingBottom = `${pad}px`
  }

  const syncOutlineScroll = () => {
    const container = getContainer()
    if (!container) return

    const active = container.querySelector<HTMLElement>('.outline-link.active')
    if (!active) {
      container.scrollTop = 0
      return
    }

    const visibleTop = getVisibleTop(container)
    const visibleBottom = container.getBoundingClientRect().bottom - PADDING
    const aRect = active.getBoundingClientRect()

    if (aRect.top < visibleTop) {
      container.scrollTop -= visibleTop - aRect.top
    } else if (aRect.bottom > visibleBottom) {
      container.scrollTop += aRect.bottom - visibleBottom
    }
  }

  let scrollScheduled = false
  const scheduleScroll = () => {
    if (scrollScheduled) return
    scrollScheduled = true
    requestAnimationFrame(() => {
      scrollScheduled = false
      syncOutlineScroll()
    })
  }

  let padScheduled = false
  const schedulePad = () => {
    if (padScheduled) return
    padScheduled = true
    requestAnimationFrame(() => {
      padScheduled = false
      syncDocBottomPadding()
      syncOutlineScroll()
    })
  }

  const isOutlineLink = (el: EventTarget | null): el is HTMLElement =>
    el instanceof HTMLElement &&
    el.classList.contains('outline-link') &&
    !!el.closest('.aside-container')

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && isOutlineLink(m.target)) {
        scheduleScroll()
        return
      }
    }
  }).observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  })

  window.addEventListener('resize', schedulePad, { passive: true })

  if (router) {
    const prev = router.onAfterRouteChanged
    router.onAfterRouteChanged = async (to) => {
      await prev?.(to)
      schedulePad()
      setTimeout(schedulePad, 50)
    }
  }

  schedulePad()
  // Content/headers may land after first paint (VitePress onContentUpdated).
  setTimeout(schedulePad, 0)
  setTimeout(schedulePad, 100)
}
