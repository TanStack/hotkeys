import { createDevtoolsPlugin } from '@tanstack/hotkeys-devtools'

export const hotkeysDevtoolsPlugin = createDevtoolsPlugin()

export const hotkeysDevtoolsNoOpPlugin = {
  name: 'HotkeysDevtools',
  init: () => {},
}
