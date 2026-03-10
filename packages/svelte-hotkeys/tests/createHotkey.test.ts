import { describe, expect, it } from 'vitest'
import { getDefaultHotkeysOptions, getHotkeysContext } from '../src/HotkeysCtx'

describe('HotkeysCtx', () => {
  it('falls back cleanly when no parent context exists', () => {
    expect(getHotkeysContext()).toBeNull()
    expect(getDefaultHotkeysOptions()).toEqual({})
  })
})
