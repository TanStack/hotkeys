---
id: SequenceRegistrationHandle
title: SequenceRegistrationHandle
---

# Interface: SequenceRegistrationHandle

Defined in: [sequence-manager.ts:119](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L119)

A handle returned from SequenceManager.register() that allows updating
the callback and options without re-registering the sequence.

## Example

```ts
const handle = manager.register(['G', 'G'], callback, options)

handle.callback = newCallback
handle.setOptions({ timeout: 500 })
handle.unregister()
```

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [sequence-manager.ts:122](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L122)

***

### id

```ts
readonly id: string;
```

Defined in: [sequence-manager.ts:120](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L120)

***

### isActive

```ts
readonly isActive: boolean;
```

Defined in: [sequence-manager.ts:121](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L121)

***

### setOptions()

```ts
setOptions: (options) => void;
```

Defined in: [sequence-manager.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L123)

#### Parameters

##### options

`Partial`\<[`SequenceOptions`](SequenceOptions.md)\>

#### Returns

`void`

***

### unregister()

```ts
unregister: () => void;
```

Defined in: [sequence-manager.ts:124](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L124)

#### Returns

`void`
