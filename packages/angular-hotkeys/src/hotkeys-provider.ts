import { InjectionToken, inject } from '@angular/core'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { InjectHotkeyOptions } from './injectHotkey'
import type { InjectHotkeySequenceOptions } from './injectHotkeySequence'
import type { StaticProvider } from '@angular/core'

export interface HotkeysProviderOptions {
  hotkey?: Partial<InjectHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequence?: Partial<InjectHotkeySequenceOptions>
}

export interface HotkeysContextValue {
  readonly defaultOptions: HotkeysProviderOptions
}

export const HOTKEYS_INJECTION_TOKEN = new InjectionToken<HotkeysContextValue>(
  'HOTKEYS_INJECTION_TOKEN',
  {
    providedIn: 'root',
    factory: () => ({ defaultOptions: {} }),
  },
)

export function provideHotkeys(
  defaultOptions: HotkeysProviderOptions,
): StaticProvider {
  return {
    provide: HOTKEYS_INJECTION_TOKEN,
    useValue: { defaultOptions },
  }
}

export function injectHotkeysContext(): HotkeysContextValue {
  return inject(HOTKEYS_INJECTION_TOKEN)
}

export function injectDefaultHotkeysOptions(): HotkeysProviderOptions {
  return injectHotkeysContext().defaultOptions
}
