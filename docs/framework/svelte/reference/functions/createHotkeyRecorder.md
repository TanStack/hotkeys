---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L102)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeyChordRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:105](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L105)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:110](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L110)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:113](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L113)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:116](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L116)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```
