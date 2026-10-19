# App hotkeys in Solid

The `@tanstack/hotkeys#app-hotkeys` skill owns the rules. This is the Solid wiring.

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/solid-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'help.shortcuts': { hotkey: 'Mod+/', meta: { name: 'Keyboard shortcuts' } },
})

declare module '@tanstack/solid-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

```tsx no-check
import type { JSX } from 'solid-js'
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import type { CustomHotkeys } from '@tanstack/solid-hotkeys'
import { appHotkeys } from './app-hotkeys'

const saved: CustomHotkeys = JSON.parse(localStorage.getItem('hotkeys') ?? '{}')

export function Root(props: { children: JSX.Element }) {
  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={saved}
      onCustomHotkeysChange={(custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom))
      }
    >
      {props.children}
    </HotkeysProvider>
  )
}
```

`useAppHotkeys()` returns an accessor, so register inside one: `createHotkey(() => appHotkeys()['doc.save'], save)`. Build a cheat sheet from `createAppHotkeyList()`.

A settings row records with `createHotkeyRecorder` and saves through `useCustomHotkeys`:

```tsx
import {
  createHotkeyRecorder,
  formatForDisplay,
  useAppHotkeys,
  useCustomHotkeys,
} from '@tanstack/solid-hotkeys'
import type { AppHotkeyId } from '@tanstack/solid-hotkeys'

export function ShortcutRow(props: { id: AppHotkeyId }) {
  const appHotkeys = useAppHotkeys()
  const appHotkey = () => appHotkeys()[props.id]
  const { findConflicts, setCustomHotkey, resetCustomHotkey } =
    useCustomHotkeys()
  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = findConflicts(props.id, hotkey)
      return conflict ? `Used by ${conflict.meta?.name ?? conflict.id}` : true
    },
    onRecord: (hotkey) => setCustomHotkey(props.id, hotkey),
    onClear: () => setCustomHotkey(props.id, null),
  })

  return (
    <div>
      {appHotkey().meta?.name}:{' '}
      {appHotkey().hotkey
        ? formatForDisplay(appHotkey().hotkey!)
        : 'Unassigned'}
      <button onClick={recorder.startRecording}>Change</button>
      <button onClick={() => resetCustomHotkey(props.id)}>Reset</button>
    </div>
  )
}
```
