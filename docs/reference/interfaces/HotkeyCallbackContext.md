---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

Defined in: [hotkey.types.ts:229](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L229)

Context passed to hotkey callbacks along with the keyboard event.

## Properties

### hotkey

```ts
hotkey: Hotkey;
```

Defined in: [hotkey.types.ts:231](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L231)

The registered hotkey: a chord string or a sequence

***

### parsedHotkey

```ts
parsedHotkey: ParsedHotkey;
```

Defined in: [hotkey.types.ts:233](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L233)

The parsed chord that completed the match (the last step of a sequence)
