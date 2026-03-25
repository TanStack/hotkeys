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

## The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
