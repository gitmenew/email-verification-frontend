const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

// Step 1: Define path to dist
const DIST_DIR = path.join(__dirname, 'dist')

// Step 2: Serve static files from dist/
app.use(express.static(DIST_DIR))

// Step 3: Fallback route for Vue SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Frontend served on http://localhost:${PORT}`)
})