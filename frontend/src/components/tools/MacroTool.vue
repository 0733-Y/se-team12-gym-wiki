<script setup>
// 营养素计算器（F04）。输入只留在组件内存里（N03）。
import { computed, reactive, watch } from 'vue'
import NumberField from './NumberField.vue'
import { formatNumber } from './fieldError.js'
import { MACRO_PLANS, calcMacros } from '@/domain/calculators/macro.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  calories: { type: Number, default: null }, // 从卡路里计算器带过来的热量
})

const ui = useUiStore()
const form = reactive({ plan: 'balanced', calories: '2000', meals: '3' })

watch(
  () => props.calories,
  (value) => {
    if (value) form.calories = String(value)
  },
  { immediate: true },
)

const result = computed(() => calcMacros(form))
const errors = computed(() => result.value.errors || {})
const NUTRIENTS = ['carbs', 'protein', 'fat']
</script>

<template>
  <div class="tool" data-testid="macro-tool">
    <form class="tool__form" novalidate @submit.prevent>
      <label class="field">
        <span>{{ ui.t('macroPlanLabel') }}</span>
        <select v-model="form.plan" data-testid="macro-plan">
          <option v-for="plan in MACRO_PLANS" :key="plan.id" :value="plan.id">
            {{ ui.t(`macroPlan_${plan.id}`) }} · {{ plan.carbs }} / {{ plan.protein }} / {{ plan.fat }}
          </option>
        </select>
      </label>
      <NumberField
        id="macro-calories"
        v-model="form.calories"
        :label="ui.t('dailyCalories')"
        :unit="ui.t('kcalUnit')"
        :error="errors.calories"
      />
      <NumberField id="macro-meals" v-model="form.meals" :label="ui.t('mealsPerDay')" step="1" :error="errors.meals" />
    </form>

    <section class="tool__result" aria-live="polite" data-testid="macro-result">
      <h3>{{ ui.t('macroBreakdown') }}</h3>
      <table v-if="result.ok" class="result-table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">%</th>
            <th scope="col">{{ ui.t('perMeal') }}</th>
            <th scope="col">{{ ui.t('perDayUnit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nutrient in NUTRIENTS" :key="nutrient" :data-nutrient="nutrient">
            <th scope="row">{{ ui.t(nutrient) }}</th>
            <td>{{ result.plan[nutrient] }}</td>
            <td><strong data-testid="per-meal">{{ formatNumber(result.perMeal[nutrient]) }}</strong> g</td>
            <td><span data-testid="per-day">{{ formatNumber(result.perDay[nutrient]) }}</span> g</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="page-hint" data-testid="macro-invalid">{{ ui.t('fixInputsHint') }}</p>
    </section>
  </div>
</template>
