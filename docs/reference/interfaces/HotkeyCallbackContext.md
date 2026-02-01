---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

# Interface: HotkeyCallbackContext

Defined in: [types.ts:366](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L366)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [types.ts:368](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L368)

The original hotkey string that was registered

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [types.ts:370](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L370)

The parsed representation of the hotkey
