---
id: HotkeyRegistrationHandle
title: HotkeyRegistrationHandle
---

Defined in: [hotkey-manager.ts:291](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L291)

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

Defined in: [hotkey-manager.ts:298](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L298)

The callback function. Can be set directly to update without re-registering.
This avoids stale closures when the callback references React state.

***

### id

```ts
readonly id: string;
```

Defined in: [hotkey-manager.ts:300](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L300)

Unique identifier for this registration

***

### isActive

```ts
readonly isActive: boolean;
```

Defined in: [hotkey-manager.ts:302](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L302)

Check if this registration is still active (not unregistered)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [hotkey-manager.ts:310](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L310)

Update options (merged with existing options).
Useful for updating `enabled`, `preventDefault`, etc. without re-registering.
Changing `capture` moves the listener phase without clearing `requireReset`
state or sequence progress. A registration already processed for an event
cannot process it again in another phase.

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

Defined in: [hotkey-manager.ts:312](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L312)

Unregister this hotkey

#### Returns

`void`
