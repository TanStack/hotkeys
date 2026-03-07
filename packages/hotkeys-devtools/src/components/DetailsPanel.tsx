import { For, Show, createMemo } from 'solid-js'
import { formatForDisplay, formatHotkeySequence } from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { ActionButtons } from './ActionButtons'
import type {
  ConflictBehavior,
  HotkeyRegistration,
  HotkeySequence,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

function sequenceKey(sequence: Array<string>): string {
  return sequence.join('|')
}

function isSequenceRegistration(
  reg: HotkeyRegistration | SequenceRegistrationView,
): reg is SequenceRegistrationView {
  return 'sequence' in reg && Array.isArray(reg.sequence)
}

type DetailsPanelProps = {
  selectedRegistration: () =>
    | HotkeyRegistration
    | SequenceRegistrationView
    | null
}

function getTargetDescription(target: HTMLElement | Document | Window): string {
  if (typeof document !== 'undefined' && target === document) {
    return 'document'
  }
  if (typeof window !== 'undefined' && target === window) {
    return 'window'
  }
  if (target instanceof HTMLElement) {
    const tag = target.tagName.toLowerCase()
    const id = target.id ? `#${target.id}` : ''
    const cls = target.className
      ? `.${target.className.split(' ').join('.')}`
      : ''
    return `${tag}${id}${cls}`
  }
  return 'element'
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

function getConflictItemStyle(
  behavior: ConflictBehavior,
  isSameTarget: boolean,
):
  | 'conflictItem'
  | 'conflictItemAllow'
  | 'conflictItemError'
  | 'conflictItemScope' {
  if (!isSameTarget) return 'conflictItemScope'
  if (behavior === 'allow') return 'conflictItemAllow'
  if (behavior === 'error') return 'conflictItemError'
  return 'conflictItem'
}

function getConflictLabel(
  behavior: ConflictBehavior,
  isSameTarget: boolean,
): string {
  if (!isSameTarget) return 'scope'
  if (behavior === 'allow') return 'allowed'
  if (behavior === 'error') return 'error'
  if (behavior === 'replace') return 'replaced'
  if (behavior === 'warn') return 'warning'
  return 'callback handled conflict with'
}

function serializeConflictBehavior(
  behavior: ConflictBehavior
): string {
  if (typeof behavior === 'string') {
    return behavior
  }

  return '[Function function]'
}

function HotkeyDetails(props: {
  registration: HotkeyRegistration
  state: ReturnType<typeof useHotkeysDevtoolsState>
  getTargetDescription: (t: HTMLElement | Document | Window) => string
  findTargetConflicts: (
    r: HotkeyRegistration,
    all: Array<HotkeyRegistration>,
  ) => Array<HotkeyRegistration>
  findScopeConflicts: (
    r: HotkeyRegistration,
    all: Array<HotkeyRegistration>,
  ) => Array<HotkeyRegistration>
  getConflictItemStyle: (
    b: ConflictBehavior,
    same: boolean,
  ) =>
    | 'conflictItem'
    | 'conflictItemAllow'
    | 'conflictItemError'
    | 'conflictItemScope'
  getConflictLabel: (b: ConflictBehavior, same: boolean) => string
  formatForDisplay: (hotkey: string) => string
  styles: ReturnType<typeof useStyles>
}) {
  const reg = () => props.registration
  const parsed = () => reg().parsedHotkey
  const targetConflicts = createMemo(() =>
    props.findTargetConflicts(reg(), props.state.registrations()),
  )
  const scopeConflicts = createMemo(() =>
    props.findScopeConflicts(reg(), props.state.registrations()),
  )
  const allConflicts = createMemo(() => [
    ...targetConflicts(),
    ...scopeConflicts(),
  ])
  const conflictBehavior = (): ConflictBehavior =>
    reg().options.conflictBehavior ?? 'warn'

  const keyParts = createMemo(() => {
    const parts: Array<string> = []
    const p = parsed()
    if (p.ctrl) parts.push('Ctrl')
    if (p.shift) parts.push('Shift')
    if (p.alt) parts.push('Alt')
    if (p.meta) parts.push('Meta')
    parts.push(p.key)
    return parts
  })

  const styles = props.styles

  return (
    <>
      <div class={styles().stateHeader}>
        <div class={styles().stateTitle}>
          {props.formatForDisplay(reg().hotkey)}
        </div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>ID</div>
          <div class={styles().infoValueMono}>{reg().id}</div>
          <div class={styles().infoLabel}>Raw</div>
          <div class={styles().infoValueMono}>{reg().hotkey}</div>
          <div class={styles().infoLabel}>Target</div>
          <div class={styles().infoValueMono}>
            {props.getTargetDescription(reg().target)}
          </div>
        </div>
      </div>

      <div class={styles().detailsGrid}>
        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Key Breakdown</div>
          <div class={styles().keyBreakdown}>
            <For each={keyParts()}>
              {(part, i) => (
                <>
                  <Show when={i() > 0}>
                    <span class={styles().keyBreakdownPlus}>+</span>
                  </Show>
                  <span class={styles().keyCapLarge}>{part}</span>
                </>
              )}
            </For>
          </div>
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Actions</div>
          <ActionButtons registration={reg()} />
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Options</div>
          <div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>enabled</span>
              <span
                class={
                  reg().options.enabled !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(reg().options.enabled !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>eventType</span>
              <span class={styles().optionValue}>
                {reg().options.eventType ?? 'keydown'}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>preventDefault</span>
              <span
                class={
                  reg().options.preventDefault
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!reg().options.preventDefault)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>stopPropagation</span>
              <span
                class={
                  reg().options.stopPropagation
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!reg().options.stopPropagation)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>ignoreInputs</span>
              <span
                class={
                  reg().options.ignoreInputs !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(reg().options.ignoreInputs !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>requireReset</span>
              <span
                class={
                  reg().options.requireReset
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!reg().options.requireReset)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>conflictBehavior</span>
              <span class={styles().optionValue}>{serializeConflictBehavior(conflictBehavior())}</span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>hasFired</span>
              <span
                class={
                  reg().hasFired
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(reg().hasFired)}
              </span>
            </div>
          </div>
        </div>

        <Show when={allConflicts().length > 0}>
          <div class={styles().detailSection}>
            <div class={styles().detailSectionHeader}>
              Conflicts ({allConflicts().length})
            </div>
            <div class={styles().conflictList}>
              <For each={targetConflicts()}>
                {(conflict) => {
                  const itemStyle = () =>
                    props.getConflictItemStyle(conflictBehavior(), true)
                  const label = () =>
                    props.getConflictLabel(conflictBehavior(), true)
                  return (
                    <div class={styles()[itemStyle()]}>
                      <span>{label()}</span> {conflict.id}:{' '}
                      {props.formatForDisplay(conflict.hotkey)} (
                      {conflict.options.eventType ?? 'keydown'}) on{' '}
                      {props.getTargetDescription(conflict.target)}
                    </div>
                  )
                }}
              </For>
              <For each={scopeConflicts()}>
                {(conflict) => (
                  <div class={styles().conflictItemScope}>
                    <span>scope</span> {conflict.id}:{' '}
                    {props.formatForDisplay(conflict.hotkey)} (
                    {conflict.options.eventType ?? 'keydown'}) on{' '}
                    {props.getTargetDescription(conflict.target)}
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </>
  )
}

function SequenceDetails(props: {
  registration: SequenceRegistrationView
  state: ReturnType<typeof useHotkeysDevtoolsState>
  getTargetDescription: (t: HTMLElement | Document | Window) => string
  findSequenceTargetConflicts: (
    r: SequenceRegistrationView,
    all: Array<SequenceRegistrationView>,
  ) => Array<SequenceRegistrationView>
  findSequenceScopeConflicts: (
    r: SequenceRegistrationView,
    all: Array<SequenceRegistrationView>,
  ) => Array<SequenceRegistrationView>
  getConflictItemStyle: (
    b: ConflictBehavior,
    same: boolean,
  ) =>
    | 'conflictItem'
    | 'conflictItemAllow'
    | 'conflictItemError'
    | 'conflictItemScope'
  getConflictLabel: (b: ConflictBehavior, same: boolean) => string
  formatHotkeySequence: (seq: HotkeySequence) => string
  formatForDisplay: (hotkey: string) => string
  styles: ReturnType<typeof useStyles>
}) {
  const reg = () => props.registration
  const targetConflicts = createMemo(() =>
    props.findSequenceTargetConflicts(
      reg(),
      props.state.sequenceRegistrations(),
    ),
  )
  const scopeConflicts = createMemo(() =>
    props.findSequenceScopeConflicts(
      reg(),
      props.state.sequenceRegistrations(),
    ),
  )
  const allConflicts = createMemo(() => [
    ...targetConflicts(),
    ...scopeConflicts(),
  ])
  const conflictBehavior = (): ConflictBehavior =>
    reg().options.conflictBehavior ?? 'warn'

  const styles = props.styles

  return (
    <>
      <div class={styles().stateHeader}>
        <div class={styles().stateTitle}>
          {props.formatHotkeySequence(reg().sequence)}
        </div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>ID</div>
          <div class={styles().infoValueMono}>{reg().id}</div>
          <div class={styles().infoLabel}>Sequence</div>
          <div class={styles().infoValueMono}>
            {props.formatHotkeySequence(reg().sequence)}
          </div>
          <div class={styles().infoLabel}>Target</div>
          <div class={styles().infoValueMono}>
            {props.getTargetDescription(reg().target)}
          </div>
        </div>
      </div>

      <div class={styles().detailsGrid}>
        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Key Breakdown</div>
          <div class={styles().keyBreakdown}>
            <For each={reg().sequence}>
              {(step, i) => (
                <>
                  <Show when={i() > 0}>
                    <span class={styles().keyBreakdownPlus}>→</span>
                  </Show>
                  <span class={styles().keyCapLarge}>
                    {props.formatForDisplay(step)}
                  </span>
                </>
              )}
            </For>
          </div>
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Actions</div>
          <ActionButtons registration={reg()} />
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Options</div>
          <div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>enabled</span>
              <span
                class={
                  reg().options.enabled !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(reg().options.enabled !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>eventType</span>
              <span class={styles().optionValue}>
                {reg().options.eventType ?? 'keydown'}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>timeout</span>
              <span class={styles().optionValue}>
                {reg().options.timeout ?? 1000}ms
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>preventDefault</span>
              <span
                class={
                  reg().options.preventDefault
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!reg().options.preventDefault)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>stopPropagation</span>
              <span
                class={
                  reg().options.stopPropagation
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!reg().options.stopPropagation)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>ignoreInputs</span>
              <span
                class={
                  reg().options.ignoreInputs !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(reg().options.ignoreInputs !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>conflictBehavior</span>
              <span class={styles().optionValue}>{serializeConflictBehavior(conflictBehavior())}</span>
            </div>
          </div>
        </div>

        <Show when={allConflicts().length > 0}>
          <div class={styles().detailSection}>
            <div class={styles().detailSectionHeader}>
              Conflicts ({allConflicts().length})
            </div>
            <div class={styles().conflictList}>
              <For each={targetConflicts()}>
                {(conflict) => {
                  const itemStyle = () =>
                    props.getConflictItemStyle(conflictBehavior(), true)
                  const label = () =>
                    props.getConflictLabel(conflictBehavior(), true)
                  return (
                    <div class={styles()[itemStyle()]}>
                      <span>{label()}</span> {conflict.id}:{' '}
                      {props.formatHotkeySequence(conflict.sequence)} (
                      {conflict.options.eventType ?? 'keydown'}) on{' '}
                      {props.getTargetDescription(conflict.target)}
                    </div>
                  )
                }}
              </For>
              <For each={scopeConflicts()}>
                {(conflict) => (
                  <div class={styles().conflictItemScope}>
                    <span>scope</span> {conflict.id}:{' '}
                    {props.formatHotkeySequence(conflict.sequence)} (
                    {conflict.options.eventType ?? 'keydown'}) on{' '}
                    {props.getTargetDescription(conflict.target)}
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </>
  )
}

export function DetailsPanel(props: DetailsPanelProps) {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()

  return (
    <div class={styles().stateDetails}>
      <Show
        when={props.selectedRegistration()}
        fallback={
          <div class={styles().noSelection}>
            Select a hotkey or sequence from the list to view its details
          </div>
        }
      >
        {(reg) => (
          <Show
            when={isSequenceRegistration(reg())}
            fallback={
              <HotkeyDetails
                registration={reg() as HotkeyRegistration}
                state={state}
                getTargetDescription={getTargetDescription}
                findTargetConflicts={findTargetConflicts}
                findScopeConflicts={findScopeConflicts}
                getConflictItemStyle={getConflictItemStyle}
                getConflictLabel={getConflictLabel}
                formatForDisplay={formatForDisplay}
                styles={styles}
              />
            }
          >
            <SequenceDetails
              registration={reg() as SequenceRegistrationView}
              state={state}
              getTargetDescription={getTargetDescription}
              findSequenceTargetConflicts={findSequenceTargetConflicts}
              findSequenceScopeConflicts={findSequenceScopeConflicts}
              getConflictItemStyle={getConflictItemStyle}
              getConflictLabel={getConflictLabel}
              formatHotkeySequence={formatHotkeySequence}
              formatForDisplay={formatForDisplay}
              styles={styles}
            />
          </Show>
        )}
      </Show>
    </div>
  )
}
