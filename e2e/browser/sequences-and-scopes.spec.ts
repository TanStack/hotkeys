import { expect, test } from '../support/fixtures'

test.describe('sequences', () => {
  test('fires when every step comes within the timeout', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('top', ['G', 'G'], { timeout: 500 })
    await page.keyboard.press('g')
    await page.keyboard.press('g')
    expect(await hk.firedNames()).toEqual(['top'])
  })

  test('does not fire when a step is too late', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('top', ['G', 'G'], { timeout: 200 })
    await page.keyboard.press('g')
    await page.waitForTimeout(400)
    await page.keyboard.press('g')
    expect(await hk.firedNames()).toEqual([])
    await page.keyboard.press('g')
    expect(await hk.firedNames()).toEqual(['top'])
  })

  test('modifier chords chain, and lone modifiers do not reset', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('palette', ['Mod+K', 'C'])
    await hk.register('shifted', ['Shift+R', 'Shift+T'])
    await page.keyboard.press(`${hk.mod}+k`)
    await page.keyboard.press('Shift')
    await page.keyboard.press('c')
    await page.keyboard.down('Shift')
    await page.keyboard.press('R')
    await page.keyboard.press('T')
    await page.keyboard.up('Shift')
    expect(await hk.firedNames()).toEqual(['palette', 'shifted'])
  })

  test('a wrong step resets progress', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('gh', ['G', 'H'])
    await page.keyboard.press('g')
    await page.keyboard.press('x')
    await page.keyboard.press('h')
    expect(await hk.firedNames()).toEqual([])
  })

  test('sequences are ignored while typing in an input', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<input id="text">')
    await hk.register('top', ['G', 'G'])
    await page.focus('#text')
    await page.keyboard.type('gg')
    expect(await hk.firedNames()).toEqual([])
    await expect(page.locator('#text')).toHaveValue('gg')
  })
})

test.describe('scopes', () => {
  test('scoped hotkeys fire only while their scope is active', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('editor-k', 'K', { scope: 'editor' })
    await page.keyboard.press('k')
    await hk.call('activateScope', 'editor')
    await page.keyboard.press('k')
    await hk.call('releaseScope', 'editor')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['editor-k'])
  })

  test('the most recently activated scope handles a shared key', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('global-escape', 'Escape')
    await hk.register('dialog-escape', 'Escape', { scope: 'dialog' })
    await page.keyboard.press('Escape')
    await hk.call('activateScope', 'dialog')
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['global-escape', 'dialog-escape'])
  })

  test('an exclusive scope suspends global hotkeys unless allowed', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('global-k', 'K')
    await hk.register('modal-j', 'J', { scope: 'modal' })
    await hk.call('activateScope', 'modal', { exclusive: true })
    await page.keyboard.press('k')
    await page.keyboard.press('j')
    await hk.call('releaseScope', 'modal')
    await hk.call('activateScope', 'modal', {
      exclusive: { allow: ['global'] },
    })
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['modal-j', 'global-k'])
  })
})
