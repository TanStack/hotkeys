---
title: Register Hotkeys with useHotkey and useHotkeys in Vue
id: hotkeys
description: Register keyboard shortcuts in Vue with useHotkey and useHotkeys. Write chords and sequences, set reactive options, turn hotkeys on and off, and listen on one element.
---

`useHotkey` registers a keyboard shortcut while the component that calls it is mounted, and `useHotkeys` registers several. Both composables take the same hotkeys and options. To register hotkeys outside Vue components, use the [hotkey manager](./hotkey-manager).

## Chords and sequences

A hotkey is either a chord or a sequence:

- **Chord.** Keys pressed together (such as `'Mod+S'`) or a single key (such as `'Escape'`).
- **Sequence.** Chords pressed one after another (such as `['G', 'H']`), written as an array.

```ts
useHotkey('Mod+K', () => openSearch()) // Mod and K together
useHotkey(['G', 'H'], () => goHome()) // G, then H
```

Every function and option in this guide accepts both. See [Sequences](./sequences) for sequence rules such as timeouts and overlapping prefixes.

## Register a hotkey

Pass a hotkey and callback to `useHotkey` in a component's `setup`:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <textarea />
</template>
```

Callbacks receive the `KeyboardEvent` and a context object:

```ts
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

`setup` runs once, and the callback reads refs and props when it runs, so it always sees their current values:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const count = ref(0)

// Logs the current count, not the count when the component was created
useHotkey('Mod+Shift+C', () => console.log(count.value))
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

The hotkey and its options can change too. Pass them as getters or refs, and the composable follows them. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const props = defineProps<{ saveHotkey: Hotkey; readOnly: boolean }>()

useHotkey(
  () => props.saveHotkey,
  () => save(),
  () => ({ enabled: !props.readOnly }),
)
</script>
```

A plain options object is read once, so `{ enabled: !props.readOnly }` keeps the value from when `setup` ran. A ref also works for a single option, such as `{ enabled: isEditing }`.

Give a ref that holds a hotkey the `Hotkey` type: `const saveHotkey = ref<Hotkey>('Mod+S')`. Without it, the ref is a `Ref<string>`, and `useHotkey` accepts only valid hotkeys.

That makes it straightforward to register a hotkey the user chose, such as one from the [hotkey recorder](./custom-hotkey-recording). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./app-hotkeys).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which suits optional shortcut props. Switching to one of these values unregisters the hotkey and hides its hints. Passing a valid hotkey again registers it again.

To keep the hotkey registered, visible in devtools and cheat sheets, but paused, leave it defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, which gives you editor autocomplete and compile-time validation:

```ts
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./keyboard-layouts).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```ts
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  () => ({ key: binding.value.key, mod: binding.value.mod, shift: binding.value.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```ts
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The composable registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead) explains codes such as `[KeyW]`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
useHotkey('Enter', () => submit(), { ignoreInputs: false })
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
| `scope` | The nearest provider's scope | The [scope](./hotkeys-provider-and-scopes) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](#describe-hotkeys-with-meta). |

See [Sensible Defaults](../../../guides/sensible-defaults.md) for why each default behaves the way it does, and the [`UseHotkeyOptions` reference](../reference/type-aliases/UseHotkeyOptions.md) for type definitions.

To change a default for every hotkey in your app, wrap it in a `HotkeysProvider` with `default-options`. Options passed to a composable override the provider's defaults:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{ hotkey: { requireReset: true, timeout: 1500 } }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-provider-and-scopes) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.

## Register multiple hotkeys

Use `useHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Enter', callback: () => publish() },
  { hotkey: 'Mod+D', callback: () => duplicate() },
  { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
])
</script>
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```ts
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

Pass shared options as the second argument. Individual definitions override them:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkeys } from '@tanstack/vue-hotkeys'

const editor = ref<HTMLDivElement | null>(null)

useHotkeys(
  [
    { hotkey: 'Mod+B', callback: () => toggleBold() },
    { hotkey: 'Mod+I', callback: () => toggleItalic() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: canUndo } },
  ],
  { target: editor },
)
</script>

<template>
  <div ref="editor" contenteditable />
</template>
```

The shared `target` makes every hotkey in the list listen on the editor only. [Hotkey targets](#hotkey-targets) explains targets.

Options merge in layers: defaults from the provider first, then the shared options, then per-item options.

### Build the list from data

`setup` runs once, so a plain array never changes after it registers. Pass a getter or a computed ref for any list whose length can change:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

const props = defineProps<{ items: Array<MenuItem> }>()

useHotkeys(() =>
  props.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
)
</script>
```

The composable compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```vue
<!-- SettingsDialog.vue -->
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

const emit = defineEmits<{ close: [] }>()

// Registered only while the dialog is mounted
useHotkey('Escape', () => emit('close'))
</script>

<template>
  <div role="dialog">...</div>
</template>
```

For a condition that doesn't match a component, pass `enabled` as a ref or a getter:

```ts
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```ts
useHotkey('Mod+S', () => save(), {
  enabled: hasUnsavedChanges,
  preventDefault: 'always',
})
```

See [Hotkeys that can't fire leave the key alone](../../../guides/sensible-defaults.md#hotkeys-that-cant-fire-leave-the-key-alone) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts such as `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch). To toggle a group of shortcuts together, use [scopes](./hotkeys-provider-and-scopes) instead of passing `enabled` to each hotkey.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to a template ref, an element, `document`, or `window` to listen somewhere else:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panel = ref<HTMLDivElement | null>(null)

// Fires only while the panel, or something inside it, has focus
useHotkey('Escape', () => closePanel(), { target: panel })
</script>

<template>
  <div ref="panel" tabindex="0">Panel content</div>
</template>
```

A target that is `null` or `undefined` waits until the element is mounted. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

A template ref on a component listens on the component's root element:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import PanelCard from './PanelCard.vue'

const card = useTemplateRef<InstanceType<typeof PanelCard>>('card')

useHotkey('Escape', () => closePanel(), { target: card })
</script>

<template>
  <PanelCard ref="card" tabindex="0" />
</template>
```

The hotkey reads the root element when the ref is set and doesn't follow later changes inside the component. A component whose template has more than one root node, or only text, has no root element, so its hotkey registers nothing. A root element that the component adds or replaces later, such as one behind `v-if`, isn't picked up. Put the ref on an element instead.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

Both limit when a hotkey fires, using different signals:

- **`target`** filters by DOM focus, checking which element received the key event.
- **`scope`** filters by UI state, checking which mounted [provider scopes](./hotkeys-provider-and-scopes#scopes-and-targets) are active regardless of focus.

A single hotkey can use both.

## Handle duplicate hotkeys

Registering the same canonical binding on the same target, scope, and `eventType` logs a console warning in development and runs both callbacks. `Mod+S` and `Meta+S` are identical on macOS. Customize this with `conflictBehavior`:

- `'warn'` (default) logs a development warning and keeps both registrations
- `'error'` throws an error
- `'allow'` keeps both silently

Two sequences conflict only when all steps match, so `['G', 'H']` and `['G', 'S']` do not. Registrations in different [scopes](./hotkeys-provider-and-scopes) don't conflict either. When both are active, the [higher-precedence scope](./hotkeys-provider-and-scopes#nested-scopes-win) wins for overlapping chords and for a sequence that completes in both. Sequences in both scopes still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./cheat-sheet-ui-helpers).
