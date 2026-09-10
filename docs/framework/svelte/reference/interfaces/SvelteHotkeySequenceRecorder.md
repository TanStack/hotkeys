---
id: SvelteHotkeySequenceRecorder
title: SvelteHotkeySequenceRecorder
---

# Interface: SvelteHotkeySequenceRecorder

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L11)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L17)

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L18)

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L12)

***

### recordedSequence

```ts
readonly recordedSequence: HotkeySequence | null;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L14)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L15)

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L13)

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts#L16)

#### Returns

`void`
