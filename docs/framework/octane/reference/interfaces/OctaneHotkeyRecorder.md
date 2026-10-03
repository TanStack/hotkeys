---
id: OctaneHotkeyRecorder
title: OctaneHotkeyRecorder
---

Defined in: [types.ts:9](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L9)

Recording state and controls owned by the containing component.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [types.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L19)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [types.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L11)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [types.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L13)

The last recorded binding, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [types.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L15)

Start a new recording session.

#### Returns

`void`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [types.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/types.ts#L17)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
