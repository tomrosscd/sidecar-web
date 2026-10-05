import { ThemeProvider } from '@convert/product-ui'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@convert/product-ui/styles.css'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { ToastProvider } from '@/components/toast-provider'
import { ViewProvider } from '@/components/view-provider'
import { SITE_DESCRIPTION, SITE_NAME } from '@/config/site'
import { withBase } from '@/lib/base-path'
import { loadCollections } from '@/lib/collections'
import { loadPrompts } from '@/lib/prompts'
import { buildSearchEntries } from '@/lib/search-entries'

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  icons: { icon: withBase('/brand/sidecar-icon.svg') },
  // Applies to every page. GitHub Pages ignores a project-level robots.txt, so this is the control.
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [{ prompts }, collections] = await Promise.all([loadPrompts(), loadCollections()])
  return (
    // Browser extensions can add attributes to <html> before React loads.
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        <ThemeProvider theme="light" appearance="workspace">
          <ToastProvider>
            <ViewProvider prompts={prompts}>
              <AppShell searchEntries={buildSearchEntries(prompts, collections)}>{children}</AppShell>
            </ViewProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
