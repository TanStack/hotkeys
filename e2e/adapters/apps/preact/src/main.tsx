import {
  detectPlatform,
  getHotkeyManager,
  useHeldKeys,
  useHotkey,
  useHotkeyRecorder,
  useHotkeys,
  useKeyHold,
  useKeyLockState,
} from '@tanstack/preact-hotkeys'
import { render } from 'preact'
import { StrictMode, createPortal } from 'preact/compat'
import { useEffect, useRef, useState } from 'preact/hooks'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/preact-hotkeys'

function HotkeyHost({ hotkey, enabled }: { hotkey: string; enabled: boolean }) {
  useHotkey(hotkey as Hotkey, () => logCall('hotkey'), { enabled })
  return <div id="hotkey-host" />
}

function PortalHost() {
  const ref = useRef<HTMLDivElement>(null)
  useHotkeys(
    [
      { hotkey: 'P', callback: () => logCall('portal hotkey') },
      { hotkey: 'Shift+P', callback: () => logCall('portal hotkey') },
    ],
    { target: ref },
  )
  return (
    <div id="portal-host" ref={ref} tabIndex={0}>
      <span
        id="portal-child"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key.toLowerCase() !== 'p') return
          logCall('portal keydown')
          if (event.shiftKey) event.stopPropagation()
        }}
      />
    </div>
  )
}

// The container joins the page in this component's effect, which runs after
// the effects inside the portal.
function DetachedPortal() {
  const [container] = useState(() => document.createElement('div'))
  useEffect(() => {
    document.body.append(container)
    return () => container.remove()
  }, [container])
  return createPortal(<PortalHost />, container)
}

function App() {
  const [shown, setShown] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [hotkey, setHotkey] = useState('K')
  useHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = useHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = useKeyHold('Shift')
  const heldKeys = useHeldKeys()
  const capsLock = useKeyLockState('CapsLock')
  const elementHost = useRef<HTMLDivElement>(null)
  useHotkey('L', () => logCall('element hotkey'), { target: elementHost })

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
      <div id="caps-lock">
        {capsLock === null ? 'unknown' : capsLock ? 'on' : 'off'}
      </div>
      <div id="element-host" ref={elementHost} tabIndex={0} />
      <DetachedPortal />
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
