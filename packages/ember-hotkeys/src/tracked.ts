import { tracked } from '@glimmer/tracking'

class TrackedVersion {
  declare version: number
}

// Applies `@tracked version = 0` by hand, so the build needs no decorator
// transform. `@glimmer/tracking` works on every supported ember-source, where
// `@ember/reactive/collections` needs 6.8.3 or newer.
Object.defineProperty(
  TrackedVersion.prototype,
  'version',
  (tracked as unknown as (...args: Array<unknown>) => PropertyDescriptor)(
    TrackedVersion.prototype,
    'version',
    {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: () => 0,
    },
  ),
)

/** A counter that invalidates its readers when it changes. */
export function trackedVersion(): { version: number } {
  return new TrackedVersion()
}
