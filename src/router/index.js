import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const  whiteBoard= () => import('../views/whiteBoard/WhiteBoard')
const  Welcome= () => import('../views/welcome/Welcome')
export default new Router({
    routes: [
        {
            path:'/',
            redirect:'/welcome'
        },
        {
            path:'/welcome',
            component:Welcome
        },
        {
            path:'/whiteBoard',
            component:whiteBoard
        }
    ]
    
})