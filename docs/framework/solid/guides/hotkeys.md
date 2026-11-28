---
title: Register Hotkeys with createHotkey and createHotkeys in Solid
id: hotkeys
description: Register keyboard shortcuts in Solid with createHotkey and createHotkeys. Write chords and sequences, set reactive options, turn hotkeys on and off, and listen on one element.
---

`createHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `createHotkeys` registers several. Both primitives take the same hotkeys and options. To register hotkeys outside Solid components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```tsx
createHotkey('Mod+K', () => openSearch()) // Mod and K together
createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every primitive and option in this guide accepts both kinds. See [Sequences](./sequences) for sequence rules such as timeouts and overlapping prefixes.

## Register a hotkey

Pass a hotkey and callback to `createHotkey`:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

Callbacks receive the `KeyboardEvent` and a context object:

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

This pattern wires up user-chosen shortcuts from the [hotkey recorder](./custom-hotkey-recording) or centralized [App Hotkeys](./app-hotkeys).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which works well for optional shortcut props. Switching to a falsy value unregisters the hotkey and hides any hints. Passing a valid hotkey again registers it again.

To keep the shortcut visible in devtools and cheat sheets while paused, leave the hotkey defined and pass `enabled: false` instead.

### Register after an `await`

A hotkey unregisters when the component or reactive scope that created it is cleaned up. Solid knows that scope only while the component is being created, so call `createHotkey` directly in the component, not after an `await` or in a timer. A hotkey created there has no owner, and it keeps firing after the component unmounts.

When the hotkey needs something that loads later, register it right away, read the loaded value in the callback, and keep the hotkey disabled until the value is there. A disabled hotkey leaves the key to the browser:

```tsx
import { createResource } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  const [commands] = createResource(loadCommands)

  createHotkey(
    'Mod+S',
    () => commands()?.save(),
    () => ({ enabled: !!commands() }),
  )

  return <textarea />
}
```

To create a hotkey later, capture `getOwner()` while the component is created and make the call inside `runWithOwner`. Skip the call if the component was already cleaned up.

### Write a chord as a string or an object

Most chords are written as strings, giving you editor autocomplete and compile-time validation:

```tsx
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // Physical W position, regardless of layout

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod must come first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod already maps to Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./keyboard-layouts).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```tsx
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding().key, mod: binding().mod, shift: binding().shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```tsx
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Internally, TanStack Hotkeys normalizes objects to canonical strings, so `context.hotkey` and devtools report `'Mod+Shift+S'` for `{ key: 'S', mod: true, shift: true }`. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) for more on physical codes like `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter even while focused in a text input
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](../../../guides/sensible-defaults.md#component-libraries-that-handle-the-same-keys). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | Nearest provider's scope | The [scope](./hotkeys-provider-and-scopes) this hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

See [Sensible Defaults](../../../guides/sensible-defaults.md) for why each default behaves the way it does, and [`CreateHotkeyOptions`](../reference/type-aliases/CreateHotkeyOptions.md) for full type definitions.

To change defaults across your app, pass `defaultOptions` to a root `HotkeysProvider`. Options passed to a primitive always override provider defaults:

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

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-provider-and-scopes) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```tsx
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

When setting defaults across many hotkeys via `HotkeysProvider` or `createHotkeys` shared options, `requireReset` applies only to chords and `timeout` applies only to sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only options common to both kinds are accepted.

## Register multiple hotkeys

Use `createHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share the same array, and each item's `options` are still typed against its specific `hotkey`. Inside `createHotkeys`, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

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

Pass shared options as the second argument. Individual definitions override them:

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

  return <div ref={setEditor} contenteditable />
}
```

Options merge in layers: provider defaults first, then shared `createHotkeys` options, then per-item options.

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

`createHotkeys` diffs the array by index and hotkey each time it changes. It adds new items, removes deleted ones, and re-registers any items whose position changed.

## Enable and disable hotkeys

When a shortcut belongs to conditional UI like a modal, keep the hotkey inside that component so rendering and disposal handle registration automatically.

```tsx
function SettingsDialog(props: { onClose: () => void }) {
  // Registered only while the dialog is rendered
  createHotkey('Escape', () => props.onClose())

  return <div role="dialog">...</div>
}
```

For state conditions while the component stays rendered, pass `enabled` from an accessor:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

Toggling `enabled` keeps the hotkey registered and visible in devtools without re-registering listeners. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```tsx
createHotkey('Mod+S', () => save(), () => ({
  enabled: hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

When a `<Loading>` boundary shows its fallback again, the content it hid stays mounted, so its hotkeys keep firing. Solid gives the adapter no signal for this. If those hotkeys shouldn't run while the fallback shows, pass `enabled` from the same state that is pending.

> [!NOTE]
> Single-key shortcuts like `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch). To toggle a group of shortcuts together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` on every call.

## Hotkey targets

Hotkeys listen on `document` by default. Pass an element, `document`, or `window` as `target` to scope events to a specific area. Keep the element in a signal, and pass the options as an accessor:

```tsx
import { createSignal } from 'solid-js'

function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)

  // Fires only while the panel (or something inside it) has focus
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))

  return (
    <div ref={setPanel} tabindex={0}>
      Panel content
    </div>
  )
}
```

> [!NOTE]
> An element only receives key events while it or a descendant has focus. Add `tabindex={0}` if the target isn't natively focusable.

Passing `null` or `undefined` registers nothing until the element is attached. Only omitting `target`, or passing `target: document` explicitly, listens on `document`, so a wrapper that forwards an unset `target` waits too.

When focus is inside a target element, its hotkeys run before `document` hotkeys. With the default `stopPropagation: true`, `document` hotkeys for the same key won't fire. Sequences with a `target` advance only on key presses inside that target.

### Elements that are removed

For an element inside `<Show>`, `<For>`, or another control flow that removes it, put the element and its `createHotkey` call in their own component. A `ref` callback runs outside the component's owner, so don't call `createHotkey` there:

```tsx
import { Show, createSignal } from 'solid-js'

function PanelBody() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)
  createHotkey('Escape', () => closePanel(), () => ({ target: panel() }))
  return (
    <div ref={setPanel} tabindex={0}>
      Panel content
    </div>
  )
}

function Panel(props: { open: boolean }) {
  return (
    <Show when={props.open}>
      <PanelBody />
    </Show>
  )
}
```

The hotkey registers each time `<Show>` creates `PanelBody`, and unregisters when Solid removes it.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-provider-and-scopes#scopes-and-targets) are active regardless of focus.

A single hotkey can use both.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks (`Mod+S` and `Meta+S` are identical on macOS). Customize this with `conflictBehavior`:

- `'warn'` (default) logs a dev warning and keeps both registrations
- `'error'` throws an error
- `'allow'` keeps both silently

Two sequences conflict only when all steps match (`['G', 'H']` and `['G', 'S']` do not). Registrations in different [scopes](./hotkeys-provider-and-scopes) don't conflict either. When both are active, the [higher-precedence scope](./hotkeys-provider-and-scopes#nested-scopes-win) wins for overlapping chords and for a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```tsx
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no runtime effect on key matching. It appears in devtools and feeds UI lists like help dialogs. See [Cheat Sheets](./cheat-sheet-ui-helpers).
