// Preload for the bench files: a happy-dom window on `globalThis`, loaded
// before counting starts, so the DOM's own work is not counted.
import { Window } from 'happy-dom'

// Count the code as a production build ships it, without dev warnings.
process.env.NODE_ENV = 'production'

const window = new Window({ url: 'http://localhost/' })

for (const name of [
  'window',
  'document',
  'navigator',
  'Node',
  'Element',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLTextAreaElement',
  'Event',
  'KeyboardEvent',
  'FocusEvent',
  'EventTarget',
] as const) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value: name === 'window' ? window : window[name],
  })
}
