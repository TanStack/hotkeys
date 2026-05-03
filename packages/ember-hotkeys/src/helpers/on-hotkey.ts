import Helper from '@ember/component/helper';
import { getHotkeyManager } from '@tanstack/hotkeys';
import type {
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys';

export interface OnHotkeySignature {
  Args: {
    Positional: [hotkey: RegisterableHotkey, callback: HotkeyCallback];
    Named: OnHotkeyOptions;
  };
  Return: void;
}

export interface OnHotkeyOptions
  extends Omit<HotkeyOptions, 'enabled' | 'target'> {
  /**
   * Whether the hotkey is active.
   * Defaults to true.
   */
  enabled?: boolean;
  /**
   * The DOM element to attach the event listener to.
   * Defaults to document.
   */
  target?: HTMLElement | Document | Window | null;
}

/**
 * Ember helper for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This helper automatically handles registration and teardown:
 * when the helper enters the template, the key is registered;
 * when the template is destroyed, the listener is removed.
 *
 * @example
 * ```gts
 * import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';
 *
 * const combo = 'Mod+K';
 *
 * <template>
 *   {{onHotkey combo @onOpen}}
 * </template>
 * ```
 *
 * @example
 * ```gts
 * import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';
 *
 * <template>
 *   {{onHotkey "Mod+S" @onSave preventDefault=true}}
 * </template>
 * ```
 */
export default class OnHotkeyHelper extends Helper<OnHotkeySignature> {
  private handle?: HotkeyRegistrationHandle;

  compute(
    [hotkey, callback]: [RegisterableHotkey, HotkeyCallback],
    options: OnHotkeyOptions,
  ): void {
    this.handle?.unregister();

    const { enabled = true, target, ...rest } = options;
    const manager = getHotkeyManager();

    this.handle = manager.register(hotkey, callback, {
      ...rest,
      enabled,
      target: target ?? undefined,
    });
  }

  willDestroy(): void {
    super.willDestroy();
    this.handle?.unregister();
  }
}
