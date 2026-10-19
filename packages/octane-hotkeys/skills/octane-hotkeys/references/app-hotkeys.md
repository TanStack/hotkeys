# App hotkeys in Octane

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Octane wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/octane-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/octane-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```tsrx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'
import type { CustomHotkeys } from '@tanstack/octane-hotkeys'
import { appHotkeys } from './app-hotkeys'
import { App } from './App.tsrx'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')

export function Root() @{
  <HotkeysProvider
    appHotkeys={appHotkeys}
    customHotkeys={saved}
    onCustomHotkeysChange={(custom) => localStorage.setItem('hotkeys', JSON.stringify(custom))}
  >
    <App />
  </HotkeysProvider>
}
```

Register with `useHotkey(appHotkeys['doc.save'], save)`, using the import or `useAppHotkeys()`. Build a cheat sheet from `useAppHotkeyList()`.

A settings row records with `useHotkeyRecorder` and saves through `useCustomHotkeys`:

```tsrx
import { formatForDisplay, useAppHotkeys, useCustomHotkeys, useHotkeyRecorder } from '@tanstack/octane-hotkeys'
import type { AppHotkeyId } from '@tanstack/octane-hotkeys'

export function ShortcutRow({ id }: { id: AppHotkeyId }) @{
  const appHotkey = useAppHotkeys()[id]
  const { findConflicts, setCustomHotkey, resetCustomHotkey } = useCustomHotkeys()
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = findConflicts(id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => setCustomHotkey(id, hotkey),
    onClear: () => setCustomHotkey(id, null),
  })

  <div>
    {appHotkey.meta?.name}: {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
    <button onClick={recorder.startRecording}>Change</button>
    <button onClick={() => resetCustomHotkey(id)}>Reset</button>
  </div>
}
```
