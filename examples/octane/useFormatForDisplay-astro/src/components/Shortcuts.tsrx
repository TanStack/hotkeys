import { HotkeysProvider } from '@tanstack/octane-hotkeys'
import { CheatSheetPage } from '../CheatSheetPage.tsrx'
import type { HotkeyPlatform } from '@tanstack/octane-hotkeys'

// Each island is its own Octane app, so the provider renders inside it
export function Shortcuts({ platform }: { platform: HotkeyPlatform }) @{
  <HotkeysProvider defaultOptions={{ platform }}>
    <CheatSheetPage />
  </HotkeysProvider>
}
