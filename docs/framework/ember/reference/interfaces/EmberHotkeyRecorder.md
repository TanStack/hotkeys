---
id: EmberHotkeyRecorder
title: EmberHotkeyRecorder
---

Defined in: packages/ember-hotkeys/src/types.ts:18

Recording state and controls owned by the containing component.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:28

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: packages/ember-hotkeys/src/types.ts:20

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: Hotkey | null;
```

Defined in: packages/ember-hotkeys/src/types.ts:22

The last recorded binding, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:24

Start a new recording session.

#### Returns

`void`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: packages/ember-hotkeys/src/types.ts:26

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
