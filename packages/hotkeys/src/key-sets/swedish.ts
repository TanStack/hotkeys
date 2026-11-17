/**
 * The printable keys of the Swedish layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `se`, macOS
 * `Swedish`, and Windows `sv-t-k0-windows` from Unicode CLDR. Left out, because
 * not every platform types them without AltGr or Option: `¤` (Linux and Windows
 * only), `½` (Linux and Windows only), `€` (macOS only), `°` (macOS only).
 */
export type SwedishKeys =
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
  | 'Å'
  | 'Ö'
  | 'Ä'
  | '§'
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

/**
 * The printable keys of the Finnish layout, other than A-Z and 0-9. It types
 * the same characters as Swedish. Built from xkb `fi`, macOS `Finnish`, and
 * Windows `fi-t-k0-windows` from Unicode CLDR.
 */
export type FinnishKeys = SwedishKeys
