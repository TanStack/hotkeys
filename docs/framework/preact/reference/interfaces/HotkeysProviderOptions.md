---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:21](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L21)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:26](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L26)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:28](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L28)

Defaults for every `useHotkeyRecorder`.
