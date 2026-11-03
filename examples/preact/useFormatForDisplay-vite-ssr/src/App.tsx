import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import { CheatSheetPage } from './CheatSheetPage'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'

// The server and the browser pass the same platform, so hydration matches
export function App({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheetPage />
    </HotkeysProvider>
  )
}
