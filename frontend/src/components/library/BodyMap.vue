<script setup>
// 正面 + 背面肌肉图（body-muscles 的 SVG）。点击肌肉发出对应的细分肌群 id。
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BodyChart, ViewSide } from 'body-muscles'
import { BODY_REGIONS, MUSCLE_ID_TO_FILTER } from '@/data/muscleFilters.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  selected: { type: Array, default: () => [] }, // 要高亮的细分肌群 id
})
const emit = defineEmits(['select'])

const ui = useUiStore()
const frontHost = ref(null)
const backHost = ref(null)
let charts = []

function buildBodyState() {
  const state = {}
  for (const region of BODY_REGIONS) {
    if (!props.selected.includes(region.filterId)) continue
    for (const muscleId of region.muscles) state[muscleId] = { intensity: 8, selected: true }
  }
  return state
}

function onMuscleClick(muscleId) {
  const filterId = MUSCLE_ID_TO_FILTER[muscleId]
  if (filterId) emit('select', filterId)
  else ui.toast('noMuscleAction')
}

function destroy() {
  charts.forEach((chart) => chart.destroy())
  charts = []
}

function build() {
  destroy()
  if (!frontHost.value || !backHost.value) return
  const bodyState = buildBodyState()
  const options = (view, label) => ({ view, bodyState, showViewLabel: false, ariaLabel: label, onMuscleClick })
  charts = [
    new BodyChart(frontHost.value, options(ViewSide.FRONT, ui.t('front'))),
    new BodyChart(backHost.value, options(ViewSide.BACK, ui.t('back'))),
  ]
}

onMounted(build)
onBeforeUnmount(destroy)

watch(
  () => props.selected,
  () => {
    const bodyState = buildBodyState()
    charts.forEach((chart) => chart.update({ bodyState }))
  },
  { deep: true },
)
// 换语言后重建，更新无障碍标签
watch(() => ui.lang, build)
</script>

<template>
  <div class="body-map">
    <figure class="body-map__view">
      <figcaption>{{ ui.t('front') }}</figcaption>
      <div ref="frontHost" class="body-map__host" data-testid="body-map-front"></div>
    </figure>
    <figure class="body-map__view">
      <figcaption>{{ ui.t('back') }}</figcaption>
      <div ref="backHost" class="body-map__host" data-testid="body-map-back"></div>
    </figure>
  </div>
</template>

<style scoped>
.body-map {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.body-map__view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  margin: 0;
}

.body-map__view figcaption {
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
}

.body-map__host {
  width: 100%;
  max-width: 220px;
}

.body-map__host :deep(.body-chart-container) {
  width: 100%;
}

.body-map__host :deep(.body-chart-svg) {
  display: block;
  width: 100%;
  height: auto;
}

.body-map__host :deep(.body-chart-muscle) {
  cursor: pointer;
}

.body-map__host :deep(.body-chart-muscle:focus-visible) {
  outline: none;
  stroke: var(--accent);
  stroke-width: 0.6;
}
</style>
