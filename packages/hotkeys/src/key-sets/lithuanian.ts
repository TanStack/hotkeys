/**
 * The printable keys of the Lithuanian layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `lt`, macOS
 * `Lithuanian`, and Windows `lt-t-k0-windows` from Unicode CLDR. Left out,
 * because not every platform types them without AltGr or Option: `„` (Linux and
 * macOS only), `“` (Linux and macOS only), `–` (Linux only), `€` (Linux only),
 * `§` (macOS only), `±` (macOS only).
 */
export type LithuanianKeys =
  | 'Ą'
  | 'Č'
  | 'Ę'
  | 'Ė'
  | 'Į'
  | 'Š'
  | 'Ų'
  | 'Ū'
  | '('
  | ')'
  | '-'
  | '_'
  | 'Ž'
  | '['
  | '{'
  | ']'
  | '}'
  | ';'
  | ':'
  | "'"
  | '"'
  | '`'
  | '~'
  | '\\'
  | '|'
  | ','
  | '<'
  | '.'
  | '>'
  | '/'
  | '?'
