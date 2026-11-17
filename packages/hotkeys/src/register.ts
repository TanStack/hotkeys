/**
 * Register app-wide types. Augment it from your framework package, or from
 * `@tanstack/hotkeys` itself.
 *
 * - `appHotkeys` types `useAppHotkeys()` and `CustomHotkeys`.
 * - `keys` sets the printable keys that hotkey strings accept, from the
 *   keyboard layouts your app targets. Without it, they are the US QWERTY
 *   keys. A-Z, 0-9, named keys such as `Escape`, and physical codes such as
 *   `[KeyS]` are always accepted.
 *
 * @example
 * ```ts
 * import type { GermanKeys } from '@tanstack/react-hotkeys'
 *
 * declare module '@tanstack/react-hotkeys' {
 *   interface Register {
 *     appHotkeys: typeof appHotkeys
 *     keys: GermanKeys
 *   }
 * }
 * ```
 */
export interface Register {}
