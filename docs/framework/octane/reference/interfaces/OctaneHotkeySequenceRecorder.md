---
id: OctaneHotkeySequenceRecorder
title: OctaneHotkeySequenceRecorder
---

Defined in: types.ts:23

Sequence recording state and controls.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: types.ts:35

Discard the current session and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: types.ts:37

Commit the current steps. Does nothing when no steps are recorded.

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: types.ts:25

Whether the recorder is listening for chords.

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: types.ts:29

The last committed sequence.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: types.ts:31

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: types.ts:27

Chords captured in the current session.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: types.ts:33

Stop without committing or calling onCancel.

#### Returns

`void`
