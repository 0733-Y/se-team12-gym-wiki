<script setup>
// 卡路里计算器（F04）。输入只留在组件内存里，不上传、不落盘（N03）。
import { computed, reactive } from 'vue'
import NumberField from './NumberField.vue'
import { formatNumber } from './fieldError.js'
import { ACTIVITY_LEVELS, CALORIE_GOALS, calcCalories } from '@/domain/calculators/calorie.js'
import { useUiStore } from '@/stores/ui.js'

defineEmits(['use-calories'])

const ui = useUiStore()

const form = reactive({
  gender: 'male', units: 'metric', age: '25', height: '175', weight: '70', activity: 'sedentary', goal: 'maintain',
})

const result = computed(() => calcCalories(form))
const errors = computed(() => result.value.errors || {})

const ACTIVITY_KEYS = {
  sedentary: 'activitySedentary', light: 'activityLight', moderate: 'activityModerate',
  high: 'activityHigh', athlete: 'activityAthlete',
}
const GOAL_KEYS = { fatLoss: 'goalFatLoss', maintain: 'goalMaintain', leanGain: 'goalLeanGain', fastGain: 'goalFastGain' }

// 切换单位时把已填的身高体重换成新单位下合理的默认值，避免 175 被当成 175 英寸
function setUnits(units) {
  if (form.units === units) return
  form.units = units
  form.height = units === 'metric' ? '175' : '69'
  form.weight = units === 'metric' ? '70' : '154'
}

const signed = (value) => (value > 0 ? `+${value}` : String(value))
</script>

<template>
  <div class="tool" data-testid="calorie-tool">
    <form class="tool__form" novalidate @submit.prevent>
      <fieldset class="segmented">
        <legend>{{ ui.t('gender') }}</legend>
        <label v-for="gender in ['male', 'female']" :key="gender" :class="{ 'is-checked': form.gender === gender }">
          <input v-model="form.gender" type="radio" name="calorie-gender" :value="gender" />
          {{ ui.t(gender) }}
        </label>
      </fieldset>

      <fieldset class="segmented">
        <legend>{{ ui.t('units') }}</legend>
        <label
          v-for="units in ['metric', 'imperial']"
          :key="units"
          :class="{ 'is-checked': form.units === units }"
          :data-testid="`units-${units}`"
        >
          <input type="radio" name="calorie-units" :value="units" :checked="form.units === units" @change="setUnits(units)" />
          {{ ui.t(units === 'metric' ? 'unitMetric' : 'unitImperial') }}
        </label>
      </fieldset>

      <NumberField id="calorie-age" v-model="form.age" :label="ui.t('age')" step="1" :error="errors.age" />
      <NumberField
        id="calorie-height"
        v-model="form.height"
        :label="ui.t('height')"
        :unit="form.units === 'metric' ? 'cm' : 'in'"
        :error="errors.height"
      />
      <NumberField
        id="calorie-weight"
        v-model="form.weight"
        :label="ui.t('weight')"
        :unit="form.units === 'metric' ? 'kg' : 'lb'"
        :error="errors.weight"
      />

      <label class="field">
        <span>{{ ui.t('activityLevel') }}</span>
        <select v-model="form.activity" data-testid="calorie-activity">
          <option v-for="level in ACTIVITY_LEVELS" :key="level.id" :value="level.id">
            {{ ui.t(ACTIVITY_KEYS[level.id]) }} · ×{{ level.factor }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>{{ ui.t('goal') }}</span>
        <select v-model="form.goal" data-testid="calorie-goal">
          <option v-for="goal in CALORIE_GOALS" :key="goal.id" :value="goal.id">
            {{ ui.t(GOAL_KEYS[goal.id]) }} · {{ signed(goal.adjustment) }} {{ ui.t('kcalUnit') }}
          </option>
        </select>
      </label>
    </form>

    <section class="tool__result" aria-live="polite" data-testid="calorie-result">
      <h3>{{ ui.t('resultTitle') }}</h3>
      <template v-if="result.ok">
        <dl class="result-list">
          <div class="result-list__main">
            <dt>{{ ui.t('dailyCaloriesSuggestion') }}</dt>
            <dd>
              <strong data-testid="calorie-target">{{ formatNumber(result.target) }}</strong> {{ ui.t('kcalPerDay') }}
            </dd>
          </div>
          <div>
            <dt>{{ ui.t('bmrLabel') }}</dt>
            <dd><strong data-testid="calorie-bmr">{{ formatNumber(result.bmr) }}</strong> {{ ui.t('kcalUnit') }}</dd>
          </div>
          <div>
            <dt>{{ ui.t('tdeeLabel') }}</dt>
            <dd><strong data-testid="calorie-tdee">{{ formatNumber(result.tdee) }}</strong> {{ ui.t('kcalUnit') }}</dd>
          </div>
          <div>
            <dt>{{ ui.t('goalAdjustment') }}</dt>
            <dd><strong>{{ signed(result.adjustment) }}</strong> {{ ui.t('kcalUnit') }}</dd>
          </div>
        </dl>
        <button type="button" class="btn" data-testid="use-in-macros" @click="$emit('use-calories', Math.round(result.target))">
          {{ ui.t('useInMacros') }}
        </button>
      </template>
      <p v-else class="page-hint" data-testid="calorie-invalid">{{ ui.t('fixInputsHint') }}</p>
    </section>
  </div>
</template>
