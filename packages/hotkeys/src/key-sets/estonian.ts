/**
 * The printable keys of the Estonian layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `ee`, macOS
 * `Estonian`, and Windows `et-t-k0-windows` from Unicode CLDR. Left out,
 * because not every platform types them without AltGr or Option: `¤` (Linux and
 * Windows only), `€` (macOS only).
 */
export type EstonianKeys =
  | '!'
  | '"'
  | '#'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | '+'
  | '?'
  | 'Ü'
  | 'Õ'
  | 'Ö'
  | 'Ä'
  | "'"
  | '*'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'
