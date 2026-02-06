---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [hotkey.ts:346](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L346)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.ts:348](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L348)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.ts:350](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L350)

The parsed representation of the hotkey
