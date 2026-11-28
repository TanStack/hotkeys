---
title: Type Keys from Other Keyboard Layouts in Svelte
id: keyboard-layouts
description: Register the keyboard layouts your Svelte app targets, so hotkey strings type-check with keys such as Ö, ß, and §.
---

By default, hotkey strings type-check against US QWERTY keys, so `createHotkey('Mod+Ö', toggleComment)` triggers a TypeScript error. At runtime, it already works when a German user presses `Ctrl+Ö` or `Cmd+Ö`.

Registering extra keyboard layout sets tells TypeScript to accept those characters too. It changes types only, adds zero runtime code to your bundle, and doesn't alter how keys match.

## Prefer keys every layout has

Most apps never need to register extra layouts. A to Z, 0 to 9, and common US punctuation already match across international layouts automatically:

- `Mod+S` matches on a Russian keyboard, where that key types `ы`.
- `Mod+;` matches on German `Ctrl+Ö` and Spanish `Ctrl+Ñ` in the same physical slot.
- On Greek, Cyrillic, and Hebrew layouts, prefer `Mod+A` over `Mod+Ф`. It matches on the same key and keeps working if the user toggles back to Latin.
- Punctuation that another layout types with `Shift`, such as `/` on German QWERTZ, can't match with `Command` held on macOS. See [Keys match the character the user types](../../../guides/sensible-defaults.md#keys-match-the-character-the-user-types) for why and how to add the shifted fallback.

Register layout sets only when you intentionally target keys unique to specific layouts, such as a single-key `ß` shortcut or shortcuts labeled with `Ö` in a localized UI.

## Register layouts

Augment `Register` with `keys`, a union of the layout types your app supports. Each set is a type exported from `@tanstack/svelte-hotkeys`:

```ts
import type { GermanKeys, UsKeys } from '@tanstack/svelte-hotkeys'

declare module '@tanstack/svelte-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}
```

Put this in a `.ts` file of your TypeScript project, such as `src/main.ts`, where you mount your app. In SvelteKit, `src/app.d.ts` works too. Run `svelte-check` to check the hotkeys in your components, because `tsc` alone doesn't read `.svelte` files. If you also register [app hotkeys](./app-hotkeys), add `keys` to the same `Register` interface, or declare it in another file. TypeScript merges the two.

German keys now type-check wherever a hotkey goes:

```ts
createHotkey('Mod+Ö', toggleComment)
createHotkey('ß', toggleSidebar)
createHotkey('Mod+[', outdent) // Still accepted, because UsKeys is listed
createHotkey('Mod+Ñ', search) // Type error: Spanish isn't registered
```

`createHotkeys`, `createHotkeyAttachment`, `createHotkeysAttachment`, `getHotkeyHint`, `getFormatForDisplay`, app hotkeys, custom hotkeys, and the `Hotkey` and `HotkeyChord` types all follow the registration.

## What the registration changes

- **Replaces `UsKeys` unless kept.** Include `UsKeys` in the union if you still want US punctuation like `[`. With `keys: GermanKeys` alone, `Mod+[` fails type-checking because German types `[` with `AltGr` or `Option`.
- **Always allowed.** A to Z, 0 to 9, named keys (`Escape`, `F1`), and physical codes (`[KeyS]`) work under every registration.
- **Casing.** Write letters uppercase (`Mod+Ö`, not `Mod+ö`), leaving `ß` and Turkish dotless `ı` as typed.
- **Shift-typed characters.** Layout letters typed with `Shift`, such as Turkish `İ` or Swiss German `È`, require `Shift+` (`Shift+İ`). Shift-typed symbols like `§` (via `Shift+3` on German) match without `Shift+`.
- **Recorder.** `createHotkeyRecorder` captures whatever key the user presses, even outside your registered TypeScript union.

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
