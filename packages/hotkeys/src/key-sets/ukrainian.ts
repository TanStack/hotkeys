/**
 * The printable keys of the Ukrainian layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `ua`, macOS
 * `Ukrainian-PC`, and Windows `uk-t-k0-windows` from Unicode CLDR. Left out,
 * because not every platform types them without AltGr or Option: `'` (Linux
 * only), `ʼ` (Linux and macOS only), `|` (Linux only), `₴` (macOS only), `\`
 * (macOS and Windows only), `Ё` (Windows only).
 *
 * For shortcuts, prefer the US letter names, such as `Mod+A`. They fire on the
 * same keys on this layout, and keep working after the user switches to a Latin
 * layout. A binding on a letter of this layout fires only while it is active.
 */
export type UkrainianKeys =
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
  | 'Ї'
  | 'Ф'
  | 'І'
  | 'В'
  | 'А'
  | 'П'
  | 'Р'
  | 'О'
  | 'Л'
  | 'Д'
  | 'Ж'
  | 'Є'
  | 'Ґ'
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
  | '/'
