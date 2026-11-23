/**
 * The printable keys of the Romanian (standard) layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb
 * `ro(std)`, macOS `Romanian-Standard`, and Windows `ro-t-k0-windows` from
 * Unicode CLDR. Left out, because not every platform types them without AltGr
 * or Option: `^` (Linux and macOS only).
 */
export type RomanianKeys =
  | '!'
  | '@'
  | '#'
  | '$'
  | '%'
  | '&'
  | '*'
  | '('
  | ')'
  | '-'
  | '_'
  | '='
  | '+'
  | 'Ă'
  | 'Î'
  | 'Ș'
  | 'Ț'
  | '„'
  | '”'
  | 'Â'
  | ','
  | ';'
  | '.'
  | ':'
  | '/'
  | '?'
  | '\\'
  | '|'
