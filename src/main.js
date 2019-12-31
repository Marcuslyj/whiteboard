import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'view-design/dist/styles/iview.css';
import './styles/index.scss';

Vue.config.productionTip = false;

import globalConf from '@/common/config';

import '@common/konvaPolyfill.js';

//全局都能访问的响应式数据
Vue.prototype.$globalConf = globalConf;

//用来通信
Vue.eventBus=new Vue();

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
