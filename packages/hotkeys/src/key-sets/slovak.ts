/**
 * The printable keys of the Slovak QWERTZ layout, other than A-Z and 0-9: what
 * its keys type without a modifier and with Shift. Built from xkb `sk`, macOS
 * `Slovak`, and Windows `sk-t-k0-windows` from Unicode CLDR. Left out, because
 * not every platform types them without AltGr or Option: `;` (Linux and Windows
 * only), `\` (Linux and macOS only), `|` (Linux and macOS only), `<` (macOS
 * only), `>` (macOS only), `&` (Windows only), `*` (Windows only).
 */
export type SlovakKeys =
  | '+'
  | 'Ľ'
  | 'Š'
  | 'Č'
  | 'Ť'
  | 'Ž'
  | 'Ý'
  | 'Á'
  | 'Í'
  | 'É'
  | '='
  | '%'
  | 'Ú'
  | '/'
  | 'Ä'
  | '('
  | 'Ô'
  | '"'
  | '§'
  | '!'
  | 'Ň'
  | ')'
  | ','
  | '?'
  | '.'
  | ':'
  | '-'
  | '_'
