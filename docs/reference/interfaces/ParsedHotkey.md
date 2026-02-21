---
id: ParsedHotkey
title: ParsedHotkey
---

# Interface: ParsedHotkey

Defined in: [hotkey.ts:331](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L331)

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

Defined in: [hotkey.ts:339](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L339)

Whether the Alt key is required

***

### ctrl

```ts
ctrl: boolean;
```

Defined in: [hotkey.ts:335](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L335)

Whether the Control key is required

***

### key

```ts
key: Key | string & object;
```

Defined in: [hotkey.ts:333](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L333)

The non-modifier key (e.g., 'S', 'Escape', 'F1', '/', '['). Can be any string for flexibility.

***

### meta

```ts
meta: boolean;
```

Defined in: [hotkey.ts:341](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L341)

Whether the Meta (Command) key is required

***

### modifiers

```ts
modifiers: CanonicalModifier[];
```

Defined in: [hotkey.ts:343](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L343)

List of canonical modifier names that are required, in canonical order

***

### shift

```ts
shift: boolean;
```

Defined in: [hotkey.ts:337](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L337)

Whether the Shift key is required
