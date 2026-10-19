import { expect, test } from '../support/fixtures'

test.describe('chords', () => {
  test('Mod+S fires once and prevents the default action', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('save', 'Mod+S')
    await page.keyboard.press(`${hk.mod}+s`)
    const fired = await hk.fired()
    expect(fired).toHaveLength(1)
    expect(fired[0]).toMatchObject({ name: 'save', defaultPrevented: true })
  })

  test('preventDefault: false leaves the default action alone', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('save', 'Mod+S', { preventDefault: false })
    await page.keyboard.press(`${hk.mod}+s`)
    expect(await hk.fired()).toMatchObject([{ defaultPrevented: false }])
  })

  test('modifiers must match exactly', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('save', 'Mod+S')
    await hk.register('save-as', 'Mod+Shift+S')
    await page.keyboard.press(`${hk.mod}+Shift+s`)
    await page.keyboard.press('s')
    await page.keyboard.press(`Alt+${hk.mod}+s`)
    expect(await hk.firedNames()).toEqual(['save-as'])
  })

  test('letters match case-insensitively, with and without Shift', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('k', 'K')
    await hk.register('shift-k', 'Shift+K')
    await page.keyboard.press('k')
    await page.keyboard.press('Shift+K')
    expect(await hk.firedNames()).toEqual(['k', 'shift-k'])
  })

  test('symbols that need Shift match without writing Shift', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('help', '?')
    await page.keyboard.press('Shift+Slash')
    expect(await hk.firedNames()).toEqual(['help'])
  })

  test('physical bindings match the key position', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('physical', '[KeyS]')
    await hk.register('numpad', '[NumpadAdd]')
    await page.keyboard.press('KeyS')
    await page.keyboard.press('NumpadAdd')
    await page.keyboard.press('Equal')
    expect(await hk.firedNames()).toEqual(['physical', 'numpad'])
  })

  test('only the most exact match fires', async ({ page, harness }) => {
    const hk = await harness()
    // `+` matches numpad plus without Shift; the physical binding is exact.
    await hk.register('plus', '+')
    await hk.register('numpad', '[NumpadAdd]')
    await page.keyboard.press('NumpadAdd')
    await hk.call('unregister', 'numpad')
    await page.keyboard.press('NumpadAdd')
    await page.keyboard.press('Shift+Equal')
    expect(await hk.firedNames()).toEqual(['numpad', 'plus', 'plus'])
  })

  test('named keys and their aliases', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('escape', 'Escape')
    await hk.register('enter', 'Enter')
    await hk.register('up', 'ArrowUp')
    await hk.register('space', 'Space')
    await hk.register('f2', 'F2')
    for (const key of ['Escape', 'Enter', 'ArrowUp', 'Space', 'F2']) {
      await page.keyboard.press(key)
    }
    expect(await hk.firedNames()).toEqual([
      'escape',
      'enter',
      'up',
      'space',
      'f2',
    ])
  })

  test('keyup registrations fire on release', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('down', 'K')
    await hk.register('up', 'K', { eventType: 'keyup' })
    await page.keyboard.down('k')
    expect(await hk.firedNames()).toEqual(['down'])
    await page.keyboard.up('k')
    expect(await hk.fired()).toMatchObject([
      { name: 'down', type: 'keydown' },
      { name: 'up', type: 'keyup' },
    ])
  })

  test('requireReset fires once per hold, auto-repeat included', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('once', 'K', { requireReset: true })
    await hk.register('every', 'J')
    // Pressing a held key again sends a repeat keydown.
    await page.keyboard.down('k')
    await page.keyboard.down('k')
    await page.keyboard.down('k')
    await page.keyboard.up('k')
    await page.keyboard.down('k')
    await page.keyboard.up('k')
    await page.keyboard.down('j')
    await page.keyboard.down('j')
    await page.keyboard.up('j')
    expect(await hk.firedNames()).toEqual(['once', 'once', 'every', 'every'])
  })

  test('disabled and unregistered hotkeys do not fire', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('a', 'A')
    await hk.register('b', 'B')
    await hk.call('setOptions', 'a', { enabled: false })
    await hk.call('unregister', 'b')
    await page.keyboard.press('a')
    await page.keyboard.press('b')
    await hk.call('setOptions', 'a', { enabled: true })
    await page.keyboard.press('a')
    expect(await hk.firedNames()).toEqual(['a'])
  })
})
