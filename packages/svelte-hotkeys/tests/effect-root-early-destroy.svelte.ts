import { createHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

/** Starts a recorder and destroys its root before effects flush. */
export function startThenDestroyRoot(onRecord: () => void) {
  const destroy = $effect.root(() => {
    createHotkeyRecorder({ onRecord }).startRecording()
  })
  destroy()
}
