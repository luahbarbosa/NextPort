const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "auth-service" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Auth Service rodando na porta ${PORT}`)
})