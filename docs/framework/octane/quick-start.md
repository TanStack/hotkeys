---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to an Octane app with TanStack Hotkeys. Register hotkeys, show them in your UI, and group them with scoped providers.
---

This guide adds keyboard shortcuts to an Octane app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

TanStack Hotkeys needs no setup or provider to start. Call `useHotkey` in the component that owns the action:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

`Mod` resolves to Command on macOS and Control on Windows and Linux. Out of the box, the browser's Save dialog stays closed, and `Mod+S` still fires while typing inside the `<textarea>`. See [Sensible Defaults](../../guides/sensible-defaults) to learn how every default works.

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

A custom hook in a plain `.ts` or `.js` file needs the compiler too. Start the file with `/** @jsxImportSource octane */`, or import a value such as `useState` from `octane`. Otherwise every such call to the same hook in a component shares one slot, and only the last one works. See [Custom hooks](./guides/hotkeys#custom-hooks).

Providers, scopes, and the rest of the features below are completely optional. Add them only as your app needs them.

## Register several hotkeys

When a component needs multiple shortcuts, register them together with `useHotkeys`:

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

Because `useHotkeys` takes an array, the list can come from dynamic data and change length between renders, unlike calling `useHotkey` in a loop.

## Sequences

Pass an array of chords to register a multi-step sequence, pressed one after another:

```tsx
useHotkey(['G', 'G'], () => scrollToTop())
```

By default, each step must follow the previous one within 1 second. `useHotkeys` accepts chords and sequences in the same array:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Format a shortcut for buttons, menus, or tooltips with `useFormatForDisplay`. Passing the same binding you register guarantees the label always stays in sync:

```tsx
import { useFormatForDisplay, useHotkey } from '@tanstack/octane-hotkeys'
import type { HotkeyChord } from '@tanstack/octane-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() @{
  useHotkey(saveHotkey, () => save())
  const formatForDisplay = useFormatForDisplay()

  <button onClick={save}>
    Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
  </button>
}
```

This renders `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` type-checks the string so typos fail at compile time. Use `Hotkey` if a value can also be a sequence.

In server-rendered apps like TanStack Start or Astro, pass the request's platform to `HotkeysProvider` so server HTML matches the client without hydration errors. See [SSR & Hydration](./guides/ssr).

## Hotkeys follow your components

Hotkeys register when the calling component mounts and unregister when it unmounts. Put each shortcut in the component it belongs to so it's only active while rendered:

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
  // Active only while the dialog is open
  useHotkey('Escape', onClose)

  <div role="dialog">...</div>
}
```

For conditions independent of mounting, pass `enabled`:

```tsx
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

When a whole group of shortcuts should toggle together, use a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

Hotkeys listen on `document` by default. To restrict a shortcut to a single element, pass a ref as `target`:

```tsx
import { useRef } from 'octane'
import { useHotkey } from '@tanstack/octane-hotkeys'

function Panel() @{
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  <div ref={panelRef} tabIndex={0}>...</div>
}
```

Element hotkeys only fire while the element or a descendant has focus. Add `tabIndex={0}` if the container isn't focusable.

`useRef` works when the element renders with the component. If the target mounts later, such as inside a conditionally rendered child, store it in `useState` via a callback ref instead:

```tsx
import { useState } from 'octane'

function Sidebar() @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Escape', () => closePanel(), { target: panel })

  <CollapsiblePanel panelRef={setPanel} />
}
```

See [Elements that mount later](./guides/hotkeys#elements-that-mount-later) for details.

## Add providers and scopes (optional)

Without a provider, hotkeys use the built-in defaults and belong to the `'global'` scope.

To change default options across your app, add `HotkeysProvider` at the root:

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

function Root() @{
  <HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
    <App />
  </HotkeysProvider>
}
```

Nest `HotkeysProvider` with a `scope` deeper in your tree to group shortcuts together. Marking a scope `exclusive` suspends every other scope while it's mounted, which works well for modals and confirmation dialogs:

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

While the dialog is open, `Enter` and `Escape` belong exclusively to it, and background shortcuts pause until it closes.

> [!NOTE]
> Hooks read the nearest provider *above* the component calling them, so register the dialog's hotkeys inside a child of its `HotkeysProvider`.

See [HotkeysProvider & Scopes](./guides/hotkeys-provider-and-scopes) for nested scope precedence and toggling scopes via `enabled`.

## Next steps

Core guides:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [HotkeysProvider & Scopes](./guides/hotkeys-provider-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs

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
