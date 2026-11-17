/**
 * The printable keys of the Spanish (Spain) layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb `es`,
 * macOS `Spanish-ISO`, and Windows `es-t-k0-windows` from Unicode CLDR.
 *
 * This layout types `ª` with Shift. Letters match Shift exactly, so bind them
 * with it, such as `Shift+ª`.
 */
export type SpanishKeys =
  | '!'
  | '"'
  | '·'
  | '$'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | "'"
  | '?'
  | '¡'
  | '¿'
  | '+'
  | '*'
  | 'Ñ'
  | 'º'
  | 'ª'
  | 'Ç'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'
