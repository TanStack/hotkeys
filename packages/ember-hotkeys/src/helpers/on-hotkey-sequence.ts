import Helper from '@ember/component/helper';
import { getSequenceManager } from '@tanstack/hotkeys';
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys';

export interface OnHotkeySequenceSignature {
  Args: {
    Positional: [sequence: HotkeySequence, callback: HotkeyCallback];
    Named: OnHotkeySequenceOptions;
  };
  Return: void;
}

export interface OnHotkeySequenceOptions
  extends Omit<SequenceOptions, 'enabled' | 'target'> {
  /**
   * Whether the sequence is active.
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
 * Ember helper for registering a keyboard shortcut sequence (Vim-style).
 *
 * This helper allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * @example
 * ```gts
 * import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
 *
 * <template>
 *   {{onHotkeySequence (array "G" "G") @onGoToTop}}
 * </template>
 * ```
 *
 * @example
 * ```gts
 * import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
 *
 * <template>
 *   {{onHotkeySequence (array "D" "I" "W") @onDeleteWord timeout=500}}
 * </template>
 * ```
 */
export default class OnHotkeySequenceHelper extends Helper<OnHotkeySequenceSignature> {
  private handle?: SequenceRegistrationHandle;

  compute(
    [sequence, callback]: [HotkeySequence, HotkeyCallback],
    options: OnHotkeySequenceOptions,
  ): void {
    this.handle?.unregister();

    if (!sequence || sequence.length === 0) {
      return;
    }

    const { enabled = true, target, ...rest } = options;
    const manager = getSequenceManager();

    this.handle = manager.register(sequence, callback, {
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
