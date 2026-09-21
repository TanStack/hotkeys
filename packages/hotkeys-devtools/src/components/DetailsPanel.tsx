import { For, Show, createMemo } from 'solid-js'
import clsx from 'clsx'
import {
  detectPlatform,
  formatForDisplay,
  normalizeHotkeyFromParsed,
  parseHotkey,
} from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { effectiveSequenceMatchedSteps } from '../sequence-progress'
import {
  formatRegistration,
  getBindingKind,
  useRegistrationConflicts,
} from '../_registrations'
import { ActionButtons } from './ActionButtons'
import type {
  ConflictBehavior,
  HotkeyRegistration,
  ParsedHotkey,
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

function HotkeyDetails(props: {
  registration: HotkeyRegistration
  getTargetDescription: (t: HTMLElement | Document | Window) => string
  styles: ReturnType<typeof useStyles>
}) {
  const reg = () => props.registration
  const parsed = () => reg().parsedHotkey
  const conflicts = useRegistrationConflicts(reg)
  const targetConflicts = () => conflicts().overlapping
  const scopeConflicts = () => conflicts().separate
  const allConflicts = () => [...targetConflicts(), ...scopeConflicts()]
  const conflictBehavior = (): ConflictBehavior =>
    reg().options.conflictBehavior ?? 'warn'

  const registrationPlatform = () => reg().options.platform ?? detectPlatform()

  const keyParts = createMemo(() =>
    formatForDisplay(parsed(), {
      platform: registrationPlatform(),
      parts: true,
    }),
  )

  const styles = props.styles

  return (
    <>
      <div class={styles().stateHeader}>
        <div class={styles().stateTitle}>{formatRegistration(reg())}</div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>ID</div>
          <div class={styles().infoValueMono}>{reg().id}</div>
          <div class={styles().infoLabel}>Matches</div>
          <div class={styles().infoValueMono}>{getBindingKind(reg())}</div>
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
          <div class={styles().detailSectionHeader}>Meta</div>
          <div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>name</span>
              <span class={styles().optionValue}>
                {reg().options.meta?.name ?? '—'}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>description</span>
              <span class={styles().optionValue}>
                {reg().options.meta?.description ?? '—'}
              </span>
            </div>
            <Show
              when={
                reg().options.meta &&
                Object.keys(reg().options.meta!).filter(
                  (k) => k !== 'name' && k !== 'description',
                ).length > 0
              }
            >
              <For
                each={Object.entries(reg().options.meta ?? {}).filter(
                  ([k]) => k !== 'name' && k !== 'description',
                )}
              >
                {([key, value]) => (
                  <div class={styles().optionRow}>
                    <span class={styles().optionLabel}>{key}</span>
                    <span class={styles().optionValue}>{String(value)}</span>
                  </div>
                )}
              </For>
            </Show>
          </div>
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
                  return (
                    <div class={styles().conflictItem}>
                      <span>overlap</span> {conflict.id}:{' '}
                      {formatRegistration(conflict)} (
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
                    {formatRegistration(conflict)} (
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
  const conflicts = useRegistrationConflicts(liveReg)
  const targetConflicts = () => conflicts().overlapping
  const scopeConflicts = () => conflicts().separate
  const allConflicts = () => [...targetConflicts(), ...scopeConflicts()]
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
                  {formatForDisplay(step, {
                    platform: sequenceCanonicalPlatform(),
                  })}
                </span>
              </span>
            )}
          </For>
        </div>
        <div class={styles().infoGrid}>
          <div class={styles().infoLabel}>ID</div>
          <div class={styles().infoValueMono}>{liveReg().id}</div>
          <div class={styles().infoLabel}>Matches</div>
          <div class={styles().infoValueMono}>{getBindingKind(liveReg())}</div>
          <div class={styles().infoLabel}>Raw</div>
          <div class={styles().infoValueMono}>
            {liveReg().sequence.join(' → ')}
          </div>
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
                    {formatForDisplay(step, {
                      platform: sequenceCanonicalPlatform(),
                    })}
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
                    {formatForDisplay(step, {
                      platform: sequenceCanonicalPlatform(),
                    })}
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
              const stepParts = () =>
                formatForDisplay(stepParsed(), {
                  platform: sequenceCanonicalPlatform(),
                  parts: true,
                })
              return (
                <div class={styles().sequenceChordDetail}>
                  <div class={styles().keyBreakdownSubHeader}>
                    Step {stepIdx() + 1} —{' '}
                    {stepParsed().code !== undefined ? 'Code' : 'Key'}
                  </div>
                  <div class={styles().keyBreakdownSplitRow}>
                    <div class={styles().keyBreakdownSplitLeft}>
                      <div class={styles().keyBreakdown}>
                        <For each={stepParts()}>
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
          <div class={styles().detailSectionHeader}>Meta</div>
          <div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>name</span>
              <span class={styles().optionValue}>
                {liveReg().options.meta?.name ?? '—'}
              </span>
            </div>
            <div class={styles().optionRow}>
              <span class={styles().optionLabel}>description</span>
              <span class={styles().optionValue}>
                {liveReg().options.meta?.description ?? '—'}
              </span>
            </div>
            <Show
              when={
                liveReg().options.meta &&
                Object.keys(liveReg().options.meta!).filter(
                  (k) => k !== 'name' && k !== 'description',
                ).length > 0
              }
            >
              <For
                each={Object.entries(liveReg().options.meta ?? {}).filter(
                  ([k]) => k !== 'name' && k !== 'description',
                )}
              >
                {([key, value]) => (
                  <div class={styles().optionRow}>
                    <span class={styles().optionLabel}>{key}</span>
                    <span class={styles().optionValue}>{String(value)}</span>
                  </div>
                )}
              </For>
            </Show>
          </div>
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
                  return (
                    <div class={styles().conflictItem}>
                      <span>overlap</span> {conflict.id}:{' '}
                      {formatRegistration(conflict)} (
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
                    {formatRegistration(conflict)} (
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
                getTargetDescription={getTargetDescription}
                styles={styles}
              />
            }
          >
            <SequenceDetails
              registration={reg() as SequenceRegistrationView}
              state={state}
              getTargetDescription={getTargetDescription}
              styles={styles}
            />
          </Show>
        )}
      </Show>
    </div>
  )
}
