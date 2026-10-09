'use client'

import { Button, CommandPalette, Icon, WorkspaceShell, type AppEntry, type SidebarEntry } from '@convert/product-ui'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { CURRENT_APP_ID, appMark, suiteApps } from '@/config/apps'
import { EXTENSION_URL, SHOW_SKILLS } from '@/config/site'
import { withBase } from '@/lib/base-path'
import { routeLinkClick } from '@/lib/client-navigation'
import { BookmarkIcon } from './icons'
import type { SearchEntry } from '@/lib/search-entries'

const items: readonly SidebarEntry[] = [
  { id: 'library', label: 'Prompt library', href: withBase('/'), icon: <Icon name="overview" /> },
  { id: 'collections', label: 'Collections', href: withBase('/collections/'), icon: <Icon name="grid" /> },
  ...(SHOW_SKILLS ? [{ id: 'skills', label: 'Skills', href: withBase('/skills/'), icon: <Icon name="list" /> }] : []),
  { id: 'saved', label: 'Saved', href: withBase('/saved/'), icon: <BookmarkIcon /> },
  { id: 'extension', label: 'Extension', href: withBase('/extension/'), icon: <Icon name="download" /> },
]

/** Which sidebar item is active for the first path segment. Prompt pages belong to the library. */
const sections: Record<string, string> = {
  collections: 'collections',
  skills: 'skills',
  saved: 'saved',
  extension: 'extension',
}

const apps: readonly AppEntry[] = suiteApps.map((app) => ({
  id: app.id,
  label: app.label,
  href: app.href,
  description: app.description,
  mark: appMark(app.markSrc),
  markTreatment: app.markTreatment,
}))

export function AppShell({ children, searchEntries }: { children: ReactNode; searchEntries: readonly SearchEntry[] }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // The one owner of Cmd/Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <WorkspaceShell
        items={items}
        activeId={sections[pathname.split('/').filter(Boolean)[0] ?? ''] ?? 'library'}
        productName="Sidecar Web"
        productMark={appMark('/brand/sidecar-icon.svg')}
        apps={apps}
        currentAppId={CURRENT_APP_ID}
        onSearch={() => setSearchOpen(true)}
        collapsible
        headerActions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.open(EXTENSION_URL, '_blank', 'noopener,noreferrer')}
          >
            Get the extension
          </Button>
        }
        onNavigate={(item, event) => routeLinkClick(router.push, item.href, event)}
      >
        {children}
      </WorkspaceShell>
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        label="Search Sidecar Web"
        placeholder="Search prompts, collections and pages…"
        emptyLabel="Nothing matches that search"
        groupOrder={['Pages', 'Collections', 'Skills', 'Prompts']}
        items={searchEntries.map((entry) => ({
          id: entry.id,
          label: entry.label,
          group: entry.group,
          keywords: entry.keywords.join(' '),
          hint: entry.hint,
          icon: (
            <Icon
              name={
                entry.group === 'Prompts' || entry.group === 'Skills'
                  ? 'list'
                  : entry.group === 'Collections'
                    ? 'grid'
                    : 'overview'
              }
            />
          ),
          onSelect: () => router.push(entry.href),
        }))}
      />
    </>
  )
}
