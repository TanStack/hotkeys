/**
 * The printable keys of the Greek layout, other than A-Z and 0-9: what its keys
 * type without a modifier and with Shift. Built from xkb `gr`, macOS `Greek`,
 * and Windows `el-t-k0-windows` from Unicode CLDR. Left out, because not every
 * platform types them without AltGr or Option: `«` (Linux only), `»` (Linux
 * only), `§` (macOS only), `±` (macOS only).
 *
 * For shortcuts, prefer the US letter names, such as `Mod+A`. They fire on the
 * same keys on this layout, and keep working after the user switches to a Latin
 * layout. A binding on a letter of this layout fires only while it is active.
 */
export type GreekKeys =
  | '!'
  | '@'
  | '#'
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
  | ';'
  | ':'
  | 'Σ'
  | 'Ε'
  | 'Ρ'
  | 'Τ'
  | 'Υ'
  | 'Θ'
  | 'Ι'
  | 'Ο'
  | 'Π'
  | '['
  | '{'
  | ']'
  | '}'
  | 'Α'
  | 'Δ'
  | 'Φ'
  | 'Γ'
  | 'Η'
  | 'Ξ'
  | 'Κ'
  | 'Λ'
  | "'"
  | '"'
  | '`'
  | '~'
  | '\\'
  | '|'
  | 'Ζ'
  | 'Χ'
  | 'Ψ'
  | 'Ω'
  | 'Β'
  | 'Ν'
  | 'Μ'
  | ','
  | '<'
  | '.'
  | '>'
  | '/'
  | '?'
