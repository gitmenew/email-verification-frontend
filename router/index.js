import { createRouter, createWebHistory } from 'vue-router'
import CaptchaGate from '../views/CaptchaGate.vue'
import EmailVerify from '../views/EmailVerification.vue'

const routes = [
  { path: '/', component: CaptchaGate },
  { path: '/verify', component: EmailVerify }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
