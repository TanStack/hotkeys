---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(options): OctaneHotkeyRecorder<HotkeyChord>;
```

Defined in: [useHotkeyRecorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkeyRecorder.ts#L20)

Records a shortcut and destroys the recorder on unmount. With the default
`maxSteps: 1`, the first valid chord is recorded. With a larger `maxSteps`,
each chord adds a step; the recording commits on Enter (unless
`commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeyChordRecorderOptions`

### Returns

[`OctaneHotkeyRecorder`](../interfaces/OctaneHotkeyRecorder.md)\<`HotkeyChord`\>

## Call Signature

```ts
function useHotkeyRecorder(options): OctaneHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkeyRecorder.ts#L23)

Records a shortcut and destroys the recorder on unmount. With the default
`maxSteps: 1`, the first valid chord is recorded. With a larger `maxSteps`,
each chord adds a step; the recording commits on Enter (unless
`commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`OctaneHotkeyRecorder`](../interfaces/OctaneHotkeyRecorder.md)
