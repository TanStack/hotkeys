/**
 * The printable keys of the Latin American Spanish layout, other than A-Z and
 * 0-9: what its keys type without a modifier and with Shift. Built from xkb
 * `latam`, macOS `LatinAmerican`, and Windows `es-419-t-k0-windows` from
 * Unicode CLDR. Left out, because not every platform types them without AltGr
 * or Option: `<` (Linux and Windows only), `>` (Linux and Windows only).
 */
export type LatinAmericanKeys =
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
  | '¿'
  | '¡'
  | '+'
  | '*'
  | 'Ñ'
  | '{'
  | '['
  | '|'
  | '°'
  | '}'
  | ']'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
