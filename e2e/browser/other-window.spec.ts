import { expect, test } from '../support/fixtures'

// A same-origin iframe stands in for a second window, such as a Document
// Picture-in-Picture window: key presses go to the frame that has focus.

const PAGE = `
  <div id="panel" tabindex="0"><span id="child" tabindex="0">child</span></div>
  <iframe id="frame"></iframe>
`

test('an element hotkey keeps firing after its element moves into another window', async ({
  page,
  harness,
}) => {
  const hk = await harness(PAGE)
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const panel = document.getElementById('panel')!
    window.TanStackHotkeys.getHotkeyManager().register(
      'K',
      () => log('hotkey'),
      {
        target: panel,
        afterDelegatedHandlers: true,
      },
    )
    const frame = document.querySelector('iframe')!.contentDocument!
    // A framework's delegated handlers in the other window run first.
    frame.addEventListener('keydown', () => log('delegated'))
    frame.body.append(panel)
  })
  await page.frameLocator('#frame').locator('#child').focus()
  await page.keyboard.press('k')
  await page.keyboard.press('k')
  expect(await hk.firedNames()).toEqual([
    'delegated',
    'hotkey',
    'delegated',
    'hotkey',
  ])
})

test('the recorder records and cancels in the window given as target', async ({
  page,
  harness,
}) => {
  const hk = await harness(
    '<iframe id="frame" srcdoc="<button id=record>Record</button>"></iframe>',
  )
  const button = page.frameLocator('#frame').locator('#record')
  await button.waitFor()
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const recorder = new window.TanStackHotkeys.HotkeyRecorder({
      target: document.querySelector('iframe')!.contentWindow,
      onRecord: (hotkey) => log(`recorded ${String(hotkey)}`),
      onCancel: () => log('cancelled'),
    })
    ;(window as { recorder?: typeof recorder }).recorder = recorder
  })
  const start = () =>
    page.evaluate(() =>
      (window as { recorder?: { start: () => void } }).recorder!.start(),
    )
  // Started from the test: Playwright's WebKit doesn't click a button inside
  // a frame, and moves focus back to the main window instead.
  await button.focus()
  await start()
  await page.keyboard.press('k')
  await start()
  await page.keyboard.press('Escape')
  expect(await hk.firedNames()).toEqual(['recorded K', 'cancelled'])
})

// A popup from `window.open` is a real second window, as when an app moves a
// panel into a pop-out or Document Picture-in-Picture window.
test('an element hotkey follows its element into a popup window and back', async ({
  page,
  harness,
}) => {
  const hk = await harness(PAGE)
  const popupOpened = page.waitForEvent('popup')
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const panel = document.getElementById('panel')!
    window.TanStackHotkeys.getHotkeyManager().register(
      'K',
      () => log('hotkey'),
      { target: panel, afterDelegatedHandlers: true },
    )
    const popup = window.open('', 'popup', 'width=400,height=300')!
    popup.document.addEventListener('keydown', () => log('delegated'))
    popup.document.body.append(panel)
    ;(window as { popup?: Window }).popup = popup
  })
  const popup = await popupOpened
  await popup.locator('#child').focus()
  await popup.keyboard.press('k')
  expect(await hk.firedNames()).toEqual(['delegated', 'hotkey'])

  await hk.clear()
  await page.evaluate(() => {
    const popup = (window as { popup?: Window }).popup!
    document.body.append(popup.document.getElementById('panel')!)
  })
  await page.bringToFront()
  await page.focus('#child')
  await page.keyboard.press('k')
  expect(await hk.firedNames()).toEqual(['hotkey'])
})

test('an element hotkey follows its element into a closed shadow root', async ({
  page,
  harness,
}) => {
  const hk = await harness(PAGE + '<div id="host"></div>')
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const panel = document.getElementById('panel')!
    window.TanStackHotkeys.getHotkeyManager().register(
      'K',
      () => log('hotkey'),
      { target: panel, afterDelegatedHandlers: true },
    )
    const shadow = document
      .getElementById('host')!
      .attachShadow({ mode: 'closed' })
    // A component's delegated handlers inside its shadow root run first.
    shadow.addEventListener('keydown', () => log('delegated'))
    shadow.append(panel)
    panel.querySelector<HTMLElement>('#child')!.focus()
  })
  await page.keyboard.press('k')
  expect(await hk.firedNames()).toEqual(['delegated', 'hotkey'])
})

// A framework can run an effect that registers a hotkey before its element is
// in the page, as when a React portal renders into a container that a parent
// effect appends afterwards.
test.describe('an element hotkey registered before its element is in the page', () => {
  test('runs after handlers delegated to the document once its container is attached', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await page.evaluate(() => {
      const log = (name: string) =>
        window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
      const container = document.createElement('div')
      container.innerHTML =
        '<div id="panel" tabindex="0"><span id="child" tabindex="0">child</span></div>'
      window.TanStackHotkeys.getHotkeyManager().register(
        'K',
        () => log('hotkey'),
        {
          target: container.querySelector('#panel')!,
          afterDelegatedHandlers: true,
        },
      )
      // A framework's delegated handler, which stops Shift+K.
      document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() !== 'k') return
        log('delegated')
        if (event.shiftKey) event.stopPropagation()
      })
      document.body.append(container)
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    await page.keyboard.press('Shift+K')
    expect(await hk.firedNames()).toEqual(['delegated', 'hotkey', 'delegated'])
  })

  test('fires once its element moves out of the container into the page', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await page.evaluate(() => {
      const log = (name: string) =>
        window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
      const container = document.createElement('div')
      container.innerHTML =
        '<div id="panel" tabindex="0"><span id="child" tabindex="0">child</span></div>'
      const panel = container.querySelector<HTMLElement>('#panel')!
      window.TanStackHotkeys.getHotkeyManager().register(
        'K',
        () => log('hotkey'),
        { target: panel, afterDelegatedHandlers: true },
      )
      document.body.append(panel)
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['hotkey'])
  })
})

test('the recorder records and cancels in a popup window given as target', async ({
  page,
  harness,
}) => {
  const hk = await harness()
  const popupOpened = page.waitForEvent('popup')
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const popup = window.open('', 'popup', 'width=400,height=300')!
    popup.document.body.innerHTML = '<button id="record">Record</button>'
    const recorder = new window.TanStackHotkeys.HotkeyRecorder({
      target: popup,
      onRecord: (hotkey) => log(`recorded ${String(hotkey)}`),
      onCancel: () => log('cancelled'),
    })
    popup.document
      .getElementById('record')!
      .addEventListener('click', () => recorder.start())
  })
  const popup = await popupOpened
  await popup.click('#record')
  await popup.keyboard.press('Shift+K')
  await popup.click('#record')
  await popup.keyboard.press('Escape')
  expect(await hk.firedNames()).toEqual(['recorded Shift+K', 'cancelled'])
})

// A library that closes its popover from a document capture listener closes
// it before the hotkey runs. The manager reads what Escape closes before
// that, from a window listener, which must already be in the new window on
// the first press there.
for (const inShadow of [false, true]) {
  test(`an element Escape hotkey yields to a popover on the first press after moving to a popup${inShadow ? ', inside a closed shadow root' : ''}`, async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE + '<div id="host"></div>')
    const popupOpened = page.waitForEvent('popup')
    await page.evaluate((inShadow) => {
      const log = (name: string) =>
        window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
      const panel = document.getElementById('panel')!
      const host = document.getElementById('host')!
      if (inShadow) host.attachShadow({ mode: 'closed' }).append(panel)
      window.TanStackHotkeys.getHotkeyManager().register(
        'Escape',
        () => log('hotkey'),
        { target: panel, afterDelegatedHandlers: true },
      )
      const popup = window.open('', 'popup', 'width=400,height=300')!
      popup.document.body.innerHTML = '<div id="menu" popover>Menu</div>'
      const menu = popup.document.getElementById('menu')!
      popup.document.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'Escape' || !menu.matches(':popover-open')) return
          log('closed')
          menu.hidePopover()
        },
        true,
      )
      popup.document.body.append(inShadow ? host : panel)
      menu.showPopover()
      ;(window as { panel?: HTMLElement }).panel = panel
    }, inShadow)
    const popup = await popupOpened
    await page.evaluate(() =>
      (window as { panel?: HTMLElement })
        .panel!.querySelector<HTMLElement>('#child')!
        .focus(),
    )
    await popup.keyboard.press('Escape')
    await popup.keyboard.press('Escape')
    expect(await hk.firedNames()).toEqual(['closed', 'hotkey'])
  })
}

test('closing the popup a recorder records in cancels it, and hotkeys work again', async ({
  page,
  harness,
}) => {
  const hk = await harness()
  await hk.register('hotkey', 'K')
  const popupOpened = page.waitForEvent('popup')
  await page.evaluate(() => {
    const log = (name: string) =>
      window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
    const popup = window.open('', 'popup', 'width=400,height=300')!
    popup.document.body.innerHTML = '<button id="record">Record</button>'
    const recorder = new window.TanStackHotkeys.HotkeyRecorder({
      target: popup,
      cancelOnBlur: false,
      onRecord: (hotkey) => log(`recorded ${String(hotkey)}`),
      onCancel: () => log('cancelled'),
    })
    popup.document
      .getElementById('record')!
      .addEventListener('click', () => recorder.start())
  })
  const popup = await popupOpened
  await popup.click('#record')
  await popup.close({ runBeforeUnload: false })
  await page.bringToFront()
  await page.keyboard.press('k')
  expect(await hk.firedNames()).toEqual(['cancelled', 'hotkey'])
})
