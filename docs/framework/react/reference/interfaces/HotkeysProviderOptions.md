---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:29](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L29)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:40](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L40)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:42](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L42)

Defaults for every `useHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [HotkeysProvider.tsx:35](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L35)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. Defaults to detection. When server rendering, set it from the
request with `detectPlatform(userAgent)`.
