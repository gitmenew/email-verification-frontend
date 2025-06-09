<template>
  <div class="gate-container">
    <header>
      <h1>escalabar.com</h1>
    </header>
    <main>
      <div class="instructions">
        <h2>Verify you are human by completing the action below.</h2>
        <div
          class="cf-turnstile"
          data-sitekey="0x4AAAAAABgei6QZruCN7n08"
          data-callback="onCaptchaSuccess">
        </div>
      </div>
    </main>
    <footer>
      <p>escalabar.com needs to review the security of your connection before proceeding.</p>
    </footer>
  </div>
</template>

<script>
export default {
  emits: ['solved'],
  mounted() {
    window.onCaptchaSuccess = (token) => {
      this.$emit('solved', token)
    }
  }
}
</script>

<style scoped>
.gate-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
header h1 {
  margin-left: 0;
  font-size: 2rem;
  font-weight: bold;
  text-align: left;
}
.instructions {
  margin: 40px 0 0 0;
  text-align: left;
}
.instructions h2 {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
}
footer p {
  margin-top: 2rem;
  color: #444;
  font-size: 1rem;
  text-align: left;
}
</style>
