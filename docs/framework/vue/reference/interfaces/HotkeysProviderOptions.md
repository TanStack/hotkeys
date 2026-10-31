---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProviderContext.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L30)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProviderContext.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L35)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "onRecord" | "validate">>;
```

Defined in: [HotkeysProviderContext.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L37)

Defaults for every `useHotkeyRecorder`.
