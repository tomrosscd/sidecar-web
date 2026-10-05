import { useCallback, useSyncExternalStore } from 'react'
import { browserStore, readSaved, toggleSlug, writeSaved } from './saved'

// A session-only copy, so toggling still works on screen when storage is unavailable.
let memory: string[] = []
let storageWorks = true
let snapshot: string[] | undefined
const listeners = new Set<() => void>()
const EMPTY: string[] = []

function load(): string[] {
  const stored = readSaved(browserStore())
  return stored.length > 0 || storageWorks ? stored : memory
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = () => {
    snapshot = undefined
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): string[] {
  return (snapshot ??= load())
}

/** Saved prompt slugs kept in localStorage. `available` is false when the browser won't store them. */
export function useSaved() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
  const toggle = useCallback((slug: string) => {
    const next = toggleSlug(getSnapshot(), slug)
    storageWorks = writeSaved(browserStore(), next)
    memory = next
    snapshot = next
    listeners.forEach((l) => l())
  }, [])
  const available = typeof window === 'undefined' ? true : storageWorks
  return { saved, toggle, available }
}
