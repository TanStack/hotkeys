---
id: ParsedHotkey
title: ParsedHotkey
---

# Interface: ParsedHotkey

Defined in: [hotkey.ts:309](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L309)

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

Defined in: [hotkey.ts:317](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L317)

Whether the Alt key is required

***

### ctrl

```ts
ctrl: boolean;
```

Defined in: [hotkey.ts:313](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L313)

Whether the Control key is required

***

### key

```ts
key: Key | string & object;
```

Defined in: [hotkey.ts:311](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L311)

The non-modifier key (e.g., 'S', 'Escape', 'F1', '/', '['). Can be any string for flexibility.

***

### meta

```ts
meta: boolean;
```

Defined in: [hotkey.ts:319](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L319)

Whether the Meta (Command) key is required

***

### modifiers

```ts
modifiers: CanonicalModifier[];
```

Defined in: [hotkey.ts:321](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L321)

List of canonical modifier names that are required, in canonical order

***

### shift

```ts
shift: boolean;
```

Defined in: [hotkey.ts:315](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L315)

Whether the Shift key is required
