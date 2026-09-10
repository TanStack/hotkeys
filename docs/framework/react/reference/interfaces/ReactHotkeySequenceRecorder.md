---
id: ReactHotkeySequenceRecorder
title: ReactHotkeySequenceRecorder
---

# Interface: ReactHotkeySequenceRecorder

Defined in: [useHotkeySequenceRecorder.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L10)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeySequenceRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L19)

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: [useHotkeySequenceRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L21)

Commit current steps (no-op if empty)

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [useHotkeySequenceRecorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L12)

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: [useHotkeySequenceRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L16)

Last committed sequence

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [useHotkeySequenceRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L17)

#### Returns

`void`

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [useHotkeySequenceRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L14)

Chords captured in the current session

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [useHotkeySequenceRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeySequenceRecorder.ts#L18)

#### Returns

`void`
