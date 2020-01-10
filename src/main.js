import Vue from 'vue'
import 'view-design/dist/styles/iview.css'
import './styles/index.scss'
import '@common/konvaPolyfill'

import { Modal, Poptip, Row } from 'view-design'

import base from '@common/base'
import globalConf from '@/common/config'

import App from './App.vue'
import router from './router'
import api from '@/common/api'

Vue.config.productionTip = false
Vue.component('Modal', Modal)
Vue.component('Poptip', Poptip)
Vue.component('Row', Row)
Vue.prototype.$Modal = Modal

Vue.use(base)

// 全局都能访问的响应式数据
Vue.prototype.$globalConf = globalConf
Vue.prototype.$api = api

// 用来通信
Vue.eventBus = new Vue()


new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
