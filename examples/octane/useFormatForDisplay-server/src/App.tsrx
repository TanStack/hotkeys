import { HotkeysProvider } from '@tanstack/octane-hotkeys'
import { CheatSheetPage } from './CheatSheetPage.tsrx'
import type { HotkeyPlatform } from '@tanstack/octane-hotkeys'

// The server and the browser pass the same platform, so hydration matches
export function App({ platform }: { platform: HotkeyPlatform }) @{
  <HotkeysProvider defaultOptions={{ platform }}>
    <CheatSheetPage />
  </HotkeysProvider>
}
