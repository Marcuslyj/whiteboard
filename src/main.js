import Vue from 'vue'
import 'view-design/dist/styles/iview.css'
import './styles/index.scss'
import '@common/konvaPolyfill'

import {
  Modal, Poptip, Row, Message, Tabs, TabPane, Icon, Input, Tooltip,
} from 'view-design'

import base from '@common/base'
import globalConf from '@/common/config'

import api from '@/common/api'
import App from './App.vue'
import router from './router'


const components = {
  Modal, Poptip, Row, Message, Tabs, TabPane, Icon, Input, Tooltip,
}

Object.keys(components).forEach((e) => {
  Vue.component(e, components[e])
})

Vue.config.productionTip = false
Vue.prototype.$Modal = Modal
Vue.prototype.$Message = Message


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
