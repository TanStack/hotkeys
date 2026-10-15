---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(owner, options): EmberHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L24)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

### Parameters

#### owner

`object`

#### options

`HotkeyChordRecorderOptions`

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function useHotkeyRecorder(owner, options): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L28)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

### Parameters

#### owner

`object`

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)

## Call Signature

```ts
function useHotkeyRecorder(owner, options): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L34)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

### Parameters

#### owner

`object`

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)

## Call Signature

```ts
function useHotkeyRecorder(owner, options): EmberHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L38)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

### Parameters

#### owner

`object`

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function useHotkeyRecorder(owner, options): EmberHotkeyRecorder;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyRecorder.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyRecorder.ts#L42)

Creates an owned recorder with autotracked state and current callback
options. With the default `maxSteps: 1`, the first valid chord is recorded.
With a larger `maxSteps`, each chord adds a step; the recording commits on
Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
`maxSteps`, and `onRecord` receives a chord (one step) or a sequence.

### Parameters

#### owner

`object`

#### options

() => `HotkeyRecorderOptions`

### Returns

[`EmberHotkeyRecorder`](../interfaces/EmberHotkeyRecorder.md)
