---
id: RecorderOptions
title: RecorderOptions
---

Defined in: [hotkey-recorder.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L33)

## Properties

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [hotkey-recorder.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L39)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

***

### onReject?

```ts
optional onReject?: (rejection) => void;
```

Defined in: [hotkey-recorder.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L41)

Rejected candidates leave recording active.

#### Parameters

##### rejection

[`RecorderRejection`](RecorderRejection.md)

#### Returns

`void`

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-recorder.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L37)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

***

### recordBy?

```ts
optional recordBy?: RecorderKeyMode;
```

Defined in: [hotkey-recorder.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L35)

Physical code recording is the default. Choose key to record logical characters.
