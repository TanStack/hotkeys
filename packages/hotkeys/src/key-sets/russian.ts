/**
 * The printable keys of the Russian (ЙЦУКЕН) layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb `ru`,
 * macOS `RussianWin`, and Windows `ru-t-k0-windows` from Unicode CLDR. Left
 * out, because not every platform types them without AltGr or Option: `|`
 * (Linux only), `Ë` (macOS only).
 *
 * For shortcuts, prefer the US letter names, such as `Mod+A`. They fire on the
 * same keys on this layout, and keep working after the user switches to a Latin
 * layout. A binding on a letter of this layout fires only while it is active.
 */
export type RussianKeys =
  | '!'
  | '"'
  | '№'
  | ';'
  | '%'
  | ':'
  | '?'
  | '*'
  | '('
  | ')'
  | '-'
  | '_'
  | '='
  | '+'
  | 'Й'
  | 'Ц'
  | 'У'
  | 'К'
  | 'Е'
  | 'Н'
  | 'Г'
  | 'Ш'
  | 'Щ'
  | 'З'
  | 'Х'
  | 'Ъ'
  | 'Ф'
  | 'Ы'
  | 'В'
  | 'А'
  | 'П'
  | 'Р'
  | 'О'
  | 'Л'
  | 'Д'
  | 'Ж'
  | 'Э'
  | 'Ё'
  | '\\'
  | '/'
  | 'Я'
  | 'Ч'
  | 'С'
  | 'М'
  | 'И'
  | 'Т'
  | 'Ь'
  | 'Б'
  | 'Ю'
  | '.'
  | ','
