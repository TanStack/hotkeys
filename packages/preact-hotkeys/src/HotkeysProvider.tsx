import { createContext } from 'preact'
import { useContext, useMemo } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { UseHotkeyOptions } from './useHotkey'
import type { UseHotkeySequenceOptions } from './useHotkeySequence'

export interface HotkeysProviderOptions {
  hotkey?: Partial<UseHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequence?: Partial<UseHotkeySequenceOptions>
}

interface HotkeysContextValue {
  defaultOptions: HotkeysProviderOptions
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps {
  children: ComponentChildren
  defaultOptions?: HotkeysProviderOptions
}

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

export function HotkeysProvider({
  children,
  defaultOptions = DEFAULT_OPTIONS,
}: HotkeysProviderProps) {
  const contextValue: HotkeysContextValue = useMemo(
    () => ({
      defaultOptions,
    }),
    [defaultOptions],
  )

  return (
    <HotkeysContext.Provider value={contextValue}>
      {children}
    </HotkeysContext.Provider>
  )
}

export function useHotkeysContext() {
  return useContext(HotkeysContext)
}

export function useDefaultHotkeysOptions() {
  const context = useContext(HotkeysContext)
  return context?.defaultOptions ?? {}
}
