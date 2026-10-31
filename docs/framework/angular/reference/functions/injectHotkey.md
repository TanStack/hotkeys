---
id: injectHotkey
title: injectHotkey
---

## Call Signature

```ts
function injectHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [injectHotkey.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L72)

Angular inject-based API for registering a hotkey: a chord such as
`'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
`defineAppHotkeys`. The hotkey and options may be getters that read signals.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `provideHotkeys` (including the user's custom hotkey) and its declared
meta and options, and registers nothing while unbound. A hotkey of
`undefined`, `null`, or `''` registers nothing, for an optional shortcut
such as `() => this.shortcut()`; when it changes to a hotkey, it registers.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeGetter`\<[`InjectAppHotkeyOptions`](../type-aliases/InjectAppHotkeyOptions.md)\<`T`\>\>

### Returns

`void`

### Example

```ts
@Component({ ... })
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
    injectHotkey(['G', 'G'], () => this.scrollToTop(), { timeout: 500 })
    injectHotkey('Escape', () => this.close(), () => ({ enabled: this.isOpen() }))
  }
}
```

## Call Signature

```ts
function injectHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [injectHotkey.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L77)

Angular inject-based API for registering a hotkey: a chord such as
`'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
`defineAppHotkeys`. The hotkey and options may be getters that read signals.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `provideHotkeys` (including the user's custom hotkey) and its declared
meta and options, and registers nothing while unbound. A hotkey of
`undefined`, `null`, or `''` registers nothing, for an optional shortcut
such as `() => this.shortcut()`; when it changes to a hotkey, it registers.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`MaybeGetter`\<`AdapterOptionsFor`\<`T`, [`InjectHotkeyTarget`](../type-aliases/InjectHotkeyTarget.md)\>\>

### Returns

`void`

### Example

```ts
@Component({ ... })
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
    injectHotkey(['G', 'G'], () => this.scrollToTop(), { timeout: 500 })
    injectHotkey('Escape', () => this.close(), () => ({ enabled: this.isOpen() }))
  }
}
```
