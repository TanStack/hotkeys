---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to a Svelte app with TanStack Hotkeys. Create hotkeys, show them in your UI, and group them into scopes.
---

This guide adds keyboard shortcuts to a Svelte app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Create a hotkey

TanStack Hotkeys needs no special setup. To create a keyboard shortcut, call `createHotkey` in the component that owns the action:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => saveDocument())
</script>

<textarea></textarea>
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Create several hotkeys

When a component has more than one hotkey, create them together with `createHotkeys`:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])
</script>
```

`createHotkeys` also accepts a getter that returns the array, so the list can come from `$state` and change length over time.

## Sequences

Pass an array of chords to create a sequence, pressed one after another:

```ts
createHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`createHotkeys` accepts chords and sequences in the same array:

```ts
createHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```svelte
<script lang="ts">
  import { createHotkey, formatForDisplay } from '@tanstack/svelte-hotkeys'
  import type { HotkeyChord } from '@tanstack/svelte-hotkeys'

  const saveHotkey: HotkeyChord = 'Mod+S'

  createHotkey(saveHotkey, () => save())
</script>

<button onclick={save}>
  Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
</button>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that creates it mounts, and unregistered when that component is destroyed. Put each hotkey in the component it belongs to, so it is active only while that component is mounted:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import SettingsDialog from './SettingsDialog.svelte'

  let isOpen = $state(false)
</script>

<button onclick={() => (isOpen = true)}>Settings</button>
{#if isOpen}
  <SettingsDialog onClose={() => (isOpen = false)} />
{/if}
```

```svelte
<!-- SettingsDialog.svelte -->
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let { onClose }: { onClose: () => void } = $props()

  // Registered only while the dialog is mounted
  createHotkey('Escape', () => onClose())
</script>

<div role="dialog">...</div>
```

For a condition that doesn't match a component, pass `enabled`. Pass options as a getter, so they follow your state:

```ts
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges }))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, create an attachment and attach it to that element:

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  // Fires only while the panel, or something inside it, has focus
  const closeOnEscape = createHotkeyAttachment('Escape', () => closePanel())
</script>

<div tabindex="0" {@attach closeOnEscape}>...</div>
```

`createHotkeysAttachment` does the same for an array of hotkeys. The element must be focusable to receive key presses, so give it a `tabindex` if it isn't a control.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component is mounted. You don't need a provider for that.

Wrap your app in `HotkeysProvider` to set default options for every hotkey inside it, such as more time between sequence steps:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import Editor from './Editor.svelte'
</script>

<HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
  <Editor />
</HotkeysProvider>
```

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is mounted, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

A component can make itself a scope with `setHotkeysContext`. Call it before creating the component's hotkeys:

```svelte
<!-- ConfirmDialog.svelte -->
<script lang="ts">
  import { createHotkeys, setHotkeysContext } from '@tanstack/svelte-hotkeys'

  let { onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void } =
    $props()

  setHotkeysContext({ scope: 'confirm-dialog', exclusive: true })

  createHotkeys([
    { hotkey: 'Enter', callback: () => onConfirm() },
    { hotkey: 'Escape', callback: () => onCancel() },
  ])
</script>

<div role="dialog">...</div>
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

`setHotkeysContext` reads its options once. When `enabled` or `exclusive` needs to change over time, wrap the component in `<HotkeysProvider scope="..." exclusive>` instead. [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes) covers nested scopes, precedence, and turning a scope off without destroying it.

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
