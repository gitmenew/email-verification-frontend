<template>
  <div class="captcha-wrapper">
    <h2>Security Check</h2>
    <div
      class="cf-turnstile"
      ref="captchaEl"
      data-sitekey="0x4AAAAAABgei6QZruCN7n08"
      data-callback="onCaptchaSuccess"
    ></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function onCaptchaSuccess(token) {
  // Optionally verify on backend (recommended), then redirect:
  router.push('/verify') // your email verification page route
}

onMounted(() => {
  // Define callback globally for Turnstile
  window.onCaptchaSuccess = onCaptchaSuccess
})
</script>

<style scoped>
.captcha-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  font-family: Arial, sans-serif;
}
</style>
