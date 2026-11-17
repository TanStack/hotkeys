/**
 * The printable keys of the Danish layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `dk`, macOS
 * `Danish`, and Windows `da-t-k0-windows` from Unicode CLDR. Left out, because
 * not every platform types them without AltGr or Option: `¤` (Linux and Windows
 * only), `½` (Linux and Windows only), `€` (macOS only), `$` (macOS only).
 */
export type DanishKeys =
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
  | 'Æ'
  | 'Ø'
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
 * The printable keys of the Norwegian layout, other than A-Z and 0-9. It types
 * the same characters as Danish. Built from xkb `no`, macOS `Norwegian`, and
 * Windows `nb-t-k0-windows` from Unicode CLDR.
 */
export type NorwegianKeys = DanishKeys
