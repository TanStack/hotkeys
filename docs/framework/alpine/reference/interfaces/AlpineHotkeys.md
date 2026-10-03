---
id: AlpineHotkeys
title: AlpineHotkeys
---

Defined in: [types.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L67)

Registrations, recorders, and reactive state owned by one Alpine component.

## Properties

### createHeldKeyCodes

```ts
createHeldKeyCodes: () => AlpineHotkeyState<Record<string, string>>;
```

Defined in: [types.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L93)

Read the mapping of held logical names to physical codes through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`Record`\<`string`, `string`\>\>

***

### createHeldKeys

```ts
createHeldKeys: () => AlpineHotkeyState<string[]>;
```

Defined in: [types.ts:91](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L91)

Read held logical key names through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`string`[]\>

***

### createHotkey

```ts
createHotkey: (hotkey, callback, options?) => void;
```

Defined in: [types.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L69)

Register one shortcut. Getters track changing bindings and options.

#### Parameters

##### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`RegisterableHotkey`\>

##### callback

`HotkeyCallback`

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeyOptions`\>

#### Returns

`void`

***

### createHotkeyHint

```ts
createHotkeyHint: (hotkey, options?) => AlpineHotkeyState<boolean>;
```

Defined in: [types.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L97)

Read whether held modifiers reveal a binding through `.value`.

#### Parameters

##### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`RegisterableHotkey`\>

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HeldModifierOptions`\>

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`boolean`\>

***

### createHotkeyRecorder

```ts
createHotkeyRecorder: (options) => AlpineHotkeyRecorder;
```

Defined in: [types.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L104)

Create a recorder whose options can follow Alpine state.

#### Parameters

##### options

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeyRecorderOptions`\>

#### Returns

[`AlpineHotkeyRecorder`](AlpineHotkeyRecorder.md)

***

### createHotkeyRegistrations

```ts
createHotkeyRegistrations: () => HotkeyRegistrationsResult;
```

Defined in: [types.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L102)

Read live hotkey and sequence registrations, including disabled entries.

#### Returns

[`HotkeyRegistrationsResult`](HotkeyRegistrationsResult.md)

***

### createHotkeys

```ts
createHotkeys: (definitions, options?) => void;
```

Defined in: [types.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L75)

Reconcile a list of shortcuts. Definition options override common options.

#### Parameters

##### definitions

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeyDefinition`[]\>

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeyOptions`\>

#### Returns

`void`

***

### createHotkeySequence

```ts
createHotkeySequence: (sequence, callback, options?) => void;
```

Defined in: [types.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L80)

Register consecutive chords with an optional timeout and element target.

#### Parameters

##### sequence

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeySequence`\>

##### callback

`HotkeyCallback`

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`SequenceOptions`\>

#### Returns

`void`

***

### createHotkeySequenceRecorder

```ts
createHotkeySequenceRecorder: (options) => AlpineHotkeySequenceRecorder;
```

Defined in: [types.ts:108](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L108)

Create a sequence recorder with live steps and explicit commit controls.

#### Parameters

##### options

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeySequenceRecorderOptions`\>

#### Returns

[`AlpineHotkeySequenceRecorder`](AlpineHotkeySequenceRecorder.md)

***

### createHotkeySequences

```ts
createHotkeySequences: (definitions, options?) => void;
```

Defined in: [types.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L86)

Reconcile a changing list of sequences.

#### Parameters

##### definitions

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HotkeySequenceDefinition`[]\>

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`SequenceOptions`\>

#### Returns

`void`

***

### createKeyHold

```ts
createKeyHold: (key) => AlpineHotkeyState<boolean>;
```

Defined in: [types.ts:95](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L95)

Read whether a key is held through `.value`.

#### Parameters

##### key

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`IndividualKey`\>

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`boolean`\>

***

### destroy

```ts
destroy: () => void;
```

Defined in: [types.ts:112](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L112)

Release every registration, subscription, effect, and recorder. Idempotent.

#### Returns

`void`
