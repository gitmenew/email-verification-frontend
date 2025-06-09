<!-- CaptchaGate logic here --><template>
  <div class="container">
    <h1>Human Check</h1>
    <p>Please press and hold to continue. Captcha must validate successfully.</p>
    <div class="captcha-box">
      <div id="cf-turnstile" class="turnstile" data-sitekey="1x00000000000000000000AA" data-theme="light"></div>
    </div>
    <button
      class="cta"
      @mousedown="startHold"
      @mouseup="endHold"
      @mouseleave="cancelHold"
    >
      <span v-if="!loading">Press and Hold</span>
      <span v-else>Verifying...</span>
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const loading = ref(false)
const error = ref('')
const holdTimer = ref(null)
const holdDuration = 1500
const router = useRouter()

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
  script.async = true
  document.head.appendChild(script)
})

function startHold() {
  error.value = ''
  loading.value = true
  holdTimer.value = setTimeout(() => {
    const widget = document.querySelector('[name=cf-turnstile-response]')
    const value = widget ? widget.value : ''
    if (!value) {
      error.value = 'Captcha not solved.'
      loading.value = false
      return
    }
    sessionStorage.setItem('captcha_passed', 'true')
    router.push('/verify')
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
.container {
  text-align: center;
  padding: 2rem;
}
.captcha-box {
  margin: 1rem auto;
  max-width: 300px;
}
.cta {
  padding: 0.6rem 1.2rem;
  background: #0051c3;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.cta:hover {
  background: #003b91;
}
.error {
  margin-top: 1rem;
  color: red;
}
</style>
