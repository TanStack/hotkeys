/**
 * The printable keys of the Portuguese (Portugal) layout, other than A-Z and
 * 0-9: what its keys type without a modifier and with Shift. Built from xkb
 * `pt`, macOS `Portuguese`, and Windows `pt-PT-t-k0-windows` from Unicode CLDR.
 * Left out, because not every platform types them without AltGr or Option: `«`
 * (Linux and Windows only), `»` (Linux and Windows only), `§` (macOS only), `±`
 * (macOS only).
 *
 * This layout types `ª` with Shift. Letters match Shift exactly, so bind them
 * with it, such as `Shift+ª`.
 */
export type PortugueseKeys =
  | '!'
  | '"'
  | '#'
  | '$'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | "'"
  | '?'
  | '+'
  | '*'
  | 'Ç'
  | 'º'
  | 'ª'
  | '\\'
  | '|'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'
