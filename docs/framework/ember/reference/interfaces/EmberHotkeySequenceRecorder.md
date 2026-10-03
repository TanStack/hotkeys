---
id: EmberHotkeySequenceRecorder
title: EmberHotkeySequenceRecorder
---

Defined in: [packages/ember-hotkeys/src/types.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L32)

Sequence recording state and controls.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L44)

Discard the current session and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L46)

Commit the current steps. Does nothing when no steps are recorded.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/ember-hotkeys/src/types.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L34)

Whether the recorder is listening for chords.

***

### recordedSequence

```ts
readonly recordedSequence: HotkeySequence | null;
```

Defined in: [packages/ember-hotkeys/src/types.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L38)

The last committed sequence.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L40)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/ember-hotkeys/src/types.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L36)

Chords captured in the current session.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L42)

Stop without committing or calling onCancel.

#### Returns

`void`
