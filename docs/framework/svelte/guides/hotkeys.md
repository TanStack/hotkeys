---
title: Hotkeys Guide
id: hotkeys
---

Use `createHotkey` for global shortcuts and `createHotkeyAttachment` for element-scoped shortcuts. The common global case stays simple, and scoped behavior feels native to Svelte 5.

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

Use the `getHotkeyRegistrations` function to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```svelte
<script lang="ts">
  import { getHotkeyRegistrations, formatForDisplay } from '@tanstack/svelte-hotkeys'

  const registrations = getHotkeyRegistrations()
</script>

<div>
  <h2>Keyboard Shortcuts</h2>
  <ul>
    {#each registrations.hotkeys as reg (reg.hotkey)}
      <li>
        <kbd>{formatForDisplay(reg.hotkey)}</kbd>
        {#if reg.options.meta?.name}
          <span> — {reg.options.meta.name}</span>
        {/if}
        {#if reg.options.meta?.description}
          <p>{reg.options.meta.description}</p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if registrations.sequences.length > 0}
    <h2>Sequences</h2>
    <ul>
      {#each registrations.sequences as reg (reg.sequence.join(' '))}
        <li>
          <kbd>{reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
          {#if reg.options.meta?.name}
            <span> — {reg.options.meta.name}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

The returned object contains a `hotkeys` array with registration objects including the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

## The hotkey manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
