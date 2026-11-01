---
title: Register Hotkeys with createHotkey and createHotkeys in Solid
id: hotkeys
description: Register keyboard shortcuts in Solid with createHotkey and createHotkeys. Write chords and sequences, set reactive options, turn hotkeys on and off, and listen on one element.
---

`createHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `createHotkeys` registers several. Both primitives take the same hotkeys and options. To register hotkeys outside Solid components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is one of two kinds:

- A **chord** is keys pressed together, such as `'Mod+S'`, or a single key, such as `'Escape'`.
- A **sequence** is chords pressed one after another, such as `['G', 'H']`. Write it as an array of chords.

```tsx
createHotkey('Mod+K', () => openSearch()) // Mod and K together
createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every primitive and option in this guide accepts both kinds, and most examples use chords. [Sequences](./sequences) covers how sequences match, the time allowed between steps, and sequences that start with the same chord.

## Register a hotkey

Call `createHotkey` with a hotkey and a callback:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

The callback receives the `KeyboardEvent` and a context object:

```tsx
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

Solid runs a component once, and the callback reads signals and props when it runs, so it always sees their current values:

```tsx
import { createSignal } from 'solid-js'

function Counter() {
  const [count, setCount] = createSignal(0)

  // Logs the current count, not the count from the first render
  createHotkey('Mod+Shift+C', () => console.log(count()))

  return <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
}
```

The hotkey and its options can change too. Pass them as accessors, and the primitive follows the signals and props they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```tsx
function Editor(props: EditorProps) {
  createHotkey(
    () => props.saveHotkey,
    () => save(),
    () => ({ enabled: !props.readOnly }),
  )

  return <textarea />
}
```

A plain options object is read once, so `{ enabled: !props.readOnly }` keeps the value from when the component ran. An object with getters, such as `{ get enabled() { return !props.readOnly } }`, follows changes like an accessor does.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Optional hotkeys

A hotkey of `undefined`, `null`, or `''` registers nothing, so a component can take an optional shortcut. When the hotkey changes to one of these values, its registration is removed. When it changes back to a hotkey, it registers again. Hints for no hotkey are hidden.

To keep a hotkey registered, and listed in devtools and cheat sheets, but stop it from firing, set `enabled: false` instead.

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```tsx
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```tsx
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding().key, mod: binding().mod, shift: binding().shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```tsx
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The primitive registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter, even while focus is in a text field
createHotkey('Enter', () => submit(), { ignoreInputs: false })
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

The defaults suit most hotkeys. [Sensible Defaults](../../../guides/sensible-defaults.md) explains why each one was chosen and when to change it. The [`CreateHotkeyOptions` reference](../reference/type-aliases/CreateHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, pass `defaultOptions` to a `HotkeysProvider` at the root. Options passed to a primitive override the provider's defaults:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. See [HotkeysProvider and Scopes](./hotkeys-provider-and-scopes) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```tsx
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provider defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the primitive accepts only the options that both kinds share.

## Register multiple hotkeys

When a component has more than one hotkey, use `createHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `createHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```tsx
createHotkeys([
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
import { createSignal } from 'solid-js'

function RichTextEditor() {
  const [editor, setEditor] = createSignal<HTMLDivElement | null>(null)

  createHotkeys(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      {
        hotkey: 'Mod+Z',
        callback: () => undo(),
        options: { get enabled() { return canUndo() } },
      },
    ],
    () => ({ target: editor() }),
  )

  return <div ref={setEditor} contentEditable />
}
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets.

Options merge in this order: provider defaults, then the shared options, then each definition's options.

### Build the list from data

A component runs once, so a plain array never changes after it registers. Pass an accessor for any list whose length can change:

```tsx
function MenuShortcuts(props: { items: Array<MenuItem> }) {
  createHotkeys(() =>
    props.items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )

  return <menu>...</menu>
}
```

The primitive compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```tsx
function SettingsDialog(props: { onClose: () => void }) {
  // Registered only while the dialog is mounted
  createHotkey('Escape', () => props.onClose())

  return <div role="dialog">...</div>
}
```

For a condition that doesn't match a component, pass `enabled` from an accessor:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

A disabled hotkey stays registered, so devtools still list it, and changing `enabled` doesn't register it again. While disabled, it ignores key presses, so pressing `Mod+S` opens the browser's Save dialog. To keep the dialog closed, set `preventDefault: 'always'`:

```tsx
createHotkey('Mod+S', () => save(), () => ({
  enabled: hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

With `'always'`, a hotkey that can't fire, because it's disabled or its scope is inactive or suspended, still prevents the browser's action. It doesn't stop propagation, and when another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. To apply it to every hotkey, set it in the default options. We recommend it for most hotkeys, but not for hotkeys you turn off to hand the key back to the browser, such as `Mod+C` or `Tab`. See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone).

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

When a group of hotkeys turns on and off together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays mounted, or suspend the rest of the page while a dialog is open.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Keep the element in a signal, and pass the options as an accessor:

```tsx
import { createSignal } from 'solid-js'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel, or something inside it, has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabIndex={0}>
      Panel content
    </div>
  )
}
```

A `null` target waits until the element is attached.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabIndex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### Elements that are removed

Solid doesn't call a `ref` with `null` when it removes an element, so a signal set by `ref` keeps the removed element, and the hotkey stays registered on it until the component unmounts. Keep the signal for an element the component always renders.

For an element inside `<Show>`, `<For>`, or another control flow that removes it, call `createHotkey` in the element's `ref` callback:

```tsx
import { Show } from 'solid-js'

function Panel(props: { open: boolean }) {
  return (
    <Show when={props.open}>
      <div
        ref={(el) => createHotkey('Escape', () => closePanel(), { target: el })}
        tabIndex={0}
      >
        Panel content
      </div>
    </Show>
  )
}
```

The `ref` callback runs inside the branch that renders the element. So the hotkey registers each time the element is created, and unregisters when Solid removes it.

### A target is not a scope

A target and a [scope](./hotkeys-provider-and-scopes) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.

## Handle duplicate hotkeys

When you register a hotkey that is already registered on the same target, in the same scope, and for the same event type, TanStack Hotkeys logs a warning in development, and both callbacks run. Set `conflictBehavior` to change that:

- `'warn'` (default) logs a warning in development and keeps both registrations.
- `'error'` throws an error.
- `'replace'` unregisters the existing registration.
- `'allow'` keeps both without a warning.

The comparison resolves modifiers first, so `Mod+S` and `Meta+S` are duplicates on macOS. Two sequences are duplicates when all their steps match. Sequences that only start with the same chord, such as `['G', 'H']` and `['G', 'S']`, are not duplicates.

The same hotkey in two different [scopes](./hotkeys-provider-and-scopes) is not a duplicate either. When both scopes are active, the scope with higher precedence handles the key. See [Nested scopes win](./hotkeys-provider-and-scopes#nested-scopes-win).

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```tsx
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. Devtools show it, and you can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
