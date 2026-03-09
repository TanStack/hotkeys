---
id: SvelteHotkeyRecorder
title: SvelteHotkeyRecorder
---

# Interface: SvelteHotkeyRecorder

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:7](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L7)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L17)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:9](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L9)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L11)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L13)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L15)

Stop recording (same as cancel)

#### Returns

`void`
