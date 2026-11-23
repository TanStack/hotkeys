import type { Assertion, Expect, Matchers } from './types'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (!isObject(a) || !isObject(b)) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keys = Object.keys(a).filter((key) => a[key] !== undefined)
  const other = Object.keys(b).filter((key) => b[key] !== undefined)
  if (keys.length !== other.length) return false
  return keys.every((key) => equal(a[key], b[key]))
}

function matches(actual: unknown, expected: unknown): boolean {
  if (!isObject(expected)) return Object.is(actual, expected)
  if (!isObject(actual)) return false
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((item, index) => matches(actual[index], item))
    )
  }
  return Object.keys(expected).every((key) =>
    matches(actual[key], expected[key]),
  )
}

function show(value: unknown): string {
  try {
    // undefined and functions have no JSON form.
    return value === undefined || typeof value === 'function'
      ? String(value)
      : JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function matchers(actual: unknown, negate: boolean): Matchers {
  const check = (pass: boolean, message: string) => {
    if (pass === negate) {
      throw new Error(
        `expected ${show(actual)} ${negate ? 'not ' : ''}${message}`,
      )
    }
  }
  return {
    toBe: (expected) =>
      check(Object.is(actual, expected), `to be ${show(expected)}`),
    toEqual: (expected) =>
      check(equal(actual, expected), `to equal ${show(expected)}`),
    toMatchObject: (expected) =>
      check(matches(actual, expected), `to match ${show(expected)}`),
    toHaveLength: (length) =>
      check(
        isObject(actual) && (actual as { length?: unknown }).length === length,
        `to have length ${length}`,
      ),
    toHaveProperty: (property) =>
      check(
        isObject(actual) && property in actual,
        `to have property ${property}`,
      ),
    toBeGreaterThan: (value) =>
      check(
        typeof actual === 'number' && actual > value,
        `to be greater than ${value}`,
      ),
  }
}

/**
 * A small `expect` for runners without one, such as QUnit. A failed check
 * throws, which fails the test.
 */
export function createExpect(): Expect {
  return (actual) => {
    const assertion = matchers(actual, false) as Assertion
    assertion.not = matchers(actual, true)
    return assertion
  }
}
