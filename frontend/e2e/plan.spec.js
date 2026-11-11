// E3：易错动作出现在计划 → 完成 → 日志里当天有记录（ARCHITECTURE.md 第8节）
import { expect, test } from '@playwright/test'
import { clearTrainingLogs, clearWrongBook, exerciseIdByName, reportWrong, trainingLogs } from './helpers.js'

// 这个动作平时排不进计划（不是二头肌里得分最高的），记为易错后才会出现
const EXERCISE = 'Standing Biceps Cable Curl'
let exerciseId

test.beforeAll(async ({ request }) => {
  exerciseId = await exerciseIdByName(request, EXERCISE)
})
test.beforeEach(async ({ request }) => {
  await clearWrongBook(request)
  await clearTrainingLogs(request)
})
test.afterAll(async ({ request }) => {
  await clearWrongBook(request)
  await clearTrainingLogs(request)
})

const row = (page) => page.locator(`[data-testid="plan-exercise"][data-exercise="${EXERCISE}"]`)

async function openPlan(page) {
  await page.goto('/plans')
  await page.getByTestId('plan-goal').selectOption('hypertrophy')
  await page.getByTestId('plan-frequency').selectOption('4')
  await expect(page.getByTestId('week-day')).toHaveCount(7)
  // 周一一定是训练日：等动作库加载完、计划生成出来再继续
  await page.getByTestId('week-day').first().click()
  await expect(page.getByTestId('plan-exercise')).toHaveCount(4)
}

// 在本周里找到排了这个动作的那天，返回日期
async function selectDayWithExercise(page) {
  const days = page.getByTestId('week-day')
  for (let index = 0; index < 7; index += 1) {
    await days.nth(index).click()
    if (await row(page).count()) return days.nth(index).getAttribute('data-date')
  }
  return null
}

test.describe('E3 训练计划与日志', () => {
  test('一周有 4 个训练日和 3 个休息日，训练日有 4 个动作', async ({ page }) => {
    await openPlan(page)
    const days = page.getByTestId('week-day')
    let training = 0
    for (let index = 0; index < 7; index += 1) {
      await days.nth(index).click()
      const count = await page.getByTestId('plan-exercise').count()
      if (count) {
        training += 1
        expect(count).toBe(4)
      }
    }
    expect(training).toBe(4)
    await expect(page.getByTestId('week-progress')).toHaveText('0 / 16')
  })

  test('没有易错记录时这个动作不在计划里', async ({ page }) => {
    await openPlan(page)
    expect(await selectDayWithExercise(page)).toBeNull()
    await expect(page.getByTestId('week-review-count')).toHaveText('0')
  })

  test('易错动作出现在计划并标为优先复习 → 完成 → 刷新仍完成 → 日志当天有记录', async ({ page, request }) => {
    await reportWrong(request, exerciseId, 'path')
    await openPlan(page)

    const date = await selectDayWithExercise(page)
    expect(date).not.toBeNull()
    await expect(row(page).getByTestId('review-badge')).toBeVisible()
    await expect(page.getByTestId('week-review-count')).not.toHaveText('0')
    // 复习动作排在当天第一个
    await expect(page.getByTestId('plan-exercise').first()).toHaveAttribute('data-exercise', EXERCISE)

    // 完成
    await row(page).getByTestId('plan-toggle').click()
    await expect(row(page)).toHaveAttribute('data-done', 'true')
    await expect(page.getByTestId('day-progress')).toContainText('1 / 4')
    await expect(page.getByTestId('week-progress')).toHaveText('1 / 16')

    // 刷新：完成状态来自服务器
    await page.reload()
    await page.locator(`[data-testid="week-day"][data-date="${date}"]`).click()
    await expect(row(page)).toHaveAttribute('data-done', 'true')

    // 服务器上只有一条
    const logs = await trainingLogs(request)
    expect(logs).toHaveLength(1)
    expect(logs[0].date).toBe(date)
    expect(logs[0].items).toHaveLength(1)
    expect(logs[0].items[0]).toMatchObject({ exercise_id: exerciseId, focus_label: 'biceps', sets: 4, reps: '8-12', rest: '60-90s' })

    // 日志页：月历当天有数字，点开看到这个动作
    await page.goto('/logs')
    const cell = page.locator(`[data-testid="calendar-day"][data-date="${date}"]`)
    await expect(cell.getByTestId('calendar-count')).toHaveText('1')
    await cell.click()
    await expect(page.getByTestId('day-log-count')).toHaveText('1 / 4')
    await expect(page.getByTestId('day-log-item')).toHaveCount(1)
    await expect(page.getByTestId('day-log-item')).toContainText('站姿绳索弯举')
    await expect(page.getByTestId('day-log-item')).toContainText('肱二头肌')
    await expect(page.getByTestId('day-log-item')).toContainText('4 组 × 8-12 次')
    await expect(page.locator('[data-stat="completed_total"] dd')).toHaveText('1')
  })

  test('取消完成后日志里当天的记录消失', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await openPlan(page)
    const date = await selectDayWithExercise(page)
    const toggle = row(page).getByTestId('plan-toggle')
    await toggle.click()
    await expect(row(page)).toHaveAttribute('data-done', 'true')
    await toggle.click()
    await expect(row(page)).toHaveAttribute('data-done', 'false')
    expect(await trainingLogs(request)).toHaveLength(0)

    await page.goto('/logs')
    await page.locator(`[data-testid="calendar-day"][data-date="${date}"]`).click()
    await expect(page.getByTestId('day-log-empty')).toBeVisible()
  })

  test('连续快速点击完成不会产生重复记录', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await openPlan(page)
    await selectDayWithExercise(page)
    // 请求放慢，在等待期间按钮是禁用的
    await page.route('**/api/training-logs/**/items/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      await route.continue()
    })
    const toggle = row(page).getByTestId('plan-toggle')
    await toggle.click()
    await expect(toggle).toBeDisabled()
    await toggle.click({ force: true }).catch(() => {})
    await expect(row(page)).toHaveAttribute('data-done', 'true')
    const logs = await trainingLogs(request)
    expect(logs).toHaveLength(1)
    expect(logs[0].items).toHaveLength(1)
    expect(logs[0].completed_count).toBe(1)
  })

  test('同一天连续快速完成多个动作，全部保存成功', async ({ page, request }) => {
    await openPlan(page)
    // 不等上一个请求返回就点下一个：四个请求同时到达服务器
    for (const toggle of await page.getByTestId('plan-toggle').all()) await toggle.click({ noWaitAfter: true })
    await expect(page.locator('[data-testid="plan-exercise"][data-done="true"]')).toHaveCount(4)
    await expect(page.getByTestId('day-progress')).toContainText('4 / 4')
    const logs = await trainingLogs(request)
    expect(logs).toHaveLength(1)
    expect(logs[0].completed_count).toBe(4)
    expect(logs[0].items).toHaveLength(4)
  })

  test('保存失败时提示错误，动作仍是未完成', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await openPlan(page)
    await selectDayWithExercise(page)
    await page.route('**/api/training-logs/**/items/**', (route) => route.abort())
    await row(page).getByTestId('plan-toggle').click()
    await expect(page.getByText('无法连接服务器')).toBeVisible()
    await expect(row(page)).toHaveAttribute('data-done', 'false')
    expect(await trainingLogs(request)).toHaveLength(0)
  })

  test('目标和频率刷新后保持，完成状态不受换目标影响', async ({ page }) => {
    await openPlan(page)
    await page.getByTestId('plan-goal').selectOption('strength')
    await page.getByTestId('plan-frequency').selectOption('5')
    await page.reload()
    await expect(page.getByTestId('plan-goal')).toHaveValue('strength')
    await expect(page.getByTestId('plan-frequency')).toHaveValue('5')
    await expect(page.getByTestId('week-progress')).toHaveText('0 / 20')
  })

  test('日志页可以前后翻月', async ({ page }) => {
    await page.goto('/logs')
    const label = page.getByTestId('month-label')
    const current = await label.textContent()
    await page.getByTestId('prev-month').click()
    await expect(label).not.toHaveText(current)
    await page.getByTestId('next-month').click()
    await expect(label).toHaveText(current)
    await expect(page.getByTestId('calendar-day')).toHaveCount(42)
    await expect(page.getByTestId('trend-chart').locator('li')).toHaveCount(28)
  })
})
