import Vue from 'vue'
import Router from 'vue-router'
import StartScreenComponent from '@/components/StartScreenComponent.vue'
import MainScreenComponent from '@/components/MainScreenComponent.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: StartScreenComponent
    },
    {
      path: '/main',
      component: MainScreenComponent
    }
  ]
})