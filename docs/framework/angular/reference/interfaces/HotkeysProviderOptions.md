---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [hotkeys-provider.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L30)

## Properties

### hotkey?

```ts
optional hotkey?: InjectHotkeyCommonOptions;
```

Defined in: [hotkeys-provider.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L35)

Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [hotkeys-provider.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L37)

Defaults for every `injectHotkeyRecorder`.
