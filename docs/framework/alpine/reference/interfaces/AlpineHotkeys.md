---
id: AlpineHotkeys
title: AlpineHotkeys
---

Defined in: [types.ts:125](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L125)

Registrations, recorders, and reactive state owned by one Alpine component.

## Properties

### createAppHotkeyList

```ts
createAppHotkeyList: () => AlpineHotkeyState<AppHotkeyListItem<AppHotkey<string, HotkeyChord | HotkeySequence | null>>[]>;
```

Defined in: [types.ts:154](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L154)

Read every app hotkey with its live status through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`AppHotkeyListItem`\<`AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>[]\>

***

### createAppHotkeys

```ts
createAppHotkeys: () => AlpineHotkeyState<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
```

Defined in: [types.ts:152](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L152)

Read the effective app hotkeys from `provideAppHotkeys` through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>\>

***

### createCustomHotkeys

```ts
createCustomHotkeys: () => AlpineCustomHotkeys;
```

Defined in: [types.ts:158](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L158)

Read and change the user's custom hotkeys.

#### Returns

[`AlpineCustomHotkeys`](AlpineCustomHotkeys.md)

***

### createHeldKeyCodes

```ts
createHeldKeyCodes: () => AlpineHotkeyState<Record<string, string>>;
```

Defined in: [types.ts:139](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L139)

Read the mapping of held logical names to physical codes through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`Record`\<`string`, `string`\>\>

***

### createHeldKeys

```ts
createHeldKeys: () => AlpineHotkeyState<string[]>;
```

Defined in: [types.ts:137](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L137)

Read held logical key names through `.value`.

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`string`[]\>

***

### createHotkey

```ts
createHotkey: AlpineCreateHotkey;
```

Defined in: [types.ts:130](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L130)

Register one hotkey: a chord such as `'Mod+S'`, a sequence such as
`['G', 'G']`, or an app hotkey. Getters track changing hotkeys and options.

***

### createHotkeyHint

```ts
createHotkeyHint: (hotkey, options?) => AlpineHotkeyState<boolean>;
```

Defined in: [types.ts:143](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L143)

Read whether held modifiers reveal a hotkey through `.value`.

#### Parameters

##### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>\>

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HeldModifierOptions`\>

#### Returns

[`AlpineHotkeyState`](AlpineHotkeyState.md)\<`boolean`\>

***

### createHotkeyRecorder

```ts
createHotkeyRecorder: AlpineCreateHotkeyRecorder;
```

Defined in: [types.ts:150](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L150)

Create a recorder whose options can follow Alpine state.

***

### createHotkeyRegistrations

```ts
createHotkeyRegistrations: () => HotkeyRegistrationsResult;
```

Defined in: [types.ts:148](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L148)

Read live registrations, including disabled entries.

#### Returns

[`HotkeyRegistrationsResult`](HotkeyRegistrationsResult.md)

***

### createHotkeys

```ts
createHotkeys: (definitions, options?) => void;
```

Defined in: [types.ts:132](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L132)

Reconcile a list of hotkeys. Definition options override common options.

#### Parameters

##### definitions

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<readonly [`AlpineHotkeyDefinition`](../type-aliases/AlpineHotkeyDefinition.md)[]\>

##### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<[`AlpineHotkeyCommonOptions`](../type-aliases/AlpineHotkeyCommonOptions.md)\>

#### Returns

`void`

***

### createKeyHold

```ts
createKeyHold: (key) => AlpineHotkeyState<boolean>;
```

Defined in: [types.ts:141](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L141)

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

Defined in: [types.ts:160](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L160)

Release every registration, subscription, effect, and recorder. Idempotent.

#### Returns

`void`
