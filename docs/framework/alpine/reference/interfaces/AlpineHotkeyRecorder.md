---
id: AlpineHotkeyRecorder
title: AlpineHotkeyRecorder
---

Defined in: [types.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L51)

Recording state and controls owned by the containing scope.

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L63)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [types.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L65)

Commit the current steps (multi-step recordings).

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [types.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L53)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [types.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L57)

The last committed hotkey, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L59)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [types.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L55)

Chords captured so far in a multi-step recording.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L61)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
