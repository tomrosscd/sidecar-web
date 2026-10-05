export const SAVED_KEY = 'sidecarWebSaved'

type Store = Pick<Storage, 'getItem' | 'setItem'>

/** The browser's localStorage, or undefined when access throws (private windows, blocked site data). */
export function browserStore(): Store | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

/** Saved prompt slugs. Anything unreadable or malformed reads as an empty list. */
export function readSaved(store: Store | undefined): string[] {
  try {
    const raw = store?.getItem(SAVED_KEY)
    if (!raw) return []
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) ? [...new Set(data.filter((s): s is string => typeof s === 'string'))] : []
  } catch {
    return []
  }
}

/** Returns false when the write failed. */
export function writeSaved(store: Store | undefined, slugs: readonly string[]): boolean {
  try {
    if (!store) return false
    store.setItem(SAVED_KEY, JSON.stringify(slugs))
    return true
  } catch {
    return false
  }
}

export function toggleSlug(slugs: readonly string[], slug: string): string[] {
  return slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]
}
