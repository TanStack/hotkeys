import { createRoot, useEffect, useState } from 'octane'
import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useKeyHold,
} from '@tanstack/octane-hotkeys'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/octane-hotkeys'

function HotkeyHost({ hotkey, enabled }: { hotkey: string; enabled: boolean }) @{
  useHotkey(hotkey as Hotkey, () => logCall('hotkey'), { enabled })
  <div id="hotkey-host" />
}

function App() @{
  const [shown, setShown] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [hotkey, setHotkey] = useState('K')
  useHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = useHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = useKeyHold('Shift')
  const heldKeys = useHeldKeys()

  useEffect(() => {
    exposeFixture({ getHotkeyManager, detectPlatform }, {
      setShown,
      setEnabled,
      setHotkey,
      startRecording: () => recorder.startRecording(),
    })
  })

  <div>
    @if (shown) { <HotkeyHost hotkey={hotkey} enabled={enabled} /> }
    <div id="recording">{recorder.isRecording ? 'yes' : 'no'}</div>
    <div id="shift-held">{shiftHeld ? 'held' : 'released'}</div>
    <div id="held-keys">{heldKeys.join('+')}</div>
  </div>
}

createRoot(document.getElementById('root')!).render(App)
