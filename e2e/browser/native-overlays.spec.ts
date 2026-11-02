import { expect, test } from '../support/fixtures'

const DIALOG = '<dialog id="dialog"><button id="ok">OK</button></dialog>'
const POPOVERS =
  '<button id="outside">Outside</button><div id="auto" popover>Auto</div><div id="manual" popover="manual">Manual</div>'

test.describe('native overlays', () => {
  test('a modal dialog closes on Escape instead of running a global hotkey', async ({
    page,
    harness,
  }) => {
    const hk = await harness(DIALOG)
    await hk.register('escape', 'Escape')
    await page.evaluate(() =>
      (document.getElementById('dialog') as HTMLDialogElement).showModal(),
    )
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(
        () => (document.getElementById('dialog') as HTMLDialogElement).open,
      ),
    ).toBe(false)
    expect(await hk.firedNames()).toEqual([])
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['escape'])
  })

  test('a hotkey on the dialog still receives Escape', async ({
    page,
    harness,
  }) => {
    const hk = await harness(DIALOG)
    await page.evaluate(() =>
      (document.getElementById('dialog') as HTMLDialogElement).showModal(),
    )
    await hk.register('dialog', 'Escape', { target: '#dialog' })
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['dialog'])
    expect(
      await page.evaluate(
        () => (document.getElementById('dialog') as HTMLDialogElement).open,
      ),
    ).toBe(true)
  })

  test('a keyup Escape hotkey skips the release of the Escape that closed the dialog', async ({
    page,
    harness,
  }) => {
    const hk = await harness(DIALOG)
    await hk.register('up', 'Escape', { eventType: 'keyup' })
    await page.evaluate(() =>
      (document.getElementById('dialog') as HTMLDialogElement).showModal(),
    )
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual([])
  })

  test('an open popover closes on Escape instead of running a global hotkey', async ({
    page,
    harness,
  }) => {
    const hk = await harness(POPOVERS)
    await hk.register('escape', 'Escape')
    await page.evaluate(() => document.getElementById('auto')!.showPopover())
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(() =>
        document.getElementById('auto')!.matches(':popover-open'),
      ),
    ).toBe(false)
    expect(await hk.firedNames()).toEqual([])
  })

  test('a manual popover leaves Escape to the hotkey', async ({
    page,
    harness,
  }) => {
    const hk = await harness(POPOVERS)
    await hk.register('escape', 'Escape')
    await page.evaluate(() => document.getElementById('manual')!.showPopover())
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['escape'])
  })
})
