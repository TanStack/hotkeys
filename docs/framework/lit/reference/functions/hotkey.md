---
id: hotkey
title: hotkey
---

## Call Signature

```ts
function hotkey<T>(hotkey, options?): HotkeyDecorator;
```

Defined in: [decorators/hotkey.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L48)

Decorator that registers a hotkey on the element when it connects and
unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
as `['G', 'G']`, or an app hotkey. Uses [HotkeyController](../classes/HotkeyController.md) under the hood.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`T`

The chord, sequence, or app hotkey to listen for.

#### options?

[`AppHotkeyControllerOptions`](../type-aliases/AppHotkeyControllerOptions.md)\<`T`\>

Optional registration options (target, platform, enabled, etc.).

### Returns

`HotkeyDecorator`

A method decorator for use on LitElement methods.

### Example

```ts
class MyElement extends LitElement {
  @hotkey('Mod+S')
  save() { this.doSave() }

  @hotkey(['G', 'G'], { timeout: 500 })
  goToTop() { window.scrollTo(0, 0) }
}
```

## Call Signature

```ts
function hotkey<T>(hotkey, options?): HotkeyDecorator<HotkeyCallbackContextFor<T>>;
```

Defined in: [decorators/hotkey.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L52)

Decorator that registers a hotkey on the element when it connects and
unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
as `['G', 'G']`, or an app hotkey. Uses [HotkeyController](../classes/HotkeyController.md) under the hood.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`T`

The chord, sequence, or app hotkey to listen for.

#### options?

[`HotkeyControllerOptionsFor`](../type-aliases/HotkeyControllerOptionsFor.md)\<`T`\>

Optional registration options (target, platform, enabled, etc.).

### Returns

`HotkeyDecorator`\<`HotkeyCallbackContextFor`\<`T`\>\>

A method decorator for use on LitElement methods.

### Example

```ts
class MyElement extends LitElement {
  @hotkey('Mod+S')
  save() { this.doSave() }

  @hotkey(['G', 'G'], { timeout: 500 })
  goToTop() { window.scrollTo(0, 0) }
}
```
