import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { MotionPlugin } from '@vueuse/motion'
import NProgress from 'nprogress'
import { createPinia } from 'pinia'
import { setupLayouts } from 'virtual:generated-layouts'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { routes } from 'vue-router/auto-routes'

import App from './App.vue'
import { i18n } from './modules/i18n'
import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'

const pinia = createPinia()
const routeRecords = setupLayouts(routes)
const router = createRouter({ routes: routeRecords, history: createWebHistory() })

router.beforeEach((to, from) => {
  if (to.path !== from.path)
    NProgress.start()
})

router.afterEach(() => {
  NProgress.done()
})

createApp(App)
  .use(MotionPlugin)
  .use(autoAnimatePlugin)
  .use(router)
  .use(pinia)
  .use(i18n)
  .mount('#app')
