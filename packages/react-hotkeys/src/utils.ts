import type React from 'react'
import type { Target } from '@tanstack/hotkeys'
import type { UseHotkeyTarget } from './useHotkey'

/**
 * Type guard to check if a value is a React ref-like object.
 */
function isRef(value: unknown): value is React.RefObject<HTMLElement | null> {
  return value !== null && typeof value === 'object' && 'current' in value
}

/**
 * Resolves a hook target. A null target, or a ref that is still null, skips
 * registration. Omit the target to listen on the document.
 */
export function resolveTarget(target: UseHotkeyTarget): Target | null {
  return isRef(target) ? target.current : target
}
