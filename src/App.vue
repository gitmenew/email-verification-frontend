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
            {{ loading ? $t('submitting') : $t('submit') }}
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
    const res = await fetch(``${import.meta.env.VITE_API_BASE}/api/check-email``, {
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









<style scoped>
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #FAF9F6;
  color: #000;
}

body {
  display: block;
}

.background,
.gate-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 80px;
  background-color: #FAF9F6;
}

.cf-turnstile {
  transform: scale(0.9);
  transform-origin: center;
  height: auto !important;
  width: auto !important;
}

.instructions {
  text-align: center;
  max-width: 500px;
  padding: 1rem;
}

.toto-container {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 0.10rem;
}

.logo-text {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-check {
  font-size: 1.8rem;
  color: red;
  line-height: 1;
}

.content {
  text-align: center;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  margin-top: 1rem;
}

.email-input {
  width: 90%;
  padding: 0.6rem;
  border: 1px solid #818181;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
}

.action-button {
  background-color: transparent;
  color: #0078D4;
  padding: 0.6rem 1.2rem;
  border: 1px solid #0078D4;
  border-radius: 9px;
  cursor: pointer;
  font-size: 1rem;
  width: 50%;
  transition: background-color 0.2s ease;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-button:hover:not(:disabled) {
  background-color: #f0f8ff;
}

.divider {
  height: 0.6px;
  background-color: #444;
  margin: 0.9rem 0 1rem;
}

.footer-container {
  text-align: center;
}

.footer-text {
  font-size: 0.85rem;
  color: #333;
  margin-top: 0.25rem;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
  .footer-text a {
  color: inherit;
  text-decoration: none;
}

.footer-text a:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  html, body,
  .background,
  .gate-container {
    background-color: #121212;
    color: #ffffff;
  }

  .instructions,
  .toto-container {
    color: #ffffff;
  }

  .toto-container {
    background: #1e1e1e;
    box-shadow: 0 1px 20px rgba(255, 255, 255, 0.05);
  }

  .email-input {
    background-color: #2b2b2b;
    border-color: #444;
    color: #ffffff; /* ✅ make input text white in dark mode */
    caret-color: #ffffff; /* optional: makes the cursor white too */
  }

  .footer-text {
    color: #aaaaaa;
  }

  .error {
    color: #ff6b6b;
  }

  .action-button:hover:not(:disabled) {
    background-color: #1a1a1a;
  }
}
</style>
