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

    // A popup from `window.open` is a real second window, as when an app
    // moves a panel into a pop-out or Document Picture-in-Picture window.
    test('an element hotkey follows its element into a popup window and back', async ({
      page,
      openApp,
    }) => {
      const fixture = await openApp(app)
      await expect.poll(() => fixture.registrationsOf('L')).toHaveLength(1)
      const popup = await fixture.openPopup()
      await page.evaluate(() => {
        const host = document.getElementById('element-host')!
        // Kept so the element goes back where the framework rendered it
        ;(window as { hostPlace?: [Node, Node | null] }).hostPlace = [
          host.parentNode!,
          host.nextSibling,
        ]
        window.fixturePopup!.document.body.append(host)
      })
      await popup.locator('#element-host').focus()
      await popup.keyboard.press('l')
      expect(await fixture.takeLog()).toEqual(['element hotkey'])

      await page.evaluate(() => {
        const [parent, next] = (window as { hostPlace?: [Node, Node | null] })
          .hostPlace!
        const host =
          window.fixturePopup!.document.getElementById('element-host')!
        parent.insertBefore(host, next)
      })
      await page.bringToFront()
      await page.focus('#element-host')
      await page.keyboard.press('l')
      expect(await fixture.takeLog()).toEqual(['element hotkey'])
    })

    // The TanStack Devtools Picture-in-Picture case: the framework moves the
    // same nodes to the new mount, and the hotkey doesn't register again.
    if (app.portal === 'movable') {
      test('a hotkey in a portal keeps firing after the portal mounts in a popup window and back', async ({
        page,
        openApp,
      }) => {
        const fixture = await openApp(app)
        await expect.poll(() => fixture.registrationsOf('P')).toHaveLength(1)
        const ids = await fixture.registrationIdsOf('P')
        await page.focus('#portal-host')
        await page.keyboard.press('p')
        expect(await fixture.takeLog()).toEqual(['portal hotkey'])

        // Playwright's Firefox doesn't focus an element in the popup that
        // still had focus in this page when it moved there.
        await page.evaluate(() =>
          (document.activeElement as HTMLElement).blur(),
        )
        const popup = await fixture.openPopup()
        await fixture.portalInto('popup')
        await expect(popup.locator('#portal-host')).toHaveCount(1)
        await expect(page.locator('#portal-host')).toHaveCount(0)
        await popup.locator('#portal-host').focus()
        await popup.keyboard.press('p')
        expect(await fixture.takeLog()).toEqual(['portal hotkey'])
        expect(await fixture.registrationIdsOf('P')).toEqual(ids)

        await fixture.portalInto('page')
        await expect(page.locator('#portal-host')).toHaveCount(1)
        await page.bringToFront()
        await page.focus('#portal-host')
        await page.keyboard.press('p')
        expect(await fixture.takeLog()).toEqual(['portal hotkey'])
        expect(await fixture.registrationIdsOf('P')).toEqual(ids)
      })
    }

    // The effects inside the portal run before the parent's, so its hotkeys
    // register while the container is outside the page. React handles the
    // child's key events from a listener on the container; Preact listens on
    // the child itself.
    if (app.portal === 'detached') {
      test('a hotkey in a portal registered before its container is in the page runs after the framework key handler', async ({
        page,
        openApp,
      }) => {
        const fixture = await openApp(app)
        await expect.poll(() => fixture.registrationsOf('P')).toHaveLength(1)
        await expect
          .poll(() => fixture.registrationsOf('Shift+P'))
          .toHaveLength(1)
        await page.focus('#portal-child')
        await page.keyboard.press('p')
        expect(await fixture.takeLog()).toEqual([
          'portal keydown',
          'portal hotkey',
        ])
        // The handler stops Shift+P before it reaches the hotkey
        await page.keyboard.press('Shift+P')
        expect(await fixture.takeLog()).toEqual(['portal keydown'])
        await page.keyboard.press('p')
        expect(await fixture.takeLog()).toEqual([
          'portal keydown',
          'portal hotkey',
        ])
      })
    }

    // Playwright can't turn on the OS Caps Lock: Chromium and WebKit report
    // it off. This checks that real input reaches the lock state helper.
    test('key lock state follows real input and resets on blur', async ({
      page,
      openApp,
    }) => {
      await openApp(app)
      await expect(page.locator('#caps-lock')).toHaveText('unknown')
      await page.keyboard.press('a')
      await expect(page.locator('#caps-lock')).toHaveText('off')
      await page.evaluate(() => window.dispatchEvent(new Event('blur')))
      await expect(page.locator('#caps-lock')).toHaveText('unknown')
      await page.mouse.move(20, 20)
      await page.mouse.move(40, 40)
      await expect(page.locator('#caps-lock')).toHaveText('off')
    })
  })
}
