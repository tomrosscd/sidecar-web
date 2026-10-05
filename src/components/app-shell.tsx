'use client'

import { CommandPalette, Icon, WorkspaceShell, type AppEntry, type SidebarEntry } from '@convert/product-ui'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { CURRENT_APP_ID, appMark, suiteApps } from '@/config/apps'
import { basePath, withBase } from '@/lib/base-path'

const items: readonly SidebarEntry[] = [
  { id: 'library', label: 'Prompt library', href: withBase('/'), icon: <Icon name="overview" /> },
]

const routes: Record<string, string> = {}

const apps: readonly AppEntry[] = suiteApps.map((app) => ({
  id: app.id,
  label: app.label,
  href: app.href,
  description: app.description,
  mark: appMark(app.markSrc),
  markTreatment: 'full-frame',
}))

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  return (
    <>
      <WorkspaceShell
        items={items}
        activeId={routes[pathname.replace(/\/$/, '')] ?? 'library'}
        productName="Sidecar Web"
        productMark={appMark('/brand/sidecar-icon.svg')}
        apps={apps}
        currentAppId={CURRENT_APP_ID}
        onSearch={() => setSearchOpen(true)}
        collapsible
        onNavigate={(item, event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
          event.preventDefault()
          router.push(item.href.slice(basePath.length) || '/')
        }}
      >
        {children}
      </WorkspaceShell>
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        label="Search Sidecar Web"
        placeholder="Search pages…"
        emptyLabel="No matching pages"
        items={[
          {
            id: 'library',
            label: 'Prompt library',
            group: 'Pages',
            icon: <Icon name="overview" />,
            onSelect: () => router.push('/'),
          },
        ]}
      />
    </>
  )
}
