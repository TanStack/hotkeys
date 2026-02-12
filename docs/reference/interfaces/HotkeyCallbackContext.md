---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [hotkey.ts:387](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L387)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.ts:389](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L389)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.ts:391](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L391)

The parsed representation of the hotkey
