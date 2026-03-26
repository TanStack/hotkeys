import { For, Show, createMemo } from 'solid-js'
import clsx from 'clsx'
import {
  detectPlatform,
  formatForDisplay,
  formatHotkeySequence,
  normalizeHotkey,
  normalizeHotkeyFromParsed,
  parseHotkey,
} from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { effectiveSequenceMatchedSteps } from '../sequence-progress'
import { ActionButtons } from './ActionButtons'
import type {
  ConflictBehavior,
  FormatDisplayOptions,
  HotkeyRegistration,
  HotkeySequence,
  ParsedHotkey,
  RegisterableHotkey,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

const PLATFORM_ROWS = [
  { id: 'mac' as const, label: 'macOS' },
  { id: 'windows' as const, label: 'Windows' },
  { id: 'linux' as const, label: 'Linux' },
]

function KeyBreakdownPlatformTable(props: {
  getParsed: () => ParsedHotkey
  /** Platform used when the parsed hotkey was produced (registration `options.platform`). */
  getCanonicalPlatform: () => 'mac' | 'windows' | 'linux'
  styles: ReturnType<typeof useStyles>
}) {
  const st = () => props.styles()
  return (
    <div class={st().platformBreakdown}>
      <For each={PLATFORM_ROWS}>
        {(row) => (
          <div class={st().platformBreakdownRow}>
            <span class={st().platformBreakdownLabel}>{row.label}</span>
            <span class={st().platformBreakdownPretty}>
              {formatForDisplay(
                normalizeHotkeyFromParsed(
                  props.getParsed(),
                  props.getCanonicalPlatform(),
                ),
                {
                  platform: row.id,
                },
              )}
            </span>
          </div>
        )}
      </For>
    </div>
  )
}

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
  return 'warning'
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
  formatForDisplay: (
    hotkey: RegisterableHotkey,
    options?: FormatDisplayOptions,
  ) => string
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

  const registrationPlatform = () => reg().options.platform ?? detectPlatform()

  const rawModParts = createMemo(() =>
    normalizeHotkeyFromParsed(parsed(), registrationPlatform()).split('+'),
  )

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
          <div class={styles().keyBreakdownSplitRow}>
            <div class={styles().keyBreakdownSplitLeft}>
              <div class={styles().keyBreakdown}>
                <For each={rawModParts()}>
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
            <span class={styles().keyBreakdownSplitArrow} aria-hidden="true">
              {'->'}
            </span>
            <div class={styles().keyBreakdownSplitRight}>
              <KeyBreakdownPlatformTable
                getParsed={() => parsed()}
                getCanonicalPlatform={registrationPlatform}
                styles={props.styles}
              />
            </div>
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
              <span class={styles().optionValue}>{conflictBehavior()}</span>
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
  formatForDisplay: (
    hotkey: RegisterableHotkey,
    options?: FormatDisplayOptions,
  ) => string
  styles: ReturnType<typeof useStyles>
}) {
  const reg = () => props.registration
  const liveReg = createMemo(
    () =>
      props.state.sequenceRegistrations().find((r) => r.id === reg().id) ??
      reg(),
  )
  const matchedSteps = createMemo(() =>
    effectiveSequenceMatchedSteps(liveReg(), props.state.sequenceProgressNow()),
  )
  const targetConflicts = createMemo(() =>
    props.findSequenceTargetConflicts(
      liveReg(),
      props.state.sequenceRegistrations(),
    ),
  )
  const scopeConflicts = createMemo(() =>
    props.findSequenceScopeConflicts(
      liveReg(),
      props.state.sequenceRegistrations(),
    ),
  )
  const allConflicts = createMemo(() => [
    ...targetConflicts(),
    ...scopeConflicts(),
  ])
  const conflictBehavior = (): ConflictBehavior =>
    liveReg().options.conflictBehavior ?? 'warn'

  const sequenceCanonicalPlatform = createMemo(
    () => liveReg().options.platform ?? detectPlatform(),
  )

  const styles = props.styles

  return (
    <>
      <div class={styles().stateHeader}>
        <div class={styles().stateTitle}>
          <For each={liveReg().sequence}>
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
                  {props.formatForDisplay(step)}
                </span>
              </span>
            )}
          </For>
        </div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>ID</div>
          <div class={styles().infoValueMono}>{liveReg().id}</div>
          <div class={styles().infoLabel}>Sequence</div>
          <div class={styles().infoValueMono}>
            <For each={liveReg().sequence}>
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
                    {props.formatForDisplay(step)}
                  </span>
                </span>
              )}
            </For>
          </div>
          <div class={styles().infoLabel}>Target</div>
          <div class={styles().infoValueMono}>
            {props.getTargetDescription(liveReg().target)}
          </div>
        </div>
      </div>

      <div class={styles().detailsGrid}>
        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Key Breakdown</div>
          <div class={styles().keyBreakdown}>
            <For each={liveReg().sequence}>
              {(step, i) => (
                <>
                  <Show when={i() > 0}>
                    <span class={styles().keyBreakdownPlus}>→</span>
                  </Show>
                  <span
                    class={clsx(
                      styles().keyCapLarge,
                      i() < matchedSteps() && styles().keyCapLargeInProgress,
                    )}
                  >
                    {props.formatForDisplay(step)}
                  </span>
                </>
              )}
            </For>
          </div>

          <div class={styles().keyBreakdownSubHeader}>Each chord</div>
          <For each={liveReg().sequence}>
            {(step, stepIdx) => {
              const stepParsed = () =>
                parseHotkey(step, sequenceCanonicalPlatform())
              const stepRawParts = () =>
                normalizeHotkey(step, sequenceCanonicalPlatform()).split('+')
              return (
                <div class={styles().sequenceChordDetail}>
                  <div class={styles().keyBreakdownSubHeader}>
                    Step {stepIdx() + 1}
                  </div>
                  <div class={styles().keyBreakdownSplitRow}>
                    <div class={styles().keyBreakdownSplitLeft}>
                      <div class={styles().keyBreakdown}>
                        <For each={stepRawParts()}>
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
                    <span
                      class={styles().keyBreakdownSplitArrow}
                      aria-hidden="true"
                    >
                      {'->'}
                    </span>
                    <div class={styles().keyBreakdownSplitRight}>
                      <KeyBreakdownPlatformTable
                        getParsed={stepParsed}
                        getCanonicalPlatform={() => sequenceCanonicalPlatform()}
                        styles={props.styles}
                      />
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Actions</div>
          <ActionButtons registration={liveReg()} />
        </div>

        <div class={styles().detailSection}>
          <div class={styles().detailSectionHeader}>Options</div>
          <div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>enabled</span>
              <span
                class={
                  liveReg().options.enabled !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(liveReg().options.enabled !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>eventType</span>
              <span class={styles().optionValue}>
                {liveReg().options.eventType ?? 'keydown'}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>timeout</span>
              <span class={styles().optionValue}>
                {liveReg().options.timeout ?? 1000}ms
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>preventDefault</span>
              <span
                class={
                  liveReg().options.preventDefault
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!liveReg().options.preventDefault)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>stopPropagation</span>
              <span
                class={
                  liveReg().options.stopPropagation
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(!!liveReg().options.stopPropagation)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>ignoreInputs</span>
              <span
                class={
                  liveReg().options.ignoreInputs !== false
                    ? styles().optionValueTrue
                    : styles().optionValueFalse
                }
              >
                {String(liveReg().options.ignoreInputs !== false)}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>conflictBehavior</span>
              <span class={styles().optionValue}>{conflictBehavior()}</span>
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
