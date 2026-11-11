import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// P0 只有占位页；P3 换成 /library、/correction、/plans、/logs、/tools
const routes = [{ path: '/', name: 'home', component: HomeView }]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
