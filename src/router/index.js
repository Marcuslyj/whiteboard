import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Authority = () => import('../views/authority/Authority')
const AuthorityLogin = () => import('../views/authority/Login')
const Meeting = () => import('../views/meeting/Meeting')
const CreateMeeting = () => import('../views/meeting/CreateMeeting')
const MyMeeting = () => import('../views/meeting/MyMeeting')
const HistoryMeeting = () => import('../views/meeting/HistoryMeeting')
const DocList = () => import('../views/meeting/DocList')
const WhiteboardIndex = () => import('../views/whiteboard/Index')
const Drawingboard = () => import('../views/whiteboard/drawingboard/Drawingboard')
const Doc = () => import('../views/whiteboard/doc/Doc')

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/auth',
    },
    {
      path: '/auth',
      component: Authority,
      children: [{
        path: '/',
        redirect: '/auth/login',
      },
      {
        path: 'login/:mid?/:link?',
        name: 'login',
        component: AuthorityLogin,
      }],
    },
    {
      path: '/meeting',
      name: 'meeting',
      component: Meeting,
      children: [
        {
          path: '/',
          redirect: 'create',
        },
        {
          path: 'create',
          name: 'create',
          component: CreateMeeting,
        },
        {
          path: 'myMeeting',
          name: 'myMeeting',
          component: MyMeeting,
        },
        {
          path: 'historyMeeting',
          name: 'historyMeeting',
          component: HistoryMeeting,
        },
        {
          path: 'docList',
          name: 'docList',
          component: DocList,
        },
      ],
    },
    {
      path: '/:meetingId/whiteboard',
      name: 'whiteboard',
      component: WhiteboardIndex,
      children: [
        {
          path: '/',
          redirect: 'drawingboard',
        },
        {
          path: 'drawingboard',
          name: 'drawingboard',
          component: Drawingboard,
        },
        {
          path: 'doc',
          name: 'doc',
          component: Doc,
        },
      ],
    },

  ],

})
