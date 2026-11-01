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
  if (process.env.NODE_ENV !== 'production' && !warned && isServerRuntime()) {
    warned = true
    console.warn(
      "[TanStack Hotkeys] A hotkey label was formatted during server rendering without a platform, so it uses 'linux'. Mac and Windows users get a different label after hydration. Read the platform from the request with `detectPlatform(userAgent)`, set it as the `platform` of your hotkeys provider or scope, and format labels with your adapter's formatter, such as `useFormatForDisplay`. Or render the labels only in the browser. See the server rendering section of the Displaying Hotkeys guide.",
    )
  }
}
