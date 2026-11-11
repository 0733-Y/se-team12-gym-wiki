// E4：在 360×740 与 1280×800 两种视口下重复 E1–E3 的关键点击，并检查布局（N01）。
// 这个文件在 desktop 和 mobile 两个项目里各跑一遍（见 playwright.config.js）。
import { expect, test } from '@playwright/test'
import { clearTrainingLogs, clearWrongBook, exerciseIdByName, reportWrong, trainingLogs, wrongRecords } from './helpers.js'

const SQUAT = 'Barbell Squat'
const CURL = 'Standing Biceps Cable Curl'
const TOUCH_MIN = 44
let squatId
let curlId

test.beforeAll(async ({ request }) => {
  squatId = await exerciseIdByName(request, SQUAT)
  curlId = await exerciseIdByName(request, CURL)
})
test.beforeEach(async ({ request }) => {
  await clearWrongBook(request)
  await clearTrainingLogs(request)
})
test.afterAll(async ({ request }) => {
  await clearWrongBook(request)
  await clearTrainingLogs(request)
})

const isMobile = (page) => page.viewportSize().width < 720

async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0)
}

// 可见的按钮类控件里，宽或高小于 44px 的
async function smallTouchTargets(page) {
  return page.evaluate((min) => {
    const selector =
      'button, select, textarea, input:not([type=radio]):not([type=checkbox]), a.btn, .app-nav a, a.exercise-card, a.back-link, .segmented label, .self-check__answer, label.check'
    return [...document.querySelectorAll(selector)]
      .filter((el) => el.offsetParent !== null && !el.closest('svg'))
      .map((el) => {
        const box = el.getBoundingClientRect()
        return { label: (el.textContent.trim() || el.id || el.tagName).slice(0, 16), w: Math.round(box.width), h: Math.round(box.height) }
      })
      .filter((item) => item.w < min || item.h < min)
  }, TOUCH_MIN)
}

async function expectUsableLayout(page) {
  await expectNoHorizontalScroll(page)
  if (isMobile(page)) expect(await smallTouchTargets(page)).toEqual([])
}

test.describe('E4 响应式', () => {
  test('导航：小屏在底部，大屏在顶部；五个页面都能切换', async ({ page }) => {
    await page.goto('/library')
    const nav = page.locator('nav.app-nav')
    const box = await nav.boundingBox()
    const { height } = page.viewportSize()
    if (isMobile(page)) {
      expect(Math.round(box.y + box.height)).toBe(height) // 贴着底边
      await expect(nav).toHaveCSS('position', 'fixed')
    } else {
      expect(box.y).toBeLessThan(80)
      await expect(nav).not.toHaveCSS('position', 'fixed')
    }

    for (const [path, title] of [
      ['/correction', '纠错中心'], ['/plans', '训练计划'], ['/logs', '训练日志'], ['/tools', '工具'], ['/library', '动作库'],
    ]) {
      await nav.locator(`a[href="${path}"]`).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.locator('main h1')).toHaveText(title)
    }
  })

  test('动作库：小屏肌肉图与列表上下排列，大屏左右排列', async ({ page }) => {
    await page.goto('/library')
    await expect(page.getByTestId('exercise-card').first()).toBeVisible()
    const map = await page.locator('.library__map').boundingBox()
    const main = await page.locator('.library__main').boundingBox()
    if (isMobile(page)) {
      expect(map.y + map.height).toBeLessThanOrEqual(main.y)
      expect(Math.abs(map.x - main.x)).toBeLessThan(2)
    } else {
      expect(map.x + map.width).toBeLessThanOrEqual(main.x)
      expect(Math.abs(map.y - main.y)).toBeLessThan(2)
    }
  })

  test('各页面没有横向滚动，小屏下按钮触控区域不小于 44px', async ({ page, request }) => {
    await reportWrong(request, squatId, 'joint') // 让纠正中心和计划里有内容
    for (const path of ['/library', `/library/${squatId}`, '/correction', '/plans', '/logs', '/tools', '/tools?tool=macros', '/tools?tool=one-rm']) {
      await page.goto(path)
      await expect(page.locator('main h1, [data-testid="exercise-name"]').first()).toBeVisible()
      await page.waitForLoadState('networkidle')
      await test.step(path, () => expectUsableLayout(page))
    }
  })

  test('换成韩文和英文后同样没有横向滚动', async ({ page, request }) => {
    await reportWrong(request, squatId, 'joint')
    for (const lang of ['ko', 'en']) {
      await page.goto('/library')
      await page.getByTestId(`lang-${lang}`).click()
      for (const path of [`/library/${squatId}`, '/correction', '/plans', '/logs', '/tools']) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await test.step(`${lang} ${path}`, () => expectUsableLayout(page))
      }
    }
  })

  test('断点附近的宽度（719 / 720 / 768 / 1024 / 1119 / 1120）也没有横向滚动', async ({ page, request }) => {
    test.skip(isMobile(page), '只需跑一遍')
    test.setTimeout(180_000) // 2 种语言 × 6 个宽度 × 6 个页面
    await reportWrong(request, squatId, 'joint')
    // 英文的导航文字最长，中文最短，两种都查
    for (const lang of ['zh', 'en']) {
      await page.goto('/library')
      await page.getByTestId(`lang-${lang}`).click()
      for (const width of [719, 720, 768, 1024, 1119, 1120]) {
        await page.setViewportSize({ width, height: 800 })
        for (const path of ['/library', `/library/${squatId}`, '/correction', '/plans', '/logs', '/tools']) {
          await page.goto(path)
          await page.waitForLoadState('networkidle')
          await test.step(`${lang} ${width}px ${path}`, () => expectNoHorizontalScroll(page))
        }
      }
    }
  })

  test('E1 关键点击：搜索 → 肌群按钮 → 肌肉图 → 详情', async ({ page }) => {
    await page.goto('/library')
    await page.getByRole('searchbox').fill('深蹲')
    await expect(page.locator(`[data-exercise="${SQUAT}"]`)).toBeVisible()
    await expect(page.locator('[data-exercise="Barbell Curl"]')).toHaveCount(0)

    await page.getByRole('searchbox').fill('')
    await page.getByTestId('filter-lats').click()
    await expect(page).toHaveURL(/group=lats/)
    await expect(page.locator('[data-exercise="Wide-Grip Lat Pulldown"]')).toBeVisible()

    await page.getByTestId('body-map-front').locator('.body-chart-muscle[aria-label*="Biceps"]').first().click()
    await expect(page).toHaveURL(/group=biceps/)
    await expect(page.getByTestId('filter-biceps')).toHaveAttribute('aria-pressed', 'true')

    await page.locator('[data-exercise="Barbell Curl"]').click()
    await expect(page.getByTestId('exercise-name')).toHaveText('杠铃弯举')
    await expect(page.getByTestId('exercise-steps').locator('li').first()).toBeVisible()
  })

  test('E2 关键点击：自检 → 易错本 → 刷新仍在 → 纠正中心复盘', async ({ page, request }) => {
    await page.goto(`/library/${squatId}`)
    await page.locator('[data-question="joint"] input[value="no"]').check()
    await page.getByTestId('self-check-save').click()
    await expect(page.getByTestId('record-status')).toHaveText('未掌握')

    await page.reload()
    await expect(page.getByTestId('record-status')).toHaveText('未掌握')
    await expect(page.getByTestId('record-reason')).toHaveValue('joint')

    await page.goto('/correction')
    const card = page.locator(`[data-testid="wrong-record-card"][data-exercise="${SQUAT}"]`)
    await card.getByTestId('review-fixed').click()
    await expect(card.getByTestId('card-status')).toHaveText('练习中')
    expect(await wrongRecords(request)).toHaveLength(1)
  })

  test('E3 关键点击：易错动作在计划里 → 完成 → 日志当天有记录', async ({ page, request }) => {
    await reportWrong(request, curlId)
    await page.goto('/plans')
    await page.getByTestId('plan-goal').selectOption('hypertrophy')
    await page.getByTestId('plan-frequency').selectOption('4')

    const row = page.locator(`[data-testid="plan-exercise"][data-exercise="${CURL}"]`)
    const days = page.getByTestId('week-day')
    await days.first().click()
    await expect(page.getByTestId('plan-exercise')).toHaveCount(4)
    let date = null
    for (let index = 0; index < 7 && !date; index += 1) {
      await days.nth(index).click()
      if (await row.count()) date = await days.nth(index).getAttribute('data-date')
    }
    expect(date).not.toBeNull()
    await expect(row.getByTestId('review-badge')).toBeVisible()

    await row.getByTestId('plan-toggle').click()
    await expect(row).toHaveAttribute('data-done', 'true')
    const logs = await trainingLogs(request)
    expect(logs).toHaveLength(1)
    expect(logs[0].items).toHaveLength(1)

    await page.goto('/logs')
    const cell = page.locator(`[data-testid="calendar-day"][data-date="${date}"]`)
    await expect(cell.getByTestId('calendar-count')).toHaveText('1')
    await cell.click()
    await expect(page.getByTestId('day-log-item')).toContainText('站姿绳索弯举')
  })

  test('F04 关键点击：三个计算器', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.getByTestId('calorie-bmr')).toHaveText('1,674')
    await page.getByTestId('calorie-age').fill('5')
    await expect(page.getByTestId('calorie-age-error')).toBeVisible()
    await page.getByTestId('calorie-age').fill('25')
    await page.getByTestId('use-in-macros').click()
    await expect(page.getByTestId('macro-calories')).toHaveValue('2009')
    await page.getByTestId('tool-tab-one-rm').click()
    await expect(page.getByTestId('one-rm-value')).toHaveText('112.5')
  })
})
