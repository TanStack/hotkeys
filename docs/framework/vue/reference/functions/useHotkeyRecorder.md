---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder<HotkeyChord>;
```

Defined in: [useHotkeyRecorder.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L46)

Vue composable for recording keyboard shortcuts. Options may be a ref or getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeyChordRecorderOptions`

### Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```ts
const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
```

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L49)

Vue composable for recording keyboard shortcuts. Options may be a ref or getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)

### Example

```ts
const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
```

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L54)

Vue composable for recording keyboard shortcuts. Options may be a ref or getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)

### Example

```ts
const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
```

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder<HotkeyChord>;
```

Defined in: [useHotkeyRecorder.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L57)

Vue composable for recording keyboard shortcuts. Options may be a ref or getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```ts
const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
```

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L60)

Vue composable for recording keyboard shortcuts. Options may be a ref or getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`Ref`\<`HotkeyRecorderOptions`\>

### Returns

[`VueHotkeyRecorder`](../interfaces/VueHotkeyRecorder.md)

### Example

```ts
const recorder = useHotkeyRecorder({ onRecord: (hotkey) => (shortcut.value = hotkey) })
const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
```
