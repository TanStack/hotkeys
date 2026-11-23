import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ConformanceRunner } from './types'

/**
 * The Vitest runner for the conformance suite. Known-bug cases are skipped,
 * or run as `it.fails` when `HOTKEYS_CONFORMANCE_BUGS=fail`, to check that
 * each one still fails.
 */
export function vitestRunner(): ConformanceRunner {
  return {
    describe,
    it,
    skip: it.skip,
    fails:
      process.env.HOTKEYS_CONFORMANCE_BUGS === 'fail' ? it.fails : undefined,
    beforeEach,
    afterEach,
    expect,
  }
}
