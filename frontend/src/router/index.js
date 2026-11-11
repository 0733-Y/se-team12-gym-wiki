import { createRouter, createWebHistory } from 'vue-router'
import LibraryView from '@/views/LibraryView.vue'

export const NAV_ITEMS = [
  { name: 'library', path: '/library', labelKey: 'navLibrary' },
  { name: 'correction', path: '/correction', labelKey: 'navCorrection' },
  { name: 'plans', path: '/plans', labelKey: 'navPlans' },
  { name: 'logs', path: '/logs', labelKey: 'navLogs' },
  { name: 'tools', path: '/tools', labelKey: 'navTools' },
]

const routes = [
  { path: '/', redirect: '/library' },
  { path: '/library', name: 'library', component: LibraryView },
  { path: '/library/:id(\\d+)', name: 'exercise-detail', component: () => import('@/views/ExerciseDetailView.vue'), props: true },
  { path: '/correction', name: 'correction', component: () => import('@/views/CorrectionView.vue') },
  { path: '/plans', name: 'plans', component: () => import('@/views/PlanView.vue') },
  { path: '/logs', name: 'logs', component: () => import('@/views/LogView.vue') },
  { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/library' },
]

// 工厂函数：测试里每次建一个新的路由实例
export function createAppRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 }),
  })
}

export default createAppRouter()
