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
 * server rendering. Locally the server and browser share an OS, so the
 * mismatch only shows for users on other platforms.
 */
export function warnServerPlatform(): void {
  if (process.env.NODE_ENV !== 'production' && !warned && isServerRuntime()) {
    warned = true
    console.warn(
      "[TanStack Hotkeys] A hotkey label was formatted on the server without a platform, so it uses 'linux'. Users on other platforms get a different label after hydration. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request and format labels with your adapter's formatter hook, or render the label only on the client. See the server rendering section of the Displaying Hotkeys guide.",
    )
  }
}
