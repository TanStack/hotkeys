---
id: SvelteHotkeyRecorder
title: SvelteHotkeyRecorder
---

# Interface: SvelteHotkeyRecorder

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:6](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L6)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L16)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L8)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L10)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L12)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L14)

Stop recording (same as cancel)

#### Returns

`void`
