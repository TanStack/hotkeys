import { createContext } from 'svelte'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { CreateHotkeyOptions } from './createHotkey.svelte'
import type { Snippet } from 'svelte'
import type { CreateHotkeySequenceOptions } from './createHotkeySequence.svelte'

export type Target = ResolvedTarget | (() => ResolvedTarget)

export type ResolvedTarget = HTMLElement | Document | Window | null

export interface HotkeysProviderOptions {
  hotkey?: Partial<CreateHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
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

const [getHotkeysContext, setHotkeysContext] =
  createContext<HotkeysContextValue | null>()

export { getHotkeysContext, setHotkeysContext }

export function getDefaultHotkeysOptions(): HotkeysProviderOptions {
  return getHotkeysContext()?.defaultOptions ?? DEFAULT_OPTIONS
}
