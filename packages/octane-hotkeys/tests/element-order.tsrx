import { useState } from 'octane';
import { useHotkey } from '@tanstack/octane-hotkeys';

export const elementOrderLog: string[] = [];

export function ElementOrderFixture({ childStops }: { childStops: boolean }) @{
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  useHotkey('Escape', () => elementOrderLog.push('hotkey'), { target: panel });
  <div ref={setPanel} tabIndex={0} onKeyDown={() => elementOrderLog.push('panel')}>
    <input
      id="child"
      role="combobox"
      aria-expanded="true"
      onKeyDown={(event: KeyboardEvent) => {
        elementOrderLog.push('child');
        if (childStops) event.stopPropagation();
      }}
    />
  </div>
}
