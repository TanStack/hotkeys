/**
 * The printable keys of the Turkish Q layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `tr`, macOS
 * `Turkish-QWERTY-PC`, and Windows `tr-t-k0-windows` from Unicode CLDR. Left
 * out, because not every platform types them without AltGr or Option: `^`
 * (Linux only).
 *
 * This layout types `İ` and `É` with Shift. Letters match Shift exactly, so
 * bind them with it, such as `Shift+İ`.
 *
 * Dotless `ı` is written lowercase, as it is typed.
 */
export type TurkishKeys =
  | '!'
  | "'"
  | '+'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | '*'
  | '?'
  | '-'
  | '_'
  | 'ı'
  | 'Ğ'
  | 'Ü'
  | 'Ş'
  | 'İ'
  | '"'
  | 'É'
  | ','
  | ';'
  | 'Ö'
  | 'Ç'
  | '.'
  | ':'
  | '<'
  | '>'
