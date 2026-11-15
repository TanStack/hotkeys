import { describe, expect, it, vi } from 'vitest'

const message =
  '[hotkeys] defineAppHotkeys did not run in this bundle. Import the app hotkeys in the module that renders the provider. With React Server Components, render AppHotkeysProvider instead of HotkeysProvider.'

// A fresh module graph where `defineAppHotkeys` never ran, as in the client
// bundle when only a React Server Component imports the declarations.
async function loadFactory() {
  vi.resetModules()
  return import('../src/_app-hotkeys-factory')
}

describe('createAppHotkeysStore without defineAppHotkeys in the bundle', () => {
  it.each([
    ['one hotkey', { 'doc.save': { hotkey: 'Mod+S' } }],
    ['no hotkeys', {}],
  ] as const)(
    'names AppHotkeysProvider for declarations with %s that crossed a server boundary',
    async (_, definitions) => {
      const { defineAppHotkeys } = await import('../src/app-hotkeys')
      // Props from a Server Component reach the client as plain data.
      const serialized = JSON.parse(
        JSON.stringify(defineAppHotkeys(definitions)),
      )
      const { createAppHotkeysStore } = await loadFactory()

      expect(() => createAppHotkeysStore(serialized, {})).toThrow(message)
    },
  )
})
