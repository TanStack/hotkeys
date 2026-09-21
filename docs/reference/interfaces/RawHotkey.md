---
id: RawHotkey
title: RawHotkey
---

Defined in: [hotkey.ts:316](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L316)

A raw hotkey object for programmatic registration.

Like `ParsedHotkey` but without `modifiers` (derived from booleans)
and with optional modifier booleans (default to `false` when omitted).
Use with `HotkeyManager.register()` and `useHotkey()` when you prefer
object form over a string.

The `mod` modifier is platform-adaptive: Command on macOS, Control on Windows/Linux.
Pass `platform` when converting to ParsedHotkey (e.g., via `options.platform`).

## Example

```ts
useHotkey({ key: 'S', mod: true }, handler)             // Mod+S (cross-platform)
useHotkey({ key: 'S', ctrl: true }, handler)            // Control+S
useHotkey({ key: 'Escape' }, handler)                   // Escape (no modifiers)
useHotkey({ key: 'A', shift: true, meta: true }, handler) // Shift+Meta+A
useHotkey({ key: 'S', mod: true, shift: true }, handler)  // Mod+Shift+S
```

## Properties

### alt?

```ts
optional alt?: boolean;
```

Defined in: [hotkey.ts:326](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L326)

Whether the Alt key is required. Defaults to false.

***

### ctrl?

```ts
optional ctrl?: boolean;
```

Defined in: [hotkey.ts:322](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L322)

Whether the Control key is required. Defaults to false.

***

### key

```ts
key: Key | string & object;
```

Defined in: [hotkey.ts:318](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L318)

The non-modifier key (e.g., 'S', 'Escape', 'F1').

***

### meta?

```ts
optional meta?: boolean;
```

Defined in: [hotkey.ts:328](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L328)

Whether the Meta (Command) key is required. Defaults to false.

***

### mod?

```ts
optional mod?: boolean;
```

Defined in: [hotkey.ts:320](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L320)

Platform-adaptive modifier: Command on macOS, Control on Windows/Linux. Defaults to false.

***

### shift?

```ts
optional shift?: boolean;
```

Defined in: [hotkey.ts:324](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L324)

Whether the Shift key is required. Defaults to false.
