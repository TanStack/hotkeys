---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [hotkeys-provider.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L28)

## Properties

### hotkey?

```ts
optional hotkey?: InjectHotkeyCommonOptions;
```

Defined in: [hotkeys-provider.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L33)

Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [hotkeys-provider.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L35)

Defaults for every `injectHotkeyRecorder`.
