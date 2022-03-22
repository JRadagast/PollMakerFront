import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Buefy from 'buefy'
import "buefy/dist/buefy.css";
import VueCryptojs from 'vue-cryptojs'
import VueRouter from 'vue-router'
import VueApexCharts from 'vue-apexcharts'

Vue.use(VueApexCharts)

Vue.component('apex-chart', VueApexCharts)

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.use(VueCryptojs)
Vue.use(VueRouter)
Vue.use(Buefy)


import Home from './components/PollList.vue'

const rotas = [
  {
    path: '/',
    name: 'poll-list',
    component: Home
  },
  {
    path: '/new-poll',
    name: 'poll-create',
    component: () => import('./components/PollForm.vue')
  },
  {
    path: '/edit-poll/:id',
    name: 'poll-edit',
    component: () => import('./components/PollForm.vue')
  },
  {
    path: '/answer-poll/:idpoll',
    name: 'poll-answer',
    component: () => import('./components/PollAnswer.vue')
  },
  {
    path: '/poll-answered',
    name: 'poll-answered',
    component: () => import('./components/PollAnswered.vue')
  },
  {
    path: '/poll/vincular',
    name: 'poll-vincular-user',
    component: () => import('./components/PollVincular.vue')
  },
]
const router = new VueRouter({
  mode: 'history',
  routes: rotas,
  user: {}
})

new Vue({
  router,
  render: h => h(App),

  data: {
    user: null,
  }
}).$mount('#app')
