<script setup>
// 纠正中心（F02）：易错本汇总、错误原因分布、各原因的纠正建议、待复盘动作。
import { computed, onMounted } from 'vue'
import ReasonChart from '@/components/feedback/ReasonChart.vue'
import WrongRecordCard from '@/components/feedback/WrongRecordCard.vue'
import ApiStatusBanner from '@/components/layout/ApiStatusBanner.vue'
import { WRONG_REASON_OPTIONS, sortRecords, summarize } from '@/domain/selfCheck.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const ui = useUiStore()
const wrongBook = useWrongBookStore()

// 每次进入都重新取，保证和服务器一致
onMounted(() => wrongBook.load())

const summary = computed(() => summarize(wrongBook.records))
const sorted = computed(() => sortRecords(wrongBook.records))

const SUMMARY_ITEMS = [
  { key: 'total', labelKey: 'wrongTotal' },
  { key: 'unfixed', labelKey: 'unfixedCount' },
  { key: 'practicing', labelKey: 'practicingCount' },
  { key: 'mastered', labelKey: 'masteredCount' },
]
</script>

<template>
  <section class="page correction">
    <header>
      <h1>{{ ui.t('navCorrection') }}</h1>
      <p class="page-hint">{{ ui.t('correctionHeroSubtitle') }}</p>
    </header>

    <ApiStatusBanner :error="wrongBook.error" :busy="wrongBook.status === 'loading'" @retry="wrongBook.load()" />

    <dl class="correction__summary" data-testid="wrong-summary">
      <div v-for="item in SUMMARY_ITEMS" :key="item.key" :data-summary="item.key">
        <dt>{{ ui.t(item.labelKey) }}</dt>
        <dd>{{ summary[item.key] }}</dd>
      </div>
    </dl>

    <section class="correction__list">
      <h2>{{ ui.t('correctionCardsTitle') }}</h2>

      <p v-if="wrongBook.status === 'loading' && !sorted.length" class="page-hint">{{ ui.t('loading') }}</p>

      <div v-else-if="wrongBook.status === 'ready' && !sorted.length" class="correction__empty" data-testid="wrong-empty">
        <strong>{{ ui.t('noCorrectionTitle') }}</strong>
        <span>{{ ui.t('noCorrectionMessage') }}</span>
        <RouterLink class="btn" to="/library">{{ ui.t('navLibrary') }}</RouterLink>
      </div>

      <ul v-else class="correction__cards">
        <li v-for="record in sorted" :key="record.id">
          <WrongRecordCard :record="record" />
        </li>
      </ul>
    </section>

    <div class="correction__panels">
      <section class="panel">
        <h2>{{ ui.t('reasonStatsTitle') }}</h2>
        <ReasonChart :records="wrongBook.records" />
      </section>

      <section class="panel">
        <h2>{{ ui.t('correctionSuggestions') }}</h2>
        <dl class="correction__tips">
          <div v-for="reason in WRONG_REASON_OPTIONS" :key="reason.id">
            <dt>{{ ui.t(`wrongReason_${reason.id}`) }}</dt>
            <dd>{{ ui.t(`wrongSuggestion_${reason.id}`) }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </section>
</template>

<style scoped>
.correction header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.correction__summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin: 0;
}

.correction__summary > div {
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.correction__summary dt {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.correction__summary dd {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.correction__panels {
  display: grid;
  gap: var(--space-3);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.panel h2,
.correction__list h2 {
  font-size: 1.125rem;
}

.correction__tips {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.correction__tips dt {
  font-weight: 600;
}

.correction__tips dd {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.correction__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.correction__cards {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.correction__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  text-align: center;
}

.correction__empty strong {
  color: var(--text);
}

@media (min-width: 720px) {
  .correction__summary {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1120px) {
  .correction__panels {
    grid-template-columns: 1fr 1fr;
  }

  .correction__cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
