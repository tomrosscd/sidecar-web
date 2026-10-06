import type { ReactNode } from 'react'
import { createElement } from 'react'
import { withBase } from '@/lib/base-path'
import generatedApps from './apps.generated.json'

export type SuiteApp = {
  id: string
  label: string
  href: string
  description: string
  markSrc: string
  /** Cropped artwork needs 'inset' so it keeps padding inside the frame. */
  markTreatment: 'full-frame' | 'inset'
}

export const CURRENT_APP_ID = 'sidecar-web'

/** The Convert apps shown in the shell's app switcher, from the shared list in `tomrosscd/convert-apps`. Run `pnpm apps` to refresh it. */
export const suiteApps = generatedApps as readonly SuiteApp[]

/** A small published mark, shown unaltered. */
export function appMark(src: string): ReactNode {
  // A plain <img> keeps the artwork untouched and works with the static export.
  return createElement('img', { src: withBase(src), alt: '' })
}
