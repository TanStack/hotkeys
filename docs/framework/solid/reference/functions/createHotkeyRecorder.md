---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L46)

Solid primitive for recording keyboard shortcuts. Options may be an accessor.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeyChordRecorderOptions`

### Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```tsx
const recorder = createHotkeyRecorder({ onRecord: setShortcut })
const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L49)

Solid primitive for recording keyboard shortcuts. Options may be an accessor.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)

### Example

```tsx
const recorder = createHotkeyRecorder({ onRecord: setShortcut })
const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L54)

Solid primitive for recording keyboard shortcuts. Options may be an accessor.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)

### Example

```tsx
const recorder = createHotkeyRecorder({ onRecord: setShortcut })
const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L57)

Solid primitive for recording keyboard shortcuts. Options may be an accessor.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```tsx
const recorder = createHotkeyRecorder({ onRecord: setShortcut })
const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L60)

Solid primitive for recording keyboard shortcuts. Options may be an accessor.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyRecorderOptions`

### Returns

[`SolidHotkeyRecorder`](../interfaces/SolidHotkeyRecorder.md)

### Example

```tsx
const recorder = createHotkeyRecorder({ onRecord: setShortcut })
const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: setShortcut })
```
