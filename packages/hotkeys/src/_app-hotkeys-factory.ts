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
    throw new Error('[hotkeys] App hotkeys must come from defineAppHotkeys.')
  }
  return factory(appHotkeys, options) as unknown as AppHotkeysStore<T>
}
