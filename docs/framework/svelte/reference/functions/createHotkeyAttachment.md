---
id: createHotkeyAttachment
title: createHotkeyAttachment
---

## Call Signature

```ts
function createHotkeyAttachment<T>(
   hotkey, 
   callback, 
options?): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:99](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L99)

Create an attachment for an element-scoped hotkey: a chord, a sequence, or
an app hotkey that listens on the attached element. `undefined`, `null`,
or `''` registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeGetter`\<[`CreateAppHotkeyOptions`](../type-aliases/CreateAppHotkeyOptions.md)\<`T`\>\>

### Returns

`Attachment`\<`HTMLElement`\>

### Example

```svelte
<script lang="ts">
  const saveKey = createHotkeyAttachment('Mod+S', () => save())
</script>

<div tabindex="0" {@attach saveKey}>Editor content</div>
```

## Call Signature

```ts
function createHotkeyAttachment<T>(
   hotkey, 
   callback, 
options?): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L104)

Create an attachment for an element-scoped hotkey: a chord, a sequence, or
an app hotkey that listens on the attached element. `undefined`, `null`,
or `''` registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`MaybeGetter`\<`AdapterOptionsFor`\<`T`, [`CreateHotkeyTarget`](../type-aliases/CreateHotkeyTarget.md)\>\>

### Returns

`Attachment`\<`HTMLElement`\>

### Example

```svelte
<script lang="ts">
  const saveKey = createHotkeyAttachment('Mod+S', () => save())
</script>

<div tabindex="0" {@attach saveKey}>Editor content</div>
```
