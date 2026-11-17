/**
 * The printable keys of the Croatian layout, other than A-Z and 0-9: what its
 * keys type without a modifier and with Shift. Built from xkb `hr`, macOS
 * `Croatian-PC`, and Windows `sr-Latn-t-k0-windows` from Unicode CLDR. Left
 * out, because not every platform types them without AltGr or Option: `` ` ``
 * (Linux only), `~` (Linux and Windows only), `“` (macOS only), `”` (macOS
 * only).
 */
export type CroatianKeys =
  | '!'
  | '"'
  | '#'
  | '$'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | "'"
  | '?'
  | '+'
  | '*'
  | 'Š'
  | 'Đ'
  | 'Č'
  | 'Ć'
  | 'Ž'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'

/**
 * The printable keys of the Slovenian layout, other than A-Z and 0-9. It types
 * the same characters as Croatian. Built from xkb `si`, macOS `Slovenian`, and
 * Windows `sl-t-k0-windows` from Unicode CLDR.
 */
export type SlovenianKeys = CroatianKeys

/**
 * The printable keys of the Serbian (Latin) layout, other than A-Z and 0-9. It
 * types the same characters as Croatian. Built from xkb `rs(latin)`, macOS
 * `Serbian-Latin`, and Windows `sr-Latn-t-k0-windows` from Unicode CLDR.
 */
export type SerbianLatinKeys = CroatianKeys
