---
id: HotkeyRegistrationHandle
title: HotkeyRegistrationHandle
---

Defined in: [hotkey-manager.ts:226](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L226)

A handle returned from HotkeyManager.register() that allows updating
the callback and options without re-registering the hotkey.

## Example

```ts
const handle = manager.register('Mod+S', callback, options)

// Update callback without re-registering (avoids stale closures)
handle.callback = newCallback

// Update options without re-registering
handle.setOptions({ enabled: false })

// Unregister when done
handle.unregister()
```

## Type Parameters

### TOptions

`TOptions` *extends* [`HotkeyOptions`](HotkeyOptions.md) = 
  \| [`HotkeyChordOptions`](HotkeyChordOptions.md)
  \| [`HotkeySequenceOptions`](HotkeySequenceOptions.md)

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:233](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L233)

The callback function. Can be set directly to update without re-registering.
This avoids stale closures when the callback references React state.

***

### id

```ts
readonly id: string;
```

Defined in: [hotkey-manager.ts:235](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L235)

Unique identifier for this registration

***

### isActive

```ts
readonly isActive: boolean;
```

Defined in: [hotkey-manager.ts:237](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L237)

Check if this registration is still active (not unregistered)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [hotkey-manager.ts:242](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L242)

Update options (merged with existing options).
Useful for updating `enabled`, `preventDefault`, etc. without re-registering.

#### Parameters

##### options

`Partial`\<`TOptions`\>

#### Returns

`void`

***

### unregister

```ts
unregister: () => void;
```

Defined in: [hotkey-manager.ts:244](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L244)

Unregister this hotkey

#### Returns

`void`
