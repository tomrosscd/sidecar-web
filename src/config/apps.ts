import type { ReactNode } from 'react'
import { createElement } from 'react'
import { withBase } from '@/lib/base-path'

export type SuiteApp = {
  id: string
  label: string
  href: string
  description: string
  markSrc: string
}

export const CURRENT_APP_ID = 'sidecar-web'

/** The Convert apps shown in the shell's app switcher. Add new apps here. */
export const suiteApps: readonly SuiteApp[] = [
  {
    id: 'sidecar-web',
    label: 'Sidecar Web',
    href: 'https://tomrosscd.github.io/sidecar-web/',
    description: 'Prompt library for Convert staff',
    markSrc: '/brand/sidecar-icon.svg',
  },
  {
    id: 'brand-tools',
    label: 'Brand Tools',
    href: 'https://tomrosscd.github.io/cd-brand-tools/',
    description: 'Brand guide, assets and creators',
    markSrc: '/brand/convert-icon-dark-green.svg',
  },
]

/** A small published mark, shown unaltered. */
export function appMark(src: string): ReactNode {
  // A plain <img> keeps the artwork untouched and works with the static export.
  return createElement('img', { src: withBase(src), alt: '' })
}
