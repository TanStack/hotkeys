/**
 * The printable keys of the Italian layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `it`, macOS
 * `Italian`, and Windows `it-t-k0-windows` from Unicode CLDR. Left out, because
 * not every platform types them without AltGr or Option: `^` (Linux and Windows
 * only), `\` (Linux and Windows only), `|` (Linux and Windows only), `@` (macOS
 * only), `#` (macOS only).
 *
 * This layout types `É` and `Ç` with Shift. Letters match Shift exactly, so
 * bind them with it, such as `Shift+É`.
 */
export type ItalianKeys =
  | '!'
  | '"'
  | '£'
  | '$'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | "'"
  | '?'
  | 'Ì'
  | 'È'
  | 'É'
  | '+'
  | '*'
  | 'Ò'
  | 'Ç'
  | 'À'
  | '°'
  | 'Ù'
  | '§'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'
