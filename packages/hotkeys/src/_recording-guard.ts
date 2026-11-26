import { MODIFIER_KEYS, normalizeKeyName } from './constants'

// Shared only by recorders and dispatchers. Does not own bindings or preferences.
// One recorder records at a time; dispatch resumes after it ends.
type Session = { cancel: () => void; stop: () => void }
const sessions = new Set<Session>()
// Remember consumed event objects through the remainder of their DOM dispatch.
const captured = new WeakSet<KeyboardEvent>()
// Captured physical identities stay blocked through repeats and their eventual keyup.
const pending = new Map<string, string>()
// Keys whose keydown the recorder stopped, so the page doesn't see their keyup either.
const stopped = new Set<string>()
let listening = false
// The manager's handler for a recording that starts, set by the manager.
let recordingStarted: (() => void) | undefined
/** Sets what runs when a recording starts, such as resetting sequences in progress. */
export function onRecordingStart(handler: () => void): void {
  recordingStarted = handler
}
// Prefer the stable physical identity when modifier release changes event.key.
const identity = (event: KeyboardEvent) => event.code || `key:${event.key}`

/** Consumes recorded key releases and removes guards for completed chords. */
function release(event: KeyboardEvent): void {
  const id = identity(event)
  if (pending.delete(id)) captured.add(event)
  if (stopped.delete(id)) event.stopPropagation()
  // A key whose keyup never comes, such as one macOS swallows while Command
  // is held, must not block hotkeys, so releasing a modifier ends the chord.
  // Its keyup stays hidden in case it still comes. A new press of the key
  // or blur ends that.
  if (MODIFIER_KEYS.has(normalizeKeyName(event.key))) {
    for (const [id, key] of pending) {
      if (!MODIFIER_KEYS.has(key)) pending.delete(id)
    }
  }
  cleanup()
}
/** Hides the repeats of a stopped press, which go on after a recording commits. */
function repeat(event: KeyboardEvent): void {
  const id = identity(event)
  if (!event.repeat) {
    // A new press of the key, so the old one's keyup isn't coming
    stopped.delete(id)
  } else if (stopped.has(id)) {
    // A held arrow key would still scroll the page
    event.preventDefault()
    event.stopPropagation()
  }
}
/** Clears pending releases when focus loss prevents the browser from delivering them. */
function blur(): void {
  pending.clear()
  stopped.clear()
  cleanup()
}
/** Detaches shared listeners once neither active sessions nor pending releases need them. */
function cleanup(): void {
  if (
    listening &&
    sessions.size === 0 &&
    pending.size === 0 &&
    stopped.size === 0
  ) {
    window.removeEventListener('keyup', release, true)
    window.removeEventListener('keydown', repeat, true)
    window.removeEventListener('blur', blur)
    listening = false
  }
}
/**
 * Pauses application shortcut dispatch and starts tracking releases for this
 * recorder. Starting one cancels any other, so one key press can't be
 * recorded for two shortcuts.
 */
export function beginRecording(owner: Session): void {
  for (const other of [...sessions]) other.cancel()
  // An onCancel that started its recorder again loses to this one, without
  // its callbacks running again.
  for (const other of [...sessions]) other.stop()
  sessions.add(owner)
  recordingStarted?.()
  if (!listening && typeof document !== 'undefined') {
    // Window capture, like the recorder's keydown listener
    window.addEventListener('keyup', release, true)
    window.addEventListener('keydown', repeat, true)
    window.addEventListener('blur', blur)
    listening = true
  }
}
/** Ends a session while retaining guards for keys still held after commit or cancellation. */
export function endRecording(owner: Session): void {
  sessions.delete(owner)
  cleanup()
}
/** Marks a consumed keydown and guards subsequent repeats and its release. */
export function captureRecordingEvent(event: KeyboardEvent): void {
  captured.add(event)
  // Autofill sends a keydown that names no key and has no keyup.
  if (event.key || event.code) {
    pending.set(identity(event), normalizeKeyName(event.key))
  }
}

/** Marks a captured keydown the recorder stopped, so its keyup is stopped too. */
export function stopRecordingRelease(event: KeyboardEvent): void {
  if (event.key || event.code) stopped.add(identity(event))
}
/** Whether managers should suppress callbacks for this recording session or captured chord. */
export function isRecordingEvent(event: KeyboardEvent): boolean {
  const id = identity(event)
  return (
    sessions.size > 0 ||
    captured.has(event) ||
    pending.has(id) ||
    // Repeats of a recorded press still held after a modifier released
    (!!event.repeat && stopped.has(id))
  )
}
