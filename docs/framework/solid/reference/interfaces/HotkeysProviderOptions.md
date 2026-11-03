---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProvider.tsx:28](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L28)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.tsx:39](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L39)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.tsx:41](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L41)

Defaults for every `createHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [HotkeysProvider.tsx:34](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L34)

The user's platform, for labels from `createFormatForDisplay`, hotkeys,
and recorders. On a server, set it from the request with
`detectPlatform(userAgent)`.
