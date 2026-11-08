import { useRef, useState } from 'octane';
import { useHotkey, useHotkeys } from '@tanstack/octane-hotkeys';

export const refTargetLog: string[] = [];

export function RefTargetFixture() @{
  const panel = useRef<HTMLDivElement | null>(null);
  // Untyped code can leave a ref unset; it waits like null.
  const shared = useRef<HTMLDivElement>();
  const [which, setWhich] = useState<'none' | 'a' | 'b'>('none');
  useHotkey('K', () => refTargetLog.push('K'), { target: panel });
  useHotkeys([{ hotkey: 'J', callback: () => refTargetLog.push('J') }], { target: shared });
  <div>
    <button id="show-a" onClick={() => setWhich('a')}>Show A</button>
    <button id="show-b" onClick={() => setWhich('b')}>Show B</button>
    @if (which === 'a') { <div id="a" ref={panel} tabIndex={0} /> }
    @if (which === 'b') { <div id="b" ref={panel} tabIndex={0} /> }
    @if (which !== 'none') { <div id="shared" ref={shared as never} tabIndex={0} /> }
  </div>
}
