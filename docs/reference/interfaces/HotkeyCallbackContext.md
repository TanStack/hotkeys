---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [hotkey.ts:391](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L391)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.ts:393](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L393)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.ts:395](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L395)

The parsed representation of the hotkey
