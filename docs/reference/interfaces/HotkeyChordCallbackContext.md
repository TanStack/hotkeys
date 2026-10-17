---
id: HotkeyChordCallbackContext
title: HotkeyChordCallbackContext
---

Defined in: [hotkey.types.ts:233](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L233)

Context passed to a chord's callback.

## Properties

### hotkey

```ts
hotkey: HotkeyChord;
```

Defined in: [hotkey.types.ts:236](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L236)

The registered chord

***

### kind

```ts
kind: "chord";
```

Defined in: [hotkey.types.ts:234](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L234)

***

### parsedChord

```ts
parsedChord: ParsedHotkeyChord;
```

Defined in: [hotkey.types.ts:238](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L238)

The chord with `Mod` resolved for the registration's platform
