---
title: Hotkeys Guide
id: hotkeys
---

Use `createHotkey` for global shortcuts and `createHotkeyAttachment` for element-scoped shortcuts. The common global case stays simple, and scoped behavior feels native to Svelte 5.

## Chords and sequences

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both, and a one-step array such as `['Mod+S']` is the chord `'Mod+S'`.

```ts
createHotkey('Mod+S', () => save()) // chord
createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 }) // sequence
createHotkey('Escape', () => close(), { requireReset: true }) // chord-only option
```

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences, and TypeScript rejects options that don't match the hotkey. When the kind isn't known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted. Defaults apply only to the kinds that support them. See the [Sequences Guide](./sequences) for timing and matching, and the [App Hotkeys Guide](./app-hotkeys) to declare hotkeys up front and let users customize them.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.

## Global hotkeys

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    saveDocument()
  })
</script>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

## Scoped hotkeys

Use attachments instead of capturing an element ref just to pass it back into the API.

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  const closePanel = createHotkeyAttachment('Escape', () => {
    close()
  })
</script>

<div tabindex="0" {@attach closePanel}>Panel content</div>
```

## Reactive inputs

Hotkeys can take plain values for static registrations or getter functions when the hotkey or options depend on reactive state.

### Reactive `enabled`

When `enabled` is false, the hotkey stays registered (visible in devtools); only the callback is suppressed.

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isEditing = $state(false)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isEditing }),
  )
</script>
```

### Reactive hotkey values

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let shortcut = $state('Mod+S')

  createHotkey(
    () => shortcut,
    () => save(),
  )
</script>
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Property getters

Property getters and functions returning an options object are both supported. Read reactive state inside the getter. A plain value such as `{ enabled: currentValue }` captures the value when that object is created.

The adapter reads option properties inside its reactive computation and updates registrations automatically. Callbacks such as `onRecord` and `onCancel` remain functions; the adapter does not call them to resolve options. Tracking is shallow; callback bodies and nested objects are not evaluated to discover dependencies. Keep getters free of side effects. Ordinary option changes preserve registration identity. Changing the target moves the registration to that target.

```svelte
<script lang="ts">
	import { createHotkey } from '@tanstack/svelte-hotkeys'

	let enabled = $state(true)
	createHotkey('Mod+S', () => console.log('Save'), {
		get enabled() {
			return enabled
		},
	})
</script>

<button onclick={() => enabled = !enabled}>Toggle shortcut</button>
```

You can also pass `() => ({ enabled })`. Svelte applies registration changes when its effect runs. The same forms work for attachments, common options, per-definition options, sequences, and recorders. `HotkeysProvider` follows replacement `defaultOptions` objects and getters within defaults.

## Capture phase

By default, hotkeys listen during bubbling, after the keyboard handlers of widgets inside the target. A widget that handles a key and stops propagation keeps that key from your hotkeys. Set `capture: true` to run the hotkey before those widgets instead. It applies to `keydown` and `keyup`.

With the default `stopPropagation: true`, a matching capture hotkey also keeps the key from those widgets. Set `stopPropagation: false` to let them handle it too. See [Hotkeys run after the page's own handlers](../../../guides/sensible-defaults.md#hotkeys-run-after-the-pages-own-handlers) for when to use capture.

## Default options

Set defaults explicitly with `setHotkeysContext` when a subtree needs shared behavior:

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkey: {
      preventDefault: false,
      ignoreInputs: false,
    },
  })
</script>
```

## Common options

### `requireReset`

```ts
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

When `ignoreInputs` is enabled, hotkeys also skip keys that a focused control inside their `target` uses itself: `Enter` and `Space` on buttons and `<summary>`, `Enter` on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, and grids. A hotkey targeted at the control itself still receives them, and `ignoreInputs: false` handles every key. See [Focused controls keep their own keys](../../../guides/sensible-defaults.md#focused-controls-keep-their-own-keys) for the full list.

```ts
createHotkey('K', () => openSearch())
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `conflictBehavior`

```ts
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

```ts
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Automatic cleanup

Global hotkeys are automatically unregistered when the owning component unmounts. Attachment-based hotkeys clean themselves up when the attached element is removed or when reactive inputs change.

## Registering multiple hotkeys

When you need to register several hotkeys at once, or a dynamic, variable-length list, use `createHotkeys` (plural) for global shortcuts and `createHotkeysAttachment` for element-scoped shortcuts:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
</script>
```

### Common options with per-hotkey overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
createHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic hotkey lists

Pass a getter for reactive arrays:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  let shortcuts = $state([...])

  createHotkeys(
    () => shortcuts.map((s) => ({
      hotkey: s.key,
      callback: s.action,
    })),
  )
</script>
```

### Scoped multi-hotkeys

Use `createHotkeysAttachment` to scope multiple hotkeys to a specific element:

```svelte
<script lang="ts">
  import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'

  const editorKeys = createHotkeysAttachment([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
  ])
</script>

<div tabindex="0" {@attach editorKeys}>Editor content</div>
```

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use the `getHotkeyRegistrations` function to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```svelte
<script lang="ts">
  import { getHotkeyRegistrations, formatForDisplay } from '@tanstack/svelte-hotkeys'

  const registrations = getHotkeyRegistrations()
</script>

<ul>
  {#each registrations.hotkeys as reg (reg.id)}
    <li>
      <kbd>{formatForDisplay(reg.hotkey)}</kbd>
      {#if reg.options.meta?.name}<span> — {reg.options.meta.name}</span>{/if}
      {#if reg.kind === 'sequence'}
        <small>{reg.matchedStepCount}/{reg.hotkey.length} steps</small>
      {/if}
    </li>
  {/each}
</ul>
```

The returned object's reactive `hotkeys` getter holds one array of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./app-hotkeys).

## The hotkey manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
