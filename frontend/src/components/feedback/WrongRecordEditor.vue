<script setup>
// 易错本编辑（F02）：不在易错本时手动加入；已在时改原因、笔记、状态、优先提醒，或移出。
// 次数类字段只显示，由服务器的状态机维护。
import { computed, reactive, ref, watch } from 'vue'
import { MASTERY_STATUS_OPTIONS, WRONG_REASON_OPTIONS } from '@/domain/selfCheck.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const props = defineProps({ exerciseId: { type: Number, required: true } })

const ui = useUiStore()
const wrongBook = useWrongBookStore()

const record = computed(() => wrongBook.byExerciseId(props.exerciseId))
const form = reactive({ error_category: 'form', user_note: '', mastery_status: 'unfixed', priority_remind: true })
const busy = ref(false)

// 记录变化（加载完成、自检写入、复盘）后，用服务器的值重置表单
watch(
  record,
  (value) => {
    form.error_category = value?.error_category ?? 'form'
    form.user_note = value?.user_note ?? ''
    form.mastery_status = value?.mastery_status ?? 'unfixed'
    form.priority_remind = value?.priority_remind ?? true
  },
  { immediate: true },
)

async function run(action, successKey) {
  if (busy.value) return
  busy.value = true
  try {
    await action()
    ui.toast(successKey, 'success')
  } catch (err) {
    ui.toastError(err)
  } finally {
    busy.value = false
  }
}

const add = () =>
  run(
    () => wrongBook.report(props.exerciseId, { error_category: form.error_category, user_note: form.user_note.trim() }),
    'addedWrongBook',
  )

// 只提交改过的字段：服务器在收到 mastery_status 时会按规则重置连续纠正次数，
// 所以只改笔记时不能把没变的状态也带上
function changedFields() {
  const next = { ...form, user_note: form.user_note.trim() }
  return Object.fromEntries(Object.entries(next).filter(([key, value]) => value !== record.value[key]))
}

const save = () => run(() => wrongBook.edit(props.exerciseId, changedFields()), 'wrongBookSaved')

const review = (outcome) =>
  run(() => wrongBook.review(props.exerciseId, outcome), outcome === 'fixed' ? 'reviewFixedSaved' : 'reviewWrongSaved')

const remove = () => run(() => wrongBook.remove(props.exerciseId), 'removedWrongBook')
</script>

<template>
  <section class="record-editor" data-testid="wrong-record-editor">
    <header class="record-editor__head">
      <h2>{{ ui.t('wrongBook') }}</h2>
      <span v-if="record" class="badge" :class="`badge--${record.mastery_status}`" data-testid="record-status">
        {{ ui.t(`mastery_${record.mastery_status}`) }}
      </span>
    </header>

    <p v-if="!record" class="page-hint">{{ ui.t('wrongBookAddHint') }}</p>

    <dl v-else class="record-editor__counts">
      <div>
        <dt>{{ ui.t('errorCount') }}</dt>
        <dd data-testid="record-error-count">{{ record.error_count }}</dd>
      </div>
      <div>
        <dt>{{ ui.t('reviewCount') }}</dt>
        <dd>{{ record.review_count }}</dd>
      </div>
      <div>
        <dt>{{ ui.t('successStreak') }}</dt>
        <dd>{{ record.success_streak }}</dd>
      </div>
    </dl>

    <div v-if="record" class="record-editor__review">
      <p>{{ ui.t('reviewPrompt') }}</p>
      <div class="record-editor__actions">
        <button type="button" class="btn" :disabled="busy" data-testid="review-fixed" @click="review('fixed')">
          {{ ui.t('fixedThisTime') }}
        </button>
        <button type="button" class="btn" :disabled="busy" data-testid="review-recurred" @click="review('recurred')">
          {{ ui.t('stillWrong') }}
        </button>
      </div>
    </div>

    <form class="record-editor__form" @submit.prevent="record ? save() : add()">
      <label class="field">
        <span>{{ ui.t('wrongReason') }}</span>
        <select v-model="form.error_category" data-testid="record-reason">
          <option v-for="option in WRONG_REASON_OPTIONS" :key="option.id" :value="option.id">
            {{ ui.t(`wrongReason_${option.id}`) }}
          </option>
        </select>
      </label>

      <label v-if="record" class="field">
        <span>{{ ui.t('masteryStatus') }}</span>
        <select v-model="form.mastery_status" data-testid="record-status-select">
          <option v-for="option in MASTERY_STATUS_OPTIONS" :key="option.id" :value="option.id">
            {{ ui.t(`mastery_${option.id}`) }}
          </option>
        </select>
      </label>

      <label class="field field--wide">
        <span>{{ ui.t('wrongBookPlaceholder') }}</span>
        <textarea v-model="form.user_note" rows="3" maxlength="2000" data-testid="record-note"></textarea>
      </label>

      <label v-if="record" class="check field--wide">
        <input v-model="form.priority_remind" type="checkbox" />
        {{ ui.t('priorityRemind') }}
      </label>

      <div class="record-editor__actions field--wide">
        <button type="submit" class="btn btn--primary" :disabled="busy" data-testid="record-save">
          {{ busy ? ui.t('saving') : ui.t(record ? 'saveWrongBook' : 'addWrongBook') }}
        </button>
        <button v-if="record" type="button" class="btn btn--danger" :disabled="busy" data-testid="record-remove" @click="remove">
          {{ ui.t('removeWrongBook') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.record-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.record-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.record-editor__head h2 {
  font-size: 1.125rem;
}

.record-editor__counts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin: 0;
}

.record-editor__counts dt {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.record-editor__counts dd {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.record-editor__form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
}

.record-editor__review {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.record-editor__review p {
  margin: 0;
  font-weight: 600;
}

.field--wide {
  grid-column: 1 / -1;
}

.record-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
