import { createContext, useContext } from 'solid-js'
import type { JSX, ParentComponent } from 'solid-js'
import type { HotkeyRecorderOptions } from '@tanstack/hotkeys'
import type { CreateHotkeyOptions } from './createHotkey'
import type { CreateHotkeySequenceOptions } from './createHotkeySequence'

export interface HotkeysProviderOptions {
  hotkey?: Partial<CreateHotkeyOptions>
  hotkeyRecorder?: Partial<HotkeyRecorderOptions>
  hotkeySequence?: Partial<CreateHotkeySequenceOptions>
}

interface HotkeysContextValue {
  defaultOptions: HotkeysProviderOptions
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null)

export interface HotkeysProviderProps {
  children: JSX.Element
  defaultOptions?: HotkeysProviderOptions
}

const DEFAULT_OPTIONS: HotkeysProviderOptions = {}

export const HotkeysProvider: ParentComponent<HotkeysProviderProps> = (
  props,
) => {
  const contextValue: HotkeysContextValue = {
    defaultOptions: props.defaultOptions ?? DEFAULT_OPTIONS,
  }

  return (
    <HotkeysContext.Provider value={contextValue}>
      {props.children}
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
