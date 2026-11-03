import { useImportShortcuts } from './octane-import';
import { usePragmaShortcuts } from './pragma';
import { useTsxShortcuts } from './tsx-hook';

export const customHookLog: string[] = [];

export function CustomHooksFixture() @{
  useImportShortcuts(customHookLog);
  usePragmaShortcuts(customHookLog);
  useTsxShortcuts(customHookLog);
  <div />
}
