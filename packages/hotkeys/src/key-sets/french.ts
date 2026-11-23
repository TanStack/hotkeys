/**
 * The printable keys of the French AZERTY layout, other than A-Z and 0-9: what
 * its keys type without a modifier and with Shift. Built from xkb `fr`, macOS
 * `French` and `French-PC`, and Windows `fr-t-k0-windows` from Unicode CLDR.
 * Left out, because not every platform types them without AltGr or Option: `²`
 * (Linux, macOS French-PC and Windows only), `~` (Linux only), `@` (macOS
 * French only), `#` (macOS French only), `Μ` (macOS French-PC only).
 */
export type FrenchKeys =
  | '&'
  | 'É'
  | '"'
  | "'"
  | '('
  | '-'
  | 'È'
  | '_'
  | 'Ç'
  | 'À'
  | ')'
  | '°'
  | '='
  | '+'
  | '$'
  | '£'
  | 'Ù'
  | '%'
  | '*'
  | ','
  | '?'
  | ';'
  | '.'
  | ':'
  | '/'
  | '!'
  | '§'
  | '<'
  | '>'

/**
 * The printable keys of the Belgian AZERTY layout, other than A-Z and 0-9. It
 * types the same characters as French AZERTY. Built from xkb `be`, macOS
 * `Belgian`, and Windows `fr-BE-t-k0-windows` from Unicode CLDR.
 */
export type BelgianKeys = FrenchKeys
