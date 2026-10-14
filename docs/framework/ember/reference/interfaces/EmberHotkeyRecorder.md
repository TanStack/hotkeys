---
id: EmberHotkeyRecorder
title: EmberHotkeyRecorder
---

Defined in: [packages/ember-hotkeys/src/types.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L33)

Recording state and controls owned by the containing component.

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L45)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L47)

Commit the current steps (multi-step recordings).

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/ember-hotkeys/src/types.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L35)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [packages/ember-hotkeys/src/types.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L39)

The last committed hotkey, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L41)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/ember-hotkeys/src/types.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L37)

Chords captured so far in a multi-step recording.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L43)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
