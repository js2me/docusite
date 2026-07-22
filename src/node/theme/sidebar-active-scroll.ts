/**
 * Keep the active sidebar link visible inside `.VPSidebar`.
 * VitePress marks the current page but does not scroll the sidebar pane to it.
 */
export function setupSidebarActiveScroll(router?: {
  onAfterRouteChanged?: (to: string) => void | Promise<void>
}): void {
  const PADDING = 12

  const getContainer = (): HTMLElement | null => {
    const el = document.querySelector('.VPSidebar')
    return el instanceof HTMLElement ? el : null
  }

  /** Visible top of the sidebar (below the sticky curtain / nav). */
  const getVisibleTop = (container: HTMLElement): number => {
    const nav = document.querySelector('.VPNav')
    const navBottom = nav?.getBoundingClientRect().bottom ?? 0
    return Math.max(navBottom, container.getBoundingClientRect().top) + PADDING
  }

  const syncSidebarScroll = () => {
    const container = getContainer()
    if (!container) return

    const active = container.querySelector<HTMLElement>('.VPSidebarItem.is-active')
    if (!active) return

    const visibleTop = getVisibleTop(container)
    const visibleBottom = container.getBoundingClientRect().bottom - PADDING
    const aRect = active.getBoundingClientRect()

    if (aRect.top < visibleTop) {
      container.scrollTop -= visibleTop - aRect.top
    } else if (aRect.bottom > visibleBottom) {
      container.scrollTop += aRect.bottom - visibleBottom
    }
  }

  const schedule = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(syncSidebarScroll)
    })
  }

  const isActiveSidebarItem = (el: EventTarget | null): el is HTMLElement =>
    el instanceof HTMLElement &&
    el.classList.contains('VPSidebarItem') &&
    el.classList.contains('is-active') &&
    !!el.closest('.VPSidebar')

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && isActiveSidebarItem(m.target)) {
        schedule()
        return
      }
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          if (
            node instanceof HTMLElement &&
            (node.matches?.('.VPSidebarItem.is-active') ||
              node.querySelector?.('.VPSidebarItem.is-active'))
          ) {
            schedule()
            return
          }
        }
      }
    }
  }).observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['class'],
  })

  if (router) {
    const prev = router.onAfterRouteChanged
    router.onAfterRouteChanged = async (to) => {
      await prev?.(to)
      schedule()
      // Active class may land a tick after the route settles.
      setTimeout(syncSidebarScroll, 50)
    }
  }

  schedule()
  setTimeout(syncSidebarScroll, 0)
  setTimeout(syncSidebarScroll, 100)
}
