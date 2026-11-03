---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(options): VueHotkeyRecorder<HotkeyChord>;
```

Defined in: [useHotkeyRecorder.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L48)

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

Defined in: [useHotkeyRecorder.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L51)

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

Defined in: [useHotkeyRecorder.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L56)

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

Defined in: [useHotkeyRecorder.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L59)

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

Defined in: [useHotkeyRecorder.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L62)

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
