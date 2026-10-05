import { useCallback, useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

/**
 * The current query string (with the leading "?"), and a setter that rewrites it in place without
 * navigating. A static export has no query at build time, so the server snapshot is empty and the
 * real value appears after hydration.
 */
export function useQueryString(): [string, (next: string) => void] {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )
  const set = useCallback((next: string) => {
    if (next === window.location.search) return
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${next}${window.location.hash}`)
    listeners.forEach((l) => l())
  }, [])
  return [search, set]
}
