import type { RefObject } from 'preact'

/**
 * Type guard to check if a value is a Preact ref-like object.
 */
export function isRef(value: unknown): value is RefObject<HTMLElement | null> {
  return value !== null && typeof value === 'object' && 'current' in value
}
