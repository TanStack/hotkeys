/**
 * The printable keys of the German QWERTZ layout, other than A-Z and 0-9: what
 * its keys type without a modifier and with Shift. Built from xkb `de`, macOS
 * `German`, and Windows `de-t-k0-windows` from Unicode CLDR.
 */
export type GermanKeys =
  | '!'
  | '"'
  | '§'
  | '$'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | 'ß'
  | '?'
  | 'Ü'
  | '+'
  | '*'
  | 'Ö'
  | 'Ä'
  | '°'
  | '#'
  | "'"
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'

/**
 * The printable keys of the Austrian QWERTZ layout, other than A-Z and 0-9. It
 * types the same characters as German QWERTZ. Built from xkb `at`, macOS
 * `Austrian`, and Windows `de-t-k0-windows` from Unicode CLDR.
 */
export type AustrianKeys = GermanKeys
