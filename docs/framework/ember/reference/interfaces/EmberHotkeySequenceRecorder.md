---
id: EmberHotkeySequenceRecorder
title: EmberHotkeySequenceRecorder
---

Defined in: packages/ember-hotkeys/src/types.ts:32

Sequence recording state and controls.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:44

Discard the current session and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:46

Commit the current steps. Does nothing when no steps are recorded.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: packages/ember-hotkeys/src/types.ts:34

Whether the recorder is listening for chords.

***

### recordedSequence

```ts
readonly recordedSequence: HotkeySequence | null;
```

Defined in: packages/ember-hotkeys/src/types.ts:38

The last committed sequence.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:40

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: packages/ember-hotkeys/src/types.ts:36

Chords captured in the current session.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:42

Stop without committing or calling onCancel.

#### Returns

`void`
