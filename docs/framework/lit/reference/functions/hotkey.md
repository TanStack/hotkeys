---
id: hotkey
title: hotkey
---

## Call Signature

```ts
function hotkey<T>(hotkey, options?): HotkeyDecorator;
```

Defined in: [decorators/hotkey.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L60)

Decorator that registers a hotkey on the element when it connects and
unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
as `['G', 'G']`, or an app hotkey. Uses [HotkeyController](../classes/HotkeyController.md) under the hood.

Works with legacy (`experimentalDecorators`) and standard decorators. The
method is looked up when the hotkey fires, so subclass overrides run.

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

[`HotkeyDecorator`](../type-aliases/HotkeyDecorator.md)

A method decorator for use on Lit element methods.

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

Defined in: [decorators/hotkey.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L64)

Decorator that registers a hotkey on the element when it connects and
unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
as `['G', 'G']`, or an app hotkey. Uses [HotkeyController](../classes/HotkeyController.md) under the hood.

Works with legacy (`experimentalDecorators`) and standard decorators. The
method is looked up when the hotkey fires, so subclass overrides run.

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

[`HotkeyDecorator`](../type-aliases/HotkeyDecorator.md)\<`HotkeyCallbackContextFor`\<`T`\>\>

A method decorator for use on Lit element methods.

### Example

```ts
class MyElement extends LitElement {
  @hotkey('Mod+S')
  save() { this.doSave() }

  @hotkey(['G', 'G'], { timeout: 500 })
  goToTop() { window.scrollTo(0, 0) }
}
```
