---
id: AlpineHotkeyRecorder
title: AlpineHotkeyRecorder
---

Defined in: [types.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L50)

Recording state and controls owned by the containing scope.

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L62)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [types.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L64)

Commit the current steps (multi-step recordings).

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [types.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L52)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [types.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L56)

The last committed hotkey, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L58)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [types.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L54)

Chords captured so far in a multi-step recording.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L60)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
