import { inject, provide, toValue } from 'vue'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type {
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { UseHotkeyOptions } from './useHotkey'
import type { UseHotkeySequenceOptions } from './useHotkeySequence'

export interface HotkeysProviderOptions {
  hotkey?: Partial<UseHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequenceRecorder?: Partial<HotkeySequenceRecorderOptions>
  hotkeySequence?: Partial<UseHotkeySequenceOptions>
}

interface HotkeysContextValue {
  defaultOptions: HotkeysProviderOptions
}

const HotkeysContext: InjectionKey<HotkeysContextValue> =
  Symbol('HotkeysContext')

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

export function provideHotkeysContext(
  defaultOptions?: MaybeRefOrGetter<HotkeysProviderOptions>,
) {
  const contextValue: HotkeysContextValue = {
    get defaultOptions() {
      return toValue(defaultOptions) ?? DEFAULT_OPTIONS
    },
  }

  provide(HotkeysContext, contextValue)
}

export function useHotkeysContext() {
  return inject(HotkeysContext, null)
}

export function useDefaultHotkeysOptions() {
  const context = inject(HotkeysContext, null)
  return context?.defaultOptions ?? {}
}
