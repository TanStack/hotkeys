import {
  MODIFIER_ALIASES,
  getHotkeyManager,
  normalizeKeyName,
} from '@tanstack/hotkeys'
import type { Hotkey } from '@tanstack/hotkeys'
import type Alpine from 'alpinejs'

/**
 * Reads a hotkey from directive modifiers. HTML lowercases attribute names, so
 * `arrow-up` names `ArrowUp`. Each key ends a step, so `['mod', 'k']` is
 * `Mod+K` and `['g', 'h']` is the sequence `['G', 'H']`.
 */
export function hotkeyFromModifiers(
  modifiers: ReadonlyArray<string>,
): Hotkey | undefined {
  const steps: Array<string> = []
  let step = ''
  for (const part of modifiers) {
    if (Object.hasOwn(MODIFIER_ALIASES, part)) {
      step += `${MODIFIER_ALIASES[part]}+`
    } else {
      // One character goes through core, which keeps `ı` and `ß` as written.
      steps.push(
        step +
          ([...part].length === 1
            ? normalizeKeyName(part)
            : part.replace(/(?:^|-)(.)/g, (_, char: string) =>
                char.toUpperCase(),
              )),
      )
      step = ''
    }
  }
  // A modifier after the last key, as in `x-hotkey.s.mod`, names no key.
  if (step) return undefined
  return (steps.length > 1 ? steps : steps[0]) as Hotkey | undefined
}

/**
 * Installs `x-hotkey`, which registers the hotkey named by its modifiers while
 * its element exists: `x-hotkey.mod.s="save()"`, `x-hotkey.escape="close()"`,
 * `x-hotkey.g.h="goHome()"`. The expression gets `$event`. Alpine removes the
 * hotkey with its element, and when a morph changes or removes the attribute.
 */
export function hotkeyDirective(alpine: typeof Alpine): void {
  alpine.directive(
    'hotkey',
    alpine.skipDuringClone(
      (_element, { modifiers, expression }, { evaluateLater, cleanup }) => {
        const hotkey = hotkeyFromModifiers(modifiers)
        if (!hotkey) return
        const run = evaluateLater(expression)
        const handle = getHotkeyManager().register(hotkey, (event) =>
          run(() => {}, { scope: { $event: event }, params: [event] }),
        )
        cleanup(() => handle.unregister())
      },
    ),
  )
}
