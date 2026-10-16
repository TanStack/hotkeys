---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

Defined in: [hotkey.types.ts:228](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L228)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.types.ts:230](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L230)

The registered hotkey: a chord string or a sequence

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.types.ts:232](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L232)

The parsed chord that completed the match (the last step of a sequence)
