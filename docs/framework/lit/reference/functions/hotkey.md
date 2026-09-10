---
id: hotkey
title: hotkey
---

# Function: hotkey()

```ts
function hotkey(hotkey, options): <T>(proto, propertyKey, descriptor?) => void;
```

Defined in: [decorators/hotkey.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/decorators/hotkey.ts#L29)

Decorator that registers a keyboard hotkey on the element when it connects
and unregisters when it disconnects. Uses [HotkeyController](../classes/HotkeyController.md) under the hood.

## Parameters

### hotkey

`RegisterableHotkey`

The key or key combo to listen for (e.g. `'Mod+S'` or a raw hotkey object).

### options

`HotkeyOptions` = `HOTKEY_DEFAULT_OPTIONS`

Optional registration options (target, platform, enabled, etc.).

## Returns

A method decorator for use on LitElement methods.

```ts
<T>(
   proto, 
   propertyKey, 
   descriptor?): void;
```

### Type Parameters

#### T

`T` *extends* `HotkeyCallback`

### Parameters

#### proto

`LitElement`

#### propertyKey

`string`

#### descriptor?

`TypedPropertyDescriptor`\<`T`\>

### Returns

`void`

## Example

```ts
class MyElement extends LitElement {
  @hotkey('Mod+S')
  save() { this.doSave() }

  @hotkey('Escape')
  close() { this.dismiss() }
}
```
