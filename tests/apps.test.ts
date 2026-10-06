import { describe, expect, it } from 'vitest'
import { CURRENT_APP_ID, suiteApps } from '@/config/apps'

describe('suite apps', () => {
  it('lists at least the current app', () => {
    expect(suiteApps.map((app) => app.id)).toContain('sidecar-web')
    expect(suiteApps.map((app) => app.id)).toContain(CURRENT_APP_ID)
  })

  it.each(suiteApps.map((app) => [app.id, app] as const))('%s has an https href and a published mark', (_id, app) => {
    expect(app.href).toMatch(/^https:\/\//)
    expect(new URL(app.href).protocol).toBe('https:')
    expect(app.markSrc).toMatch(/^\/apps\/[\w.-]+\.(svg|png)$/)
  })

  it('has unique ids', () => {
    const ids = suiteApps.map((app) => app.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
