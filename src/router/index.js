import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import Manage from '../views/Manage.vue'
import Song from '../views/Song.vue'
import { useUserStore } from '../stores/users'

const Home = () => import('../views/HomeView.vue') // Dynamic Route Imports that make switching between components faster

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'about',
    path: '/about',
    component: AboutView
  },
  {
    name: 'manage',
    alias: '/manage',
    path: '/manage-music',
    component: Manage,
    beforeEnter: (to, from, next) => {
      next()
    },
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'song',
    path: '/song/:id',
    component: Song
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
  linkExactActiveClass: 'text-green-500' // when a link you clicked is active, it turns yellow
})

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  const store = useUserStore()

  if (store.userLoggedIn) {
    next()
  } else {
    next({ name: 'home' })
  }
})

export default router
