---
id: OctaneHotkeyRecorder
title: OctaneHotkeyRecorder
---

Defined in: types.ts:9

Recording state and controls owned by the containing component.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: types.ts:19

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: types.ts:11

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: types.ts:13

The last recorded binding, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: types.ts:15

Start a new recording session.

#### Returns

`void`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: types.ts:17

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
