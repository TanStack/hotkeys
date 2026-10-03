---
id: EmberHotkeyRecorder
title: EmberHotkeyRecorder
---

Defined in: [packages/ember-hotkeys/src/types.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L18)

Recording state and controls owned by the containing component.

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L28)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/ember-hotkeys/src/types.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L20)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: Hotkey | null;
```

Defined in: [packages/ember-hotkeys/src/types.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L22)

The last recorded binding, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L24)

Start a new recording session.

#### Returns

`void`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L26)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
