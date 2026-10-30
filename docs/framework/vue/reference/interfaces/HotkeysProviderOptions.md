---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProviderContext.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L29)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProviderContext.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L34)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "onRecord" | "validate">>;
```

Defined in: [HotkeysProviderContext.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L36)

Defaults for every `useHotkeyRecorder`.
