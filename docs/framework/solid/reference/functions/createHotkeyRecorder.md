---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L45)

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
const sequenceRecorder = createHotkeyRecorder({ maxSteps: 3, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L48)

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
const sequenceRecorder = createHotkeyRecorder({ maxSteps: 3, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L53)

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
const sequenceRecorder = createHotkeyRecorder({ maxSteps: 3, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder<HotkeyChord>;
```

Defined in: [createHotkeyRecorder.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L56)

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
const sequenceRecorder = createHotkeyRecorder({ maxSteps: 3, onRecord: setShortcut })
```

## Call Signature

```ts
function createHotkeyRecorder(options): SolidHotkeyRecorder;
```

Defined in: [createHotkeyRecorder.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L59)

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
const sequenceRecorder = createHotkeyRecorder({ maxSteps: 3, onRecord: setShortcut })
```
