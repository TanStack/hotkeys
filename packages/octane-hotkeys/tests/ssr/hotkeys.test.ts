import { renderToString } from 'octane/server'
import { describe, expect, it } from 'vitest'
import { getHotkeyManager, getSequenceManager } from '@tanstack/hotkeys'
import { Fixture } from '../fixture.tsrx'

describe('server rendering', () => {
  it('renders initial state without registering shortcuts or touching the DOM', () => {
    expect(globalThis.document).toBeUndefined()
    const { html } = renderToString(Fixture, undefined)
    expect(html).toContain('Change binding')
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    expect(getSequenceManager().registrations.state.size).toBe(0)
  })
})
