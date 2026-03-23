import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import clsx from 'clsx'
import { formatForDisplay } from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { effectiveSequenceMatchedSteps } from '../sequence-progress'
import type {
  ConflictBehavior,
  HotkeyRegistration,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

function sequenceKey(sequence: Array<string>): string {
  return sequence.join('|')
}

type HotkeyListProps = {
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}

function getTargetLabel(target: HTMLElement | Document | Window): string {
  if (typeof document !== 'undefined' && target === document) {
    return 'document'
  }
  if (typeof window !== 'undefined' && target === window) {
    return 'window'
  }
  if (target instanceof HTMLElement) {
    return target.tagName.toLowerCase()
  }
  return 'element'
}

function getTargetTooltip(target: HTMLElement | Document | Window): string {
  if (typeof document !== 'undefined' && target === document) {
    return 'Listening on document'
  }
  if (typeof window !== 'undefined' && target === window) {
    return 'Listening on window'
  }
  if (target instanceof HTMLElement) {
    const tag = target.tagName.toLowerCase()
    const parts: Array<string> = [tag]
    if (target.id) {
      parts.push(`id="${target.id}"`)
    }
    if (target.className) {
      const classes = target.className.split(/\s+/).filter(Boolean).join(', ')
      parts.push(`class="${classes}"`)
    }
    // Collect data- attributes
    const dataAttrs = Array.from(target.attributes)
      .filter((attr) => attr.name.startsWith('data-'))
      .map((attr) => `${attr.name}="${attr.value}"`)
    if (dataAttrs.length > 0) {
      parts.push(...dataAttrs)
    }
    return `Listening on ${parts.join(' ')}`
  }
  return 'Listening on element'
}

function findTargetConflicts(
  registration: HotkeyRegistration,
  all: Array<HotkeyRegistration>,
): Array<HotkeyRegistration> {
  return all.filter(
    (other) =>
      other.id !== registration.id &&
      other.hotkey === registration.hotkey &&
      other.options.eventType === registration.options.eventType &&
      other.target === registration.target,
  )
}

function findScopeConflicts(
  registration: HotkeyRegistration,
  all: Array<HotkeyRegistration>,
): Array<HotkeyRegistration> {
  return all.filter(
    (other) =>
      other.id !== registration.id &&
      other.hotkey === registration.hotkey &&
      other.options.eventType === registration.options.eventType &&
      other.target !== registration.target,
  )
}

function findSequenceTargetConflicts(
  registration: SequenceRegistrationView,
  all: Array<SequenceRegistrationView>,
): Array<SequenceRegistrationView> {
  return all.filter(
    (other) =>
      other.id !== registration.id &&
      sequenceKey(other.sequence) === sequenceKey(registration.sequence) &&
      other.options.eventType === registration.options.eventType &&
      other.target === registration.target,
  )
}

function findSequenceScopeConflicts(
  registration: SequenceRegistrationView,
  all: Array<SequenceRegistrationView>,
): Array<SequenceRegistrationView> {
  return all.filter(
    (other) =>
      other.id !== registration.id &&
      sequenceKey(other.sequence) === sequenceKey(registration.sequence) &&
      other.options.eventType === registration.options.eventType &&
      other.target !== registration.target,
  )
}

function SequenceListRow(props: {
  reg: SequenceRegistrationView
  getSequences: () => Array<SequenceRegistrationView>
  sequenceProgressNow: () => number
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}) {
  const styles = useStyles()

  const sequenceRegistrations = () => props.getSequences()

  const targetConflicts = () =>
    findSequenceTargetConflicts(props.reg, sequenceRegistrations())
  const scopeConflicts = () =>
    findSequenceScopeConflicts(props.reg, sequenceRegistrations())

  const hasTargetConflict = () => targetConflicts().length > 0
  const hasScopeConflict = () => scopeConflicts().length > 0

  const conflictBehavior = (): ConflictBehavior =>
    props.reg.options.conflictBehavior ?? 'warn'

  const targetConflictBadge = () => {
    const behavior = conflictBehavior()
    const c = targetConflicts()
    if (behavior === 'allow') {
      return {
        style: 'badgeAllow' as const,
        label: '~',
        tooltip: `Allowed: ${c.length} other binding${c.length > 1 ? 's' : ''} on same sequence and target (conflictBehavior: allow)`,
      }
    }
    if (behavior === 'error') {
      return {
        style: 'badgeError' as const,
        label: '!',
        tooltip: `Error: ${c.length} conflicting binding${c.length > 1 ? 's' : ''} on same sequence and target (conflictBehavior: error)`,
      }
    }
    return {
      style: 'badgeConflict' as const,
      label: '!',
      tooltip: `Warning: ${c.length} other binding${c.length > 1 ? 's' : ''} on same sequence and target`,
    }
  }

  const scopeConflictTooltip = () => {
    const c = scopeConflicts()
    return `Info: ${c.length} binding${c.length > 1 ? 's' : ''} with same sequence on different target${c.length > 1 ? 's' : ''}`
  }

  const enabled = () => props.reg.options.enabled !== false

  const liveSequenceReg = createMemo(
    () =>
      sequenceRegistrations().find((r) => r.id === props.reg.id) ?? props.reg,
  )

  const triggerCount = () =>
    sequenceRegistrations().find((r) => r.id === props.reg.id)?.triggerCount ??
    props.reg.triggerCount

  const matchedSteps = createMemo(() =>
    effectiveSequenceMatchedSteps(
      liveSequenceReg(),
      props.sequenceProgressNow(),
    ),
  )

  const [prevCount, setPrevCount] = createSignal(props.reg.triggerCount)
  const [pulsing, setPulsing] = createSignal(false)

  createEffect(
    on(triggerCount, (current) => {
      if (current > prevCount()) {
        setPulsing(true)
        setTimeout(() => setPulsing(false), 600)
      }
      setPrevCount(current)
    }),
  )

  return (
    <div
      class={clsx(
        styles().hotkeyRow,
        props.selectedId() === props.reg.id && styles().hotkeyRowSelected,
        pulsing() && styles().hotkeyRowTriggered,
      )}
      onClick={() => props.setSelectedId(props.reg.id)}
    >
      <span class={styles().hotkeyLabel}>
        <For each={liveSequenceReg().sequence}>
          {(step, i) => (
            <span>
              <Show when={i() > 0}> </Show>
              <span
                class={
                  i() < matchedSteps()
                    ? styles().sequenceStepMatched
                    : undefined
                }
              >
                {formatForDisplay(step)}
              </span>
            </span>
          )}
        </For>
      </span>
      <Show when={triggerCount() > 0}>
        <span class={styles().triggerCount}>x{triggerCount()}</span>
      </Show>
      <div class={styles().hotkeyBadges}>
        {hasTargetConflict() && (
          <span
            class={clsx(
              styles().badge,
              styles()[targetConflictBadge().style],
              styles().tooltip,
            )}
          >
            {targetConflictBadge().label}
            <span class={styles().tooltipText} data-tooltip>
              {targetConflictBadge().tooltip}
            </span>
          </span>
        )}
        {hasScopeConflict() && (
          <span
            class={clsx(styles().badge, styles().badgeInfo, styles().tooltip)}
          >
            i
            <span class={styles().tooltipText} data-tooltip>
              {scopeConflictTooltip()}
            </span>
          </span>
        )}
        <span
          class={clsx(
            styles().badge,
            enabled() ? styles().badgeEnabled : styles().badgeDisabled,
            styles().tooltip,
          )}
        >
          {enabled() ? 'on' : 'off'}
          <span class={styles().tooltipText} data-tooltip>
            {enabled() ? 'Sequence is enabled' : 'Sequence is disabled'}
          </span>
        </span>
        <span
          class={clsx(
            styles().badge,
            (props.reg.options.eventType ?? 'keydown') === 'keydown'
              ? styles().badgeKeydown
              : styles().badgeKeyup,
            styles().tooltip,
          )}
        >
          {props.reg.options.eventType ?? 'keydown'}
          <span class={styles().tooltipText} data-tooltip>
            Fires on {props.reg.options.eventType ?? 'keydown'} event
          </span>
        </span>
        <span
          class={clsx(styles().badge, styles().badgeTarget, styles().tooltip)}
        >
          {getTargetLabel(props.reg.target)}
          <span class={styles().tooltipText} data-tooltip>
            {getTargetTooltip(props.reg.target)}
          </span>
        </span>
      </div>
    </div>
  )
}

export function HotkeyList(props: HotkeyListProps) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()

  const registrations = createMemo(() => state.registrations())
  const sequenceRegistrations = createMemo(() => state.sequenceRegistrations())

  return (
    <>
      <div class={styles().panelHeader}>Hotkeys ({registrations().length})</div>
      <div class={styles().hotkeyList}>
        <For each={registrations()}>
          {(reg) => {
            const targetConflicts = () =>
              findTargetConflicts(reg, registrations())
            const scopeConflicts = () =>
              findScopeConflicts(reg, registrations())

            const hasTargetConflict = () => targetConflicts().length > 0
            const hasScopeConflict = () => scopeConflicts().length > 0

            const conflictBehavior = (): ConflictBehavior =>
              reg.options.conflictBehavior ?? 'warn'

            const targetConflictBadge = () => {
              const behavior = conflictBehavior()
              const c = targetConflicts()
              if (behavior === 'allow') {
                return {
                  style: 'badgeAllow' as const,
                  label: '~',
                  tooltip: `Allowed: ${c.length} other binding${c.length > 1 ? 's' : ''} on same key and target (conflictBehavior: allow)`,
                }
              }
              if (behavior === 'error') {
                return {
                  style: 'badgeError' as const,
                  label: '!',
                  tooltip: `Error: ${c.length} conflicting binding${c.length > 1 ? 's' : ''} on same key and target (conflictBehavior: error)`,
                }
              }
              // 'warn' (default) or 'replace' (replacement already happened, but show warn-style if somehow present)
              return {
                style: 'badgeConflict' as const,
                label: '!',
                tooltip: `Warning: ${c.length} other binding${c.length > 1 ? 's' : ''} on same key and target`,
              }
            }

            const scopeConflictTooltip = () => {
              const c = scopeConflicts()
              return `Info: ${c.length} binding${c.length > 1 ? 's' : ''} with same key on different target${c.length > 1 ? 's' : ''}`
            }

            const enabled = () => reg.options.enabled !== false

            // Look up trigger count reactively from the registrations list
            // (reg is a stable object ref; the list re-derives on store change)
            const triggerCount = () =>
              registrations().find((r) => r.id === reg.id)?.triggerCount ??
              reg.triggerCount

            // Track trigger count changes for pulse animation
            const [prevCount, setPrevCount] = createSignal(reg.triggerCount)
            const [pulsing, setPulsing] = createSignal(false)

            createEffect(
              on(triggerCount, (current) => {
                if (current > prevCount()) {
                  setPulsing(true)
                  setTimeout(() => setPulsing(false), 600)
                }
                setPrevCount(current)
              }),
            )

            return (
              <div
                class={clsx(
                  styles().hotkeyRow,
                  props.selectedId() === reg.id && styles().hotkeyRowSelected,
                  pulsing() && styles().hotkeyRowTriggered,
                )}
                onClick={() => props.setSelectedId(reg.id)}
              >
                <span class={styles().hotkeyLabel}>
                  {formatForDisplay(reg.hotkey)}
                </span>
                <Show when={triggerCount() > 0}>
                  <span class={styles().triggerCount}>x{triggerCount()}</span>
                </Show>
                <div class={styles().hotkeyBadges}>
                  {hasTargetConflict() && (
                    <span
                      class={clsx(
                        styles().badge,
                        styles()[targetConflictBadge().style],
                        styles().tooltip,
                      )}
                    >
                      {targetConflictBadge().label}
                      <span class={styles().tooltipText} data-tooltip>
                        {targetConflictBadge().tooltip}
                      </span>
                    </span>
                  )}
                  {hasScopeConflict() && (
                    <span
                      class={clsx(
                        styles().badge,
                        styles().badgeInfo,
                        styles().tooltip,
                      )}
                    >
                      i
                      <span class={styles().tooltipText} data-tooltip>
                        {scopeConflictTooltip()}
                      </span>
                    </span>
                  )}
                  <span
                    class={clsx(
                      styles().badge,
                      enabled()
                        ? styles().badgeEnabled
                        : styles().badgeDisabled,
                      styles().tooltip,
                    )}
                  >
                    {enabled() ? 'on' : 'off'}
                    <span class={styles().tooltipText} data-tooltip>
                      {enabled() ? 'Hotkey is enabled' : 'Hotkey is disabled'}
                    </span>
                  </span>
                  <span
                    class={clsx(
                      styles().badge,
                      (reg.options.eventType ?? 'keydown') === 'keydown'
                        ? styles().badgeKeydown
                        : styles().badgeKeyup,
                      styles().tooltip,
                    )}
                  >
                    {reg.options.eventType ?? 'keydown'}
                    <span class={styles().tooltipText} data-tooltip>
                      Fires on {reg.options.eventType ?? 'keydown'} event
                    </span>
                  </span>
                  <span
                    class={clsx(
                      styles().badge,
                      styles().badgeTarget,
                      styles().tooltip,
                    )}
                  >
                    {getTargetLabel(reg.target)}
                    <span class={styles().tooltipText} data-tooltip>
                      {getTargetTooltip(reg.target)}
                    </span>
                  </span>
                </div>
              </div>
            )
          }}
        </For>
      </div>

      <div class={styles().panelHeader}>
        Sequences ({sequenceRegistrations().length})
      </div>
      <div class={styles().hotkeyList}>
        <For each={sequenceRegistrations()}>
          {(reg) => (
            <SequenceListRow
              reg={reg}
              getSequences={sequenceRegistrations}
              sequenceProgressNow={state.sequenceProgressNow}
              selectedId={props.selectedId}
              setSelectedId={props.setSelectedId}
            />
          )}
        </For>
      </div>
    </>
  )
}
