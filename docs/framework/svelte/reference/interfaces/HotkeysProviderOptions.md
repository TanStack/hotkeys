---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L20)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L25)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L27)

Defaults for every `createHotkeyRecorder`.
