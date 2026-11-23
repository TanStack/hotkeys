import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useKeyHold,
} from '@tanstack/preact-hotkeys'
import { render } from 'preact'
import { StrictMode } from 'preact/compat'
import { useEffect, useState } from 'preact/hooks'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/preact-hotkeys'

function HotkeyHost({ hotkey, enabled }: { hotkey: string; enabled: boolean }) {
  useHotkey(hotkey as Hotkey, () => logCall('hotkey'), { enabled })
  return <div id="hotkey-host" />
}

function App() {
  const [shown, setShown] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [hotkey, setHotkey] = useState('K')
  useHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = useHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = useKeyHold('Shift')
  const heldKeys = useHeldKeys()

  useEffect(() => {
    exposeFixture(
      { getHotkeyManager, detectPlatform },
      {
        setShown,
        setEnabled,
        setHotkey,
        startRecording: () => recorder.startRecording(),
      },
    )
  })

  return (
    <>
      {shown && <HotkeyHost hotkey={hotkey} enabled={enabled} />}
      <div id="recording">{recorder.isRecording ? 'yes' : 'no'}</div>
      <div id="shift-held">{shiftHeld ? 'held' : 'released'}</div>
      <div id="held-keys">{heldKeys.join('+')}</div>
    </>
  )
}

// preact/compat's StrictMode is a Fragment; it doesn't double-mount
const strict = new URLSearchParams(location.search).has('strict')
render(
  strict ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  ),
  document.getElementById('root')!,
)
