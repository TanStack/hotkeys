import { createRoot, useEffect, useRef, useState } from 'octane'
import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useKeyHold,
  useKeyLockState,
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
  const capsLock = useKeyLockState('CapsLock')
  const elementHost = useRef<HTMLDivElement | null>(null)
  useHotkey('L', () => logCall('element hotkey'), { target: elementHost })

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
    <div id="caps-lock">{capsLock === null ? 'unknown' : capsLock ? 'on' : 'off'}</div>
    <div id="element-host" ref={elementHost} tabIndex={0} />
  </div>
}

createRoot(document.getElementById('root')!).render(App)
