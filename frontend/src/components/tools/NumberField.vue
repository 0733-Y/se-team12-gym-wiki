<script setup>
// 带单位和字段错误的数字输入框。三个计算器共用。
import { computed } from 'vue'
import { fieldErrorText } from './fieldError.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: '' },
  unit: { type: String, default: '' },
  error: { type: Object, default: null }, // { code, min?, max? }
  step: { type: String, default: 'any' },
})
defineEmits(['update:modelValue'])

const ui = useUiStore()
const message = computed(() => fieldErrorText(ui, props.error))
</script>

<template>
  <div class="field number-field" :class="{ 'has-error': error }">
    <label :for="id">{{ label }}</label>
    <div class="number-field__control">
      <input
        :id="id"
        type="number"
        inputmode="decimal"
        :step="step"
        :value="modelValue"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="error ? `${id}-error` : undefined"
        :data-testid="id"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span v-if="unit" class="number-field__unit">{{ unit }}</span>
    </div>
    <span v-if="error" :id="`${id}-error`" class="field__error" role="alert" :data-testid="`${id}-error`">
      {{ message }}
    </span>
  </div>
</template>

<style scoped>
.number-field label {
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
}

.number-field__control {
  position: relative;
}

.number-field__control input {
  padding-right: 3.25rem;
  font-variant-numeric: tabular-nums;
}

.number-field__unit {
  position: absolute;
  top: 50%;
  right: var(--space-3);
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.875rem;
  pointer-events: none;
}

.number-field.has-error input {
  border-color: var(--danger);
}

.field__error {
  font-size: 0.8125rem;
}
</style>
