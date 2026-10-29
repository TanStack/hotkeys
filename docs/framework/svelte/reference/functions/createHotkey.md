---
id: createHotkey
title: createHotkey
---

## Call Signature

```ts
function createHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L66)

Svelte function for registering a hotkey on the document: a chord such as
`'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
`defineAppHotkeys`. Pass getters for reactive values. Use
`createHotkeyAttachment` for element-scoped hotkeys.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeGetter`\<`T`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeGetter`\<[`CreateAppHotkeyOptions`](../type-aliases/CreateAppHotkeyOptions.md)\<`T`\>\>

### Returns

`void`

### Example

```svelte
<script lang="ts">
  createHotkey('Mod+S', () => save())
  createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
  createHotkey('Escape', () => close(), () => ({ enabled: isOpen }))
</script>
```

## Call Signature

```ts
function createHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L71)

Svelte function for registering a hotkey on the document: a chord such as
`'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
`defineAppHotkeys`. Pass getters for reactive values. Use
`createHotkeyAttachment` for element-scoped hotkeys.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeGetter`\<`T`\>

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`MaybeGetter`\<`AdapterOptionsFor`\<`T`, [`CreateHotkeyTarget`](../type-aliases/CreateHotkeyTarget.md)\>\>

### Returns

`void`

### Example

```svelte
<script lang="ts">
  createHotkey('Mod+S', () => save())
  createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
  createHotkey('Escape', () => close(), () => ({ enabled: isOpen }))
</script>
```
