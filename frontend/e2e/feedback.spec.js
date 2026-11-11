// E2：自检 → 易错本 → 刷新仍在（ARCHITECTURE.md 第8节）
import { expect, test } from '@playwright/test'
import { API, clearWrongBook, exerciseIdByName, reportWrong, wrongRecords } from './helpers.js'

const EXERCISE = 'Barbell Squat'
const ALL_QUESTIONS = ['form', 'muscle', 'joint', 'weight', 'path', 'breathing']
let exerciseId

test.beforeAll(async ({ request }) => {
  exerciseId = await exerciseIdByName(request, EXERCISE)
})
test.beforeEach(async ({ request }) => clearWrongBook(request))
test.afterAll(async ({ request }) => clearWrongBook(request))

const answer = (page, question, value) =>
  page.locator(`[data-question="${question}"] input[value="${value}"]`).check()

const recordCard = (page) => page.locator(`[data-testid="wrong-record-card"][data-exercise="${EXERCISE}"]`)

async function openDetail(page) {
  await page.goto(`/library/${exerciseId}`)
  await expect(page.getByTestId('exercise-name')).toBeVisible()
}

test.describe('E2 自检与易错本', () => {
  test('自检发现问题 → 记入易错本 → 刷新后仍在 → 纠正中心能看到', async ({ page }) => {
    await openDetail(page)
    await expect(page.getByTestId('record-status')).toHaveCount(0)

    // 6 道题里关节和轨迹有问题，建议原因取第一道：关节不舒服
    for (const q of ['form', 'muscle', 'weight', 'breathing']) await answer(page, q, 'yes')
    await answer(page, 'joint', 'no')
    await answer(page, 'path', 'unsure')
    await expect(page.getByTestId('self-check-result')).toContainText('关节不舒服')
    await expect(page.getByTestId('self-check-result')).toContainText('6/6')

    await page.getByTestId('self-check-save').click()
    await expect(page.getByTestId('record-status')).toHaveText('未掌握')
    await expect(page.getByTestId('record-error-count')).toHaveText('1')
    await expect(page.getByTestId('record-reason')).toHaveValue('joint')
    await expect(page.getByTestId('record-note')).toHaveValue(/训练后自检：/)

    // 刷新：数据来自服务器，不是本地缓存
    await page.reload()
    await expect(page.getByTestId('record-status')).toHaveText('未掌握')
    await expect(page.getByTestId('record-reason')).toHaveValue('joint')
    await expect(page.getByTestId('record-error-count')).toHaveText('1')

    // 纠正中心
    await page.goto('/correction')
    await expect(recordCard(page)).toBeVisible()
    await expect(recordCard(page).getByTestId('card-status')).toHaveText('未掌握')
    await expect(page.locator('[data-summary="total"] dd')).toHaveText('1')
    await expect(page.locator('[data-summary="unfixed"] dd')).toHaveText('1')
    await expect(page.locator('[data-reason="joint"] strong')).toHaveText('1')

    // 动作库卡片上有标记
    await page.goto('/library?q=squat')
    await expect(page.locator(`[data-exercise="${EXERCISE}"]`).getByTestId('card-wrong-badge')).toBeVisible()
  })

  test('重复自检只累加错误次数，不产生第二条记录', async ({ page, request }) => {
    await openDetail(page)
    for (let round = 1; round <= 2; round += 1) {
      await answer(page, 'weight', 'no')
      await page.getByTestId('self-check-save').click()
      await expect(page.getByTestId('record-error-count')).toHaveText(String(round))
    }
    const records = await wrongRecords(request)
    expect(records).toHaveLength(1)
    expect(records[0].error_count).toBe(2)
    // 自检笔记被替换而不是越积越多
    expect(records[0].user_note.match(/训练后自检：/g)).toHaveLength(1)
  })

  test('全部回答"是"时不提示加入易错本', async ({ page }) => {
    await openDetail(page)
    for (const q of ALL_QUESTIONS) await answer(page, q, 'yes')
    await expect(page.getByTestId('self-check-result')).toContainText('本次动作表现良好')
    await expect(page.getByTestId('self-check-save')).toHaveCount(0)
  })

  test('手动加入、编辑笔记和原因，刷新后保持', async ({ page }) => {
    await openDetail(page)
    await page.getByTestId('record-reason').selectOption('path')
    await page.getByTestId('record-note').fill('下蹲时膝盖内扣')
    await page.getByTestId('record-save').click()
    await expect(page.getByTestId('record-status')).toHaveText('未掌握')

    await page.getByTestId('record-reason').selectOption('form')
    await page.getByTestId('record-note').fill('下蹲时膝盖内扣，重心前移')
    await page.getByTestId('record-save').click()
    await expect(page.getByText('易错信息已保存')).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('record-reason')).toHaveValue('form')
    await expect(page.getByTestId('record-note')).toHaveValue('下蹲时膝盖内扣，重心前移')
  })

  test('复盘：连续三次做对变为已掌握，再出错回到未掌握', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await page.goto('/correction')
    const card = recordCard(page)

    for (const [streak, status] of [['1', '练习中'], ['2', '练习中'], ['3', '已掌握']]) {
      await card.getByTestId('review-fixed').click()
      await expect(card.getByTestId('card-streak')).toHaveText(streak)
      await expect(card.getByTestId('card-status')).toHaveText(status)
    }
    await expect(page.locator('[data-summary="mastered"] dd')).toHaveText('1')

    await card.getByTestId('review-recurred').click()
    await expect(card.getByTestId('card-status')).toHaveText('未掌握')
    await expect(card.getByTestId('card-streak')).toHaveText('0')
    await expect(card.getByTestId('card-error-count')).toHaveText('2')

    await page.reload()
    await expect(card.getByTestId('card-status')).toHaveText('未掌握')
  })

  test('只改笔记不会清零连续纠正次数', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await request.post(`${API}/wrong-book/${exerciseId}/review/`, { data: { outcome: 'fixed' } })
    await openDetail(page)
    await expect(page.getByTestId('record-status')).toHaveText('练习中')
    await page.getByTestId('record-note').fill('只改笔记')
    await page.getByTestId('record-save').click()
    await expect(page.getByText('易错信息已保存')).toBeVisible()
    const [record] = await wrongRecords(request)
    expect(record.success_streak).toBe(1)
    expect(record.mastery_status).toBe('practicing')
    expect(record.user_note).toBe('只改笔记')
  })

  test('移出易错本后纠正中心为空', async ({ page, request }) => {
    await reportWrong(request, exerciseId)
    await openDetail(page)
    await page.getByTestId('record-remove').click()
    await expect(page.getByTestId('record-status')).toHaveCount(0)
    await page.goto('/correction')
    await expect(page.getByTestId('wrong-empty')).toBeVisible()
  })

  test('保存失败时提示错误，界面保持原状', async ({ page }) => {
    await openDetail(page)
    await page.route('**/api/wrong-book/**/report/', (route) => route.abort())
    await answer(page, 'form', 'no')
    await page.getByTestId('self-check-save').click()
    await expect(page.getByText('无法连接服务器')).toBeVisible()
    await expect(page.getByTestId('record-status')).toHaveCount(0)
    // 回答还在，可以直接重试
    await expect(page.locator('[data-question="form"] input[value="no"]')).toBeChecked()
  })
})
