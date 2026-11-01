import { HotkeysProvider } from '@tanstack/react-hotkeys'
import { CheatSheetPage } from '../CheatSheetPage'
import type { HotkeyPlatform } from '@tanstack/react-hotkeys'

// Each island is its own React app, so the provider renders inside it
export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheetPage />
    </HotkeysProvider>
  )
}
