import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.scss'

Vue.config.productionTip = false

import globalConf from '@/common/config'

//全局都能访问的响应式数据
Vue.prototype.$globalConf=globalConf


new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
