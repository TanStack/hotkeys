import { DEFAULT_SEQUENCE_TIMEOUT } from '@tanstack/hotkeys'
import type { SequenceRegistrationView } from '@tanstack/hotkeys'

/**
 * Matched step count for UI, accounting for inter-key timeout even if the
 * manager has not processed another event yet.
 */
export function effectiveSequenceMatchedSteps(
  reg: SequenceRegistrationView,
  now: number,
): number {
  const timeout = reg.options.timeout ?? DEFAULT_SEQUENCE_TIMEOUT
  if (
    reg.matchedStepCount <= 0 ||
    reg.partialMatchLastKeyTime <= 0 ||
    now - reg.partialMatchLastKeyTime > timeout
  ) {
    return 0
  }
  return reg.matchedStepCount
}

/** Whether the devtools should run a short interval to refresh sequence progress UI. */
export function needsSequenceProgressClock(
  regs: Array<SequenceRegistrationView>,
  now: number,
): boolean {
  return regs.some((reg) => effectiveSequenceMatchedSteps(reg, now) > 0)
}
