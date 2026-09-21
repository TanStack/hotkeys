---
id: RecorderOptions
title: RecorderOptions
---

Defined in: [recorder-options.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L15)

## Extended by

- [`HotkeyRecorderOptions`](HotkeyRecorderOptions.md)
- [`HotkeySequenceRecorderOptions`](HotkeySequenceRecorderOptions.md)

## Properties

### detectConflicts?

```ts
optional detectConflicts: boolean | HotkeyConflictOptions;
```

Defined in: [recorder-options.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L21)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

***

### onReject()?

```ts
optional onReject: (rejection) => void;
```

Defined in: [recorder-options.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L23)

Rejected candidates leave recording active.

#### Parameters

##### rejection

[`RecorderRejection`](RecorderRejection.md)

#### Returns

`void`

***

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [recorder-options.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L19)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

***

### recordBy?

```ts
optional recordBy: RecorderKeyMode;
```

Defined in: [recorder-options.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L17)

Physical code recording is the default. Choose key to record logical characters.
