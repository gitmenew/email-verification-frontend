import { createRouter, createWebHistory } from 'vue-router'
import CaptchaGate from '../views/CaptchaGate.vue'
import EmailVerification from '../views/EmailVerification.vue'

const routes = [
  { path: '/', name: 'Captcha', component: CaptchaGate },
  { path: '/verify', name: 'Verify', component: EmailVerification, meta: { requiresCaptcha: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const passedCaptcha = sessionStorage.getItem('captcha_passed') === 'true'
  if (to.meta.requiresCaptcha && !passedCaptcha) {
    return next('/')
  }
  next()
})

export default router
