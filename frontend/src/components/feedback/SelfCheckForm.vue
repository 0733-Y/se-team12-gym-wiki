<script setup>
// 训练后自检（F02）：6 道题 → 建议的错误原因 → 一键记入易错本。
import { computed, reactive, ref, watch } from 'vue'
import { SELF_CHECK_ANSWERS, SELF_CHECK_QUESTIONS, composeNote, evaluateSelfCheck } from '@/domain/selfCheck.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const props = defineProps({ exerciseId: { type: Number, required: true } })

const ui = useUiStore()
const wrongBook = useWrongBookStore()

const answers = reactive({})
const saving = ref(false)

const ANSWER_KEYS = { yes: 'selfCheckYes', no: 'selfCheckNo', unsure: 'selfCheckUnsure' }

const result = computed(() => evaluateSelfCheck(answers))
const record = computed(() => wrongBook.byExerciseId(props.exerciseId))

const resultTitle = computed(() => {
  if (result.value.hasIssue) {
    return ui.t('selfCheckIssueTitle', { reason: ui.t(`wrongReason_${result.value.suggestedReason}`) })
  }
  return ui.t(result.value.completed ? 'selfCheckPassedTitle' : 'selfCheckInProgressTitle')
})

const resultMessage = computed(() => {
  if (result.value.hasIssue) return ui.t(`wrongSuggestion_${result.value.suggestedReason}`)
  return ui.t(result.value.completed ? 'selfCheckPassedMessage' : 'selfCheckInProgressMessage')
})

function reset() {
  for (const key of Object.keys(answers)) delete answers[key]
}

// 换一个动作时清空上一个动作的回答
watch(() => props.exerciseId, reset)

async function saveToWrongBook() {
  if (!result.value.hasIssue || saving.value) return
  const reason = result.value.suggestedReason
  const line = ui.t('selfCheckNoteTemplate', {
    issues: result.value.issueIds.map((id) => ui.t(`selfCheckQuestion_${id}`)).join(' / '),
    reason: ui.t(`wrongReason_${reason}`),
  })
  saving.value = true
  try {
    await wrongBook.report(props.exerciseId, {
      error_category: reason,
      user_note: composeNote(record.value?.user_note, line),
    })
    ui.toast('selfCheckSaved', 'success')
    reset()
  } catch (err) {
    // 失败时回答保留，界面不变
    ui.toastError(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="self-check" data-testid="self-check">
    <header class="self-check__head">
      <div>
        <h2>{{ ui.t('selfCheckTitle') }}</h2>
        <p class="page-hint">{{ ui.t('selfCheckSubtitle') }}</p>
      </div>
      <button v-if="result.answered" type="button" class="btn btn--ghost" @click="reset">
        {{ ui.t('resetSelfCheck') }}
      </button>
    </header>

    <ol class="self-check__list">
      <li v-for="question in SELF_CHECK_QUESTIONS" :key="question.id" :data-question="question.id">
        <fieldset class="self-check__question">
          <legend>{{ ui.t(`selfCheckQuestion_${question.id}`) }}</legend>
          <div class="self-check__answers">
            <label
              v-for="answer in SELF_CHECK_ANSWERS"
              :key="answer"
              class="self-check__answer"
              :class="[`is-${answer}`, { 'is-checked': answers[question.id] === answer }]"
            >
              <input v-model="answers[question.id]" type="radio" :name="`self-check-${question.id}`" :value="answer" />
              {{ ui.t(ANSWER_KEYS[answer]) }}
            </label>
          </div>
        </fieldset>
      </li>
    </ol>

    <div
      v-if="result.answered"
      class="self-check__result"
      :class="{ 'is-warning': result.hasIssue, 'is-success': result.completed && !result.hasIssue }"
      data-testid="self-check-result"
      aria-live="polite"
    >
      <div>
        <span class="self-check__progress">
          {{ ui.t('selfCheckProgress', { answered: result.answered, total: result.total }) }}
        </span>
        <strong>{{ resultTitle }}</strong>
        <p>{{ resultMessage }}</p>
      </div>
      <button
        v-if="result.hasIssue"
        type="button"
        class="btn btn--primary"
        :disabled="saving"
        data-testid="self-check-save"
        @click="saveToWrongBook"
      >
        {{ saving ? ui.t('saving') : ui.t(record ? 'updateWrongBookFromSelfCheck' : 'addWrongBookFromSelfCheck') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.self-check {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.self-check__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.self-check__head h2 {
  font-size: 1.125rem;
}

.self-check__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.self-check__question {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}

.self-check__question legend {
  padding: 0;
  font-weight: 600;
}

.self-check__answers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.self-check__answer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 72px;
  min-height: var(--touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
}

.self-check__answer input {
  accent-color: var(--accent);
}

.self-check__answer.is-checked {
  border-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}

.self-check__answer.is-checked.is-no,
.self-check__answer.is-checked.is-unsure {
  border-color: var(--warning);
  background: var(--warning-soft);
}

.self-check__answer:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.self-check__result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border-left: 4px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.self-check__result.is-warning {
  border-left-color: var(--warning);
  background: var(--warning-soft);
}

.self-check__result.is-success {
  border-left-color: var(--success);
}

.self-check__result > div {
  display: flex;
  flex: 1 1 240px;
  flex-direction: column;
  gap: 2px;
}

.self-check__result p {
  margin: 0;
  color: var(--text-muted);
}

.self-check__progress {
  color: var(--text-muted);
  font-size: 0.8125rem;
}
</style>
