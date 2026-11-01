import { isServerRuntime } from './_server'
import type { CanonicalModifier } from './key.types'

/** A platform for resolving `Mod` and formatting labels. */
export type HotkeyPlatform = 'mac' | 'windows' | 'linux'

/**
 * Detects a platform from a user agent string, or from the browser's
 * `navigator` when called without one.
 *
 * Used internally to resolve platform-adaptive modifiers like 'Mod' (Command on Mac,
 * Control elsewhere) and for platform-specific hotkey formatting. During server
 * rendering, pass the request's `User-Agent` header to detect the user's
 * platform instead of the server's.
 *
 * @param userAgent - A user agent string, such as a request's `User-Agent` header.
 * When omitted or `null` (a missing header), reads `navigator`.
 * @returns The detected platform: 'mac', 'windows', or 'linux'
 * @remarks Without a user agent, returns 'linux' on a server runtime (no
 * `navigator`, or Node, Deno, Bun, or Cloudflare Workers), where `navigator`
 * describes the server.
 *
 * @example
 * ```ts
 * const platform = detectPlatform() // 'mac' | 'windows' | 'linux'
 * const modifier = resolveModifier('Mod', platform) // 'Meta' on Mac, 'Control' elsewhere
 *
 * // On the server
 * detectPlatform(request.headers.get('user-agent'))
 * ```
 */
export function detectPlatform(userAgent?: string | null): HotkeyPlatform {
  let platform = ''
  let agent = userAgent
  if (agent == null) {
    if (isServerRuntime()) return 'linux'
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    platform = navigator.platform?.toLowerCase() ?? ''
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    agent = navigator.userAgent ?? ''
  }
  agent = agent.toLowerCase()

  if (platform.includes('mac') || agent.includes('mac')) {
    return 'mac'
  }
  if (platform.includes('win') || agent.includes('win')) {
    return 'windows'
  }
  return 'linux'
}

/**
 * Resolves the platform-adaptive 'Mod' modifier to the appropriate canonical modifier.
 *
 * The 'Mod' token represents the "primary modifier" on each platform:
 * - macOS: 'Meta' (Command key ⌘)
 * - Windows/Linux: 'Control' (Ctrl key)
 *
 * This enables cross-platform hotkey definitions like 'Mod+S' that automatically
 * map to Command+S on Mac and Ctrl+S on Windows/Linux.
 *
 * @param modifier - The modifier to resolve. If 'Mod', resolves based on platform.
 * @param platform - The target platform. Defaults to auto-detection.
 * @returns The canonical modifier name ('Control', 'Shift', 'Alt', or 'Meta')
 *
 * @example
 * ```ts
 * resolveModifier('Mod', 'mac') // 'Meta'
 * resolveModifier('Mod', 'windows') // 'Control'
 * resolveModifier('Control', 'mac') // 'Control' (unchanged)
 * ```
 */
export function resolveModifier(
  modifier: CanonicalModifier | 'Mod',
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): CanonicalModifier {
  if (modifier === 'Mod') {
    return platform === 'mac' ? 'Meta' : 'Control'
  }
  return modifier
}
