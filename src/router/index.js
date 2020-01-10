import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Whiteboard = () => import('../views/whiteBoard/WhiteBoard')
const Welcome = () => import('../views/welcome/Welcome')
const Authority = () => import('../views/authority/Authority')
const AuthorityLogin = () => import('../views/authority/Login')
const AuthorityMeeting = () => import('../views/authority/Meeting')
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
    {
      path: '/authority',
      name: 'authority',
      component: Authority,
      children: [{
        path: '/',
        redirect: '/authority/login'
      }, {
        path: 'login',
        name: 'login',
        component: AuthorityLogin
      }, {
        path: 'meeting',
        name: 'meeting',
        component: AuthorityMeeting
      }]
    },
  ],

})
