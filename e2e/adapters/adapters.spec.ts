import { adapterApps, test as base, expect } from './apps'

for (const app of adapterApps) {
  // Skips the tests a known adapter bug breaks, named with the bug's issue
  const test = (title: string, body: Parameters<typeof base>[2]) => {
    const bug = app.knownBugs?.[title]
    if (bug) base.skip(`${bug}: ${title}`, body)
    else base(title, body)
  }

  base.describe(app.name, () => {
    test('a registered hotkey fires once per press', async ({
      page,
      openApp,
    }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(1)
      await page.keyboard.press('k')
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual(['hotkey', 'hotkey'])
    })

    test('unmounting unregisters, and a remount registers once', async ({
      page,
      openApp,
    }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(1)

      await fixture.setShown(false)
      await expect(page.locator('#hotkey-host')).toHaveCount(0)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(0)
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual([])

      await fixture.setShown(true)
      await expect(page.locator('#hotkey-host')).toHaveCount(1)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(1)
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual(['hotkey'])
    })

    test('toggling enabled stops and resumes the hotkey', async ({
      page,
      openApp,
    }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(1)

      await fixture.setEnabled(false)
      await expect
        .poll(() => fixture.registrationsOf('K'))
        .not.toContainEqual({ hotkey: 'K', enabled: true })
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual([])

      await fixture.setEnabled(true)
      await expect
        .poll(() => fixture.registrationsOf('K'))
        .toEqual([{ hotkey: 'K', enabled: true }])
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual(['hotkey'])
    })

    test('changing the hotkey string moves the registration', async ({
      page,
      openApp,
    }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('K')).toHaveLength(1)

      await fixture.setHotkey('J')
      await expect.poll(() => fixture.registrationsOf('J')).toHaveLength(1)
      expect(await fixture.registrationsOf('K')).toEqual([])
      await page.keyboard.press('k')
      expect(await fixture.takeLog()).toEqual([])
      await page.keyboard.press('j')
      expect(await fixture.takeLog()).toEqual(['hotkey'])
    })

    test('a sequence fires after its last step', async ({ page, openApp }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('G G')).toHaveLength(1)
      await page.keyboard.press('g')
      expect(await fixture.takeLog()).toEqual([])
      await page.keyboard.press('g')
      expect(await fixture.takeLog()).toEqual(['sequence'])
    })

    test('the recorder records a chord', async ({ page, openApp }) => {
      const fixture = await openApp(app)
      const mod = await fixture.mod()
      await fixture.startRecording()
      await expect(page.locator('#recording')).toHaveText('yes')
      await page.keyboard.press(`${mod}+Shift+k`)
      await expect(page.locator('#recording')).toHaveText('no')
      expect(await fixture.recorded()).toBe('Mod+Shift+K')
      // The recorded press doesn't reach the K hotkey
      expect(await fixture.takeLog()).toEqual([])
    })

    test('key hold and held keys follow the keyboard', async ({
      page,
      openApp,
    }) => {
      await openApp(app)
      await expect(page.locator('#shift-held')).toHaveText('released')
      await page.keyboard.down('Shift')
      await expect(page.locator('#shift-held')).toHaveText('held')
      await page.keyboard.down('a')
      await expect(page.locator('#held-keys')).toHaveText('Shift+A')
      await page.keyboard.up('a')
      await page.keyboard.up('Shift')
      await expect(page.locator('#shift-held')).toHaveText('released')
      await expect(page.locator('#held-keys')).toHaveText('')
    })
  })
}
