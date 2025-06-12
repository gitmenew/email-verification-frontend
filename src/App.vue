<template>
  <div v-if="!captchaToken" class="gate-container">
    <main>
      <div class="instructions">
        <p>{{ $t('checking') }}</p>
        <div class="cf-turnstile" data-sitekey="0x4AAAAAABgei6QZruCN7n08"></div>
      </div>
    </main>
  </div>

  <div v-else class="background">
    <div class="toto-container">
      <div class="header">
        <div class="logo-text"><span class="success-check">⼈</span></div>
      </div>

      <div class="content">
        <p><strong>{{ $t('confirm_email') }}</strong></p>

        <div class="form-wrapper">
          <input
            id="honeypot"
            v-model="honeypot"
            type="text"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="visually-hidden"
          />
          <input
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('placeholder_email')"
            required
            class="email-input"
            :disabled="loading"
          />
          <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>
          <button @click="submitForm" :disabled="loading" class="action-button">
            {{ loading ? $t('Loading..') : $t('Submit') }}
          </button>
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
let turnstileRendered = false

onMounted(async () => {
  await nextTick()
  if (window.turnstile && !turnstileRendered) {
    window.turnstile.render('.cf-turnstile', {
      sitekey: '0x4AAAAAABgei6QZruCN7n08',
      callback: token => { captchaToken.value = token },
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
    if (data.redirectUrl) setTimeout(() => { window.location.href = data.redirectUrl }, 1000)
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>
