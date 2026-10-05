import { useCallback, useSyncExternalStore } from 'react'
import { SAVED_KEY, browserStore, readSaved, toggleSlug, writeSaved } from './saved'

const EMPTY: string[] = []

type ListStore = {
  subscribe: (l: () => void) => () => void
  getSnapshot: () => string[]
  toggle: (slug: string) => void
  isAvailable: () => boolean
}

/**
 * A list of strings kept in localStorage under one key. Reads and writes never throw; when storage is
 * blocked the list lives in memory for the visit, and `isAvailable` reports false.
 */
function createListStore(key: string): ListStore {
  let memory: string[] = []
  let works = true
  let snapshot: string[] | undefined
  const listeners = new Set<() => void>()
  const load = () => {
    const stored = readSaved(browserStore(), key)
    return stored.length > 0 || works ? stored : memory
  }
  return {
    subscribe(listener) {
      listeners.add(listener)
      const onStorage = (e: StorageEvent) => {
        if (e.key !== null && e.key !== key) return
        snapshot = undefined
        listener()
      }
      window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', onStorage)
      }
    },
    getSnapshot: () => (snapshot ??= load()),
    toggle(slug) {
      const next = toggleSlug((snapshot ??= load()), slug)
      works = writeSaved(browserStore(), next, key)
      memory = next
      snapshot = next
      listeners.forEach((l) => l())
    },
    isAvailable: () => works,
  }
}

const stores = new Map<string, ListStore>()
const storeFor = (key: string) => {
  let s = stores.get(key)
  if (!s) stores.set(key, (s = createListStore(key)))
  return s
}

function useStoredList(key: string) {
  const store = storeFor(key)
  const list = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY)
  const toggle = useCallback((slug: string) => store.toggle(slug), [store])
  const available = typeof window === 'undefined' ? true : store.isAvailable()
  return { list, toggle, available }
}

/** Saved prompt slugs. `available` is false when the browser won't store them. */
export function useSaved() {
  const { list, toggle, available } = useStoredList(SAVED_KEY)
  return { saved: list, toggle, available }
}

/** Workflow steps ticked off in one collection. */
export function useDoneSteps(collectionSlug: string) {
  const { list, toggle, available } = useStoredList(`sidecarWebDone:${collectionSlug}`)
  return { done: list, toggle, available }
}
