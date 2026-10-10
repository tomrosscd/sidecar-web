import { basePath } from './base-path'

interface LinkClick {
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  button: number
  preventDefault: () => void
}

/**
 * Sends a plain left click on an internal link through the Next router, so it does not reload the page.
 * Modified clicks (new tab, new window) and links without an address are left to the browser.
 * The router adds the base path itself, so it is removed from the address first.
 */
export function routeLinkClick(push: (path: string) => void, href: string | undefined, event: LinkClick): void {
  if (!href || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  event.preventDefault()
  push(href.slice(basePath.length) || '/')
}
