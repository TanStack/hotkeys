---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to a Solid app with TanStack Hotkeys. Create hotkeys, show them in your UI, and group them with scoped providers.
---

This guide adds keyboard shortcuts to a Solid app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Create a hotkey

TanStack Hotkeys needs no special setup. To create a keyboard shortcut, call `createHotkey` in the component that owns the action:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Create several hotkeys

When a component has more than one hotkey, create them together with `createHotkeys`:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])

  return <textarea />
}
```

`createHotkeys` also accepts an accessor that returns the array, so the list can come from a signal or a store and change length over time.

## Sequences

Pass an array of chords to create a sequence, pressed one after another:

```tsx
createHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`createHotkeys` accepts chords and sequences in the same array:

```tsx
createHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```tsx
import { createHotkey, formatForDisplay } from '@tanstack/solid-hotkeys'
import type { HotkeyChord } from '@tanstack/solid-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() {
  createHotkey(saveHotkey, () => save())

  return (
    <button onClick={save}>
      Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
    </button>
  )
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that creates it renders, and removed when that component is disposed. Put each hotkey in the component it belongs to, so it is active only while that component is rendered:

```tsx
import { Show, createSignal } from 'solid-js'

function App() {
  const [isOpen, setIsOpen] = createSignal(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Settings</button>
      <Show when={isOpen()}>
        <SettingsDialog onClose={() => setIsOpen(false)} />
      </Show>
    </>
  )
}

function SettingsDialog(props: { onClose: () => void }) {
  // Exists only while the dialog is rendered
  createHotkey('Escape', () => props.onClose())

  return <div role="dialog">...</div>
}
```

For a condition that doesn't match a component, pass `enabled`. Pass options as an accessor, so they follow your signals:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, keep the element in a signal and pass it as `target`:

```tsx
import { createSignal } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabIndex={0}>
      ...
    </div>
  )
}
```

A `null` target waits until the element is attached. The element must be focusable to receive key presses, so give it a `tabIndex` if it isn't a control.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component is rendered. You don't need a provider for that.

Add `HotkeysProvider` at the root to set default options for every hotkey inside it, such as more time between sequence steps:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function Root() {
  return (
    <HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
      <App />
    </HotkeysProvider>
  )
}
```

Add more providers deeper in your app to group hotkeys into scopes. Every hotkey inside a provider with a `scope` belongs to that scope. Make the scope `exclusive`, and while it is rendered, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```tsx
import { HotkeysProvider, createHotkeys } from '@tanstack/solid-hotkeys'

function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <HotkeysProvider scope="confirm-dialog" exclusive>
      <ConfirmDialogBody {...props} />
    </HotkeysProvider>
  )
}

function ConfirmDialogBody(props: ConfirmDialogProps) {
  createHotkeys([
    { hotkey: 'Enter', callback: () => props.onConfirm() },
    { hotkey: 'Escape', callback: () => props.onCancel() },
  ])

  return <div role="dialog">...</div>
}
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A primitive uses the nearest provider above the component that calls it, so create the dialog's hotkeys in a child of its provider. [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes) covers nested scopes, precedence, and turning a scope off without disposing it.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers
- [Devtools](../../devtools): inspect registered hotkeys, scopes, and held keys while you develop

As your app grows:

- [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
