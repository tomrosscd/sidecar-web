// @vitest-environment jsdom
import { ThemeProvider } from '@convert/product-ui'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '@/components/app-shell'
import { ToastProvider } from '@/components/toast-provider'
import { ViewProvider } from '@/components/view-provider'
import type { Prompt } from '@/lib/types'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}))

const prompts: Prompt[] = [
  { slug: 'first-prompt', title: 'First prompt', category: 'CRO', body: 'Analyse the funnel.', placeholders: [] },
  { slug: 'second-prompt', title: 'Second prompt', category: 'CRO', body: 'Analyse the cart.', placeholders: [] },
]

// jsdom has no layout, so give the shell and panel the browser APIs they measure with.
beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

let root: Root | undefined
let container: HTMLElement

async function show(query: string) {
  window.history.replaceState(null, '', `/${query}`)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root!.render(
      <ThemeProvider theme="light" appearance="workspace">
        <ToastProvider>
          <ViewProvider prompts={prompts}>
            <AppShell searchEntries={[]}>
              <h1>Page content</h1>
            </AppShell>
          </ViewProvider>
        </ToastProvider>
      </ThemeProvider>,
    )
  })
}

beforeEach(() => window.localStorage.clear())
afterEach(async () => {
  await act(async () => root?.unmount())
  container?.remove()
  root = undefined
})

describe('the shell owns the prompt panel', () => {
  it('shows the page content with no panel when no prompt is open', async () => {
    await show('')
    expect(document.body.textContent).toContain('Page content')
    expect(document.body.textContent).not.toContain('Prompt text')
  })

  it('opens the prompt named in the address, whatever the page', async () => {
    await show('?p=second-prompt')
    expect(document.body.textContent).toContain('Page content')
    expect(document.body.textContent).toContain('Second prompt')
    expect(document.body.textContent).toContain('Prompt text')
  })

  it('ignores an address that names no prompt', async () => {
    await show('?p=does-not-exist')
    expect(document.body.textContent).not.toContain('Prompt text')
  })

  it('closing the panel takes the prompt out of the address', async () => {
    await show('?p=first-prompt')
    const close = [...document.querySelectorAll('button')].find((b) =>
      /close/i.test(b.getAttribute('aria-label') ?? ''),
    )
    expect(close).toBeDefined()
    await act(async () => close!.click())
    expect(window.location.search).toBe('')
    expect(document.body.textContent).not.toContain('Prompt text')
  })

  it('puts "Get the extension" in the title bar, once', async () => {
    await show('')
    const buttons = [...document.querySelectorAll('button')].filter(
      (b) => b.textContent?.trim() === 'Get the extension',
    )
    expect(buttons).toHaveLength(1)
  })
})
