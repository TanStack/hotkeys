# App hotkeys in Preact

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Preact wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/preact-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/preact-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```tsx no-check
import type { ComponentChildren } from 'preact'
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import type { CustomHotkeys } from '@tanstack/preact-hotkeys'
import { appHotkeys } from './app-hotkeys'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')

export function Root({ children }: { children: ComponentChildren }) {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={saved}
      onCustomHotkeysChange={(custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom))
      }
    >
      {children}
    </HotkeysProvider>
  )
}
```

Register with `useHotkey(appHotkeys['doc.save'], save)`, using the import or `useAppHotkeys()`. Build a cheat sheet from `useAppHotkeyList()`.

A settings row records with `useHotkeyRecorder` and saves through `useCustomHotkeys`:

```tsx
import {
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkeyRecorder,
} from '@tanstack/preact-hotkeys'
import type { AppHotkeyId } from '@tanstack/preact-hotkeys'

export function ShortcutRow({ id }: { id: AppHotkeyId }) {
  const appHotkey = useAppHotkeys()[id]
  const { findConflicts, setCustomHotkey, resetCustomHotkey } =
    useCustomHotkeys()
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = findConflicts(id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => setCustomHotkey(id, hotkey),
    onClear: () => setCustomHotkey(id, null),
  })

  return (
    <div>
      {appHotkey.meta?.name}:{' '}
      {appHotkey.hotkey ? formatForDisplay(appHotkey.hotkey) : 'Unassigned'}
      <button onClick={recorder.startRecording}>Change</button>
      <button onClick={() => resetCustomHotkey(id)}>Reset</button>
    </div>
  )
}
```
