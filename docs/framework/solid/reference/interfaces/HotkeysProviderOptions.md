---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:27](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L27)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:32](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L32)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:34](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L34)

Defaults for every `createHotkeyRecorder`.
