import Router from 'vue-router'
import Home from '../components/PollList.vue'

const routes = [
  {
    path: '/',
    name: 'poll-list',
    component: Home
  },
  {
    path: '/new-poll',
    name: 'poll-create',
    component: () => import('../components/PollForm.vue')
  },
  {
    path: '/edit-poll/:id',
    name: 'poll-edit',
    component: () => import('../components/PollForm.vue')
  }
]
const router = new Router({
  routes
})
export default router