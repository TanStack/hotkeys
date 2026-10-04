import { createContext, createElement, useContext } from 'octane'
import type {
  HotkeyOptions,
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
  SequenceOptions,
} from '@tanstack/hotkeys'

export interface DefaultHotkeysOptions {
  hotkey?: HotkeyOptions
  hotkeySequence?: SequenceOptions
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequenceRecorder?: Partial<HotkeySequenceRecorderOptions>
}

const HotkeysContext = createContext<DefaultHotkeysOptions | null>(null)

export type HotkeysProviderOptions = DefaultHotkeysOptions

export interface HotkeysProviderProps {
  children?: unknown
  defaultOptions?: HotkeysProviderOptions
}

/** Reads the nearest provider, or null outside a provider. */
export function useHotkeysContext() {
  const defaultOptions = useContext(HotkeysContext)
  return defaultOptions === null ? null : { defaultOptions }
}

/** Reads the nearest provider's defaults, or an empty object. */
export function useDefaultHotkeysOptions(): DefaultHotkeysOptions {
  return useContext(HotkeysContext) ?? {}
}

/** Sets registration and recorder defaults for descendant components. */
export function HotkeysProvider({
  children,
  defaultOptions = {},
}: HotkeysProviderProps) {
  return createElement(HotkeysContext.Provider, {
    value: defaultOptions,
    children,
  })
}
