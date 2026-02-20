import { InjectionToken, inject } from '@angular/core'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { InjectHotkeyOptions } from './injectHotkey'
import type { InjectHotkeySequenceOptions } from './injectHotkeySequence'

export interface HotkeysProviderOptions {
  hotkey?: Partial<InjectHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequence?: Partial<InjectHotkeySequenceOptions>
}

export interface HotkeysContextValue {
  defaultOptions: HotkeysProviderOptions
}

export const HOTKEYS_INJECTION_TOKEN = new InjectionToken<HotkeysContextValue>(
  'HOTKEYS_INJECTION_TOKEN',
)

export function provideHotkeys(defaultOptions?: HotkeysProviderOptions): {
  provide: typeof HOTKEYS_INJECTION_TOKEN
  useValue: HotkeysContextValue
} {
  return {
    provide: HOTKEYS_INJECTION_TOKEN,
    useValue: { defaultOptions: defaultOptions ?? {} },
  }
}

export function injectHotkeysContext(): HotkeysContextValue | null {
  return inject(HOTKEYS_INJECTION_TOKEN, { optional: true }) ?? null
}

export function injectDefaultHotkeysOptions(): HotkeysProviderOptions {
  return injectHotkeysContext()?.defaultOptions ?? {}
}
