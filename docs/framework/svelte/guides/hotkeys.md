---
title: Register Hotkeys with createHotkey and createHotkeys in Svelte
id: hotkeys
description: Register keyboard shortcuts in Svelte with createHotkey, createHotkeys, and attachments. Write chords and sequences, set reactive options, turn hotkeys on and off, and listen on one element.
---

`createHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `createHotkeys` registers several. For hotkeys that belong to one element, `createHotkeyAttachment` and `createHotkeysAttachment` do the same through `{@attach}`. All four take the same hotkeys and options. To register hotkeys outside Svelte components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
createHotkey('Mod+K', () => openSearch()) // Mod and K together
createHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./sequences) for sequence rules such as timeouts and overlapping prefixes.

## Register a hotkey

Pass a hotkey and callback to `createHotkey` in a component's script:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => saveDocument())
</script>

<textarea></textarea>
```

Callbacks receive the `KeyboardEvent` and a context object:

```ts
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The script runs once, and the callback reads state and props when it runs, so it always sees their current values:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let count = $state(0)

  // Logs the current count, not the count when the component was created
  createHotkey('Mod+Shift+C', () => console.log(count))
</script>

<button onclick={() => count++}>Count: {count}</button>
```

The hotkey and its options can change too. Pass them as getters, and the function follows the state they read. When only the options change, it updates the existing registration. When the hotkey changes, it replaces the registration:

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let { saveHotkey, readOnly }: { saveHotkey: Hotkey; readOnly: boolean } =
    $props()

  createHotkey(
    () => saveHotkey,
    () => save(),
    () => ({ enabled: !readOnly }),
  )
</script>
```

A plain options object is read once, so `{ enabled: !readOnly }` keeps the value from when the script ran. An object with getters, such as `{ get enabled() { return !readOnly } }`, follows changes like a getter function does.

That makes it straightforward to register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which suits optional shortcut props. Switching to one of these values unregisters the hotkey and hides its hints. Passing a valid hotkey again registers it again.

To keep the hotkey registered, visible in devtools and cheat sheets, but paused, leave it defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, which gives you editor autocomplete and compile-time validation:

```ts
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./keyboard-layouts).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```ts
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding.key, mod: binding.mod, shift: binding.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```ts
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The function registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens: `document` or `window`. For an element, use an attachment. See [Hotkey targets](#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](../../../guides/sensible-defaults.md#typing-in-inputs-does-not-trigger-shortcuts). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](../../../guides/sensible-defaults.md#component-libraries-that-handle-the-same-keys). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-provider-and-scopes) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

See [Sensible Defaults](../../../guides/sensible-defaults.md) for why each default behaves the way it does, and the [`CreateHotkeyOptions` reference](../reference/type-aliases/CreateHotkeyOptions.md) for type definitions.

To change a default for every hotkey in your app, wrap it in a `HotkeysProvider` with `defaultOptions`. Options passed to a function override the provider's defaults:

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import Editor from './Editor.svelte'
</script>

<HotkeysProvider
  defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
>
  <Editor />
</HotkeysProvider>
```

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-provider-and-scopes) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.

## Register multiple hotkeys

Use `createHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
</script>
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```ts
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

```svelte
<script lang="ts">
  import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'

  const editorHotkeys = createHotkeysAttachment(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      { hotkey: 'Mod+Z', callback: () => undo(), options: { requireReset: false } },
    ],
    { requireReset: true },
  )
</script>

<div contenteditable {@attach editorHotkeys}></div>
```

The attachment also makes all three hotkeys listen on the editor only. [Hotkey targets](#hotkey-targets) explains attachments.

Options merge in three layers: defaults from the provider first, then the shared options, then per-item options.

### Build the list from data

The script runs once, so a plain array never changes after it registers. Pass a getter for any list whose length can change:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  let { items }: { items: Array<MenuItem> } = $props()

  createHotkeys(() =>
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
</script>
```

The function compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

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

For a condition that doesn't match a component, pass `enabled` from a getter:

```ts
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges }))
```

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```ts
createHotkey('Mod+S', () => save(), () => ({
  enabled: hasUnsavedChanges,
  preventDefault: 'always',
}))
```

See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts such as `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch). To toggle a group of shortcuts together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` to each hotkey.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. `createHotkey` and `createHotkeys` also accept `target: window`. To listen on an element, create an attachment and attach it to that element:

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  // Fires only while the panel, or something inside it, has focus
  const closeOnEscape = createHotkeyAttachment('Escape', () => closePanel())
</script>

<div tabindex="0" {@attach closeOnEscape}>Panel content</div>
```

The attachment registers the hotkey when the element mounts and unregisters it when the element is removed. `createHotkeysAttachment` does the same for an array of hotkeys.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence on an element advances only on key presses inside the element.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-provider-and-scopes#scopes-and-targets) are active regardless of focus.

A single hotkey can use both.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks. `Mod+S` and `Meta+S` are identical on macOS. Customize this with `conflictBehavior`:

- `'warn'` (default) logs a development warning and keeps both registrations
- `'error'` throws an error
- `'replace'` unregisters the earlier registration
- `'allow'` keeps both silently

Two sequences conflict only when all steps match, so `['G', 'H']` and `['G', 'S']` do not. Registrations in different [scopes](./hotkeys-provider-and-scopes) don't conflict either. When both are active, the [higher-precedence scope](./hotkeys-provider-and-scopes#nested-scopes-win) wins for overlapping chords, whereas matching sequences in active scopes advance and fire independently unless suspended by an `exclusive` scope.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./cheat-sheet-ui-helpers).
