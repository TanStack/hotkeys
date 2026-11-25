import { afterEach, describe, expect, it, vi } from 'vitest'
import { listen } from '../src/_listen'

describe('listen', () => {
  afterEach(() => {
    delete (globalThis as { __Zone_symbol_prefix?: string })
      .__Zone_symbol_prefix
  })

  it("uses zone.js's saved native addEventListener", () => {
    const target = new EventTarget()
    const native = vi.fn()
    Object.assign(target, { __zone_symbol__addEventListener: native })
    const listener = () => {}
    listen(target, 'keydown', listener, true)
    expect(native).toHaveBeenCalledWith('keydown', listener, true)
  })

  it('follows a custom zone.js symbol prefix', () => {
    ;(globalThis as { __Zone_symbol_prefix?: string }).__Zone_symbol_prefix =
      'custom_'
    const target = new EventTarget()
    const native = vi.fn()
    Object.assign(target, { custom_addEventListener: native })
    listen(target, 'keydown', () => {}, false)
    expect(native).toHaveBeenCalledOnce()
  })

  it('falls back to addEventListener without zone.js', () => {
    const target = new EventTarget()
    const add = vi.spyOn(target, 'addEventListener')
    listen(target, 'keyup', () => {}, false)
    expect(add).toHaveBeenCalledOnce()
  })
})
