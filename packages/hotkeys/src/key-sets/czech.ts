/**
 * The printable keys of the Czech QWERTZ layout, other than A-Z and 0-9: what
 * its keys type without a modifier and with Shift. Built from xkb `cz`, macOS
 * `Czech`, and Windows `cs-t-k0-windows` from Unicode CLDR. Left out, because
 * not every platform types them without AltGr or Option: `;` (Linux and Windows
 * only), `'` (Linux and Windows only), `` ` `` (macOS only), `<` (macOS only),
 * `>` (macOS only).
 */
export type CzechKeys =
  | '+'
  | 'Ě'
  | 'Š'
  | 'Č'
  | 'Ř'
  | 'Ž'
  | 'Ý'
  | 'Á'
  | 'Í'
  | 'É'
  | '='
  | '%'
  | 'Ú'
  | '/'
  | ')'
  | '('
  | 'Ů'
  | '"'
  | '§'
  | '!'
  | ','
  | '?'
  | '.'
  | ':'
  | '-'
  | '_'
  | '\\'
  | '|'
