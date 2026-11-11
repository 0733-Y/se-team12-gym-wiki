// E1：搜索与肌肉筛选（ARCHITECTURE.md 第8节）
import { expect, test } from '@playwright/test'

const cards = (page) => page.getByTestId('exercise-card')
const cardNames = (page) => cards(page).evaluateAll((els) => els.map((el) => el.dataset.exercise).sort())

async function openLibrary(page, query = '') {
  await page.goto(`/library${query}`)
  await expect(cards(page).first()).toBeVisible()
}

async function searchFor(page, term) {
  await page.getByRole('searchbox').fill(term)
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(term).replace(/%20/g, '(%20|\+)')}`))
}

test.describe('E1 动作库', () => {
  test('加载动作列表，每张卡片有名称和图片', async ({ page }) => {
    await openLibrary(page)
    expect(await cards(page).count()).toBeGreaterThan(50)
    const first = cards(page).first()
    await expect(first.locator('h3')).not.toBeEmpty()
    // 测试库导入时不下载图片：本机已有图片就显示图片，没有就显示占位文字
    await expect(first.locator('img[src*="/media/exercises/"], .exercise-card__no-image')).toHaveCount(1)
  })

  test('韩文、中文、英文搜索同一个动作得到同一组结果', async ({ page }) => {
    await openLibrary(page)
    const results = {}
    for (const [lang, term] of [['ko', '스쿼트'], ['zh', '深蹲'], ['en', 'squat']]) {
      await page.getByTestId(`lang-${lang}`).click()
      await searchFor(page, term)
      await expect(page.locator('[data-exercise="Barbell Squat"]')).toBeVisible()
      await expect(page.locator('[data-exercise="Barbell Curl"]')).toHaveCount(0)
      results[lang] = await cardNames(page)
    }
    expect(results.ko).toEqual(results.en)
    expect(results.zh).toEqual(results.en)
    expect(results.en.length).toBeGreaterThan(1)
  })

  test('动作名跟随语言切换', async ({ page }) => {
    await openLibrary(page, '?q=squat')
    const squat = page.locator('[data-exercise="Barbell Squat"] h3')
    await page.getByTestId('lang-ko').click()
    await expect(squat).toHaveText('바벨 스쿼트')
    await page.getByTestId('lang-zh').click()
    await expect(squat).toHaveText('杠铃深蹲')
    await page.getByTestId('lang-en').click()
    await expect(squat).toHaveText('Barbell Squat')
  })

  test('搜不到时显示空状态，清除后恢复', async ({ page }) => {
    await openLibrary(page)
    const total = await cards(page).count()
    await searchFor(page, 'zzzzqqq')
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(cards(page)).toHaveCount(0)
    await page.getByRole('searchbox').fill('')
    await expect(cards(page)).toHaveCount(total)
  })

  test('用筛选按钮按肌群筛选', async ({ page }) => {
    await openLibrary(page)
    const total = await cards(page).count()
    const chip = page.getByTestId('filter-lats')
    await chip.click()
    await expect(page).toHaveURL(/group=lats/)
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-exercise="Wide-Grip Lat Pulldown"]')).toBeVisible()
    await expect(page.locator('[data-exercise="Barbell Squat"]')).toHaveCount(0)

    const shown = await cards(page).count()
    expect(shown).toBeLessThan(total)
    // 按钮上的数量与列表一致
    await expect(chip).toContainText(String(shown))

    await page.getByTestId('filter-all').click()
    await expect(cards(page)).toHaveCount(total)
  })

  test('点击肌肉图筛选，对应部位高亮', async ({ page }) => {
    await openLibrary(page)
    const biceps = page.getByTestId('body-map-front').locator('.body-chart-muscle[aria-label*="Biceps"]').first()
    await biceps.click()
    await expect(page).toHaveURL(/group=biceps/)
    await expect(page.getByTestId('filter-biceps')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('[data-exercise="Barbell Curl"]')).toBeVisible()
    await expect(page.getByTestId('body-map-front').locator('.body-chart-muscle[aria-label*="(selected)"]')).not.toHaveCount(0)
  })

  test('搜索和肌群筛选可以叠加', async ({ page }) => {
    await openLibrary(page, '?q=curl')
    const all = await cards(page).count()
    await page.getByTestId('filter-forearms').click()
    await expect(page.locator('[data-exercise="Cable Wrist Curl"]')).toBeVisible()
    await expect(page.locator('[data-exercise="Barbell Curl"]')).toHaveCount(0)
    expect(await cards(page).count()).toBeLessThan(all)
  })

  test('打开详情看到名称、步骤、目标肌群和来源，返回后筛选条件还在', async ({ page }) => {
    await openLibrary(page, '?group=chest')
    await page.locator('[data-exercise="Barbell Bench Press - Medium Grip"]').click()
    await expect(page).toHaveURL(/\/library\/\d+$/)
    await expect(page.getByTestId('exercise-name')).toHaveText('杠铃卧推')
    await expect(page.getByTestId('exercise-steps').locator('li').first()).toBeVisible()
    await expect(page.getByRole('button', { name: '胸部' })).toBeVisible()
    await expect(page.getByText('free-exercise-db')).toBeVisible()
    await expect(page.getByText('Unlicense')).toBeVisible()

    await page.goBack()
    await expect(page).toHaveURL(/group=chest/)
    await expect(page.getByTestId('filter-chest')).toHaveAttribute('aria-pressed', 'true')
  })

  test('不存在的动作 id 显示提示', async ({ page }) => {
    await page.goto('/library/999999')
    await expect(page.getByTestId('not-found')).toBeVisible()
  })

  test('后端不可用时显示提示条和重试按钮，恢复后能重新加载', async ({ page }) => {
    await page.route('**/api/exercises/**', (route) => route.abort())
    await page.goto('/library')
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(cards(page)).toHaveCount(0)

    await page.unroute('**/api/exercises/**')
    await page.getByRole('alert').getByRole('button').click()
    await expect(cards(page).first()).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
})
