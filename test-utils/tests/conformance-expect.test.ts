import { describe, expect, it } from 'vitest'
import { createExpect } from '../src/conformance'

const check = createExpect()

describe('createExpect', () => {
  it('passes checks that hold', () => {
    check(1).toBe(1)
    check({ a: [1, { b: 2 }], c: undefined }).toEqual({ a: [1, { b: 2 }] })
    check({ a: 1, b: { c: 2, d: 3 } }).toMatchObject({ b: { c: 2 } })
    check([1, 2]).toHaveLength(2)
    check({ a: 1 }).toHaveProperty('a')
    check(2).toBeGreaterThan(1)
    check({ a: 1 }).not.toHaveProperty('b')
  })

  it('throws for checks that fail', () => {
    expect(() => check(1).toBe(2)).toThrow('expected 1 to be 2')
    expect(() => check([1]).toEqual([1, 2])).toThrow()
    expect(() =>
      check({ a: { b: 1 } }).toMatchObject({ a: { b: 2 } }),
    ).toThrow()
    expect(() => check([{ a: 1 }]).toMatchObject([{ a: 1 }, {}])).toThrow()
    expect(() => check('ab').toHaveLength(3)).toThrow()
    expect(() => check(1).not.toBe(1)).toThrow('expected 1 not to be 1')
  })
})
