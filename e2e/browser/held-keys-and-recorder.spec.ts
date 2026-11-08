import { expect, test } from '../support/fixtures'

test.describe('held keys', () => {
  test('tracks keys and codes while held', async ({ page, harness }) => {
    const hk = await harness()
    await hk.call('heldKeys') // starts the tracker
    await page.keyboard.down('Shift')
    await page.keyboard.down('KeyA')
    expect(await hk.call('heldKeys')).toEqual(['Shift', 'A'])
    expect(await hk.call('heldCodes')).toEqual({
      Shift: 'ShiftLeft',
      A: 'KeyA',
    })
    await page.keyboard.up('KeyA')
    await page.keyboard.up('Shift')
    expect(await hk.call('heldKeys')).toEqual([])
  })

  test('clears held keys when the window loses focus', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.call('heldKeys')
    await page.keyboard.down('Shift')
    expect(await hk.call('heldKeys')).toEqual(['Shift'])
    await page.evaluate(() => window.dispatchEvent(new Event('blur')))
    expect(await hk.call('heldKeys')).toEqual([])
    await page.keyboard.up('Shift')
  })
})

test.describe('recorder', () => {
  test('records a chord by physical key and the result fires', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.call('startRecorder')
    await page.keyboard.press(`${hk.mod}+Shift+k`)
    const { recorded, isRecording } = await hk.call('recorderState')
    expect(recorded).toBe('Mod+Shift+[KeyK]')
    expect(isRecording).toBe(false)
    await hk.register('recorded', recorded as 'Mod+Shift+[KeyK]')
    await page.keyboard.press(`${hk.mod}+Shift+k`)
    expect(await hk.firedNames()).toEqual(['recorded'])
  })

  test('records the typed character in key mode', async ({ page, harness }) => {
    const hk = await harness()
    await hk.call('startRecorder', { recordBy: 'key' })
    await page.keyboard.press('Shift+Slash')
    expect((await hk.call('recorderState')).recorded).toBe('Shift+?')
  })

  test('records a sequence and commits on Enter', async ({ page, harness }) => {
    const hk = await harness()
    await hk.call('startRecorder', { maxSteps: Infinity })
    await page.keyboard.press('g')
    await page.keyboard.press(`${hk.mod}+k`)
    expect((await hk.call('recorderState')).steps).toEqual([
      '[KeyG]',
      'Mod+[KeyK]',
    ])
    await page.keyboard.press('Enter')
    expect((await hk.call('recorderState')).recorded).toEqual([
      '[KeyG]',
      'Mod+[KeyK]',
    ])
  })

  test('Escape cancels and Backspace clears', async ({ page, harness }) => {
    const hk = await harness()
    await hk.call('startRecorder')
    await page.keyboard.press('Escape')
    expect(await hk.call('recorderState')).toMatchObject({
      recorded: 'cancelled',
      isRecording: false,
    })
    await hk.call('startRecorder')
    await page.keyboard.press('Backspace')
    expect((await hk.call('recorderState')).recorded).toBe('cleared')
  })

  test('Tab and Shift+Tab cancel and move focus', async ({ page, harness }) => {
    // Inputs, because WebKit skips buttons when tabbing by default
    const hk = await harness(
      '<input id="before"><button id="start">Record</button><input id="after">',
    )
    await hk.register('tab', 'Tab')
    for (const [key, next] of [
      ['Tab', 'after'],
      ['Shift+Tab', 'before'],
    ] as const) {
      await page.focus('#start')
      await hk.call('startRecorder')
      await page.keyboard.press(key)
      await expect(page.locator(`#${next}`)).toBeFocused()
      expect(await hk.call('recorderState')).toMatchObject({
        recorded: 'cancelled',
        isRecording: false,
      })
    }
    expect(await hk.firedNames()).toEqual([])
  })

  test('Tab moves focus when cancelling removes the focused control', async ({
    page,
    harness,
  }) => {
    const hk = await harness(
      '<input id="before"><button id="start">Record</button><input id="after">',
    )
    await page.focus('#start')
    await hk.call('startRecorder')
    // Runs right after the recorder's listener, as an onCancel that unmounts would
    await page.evaluate(() =>
      document.addEventListener(
        'keydown',
        () => document.getElementById('start')?.remove(),
        { capture: true, once: true },
      ),
    )
    await page.keyboard.press('Tab')
    await expect(page.locator('#after')).toBeFocused()
  })

  test('recordTab records Tab and keeps focus', async ({ page, harness }) => {
    const hk = await harness(
      '<button id="start">Record</button><input id="after">',
    )
    await page.focus('#start')
    await hk.call('startRecorder', { recordTab: true })
    await page.keyboard.press('Tab')
    await expect(page.locator('#start')).toBeFocused()
    expect((await hk.call('recorderState')).recorded).toBe('[Tab]')
  })

  test('keys pressed while recording do not fire hotkeys', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('save', 'Mod+S')
    await hk.call('startRecorder')
    await page.keyboard.press(`${hk.mod}+s`)
    expect(await hk.firedNames()).toEqual([])
    await page.keyboard.press(`${hk.mod}+s`)
    expect(await hk.firedNames()).toEqual(['save'])
  })

  test('typing in an input passes through while recording', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<input id="text">')
    await hk.call('startRecorder')
    await page.focus('#text')
    await page.keyboard.type('hi')
    await expect(page.locator('#text')).toHaveValue('hi')
    expect(await hk.call('recorderState')).toMatchObject({
      recorded: undefined,
      isRecording: true,
    })
  })
})
