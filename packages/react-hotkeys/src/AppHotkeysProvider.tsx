'use client'

import { installAppHotkeysStore } from '@tanstack/hotkeys/adapter'
import React from 'react'
import { HotkeysProvider } from './HotkeysProvider'
import type { AppHotkeys } from '@tanstack/hotkeys'
import type { ReactElement } from 'react'
import type { HotkeysProviderProps } from './HotkeysProvider'

export interface AppHotkeysProviderProps<
  T extends AppHotkeys = AppHotkeys,
> extends HotkeysProviderProps<T> {
  appHotkeys: T
}

/**
 * A `HotkeysProvider` that also loads the store for app hotkeys, so a React
 * Server Component, such as a Next.js `app/layout.tsx`, can render it with
 * `appHotkeys` from a server module. `HotkeysProvider` loads the store only
 * where `defineAppHotkeys` ran, which keeps it out of bundles without app
 * hotkeys.
 *
 * Functions can't come from a server component, such as
 * `onCustomHotkeysChange` or a function in the `meta` of a declaration. To
 * pass one, render this provider from a client component.
 *
 * @example
 * ```tsx
 * // app/layout.tsx, a server component
 * import { AppHotkeysProvider } from '@tanstack/react-hotkeys'
 * import { appHotkeys } from './app-hotkeys'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppHotkeysProvider appHotkeys={appHotkeys}>{children}</AppHotkeysProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function AppHotkeysProvider<T extends AppHotkeys = AppHotkeys>(
  props: AppHotkeysProviderProps<T>,
): ReactElement {
  installAppHotkeysStore()
  return <HotkeysProvider {...props} />
}
