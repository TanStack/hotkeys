import { drainPassiveEffects, flushSync } from 'octane'

/** Runs pending passive effects, commits, then runs the effects that commit queued. */
export function flush() {
  drainPassiveEffects()
  flushSync(() => {})
  drainPassiveEffects()
}
