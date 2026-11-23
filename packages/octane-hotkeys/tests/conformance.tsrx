import { useRef } from 'octane';
import {
  HotkeysProvider, useFormatForDisplay, useHeldKeyCodes, useHeldKeys,
  useHotkey, useHotkeyHint, useHotkeyRecorder, useHotkeyRegistrations,
  useHotkeys, useKeyHold,
} from '@tanstack/octane-hotkeys';
import type {
  HeldModifierOptions, HotkeyRecorderOptions, HotkeyRegistrationView,
  IndividualKey, OctaneHotkeyRecorder, RegisterableHotkey, UseHotkeyDefinition,
  formatForDisplay,
} from '@tanstack/octane-hotkeys';
import type {
  ConformanceHotkey, ConformanceProvider, HotkeysSpec,
} from '@tanstack/hotkeys-test-utils/conformance';

// Views for the conformance harness in conformance.test.ts.

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(entry: ConformanceHotkey, element: { current: HTMLDivElement | null }) {
  if (!entry.options || !('target' in entry.options)) return entry.options as never;
  return { ...entry.options, target: element } as never;
}

function One({ entry, element }: { entry: ConformanceHotkey; element: { current: HTMLDivElement | null } }) @{
  useHotkey(entry.hotkey as RegisterableHotkey, entry.callback, options(entry, element) as never);
}

function List({ hotkeys, element }: { hotkeys: Array<ConformanceHotkey>; element: { current: HTMLDivElement | null } }) @{
  useHotkeys(hotkeys.map((entry) => ({
    hotkey: entry.hotkey, callback: entry.callback, options: options(entry, element),
  })) as Array<UseHotkeyDefinition>);
}

function Body({ spec }: { spec: HotkeysSpec }) @{
  const element = useRef<HTMLDivElement | null>(null);
  <div>
    <div data-conformance-target="" tabIndex={0} ref={element} />
    @if (spec.form === 'list') {
      <List hotkeys={spec.hotkeys} element={element} />
    } @else {
      @for (const [index, entry] of Array.from(spec.hotkeys.entries()); key index) {
        <One entry={entry} element={element} />
      }
    }
  </div>
}

function Provider({ provider, children }: { provider: ConformanceProvider; children: unknown }) @{
  <HotkeysProvider
    scope={provider.scope}
    enabled={provider.enabled}
    exclusive={provider.exclusive}
    appHotkeys={provider.appHotkeys}
    customHotkeys={provider.customHotkeys as never}
    defaultOptions={{ platform: provider.platform, hotkey: provider.hotkey }}
  >
    {children as never}
  </HotkeysProvider>
}

export function HotkeysView({ spec }: { spec: HotkeysSpec }) @{
  @if (spec.provider) {
    <Provider provider={spec.provider}><Body spec={spec} /></Provider>
  } @else {
    <Body spec={spec} />
  }
}

export function HeldKeysView({ watch }: { watch: IndividualKey }) @{
  const keys = useHeldKeys();
  const codes = useHeldKeyCodes();
  const held = useKeyHold(watch);
  <div>
    <output data-testid="keys">{JSON.stringify(keys)}</output>
    <output data-testid="codes">{JSON.stringify(codes)}</output>
    <output data-testid="held">{String(held)}</output>
  </div>
}

export function RegistrationsView({ onValue }: { onValue: (value: Array<HotkeyRegistrationView>) => void }) @{
  const registrations = useHotkeyRegistrations();
  onValue(registrations.hotkeys);
  <output data-testid="count">{registrations.hotkeys.length}</output>
}

export function HintView({ hotkey, options: hintOptions }: { hotkey: RegisterableHotkey | null | undefined; options?: HeldModifierOptions }) @{
  const hint = useHotkeyHint(hotkey, hintOptions);
  <output data-testid="hint">{String(hint)}</output>
}

function Recorder({ options: recorderOptions, ready }: { options: HotkeyRecorderOptions; ready: (recorder: OctaneHotkeyRecorder) => void }) @{
  ready(useHotkeyRecorder(recorderOptions as never));
}

export function RecorderView({ provider, options: recorderOptions, ready }: { provider?: ConformanceProvider; options: HotkeyRecorderOptions; ready: (recorder: OctaneHotkeyRecorder) => void }) @{
  @if (provider) {
    <Provider provider={provider}><Recorder options={recorderOptions} ready={ready} /></Provider>
  } @else {
    <Recorder options={recorderOptions} ready={ready} />
  }
}

function Format({ ready }: { ready: (format: typeof formatForDisplay) => void }) @{
  ready(useFormatForDisplay());
}

export function FormatView({ provider, ready }: { provider?: ConformanceProvider; ready: (format: typeof formatForDisplay) => void }) @{
  @if (provider) {
    <Provider provider={provider}><Format ready={ready} /></Provider>
  } @else {
    <Format ready={ready} />
  }
}
