---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:24](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L24)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:29](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L29)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:31](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L31)

Defaults for every `useHotkeyRecorder`.
