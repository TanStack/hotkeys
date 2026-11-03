---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:22](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L22)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:33](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L33)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:35](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L35)

Defaults for every `useHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [HotkeysProvider.tsx:28](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L28)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. Defaults to detection. When server rendering, set it from the
request with `detectPlatform(userAgent)`.
