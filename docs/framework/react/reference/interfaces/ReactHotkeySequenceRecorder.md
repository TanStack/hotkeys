---
id: ReactHotkeySequenceRecorder
title: ReactHotkeySequenceRecorder
---

# Interface: ReactHotkeySequenceRecorder

Defined in: useHotkeySequenceRecorder.ts:10

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: useHotkeySequenceRecorder.ts:19

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: useHotkeySequenceRecorder.ts:21

Commit current steps (no-op if empty)

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: useHotkeySequenceRecorder.ts:12

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: useHotkeySequenceRecorder.ts:16

Last committed sequence

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: useHotkeySequenceRecorder.ts:17

#### Returns

`void`

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: useHotkeySequenceRecorder.ts:14

Chords captured in the current session

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: useHotkeySequenceRecorder.ts:18

#### Returns

`void`
