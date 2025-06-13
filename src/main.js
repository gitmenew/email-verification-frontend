import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import nl from './locales/nl.json'
import pl from './locales/pl.json'
import zh from './locales/zh.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

const messages = { en, fr, de, nl, pl, zh, es, ja }
const userLang = navigator.language.slice(0, 2)
const i18n = createI18n({
  locale: messages[userLang] ? userLang : 'en',
  fallbackLocale: 'en',
  messages
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
