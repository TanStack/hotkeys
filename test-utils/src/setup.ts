// Vitest setup file shared by every package. List it first in `setupFiles`.
// Files that opt into `@vitest-environment node` have no DOM, so skip them.
import { patchAltGraph } from './alt-graph'
import { setTestPlatform, testPlatform } from './platform'

if ('happyDOM' in globalThis) {
  patchAltGraph()
  setTestPlatform(testPlatform())
}
