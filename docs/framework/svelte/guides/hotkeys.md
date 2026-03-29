---
title: Hotkeys Guide
id: hotkeys
---

Use `createHotkey` for global shortcuts and `createHotkeyAttachment` for element-scoped shortcuts. This keeps the common global case simple while making scoped behavior feel native to Svelte 5.

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

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

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

## Common Options

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

## Automatic Cleanup

Global hotkeys are automatically unregistered when the owning component unmounts. Attachment-based hotkeys clean themselves up when the attached element is removed or when reactive inputs change.

## Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use `createHotkeys` (plural) for global shortcuts and `createHotkeysAttachment` for element-scoped shortcuts:

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

### Common Options with Per-Hotkey Overrides

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

### Dynamic Hotkey Lists

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

### Scoped Multi-Hotkeys

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

## Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

## Introspecting Registrations

Use the `getHotkeyRegistrations` function to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```svelte
<script lang="ts">
  import { getHotkeyRegistrations } from '@tanstack/svelte-hotkeys'

  const registrations = getHotkeyRegistrations()
</script>

<div>
  <h2>Keyboard Shortcuts</h2>
  <ul>
    {#each registrations.hotkeys as reg (reg.hotkey)}
      <li>
        <kbd>{reg.hotkey}</kbd>
        {#if reg.meta?.name}
          <span> — {reg.meta.name}</span>
        {/if}
        {#if reg.meta?.description}
          <p>{reg.meta.description}</p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if registrations.sequences.length > 0}
    <h2>Sequences</h2>
    <ul>
      {#each registrations.sequences as reg (reg.sequence.join(' '))}
        <li>
          <kbd>{reg.sequence.join(' → ')}</kbd>
          {#if reg.meta?.name}
            <span> — {reg.meta.name}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

The returned object contains a `hotkeys` array with registration objects including the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

## The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
