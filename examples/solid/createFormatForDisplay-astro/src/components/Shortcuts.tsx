import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import { CheatSheetPage } from '../CheatSheetPage'
import type { HotkeyPlatform } from '@tanstack/solid-hotkeys'

// Each island is its own Solid app, so the provider renders inside it
export default function Shortcuts(props: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform: props.platform }}>
      <CheatSheetPage />
    </HotkeysProvider>
  )
}
