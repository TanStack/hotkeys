---
id: OctaneHotkeyRecorder
title: OctaneHotkeyRecorder
---

Defined in: [types.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L11)

Recording state and controls owned by the containing component.

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L23)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [types.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L25)

Commit the current steps (multi-step recordings).

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [types.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L13)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
recordedHotkey: THotkey | null;
```

Defined in: [types.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L17)

The last committed hotkey, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L19)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [types.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L15)

Chords captured so far in a multi-step recording.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L21)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
