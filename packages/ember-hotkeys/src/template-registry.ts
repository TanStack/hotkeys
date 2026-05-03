import type OnHotkeyHelper from './helpers/on-hotkey';
import type OnHotkeySequenceHelper from './helpers/on-hotkey-sequence';

export default interface Registry {
  'on-hotkey': typeof OnHotkeyHelper;
  'on-hotkey-sequence': typeof OnHotkeySequenceHelper;
}
