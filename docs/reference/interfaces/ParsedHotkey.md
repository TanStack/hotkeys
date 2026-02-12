---
id: ParsedHotkey
title: ParsedHotkey
---

# Interface: ParsedHotkey

Defined in: [hotkey.ts:308](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L308)

A parsed representation of a hotkey string.

This interface provides a flexible fallback when the `Hotkey` type doesn't
fit your use case. You can pass a `ParsedHotkey` directly to hotkey functions
instead of a hotkey string, allowing for more dynamic or complex scenarios
that aren't covered by the type-safe `Hotkey` union.

## Example

```ts
// Type-safe hotkey string
useHotkey('Mod+S', handler)

// Fallback: parsed hotkey for dynamic scenarios
const parsed = parseHotkey(userInput)
useHotkey(parsed, handler) // Works even if userInput isn't in Hotkey type
```

## Properties

### alt

```ts
alt: boolean;
```

Defined in: [hotkey.ts:316](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L316)

Whether the Alt key is required

***

### ctrl

```ts
ctrl: boolean;
```

Defined in: [hotkey.ts:312](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L312)

Whether the Control key is required

***

### key

```ts
key: Key | string & object;
```

Defined in: [hotkey.ts:310](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L310)

The non-modifier key (e.g., 'S', 'Escape', 'F1', '/', '['). Can be any string for flexibility.

***

### meta

```ts
meta: boolean;
```

Defined in: [hotkey.ts:318](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L318)

Whether the Meta (Command) key is required

***

### modifiers

```ts
modifiers: CanonicalModifier[];
```

Defined in: [hotkey.ts:320](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L320)

List of canonical modifier names that are required, in canonical order

***

### shift

```ts
shift: boolean;
```

Defined in: [hotkey.ts:314](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L314)

Whether the Shift key is required
