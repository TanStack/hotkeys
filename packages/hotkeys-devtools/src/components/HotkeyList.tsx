import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import clsx from 'clsx'
import { matchSorter } from 'match-sorter'
import { formatForDisplay } from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { effectiveSequenceMatchedSteps } from '../sequence-progress'
import {
  formatRegistration,
  getBindingKind,
  useRegistrationConflicts,
} from '../_registrations'
import type { SequenceRegistrationView } from '@tanstack/hotkeys'

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

function buildRowTooltip(meta?: {
  name?: string
  description?: string
  group?: string
}): string | undefined {
  if (!meta) return undefined
  const parts: Array<string> = []
  if (meta.group) parts.push(meta.group)
  if (meta.name) parts.push(meta.name)
  if (meta.description) parts.push(meta.description)
  return parts.length > 0 ? parts.join(' — ') : undefined
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

  const conflicts = useRegistrationConflicts(() => props.reg)
  const targetConflicts = () => conflicts().overlapping
  const scopeConflicts = () => conflicts().separate
  const hasTargetConflict = () => targetConflicts().length > 0
  const hasScopeConflict = () => scopeConflicts().length > 0
  const targetConflictBadge = () => ({
    style: 'badgeConflict' as const,
    label: '!',
    tooltip: `Potential overlap: ${targetConflicts().length} other bindings on overlapping targets`,
  })
  const scopeConflictTooltip = () =>
    `Info: ${scopeConflicts().length} related bindings on separate targets`

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

  const metaName = () => props.reg.options.meta?.name
  const rowTooltip = () => buildRowTooltip(props.reg.options.meta)

  return (
    <div
      class={clsx(
        styles().hotkeyRow,
        props.selectedId() === props.reg.id && styles().hotkeyRowSelected,
        pulsing() && styles().hotkeyRowTriggered,
        rowTooltip() && styles().tooltip,
      )}
      onClick={() => props.setSelectedId(props.reg.id)}
    >
      <Show when={rowTooltip()}>
        <span class={styles().rowTooltipText} data-tooltip>
          {rowTooltip()}
        </span>
      </Show>
      <span class={styles().hotkeyLabel}>
        <span class={styles().hotkeyLabelKeys}>
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
                  {formatForDisplay(step, {
                    platform: props.reg.options.platform,
                  })}
                </span>
              </span>
            )}
          </For>
        </span>
        <Show when={metaName()}>
          <span class={styles().hotkeyLabelName}>{metaName()}</span>
        </Show>
      </span>
      <Show when={triggerCount() > 0}>
        <span class={styles().triggerCount}>x{triggerCount()}</span>
      </Show>
      <div class={styles().hotkeyBadges}>
        <span
          class={clsx(styles().badge, styles().badgeTarget)}
          data-binding-kind
        >
          {getBindingKind(props.reg)}
        </span>
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

  const [searchQuery, setSearchQuery] = createSignal('')

  const registrations = createMemo(() => state.registrations())
  const sequenceRegistrations = createMemo(() => state.sequenceRegistrations())

  const filteredRegistrations = createMemo(() => {
    const query = searchQuery().trim()
    if (!query) return registrations()
    return matchSorter(registrations(), query, {
      keys: [
        (r) => formatRegistration(r),
        'hotkey',
        'options.meta.name',
        'options.meta.description',
        'options.meta.group',
      ],
    })
  })

  const filteredSequenceRegistrations = createMemo(() => {
    const query = searchQuery().trim()
    if (!query) return sequenceRegistrations()
    return matchSorter(sequenceRegistrations(), query, {
      keys: [
        (r) => formatRegistration(r),
        (r) => r.sequence.join(' '),
        'options.meta.name',
        'options.meta.description',
        'options.meta.group',
      ],
    })
  })

  return (
    <>
      <div class={styles().searchContainer}>
        <input
          type="text"
          class={styles().searchInput}
          placeholder="Search hotkeys..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <Show when={searchQuery()}>
          <button
            class={styles().searchClear}
            onClick={() => setSearchQuery('')}
          >
            &times;
          </button>
        </Show>
      </div>

      <div class={styles().panelHeader}>
        Hotkeys ({filteredRegistrations().length})
      </div>
      <div class={styles().hotkeyList}>
        <For each={filteredRegistrations()}>
          {(reg) => {
            const conflicts = useRegistrationConflicts(() => reg)
            const targetConflicts = () => conflicts().overlapping
            const scopeConflicts = () => conflicts().separate
            const hasTargetConflict = () => targetConflicts().length > 0
            const hasScopeConflict = () => scopeConflicts().length > 0
            const targetConflictBadge = () => ({
              style: 'badgeConflict' as const,
              label: '!',
              tooltip: `Potential overlap: ${targetConflicts().length} other bindings on overlapping targets`,
            })
            const scopeConflictTooltip = () =>
              `Info: ${scopeConflicts().length} related bindings on separate targets`

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

            const metaName = () => reg.options.meta?.name
            const rowTooltip = () => buildRowTooltip(reg.options.meta)

            return (
              <div
                class={clsx(
                  styles().hotkeyRow,
                  props.selectedId() === reg.id && styles().hotkeyRowSelected,
                  pulsing() && styles().hotkeyRowTriggered,
                  rowTooltip() && styles().tooltip,
                )}
                onClick={() => props.setSelectedId(reg.id)}
              >
                <Show when={rowTooltip()}>
                  <span class={styles().rowTooltipText} data-tooltip>
                    {rowTooltip()}
                  </span>
                </Show>
                <span class={styles().hotkeyLabel}>
                  <span class={styles().hotkeyLabelKeys}>
                    {formatRegistration(reg)}
                  </span>
                  <Show when={metaName()}>
                    <span class={styles().hotkeyLabelName}>{metaName()}</span>
                  </Show>
                </span>
                <Show when={triggerCount() > 0}>
                  <span class={styles().triggerCount}>x{triggerCount()}</span>
                </Show>
                <div class={styles().hotkeyBadges}>
                  <span
                    class={clsx(styles().badge, styles().badgeTarget)}
                    data-binding-kind
                  >
                    {getBindingKind(reg)}
                  </span>
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
        Sequences ({filteredSequenceRegistrations().length})
      </div>
      <div class={styles().hotkeyList}>
        <For each={filteredSequenceRegistrations()}>
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
