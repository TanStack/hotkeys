---
id: AlpineHotkeySequenceRecorder
title: AlpineHotkeySequenceRecorder
---

Defined in: [types.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L40)

Sequence recording state and controls.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L52)

Discard the current session and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [types.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L54)

Commit the current steps. Does nothing when no steps are recorded.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [types.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L42)

Whether the recorder is listening for chords.

***

### recordedSequence

```ts
readonly recordedSequence: HotkeySequence | null;
```

Defined in: [types.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L46)

The last committed sequence.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L48)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [types.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L44)

Chords captured in the current session.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L50)

Stop without committing or calling onCancel.

#### Returns

`void`
