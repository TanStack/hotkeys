import { ThemeContextProvider } from '@tanstack/devtools-ui'
import { HotkeysContextProvider } from '../HotkeysContextProvider'
import { Shell } from './Shell'

import type { TanStackDevtoolsTheme } from '@tanstack/devtools-ui'

interface DevtoolsProps {
  theme: TanStackDevtoolsTheme
}

export default function HotkeysDevtools(props: DevtoolsProps) {
  return (
    <ThemeContextProvider theme={props.theme}>
      <HotkeysContextProvider>
        <Shell />
      </HotkeysContextProvider>
    </ThemeContextProvider>
  )
}
