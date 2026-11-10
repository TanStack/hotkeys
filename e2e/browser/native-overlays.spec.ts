import { expect, test } from '../support/fixtures'

const DIALOG = '<dialog id="dialog"><button id="ok">OK</button></dialog>'
const STACKED =
  '<dialog id="lower"><button>Lower</button></dialog><dialog id="upper"><button>Upper</button></dialog>'
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

  test('a hotkey on the top modal dialog receives Escape while a lower one is open', async ({
    page,
    harness,
  }) => {
    const hk = await harness(STACKED)
    await page.evaluate(() => {
      ;(document.getElementById('lower') as HTMLDialogElement).showModal()
      ;(document.getElementById('upper') as HTMLDialogElement).showModal()
    })
    await hk.register('upper', 'Escape', { target: '#upper' })
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['upper'])
    expect(
      await page.evaluate(() =>
        ['lower', 'upper'].map(
          (id) => (document.getElementById(id) as HTMLDialogElement).open,
        ),
      ),
    ).toEqual([true, true])
  })

  test('a hotkey on a lower modal dialog leaves Escape to the dialog above it', async ({
    page,
    harness,
  }) => {
    const hk = await harness(STACKED)
    await page.evaluate(() => {
      ;(document.getElementById('lower') as HTMLDialogElement).showModal()
      ;(document.getElementById('upper') as HTMLDialogElement).showModal()
    })
    await hk.register('lower', 'Escape', { target: '#lower' })
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual([])
    expect(
      await page.evaluate(
        () => (document.getElementById('upper') as HTMLDialogElement).open,
      ),
    ).toBe(false)
    // Focus returns to the lower dialog, which is now on top
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['lower'])
  })

  test('a global hotkey leaves Escape to stacked modal dialogs', async ({
    page,
    harness,
  }) => {
    const hk = await harness(STACKED)
    await hk.register('escape', 'Escape')
    await page.evaluate(() => {
      ;(document.getElementById('lower') as HTMLDialogElement).showModal()
      ;(document.getElementById('upper') as HTMLDialogElement).showModal()
    })
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual([])
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['escape'])
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

  // Component libraries such as Material Web keep their `<dialog>` in a shadow
  // root, where a document search doesn't find it.
  test('a modal dialog in a shadow root closes on Escape instead of running a global hotkey', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<div id="host"></div>')
    await hk.register('escape', 'Escape')
    await page.evaluate(() => {
      const root = document
        .getElementById('host')!
        .attachShadow({ mode: 'open' })
      root.innerHTML = '<dialog><button>OK</button></dialog>'
      root.querySelector('dialog')!.showModal()
    })
    const open = () =>
      page.evaluate(
        () =>
          document.getElementById('host')!.shadowRoot!.querySelector('dialog')!
            .open,
      )
    await page.keyboard.press('Escape')
    expect(await open()).toBe(false)
    expect(await hk.firedNames()).toEqual([])
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['escape'])
  })

  test('a shadow root dialog with slotted content closes on Escape', async ({
    page,
    harness,
  }) => {
    const hk = await harness(
      '<div id="host"><button id="slotted">OK</button></div>',
    )
    await hk.register('escape', 'Escape')
    await page.evaluate(() => {
      const root = document
        .getElementById('host')!
        .attachShadow({ mode: 'open' })
      root.innerHTML = '<dialog><slot></slot></dialog>'
      root.querySelector('dialog')!.showModal()
      document.getElementById('slotted')!.focus()
    })
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(
        () =>
          document.getElementById('host')!.shadowRoot!.querySelector('dialog')!
            .open,
      ),
    ).toBe(false)
    expect(await hk.firedNames()).toEqual([])
  })

  // The host is outside the dialog, like an element around a dialog in the
  // document.
  test('a hotkey on the host of a shadow root dialog leaves Escape to the dialog', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<div id="host"></div>')
    await page.evaluate(() => {
      const root = document
        .getElementById('host')!
        .attachShadow({ mode: 'open' })
      root.innerHTML =
        '<button id="inside">Inside</button><dialog><button>OK</button></dialog>'
      root.querySelector('dialog')!.showModal()
    })
    await hk.register('host', 'Escape', { target: '#host' })
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(
        () =>
          document.getElementById('host')!.shadowRoot!.querySelector('dialog')!
            .open,
      ),
    ).toBe(false)
    expect(await hk.firedNames()).toEqual([])
    // With the dialog closed, the host's hotkey gets Escape from inside it.
    await page.evaluate(() =>
      document
        .getElementById('host')!
        .shadowRoot!.querySelector<HTMLElement>('#inside')!
        .focus(),
    )
    await page.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['host'])
  })

  test('an open popover in a shadow root closes on Escape while focus is inside it', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<div id="host"></div>')
    await hk.register('escape', 'Escape')
    await page.evaluate(() => {
      const root = document
        .getElementById('host')!
        .attachShadow({ mode: 'open' })
      root.innerHTML = '<div popover><button>Item</button></div>'
      root.querySelector<HTMLElement>('[popover]')!.showPopover()
      root.querySelector('button')!.focus()
    })
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(() =>
        document
          .getElementById('host')!
          .shadowRoot!.querySelector('[popover]')!
          .matches(':popover-open'),
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
