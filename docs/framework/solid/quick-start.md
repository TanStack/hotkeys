---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to a Solid app with TanStack Hotkeys. Create hotkeys, show them in your UI, and group them with scoped providers.
---

This guide adds keyboard shortcuts to a Solid app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Create a hotkey

TanStack Hotkeys needs no setup or provider to start. Call `createHotkey` in the component that owns the action:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

`Mod` resolves to Command on macOS and Control on Windows and Linux. Out of the box, the browser's Save dialog stays closed, and `Mod+S` still fires while typing inside the `<textarea>`. See [Sensible Defaults](../../guides/sensible-defaults) to learn how every default works.

Providers, scopes, and the rest of the features below are completely optional. Add them only as your app needs them.

## Create several hotkeys

When a component needs multiple shortcuts, create them together with `createHotkeys`:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
  ])

  return <textarea />
}
```

`createHotkeys` also accepts an accessor that returns the array, so the list can come from a signal or a store and change length over time.

## Sequences

Pass an array of chords to create a multi-step sequence, pressed one after another:

```tsx
createHotkey(['G', 'G'], () => scrollToTop())
```

By default, each step must follow the previous one within 1 second. `createHotkeys` accepts chords and sequences in the same array:

```tsx
createHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Format a shortcut for buttons, menus, or tooltips with `createFormatForDisplay`. Formatting the same binding that is registered keeps the label in sync:

```tsx
import { createFormatForDisplay, createHotkey } from '@tanstack/solid-hotkeys'
import type { HotkeyChord } from '@tanstack/solid-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() {
  createHotkey(saveHotkey, () => save())
  const formatForDisplay = createFormatForDisplay()

  return (
    <button onClick={save}>
      Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
    </button>
  )
}
```

This renders `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` type-checks the string so typos fail at compile time. Use `Hotkey` if a value can also be a sequence.

In server-rendered apps like SolidStart or TanStack Start, pass the request's platform to `HotkeysProvider` so server HTML matches the client without hydration errors. See [SSR & Hydration](./guides/ssr).

## Hotkeys follow your components

Hotkeys register when the calling component runs and unregister when Solid disposes it. Put each shortcut in the component it belongs to so it's only active while rendered:

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

For conditions independent of rendering, pass options as an accessor so they follow signals:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

When a whole group of shortcuts should toggle together, use a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

Hotkeys listen on `document` by default. To restrict a shortcut to a single element, keep the element in a signal and pass it as `target`:

```tsx
import { createSignal } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabindex={0}>
      ...
    </div>
  )
}
```

A `null` target waits until the element is attached. Element hotkeys only fire while the element or a descendant has focus. Add `tabindex={0}` if the container isn't focusable.

For an element inside `<Show>` or `<For>`, put the element and its `createHotkey` call in their own component, like `Panel` above. The hotkey unregisters when Solid removes the component. See [Elements that are removed](./guides/hotkeys#elements-that-are-removed) for details.

## Add providers and scopes (optional)

Without a provider, hotkeys use the built-in defaults and belong to the `'global'` scope.

To change default options across your app, add `HotkeysProvider` at the root:

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

Nest `HotkeysProvider` with a `scope` deeper in your tree to group shortcuts together. Marking a scope `exclusive` suspends every other scope while it's rendered, which works well for modals and confirmation dialogs:

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

While the dialog is open, `Enter` and `Escape` belong exclusively to it, and background shortcuts pause until it closes.

> [!NOTE]
> Primitives read the nearest provider *above* the component calling them, so create the dialog's hotkeys inside a child of its `HotkeysProvider`.

See [HotkeysProvider & Scopes](./guides/hotkeys-provider-and-scopes) for nested scope precedence and toggling scopes via `enabled`.

## Next steps

Core guides:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [HotkeysProvider & Scopes](./guides/hotkeys-provider-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [Devtools](../../devtools): inspect registered hotkeys, scopes, and held keys while you develop

App Hotkeys & UI:

- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Cheat Sheets](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers
- [Held Keys](./guides/held-key-state-helpers): show which keys are held

Advanced & Integration:

- [SSR & Hydration](./guides/ssr): server-render platform labels without hydration mismatches
- [Keyboard Layouts](./guides/keyboard-layouts): type-check keys from international layouts
- [Testing](./guides/testing): reset singleton state and fix the target platform in unit tests
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
