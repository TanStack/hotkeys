---
id: SequenceRegistrationHandle
title: SequenceRegistrationHandle
---

Defined in: [sequence-manager.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L117)

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

Defined in: [sequence-manager.ts:120](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L120)

***

### id

```ts
readonly id: string;
```

Defined in: [sequence-manager.ts:118](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L118)

***

### isActive

```ts
readonly isActive: boolean;
```

Defined in: [sequence-manager.ts:119](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L119)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [sequence-manager.ts:126](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L126)

Merge options without re-registering. Changing `capture` preserves partial
sequence progress and its timeout. A step cannot advance twice for the same
event when a callback changes the phase.

#### Parameters

##### options

`Partial`\<[`SequenceOptions`](SequenceOptions.md)\>

#### Returns

`void`

***

### unregister

```ts
unregister: () => void;
```

Defined in: [sequence-manager.ts:127](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L127)

#### Returns

`void`
