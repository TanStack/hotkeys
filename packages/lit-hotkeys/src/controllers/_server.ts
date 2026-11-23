import { isServer as litIsServer } from 'lit'

// Typed as `false`, and `true` in Lit's Node build.
const nodeBuild: boolean = litIsServer

/**
 * Whether the code runs on a server. With `@lit-labs/ssr`'s
 * `connectedCallback: true` option, the server calls `hostConnected` and never
 * calls `hostDisconnected`, so controllers must not subscribe there.
 *
 * `@lit-labs/ssr`'s DOM shim defines a `document` with no window. Lit's own
 * `isServer` is also true where Lit's Node build runs with a real DOM, such as
 * tests in happy-dom or jsdom, and controllers must work there.
 */
export function isServer(): boolean {
  return typeof document === 'undefined' || (nodeBuild && !document.defaultView)
}
