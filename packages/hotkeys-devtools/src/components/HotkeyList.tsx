import { formatForDisplay } from '@tanstack/hotkeys'
import clsx from 'clsx'
import { matchSorter } from 'match-sorter'
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  untrack,
} from 'solid-js'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import {
  formatRegistration,
  getBindingKind,
  useRegistrationConflicts,
} from '../_registrations'
import { groupByScope, scopeStatusDescriptions } from '../_scopes'
import { getTargetLabel, getTargetTooltip } from '../_targets'
import { effectiveSequenceMatchedSteps } from '../sequence-progress'
import { useStyles } from '../styles/use-styles'
import type {
  AppHotkeyListItem,
  HotkeyMeta,
  HotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type { ScopeGroup } from '../_scopes'

type HotkeyListProps = {
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}

function buildRowTooltip(meta?: HotkeyMeta): string | undefined {
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
  id: string
  appHotkeyById: () => ReadonlyMap<string, AppHotkeyListItem>
  sequenceProgressNow: () => number
  selectedId: () => string | null
  setSelectedId: (id: string | null) => void
}) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()

  // The list is keyed by id, so this row lives as long as its registration.
  // Each update makes new view objects; read the current one by id, and keep
  // the last one while the list removes this row.
  const liveReg = createMemo<HotkeyRegistrationView>(
    (prev) => state.registrations().find((r) => r.id === props.id) ?? prev!,
  )
  const conflicts = useRegistrationConflicts(liveReg)
  const targetConflicts = () => conflicts().overlapping
  const scopeConflicts = () => conflicts().separate
  const hasTargetConflict = () => targetConflicts().length > 0
  const hasScopeConflict = () => scopeConflicts().length > 0
  const targetConflictBadge = () => ({
    style: 'badgeConflict' as const,
    label: '!',
    tooltip: `Potential overlap: ${targetConflicts().length} other bindings in the same scope on overlapping targets`,
  })
  const scopeConflictTooltip = () =>
    `Info: ${scopeConflicts().length} related bindings in other scopes or on separate targets`

  const enabled = () => liveReg().options.enabled !== false
  const appHotkey = () => {
    const id = liveReg().options.appHotkeyId
    return id === undefined ? undefined : props.appHotkeyById().get(id)
  }

  const triggerCount = () => liveReg().triggerCount
  const matchedSteps = createMemo(() => {
    const reg = liveReg()
    return reg.kind === 'sequence'
      ? effectiveSequenceMatchedSteps(reg, props.sequenceProgressNow())
      : 0
  })

  const [prevCount, setPrevCount] = createSignal(untrack(triggerCount))
  const [pulsing, setPulsing] = createSignal(false)

  let pulseTimer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => clearTimeout(pulseTimer))

  createEffect(
    on(triggerCount, (current) => {
      if (current > prevCount()) {
        // Restart the pulse when it fires again before the last one ends.
        clearTimeout(pulseTimer)
        setPulsing(true)
        pulseTimer = setTimeout(() => setPulsing(false), 600)
      }
      setPrevCount(current)
    }),
  )

  const metaName = () => liveReg().options.meta?.name
  const rowTooltip = () => buildRowTooltip(liveReg().options.meta)

  return (
    <div
      class={clsx(
        styles().hotkeyRow,
        props.selectedId() === props.id && styles().hotkeyRowSelected,
        pulsing() && styles().hotkeyRowTriggered,
        rowTooltip() && styles().tooltip,
      )}
      onClick={() => props.setSelectedId(props.id)}
    >
      <Show when={rowTooltip()}>
        <span class={styles().rowTooltipText} data-tooltip>
          {rowTooltip()}
        </span>
      </Show>
      <span class={styles().hotkeyLabel} data-row-label>
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
        <Show when={liveReg().kind === 'sequence'}>
          <span class={clsx(styles().badge, styles().badgeTarget)}>seq</span>
        </Show>
        <span
          class={clsx(styles().badge, styles().badgeTarget)}
          data-binding-kind
        >
          {getBindingKind(liveReg())}
        </span>
        <Show when={appHotkey()?.isCustom}>
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
            (liveReg().options.eventType ?? 'keydown') === 'keydown'
              ? styles().badgeKeydown
              : styles().badgeKeyup,
            styles().tooltip,
          )}
        >
          {liveReg().options.eventType ?? 'keydown'}
          <span class={styles().tooltipText} data-tooltip>
            Fires on {liveReg().options.eventType ?? 'keydown'} event
          </span>
        </span>
        <span
          class={clsx(styles().badge, styles().badgeTarget, styles().tooltip)}
        >
          {getTargetLabel(liveReg().target)}
          <span class={styles().tooltipText} data-tooltip>
            {getTargetTooltip(liveReg().target)}
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
      <span class={styles().hotkeyLabel} data-row-label>
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
        <Show when={props.item.appHotkey.scope}>
          {(scope) => (
            <span class={clsx(styles().badge, styles().badgeTarget)}>
              {scope()}
            </span>
          )}
        </Show>
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
        'options.scope',
      ],
    })
  })

  const scopeGroups = createMemo(() =>
    groupByScope(filteredRegistrations(), state.scopes()),
  )
  // Groups and views are new objects on every update. Render by scope name
  // and registration id so rows keep their DOM nodes and state.
  const scopeNames = createMemo(() => scopeGroups().map((group) => group.scope))
  const groupByName = createMemo(
    () => new Map(scopeGroups().map((group) => [group.scope, group])),
  )

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
        'appHotkey.scope',
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
        <For each={scopeNames()}>
          {(scope) => {
            const group = createMemo<ScopeGroup>(
              (prev) => groupByName().get(scope) ?? prev!,
            )
            const ids = createMemo(() =>
              group().registrations.map((reg) => reg.id),
            )
            return (
              <div
                class={clsx(
                  styles().scopeGroup,
                  (group().status === 'suspended' ||
                    group().status === 'inactive') &&
                    styles().scopeGroupDimmed,
                )}
              >
                <div class={styles().scopeHeader}>
                  <span class={styles().scopeName}>
                    {group().scope}
                    <span class={styles().scopeNameSuffix}> scope</span>
                  </span>
                  <span class={styles().scopeCount}>
                    {group().registrations.length}
                  </span>
                  <span
                    class={clsx(
                      styles().badge,
                      styles().tooltip,
                      group().status === 'exclusive'
                        ? styles().badgeExclusive
                        : group().status === 'allowed'
                          ? styles().badgeInfo
                          : group().status === 'active'
                            ? styles().badgeEnabled
                            : group().status === 'suspended'
                              ? styles().badgeSuspended
                              : styles().badgeDisabled,
                    )}
                  >
                    {group().status}
                    <span class={styles().tooltipText} data-tooltip>
                      {scopeStatusDescriptions[group().status]}
                    </span>
                  </span>
                </div>
                <For each={ids()}>
                  {(id) => (
                    <RegistrationRow
                      id={id}
                      appHotkeyById={appHotkeyById}
                      sequenceProgressNow={state.sequenceProgressNow}
                      selectedId={props.selectedId}
                      setSelectedId={props.setSelectedId}
                    />
                  )}
                </For>
              </div>
            )
          }}
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
