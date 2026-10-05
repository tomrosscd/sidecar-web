import { ThemeProvider } from '@convert/product-ui'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@convert/product-ui/styles.css'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { SITE_DESCRIPTION, SITE_NAME } from '@/config/site'
import { withBase } from '@/lib/base-path'

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  icons: { icon: withBase('/brand/sidecar-icon.svg') },
  // Applies to every page. GitHub Pages ignores a project-level robots.txt, so this is the control.
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Browser extensions can add attributes to <html> before React loads.
    <html lang="en-AU" suppressHydrationWarning>
      <body>
        <ThemeProvider theme="light" appearance="workspace">
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
