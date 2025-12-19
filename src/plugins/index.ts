/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import i18n from './i18n'
import { toastifyOptions, Vue3Toastify } from './toast'
import store from '../stores'
import router from '../router'
import VueApexCharts from 'vue3-apexcharts'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {
  app.use(vuetify)
  app.use(router)
  app.use(store)
  app.use(i18n)
  app.use(VueApexCharts)
  app.use(Vue3Toastify, toastifyOptions)
}
