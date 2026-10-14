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
import type {
  AppHotkeyListItem,
  HotkeyRegistrationView,
} from '@tanstack/hotkeys'

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

/** Formats a hotkey step by step, highlighting matched sequence steps. */
function RegistrationKeys(props: {
  reg: HotkeyRegistrationView
  matchedSteps: () => number
}) {
  const styles = useStyles()
  return (
    <Show
      when={props.reg.kind === 'sequence' && props.reg}
      fallback={formatRegistration(props.reg)}
    >
      {(sequence) => (
        <For each={sequence().hotkey}>
          {(step, i) => (
            <span>
              <Show when={i() > 0}> </Show>
              <span
                class={
                  i() < props.matchedSteps()
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
      )}
    </Show>
  )
}

function RegistrationRow(props: {
  reg: HotkeyRegistrationView
  appHotkey: () => AppHotkeyListItem | undefined
  sequenceProgressNow: () => number
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()

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

  // reg is a stable object ref; read live counts and progress from the list.
  const liveReg = createMemo(
    () => state.registrations().find((r) => r.id === props.reg.id) ?? props.reg,
  )
  const triggerCount = () => liveReg().triggerCount
  const matchedSteps = createMemo(() => {
    const reg = liveReg()
    return reg.kind === 'sequence'
      ? effectiveSequenceMatchedSteps(reg, props.sequenceProgressNow())
      : 0
  })

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
          <RegistrationKeys reg={liveReg()} matchedSteps={matchedSteps} />
        </span>
        <Show when={metaName()}>
          <span class={styles().hotkeyLabelName}>{metaName()}</span>
        </Show>
      </span>
      <Show when={triggerCount() > 0}>
        <span class={styles().triggerCount}>x{triggerCount()}</span>
      </Show>
      <div class={styles().hotkeyBadges}>
        <Show when={props.reg.kind === 'sequence'}>
          <span class={clsx(styles().badge, styles().badgeTarget)}>seq</span>
        </Show>
        <span
          class={clsx(styles().badge, styles().badgeTarget)}
          data-binding-kind
        >
          {getBindingKind(props.reg)}
        </span>
        <Show when={props.appHotkey()?.isCustom}>
          <span
            class={clsx(styles().badge, styles().badgeCustom, styles().tooltip)}
          >
            custom
            <span class={styles().tooltipText} data-tooltip>
              The user changed this app hotkey from its default
            </span>
          </span>
        </Show>
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
            {enabled() ? 'Hotkey is enabled' : 'Hotkey is disabled'}
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

/** A declared app hotkey that nothing has registered, or that has no hotkey. */
function AppHotkeyRow(props: {
  item: AppHotkeyListItem
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}) {
  const styles = useStyles()
  const id = () => appHotkeySelectionId(props.item.appHotkey.id)
  const hotkey = () => props.item.appHotkey.hotkey
  return (
    <div
      class={clsx(
        styles().hotkeyRow,
        styles().hotkeyRowInactive,
        props.selectedId() === id() && styles().hotkeyRowSelected,
      )}
      onClick={() => props.setSelectedId(id())}
    >
      <span class={styles().hotkeyLabel}>
        <span class={styles().hotkeyLabelKeys}>
          {hotkey()
            ? formatForDisplay(hotkey()!, { sequenceSeparator: ' → ' })
            : 'Unassigned'}
        </span>
        <span class={styles().hotkeyLabelName}>
          {props.item.appHotkey.meta?.name ?? props.item.appHotkey.id}
        </span>
      </span>
      <div class={styles().hotkeyBadges}>
        <Show when={props.item.isCustom}>
          <span class={clsx(styles().badge, styles().badgeCustom)}>custom</span>
        </Show>
        <span
          class={clsx(styles().badge, styles().badgeDisabled, styles().tooltip)}
        >
          {props.item.status}
          <span class={styles().tooltipText} data-tooltip>
            {props.item.status === 'unbound'
              ? 'Declared without a hotkey'
              : 'Declared but not registered on this page'}
          </span>
        </span>
      </div>
    </div>
  )
}

/** Selection ids for app hotkeys, kept distinct from registration ids. */
export function appHotkeySelectionId(id: string): string {
  return `app:${id}`
}

export function HotkeyList(props: HotkeyListProps) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()

  const [searchQuery, setSearchQuery] = createSignal('')

  const appHotkeyById = createMemo(
    () => new Map(state.appHotkeys().map((item) => [item.appHotkey.id, item])),
  )

  const filteredRegistrations = createMemo(() => {
    const query = searchQuery().trim()
    if (!query) return state.registrations()
    return matchSorter(state.registrations(), query, {
      keys: [
        (r) => formatRegistration(r),
        (r) => (typeof r.hotkey === 'string' ? r.hotkey : r.hotkey.join(' ')),
        'options.meta.name',
        'options.meta.description',
        'options.meta.group',
      ],
    })
  })

  const filteredAppHotkeys = createMemo(() => {
    const unregistered = state
      .appHotkeys()
      .filter((item) => item.registrations.length === 0)
    const query = searchQuery().trim()
    if (!query) return unregistered
    return matchSorter(unregistered, query, {
      keys: [
        'appHotkey.id',
        'appHotkey.meta.name',
        'appHotkey.meta.description',
        'appHotkey.meta.group',
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
          {(reg) => (
            <RegistrationRow
              reg={reg}
              appHotkey={() =>
                reg.options.appHotkeyId === undefined
                  ? undefined
                  : appHotkeyById().get(reg.options.appHotkeyId)
              }
              sequenceProgressNow={state.sequenceProgressNow}
              selectedId={props.selectedId}
              setSelectedId={props.setSelectedId}
            />
          )}
        </For>
      </div>

      <Show when={state.appHotkeys().length > 0}>
        <div class={styles().panelHeader}>
          Declared, not registered ({filteredAppHotkeys().length})
        </div>
        <div class={styles().hotkeyList}>
          <For each={filteredAppHotkeys()}>
            {(item) => (
              <AppHotkeyRow
                item={item}
                selectedId={props.selectedId}
                setSelectedId={props.setSelectedId}
              />
            )}
          </For>
        </div>
      </Show>
    </>
  )
}
