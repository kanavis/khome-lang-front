import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VocabularyView from '../views/VocabularyView.vue'
import {
  afterAuthRedirect,
  authByCode,
  authRedirect,
  checkAuth,
  ensureUserData,
} from '@/helpers/auth'
import { setGlobalError } from '@/helpers/error'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: VocabularyView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!checkAuth()) {
      await authRedirect()
      next(new Error('Auth redirect pending'))
    } else {
      await ensureUserData()
      next()
    }
  } else if (to.path == '/oauth/callback') {
    const code = Array.isArray(to.query.code) ? to.query.code[0] : to.query.code
    const state = Array.isArray(to.query.state) ? to.query.state[0] : to.query.state
    if (typeof code === 'string' && typeof state === 'string') {
      if (await authByCode(code, state)) {
        afterAuthRedirect()
      }
    } else {
      setGlobalError('auth', 'Invalid auth code or state')
    }
    next(new Error('Auth callback pending'))
  } else {
    next()
  }
})

export default router
