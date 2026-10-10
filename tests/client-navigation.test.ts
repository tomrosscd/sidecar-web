import { describe, expect, it, vi } from 'vitest'
import { routeLinkClick } from '@/lib/client-navigation'

const click = (over = {}) => ({
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  button: 0,
  preventDefault: vi.fn(),
  ...over,
})

describe('routeLinkClick', () => {
  it('sends a plain left click through the router and stops the page load', () => {
    const push = vi.fn()
    const event = click()
    routeLinkClick(push, '/collections/', event)
    expect(push).toHaveBeenCalledWith('/collections/')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it.each([
    ['command', { metaKey: true }],
    ['control', { ctrlKey: true }],
    ['shift', { shiftKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves a %s click to the browser', (_name, over) => {
    const push = vi.fn()
    const event = click(over)
    routeLinkClick(push, '/collections/', event)
    expect(push).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('leaves an item with no address (the current page) alone', () => {
    const push = vi.fn()
    const event = click()
    routeLinkClick(push, undefined, event)
    expect(push).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('routes the home address as /', () => {
    const push = vi.fn()
    routeLinkClick(push, '', click())
    expect(push).not.toHaveBeenCalled()
    routeLinkClick(push, '/', click())
    expect(push).toHaveBeenCalledWith('/')
  })
})
