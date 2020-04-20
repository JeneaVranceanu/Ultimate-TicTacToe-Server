import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import VueRouter from 'vue-router'
import NavBarComponent from './components/NavBarComponent.vue'
import MainScreenComponent from './components/MainScreenComponent.vue'
import StartScreenComponent from './components/StartScreenComponent.vue'
import GameScreenComponent from './components/GameScreenComponent.vue'
import router from './router'

Vue.config.productionTip = false
Vue.use(VueRouter);
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})

// const router = new VueRouter({
//   mode: 'history',
//   base: '/',
//   routes: [
//     { path: "/", component: StartScreenComponent },
//     { path: "/main", component: MainScreenComponent },
//     { path: "/game", component: GameScreenComponent },
//   ],
// })

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')