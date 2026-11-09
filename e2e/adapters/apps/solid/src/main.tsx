import {
  createHeldKeys,
  createHotkey,
  createHotkeyRecorder,
  createKeyHold,
  detectPlatform,
  getHotkeyManager,
} from '@tanstack/solid-hotkeys'
import { Show, createSignal, onMount } from 'solid-js'
import { render } from 'solid-js/web'
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

function App() {
  const [shown, setShown] = createSignal(true)
  const [enabled, setEnabled] = createSignal(true)
  const [hotkey, setHotkey] = createSignal('K')
  createHotkey(['G', 'G'], () => logCall('sequence'))
  const recorder = createHotkeyRecorder({ onRecord: setRecorded })
  const shiftHeld = createKeyHold('Shift')
  const heldKeys = createHeldKeys()

  onMount(() => {
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
      <Show when={shown()}>
        <HotkeyHost hotkey={hotkey()} enabled={enabled()} />
      </Show>
      <div id="recording">{recorder.isRecording() ? 'yes' : 'no'}</div>
      <div id="shift-held">{shiftHeld() ? 'held' : 'released'}</div>
      <div id="held-keys">{heldKeys().join('+')}</div>
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
