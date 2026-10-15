---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:13](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L13)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:18](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L18)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:20](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L20)

Defaults for every `useHotkeyRecorder`.
