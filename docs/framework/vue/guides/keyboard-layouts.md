---
title: Type Keys from Other Keyboard Layouts in Vue
id: keyboard-layouts
description: Register the keyboard layouts your Vue app targets, so hotkey strings type-check with keys such as Ö, ß, and §.
---

Hotkey strings type-check against the keys of a US QWERTY keyboard, so `useHotkey('Mod+Ö', toggleComment)` is a type error. The hotkey itself works: it fires when a German user presses Ctrl+Ö or Command+Ö. Only TypeScript rejects it. Registering the layouts your app targets makes TypeScript accept their keys.

Registering a layout changes types only. It doesn't change how hotkeys match, and it adds no code to your bundle. Most apps don't need it. Use it when your app targets users of specific layouts and you want shortcuts on keys only those layouts have.

## Prefer keys every layout has

A hotkey on a key that only one layout types fires only for users of that layout. US users can't press `Mod+Ö`. For a shortcut every user should have, bind A to Z or 0 to 9 instead. TanStack Hotkeys matches these on other layouts, and many US punctuation keys too:

- `Mod+S` fires on a Russian layout, where that key types `ы`.
- `Mod+;` fires on German Ctrl+Ö and Spanish Ctrl+Ñ, which sit in the same position.
- On Greek, Cyrillic, and Hebrew layouts, bind `Mod+A`, not `Mod+Ф`. It fires on the same key, and keeps working after the user switches to a Latin layout.
- US punctuation that a layout types with Shift, such as `/` on German, can't match while Command is held on macOS. [Sensible Defaults](../../../guides/sensible-defaults.md#keys-match-the-character-the-user-types) explains why, and which hotkey to add.

Register a layout when the key itself matters, such as a single-key `ß` shortcut, or a shortcut that your German interface labels with `Ö`.

## Register layouts

Augment `Register` with `keys`, a union of the sets your app targets. Each set is a type exported from `@tanstack/vue-hotkeys`:

```ts
// src/main.ts
import type { GermanKeys, UsKeys } from '@tanstack/vue-hotkeys'

declare module '@tanstack/vue-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}
```

Put this in a `.ts` file, such as the `main.ts` where you call `createApp`. `tsc` doesn't read `.vue` files, so it misses a declaration inside a component. `vue-tsc` reads both. If you also register [app hotkeys](./app-hotkeys), add `keys` to the same `Register` interface, or declare it in another file. TypeScript merges the two.

German keys now type-check wherever a hotkey goes, including `<script setup>`:

```ts
useHotkey('Mod+Ö', toggleComment)
useHotkey('ß', toggleSidebar)
useHotkey('Mod+[', outdent) // Still accepted, because UsKeys is listed
useHotkey('Mod+Ñ', search) // Type error: Spanish isn't registered
```

`useHotkeys`, `useHotkeyHint`, `useFormatForDisplay`, app hotkeys, custom hotkeys, and the `Hotkey` and `HotkeyChord` types all follow the registration.

## What the registration changes

- The sets replace the US keys. Keep `UsKeys` in the union to keep them. With `keys: GermanKeys` alone, `Mod+[` is a type error, because German types `[` only with AltGr or Option.
- A to Z, 0 to 9, named keys such as `Escape` and `F1`, and physical codes such as `[KeyS]` type-check under every registration.
- Write letters in uppercase, as you do for A to Z: `Mod+Ö`, not `Mod+ö`. `ß` and the Turkish `ı` stay as typed.
- Letters match Shift exactly. A letter that your layout types with Shift, such as Turkish `İ` or Swiss German `È`, needs Shift in the hotkey: `Shift+İ`. Symbols typed with Shift don't: German types `§` with Shift+3, and `§` matches it.
- The recorder records whatever the user presses, which can be a key outside your registered sets.

## Choose the sets

There are 26 sets, which cover 33 layouts, such as `UkKeys`, `FrenchKeys`, `SwedishKeys`, and `RussianKeys`. Layouts that type the same keys share a set under two names, such as `AustrianKeys` and `GermanKeys`. [Sensible Defaults](../../../guides/sensible-defaults.md#type-keys-from-other-keyboard-layouts) lists every set and how each one is built.

## Example

The [Keyboard Layouts example](../examples/keyboard-layouts) registers German keys and shows which hotkeys fire on a German keyboard.
