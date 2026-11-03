---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

## Call Signature

```ts
function createHotkeyRecorder(owner, options): AlpineHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeyRecorder.ts#L18)

Creates a recorder owned by a `createHotkeysScope` owner. It uses the
owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
`maxSteps` (default 1) selects chords or sequences.

### Parameters

#### owner

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)

#### options

`HotkeyChordRecorderOptions`

### Returns

[`AlpineHotkeyRecorder`](../interfaces/AlpineHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function createHotkeyRecorder(owner, options): AlpineHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeyRecorder.ts#L22)

Creates a recorder owned by a `createHotkeysScope` owner. It uses the
owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
`maxSteps` (default 1) selects chords or sequences.

### Parameters

#### owner

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`AlpineHotkeyRecorder`](../interfaces/AlpineHotkeyRecorder.md)

## Call Signature

```ts
function createHotkeyRecorder(owner, options): AlpineHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeyRecorder.ts#L28)

Creates a recorder owned by a `createHotkeysScope` owner. It uses the
owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
`maxSteps` (default 1) selects chords or sequences.

### Parameters

#### owner

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`AlpineHotkeyRecorder`](../interfaces/AlpineHotkeyRecorder.md)

## Call Signature

```ts
function createHotkeyRecorder(owner, options): AlpineHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeyRecorder.ts#L32)

Creates a recorder owned by a `createHotkeysScope` owner. It uses the
owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
`maxSteps` (default 1) selects chords or sequences.

### Parameters

#### owner

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`AlpineHotkeyRecorder`](../interfaces/AlpineHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function createHotkeyRecorder(owner, options): AlpineHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeyRecorder.ts#L36)

Creates a recorder owned by a `createHotkeysScope` owner. It uses the
owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
`maxSteps` (default 1) selects chords or sequences.

### Parameters

#### owner

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)

#### options

() => `HotkeyRecorderOptions`

### Returns

[`AlpineHotkeyRecorder`](../interfaces/AlpineHotkeyRecorder.md)
