---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [hotkey.ts:410](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L410)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.ts:412](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L412)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.ts:414](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L414)

The parsed representation of the hotkey
