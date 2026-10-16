import type { HotkeyManager } from './hotkey-manager'

/**
 * The HotkeyManager singleton, once created. Code that only reads the live
 * registry, such as conflict checks, reads this instead of importing the
 * manager, so a recorder bundle does not include hotkey dispatch.
 */
export const managerRef: { current: HotkeyManager | null } = { current: null }
