import { canWarn } from './_dev'

// Server runtimes that define `navigator` describe the server, not the user.
const SERVER_AGENT = /^(?:Node\.js\/|Deno\/|Bun\/|Cloudflare-Workers)/

/** Whether this runs on a server: no `navigator`, or a server runtime's. */
export function isServerRuntime(): boolean {
  return (
    typeof navigator === 'undefined' ||
    SERVER_AGENT.test(String(navigator.userAgent))
  )
}

let warned = false

/**
 * Warns once, in development, when a label's platform is detected during
 * server rendering. The server then renders 'linux' labels, which differ for
 * users on macOS and Windows after hydration.
 */
export function warnServerPlatform(): void {
  // Dev-only guard: see `canWarn`
  if (
    canWarn &&
    process.env.NODE_ENV !== 'production' &&
    !warned &&
    isServerRuntime()
  ) {
    warned = true
    console.warn(
      "[hotkeys] Server-rendered label uses 'linux'. Set the provider's platform with detectPlatform(userAgent)",
    )
  }
}
