---
id: SvelteHotkeyRecorder
title: SvelteHotkeyRecorder
---

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L15)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L27)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L29)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L17)

Whether recording is currently active

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L21)

The last committed hotkey

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L23)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L19)

Chords recorded so far in a multi-step recording (for live preview)

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L25)

Stop recording without calling onCancel

#### Returns

`void`
