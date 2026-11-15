import type {
  AppHotkeys,
  AppHotkeysStore,
  AppHotkeysStoreOptions,
} from './app-hotkeys'

type Factory = (
  appHotkeys: AppHotkeys,
  options: AppHotkeysStoreOptions<AppHotkeys>,
) => AppHotkeysStore

// Set by `defineAppHotkeys`, so providers create stores without importing the
// store class. Apps without app hotkeys never load it.
let factory: Factory | undefined

export function setAppHotkeysStoreFactory(create: Factory): void {
  factory = create
}

/** Creates the store for app hotkeys from `defineAppHotkeys`. */
export function createAppHotkeysStore<T extends AppHotkeys>(
  appHotkeys: T,
  options: AppHotkeysStoreOptions<T>,
): AppHotkeysStore<T> {
  if (!factory) {
    // Also reached when a React Server Component passes the declarations:
    // `defineAppHotkeys` then ran only in the server bundle.
    throw new Error(
      '[hotkeys] defineAppHotkeys did not run in this bundle. Import the app hotkeys in the module that renders the provider. With React Server Components, render AppHotkeysProvider instead of HotkeysProvider.',
    )
  }
  return factory(appHotkeys, options) as unknown as AppHotkeysStore<T>
}
