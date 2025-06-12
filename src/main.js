import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const messages = { en, fr }
const userLang = navigator.language.slice(0, 2)
const i18n = createI18n({
  locale: messages[userLang] ? userLang : 'en',
  fallbackLocale: 'en',
  messages
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')