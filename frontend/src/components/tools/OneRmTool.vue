<script setup>
// 1RM 计算器（F04）。输入只留在组件内存里（N03）。
import { computed, reactive } from 'vue'
import NumberField from './NumberField.vue'
import { formatNumber } from './fieldError.js'
import { calcOneRm } from '@/domain/calculators/oneRm.js'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
// 单位只是标签：输入多少单位，结果就是多少单位
const form = reactive({ units: 'kg', weight: '100', reps: '5' })

const result = computed(() => calcOneRm(form))
const errors = computed(() => result.value.errors || {})
</script>

<template>
  <div class="tool" data-testid="one-rm-tool">
    <form class="tool__form" novalidate @submit.prevent>
      <fieldset class="segmented">
        <legend>{{ ui.t('units') }}</legend>
        <label v-for="units in ['kg', 'lb']" :key="units" :class="{ 'is-checked': form.units === units }">
          <input v-model="form.units" type="radio" name="one-rm-units" :value="units" />
          {{ units }}
        </label>
      </fieldset>
      <NumberField
        id="one-rm-weight"
        v-model="form.weight"
        :label="ui.t('liftedWeight')"
        :unit="form.units"
        :error="errors.weight"
      />
      <NumberField
        id="one-rm-reps"
        v-model="form.reps"
        :label="ui.t('repsCompleted')"
        :unit="ui.t('repsUnit')"
        step="1"
        :error="errors.reps"
      />
    </form>

    <section class="tool__result" aria-live="polite" data-testid="one-rm-result">
      <h3>{{ ui.t('resultTitle') }}</h3>
      <template v-if="result.ok">
        <dl class="result-list">
          <div class="result-list__main">
            <dt>{{ ui.t('estimatedOneRm') }}</dt>
            <dd>
              <strong data-testid="one-rm-value">{{ formatNumber(result.oneRm, 1) }}</strong> {{ form.units }}
            </dd>
          </div>
        </dl>
        <table class="result-table">
          <caption>{{ ui.t('percentTableTitle') }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ ui.t('percentOfOneRm') }}</th>
              <th scope="col">{{ ui.t('liftedWeight') }} ({{ form.units }})</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in result.percentages" :key="row.percent" :data-percent="row.percent">
              <th scope="row">{{ row.percent }}%</th>
              <td>{{ formatNumber(row.weight, 1) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <p v-else class="page-hint" data-testid="one-rm-invalid">{{ ui.t('fixInputsHint') }}</p>
    </section>
  </div>
</template>
