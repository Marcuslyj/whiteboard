import Vue from 'vue'
import 'view-design/dist/styles/iview.css'
import './styles/index.scss'
import '@common/konvaPolyfill'

import { Modal } from 'view-design'

import base from '@common/base'
import globalConf from '@/common/config'

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.component('Modal', Modal)
Vue.prototype.$Modal = Modal

Vue.use(base)

// 全局都能访问的响应式数据
Vue.prototype.$globalConf = globalConf

// 用来通信
Vue.eventBus = new Vue()

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
