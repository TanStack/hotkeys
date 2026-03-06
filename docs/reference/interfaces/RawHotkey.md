---
id: RawHotkey
title: RawHotkey
---

# Interface: RawHotkey

Defined in: [hotkey.ts:366](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L366)

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
optional alt: boolean;
```

Defined in: [hotkey.ts:376](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L376)

Whether the Alt key is required. Defaults to false.

***

### ctrl?

```ts
optional ctrl: boolean;
```

Defined in: [hotkey.ts:372](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L372)

Whether the Control key is required. Defaults to false.

***

### key

```ts
key: Key | string & object;
```

Defined in: [hotkey.ts:368](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L368)

The non-modifier key (e.g., 'S', 'Escape', 'F1').

***

### meta?

```ts
optional meta: boolean;
```

Defined in: [hotkey.ts:378](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L378)

Whether the Meta (Command) key is required. Defaults to false.

***

### mod?

```ts
optional mod: boolean;
```

Defined in: [hotkey.ts:370](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L370)

Platform-adaptive modifier: Command on macOS, Control on Windows/Linux. Defaults to false.

***

### shift?

```ts
optional shift: boolean;
```

Defined in: [hotkey.ts:374](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L374)

Whether the Shift key is required. Defaults to false.
