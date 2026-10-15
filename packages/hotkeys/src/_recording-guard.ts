import { MODIFIER_KEYS, normalizeKeyName } from './constants'

// Shared only by recorders and dispatchers. Does not own bindings or preferences.
// Multiple recorder instances may be active; dispatch resumes after the last one ends.
const sessions = new Set<object>()
// Remember consumed event objects through the remainder of their DOM dispatch.
const captured = new WeakSet<KeyboardEvent>()
// Captured physical identities stay blocked through repeats and their eventual keyup.
const pending = new Map<string, string>()
let listening = false
// Prefer the stable physical identity when modifier release changes event.key.
const identity = (event: KeyboardEvent) => event.code || `key:${event.key}`

/** Consumes recorded key releases and removes guards for completed chords. */
function release(event: KeyboardEvent): void {
  if (pending.delete(identity(event))) captured.add(event)
  // macOS can swallow the main key's keyup while Command is held.
  // Releasing a modifier ends that chord, as in KeyStateTracker.
  if (MODIFIER_KEYS.has(normalizeKeyName(event.key))) {
    for (const [id, key] of pending) {
      if (!MODIFIER_KEYS.has(key)) pending.delete(id)
    }
  }
  cleanup()
}
/** Clears pending releases when focus loss prevents the browser from delivering them. */
function blur(): void {
  pending.clear()
  cleanup()
}
/** Detaches shared listeners once neither active sessions nor pending releases need them. */
function cleanup(): void {
  if (listening && sessions.size === 0 && pending.size === 0) {
    document.removeEventListener('keyup', release, true)
    window.removeEventListener('blur', blur)
    listening = false
  }
}
/** Pauses application shortcut dispatch and starts tracking releases for this recorder. */
export function beginRecording(owner: object): void {
  sessions.add(owner)
  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('keyup', release, true)
    window.addEventListener('blur', blur)
    listening = true
  }
}
/** Ends a session while retaining guards for keys still held after commit or cancellation. */
export function endRecording(owner: object): void {
  sessions.delete(owner)
  cleanup()
}
/** Marks a consumed keydown and guards subsequent repeats and its release. */
export function captureRecordingEvent(event: KeyboardEvent): void {
  captured.add(event)
  pending.set(identity(event), normalizeKeyName(event.key))
}
/** Whether managers should suppress callbacks for this recording session or captured chord. */
export function isRecordingEvent(event: KeyboardEvent): boolean {
  return (
    sessions.size > 0 || captured.has(event) || pending.has(identity(event))
  )
}
