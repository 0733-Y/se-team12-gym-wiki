<script setup>
// 工具（F04）：卡路里、营养素、1RM 三个计算器。全部在浏览器里计算，不调用任何接口（N03）。
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalorieTool from '@/components/tools/CalorieTool.vue'
import MacroTool from '@/components/tools/MacroTool.vue'
import OneRmTool from '@/components/tools/OneRmTool.vue'
import { useUiStore } from '@/stores/ui.js'

const TOOLS = [{ id: 'calories' }, { id: 'macros' }, { id: 'one-rm' }]

const ui = useUiStore()
const route = useRoute()
const router = useRouter()

// 当前工具放在地址栏里，刷新或分享链接时停在同一个工具；输入的数值不进地址栏
const active = computed(() => (TOOLS.some((tool) => tool.id === route.query.tool) ? route.query.tool : 'calories'))
const select = (id) => router.replace({ query: { tool: id === 'calories' ? undefined : id } })

// 从卡路里结果带到营养素计算器的热量，只存在内存里
const carriedCalories = ref(null)
function useCalories(value) {
  carriedCalories.value = value
  select('macros')
}
</script>

<template>
  <section class="page tools">
    <header>
      <h1>{{ ui.t('navTools') }}</h1>
      <p class="page-hint">{{ ui.t('notStoredNote') }}</p>
    </header>

    <div class="tools__tabs" role="tablist" :aria-label="ui.t('navTools')">
      <button
        v-for="tool in TOOLS"
        :id="`tab-${tool.id}`"
        :key="tool.id"
        type="button"
        role="tab"
        class="tools__tab"
        :class="{ 'is-active': active === tool.id }"
        :aria-selected="active === tool.id"
        :aria-controls="`panel-${tool.id}`"
        :data-testid="`tool-tab-${tool.id}`"
        @click="select(tool.id)"
      >
        {{ ui.t(`tool_${tool.id}_label`) }}
      </button>
    </div>

    <div :id="`panel-${active}`" class="tools__panel" role="tabpanel" :aria-labelledby="`tab-${active}`">
      <header>
        <h2>{{ ui.t(`tool_${active}_title`) }}</h2>
        <p class="page-hint">{{ ui.t(`tool_${active}_subtitle`) }}</p>
      </header>
      <!-- v-show 而不是 v-if：切换标签时保留各自已填的内容 -->
      <CalorieTool v-show="active === 'calories'" @use-calories="useCalories" />
      <MacroTool v-show="active === 'macros'" :calories="carriedCalories" />
      <OneRmTool v-show="active === 'one-rm'" />
    </div>
  </section>
</template>

<style scoped>
.tools > header,
.tools__panel > header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tools__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-1);
  padding: var(--space-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
}

.tools__tab {
  min-height: var(--touch);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.tools__tab.is-active {
  background: var(--surface);
  color: var(--accent);
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.15);
}

.tools__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tools__panel h2 {
  font-size: 1.25rem;
}

/* 三个计算器共用的布局（子组件里的类名） */
.tools__panel :deep(.tool) {
  display: grid;
  gap: var(--space-3);
  align-items: start;
}

.tools__panel :deep(.tool__form),
.tools__panel :deep(.tool__result) {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.tools__panel :deep(.tool__form) {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.tools__panel :deep(.tool__result h3) {
  font-size: 1.0625rem;
}

.tools__panel :deep(.segmented) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.tools__panel :deep(.segmented legend) {
  width: 100%;
  margin-bottom: var(--space-1);
  padding: 0;
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
}

.tools__panel :deep(.segmented label) {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: var(--touch);
  padding: 0 var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
}

.tools__panel :deep(.segmented label.is-checked) {
  border-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}

.tools__panel :deep(.segmented label:focus-within) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.tools__panel :deep(.segmented input) {
  accent-color: var(--accent);
}

.tools__panel :deep(.result-list) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
  margin: 0;
}

.tools__panel :deep(.result-list dt) {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.tools__panel :deep(.result-list dd) {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.tools__panel :deep(.result-list strong) {
  font-size: 1.25rem;
}

.tools__panel :deep(.result-list__main) {
  grid-column: 1 / -1;
}

.tools__panel :deep(.result-list__main strong) {
  color: var(--accent);
  font-size: 2rem;
}

.tools__panel :deep(.result-table) {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.tools__panel :deep(.result-table caption) {
  padding-bottom: var(--space-2);
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: left;
}

.tools__panel :deep(.result-table th),
.tools__panel :deep(.result-table td) {
  padding: var(--space-2);
  border-bottom: 1px solid var(--border);
  text-align: right;
}

.tools__panel :deep(.result-table th:first-child) {
  text-align: left;
}

.tools__panel :deep(.result-table thead th) {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

@media (min-width: 1120px) {
  .tools__panel :deep(.tool) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}
</style>
