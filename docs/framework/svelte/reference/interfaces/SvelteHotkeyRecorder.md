---
id: SvelteHotkeyRecorder
title: SvelteHotkeyRecorder
---

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L14)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L26)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L28)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L16)

Whether recording is currently active

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L20)

The last committed hotkey

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L22)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L18)

Chords recorded so far in a multi-step recording (for live preview)

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L24)

Stop recording without calling onCancel

#### Returns

`void`
