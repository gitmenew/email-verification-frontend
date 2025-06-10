<template>
  <div class="gate-container">
    <header>
      <h1>escalabar.com</h1>
    </header>
    <main>
      <div class="instructions">
        <h2>Verify you are human by completing the action below.</h2>
        <div class="cf-turnstile"
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
