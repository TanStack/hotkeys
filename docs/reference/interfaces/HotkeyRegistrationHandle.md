---
id: HotkeyRegistrationHandle
title: HotkeyRegistrationHandle
---

# Interface: HotkeyRegistrationHandle

Defined in: [hotkey-manager.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L97)

A handle returned from HotkeyManager.register() that allows updating
the callback and options without re-registering the hotkey.

## Example

```ts
const handle = manager.register('Mod+S', callback, options)

// Update callback without re-registering (avoids stale closures)
handle.callback = newCallback

// Update options without re-registering
handle.setOptions({ enabled: false })

// Check if still active
if (handle.isActive) {
  // ...
}

// Unregister when done
handle.unregister()
```

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [hotkey-manager.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L102)

The callback function. Can be set directly to update without re-registering.
This avoids stale closures when the callback references React state.

***

### id

```ts
readonly id: string;
```

Defined in: [hotkey-manager.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L104)

Unique identifier for this registration

***

### isActive

```ts
readonly isActive: boolean;
```

Defined in: [hotkey-manager.ts:106](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L106)

Check if this registration is still active (not unregistered)

***

### setOptions()

```ts
setOptions: (options) => void;
```

Defined in: [hotkey-manager.ts:111](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L111)

Update options (merged with existing options).
Useful for updating `enabled`, `preventDefault`, etc. without re-registering.

#### Parameters

##### options

`Partial`\<[`HotkeyOptions`](HotkeyOptions.md)\>

#### Returns

`void`

***

### unregister()

```ts
unregister: () => void;
```

Defined in: [hotkey-manager.ts:113](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L113)

Unregister this hotkey

#### Returns

`void`
