import { renderToString } from 'solid-js/web'
import { describe, expect, it } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { createFormatForDisplay } from '../src/createFormatForDisplay'

function Label() {
  const format = createFormatForDisplay()
  return <kbd>{format('Mod+S')}</kbd>
}

const render = (platform: 'mac' | 'windows') =>
  renderToString(() => (
    <HotkeysProvider defaultOptions={{ platform }}>
      <Label />
    </HotkeysProvider>
  ))

describe('createFormatForDisplay on the server', () => {
  it('runs without a document', () => {
    expect(typeof document).toBe('undefined')
  })

  it("renders labels for the provider's platform", () => {
    expect(render('mac')).toContain('>⌘ S</kbd>')
    expect(render('windows')).toContain('>Ctrl+S</kbd>')
  })
})
