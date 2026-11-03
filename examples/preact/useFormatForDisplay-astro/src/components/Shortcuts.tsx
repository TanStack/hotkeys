import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import { CheatSheetPage } from '../CheatSheetPage'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'

// Each island is its own Preact app, so the provider renders inside it
export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheetPage />
    </HotkeysProvider>
  )
}
