---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L12)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L17)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L19)

Defaults for every `createHotkeyRecorder`.
