---
title: Type Keys from Other Keyboard Layouts in Lit
id: keyboard-layouts
description: Register the keyboard layouts your Lit app targets, so hotkey strings type-check with keys such as Ö, ß, and §.
---

Hotkey strings type-check against the keys of a US QWERTY keyboard, so `@hotkey('Mod+Ö')` is a type error. The hotkey itself works: it fires when a German user presses Ctrl+Ö or Command+Ö. Only TypeScript rejects it. Registering the layouts your app targets makes TypeScript accept their keys.

Registering a layout changes types only. It doesn't change how hotkeys match, and it adds no code to your bundle. Most apps don't need it. Use it when your app targets users of specific layouts and you want shortcuts on keys only those layouts have.

## Prefer keys every layout has

A hotkey on a key that only one layout types fires only for users of that layout. US users can't press `Mod+Ö`. For a shortcut every user should have, bind A to Z or 0 to 9 instead. TanStack Hotkeys matches these on other layouts, and many US punctuation keys too:

- `Mod+S` fires on a Russian layout, where that key types `ы`.
- `Mod+;` fires on German Ctrl+Ö and Spanish Ctrl+Ñ, which sit in the same position.
- On Greek, Cyrillic, and Hebrew layouts, bind `Mod+A`, not `Mod+Ф`. It fires on the same key, and keeps working after the user switches to a Latin layout.
- US punctuation that a layout types with Shift, such as `/` on German, can't match while Command is held on macOS. [Sensible Defaults](../../../guides/sensible-defaults.md#keys-match-the-character-the-user-types) explains why, and which hotkey to add.

Register a layout when the key itself matters, such as a single-key `ß` shortcut, or a shortcut that your German interface labels with `Ö`.

## Register layouts

Augment `Register` with `keys`, a union of the sets your app targets. Each set is a type exported from `@tanstack/lit-hotkeys`:

```ts
import type { GermanKeys, UsKeys } from '@tanstack/lit-hotkeys'

declare module '@tanstack/lit-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}
```

Put this in any file of your TypeScript project, such as the file that defines your root element. If you also register [app hotkeys](./app-hotkeys), add `keys` to the same `Register` interface, or declare it in another file. TypeScript merges the two.

German keys now type-check wherever a hotkey goes:

```ts
@hotkey('Mod+Ö')
toggleComment() {}

@hotkey('ß')
toggleSidebar() {}

@hotkey('Mod+[') // Still accepted, because UsKeys is listed
outdent() {}

@hotkey('Mod+Ñ') // Type error: Spanish isn't registered
search() {}
```

`HotkeyController`, `HotkeyHintController`, `FormatForDisplayController`, app hotkeys, custom hotkeys, and the `Hotkey` and `HotkeyChord` types all follow the registration.

## What the registration changes

- The sets replace the US keys. Keep `UsKeys` in the union to keep them. With `keys: GermanKeys` alone, `Mod+[` is a type error, because German types `[` only with AltGr or Option.
- A to Z, 0 to 9, named keys such as `Escape` and `F1`, and physical codes such as `[KeyS]` type-check under every registration.
- Write letters in uppercase, as you do for A to Z: `Mod+Ö`, not `Mod+ö`. `ß` and the Turkish `ı` stay as typed.
- Letters match Shift exactly. A letter that your layout types with Shift, such as Turkish `İ` or Swiss German `È`, needs Shift in the hotkey: `Shift+İ`. Symbols typed with Shift don't: German types `§` with Shift+3, and `§` matches it.
- The recorder records whatever the user presses, which can be a key outside your registered sets.

## Available key sets

Identical layouts share a set under several aliases, such as `AustrianKeys` and `GermanKeys`. Each set includes characters typed unshifted or with `Shift` across Windows, macOS, and Linux, excluding dead keys and `AltGr` or `Option` characters:

| Set | Layouts |
| --- | --- |
| `UsKeys` | US QWERTY (default) |
| `UkKeys` | UK (British) |
| `GermanKeys`, `AustrianKeys` | German and Austrian QWERTZ |
| `SwissGermanKeys`, `SwissFrenchKeys` | Swiss German and Swiss French |
| `FrenchKeys`, `BelgianKeys` | French and Belgian AZERTY |
| `CanadianFrenchKeys` | Canadian French |
| `SpanishKeys`, `LatinAmericanKeys` | Spanish (Spain) and Latin American |
| `PortugueseKeys`, `BrazilianKeys` | Portuguese (Portugal) and Brazilian ABNT2 |
| `ItalianKeys` | Italian |
| `DanishKeys`, `NorwegianKeys` | Danish and Norwegian |
| `SwedishKeys`, `FinnishKeys` | Swedish and Finnish |
| `IcelandicKeys` | Icelandic |
| `CzechKeys`, `SlovakKeys`, `HungarianKeys` | Czech, Slovak, and Hungarian QWERTZ |
| `CroatianKeys`, `SlovenianKeys`, `SerbianLatinKeys` | Croatian, Slovenian, and Serbian (Latin) |
| `EstonianKeys`, `LithuanianKeys` | Estonian and Lithuanian |
| `TurkishKeys` | Turkish Q |
| `RomanianKeys` | Romanian (standard) |
| `GreekKeys`, `RussianKeys`, `UkrainianKeys`, `BulgarianKeys`, `HebrewKeys` | Greek, Russian, Ukrainian, Bulgarian (BDS), and Hebrew |

Polish and Latvian share US QWERTY base keys without `AltGr`, and most Dutch users use US International, so they don't need separate sets.

## Example

The [Keyboard Layouts example](../examples/keyboard-layouts) registers German keys and shows which hotkeys fire on a German keyboard.
