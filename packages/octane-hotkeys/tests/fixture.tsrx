import { useState } from 'octane';
import {
  HotkeysProvider, useDefaultHotkeysOptions, useHotkeysContext,
  useHotkey, useHotkeys,
  useHeldKeys, useHeldKeyCodes, useKeyHold, useHotkeyHint,
  useHotkeyRecorder, useHotkeyRegistrations, useHotkeyScopesState,
  useFormatForDisplay,
  defineAppHotkeys, useAppHotkeyList, useCustomHotkeys,
} from '@tanstack/octane-hotkeys';
import type {
  Hotkey, OctaneHotkeyRecorder, UseCustomHotkeysResult,
} from '@tanstack/octane-hotkeys';

export const capture: {
  recorder?: OctaneHotkeyRecorder;
  sequenceRecorder?: OctaneHotkeyRecorder;
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
  useHotkey(['G', 'G'], () => setCount(count + 1));
  useHotkeys(enabled ? [{ hotkey: ['D', 'D'], callback: () => setOther(other + 1) }] : []);
  const held = useHeldKeys();
  const codes = useHeldKeyCodes();
  const hold = useKeyHold('Control');
  const hint = useHotkeyHint(binding);
  const otherHint = useHotkeyHint('Alt+S');
  const registrations = useHotkeyRegistrations();
  const scopes = useHotkeyScopesState();
  const recorder = useHotkeyRecorder({ recordBy: 'key', platform: 'mac', onRecord: (value) => capture.records.push(value) });
  const sequenceRecorder = useHotkeyRecorder({ maxSteps: Infinity, recordBy: 'key', platform: 'mac', onRecord: (value) => capture.records.push(value) });
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
    <output id="registrations">{registrations.hotkeys.filter((reg) => reg.kind === 'chord').length + ':' + registrations.hotkeys.filter((reg) => reg.kind === 'sequence').length}</output>
    <output id="scopes">{(scopes.exclusive ?? 'none') + ':' + scopes.suspended.join(',')}</output>
    <output id="recording">{String(recorder.isRecording)}</output>
    <output id="steps">{sequenceRecorder.steps.join(',')}</output>
  </div>
}

export function ProviderFixture() @{
  const [enabled, setEnabled] = useState(false);
  <HotkeysProvider defaultOptions={{
    hotkey: { enabled, preventDefault: false, timeout: 321 },
    hotkeyRecorder: { recordBy: 'key', commitKeys: 'none' },
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
  useHotkey(['G', 'G'], () => capture.records.push('GG'));
  const recorder = useHotkeyRecorder({ onRecord: value => capture.records.push(value) });
  const sequence = useHotkeyRecorder({ maxSteps: Infinity, onRecord: value => capture.records.push(value), commitKeys: 'enter' });
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

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Control+S', meta: { name: 'Save' } },
  'palette.open': { hotkey: null },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
});

export const appCapture: {
  custom?: UseCustomHotkeysResult;
  changes: unknown[];
} = { changes: [] };

export function AppHotkeysFixture() @{
  <HotkeysProvider
    appHotkeys={appHotkeys}
    customHotkeys={{ 'nav.home': ['G', 'G'] }}
    onCustomHotkeysChange={(custom) => appCapture.changes.push(custom)}
  >
    <AppHotkeysConsumer />
  </HotkeysProvider>
}

function AppHotkeysConsumer() @{
  const [count, setCount] = useState(0);
  useHotkey(appHotkeys['doc.save'], () => setCount(count + 1));
  useHotkeys([
    { hotkey: appHotkeys['nav.home'], callback: () => {} },
    { hotkey: appHotkeys['palette.open'], callback: () => {} },
  ]);
  const list = useAppHotkeyList();
  appCapture.custom = useCustomHotkeys();
  <div>
    <output id="app-count">{count}</output>
    <output id="app-statuses">{list.map((item) => item.status).join(',')}</output>
  </div>
}

export function SavedHotkeysFixture() @{
  const [saved, setSaved] = useState<Record<string, Hotkey | null> | null>(null);
  <HotkeysProvider
    appHotkeys={appHotkeys}
    customHotkeys={saved}
    onCustomHotkeysChange={(custom) => appCapture.changes.push(custom)}
  >
    <button id="saved-load" onClick={() => setSaved({ 'doc.save': 'Control+E' })}>Load</button>
    <button id="saved-switch" onClick={() => setSaved({ 'nav.home': ['G', 'G'] })}>Switch user</button>
    <HotkeysProvider scope="nested">
      <SavedHotkeysConsumer />
    </HotkeysProvider>
  </HotkeysProvider>
}

function SavedHotkeysConsumer() @{
  appCapture.custom = useCustomHotkeys();
  <output id="saved-custom">{JSON.stringify(appCapture.custom.customHotkeys)}</output>
}

export const scopedAppHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Control+S' },
});

export const scopeCapture: { fired: Record<string, number> } = { fired: {} };

export function ScopesFixture() @{
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  <HotkeysProvider appHotkeys={scopedAppHotkeys} customHotkeys={{ 'doc.save': 'Control+E' }}>
    <div>
      <button id="scope-open" onClick={() => setOpen(!open)}>Open</button>
      <button id="scope-enabled" onClick={() => setEnabled(!enabled)}>Enable</button>
      <ScopedHotkey hotkey="Control+K" name="palette" />
      <HotkeysProvider scope="page" enabled={enabled}>
        <ScopedHotkey hotkey="Control+S" name="page" />
        <HotkeysProvider scope="panel">
          <ScopedHotkey hotkey="Control+S" name="panel" />
          <ScopedAppHotkeys />
        </HotkeysProvider>
      </HotkeysProvider>
      @if (open) { <HotkeysProvider scope="dialog" exclusive={{ allow: ['global'] }}>
        <ScopedHotkey hotkey="Control+S" name="dialog" />
      </HotkeysProvider> }
    </div>
  </HotkeysProvider>
}

function ScopedHotkey({ hotkey, name }: { hotkey: Hotkey; name: string }) @{
  useHotkey(hotkey, () => {
    scopeCapture.fired[name] = (scopeCapture.fired[name] ?? 0) + 1;
  }, { meta: { name } });
  <span />
}

function ScopedAppHotkeys() @{
  useHotkey(scopedAppHotkeys['doc.save'], () => {
    scopeCapture.fired.app = (scopeCapture.fired.app ?? 0) + 1;
  });
  const list = useAppHotkeyList();
  <output id="scope-statuses">{list.map((item) => item.status).join(',')}</output>
}

export const optionalCapture: { count: number } = { count: 0 };

export function OptionalHotkeyFixture() @{
  const [shortcut, setShortcut] = useState<Hotkey | null | undefined>(undefined);
  useHotkey(shortcut, () => { optionalCapture.count++ });
  useHotkeys([
    { hotkey: 'A', callback: () => {} },
    { hotkey: shortcut, callback: () => { optionalCapture.count++ } },
  ]);
  const hint = useHotkeyHint(shortcut);
  <div>
    <button id="optional-set" onClick={() => setShortcut('Control+K')}>Set</button>
    <button id="optional-clear" onClick={() => setShortcut(null)}>Clear</button>
    <output id="optional-hint">{String(hint)}</output>
  </div>
}

/** Unset props, forwarded the way a wrapper component would. */
const forwarded: { preventDefault?: boolean; stopPropagation?: boolean } = {};

export function ForwardedOptionsFixture() @{
  useHotkey('Control+S', () => {}, {
    platform: 'windows',
    preventDefault: forwarded.preventDefault,
    stopPropagation: forwarded.stopPropagation,
  });
  <div>{'forwarded'}</div>
}

type Platform = 'mac' | 'windows' | 'linux';

export const platformCapture: {
  fired: number;
  records: unknown[];
  recorder?: OctaneHotkeyRecorder;
} = { fired: 0, records: [] };

export function FormatLabel({ platform }: { platform?: Platform }) @{
  const format = useFormatForDisplay();
  <kbd>{format('Mod+S', { platform })}</kbd>
}

export function PlatformFixture({ platform, label, hotkey }: {
  platform?: Platform;
  label?: Platform;
  hotkey?: Platform;
}) @{
  <HotkeysProvider defaultOptions={{ platform }}>
    <PlatformConsumer label={label} hotkey={hotkey} />
  </HotkeysProvider>
}

function PlatformConsumer({ label, hotkey }: { label?: Platform; hotkey?: Platform }) @{
  useHotkey('Mod+S', () => { platformCapture.fired++ }, { platform: hotkey });
  platformCapture.recorder = useHotkeyRecorder({
    recordBy: 'key',
    onRecord: (value) => platformCapture.records.push(value),
  });
  <FormatLabel platform={label} />
}
