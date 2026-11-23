import type { HotkeysDevtoolsPanelProps } from './types'

/** The plugin name each framework's devtools plugin registers with. */
export const HOTKEYS_DEVTOOLS_PLUGIN_NAME = 'TanStack Hotkeys'

/** The panel props each framework panel uses when a prop is not passed. */
export const HOTKEYS_DEVTOOLS_DEFAULT_PROPS: Readonly<HotkeysDevtoolsPanelProps> =
  {
    theme: 'dark',
    devtoolsOpen: true,
  }
