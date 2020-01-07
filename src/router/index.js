import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Whiteboard = () => import('../views/whiteBoard/WhiteBoard')
const Welcome = () => import('../views/welcome/Welcome')
export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome,
    },
    {
      path: '/whiteboard',
      name: 'whiteboard',
      component: Whiteboard,
    },
  ],

})
