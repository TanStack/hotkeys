/**
 * The printable keys of the UK (British) QWERTY layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb `gb`,
 * macOS `British` and `British-PC`, and Windows `en-GB-t-k0-windows` from
 * Unicode CLDR. Left out, because not every platform types them without AltGr
 * or Option: `¬` (Linux, macOS British-PC and Windows only), `#` (Linux, macOS
 * British-PC and Windows only), `§` (macOS British only), `±` (macOS British
 * only).
 */
export type UkKeys =
  | '!'
  | '"'
  | '£'
  | '$'
  | '%'
  | '^'
  | '&'
  | '*'
  | '('
  | ')'
  | '-'
  | '_'
  | '='
  | '+'
  | '['
  | '{'
  | ']'
  | '}'
  | ';'
  | ':'
  | "'"
  | '@'
  | '`'
  | '~'
  | ','
  | '<'
  | '.'
  | '>'
  | '/'
  | '?'
  | '\\'
  | '|'
