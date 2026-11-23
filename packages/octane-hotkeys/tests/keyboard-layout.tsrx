import {
  HotkeysProvider, useFormatForDisplay, useKeyboardLayout,
} from '@tanstack/octane-hotkeys';
import type { KeyboardLayoutMap } from '@tanstack/octane-hotkeys';

export const layoutCapture: {
  labels: string[];
  seen: Array<KeyboardLayoutMap | null>;
} = { labels: [], seen: [] };

type Props = { keyboardLayout?: boolean };

function LayoutLabel() @{
  const format = useFormatForDisplay();
  const label = format('Mod+[KeyQ]');
  layoutCapture.labels.push(label);
  <kbd>{label}</kbd>
}

export function LayoutFixture({ keyboardLayout }: Props) @{
  <HotkeysProvider defaultOptions={{ platform: 'windows', keyboardLayout }}>
    <LayoutLabel />
  </HotkeysProvider>
}

export function ManyLabelsFixture() @{
  <HotkeysProvider defaultOptions={{ platform: 'windows' }}>
    <LayoutLabel />
    <LayoutLabel />
    <LayoutLabel />
  </HotkeysProvider>
}

export function BareLabel() @{
  const format = useFormatForDisplay();
  <kbd>{format('[KeyQ]')}</kbd>
}

export function CustomLabel() @{
  const format = useFormatForDisplay();
  <kbd>{format('[KeyQ]', { layoutMap: new Map([['KeyQ', 'x']]) })}</kbd>
}

export function LayoutReader() @{
  const layoutMap = useKeyboardLayout();
  layoutCapture.seen.push(layoutMap);
  <output>{layoutMap?.get('KeyQ') ?? 'none'}</output>
}

export function DisabledLayoutFixture() @{
  <HotkeysProvider defaultOptions={{ platform: 'windows', keyboardLayout: false }}>
    <LayoutLabel />
    <LayoutReader />
  </HotkeysProvider>
}

export function NestedLayoutFixture() @{
  <HotkeysProvider defaultOptions={{ platform: 'windows', keyboardLayout: false }}>
    <HotkeysProvider defaultOptions={{ keyboardLayout: true }}>
      <LayoutLabel />
    </HotkeysProvider>
  </HotkeysProvider>
}
