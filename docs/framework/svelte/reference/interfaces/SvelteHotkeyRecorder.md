---
id: SvelteHotkeyRecorder
title: SvelteHotkeyRecorder
---

# Interface: SvelteHotkeyRecorder

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L8)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L18)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L10)

Whether recording is currently active

***

### recordedHotkey

```ts
readonly recordedHotkey: Hotkey | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L12)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L14)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L16)

Stop recording (same as cancel)

#### Returns

`void`
