import { Portal, render } from '@solidjs/web'
import {
  createHeldKeys,
  createHotkey,
  createHotkeyRecorder,
  createKeyHold,
  createKeyLockState,
  detectPlatform,
  getHotkeyManager,
} from '@tanstack/solid-hotkeys'
import { Show, createSignal, onSettled } from 'solid-js'
import { exposeFixture, logCall, setRecorded } from '../../../shared/fixture'
import type { Hotkey } from '@tanstack/solid-hotkeys'

function HotkeyHost(props: { hotkey: string; enabled: boolean }) {
  createHotkey(
    () => props.hotkey as Hotkey,
    () => logCall('hotkey'),
    () => ({ enabled: props.enabled }),
  )
  return <div id="hotkey-host" />
}

function PortalHost() {
  const [host, setHost] = createSignal<HTMLDivElement | null>(null)
  createHotkey(
    'P',
    () => logCall('portal hotkey'),
    () => ({ target: host() }),
  )
  return <div id="portal-host" ref={setHost} tabindex={0} />
}

function App() {
  const [shown, setShown] = createSignal(true)
  const [enabled, setEnabled] = createSignal(true)
  const [hotkey, setHotkey] = createSignal('K')
  createHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = createHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = createKeyHold('Shift')
  const capsLock = createKeyLockState('CapsLock')
  const heldKeys = createHeldKeys()
  const [elementHost, setElementHost] = createSignal<HTMLDivElement | null>(
    null,
  )
  createHotkey(
    'L',
    () => logCall('element hotkey'),
    () => ({ target: elementHost() }),
  )
  // Changing the mount moves the same nodes there
  const [portalMount, setPortalMount] = createSignal<HTMLElement>(document.body)

  onSettled(() => {
    exposeFixture(
      { getHotkeyManager, detectPlatform },
      {
        setShown,
        setEnabled,
        setHotkey,
        startRecording: () => recorder.startRecording(),
        portalInto: (target) => setPortalMount((target ?? document).body),
      },
    )
  })

  return (
    <>
      <Show when={shown()}>
        <HotkeyHost hotkey={hotkey()} enabled={enabled()} />
      </Show>
      <div id="recording">{recorder.isRecording() ? 'yes' : 'no'}</div>
      <div id="shift-held">{shiftHeld() ? 'held' : 'released'}</div>
      <div id="held-keys">{heldKeys().join('+')}</div>
      <div id="caps-lock">
        {capsLock() === null ? 'unknown' : capsLock() ? 'on' : 'off'}
      </div>
      <div id="element-host" ref={setElementHost} tabindex={0} />
      <Portal mount={portalMount()}>
        <PortalHost />
      </Portal>
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
