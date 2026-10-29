/**
 * Whether the code runs on a server. With `@lit-labs/ssr`'s
 * `connectedCallback: true` option, the server calls `hostConnected` and never
 * calls `hostDisconnected`, so controllers must not subscribe there.
 */
export function isServer(): boolean {
  return typeof document === 'undefined'
}
