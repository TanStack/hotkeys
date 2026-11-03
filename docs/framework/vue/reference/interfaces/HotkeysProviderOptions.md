---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [HotkeysProviderContext.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L31)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProviderContext.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L42)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "onRecord" | "validate">>;
```

Defined in: [HotkeysProviderContext.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L44)

Defaults for every `useHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [HotkeysProviderContext.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L37)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. On a server, set it from the request with
`detectPlatform(userAgent)`.
