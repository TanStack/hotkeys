---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [hotkey.ts:388](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L388)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.ts:390](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L390)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.ts:392](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L392)

The parsed representation of the hotkey
