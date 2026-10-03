import { useState } from 'octane';
import {
  HotkeysProvider, useDefaultHotkeysOptions, useHotkeysContext,
  useHotkey, useHotkeys, useHotkeySequence, useHotkeySequences,
  useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint,
  useHotkeyRecorder, useHotkeySequenceRecorder, useHotkeyRegistrations,
} from '@tanstack/octane-hotkeys';
import type { Hotkey } from '@tanstack/octane-hotkeys';

export const capture: {
  recorder?: ReturnType<typeof useHotkeyRecorder>;
  sequenceRecorder?: ReturnType<typeof useHotkeySequenceRecorder>;
  records: unknown[];
} = { records: [] };

export function Fixture() @{
  const outsideContext = useHotkeysContext();
  const outsideDefaults = useDefaultHotkeysOptions();
  const [binding, setBinding] = useState<Hotkey>('Control+S');
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  useHotkey(binding, () => setCount(count + 1), { enabled });
  useHotkey('B', () => setOther(other + 1));
  useHotkeys(enabled ? [{ hotkey: 'C', callback: () => setOther(other + 1) }] : []);
  useHotkeySequence(['G', 'G'], () => setCount(count + 1));
  useHotkeySequences(enabled ? [{ sequence: ['D', 'D'], callback: () => setOther(other + 1) }] : []);
  const held = useHeldKeys();
  const codes = useHeldKeyCodes();
  const hold = useKeyHold('Control');
  const hint = useHotkeyHint(binding);
  const otherHint = useHotkeyHint('Alt+S');
  const registrations = useHotkeyRegistrations();
  const recorder = useHotkeyRecorder({ recordBy: 'key', platform: 'mac', onRecord: (value) => capture.records.push(value) });
  const sequenceRecorder = useHotkeySequenceRecorder({ recordBy: 'key', platform: 'mac', onRecord: (value) => capture.records.push(value) });
  capture.recorder = recorder;
  capture.sequenceRecorder = sequenceRecorder;
  <div>
    <button id="record" onClick={() => recorder.startRecording()}>Record shortcut</button>
    <button id="record-sequence" onClick={() => sequenceRecorder.startRecording()}>Record sequence</button>
    <button id="commit-sequence" onClick={() => sequenceRecorder.commitRecording()}>Commit sequence</button>
    <button id="binding" onClick={() => setBinding('Alt+S')}>Change binding</button>
    <button id="enabled" onClick={() => setEnabled(!enabled)}>Toggle</button>
    <output id="outside-context">{String(outsideContext === null && Object.keys(outsideDefaults).length === 0)}</output>
    <output id="count">{count}</output>
    <output id="other">{other}</output>
    <output id="hint">{String(hint)}</output>
    <output id="other-hint">{String(otherHint)}</output>
    <output id="held">{held.join(',')}</output>
    <output id="codes">{JSON.stringify(codes)}</output>
    <output id="hold">{String(hold)}</output>
    <output id="registrations">{registrations.hotkeys.length + ':' + registrations.sequences.length}</output>
    <output id="recording">{String(recorder.isRecording)}</output>
    <output id="steps">{sequenceRecorder.steps.join(',')}</output>
  </div>
}

export function ProviderFixture() @{
  const [enabled, setEnabled] = useState(false);
  <HotkeysProvider defaultOptions={{
    hotkey: { enabled, preventDefault: false },
    hotkeySequence: { enabled, timeout: 321 },
    hotkeyRecorder: { recordBy: 'key' },
    hotkeySequenceRecorder: { recordBy: 'key', commitKeys: 'none' },
  }}>
    <div>
      <button id="provider-enable" onClick={() => setEnabled(true)}>Enable</button>
      <ProviderConsumer />
      <HotkeysProvider defaultOptions={{ hotkey: { enabled: true } }}>
        <NestedConsumer />
      </HotkeysProvider>
    </div>
  </HotkeysProvider>
}

function ProviderConsumer() @{
  const defaults = useDefaultHotkeysOptions();
  const context = useHotkeysContext();
  useHotkey('A', () => capture.records.push('A'));
  useHotkeys([{ hotkey: 'B', callback: () => capture.records.push('B'), options: { enabled: true } }]);
  useHotkeySequence(['G', 'G'], () => capture.records.push('GG'));
  const recorder = useHotkeyRecorder({ onRecord: value => capture.records.push(value) });
  const sequence = useHotkeySequenceRecorder({ onRecord: value => capture.records.push(value), commitKeys: 'enter' });
  <div>
    <output id="provider-default">{String(defaults.hotkey?.enabled)}</output>
    <output id="provider-context">{String(context !== null)}</output>
    <button id="provider-record" onClick={() => recorder.startRecording()}>Record</button>
    <button id="provider-sequence" onClick={() => sequence.startRecording()}>Record sequence</button>
  </div>
}

function NestedConsumer() @{
  useHotkey('C', () => capture.records.push('C'));
  <span>Nested provider</span>
}
