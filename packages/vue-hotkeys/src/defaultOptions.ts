import { useHotkeysContext } from './HotkeysProviderContext'

/** Captures the context once and reads current defaults inside reactive computations. */
export function useDefaultHotkeysOptionsSource() {
  const context = useHotkeysContext()
  return () => context?.defaultOptions ?? {}
}
