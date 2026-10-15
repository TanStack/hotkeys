import type { RefObject } from 'preact'
import type { Target } from '@tanstack/hotkeys'
import type { UseHotkeyTarget } from './useHotkey'

/**
 * Type guard to check if a value is a Preact ref-like object.
 */
function isRef(value: unknown): value is RefObject<HTMLElement | null> {
  return value !== null && typeof value === 'object' && 'current' in value
}

/**
 * Resolves a hook target. A ref that is still null skips registration;
 * a null target means document.
 */
export function resolveTarget(
  target: UseHotkeyTarget,
): Target | null | undefined {
  return isRef(target) ? target.current : (target ?? undefined)
}
