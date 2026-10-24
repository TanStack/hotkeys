---
title: Register Hotkeys with useHotkey and useHotkeys in Octane
id: hotkeys
description: Register keyboard shortcuts in Octane with useHotkey and useHotkeys. Write chords and sequences, set options, turn hotkeys on and off, and listen on one element.
---

`useHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `useHotkeys` registers several. Both hooks take the same hotkeys and options. To register hotkeys outside Octane components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```tsx
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every hook and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Call `useHotkey` with a hotkey and a callback:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

The callback receives the `KeyboardEvent` and a context object:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The hook reads its arguments after each commit, so the callback can use current props and state:

```tsx
import { useState } from 'octane'

function Counter() @{
  const [count, setCount] = useState(0)

  // Logs the current count, not the count from the first render
  useHotkey('Mod+Shift+C', () => console.log(count))

  <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

The hotkey and its options can change between renders too. When only the options change, the hook updates the existing registration. When the hotkey or its `target` changes, the hook replaces the registration:

```tsx
function Editor({ saveHotkey, readOnly }: EditorProps) @{
  useHotkey(saveHotkey, () => save(), { enabled: !readOnly })

  <textarea />
}
```

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```tsx
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```tsx
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  { key: binding.key, mod: binding.mod, shift: binding.shift },
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```tsx
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The hook registers every chord and sequence step as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter, even while focus is in a text field
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S`. `'always'` also stops it while the hotkey can't fire. |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-provider-and-scopes) the hotkey belongs to |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`UseHotkeyOptions` reference](../reference/type-aliases/UseHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, pass `defaultOptions` to a `HotkeysProvider` at the root. Options passed to a hook override the provider's defaults:

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

function Root() @{
  <HotkeysProvider
    defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
  >
    <App />
  </HotkeysProvider>
}
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. See [HotkeysProvider and Scopes](./hotkeys-provider-and-scopes) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```tsx
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provider defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the hook accepts only the options that both kinds share.

## Register multiple hotkeys

When a component has more than one hotkey, use `useHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```tsx
import { useHotkeys } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  <textarea />
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `useHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```tsx
useHotkeys([
  {
    hotkey: 'Mod+S',
    callback: (event, context) => {
      if (context.kind === 'chord') console.log(context.parsedChord.modifiers)
    },
  },
])
```

### Share options

Pass options for every definition as the second argument. A definition's own options override them:

```tsx
import { useState } from 'octane'

function RichTextEditor() @{
  const [editor, setEditor] = useState<HTMLDivElement | null>(null)

  useHotkeys(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: canUndo } },
    ],
    { target: editor },
  )

  <div ref={setEditor} contentEditable />
}
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets.

Options merge in this order: provider defaults, then the shared options, then each definition's options.

### Build the list from data

Hooks can't run in loops, so use `useHotkeys` for any list whose length can change:

```tsx
function MenuShortcuts({ items }: { items: Array<MenuItem> }) @{
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )

  <menu>...</menu>
}
```

The hook compares the array between renders by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```tsx
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

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses, so pressing `Mod+S` opens the browser's Save dialog. To keep the dialog closed, set `preventDefault: 'always'`:

```tsx
useHotkey('Mod+S', () => save(), {
  enabled: hasUnsavedChanges,
  preventDefault: 'always',
})
```

With `'always'`, a hotkey that can't fire, because it's disabled or its scope is inactive or suspended, still prevents the browser's action. It doesn't stop propagation, and when another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. To apply it to every hotkey, set it in the default options. We recommend it for most hotkeys, but not for hotkeys you turn off to hand the key back to the browser, such as `Mod+C` or `Tab`. See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone).

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays mounted, or suspend the rest of the page while a dialog is open.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Keep the element in state with a callback ref:

```tsx
import { useState } from 'octane'

function Panel() @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  useHotkey('Escape', () => closePanel(), { target: panel })

  <div ref={setPanel} tabIndex={0}>
    Panel content
  </div>
}
```

A target must be an element, not a ref object. A `null` target waits until the element mounts.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabIndex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./hotkeys-provider-and-scopes) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target and in the same scope, TanStack Hotkeys logs a warning, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different [scopes](./hotkeys-provider-and-scopes) is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key. See [Nested scopes win](./hotkeys-provider-and-scopes#nested-scopes-win).

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
