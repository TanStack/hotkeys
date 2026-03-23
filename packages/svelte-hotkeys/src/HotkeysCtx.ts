import { createContext } from 'svelte'
import type {
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { CreateHotkeyOptions } from './createHotkey.svelte'
import type { Snippet } from 'svelte'
import type { CreateHotkeySequenceOptions } from './createHotkeySequence.svelte'

export interface HotkeysProviderOptions {
  hotkey?: Partial<CreateHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequenceRecorder?: Partial<HotkeySequenceRecorderOptions>
  hotkeySequence?: Partial<CreateHotkeySequenceOptions>
}

export interface HotkeysProviderProps {
  children: Snippet
  defaultOptions?: HotkeysProviderOptions
}

export const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

interface HotkeysContextValue {
  defaultOptions: HotkeysProviderOptions
}

const [useHotkeysContext, setHotkeysContextValue] =
  createContext<HotkeysContextValue | null>()

export function setHotkeysContext(
  defaultOptions: HotkeysProviderOptions = DEFAULT_OPTIONS,
): HotkeysContextValue {
  return setHotkeysContextValue({
    get defaultOptions() {
      return defaultOptions
    },
  })!
}

export function setHotkeysContextSource(
  defaultOptions: () => HotkeysProviderOptions,
): HotkeysContextValue {
  return setHotkeysContextValue({
    get defaultOptions() {
      return defaultOptions()
    },
  })!
}

export function getHotkeysContext(): HotkeysContextValue | null {
  try {
    return useHotkeysContext()
  } catch {
    return null
  }
}

export function getDefaultHotkeysOptions(): HotkeysProviderOptions {
  return getHotkeysContext()?.defaultOptions ?? DEFAULT_OPTIONS
}
