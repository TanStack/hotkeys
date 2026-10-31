---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to an Octane app with TanStack Hotkeys. Register hotkeys, show them in your UI, and group them with scoped providers.
---

This guide adds keyboard shortcuts to an Octane app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, call `useHotkey` in the component that owns the action:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

A custom hook in a plain `.ts` file needs the compiler too when it calls the same hook more than once. Start the file with `/** @jsxImportSource octane */`, or import a value such as `useState` from `octane`. Otherwise the calls share one slot, and only the last one works. See [Custom hooks](./guides/hotkeys#custom-hooks).

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

When a component has more than one hotkey, register them together with `useHotkeys`:

```tsx
import { useHotkeys } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])

  <textarea />
}
```

`useHotkeys` takes an array, so the list can also come from data, and its length can change between renders.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```tsx
useHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`useHotkeys` accepts chords and sequences in the same array:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```tsx
import { formatForDisplay, useHotkey } from '@tanstack/octane-hotkeys'
import type { HotkeyChord } from '@tanstack/octane-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() @{
  useHotkey(saveHotkey, () => save())

  <button onClick={save}>
    Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
  </button>
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that calls the hook mounts, and unregistered when that component unmounts. Put each hotkey in the component it belongs to, so it is active only while that component is mounted:

```tsx
import { useState } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

function App() @{
  const [isOpen, setIsOpen] = useState(false)

  <div>
    <button onClick={() => setIsOpen(true)}>Settings</button>
    @if (isOpen) { <SettingsDialog onClose={() => setIsOpen(false)} /> }
  </div>
}

function SettingsDialog({ onClose }: { onClose: () => void }) @{
  // Registered only while the dialog is mounted
  useHotkey('Escape', onClose)

  <div role="dialog">...</div>
}
```

For a condition that doesn't match a component, pass `enabled`:

```tsx
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, keep the element in state with a callback ref and pass it as `target`:

```tsx
import { useState } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

function Panel() @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  useHotkey('Escape', () => closePanel(), { target: panel })

  <div ref={setPanel} tabIndex={0}>...</div>
}
```

A target must be an element, not a ref object. A `null` target waits until the element mounts. The element must be focusable to receive key presses, so give it a `tabIndex` if it isn't a control.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component is mounted. You don't need a provider for that.

Add `HotkeysProvider` at the root to set default options for every hotkey inside it, such as more time between sequence steps:

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

function Root() @{
  <HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
    <App />
  </HotkeysProvider>
}
```

Add more providers deeper in your app to group hotkeys into scopes. Every hotkey inside a provider with a `scope` belongs to that scope. Make the scope `exclusive`, and while it is mounted, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```tsx
import { HotkeysProvider, useHotkeys } from '@tanstack/octane-hotkeys'

function ConfirmDialog({ onConfirm, onCancel }: ConfirmDialogProps) @{
  <HotkeysProvider scope="confirm-dialog" exclusive>
    <ConfirmDialogBody onConfirm={onConfirm} onCancel={onCancel} />
  </HotkeysProvider>
}

function ConfirmDialogBody({ onConfirm, onCancel }: ConfirmDialogProps) @{
  useHotkeys([
    { hotkey: 'Enter', callback: onConfirm },
    { hotkey: 'Escape', callback: onCancel },
  ])

  <div role="dialog">...</div>
}
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A hook uses the nearest provider above the component that calls it, so register the dialog's hotkeys in a child of its provider. [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes) covers nested scopes, precedence, and turning a scope off without unmounting it.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers

As your app grows:

- [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
