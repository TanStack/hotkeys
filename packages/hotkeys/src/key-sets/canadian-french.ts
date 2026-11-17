/**
 * The printable keys of the Canadian French layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb `ca`,
 * macOS `CanadianFrench-PC`, and Windows `fr-CA-t-k0-windows-var` from Unicode
 * CLDR. Left out, because not every platform types them without AltGr or
 * Option: `«` (Linux and Windows only), `»` (Linux and Windows only), `^`
 * (macOS only), `` ` `` (macOS only).
 */
export type CanadianFrenchKeys =
  | '!'
  | '"'
  | '/'
  | '$'
  | '%'
  | '?'
  | '&'
  | '*'
  | '('
  | ')'
  | '-'
  | '_'
  | '='
  | '+'
  | ';'
  | ':'
  | '#'
  | '|'
  | '<'
  | '>'
  | ','
  | "'"
  | '.'
  | 'É'
