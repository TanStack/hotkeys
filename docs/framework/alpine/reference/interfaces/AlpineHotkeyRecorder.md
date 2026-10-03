---
id: AlpineHotkeyRecorder
title: AlpineHotkeyRecorder
---

Defined in: [types.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L26)

Recording state and controls owned by the containing scope.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L36)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [types.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L28)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: Hotkey | null;
```

Defined in: [types.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L30)

The last recorded binding, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L32)

Start a new recording session.

#### Returns

`void`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L34)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
