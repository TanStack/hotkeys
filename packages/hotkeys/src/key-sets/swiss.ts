/**
 * The printable keys of the Swiss German QWERTZ layout, other than A-Z and 0-9:
 * what its keys type without a modifier and with Shift. Built from xkb `ch`,
 * macOS `SwissGerman`, and Windows `de-CH-t-k0-windows` from Unicode CLDR.
 *
 * This layout types `Ç`, `È`, `É` and `À` with Shift. Letters match Shift
 * exactly, so bind them with it, such as `Shift+Ç`.
 */
export type SwissGermanKeys =
  | '+'
  | '"'
  | '*'
  | 'Ç'
  | '%'
  | '&'
  | '/'
  | '('
  | ')'
  | '='
  | "'"
  | '?'
  | 'Ü'
  | 'È'
  | '!'
  | 'Ö'
  | 'É'
  | 'Ä'
  | 'À'
  | '§'
  | '°'
  | '$'
  | '£'
  | ','
  | ';'
  | '.'
  | ':'
  | '-'
  | '_'
  | '<'
  | '>'

/**
 * The printable keys of the Swiss French QWERTZ layout, other than A-Z and 0-9.
 * It types the same characters as Swiss German QWERTZ. Built from xkb `ch(fr)`,
 * macOS `SwissFrench`, and Windows `fr-CH-t-k0-windows` from Unicode CLDR.
 *
 * This layout types `Ç`, `Ü`, `Ö` and `Ä` with Shift. Letters match Shift
 * exactly, so bind them with it, such as `Shift+Ç`.
 */
export type SwissFrenchKeys = SwissGermanKeys
